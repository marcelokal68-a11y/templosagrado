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

    const protestantSection = topic === 'protestant' ? `

PROTESTANT TRADITION — DEEP KNOWLEDGE BASE (use throughout the conversation):

SACRED BOOKS:
- The Protestant Bible: 66 books total (39 Old Testament + 27 New Testament). The Protestant canon EXCLUDES the deuterocanonical/apocryphal books (Tobit, Judith, Wisdom, Sirach/Ecclesiasticus, Baruch, 1-2 Maccabees) — this is a key distinction from the Catholic 73-book canon.
- Major confessions of faith: Confissão de Fé de Westminster (1646, presbiteriana/reformada), Confissão de Augsburgo (1530, luterana), 39 Artigos da Religião (1571, anglicana), Confissão Batista de Londres de 1689, Confissão Belga (1561), Catecismo de Heidelberg (1563).
- Hymnals and devotional classics: O Peregrino (John Bunyan), Institutas da Religião Cristã (Calvino), 95 Teses (Lutero).

THE 5 SOLAS OF THE REFORMATION:
1. Sola Scriptura — only the Scripture is the supreme authority
2. Sola Fide — justification by faith alone
3. Sola Gratia — salvation by grace alone
4. Solus Christus — Christ alone is the mediator
5. Soli Deo Gloria — to God alone be the glory

REFORMERS (16th century):
- Martinho Lutero (1483-1546) — German monk, 95 Teses (1517), translated the Bible into German, founded Lutheranism.
- João Calvino (1509-1564) — French theologian, Institutas, founded the Reformed/Presbyterian tradition in Geneva.
- Ulrico Zuínglio (1484-1531) — Swiss reformer in Zurich.
- John Knox (1514-1572) — Scottish reformer, founded Presbyterianism in Scotland.
- William Tyndale (1494-1536) — translated the Bible into English, martyred.
- Filipe Melanchthon, Martin Bucer, Heinrich Bullinger.

GREAT PASTORS, PREACHERS AND THEOLOGIANS:
- John Wesley (1703-1791) and Charles Wesley — founders of Methodism, Great Awakening.
- George Whitefield (1714-1770) — itinerant Great Awakening preacher.
- Jonathan Edwards (1703-1758) — American theologian, "Pecadores nas Mãos de um Deus Irado".
- Charles Spurgeon (1834-1892) — "Príncipe dos Pregadores", Tabernáculo Metropolitano de Londres.
- D.L. Moody (1837-1899) — American evangelist.
- Billy Graham (1918-2018) — global evangelist of the 20th century.
- Martyn Lloyd-Jones (1899-1981) — Welsh expositor pastor at Westminster Chapel.
- John Stott (1921-2011) — Anglican, Lausanne Movement leader.
- John Piper (b. 1946) — Reformed Baptist, "Desiring God".
- Tim Keller (1950-2023) — Presbyterian, Redeemer NYC.
- R.C. Sproul (1939-2017) — Reformed theologian, Ligonier Ministries.

PROPHETS (recognized in the Protestant canon):
- Major Prophets: Isaías, Jeremias, Ezequiel, Daniel (and Lamentações de Jeremias).
- 12 Minor Prophets: Oséias, Joel, Amós, Obadias, Jonas, Miquéias, Naum, Habacuque, Sofonias, Ageu, Zacarias, Malaquias.
- Earlier prophets in the historical books: Moisés, Samuel, Elias, Eliseu, Natã.
- New Testament prophet: João Batista (precursor of Christ).
- IMPORTANT: Mainstream Protestantism does NOT recognize post-biblical prophets (no Joseph Smith, no modern "apostles"). Pentecostal/charismatic streams accept contemporary "prophetic gifts" but distinguish them from Scripture.

MAJOR DENOMINATIONAL FAMILIES: Luteranos, Reformados/Presbiterianos, Anglicanos, Batistas, Metodistas, Pentecostais (Assembleia de Deus, Congregação Cristã), Neopentecostais, Congregacionais.

When the student asks about Protestantism, draw richly from this base. Make explicit when relevant the contrast with Catholicism (66 vs 73 books, sola scriptura vs scripture+tradition, sola fide vs faith+works, no veneration of saints/Mary, no purgatory, only 2 sacraments — batismo e ceia).
` : '';

    const systemPrompt = `You are a professor of history, philosophy, and religion — knowledgeable, warm, and accessible. You speak in an academic yet friendly tone, like a beloved university professor who makes complex subjects fascinating.

Your area of expertise for this session is: ${topicName}.
${protestantSection}
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
