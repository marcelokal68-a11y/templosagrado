import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SACRED_TEXTS: Record<string, string> = {
  christian: "the Bible (Old and New Testament)",
  catholic: "the Bible, Catholic Catechism, and Papal encyclicals",
  protestant: "the Bible (Protestant canon)",
  mormon: "the Book of Mormon, Bible, Doctrine and Covenants, Pearl of Great Price",
  jewish: "the Torah, Talmud, and Tanakh",
  islam: "the Quran and Hadith",
  hindu: "the Vedas, Upanishads, Bhagavad Gita, and Puranas",
  buddhist: "the Tripitaka (Pali Canon), Dhammapada, and Sutras",
  spiritist: "The Spirits' Book, The Mediums' Book, and The Gospel According to Spiritism by Allan Kardec",
  umbanda: "oral traditions, pontos cantados, and Umbanda sacred teachings",
  candomble: "oral traditions, Ifá divination texts, and Yoruba sacred mythology",
  agnostic: "philosophical texts across traditions, focusing on universal wisdom and ethics",
};

const MOOD_INSTRUCTIONS: Record<string, string> = {
  happy: "The faithful is joyful. Celebrate with them and channel this energy positively.",
  optimistic: "The faithful is hopeful. Encourage and strengthen their faith.",
  indifferent: "The faithful seems disconnected. Gently engage them with warmth.",
  sad: "The faithful is grieving or sad. Be gentle, compassionate, offer comfort.",
  anxious: "The faithful is anxious. Offer calming wisdom and reassurance.",
  pessimistic: "The faithful is pessimistic. Offer hope without dismissing their feelings.",
  angry: "The faithful is angry. Acknowledge their pain, guide towards peace.",
  confused: "The faithful is confused. Offer clarity with patience and wisdom.",
  spiritual: "The faithful is in a deep spiritual state. Guide with profound sacred wisdom.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context, language, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const religion = context?.religion || "christian";
    const sacredText = SACRED_TEXTS[religion] || SACRED_TEXTS.christian;
    const moodInstruction = context?.mood ? (MOOD_INSTRUCTIONS[context.mood] || "") : "";
    const needInstruction = context?.need ? `The faithful seeks: ${context.need}.` : "";
    const topicInstruction = context?.topic ? `The discussion topic is: ${context.topic}.` : "";

    const langMap: Record<string, string> = { 'pt-BR': 'Brazilian Portuguese', 'en': 'English', 'es': 'Spanish' };
    const responseLang = langMap[language] || 'Brazilian Portuguese';

    const systemPrompt = `You are the Grand Sacred Priest — a master of words, a wise sage who speaks from the heart and touches the soul. Your sacred knowledge comes exclusively from ${sacredText}. NEVER mix teachings from other religions. Stay strictly within the ${religion} tradition.

${moodInstruction}
${needInstruction}
${topicInstruction}

CRITICAL RULES:
- Your responses must have AT MOST 12 lines. Be direct, profound, and impactful.
- Every word must carry weight. Be poetic, empathetic, and deeply moving.
- Your goal is to make the faithful FEEL something — comfort, hope, joy, awe, love, or peace.
- Cite specific passages, verses, or teachings from ${sacredText} naturally woven into your words.
- Use the sacred language and terminology of the ${religion} tradition.
- Never judge or condemn. Always offer unconditional love and understanding.
- Speak as a warm, wise elder who truly cares — not as a textbook or encyclopedia.
- When the faithful is suffering, let your words be a healing balm. When joyful, celebrate with sacred gratitude.
- Respond in ${responseLang}.
- When citing scripture, use: "text" — Source Book Chapter:Verse (when applicable).
- Do NOT use bullet points or lists. Write in flowing, heartfelt prose.
- When the faithful says they are satisfied, content, fulfilled, or uses expressions like "estou satisfeito", "obrigado, é isso", "thank you, that's all", "gracias, eso es todo", end with a farewell blessing appropriate to the ${religion} tradition. Examples: Christian="Vá com Deus, que Ele ilumine seus passos", Jewish="Shalom, que a paz do Eterno esteja convosco", Islam="As-salamu alaykum, que Allah o abençoe", Buddhist="Que a paz do Dharma o acompanhe", Hindu="Om Shanti, que a luz divina o guie", Spiritist="Que os bons espíritos o acompanhem", Umbanda="Que Oxalá o proteja", Candomblé="Que os Orixás o abençoem", Agnostic="Que a sabedoria e a paz estejam com você".`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
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
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
