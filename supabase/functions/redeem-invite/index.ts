import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw new Error("Not authenticated");

    const { code } = await req.json();
    if (!code) throw new Error("Invite code is required");

    // Find the invite
    const { data: invite, error: invErr } = await supabase
      .from("invite_links")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .single();
    if (invErr || !invite) throw new Error("Invalid or expired invite code");

    // Check expiration
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      throw new Error("This invite has expired");
    }

    // Check max uses
    if (invite.max_uses && invite.times_used >= invite.max_uses) {
      throw new Error("This invite has reached its usage limit");
    }

    // Check if already redeemed
    const { data: existing } = await supabase
      .from("invite_redemptions")
      .select("id")
      .eq("invite_id", invite.id)
      .eq("user_id", user.id)
      .single();
    if (existing) throw new Error("You have already used this invite");

    // Calculate trial end (7 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    // Redeem: activate 7-day premium trial
    await supabase
      .from("profiles")
      .update({
        questions_limit: invite.questions_limit,
        is_subscriber: true,
        trial_ends_at: trialEndsAt.toISOString(),
      })
      .eq("user_id", user.id);

    // Record redemption
    await supabase.from("invite_redemptions").insert({
      invite_id: invite.id,
      user_id: user.id,
    });

    // Increment usage count
    await supabase
      .from("invite_links")
      .update({ times_used: invite.times_used + 1 })
      .eq("id", invite.id);

    return new Response(JSON.stringify({
      success: true,
      questions_limit: invite.questions_limit,
      trial_ends_at: trialEndsAt.toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
