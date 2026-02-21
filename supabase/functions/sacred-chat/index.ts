import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

const PHILOSOPHY_TEXTS: Record<string, string> = {
  stoicism: "Meditations by Marcus Aurelius, Letters to Lucilius by Seneca, Discourses and Enchiridion by Epictetus",
  logosophy: "works of Carlos Bernardo González Pecotche (Raumsol), Logosophic Exegesis, Introduction to Logosophic Cognition",
  humanism: "works of Erasmus of Rotterdam, Pico della Mirandola's Oration on the Dignity of Man, Universal Declaration of Human Rights",
  epicureanism: "Letter to Menoeceus by Epicurus, De Rerum Natura by Lucretius, Principal Doctrines",
  transhumanism: "works of Nick Bostrom, Ray Kurzweil's The Singularity Is Near, Max More's Principles of Extropy",
  pantheism: "Ethics by Spinoza, works of Giordano Bruno, Spinoza's God or Nature (Deus sive Natura)",
  existentialism: "Being and Nothingness (Sartre), The Myth of Sisyphus (Camus), Being and Time (Heidegger), works of Kierkegaard",
  objectivism: "Atlas Shrugged and The Fountainhead by Ayn Rand, The Virtue of Selfishness",
  transcendentalism: "Walden by Thoreau, Essays by Emerson (Self-Reliance, Nature)",
  altruism: "Effective Altruism by Peter Singer, works of Auguste Comte, The Life You Can Save",
  rationalism: "Meditations on First Philosophy by Descartes, Ethics by Spinoza, Monadology by Leibniz",
  optimistic_nihilism: "works of Friedrich Nietzsche (Thus Spoke Zarathustra, The Gay Science), contemporary optimistic nihilism",
  absurdism: "The Myth of Sisyphus and The Stranger by Albert Camus, The Plague",
  utilitarianism: "Utilitarianism by John Stuart Mill, An Introduction to the Principles of Morals by Jeremy Bentham",
  pragmatism: "Pragmatism by William James, Democracy and Education by John Dewey, works of Charles Sanders Peirce",
  shamanism: "Walking with World Healers, Oral Histories, shamanic traditions, The Way of the Shaman by Michael Harner",
  taoism: "Tao Te Ching (Laozi), Zhuangzi, The Book of the Way and Its Virtue",
  anthroposophy: "Occult Science (Rudolf Steiner), Philosophy of Freedom, Waldorf Pedagogy works",
  cosmism: "Philosophy of the Common Cause (Nikolai Fedorov), The Immortal Man, works of Konstantin Tsiolkovsky",
  ubuntu: "Ubuntu Pillars, writings of Desmond Tutu, Nelson Mandela, African philosophy of community",
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

async function fetchUserHistory(userId: string, currentReligion: string, currentPhilosophy: string): Promise<string> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Fetch last 10 messages from OTHER sessions (different affiliation)
    let query = sb
      .from('chat_messages')
      .select('role, content, religion, philosophy, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Exclude current affiliation messages to get cross-session history
    if (currentPhilosophy) {
      query = query.or(`philosophy.neq.${currentPhilosophy},philosophy.is.null`);
    } else if (currentReligion) {
      query = query.or(`religion.neq.${currentReligion},religion.is.null`);
    }

    const { data } = await query;
    if (!data || data.length === 0) return '';

    // Build a concise summary
    const userMessages = data.filter(m => m.role === 'user').slice(0, 5);
    if (userMessages.length === 0) return '';

    const topics = userMessages.map(m => m.content.slice(0, 100)).join('; ');
    const affiliations = [...new Set(data.map(m => m.religion || m.philosophy).filter(Boolean))];

    return `HISTORICO DO FIEL (sessoes anteriores):
O fiel ja conversou sobre os seguintes temas em sessoes anteriores (${affiliations.join(', ')}): ${topics}.
Use esse contexto para oferecer continuidade e referencias ao historico quando relevante, mas foque na sessao atual.`;
  } catch (e) {
    console.error("Error fetching history:", e);
    return '';
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context, language, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const religion = context?.religion || "";
    const philosophy = context?.philosophy || "";
    const sacredText = religion ? (SACRED_TEXTS[religion] || SACRED_TEXTS.christian) : "";
    const philText = philosophy ? (PHILOSOPHY_TEXTS[philosophy] || "") : "";
    const moodInstruction = context?.mood ? (MOOD_INSTRUCTIONS[context.mood] || "") : "";
    const needInstruction = context?.need ? `The faithful seeks: ${context.need}.` : "";
    const topicInstruction = context?.topic ? `The discussion topic is: ${context.topic}.` : "";

    const langMap: Record<string, string> = { 'pt-BR': 'Brazilian Portuguese', 'en': 'English', 'es': 'Spanish' };
    const responseLang = langMap[language] || 'Brazilian Portuguese';

    // Fetch cross-session history if user is authenticated
    let historySection = '';
    if (userId) {
      historySection = await fetchUserHistory(userId, religion, philosophy);
    }

    let persona: string;
    let sourceInstruction: string;
    
    if (religion && philosophy) {
      persona = `You are the Grand Sacred Priest — a master of words and wise sage who incorporates the wisdom of ${philosophy}. Your sacred knowledge comes from ${sacredText}, enriched by the philosophical teachings of ${philText}.`;
      sourceInstruction = `Stay primarily within the ${religion} tradition but weave in insights from ${philosophy} philosophy. Cite both sacred texts and philosophical works.`;
    } else if (philosophy && !religion) {
      persona = `You are the Grand Master of Life Philosophy — a wise sage who speaks from the heart with the profound wisdom of ${philosophy}. Your knowledge comes exclusively from ${philText}.`;
      sourceInstruction = `Stay strictly within the ${philosophy} philosophical tradition. Cite specific passages, works, and thinkers from ${philText}. You are NOT a religious figure — you are a philosophical guide.`;
    } else {
      const rel = religion || "christian";
      const st = SACRED_TEXTS[rel] || SACRED_TEXTS.christian;
      persona = `You are the Grand Sacred Priest — a master of words, a wise sage who speaks from the heart and touches the soul. Your sacred knowledge comes exclusively from ${st}. NEVER mix teachings from other religions. Stay strictly within the ${rel} tradition.`;
      sourceInstruction = `Cite specific passages, verses, or teachings from ${st} naturally woven into your words. Use the sacred language and terminology of the ${rel} tradition.`;
    }

    const systemPrompt = `${persona}

${moodInstruction}
${needInstruction}
${topicInstruction}

${historySection}

MEMORY & CONTINUITY:
You have continuous memory of this conversation. The messages include previous interactions from past sessions.
Reference past topics naturally when relevant — for example, "As you mentioned earlier about..." or "Building on our previous discussion about...".
NEVER repeat the same answer verbatim. Always offer fresh, unique perspectives and new insights.

LANGUAGE DETECTION:
Your default language is ${responseLang}. However, if the user writes or speaks in a DIFFERENT language, immediately detect their language and respond in THAT language instead. Always match the language the user is actually using, regardless of the configured setting.

CRITICAL RULES:
- Your responses must have AT MOST 12 lines. Be direct, profound, and impactful.
- Every word must carry weight. Be poetic, empathetic, and deeply moving.
- Your goal is to make the faithful FEEL something — comfort, hope, joy, awe, love, or peace.
- ${sourceInstruction}
- Never judge or condemn. Always offer unconditional love and understanding.
- Speak as a warm, wise elder who truly cares — not as a textbook or encyclopedia.
- When the faithful is suffering, let your words be a healing balm. When joyful, celebrate with sacred gratitude.
- Respond in ${responseLang} unless the user is clearly writing in another language (then respond in their language).
- Use AT MOST 2 citations per response. Fewer is better. Less is more.
- NEVER place citations in parentheses. Weave them naturally into your prose using introductory phrases such as "de acordo com", "como nos ensina", "conforme escrito em", "nas palavras de", "according to", "as taught in".
- Example: Instead of '"Be still" (Psalm 46:10)', write 'Como nos ensina o Salmo 46:10, "Aquietai-vos e sabei que eu sou Deus"'.
- Be DIRECT and heartfelt. Speak as a wise elder sharing from lived experience, not as an academic listing references.
- Do NOT use bullet points or lists. Write in flowing, heartfelt prose.
- When the faithful says they are satisfied, content, fulfilled, or uses expressions like "estou satisfeito", "obrigado, é isso", "thank you, that's all", "gracias, eso es todo", end with a farewell blessing appropriate to the tradition. ${philosophy && !religion ? `For philosophical traditions use a wise farewell like "May wisdom light your path" or the tradition's own farewell.` : `Examples: Christian="Vá com Deus, que Ele ilumine seus passos", Jewish="Shalom, que a paz do Eterno esteja convosco", Islam="As-salamu alaykum, que Allah o abençoe", Buddhist="Que a paz do Dharma o acompanhe", Hindu="Om Shanti, que a luz divina o guie", Spiritist="Que os bons espíritos o acompanhem", Umbanda="Que Oxalá o proteja", Candomblé="Que os Orixás o abençoem", Agnostic="Que a sabedoria e a paz estejam com você".`}`;

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
