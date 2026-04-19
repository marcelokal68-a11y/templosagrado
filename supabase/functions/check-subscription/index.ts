import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// TOP plan product IDs get unlimited questions
const TOP_PRODUCT_IDS = ["prod_U1h1ABi9FUgLYT", "prod_U1h1lIOr9aKvmO"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("No authorization header");

    // TS-003 fix: verify JWT signature via auth.getUser (not unsafe atob of payload).
    // Previous code decoded sub without verification — anyone could forge a JWT
    // and impersonate any user to read/write their profile.
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) throw new Error("User not authenticated");
    if (!user.email) throw new Error("User email not found");

    // Load existing profile to preserve trial / admin status
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("trial_ends_at, is_pro, questions_limit")
      .eq("user_id", user.id)
      .maybeSingle();

    const trialActive = profile?.trial_ends_at
      ? new Date(profile.trial_ends_at).getTime() > Date.now()
      : false;
    const isFreeAccess = !!profile?.is_pro; // 100-year whitelist users

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let hasActive = false;
    let productId: string | null = null;
    let subscriptionEnd: string | null = null;
    let subId: string | null = null;
    let cancelAtPeriodEnd = false;

    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      hasActive = subscriptions.data.length > 0;
      if (hasActive) {
        const sub = subscriptions.data[0];
        subId = sub.id;
        const periodEnd = (sub as any).current_period_end
          ?? sub.items?.data?.[0]?.current_period_end;
        subscriptionEnd = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
        productId = sub.items.data[0].price.product as string;
        cancelAtPeriodEnd = !!sub.cancel_at_period_end;
      }
    }

    // Decide what to write back to profile
    if (hasActive) {
      const isTop = TOP_PRODUCT_IDS.includes(productId || "");
      const questionsLimit = isTop ? 999999 : 60;
      await supabaseClient
        .from("profiles")
        .update({
          is_subscriber: true,
          subscription_id: subId,
          questions_limit: questionsLimit,
        })
        .eq("user_id", user.id);
    } else if (!isFreeAccess && !trialActive) {
      // Only downgrade to free tier when there's no active sub, no whitelist, and no trial
      await supabaseClient
        .from("profiles")
        .update({
          is_subscriber: false,
          subscription_id: null,
          questions_limit: 20,
        })
        .eq("user_id", user.id);
    }
    // If trial is still active or user is whitelisted, do NOT touch their limits.

    return new Response(JSON.stringify({
      subscribed: hasActive,
      product_id: productId,
      subscription_end: subscriptionEnd,
      cancel_at_period_end: cancelAtPeriodEnd,
      trial_active: trialActive,
      trial_ends_at: profile?.trial_ends_at ?? null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
