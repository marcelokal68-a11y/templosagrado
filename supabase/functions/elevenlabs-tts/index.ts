import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeadersFor } from "../_shared/cors.ts";

const MONTHLY_TTS_CAP = 300;

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, speed } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== Cap mensal: 300 narrações/mês =====
    // TS-002d: auth agora é OBRIGATÓRIA (antes era opcional — anon podia
    // drenar ElevenLabs sem limite). Admins e users com acesso vitalício
    // (free_access_emails) continuam isentos do cap.
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const { requireUser } = await import("../_shared/auth.ts");
    const auth = await requireUser(req);
    if ("error" in auth) return auth.error;
    const userId: string = auth.user.id;

    if (userId) {
      const admin = createClient(supabaseUrl, serviceKey);

      // Verifica isenção: admin role ou e-mail com acesso vitalício
      const [{ data: roleRow }, { data: userInfo }] = await Promise.all([
        admin.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle(),
        admin.auth.admin.getUserById(userId),
      ]);

      let isExempt = !!roleRow;
      if (!isExempt && userInfo?.user?.email) {
        const { data: freeEmail } = await admin
          .from('free_access_emails')
          .select('email')
          .ilike('email', userInfo.user.email)
          .maybeSingle();
        isExempt = !!freeEmail;
      }

      if (!isExempt) {
        const monthKey = currentMonthKey();
        const { data: usageRow } = await admin
          .from('tts_usage')
          .select('count')
          .eq('user_id', userId)
          .eq('month_key', monthKey)
          .maybeSingle();

        const used = usageRow?.count ?? 0;
        if (used >= MONTHLY_TTS_CAP) {
          return new Response(
            JSON.stringify({
              error: 'tts_monthly_cap_reached',
              message: `Você atingiu o limite mensal de ${MONTHLY_TTS_CAP} narrações de áudio. O contador reinicia no próximo mês.`,
              cap: MONTHLY_TTS_CAP,
              used,
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Incrementa contador (upsert)
        if (usageRow) {
          await admin
            .from('tts_usage')
            .update({ count: used + 1 })
            .eq('user_id', userId)
            .eq('month_key', monthKey);
        } else {
          await admin
            .from('tts_usage')
            .insert({ user_id: userId, month_key: monthKey, count: 1 });
        }
      }
    }
    // ===== Fim do soft cap =====

    const voiceId = 'HOfBIVLhom4mc9WvXfyH';

    // Use streaming endpoint + flash model for ~75% lower latency
    // Lower bitrate (64kbps) cuts payload ~50% with no audible loss for speech
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=mp3_44100_64`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.slice(0, 5000),
          model_id: 'eleven_flash_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            speed: Math.min(1.2, Math.max(0.7, speed || 1.15)),
          },
        }),
      }
    );

    if (!response.ok || !response.body) {
      const errorText = await response.text().catch(() => '');
      console.error(`ElevenLabs API error [${response.status}]:`, errorText);
      return new Response(JSON.stringify({ error: 'TTS generation failed' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Stream audio bytes directly to client (no arrayBuffer buffering)
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error in elevenlabs-tts:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
