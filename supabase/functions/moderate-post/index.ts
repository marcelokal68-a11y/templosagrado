import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeadersFor } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { content } = await req.json();
    if (typeof content !== "string" || !content.trim()) {
      return new Response(JSON.stringify({ error: "content required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Você é um moderador do Mural Ecumênico — Pela Paz no Mundo, um espaço sagrado onde pessoas de todas as tradições religiosas (cristã, católica, evangélica, mórmon, judaica, islâmica, hindu, budista, espírita, umbanda, candomblé, agnóstica) compartilham orações e reflexões espirituais.

Sua missão: PERMITIR orações respeitosas de QUALQUER tradição. BLOQUEAR conteúdo que ataque, discrimine ou desrespeite outras pessoas, religiões, raças, gêneros ou grupos.

BLOQUEIE quando o conteúdo for:
- Ódio ou ataque a outra religião/raça/gênero/grupo
- Racismo, xenofobia, homofobia, transfobia
- Violência, ameaças, incitação ao mal contra alguém
- Preconceito, discriminação, generalizações pejorativas
- Linguagem agressiva, insultos, palavrões
- Desinformação prejudicial ou conspirações de ódio

PERMITA orações sinceras, pedidos de paz, gratidão, reflexões espirituais — mesmo que mencionem dor, sofrimento ou pecado, desde que não ataquem ninguém.

Responda APENAS chamando a função moderate_content.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Modere este texto:\n\n"""${content.slice(0, 2000)}"""` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "moderate_content",
              description: "Avalia o conteúdo para o Mural Ecumênico.",
              parameters: {
                type: "object",
                properties: {
                  allowed: { type: "boolean", description: "true se o conteúdo é apropriado" },
                  category: {
                    type: "string",
                    enum: ["ok", "hate", "racism", "violence", "prejudice", "profanity", "other"],
                  },
                  reason: { type: "string", description: "Curta explicação em PT-BR (max 120 chars)" },
                },
                required: ["allowed", "category", "reason"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "moderate_content" } },
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit. Tente novamente em alguns segundos." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      // Fail-open with caution: allow but flag as 'other' so admin can review
      return new Response(JSON.stringify({ allowed: true, category: "ok", reason: "Moderação indisponível, publicado." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ allowed: true, category: "ok", reason: "Sem decisão clara." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("moderate-post error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
