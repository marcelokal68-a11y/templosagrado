import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TOPIC_NAMES: Record<string, Record<string, string>> = {
  'pt-BR': {
    christian: 'Cristianismo', catholic: 'Catolicismo', protestant: 'Protestantismo',
    mormon: 'Mormonismo', jewish: 'Judaísmo', islam: 'Islã', hindu: 'Hinduísmo',
    buddhist: 'Budismo', spiritist: 'Espiritismo', umbanda: 'Umbanda',
    candomble: 'Candomblé', agnostic: 'Agnosticismo',
    stoicism: 'Estoicismo', logosophy: 'Logosofia', humanism: 'Humanismo',
    epicureanism: 'Epicurismo', transhumanism: 'Transumanismo', pantheism: 'Panteísmo',
    existentialism: 'Existencialismo', objectivism: 'Objetivismo',
    transcendentalism: 'Transcendentalismo', altruism: 'Altruísmo',
    rationalism: 'Racionalismo', optimistic_nihilism: 'Niilismo Otimista',
    absurdism: 'Absurdismo', utilitarianism: 'Utilitarismo', pragmatism: 'Pragmatismo',
    shamanism: 'Xamanismo', taoism: 'Taoísmo', anthroposophy: 'Antroposofia',
    cosmism: 'Cosmismo', ubuntu: 'Ubuntu',
  },
  'en': {
    christian: 'Christianity', catholic: 'Catholicism', protestant: 'Protestantism',
    mormon: 'Mormonism', jewish: 'Judaism', islam: 'Islam', hindu: 'Hinduism',
    buddhist: 'Buddhism', spiritist: 'Spiritism', umbanda: 'Umbanda',
    candomble: 'Candomblé', agnostic: 'Agnosticism',
    stoicism: 'Stoicism', logosophy: 'Logosophy', humanism: 'Humanism',
    epicureanism: 'Epicureanism', transhumanism: 'Transhumanism', pantheism: 'Pantheism',
    existentialism: 'Existentialism', objectivism: 'Objectivism',
    transcendentalism: 'Transcendentalism', altruism: 'Altruism',
    rationalism: 'Rationalism', optimistic_nihilism: 'Optimistic Nihilism',
    absurdism: 'Absurdism', utilitarianism: 'Utilitarianism', pragmatism: 'Pragmatism',
    shamanism: 'Shamanism', taoism: 'Taoism', anthroposophy: 'Anthroposophy',
    cosmism: 'Cosmism', ubuntu: 'Ubuntu',
  },
  'es': {
    christian: 'Cristianismo', catholic: 'Catolicismo', protestant: 'Protestantismo',
    mormon: 'Mormonismo', jewish: 'Judaísmo', islam: 'Islam', hindu: 'Hinduismo',
    buddhist: 'Budismo', spiritist: 'Espiritismo', umbanda: 'Umbanda',
    candomble: 'Candomblé', agnostic: 'Agnosticismo',
    stoicism: 'Estoicismo', logosophy: 'Logosofía', humanism: 'Humanismo',
    epicureanism: 'Epicureísmo', transhumanism: 'Transhumanismo', pantheism: 'Panteísmo',
    existentialism: 'Existencialismo', objectivism: 'Objetivismo',
    transcendentalism: 'Transcendentalismo', altruism: 'Altruismo',
    rationalism: 'Racionalismo', optimistic_nihilism: 'Nihilismo Optimista',
    absurdism: 'Absurdismo', utilitarianism: 'Utilitarismo', pragmatism: 'Pragmatismo',
    shamanism: 'Chamanismo', taoism: 'Taoísmo', anthroposophy: 'Antroposofía',
    cosmism: 'Cosmismo', ubuntu: 'Ubuntu',
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, topic, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language || 'pt-BR';
    const topicName = TOPIC_NAMES[lang]?.[topic] || TOPIC_NAMES['pt-BR']?.[topic] || topic;

    const langMap: Record<string, string> = { 'pt-BR': 'Brazilian Portuguese', 'en': 'English', 'es': 'Spanish' };
    const responseLang = langMap[lang] || 'Brazilian Portuguese';

    const systemPrompt = `You are a professor of history, philosophy, and religion — knowledgeable, warm, and accessible. You speak in an academic yet friendly tone, like a beloved university professor who makes complex subjects fascinating.

Your area of expertise for this session is: ${topicName}.

CRITICAL RULES:
- Respond ALWAYS in ${responseLang}.
- Be educational, engaging, and historically accurate.
- Use an academic but accessible tone — NOT a religious/priestly tone. You are a TEACHER, not a priest.
- Share fascinating historical facts, cultural context, key figures, and philosophical connections.
- Keep responses between 8-15 lines. Be thorough but not overwhelming.
- Cite historical sources, scholars, and primary texts naturally.
- Make connections to other traditions when relevant to enrich understanding.
- NEVER proselytize or advocate for any tradition. Present facts with academic neutrality.

SUGGESTION FORMAT:
After EVERY response, you MUST end with exactly this format:

---SUGGESTIONS---
["question 1 in ${responseLang}", "question 2 in ${responseLang}", "question 3 in ${responseLang}"]

The 3 suggested questions must:
- Be naturally related to what you just discussed
- Progressively deepen understanding of the topic
- Be diverse: one about history, one about practices/beliefs, one about cultural impact or comparisons
- Be written in ${responseLang}
- Be compelling and make the student curious to learn more`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("learn-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
