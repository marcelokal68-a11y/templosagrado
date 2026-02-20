import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { to, prayer, intention, tradition } = await req.json();

    if (!to || !prayer) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, prayer' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emails = Array.isArray(to) ? to : to.split(',').map((e: string) => e.trim()).filter(Boolean);
    if (emails.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid email addresses' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const htmlBody = `
      <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <span style="font-size: 48px;">🕉️</span>
          <h1 style="font-size: 24px; color: #1a1a1a; margin: 10px 0 5px;">Templo Sagrado</h1>
          <p style="color: #666; font-size: 14px; margin: 0;">Uma oração especial foi gerada para você</p>
        </div>
        
        ${intention ? `
        <div style="background: #f8f5f0; border-left: 4px solid #c4956a; padding: 15px 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #555; font-size: 13px; font-weight: 600;">Intenção:</p>
          <p style="margin: 5px 0 0; color: #333; font-size: 14px;">${intention}</p>
        </div>
        ` : ''}

        ${tradition ? `
        <p style="text-align: center; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
          Tradição: ${tradition}
        </p>
        ` : ''}

        <div style="background: linear-gradient(135deg, #faf8f5, #f5f0ea); border: 1px solid #e8ddd0; border-radius: 12px; padding: 30px; margin-bottom: 25px;">
          <p style="white-space: pre-wrap; line-height: 1.8; color: #2a2a2a; font-size: 15px; font-style: italic; margin: 0;">
            ${prayer.replace(/\n/g, '<br>')}
          </p>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Enviado com ❤️ via <a href="https://templosagrado.lovable.app" style="color: #c4956a; text-decoration: none;">Templo Sagrado</a>
          </p>
        </div>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Templo Sagrado <onboarding@resend.dev>',
        to: emails,
        subject: '🙏 Uma oração especial para você — Templo Sagrado',
        html: htmlBody,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', response.status, JSON.stringify(data));
      return new Response(JSON.stringify({ error: data.message || 'Failed to send email' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-prayer-email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
