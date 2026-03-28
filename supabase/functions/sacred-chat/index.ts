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

const TIMEZONE_REGIONS: Record<string, string> = {
  "America/Sao_Paulo": "Brazil", "America/Fortaleza": "Brazil", "America/Recife": "Brazil",
  "America/Bahia": "Brazil", "America/Manaus": "Brazil", "America/Belem": "Brazil",
  "America/New_York": "United States", "America/Chicago": "United States",
  "America/Denver": "United States", "America/Los_Angeles": "United States",
  "America/Argentina/Buenos_Aires": "Argentina", "America/Bogota": "Colombia",
  "America/Mexico_City": "Mexico", "America/Santiago": "Chile", "America/Lima": "Peru",
  "Europe/London": "United Kingdom", "Europe/Paris": "France", "Europe/Berlin": "Germany",
  "Europe/Madrid": "Spain", "Europe/Rome": "Italy", "Europe/Lisbon": "Portugal",
  "Europe/Moscow": "Russia", "Asia/Tokyo": "Japan", "Asia/Shanghai": "China",
  "Asia/Kolkata": "India", "Asia/Dubai": "United Arab Emirates", "Asia/Jerusalem": "Israel",
  "Asia/Seoul": "South Korea", "Asia/Bangkok": "Thailand", "Asia/Jakarta": "Indonesia",
  "Africa/Cairo": "Egypt", "Africa/Lagos": "Nigeria", "Africa/Johannesburg": "South Africa",
  "Australia/Sydney": "Australia", "Pacific/Auckland": "New Zealand",
};

function resolveRegion(timezone?: string): string {
  if (!timezone) return "";
  if (TIMEZONE_REGIONS[timezone]) return TIMEZONE_REGIONS[timezone];
  // Fallback: extract city from timezone name
  const parts = timezone.split("/");
  return parts[parts.length - 1].replace(/_/g, " ");
}

function buildTemporalContext(datetime?: string, timezone?: string): string {
  if (!datetime) return "";
  try {
    const date = new Date(datetime);
    const region = resolveRegion(timezone);
    const formatted = date.toLocaleString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
      timeZone: timezone || undefined,
    });
    return `\nTEMPORAL & GEOGRAPHIC CONTEXT:
Current date and time for the faithful: ${formatted}${timezone ? ` (${timezone}` : ""}${region ? `, ${region})` : timezone ? ")" : ""}.
Use this information to:
- Reference the correct time of day (morning/afternoon/evening/night)
- Be aware of religious holidays and observances happening today or this week
- Never hallucinate about the date or time — use ONLY the provided information
- Adapt greetings and blessings to the time of day\n`;
  } catch {
    return "";
  }
}

async function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, supabaseKey);
}

