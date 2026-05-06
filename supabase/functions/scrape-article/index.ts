// Admin-only endpoint to scrape an article URL via Firecrawl v2.
// Returns clean markdown + extracted metadata so the admin can preview
// and ingest it as a knowledge source.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeadersFor } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "FIRECRAWL_API_KEY ausente. Conecte o Firecrawl em Conectores.",
          code: "no_firecrawl",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Admin gate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userResp } = await userClient.auth.getUser();
    const user = userResp?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sb = createClient(supabaseUrl, serviceKey);
    const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", user.id);
    const isAdmin = roles?.some((r: { role: string }) => r.role === "admin") ?? false;
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const url = String(body?.url || "").trim();
    if (!/^https?:\/\/.+/i.test(url)) {
      return new Response(JSON.stringify({ error: "URL inválida (use http/https)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fcResp = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });

    if (fcResp.status === 401) {
      return new Response(JSON.stringify({
        error: "Firecrawl rejeitou a credencial. Reconecte o Firecrawl em Conectores.",
        code: "firecrawl_unauthorized",
      }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (fcResp.status === 402) {
      return new Response(JSON.stringify({
        error: "Sem créditos no Firecrawl. Conecte com a conta dona ou faça upgrade do plano (cupom LOVABLE50 = 50% off por 3 meses).",
        code: "firecrawl_no_credits",
      }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const json = await fcResp.json().catch(() => null);
    if (!fcResp.ok || !json) {
      const msg = (json && (json.error || json.message)) || `Firecrawl erro ${fcResp.status}`;
      return new Response(JSON.stringify({ error: String(msg).slice(0, 300) }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Firecrawl v2 returns either { data: {...} } or fields at top-level depending on shape.
    const data = json.data ?? json;
    const markdown = data.markdown || "";
    const meta = data.metadata || {};
    const title = meta.title || meta.ogTitle || "";
    const sourceURL = meta.sourceURL || meta.url || url;
    const language = meta.language || null;
    const author = meta.author || meta.ogSiteName || null;

    if (!markdown || markdown.trim().length < 100) {
      return new Response(JSON.stringify({
        error: "Conteúdo extraído muito curto (provavelmente página com paywall ou bloqueio).",
      }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
      title: String(title).slice(0, 300),
      author: author ? String(author).slice(0, 200) : null,
      markdown,
      sourceURL,
      language,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("scrape-article error:", e);
    return new Response(JSON.stringify({
      error: e instanceof Error ? e.message : "unknown error",
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
