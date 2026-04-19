import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COUPON_CODE = "qKP2c4dl"; // 30% OFF por 3 meses

async function sendWinbackEmail(to: string, name: string | null, periodEndIso: string | null) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.warn("[cancel-subscription] RESEND_API_KEY not set, skipping email");
    return;
  }

  const greeting = name ? `Olá, ${name}` : "Olá";
  const endDate = periodEndIso
    ? new Date(periodEndIso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <body style="margin:0;padding:0;background-color:#ffffff;font-family:Georgia,serif;color:#0D0D0D;">
        <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
          <h1 style="font-size:24px;font-weight:600;margin:0 0 16px;color:#0D0D0D;">
            ${greeting}, obrigado por caminhar conosco 🙏
          </h1>
          <p style="font-size:16px;line-height:1.6;color:#3a3a3a;margin:0 0 16px;">
            Recebemos o cancelamento da sua assinatura do <strong>Templo Sagrado</strong>.
            Foi uma honra estar ao seu lado nesta jornada espiritual.
          </p>
          ${endDate ? `<p style="font-size:15px;line-height:1.6;color:#3a3a3a;margin:0 0 16px;">
            Você continuará com acesso completo até <strong>${endDate}</strong>.
          </p>` : ""}
          <p style="font-size:16px;line-height:1.6;color:#3a3a3a;margin:24px 0 16px;">
            Se um dia desejar voltar, guardamos um presente especial:
          </p>
          <div style="background:#FAF7F0;border:1px solid #D4AF37;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
            <div style="font-size:14px;color:#8b6f00;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">
              Cupom de retorno
            </div>
            <div style="font-size:32px;font-weight:700;color:#0D0D0D;letter-spacing:2px;margin:8px 0;">
              VOLTAR30
            </div>
            <div style="font-size:14px;color:#3a3a3a;">
              30% de desconto por 3 meses
            </div>
          </div>
          <div style="text-align:center;margin:32px 0;">
            <a href="https://templosagrado.lovable.app/pricing"
               style="display:inline-block;background:#0D0D0D;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
              Voltar ao Templo
            </a>
          </div>
          <p style="font-size:14px;line-height:1.6;color:#888;margin:32px 0 0;text-align:center;">
            Que a paz esteja com você, sempre.<br/>
            <em>Equipe Templo Sagrado</em>
          </p>
        </div>
      </body>
    </html>
  `;

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "Templo Sagrado <onboarding@resend.dev>",
        to: [to],
        subject: "Sentiremos sua falta 🙏 — um presente para quando quiser voltar",
        html,
      }),
    });
    const result = await resp.json();
    console.log("[cancel-subscription] Resend response:", resp.status, result);
  } catch (err) {
    console.error("[cancel-subscription] Failed to send winback email:", err);
  }
}

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

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(userError.message);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) throw new Error("No Stripe customer found");

    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: "active",
      limit: 1,
    });
    if (subscriptions.data.length === 0) throw new Error("No active subscription");

    const sub = subscriptions.data[0];
    const updated = await stripe.subscriptions.update(sub.id, {
      cancel_at_period_end: true,
    });

    const periodEnd = (updated as any).current_period_end
      ?? updated.items?.data?.[0]?.current_period_end;
    const periodEndIso = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;

    // Buscar nome do usuário para personalizar email
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();

    // TS-112: fire-and-forget. Antes era await — Resend lento segurava a UI.
    sendWinbackEmail(user.email, profile?.display_name ?? null, periodEndIso)
      .catch((err) => console.error("[cancel-subscription] winback email failed:", err));

    return new Response(JSON.stringify({
      success: true,
      cancel_at: periodEndIso,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