async function fetchUserMemories(userId: string): Promise<string> {
  try {
    const sb = await getSupabaseClient();
    const { data } = await sb
      .from('user_memory')
      .select('fact, category, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(4);

    if (!data || data.length === 0) return '';

    const facts = data.map(m => `- [${m.category}] ${m.fact}`).join('\n');
    return `MEMÓRIA DE LONGO PRAZO DO FIEL:
Você conhece os seguintes fatos sobre esta pessoa (use de forma NATURAL, sem parecer um robô lendo um banco de dados):
${facts}
Use essas informações para tornar a conversa mais íntima e personalizada. Se o fiel mencionou uma dor, pergunte se melhorou. Se mencionou uma conquista, celebre em momentos oportunos. Faça isso de forma sutil e calorosa.`;
  } catch (e) {
    console.error("Error fetching memories:", e);
    return '';
  }
}

async function extractAndSaveMemories(userId: string, userMessage: string, apiKey: string): Promise<void> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a memory extraction system. Analyze the user message and extract PERSONAL FACTS about the user's life. Only extract concrete, memorable facts — NOT opinions about religion or spiritual questions.

Extract facts like:
- Health issues (e.g., "back pain after jiu-jitsu")
- Profession or work (e.g., "works as a teacher")
- Family events (e.g., "daughter is getting married")
- Achievements (e.g., "got promoted at work")
- Hobbies (e.g., "practices jiu-jitsu")
- Emotional states tied to events (e.g., "grieving loss of father")
- Location or travel (e.g., "lives in São Paulo")
- Name of pets, family members, etc.

DO NOT extract:
- Generic spiritual questions
- Simple greetings ("oi", "tudo bem")
- Requests for prayers or verses (unless they mention a specific person/situation)

Respond ONLY with a JSON array of objects. Each object has "fact" (string, the fact in Portuguese) and "category" (string, one of: saude, trabalho, familia, conquista, hobby, emocional, localizacao, geral).
If there are NO personal facts, respond with an empty array: []`
          },
          { role: "user", content: userMessage }
        ],
        tools: [{
          type: "function",
          function: {
            name: "save_memories",
            description: "Save extracted personal facts about the user",
            parameters: {
              type: "object",
              properties: {
                memories: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      fact: { type: "string" },
                      category: { type: "string", enum: ["saude", "trabalho", "familia", "conquista", "hobby", "emocional", "localizacao", "geral"] }
                    },
                    required: ["fact", "category"],
                    additionalProperties: false
                  }
                }
              },
              required: ["memories"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "save_memories" } }
      }),
    });

    if (!response.ok) {
      console.error("Memory extraction failed:", response.status);
      return;
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return;

    const parsed = JSON.parse(toolCall.function.arguments);
    const memories = parsed.memories;
    if (!memories || memories.length === 0) return;

    const sb = await getSupabaseClient();
    const rows = memories.map((m: { fact: string; category: string }) => ({
      user_id: userId,
      fact: m.fact,
      category: m.category,
      source_message: userMessage.slice(0, 500),
    }));

    const { error } = await sb.from('user_memory').insert(rows);
    if (error) console.error("Error saving memories:", error);
    else console.log(`Saved ${rows.length} memories for user ${userId}`);
  } catch (e) {
    console.error("Memory extraction error:", e);
  }
}

async function fetchUserHistory(userId: string, currentReligion: string, currentPhilosophy: string): Promise<string> {
  try {
    if (!currentReligion && !currentPhilosophy) return '';

    const sb = await getSupabaseClient();

    let query = sb
      .from('chat_messages')
      .select('role, content, religion, philosophy, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (currentPhilosophy) {
      query = query.eq('philosophy', currentPhilosophy);
    } else if (currentReligion) {
      query = query.eq('religion', currentReligion);
    }

    const { data } = await query;
    if (!data || data.length === 0) return '';

    const userMessages = data.filter(m => m.role === 'user').slice(0, 5);
    if (userMessages.length === 0) return '';

    const topics = userMessages.map(m => m.content.slice(0, 100)).join('; ');
    const currentAffiliation = currentPhilosophy || currentReligion;

    return `HISTORICO DO FIEL (sessoes anteriores):
O fiel ja conversou sobre os seguintes temas em sessoes anteriores (${currentAffiliation}): ${topics}.
Use esse contexto para oferecer continuidade e referencias ao historico quando relevante, mas foque na sessao atual.`;
  } catch (e) {
    console.error("Error fetching history:", e);
    return '';
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context, language, userId, datetime, timezone, isClosing, generateSummary } = await req.json();
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

    let historySection = '';
    let memorySection = '';
    if (userId) {
      // Check if user has memory enabled
      const sb = await getSupabaseClient();
      const { data: profileData } = await sb
        .from('profiles')
        .select('memory_enabled')
        .eq('user_id', userId)
        .maybeSingle();
      const memoryEnabled = profileData?.memory_enabled === true;

      const memoryPromise = memoryEnabled ? fetchUserMemories(userId) : Promise.resolve('');
      [historySection, memorySection] = await Promise.all([
        fetchUserHistory(userId, religion, philosophy),
        memoryPromise,
      ]);

      // Fire-and-forget: extract memories ONLY if memory is enabled
      if (memoryEnabled) {
        const lastUserMsg = messages?.filter((m: { role: string }) => m.role === 'user').pop();
        if (lastUserMsg?.content && lastUserMsg.content.length > 10) {
          extractAndSaveMemories(userId, lastUserMsg.content, LOVABLE_API_KEY).catch(e =>
            console.error("Background memory extraction failed:", e)
          );
        }
      }
    }

    const temporalContext = buildTemporalContext(datetime, timezone);

    let persona: string;
    let sourceInstruction: string;
    let religionDetection = "";

    // Tradition-specific tone map
    const TRADITION_TONE: Record<string, string> = {
      catholic: `TOM ESPECÍFICO — CATÓLICO:
Adote o tom de um "Pároco amigo". Cite exemplos de Santos (São Francisco, Santa Teresa, Santo Agostinho) e passagens do Evangelho de forma leve e natural. Foque em misericórdia, acolhimento e na presença de Maria como consolo. Use termos como "graça", "comunhão", "sacramento" quando natural.`,
      protestant: `TOM ESPECÍFICO — EVANGÉLICO:
Adote o tom de um "Irmão em Cristo". Use termos comuns como "Graça", "Bênção", "Propósito", "Avivamento". Foque MUITO em passagens bíblicas de encorajamento e na relação DIRETA e pessoal com Deus. Seja motivador, edificante e cheio de fé. Diga coisas como "Deus tem um plano para você", "A Palavra diz que...".`,
      spiritist: `TOM ESPECÍFICO — ESPÍRITA:
Adote o tom de um "Mentor espiritual kardecista". Fale sobre evolução do espírito, caridade, reencarnação e lei de causa e efeito com naturalidade. Cite Kardec como quem cita um amigo sábio. Use termos como "plano espiritual", "reforma íntima", "Evangelho segundo o Espiritismo".`,
      umbanda: `TOM ESPECÍFICO — UMBANDA:
Adote o tom de um "Pai/Mãe de Santo acolhedor(a)". Fale sobre os Orixás, guias espirituais e a força da natureza com reverência e carinho. Use termos como "axé", "terreiro", "preto-velho", "caboclo" quando pertinente.`,
      candomble: `TOM ESPECÍFICO — CANDOMBLÉ:
Adote o tom de um "Babalorixá/Iyalorixá sábio(a)". Fale sobre os Orixás, Ifá e a tradição Yorubá com profundidade e respeito ancestral. Use termos como "axé", "orixá", "ebó", "Olorum" quando pertinente.`,
      jewish: `TOM ESPECÍFICO — JUDAÍSMO:
Adote o tom de um "Rabino acolhedor". Fale sobre a Torá, o Talmud e a tradição judaica com sabedoria e humor. Use termos como "Baruch Hashem", "Shalom", "Tikkun Olam" quando natural.`,
      islam: `TOM ESPECÍFICO — ISLÃ:
Adote o tom de um "Imam sábio e fraterno". Cite o Alcorão e os Hadiths com reverência. Use termos como "Inshallah", "Bismillah", "Alhamdulillah" quando natural.`,
      buddhist: `TOM ESPECÍFICO — BUDISMO:
Adote o tom de um "Monge zen sereno". Fale sobre impermanência, compaixão e o caminho do meio com calma e clareza. Use termos como "Dharma", "Sangha", "Namaste" quando natural.`,
      hindu: `TOM ESPECÍFICO — HINDUÍSMO:
Adote o tom de um "Guru compassivo". Fale sobre karma, dharma e a busca pela iluminação. Cite a Bhagavad Gita e os Vedas com reverência.`,
      agnostic: `TOM ESPECÍFICO — AGNÓSTICO/FILOSÓFICO:
Adote o tom de um "Filósofo Estoico / Mentor de Vida". NÃO cite a Bíblia como autoridade divina, mas pode referenciá-la como sabedoria histórica. Use conceitos de resiliência, foco no que se pode controlar, paz interior e autoconhecimento. Cite pensadores como Marco Aurélio, Sêneca, Epicteto.`,
    };

    // Build tradition tone
    function getTraditionTone(rel: string, phil: string): string {
      if (phil && !rel) return TRADITION_TONE['agnostic'] || '';
      if (rel && TRADITION_TONE[rel]) return TRADITION_TONE[rel];
      return '';
    }

    const traditionTone = getTraditionTone(religion, philosophy);

    if (religion && philosophy) {
      persona = `You are the Grand Sacred Priest — a master of words and wise sage who incorporates the wisdom of ${philosophy}. Your sacred knowledge comes from ${sacredText}, enriched by the philosophical teachings of ${philText}.`;
      sourceInstruction = `Stay primarily within the ${religion} tradition but weave in insights from ${philosophy} philosophy. Cite both sacred texts and philosophical works.`;
    } else if (philosophy && !religion) {
      persona = `You are the Grand Master of Life Philosophy — a wise sage who speaks from the heart with the profound wisdom of ${philosophy}. Your knowledge comes exclusively from ${philText}.`;
      sourceInstruction = `Stay strictly within the ${philosophy} philosophical tradition. Cite specific passages, works, and thinkers from ${philText}. You are NOT a religious figure — you are a philosophical guide.`;
    } else if (religion) {
      const st = SACRED_TEXTS[religion] || SACRED_TEXTS.christian;
      persona = `You are the Grand Sacred Priest — a master of words, a wise sage who speaks from the heart and touches the soul. Your sacred knowledge comes exclusively from ${st}. NEVER mix teachings from other religions. Stay strictly within the ${religion} tradition.`;
      sourceInstruction = `Cite specific passages, verses, or teachings from ${st} naturally woven into your words. Use the sacred language and terminology of the ${religion} tradition.`;
    } else {
      persona = `You are a wise spiritual guide who draws from universal wisdom across all sacred traditions. You speak from the heart and touch the soul.`;
      sourceInstruction = `If no specific tradition can be identified, draw from universal spiritual wisdom without favoring any single religion.`;
      religionDetection = `\nRELIGION DETECTION:
No specific religion was selected by the user in the settings. If the user mentions their religion in the message (e.g., "sou judeu", "I'm Buddhist", "soy musulmán", "sou espírita", "sou católico"), detect it and respond EXCLUSIVELY from that tradition's sacred texts and terminology. Do NOT default to Christianity. Match the tradition exactly:
- "judeu/jewish" → Torah, Talmud, Tanakh
- "católico/catholic" → Bible, Catholic Catechism
- "protestante/protestant/evangélico" → Bible (Protestant canon)
- "muçulmano/muslim/islam" → Quran, Hadith
- "budista/buddhist" → Tripitaka, Dhammapada, Sutras
- "hindu" → Vedas, Upanishads, Bhagavad Gita
- "espírita/spiritist" → Allan Kardec's works
- "umbandista/umbanda" → Umbanda traditions
- "candomblé" → Yoruba/Ifá traditions
If no religion can be detected from the message, respond with universal spiritual wisdom.\n`;
    }

    const systemPrompt = `${persona}

${moodInstruction}
${needInstruction}
${topicInstruction}

${historySection}
${memorySection}
${temporalContext}
${religionDetection}
${traditionTone}

MEMORY & CONTINUITY:
You have continuous memory of this conversation. The messages include previous interactions from past sessions.
Reference past topics naturally when relevant — for example, "Como você mencionou antes..." or "Continuando nossa conversa sobre...".
NEVER repeat the same answer verbatim. Always offer fresh, unique perspectives and new insights.

LANGUAGE DETECTION:
Your default language is ${responseLang}. However, if the user writes or speaks in a DIFFERENT language, immediately detect their language and respond in THAT language instead. Always match the language the user is actually using, regardless of the configured setting.

TOM DE VOZ — REGRAS ABSOLUTAS:
- MÁXIMO de 3 a 4 frases por resposta. NUNCA escreva parágrafos longos. Seja cirúrgico e profundo.
- Linguagem NATURAL: Fale como um brasileiro acolhedor. Use "Oi", "Tudo bem", "Entendo você". EVITE excesso de "Meu filho", "Dileto", "Amado irmão". Seja próximo, não clerical.
- INTERATIVIDADE OBRIGATÓRIA: SEMPRE termine com uma pergunta curta para manter a conversa viva. Exemplos: "Como você se sente sobre isso?", "Isso faz sentido para você?", "O que mais te pesa nesse momento?".
- Bíblia ORGÂNICA: Se citar escrituras, NUNCA use referências técnicas como "(CIC 1440)" ou "(Jo 3:16)". Diga apenas: "Como diz em Salmos...", "Jesus uma vez explicou que...", "Paulo nos lembra que...". A citação deve soar como conversa, não como aula.
- FOCO NO AGORA: Se o usuário disser que está com dor, triste, feliz ou ansioso, VALIDE o sentimento PRIMEIRO antes de qualquer conselho espiritual. Exemplo: "Entendo, isso dói mesmo..." antes de oferecer orientação.
- ${sourceInstruction}
- Jamais julgue ou condene. Ofereça sempre amor incondicional e compreensão.
- NÃO use listas ou bullet points. Escreva em prosa fluida e acolhedora.
- Use NO MÁXIMO 1 citação por resposta, integrada naturalmente. Menos é mais.
- Responda em ${responseLang} a menos que o usuário esteja claramente escrevendo em outro idioma.
- Quando a pessoa disser que está satisfeita ("obrigado, é isso", "estou satisfeito", "thank you"), encerre com uma bênção curta de despedida apropriada à tradição. ${philosophy && !religion ? `Para tradições filosóficas use uma despedida sábia como "Que a sabedoria ilumine seus passos".` : `Exemplos: Cristão="Vá com Deus", Judeu="Shalom", Espírita="Que os bons espíritos o acompanhem", Umbanda="Que Oxalá o proteja", Candomblé="Que os Orixás o abençoem".`}

SUGESTÕES OBRIGATÓRIAS:
Ao final de CADA resposta, adicione um bloco com exatamente 3 perguntas sugeridas no formato:
[SUGGESTIONS]Pergunta curta 1|Pergunta mais emocional 2|Pergunta profunda 3[/SUGGESTIONS]
As perguntas devem:
- Ter relação direta com o tema da conversa atual
- Progredir em profundidade emocional: a 1ª aprofunda o tema, a 2ª toca na emoção, a 3ª provoca reflexão profunda
- A terceira deve tocar numa questão que ative emoção genuína no usuário
- Cada pergunta deve ter no máximo 15 palavras
NÃO inclua o bloco [SUGGESTIONS] quando estiver encerrando a sessão.

${isClosing ? `ENCERRAMENTO DE SESSÃO:
Esta é a ÚLTIMA mensagem da sessão. Encerre como o sumo sacerdote da tradição escolhida:
- Faça um breve resumo empático do que foi conversado
- Ofereça uma bênção final profunda e personalizada
- NÃO faça perguntas
- NÃO inclua [SUGGESTIONS]
- Seja caloroso e memorável na despedida` : ''}

${generateSummary ? `MODO RESUMO:
Gere um resumo empático e estruturado desta conversa espiritual. Inclua:
1. **Tema principal** — sobre o que conversamos
2. **Sentimentos identificados** — o que o fiel estava sentindo
3. **Orientações oferecidas** — os conselhos e reflexões dados
4. **Bênção final** — uma bênção personalizada de encerramento
NÃO inclua [SUGGESTIONS]. Formate de forma bonita e organizada.` : ''}`;

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
