import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { corsHeadersFor } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
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

    // Check if already redeemed by this user (idempotency for the user, not a race gate).
    const { data: existing } = await supabase
      .from("invite_redemptions")
      .select("id")
      .eq("user_id", user.id)
      .single();
    // Note: original code filtered by invite_id too, but since invite_id is
    // only known after lookup, we check after reading it below.

    // TS-206: atomic redeem. Previously `times_used` was read and re-written
    // without a lock → two concurrent users could both slip past max_uses.
    const { data: redeemRes, error: redeemErr } = await supabase.rpc(
      'try_redeem_invite_link',
      { _code: code },
    );
    if (redeemErr) throw redeemErr;
    const redeemRow = Array.isArray(redeemRes) ? redeemRes[0] : redeemRes;
    if (!redeemRow || !redeemRow.ok) {
      const reason = redeemRow?.reason || 'invalid';
      const msg = reason === 'expired' ? 'This invite has expired'
        : reason === 'maxed' ? 'This invite has reached its usage limit'
        : reason === 'inactive' ? 'This invite is inactive'
        : 'Invalid or expired invite code';
      throw new Error(msg);
    }
    const inviteId: string = redeemRow.invite_id;
    const questionsLimit: number = redeemRow.questions_limit;

    // Per-invite idempotency: prevent the same user double-redeeming the same invite.
    // We do it post-consume; on duplicate, we rollback the increment.
    const { data: existingForInvite } = await supabase
      .from("invite_redemptions")
      .select("id")
      .eq("invite_id", inviteId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (existingForInvite) {
      // Rollback the times_used increment we just did.
      await supabase.rpc('decrement_invite_usage', { _invite_id: inviteId })
        .then(() => {}, () => {});
      throw new Error("You have already used this invite");
    }

    // Calculate trial end (7 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    // Redeem: activate 7-day premium trial
    await supabase
      .from("profiles")
      .update({
        questions_limit: questionsLimit,
        is_subscriber: true,
        trial_ends_at: trialEndsAt.toISOString(),
      })
      .eq("user_id", user.id);

    // Record redemption
    await supabase.from("invite_redemptions").insert({
      invite_id: inviteId,
      user_id: user.id,
    });

    return new Response(JSON.stringify({
      success: true,
      questions_limit: questionsLimit,
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
