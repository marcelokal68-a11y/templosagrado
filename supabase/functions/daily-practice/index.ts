import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { religion, date, language, gender } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const langMap: Record<string, string> = {
      'pt-BR': 'português brasileiro',
      'en': 'English',
      'es': 'español',
    };
    const langName = langMap[language] || 'português brasileiro';

    const religionPrompts: Record<string, string> = {
      jewish: `Judaísmo. Retorne a Parashá da semana com nome hebraico, referência bíblica (Torá) e interpretação. ${gender === 'female' ? 'Considere perspectiva feminina.' : ''}`,
      catholic: 'Catolicismo. Retorne o Evangelho do dia com referência bíblica e interpretação.',
      protestant: 'Protestantismo. Retorne a leitura bíblica do dia com referência e reflexão devocional.',
      christian: 'Cristianismo. Retorne uma passagem bíblica do dia com referência e interpretação.',
      islam: 'Islã. Retorne uma Sura recomendada do Alcorão para o dia com referência e interpretação.',
      buddhist: 'Budismo. Retorne um ensinamento do Dharma do dia com fonte e interpretação.',
      hindu: 'Hinduísmo. Retorne um verso do Bhagavad Gita ou dos Vedas com referência e interpretação.',
      spiritist: 'Espiritismo. Retorne uma passagem do Evangelho Segundo o Espiritismo de Kardec com referência e interpretação.',
      umbanda: 'Umbanda. Retorne um ensinamento espiritual do dia com reflexão sobre os guias e orixás.',
      candomble: 'Candomblé. Retorne um ensinamento sobre os Orixás do dia com tradição oral e interpretação.',
      mormon: 'Igreja de Jesus Cristo dos Santos dos Últimos Dias. Retorne uma passagem do Livro de Mórmon com referência e interpretação.',
      agnostic: 'Filosofia universal. Retorne uma reflexão filosófica ou de sabedoria universal do dia com autor/fonte e interpretação.',
    };

    const religionPrompt = religionPrompts[religion] || 'Retorne uma reflexão espiritual universal do dia.';

    const instructions: Record<string, { respond: string; format: string }> = {
      'en': {
        respond: `You are a religious and spiritual expert. Respond ONLY in English.
Return the correct sacred content for the date ${date}.
Religion: ${religionPrompt}
IMPORTANT: All content must be positive, focused on love, compassion, study and service. Never encourage violence or discrimination.
Respond ONLY with valid JSON (no markdown), in the format:
{"title": "content title", "reference": "sacred source reference", "explanation": "explanation in 3-5 lines", "reflection": "practical reflection in 2-3 lines"}`,
        format: `Sacred content for ${date}, religion: ${religion}`
      },
      'es': {
        respond: `Eres un experto religioso y espiritual. Responde SOLO en español.
Devuelve el contenido sagrado correcto para la fecha ${date}.
Religión: ${religionPrompt}
IMPORTANTE: Todo contenido debe ser positivo, enfocado en amor, compasión, estudio y servicio al prójimo. Nunca incentives violencia o discriminación.
Responde SOLO con JSON válido (sin markdown), en el formato:
{"title": "título del contenido", "reference": "referencia de la fuente sagrada", "explanation": "explicación en 3-5 líneas", "reflection": "reflexión práctica en 2-3 líneas"}`,
        format: `Contenido sagrado para ${date}, religión: ${religion}`
      },
      'pt-BR': {
        respond: `Você é um especialista religioso e espiritual. Responda APENAS em português brasileiro.
Retorne o conteúdo sagrado correto para a data ${date}.
Religião: ${religionPrompt}
IMPORTANTE: Todo conteúdo deve ser positivo, focado em amor, compaixão, estudo e serviço ao próximo. Nunca incentive violência ou discriminação.
Responda APENAS com JSON válido (sem markdown), no formato:
{"title": "título do conteúdo", "reference": "referência da fonte sagrada", "explanation": "explicação em 3-5 linhas", "reflection": "reflexão prática em 2-3 linhas"}`,
        format: `Conteúdo sagrado para ${date}, religião: ${religion}`
      },
    };

    const lang = instructions[language] || instructions['pt-BR'];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: lang.respond },
          { role: "user", content: lang.format },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response, handling possible markdown wrapping
    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = { title: "Conteúdo do dia", reference: "", explanation: content.slice(0, 500), reflection: "" };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-practice error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
