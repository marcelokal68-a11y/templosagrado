import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAILS = [
  "marcelokal68@gmail.com",
  "kalichsztein.marcelo@gmail.com",
  "gustavonobre5387@gmail.com",
];

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
    if (!authHeader?.startsWith("Bearer ")) throw new Error("No auth header");
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claims?.claims?.sub) throw new Error("Not authenticated");
    const user = { id: claims.claims.sub as string, email: claims.claims.email as string };

    const { action, ...body } = await req.json();

    // Auto-seed admin on login
    if (action === "check-role") {
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

    if (action === "list-users") {
      const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const authUsers = authData?.users ?? [];

      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");

      const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
      const roleMap = new Map<string, string[]>();
      for (const r of roles ?? []) {
        const existing = roleMap.get(r.user_id) ?? [];
        existing.push(r.role);
        roleMap.set(r.user_id, existing);
      }

      const now = Date.now();
      const users = authUsers.map((u: any) => {
        const profile: any = profileMap.get(u.id);
        const userRoles = roleMap.get(u.id) ?? [];
        const lastSignIn = u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : 0;
        const isOnline = lastSignIn > 0 && (now - lastSignIn) < 5 * 60 * 1000;

        let trialDaysLeft = 0;
        if (profile?.trial_ends_at) {
          const ms = new Date(profile.trial_ends_at).getTime() - now;
          if (ms > 0) trialDaysLeft = Math.ceil(ms / (1000 * 60 * 60 * 24));
        }

        return {
          id: u.id,
          email: u.email ?? "",
          display_name: profile?.display_name ?? u.email ?? "",
          is_subscriber: profile?.is_subscriber ?? false,
          is_pro: profile?.is_pro ?? false,
          is_admin: userRoles.includes("admin"),
          is_online: isOnline,
          trial_days_left: trialDaysLeft,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
        };
      });

      return new Response(JSON.stringify(users), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get-stats") {
      const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const authUsers = authData?.users ?? [];
      const { data: profiles } = await supabase.from("profiles").select("is_subscriber, trial_ends_at");

      const now = Date.now();
      const totalUsers = authUsers.length;
      const onlineUsers = authUsers.filter((u: any) => {
        const t = u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : 0;
        return t > 0 && (now - t) < 5 * 60 * 1000;
      }).length;
      const subscribers = (profiles ?? []).filter((p: any) => p.is_subscriber).length;
      const trialing = (profiles ?? []).filter((p: any) => {
        if (!p.trial_ends_at) return false;
        return new Date(p.trial_ends_at).getTime() > now && !p.is_subscriber;
      }).length;

      return new Response(JSON.stringify({ totalUsers, onlineUsers, subscribers, trialing }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // --- Free Access management ---
    if (action === "list-free-access") {
      const { data } = await supabase
        .from("free_access_emails")
        .select("*")
        .order("created_at", { ascending: false });
      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "add-free-access") {
      const { email, note } = body;
      if (!email || typeof email !== "string") throw new Error("Email required");
      const cleanEmail = email.trim().toLowerCase();
      const { error: insErr } = await supabase
        .from("free_access_emails")
        .upsert({ email: cleanEmail, note: note || null }, { onConflict: "email" });
      if (insErr) throw insErr;
      // Also update existing profile if present
      await supabase.rpc("sync_free_access_profiles");
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "remove-free-access") {
      const { email } = body;
      if (!email) throw new Error("Email required");
      await supabase.from("free_access_emails").delete().eq("email", email.trim().toLowerCase());
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unknown action");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isAuthError = msg === "No auth header" || msg === "Not authenticated" || msg === "Forbidden";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: isAuthError ? 401 : 500,
    });
  }
});
