import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { corsHeadersFor } from "../_shared/cors.ts";

const log = (s: string, d?: any) => console.log(`[TRIAL-REMINDERS] ${s}${d ? ' ' + JSON.stringify(d) : ''}`);

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  // TS-002f: agora restrito a chamadas de cron/admin. Sem esse gate, qualquer um
  // disparava emails em massa para todos os trials ativos.
  const expectedSecret = Deno.env.get('CRON_SECRET');
  const gotSecret = req.headers.get('x-cron-secret');
  if (!expectedSecret) {
    return new Response(JSON.stringify({ error: 'cron_secret_not_configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (gotSecret !== expectedSecret) {
    // Permitir fallback: admin autenticado também pode disparar manualmente.
    const { requireAdmin } = await import('../_shared/auth.ts');
    const adminAuth = await requireAdmin(req);
    if ('error' in adminAuth) return adminAuth.error;
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not set');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Buscar todos os perfis em trial (não assinantes, com trial_ends_at definido)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, display_name, trial_ends_at, is_subscriber')
      .eq('is_subscriber', false)
      .not('trial_ends_at', 'is', null);

    if (error) throw error;

    log('Profiles to evaluate', { count: profiles?.length || 0 });

    const now = new Date();
    const APP_URL = 'https://templosagrado.lovable.app';
    const results: any[] = [];

    for (const p of profiles || []) {
      const trialEnd = new Date(p.trial_ends_at);
      const msLeft = trialEnd.getTime() - now.getTime();
      const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));

      // Categoria: 2 dias restantes (entre 36h e 60h) OU expirado nas últimas 24h
      let template: 'warning' | 'expired' | null = null;
      if (hoursLeft <= 60 && hoursLeft >= 36) template = 'warning'; // ~2 dias
      else if (hoursLeft <= 0 && hoursLeft >= -24) template = 'expired'; // expirou hoje

      if (!template) continue;

      // Pegar email do usuário
      const { data: userData } = await supabase.auth.admin.getUserById(p.user_id);
      const email = userData?.user?.email;
      if (!email) continue;

      const name = p.display_name || 'Caminhante';
      const subject = template === 'warning'
        ? '⏳ Seu trial no Templo Sagrado termina em 2 dias'
        : '🕉️ Seu trial terminou — continue sua jornada';

      const headline = template === 'warning'
        ? `Olá, ${name}. Seu trial termina em ${daysLeft <= 0 ? '1 dia' : `${daysLeft} dias`}.`
        : `Olá, ${name}. Seu trial gratuito chegou ao fim.`;

      const message = template === 'warning'
        ? 'Para continuar conversando com seu Mentor Espiritual, gerando orações e acessando todas as tradições, escolha um plano agora — você não perde nada do seu progresso.'
        : 'Para retomar suas conversas, gerar orações e continuar sua prática espiritual, basta escolher um plano. Sua história e memórias permanecem salvas.';

      const html = `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
  <div style="text-align: center; margin-bottom: 30px;">
    <span style="font-size: 48px;">🕉️</span>
    <h1 style="font-size: 24px; margin: 10px 0 5px;">Templo Sagrado</h1>
  </div>
  <h2 style="font-size: 20px; color: #1a1a1a;">${headline}</h2>
  <p style="font-size: 16px; line-height: 1.6; color: #444;">${message}</p>
  <div style="text-align: center; margin: 35px 0;">
    <a href="${APP_URL}/pricing" style="background: #c4956a; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Ver planos e assinar</a>
  </div>
  <p style="font-size: 13px; color: #888; text-align: center; margin-top: 40px;">Que a paz esteja com você.<br/>— Equipe Templo Sagrado</p>
</div>`;

      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Templo Sagrado <onboarding@resend.dev>',
          to: [email],
          subject,
          html,
        }),
      });
      const respBody = await resp.json().catch(() => ({}));
      results.push({ email, template, status: resp.status, id: respBody?.id });
      log('Sent', { email, template, status: resp.status });
    }

    return new Response(JSON.stringify({ ok: true, sent: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e: any) {
    log('ERROR', { message: e?.message });
    return new Response(JSON.stringify({ error: e?.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
