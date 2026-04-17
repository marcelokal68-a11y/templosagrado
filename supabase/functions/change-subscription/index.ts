import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHANGE-SUBSCRIPTION] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } =
      await supabaseClient.auth.getUser(token);
    if (userErr) throw new Error(`Auth error: ${userErr.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    log("user authenticated", { email: user.email });

    const { newPriceId } = await req.json();
    if (!newPriceId) throw new Error("newPriceId is required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find customer
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });
    if (customers.data.length === 0) {
      throw new Error("Nenhum cliente Stripe encontrado. Assine primeiro.");
    }
    const customerId = customers.data[0].id;

    // Find active subscription
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    if (subs.data.length === 0) {
      throw new Error("Nenhuma assinatura ativa para alterar.");
    }
    const subscription = subs.data[0];
    const currentItem = subscription.items.data[0];
    const currentPriceId = currentItem.price.id;
    const currentAmount = currentItem.price.unit_amount ?? 0;

    if (currentPriceId === newPriceId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Você já está nesse plano.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Fetch new price to compare
    const newPrice = await stripe.prices.retrieve(newPriceId);
    const newAmount = newPrice.unit_amount ?? 0;
    const isUpgrade = newAmount > currentAmount;
    log("change type", { isUpgrade, currentAmount, newAmount });

    if (isUpgrade) {
      // Immediate switch + prorate + invoice now
      const updated = await stripe.subscriptions.update(subscription.id, {
        items: [
          {
            id: currentItem.id,
            price: newPriceId,
          },
        ],
        proration_behavior: "always_invoice",
        payment_behavior: "error_if_incomplete",
      });
      log("upgrade applied", { subId: updated.id });

      return new Response(
        JSON.stringify({
          success: true,
          type: "upgrade",
          effective_date: new Date().toISOString(),
          message:
            "Upgrade aplicado. A diferença proporcional foi cobrada no seu cartão.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    } else {
      // Downgrade: schedule for end of current period, no refund
      const periodEnd = subscription.current_period_end;

      // Use Subscription Schedule to switch at period end
      const schedule = await stripe.subscriptionSchedules.create({
        from_subscription: subscription.id,
      });
      log("schedule created", { scheduleId: schedule.id });

      // Build new phases: keep current until period end, then switch to new price
      const currentPhase = schedule.phases[0];
      await stripe.subscriptionSchedules.update(schedule.id, {
        end_behavior: "release",
        phases: [
          {
            items: [
              {
                price: currentPriceId,
                quantity: 1,
              },
            ],
            start_date: currentPhase.start_date,
            end_date: periodEnd,
            proration_behavior: "none",
          },
          {
            items: [
              {
                price: newPriceId,
                quantity: 1,
              },
            ],
            proration_behavior: "none",
          },
        ],
      });
      log("schedule updated for downgrade");

      return new Response(
        JSON.stringify({
          success: true,
          type: "downgrade",
          effective_date: new Date(periodEnd * 1000).toISOString(),
          message: `Seu plano atual continua ativo até ${new Date(
            periodEnd * 1000,
          ).toLocaleDateString("pt-BR")}. Após essa data, o novo plano entra em vigor.`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
