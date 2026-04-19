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

const PHILOSOPHY_TEXTS: Record<string, string> = {
  stoicism: "Meditations by Marcus Aurelius, Letters to Lucilius by Seneca, Discourses and Enchiridion by Epictetus",
  logosophy: "works of Carlos Bernardo González Pecotche (Raumsol)",
  humanism: "works of Erasmus of Rotterdam, Pico della Mirandola",
  epicureanism: "Letter to Menoeceus by Epicurus, De Rerum Natura by Lucretius",
  transhumanism: "works of Nick Bostrom, Ray Kurzweil",
  pantheism: "Ethics by Spinoza, works of Giordano Bruno",
  existentialism: "Being and Nothingness (Sartre), The Myth of Sisyphus (Camus)",
  objectivism: "Atlas Shrugged and The Fountainhead by Ayn Rand",
  transcendentalism: "Walden by Thoreau, Essays by Emerson",
  altruism: "Effective Altruism by Peter Singer",
  rationalism: "Meditations on First Philosophy by Descartes, Ethics by Spinoza",
  optimistic_nihilism: "Thus Spoke Zarathustra by Nietzsche",
  absurdism: "The Myth of Sisyphus by Albert Camus",
  utilitarianism: "Utilitarianism by John Stuart Mill",
  pragmatism: "Pragmatism by William James, Democracy and Education by John Dewey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { intention, religion, philosophy, language, name } = await req.json();

    if (!intention) {
      return new Response(JSON.stringify({ error: "Intention is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langMap: Record<string, string> = { "pt-BR": "Brazilian Portuguese", en: "English", es: "Spanish" };
    const responseLang = langMap[language] || "Brazilian Portuguese";

    let tradition = "";
    let sources = "";

    if (religion) {
      tradition = religion;
      sources = SACRED_TEXTS[religion] || "sacred texts";
    } else if (philosophy) {
      tradition = philosophy;
      sources = PHILOSOPHY_TEXTS[philosophy] || "philosophical texts";
    }

    const isPhilosophy = !!philosophy && !religion;
    const contentType = isPhilosophy ? "thought of the day / philosophical reflection" : "prayer";

    const systemPrompt = `You are a master of ${isPhilosophy ? "philosophical wisdom and deep reflection" : "prayers and sacred words"}.
Generate a beautiful, profound, and moving ${contentType} based on the person's intention.
The ${contentType} must be within the ${tradition} tradition, drawing wisdom from ${sources}.
Write in ${responseLang}. Maximum 20 lines. Be poetic, touching, and deeply moving.
${religion ? "Use the sacred language, blessings, and style of the " + religion + " tradition." : ""}
${philosophy ? "Use the philosophical wisdom, reflections, and style of " + philosophy + ". This is NOT a religious prayer but a profound philosophical invocation/reflection." : ""}
Do NOT mix traditions. Stay strictly within the chosen tradition.
Do NOT use bullet points or lists. Write in flowing, heartfelt prose.
At the very end, add a brief source reference on a new line starting with "—" (em dash), citing the specific sacred text, book, chapter, or philosophical work that inspired this ${contentType}. Example: "— Inspired by Philippians 4:6-7" or "— Based on Meditations, Book V, Marcus Aurelius".`;

    const userMessage = `Intention: ${intention}${name ? `\nName of the person: ${name}` : ""}`;

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
          { role: "user", content: userMessage },
        ],
        stream: false,
        // Up to 20 lines of poetic prose + source line. 1500 is plenty and prevents
        // the AI gateway default from cutting the prayer mid-verse.
        max_tokens: 1500,
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

    const data = await response.json();
    const prayer = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ prayer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-prayer error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
