import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { corsHeadersFor, json, preflight } from "../_shared/cors.ts";
import { requireUser } from "../_shared/auth.ts";
import { isValidPriceId } from "../_shared/plans.ts";

serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const user = auth.user;

  try {
    if (!user.email) {
      return json({ error: "user_email_missing" }, req, { status: 400 });
    }

    const { priceId } = await req.json();
    if (!isValidPriceId(priceId)) {
      return json({ error: "invalid_price_id" }, req, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;

      // Guard: prevent duplicate subscriptions if user already has an active one
      const existingSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      if (existingSubs.data.length > 0) {
        return json(
          {
            error: "Você já possui uma assinatura ativa. Use 'Gerenciar assinatura' para fazer alterações.",
            already_subscribed: true,
          },
          req,
          { status: 409 },
        );
      }
    }

    const origin = req.headers.get("origin") || "https://templosagrado.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/pricing?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    return json({ url: session.url }, req, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return json({ error: msg }, req, { status: 500 });
  }
});
