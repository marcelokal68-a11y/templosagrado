import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAILS = ["marcelokal68@gmail.com"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw new Error("Not authenticated");

    const { action, ...body } = await req.json();

    // Auto-seed admin on login
    if (action === "check-role") {
      // Auto-assign admin role for known admin emails
      if (ADMIN_EMAILS.includes(user.email!)) {
        await supabase.from("user_roles").upsert(
          { user_id: user.id, role: "admin" },
          { onConflict: "user_id,role" }
        );
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const isAdmin = roles?.some((r: any) => r.role === "admin") ?? false;
      return new Response(JSON.stringify({ isAdmin }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Admin-only actions below ---
    const { data: adminCheck } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();
    if (!adminCheck) throw new Error("Forbidden");

    if (action === "create-invite") {
      const { label, questions_limit, max_uses, expires_at } = body;
      const { data, error: insertErr } = await supabase
        .from("invite_links")
        .insert({
          label: label || null,
          questions_limit: questions_limit ?? 999,
          max_uses: max_uses || null,
          created_by: user.id,
          expires_at: expires_at || null,
        })
        .select()
        .single();
      if (insertErr) throw insertErr;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list-invites") {
      const { data } = await supabase
        .from("invite_links")
        .select("*")
        .order("created_at", { ascending: false });
      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "toggle-invite") {
      const { id, is_active } = body;
      await supabase.from("invite_links").update({ is_active }).eq("id", id);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "promote-admin") {
      const { target_email } = body;
      const { data: targetUser } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("display_name", target_email)
        .single();
      // Try finding by auth email
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const target = authUsers?.users?.find((u: any) => u.email === target_email);
      if (!target) throw new Error("User not found");
      await supabase.from("user_roles").upsert(
        { user_id: target.id, role: "admin" },
        { onConflict: "user_id,role" }
      );
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unknown action");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
