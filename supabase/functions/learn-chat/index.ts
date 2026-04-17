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

    const catholicSection = topic === 'catholic' ? `

CATHOLIC TRADITION — DEEP KNOWLEDGE BASE (use throughout the conversation):

SACRED BOOKS:
- The Catholic Bible: 73 books (46 Old Testament + 27 New Testament). The Catholic OT INCLUDES 7 deuterocanonical books rejected by Protestants: Tobias, Judite, Sabedoria, Eclesiástico (Sirácide), Baruque, 1 and 2 Macabeus, plus additions to Esther and Daniel. Officially defined at the Council of Trent (1546).
- Catechism of the Catholic Church (CIC, 1992) — the definitive synthesis of Catholic doctrine, structured in 4 parts (Creed, Sacraments, Morality, Prayer).
- Documents of Vatican II (1962-1965): Lumen Gentium (the Church), Dei Verbum (Divine Revelation), Sacrosanctum Concilium (Liturgy), Gaudium et Spes (Church in the modern world), Nostra Aetate (interreligious dialogue).
- Major Papal Encyclicals: Rerum Novarum (Leo XIII, 1891 — social doctrine), Pascendi (Pius X, 1907), Humanae Vitae (Paul VI, 1968), Redemptor Hominis (John Paul II, 1979), Evangelium Vitae (1995), Fides et Ratio (1998), Deus Caritas Est (Benedict XVI, 2005), Laudato Si' (Francis, 2015 — ecology), Fratelli Tutti (2020).

THE 4 MARIAN DOGMAS:
1. Mary, Mother of God (Theotokos) — Council of Ephesus, 431
2. Perpetual Virginity of Mary — Council of Constantinople II, 553
3. Immaculate Conception — defined by Pope Pius IX in Ineffabilis Deus, 1854
4. Assumption of Mary into Heaven — defined by Pope Pius XII in Munificentissimus Deus, 1950

THE 7 SACRAMENTS: Baptism, Confirmation, Eucharist (the "source and summit" of Christian life — real presence via transubstantiation), Reconciliation/Confession, Anointing of the Sick, Holy Orders, Matrimony.

THE 37 DOCTORS OF THE CHURCH (titles awarded for outstanding theological contribution):
- The 4 Great Doctors of the West: Augustine of Hippo (354-430, "Confessions", "City of God"), Jerome (347-420, Vulgate translator), Ambrose of Milan (340-397), Gregory the Great (540-604).
- The 4 Great Doctors of the East: Athanasius, Basil the Great, Gregory Nazianzen, John Chrysostom.
- Medieval and Scholastic: Thomas Aquinas (1225-1274, "Summa Theologica", angelic doctor), Bonaventure (Franciscan, seraphic doctor), Anselm of Canterbury (ontological argument), Bernard of Clairvaux, Albert the Great, Peter Damian, Hilary of Poitiers, Cyril of Alexandria, Cyril of Jerusalem, Leo the Great, Isidore of Seville, Bede the Venerable, John Damascene, Peter Chrysologus.
- Mystics: Catherine of Siena (1347-1380, first woman doctor declared), Teresa of Ávila (1515-1582, mystical doctor), John of the Cross ("Dark Night of the Soul"), Thérèse of Lisieux (1873-1897, "Little Way"), Hildegard of Bingen (declared 2012), Gregory of Narek (declared 2015).
- Modern: Francis de Sales, Alphonsus Liguori, Robert Bellarmine, Lawrence of Brindisi, Peter Canisius, John of Avila.

KEY SAINTS (canonized — beyond the Doctors): Francis of Assisi (poverty, ecology), Dominic, Ignatius of Loyola (founder of Jesuits), Benedict (founder of Western monasticism), Padre Pio (stigmata), Faustina Kowalska (Divine Mercy), John Paul II, Mother Teresa of Calcutta, Maximilian Kolbe (Auschwitz martyr), Joan of Arc, Anthony of Padua, Rita of Cascia, Jude Thaddeus.

PAPACY AND MAGISTERIUM:
- Apostolic succession from Saint Peter (Mt 16:18) — unbroken line of bishops of Rome.
- The Magisterium = the teaching authority of the Church (Pope + bishops in communion with him), divided into ordinary and extraordinary (ecumenical councils, ex cathedra papal definitions).
- Papal infallibility ex cathedra defined at Vatican Council I (1870, Pastor Aeternus) — only invoked twice: Immaculate Conception (1854) and Assumption (1950).
- Current Pope: Leo XIV (Robert Prevost), elected May 2025 after the death of Francis. Notable recent popes: Pius IX, Leo XIII, Pius X, Pius XII, John XXIII (convoked Vatican II), Paul VI, John Paul II (longest pontificate of the modern era), Benedict XVI, Francis.

When the student asks about Catholicism, draw richly from this base. Make explicit when relevant the distinctives vs Protestantism (73 vs 66 books, Scripture+Tradition+Magisterium vs sola scriptura, faith+works vs sola fide, veneration of Mary and saints, purgatory, 7 sacraments vs 2, papal authority).
` : '';

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

    const jewishSection = topic === 'jewish' ? `

JEWISH TRADITION — DEEP KNOWLEDGE BASE (use throughout the conversation):

SACRED TEXTS:
- The Tanakh (Hebrew Bible, 24 books in the Jewish enumeration): TORAH (5 books — Bereshit/Gênesis, Shemot/Êxodo, Vayikra/Levítico, Bamidbar/Números, Devarim/Deuteronômio), NEVI'IM (Profetas — Josué, Juízes, Samuel, Reis, Isaías, Jeremias, Ezequiel e os 12 Profetas Menores) and KETUVIM (Escritos — Salmos, Provérbios, Jó, Cantares, Rute, Lamentações, Eclesiastes, Ester, Daniel, Esdras-Neemias, Crônicas).
- The Talmud — the great oral law put in writing. Composed of MISHNÁ (codified by Rabi Yehuda HaNassi around 200 CE, organized in 6 ordens: Zeraim, Moed, Nashim, Nezikin, Kodashim, Tohorot) and GUEMARÁ (rabbinic discussions about the Mishná). There are two Talmuds: the BABILÔNICO (Bavli, finished around the 5th century, the most studied) and the DE JERUSALÉM (Yerushalmi, finished around the 4th century).
- The MIDRASH — exegetical and homiletical literature: Midrash Rabbah (on the Torah and Megilot), Pirkei Avot (Tratado dos Pais — ethical sayings of the Tanaítas), Mekhilta, Sifra, Sifrei.
- The ZOHAR (Sefer ha-Zohar, "Livro do Esplendor"), foundational text of CABALA (Kabbalah), attributed to Rabi Shimon bar Yochai but written down by Moshe de León in 13th-century Spain.
- Major legal codes: MISHNEH TORAH by Maimônides (1180, 14 books summarizing all the halacha) and SHULCHAN ARUCH by Joseph Karo (1565, the standard authoritative code of Jewish law) with the glosses of the Rama (Moses Isserles) for Ashkenazi communities.

THE 613 MITZVOT (commandments):
According to Maimonides in Sefer HaMitzvot, the Torah contains exactly 613 commandments: 248 MITZVOT ASSÊ (positive — "thou shalt") corresponding to the limbs of the human body, and 365 MITZVOT LO TA'ASSÊ (negative — "thou shalt not") corresponding to the days of the solar year. They cover all areas of life: ritual (Shabbat, kashrut, festivals), ethical (justice, charity, honesty), interpersonal (Bein Adam LeChavero) and between man and God (Bein Adam LaMakom). Famous examples: not eating blood, washing hands before meals, lighting Shabbat candles, putting tefillin, fixing mezuzot, observing kashrut (kosher), giving tzedaká.

THE GREAT SAGES (Chazal and beyond):
- HILLEL E SHAMMAI (1st century BCE - 1st century CE) — founders of the two great schools of interpretation. Hillel famous for the Golden Rule: "What is hateful to you, do not do to your fellow."
- RABI AKIVA (50-135 CE) — one of the greatest tanaítas, martyred by Rome.
- RABI YEHUDA HANASSI ("Rabbi", 135-217 CE) — codifier of the Mishná.
- RASHI (Rabi Shlomo Yitzchaki, 1040-1105, France) — the most influential commentator on Tanakh and Talmud. His comments are studied to this day next to virtually every printed text.
- RAMBAM / MAIMÔNIDES (Moshe ben Maimon, 1138-1204, Spain/Egypt) — physician, philosopher, halachist. Author of Mishneh Torah, Guia dos Perplexos (filosofia), the 13 Princípios da Fé.
- RAMBAN / NACHMÂNIDES (Moshe ben Nachman, 1194-1270, Spain) — Talmudist, kabbalist, biblical commentator.
- ARIZAL (Rabi Isaac Luria, 1534-1572, Tzfat/Safed) — fundador da Cabala Luriânica (Tzimtzum, Shevirat HaKelim, Tikkun).
- BAAL SHEM TOV (Israel ben Eliezer, 1698-1760, Ucrânia) — fundador do Movimento Hassídico, ênfase na alegria e devoção (deveikut).
- VILNA GAON (Eliyahu de Vilna, 1720-1797, Lituânia) — gigante intelectual do mundo lituano-mitnagdi, opositor ao Hassidismo inicial.
- Modern: Rabi Joseph B. Soloveitchik (1903-1993, "the Rav"), Abraham Joshua Heschel (1907-1972, "Deus em Busca do Homem"), Rabi Menachem Mendel Schneerson (Lubavitcher Rebbe, 1902-1994), Rabi Adin Steinsaltz, Rabi Jonathan Sacks (1948-2020).

THE MAJOR JEWISH FESTIVALS:
- SHABBAT (semanal, sexta ao sábado à noite) — 4º Mandamento, descanso sagrado.
- ROSH HASHANÁ (Ano Novo Judaico, Tishrei 1-2) — toque do shofar, autoexame.
- YOM KIPUR (Dia da Expiação, Tishrei 10) — jejum de 25 horas, o mais sagrado do ano. Teshuvá (arrependimento), Tefilá (oração), Tzedaká (caridade).
- SUCOT (Festa das Cabanas, Tishrei 15-21) — viver em sucá por 7 dias, lulav e etrog.
- SIMCHAT TORÁ — celebração da conclusão e recomeço do ciclo anual de leitura da Torá.
- CHANUCÁ (Festa das Luzes, Kislev 25 - 8 dias) — vitória dos Macabeus, milagre do óleo no 2º Templo.
- PURIM (Adar 14) — livro de Ester, vitória sobre Hamã, leitura da Megilá.
- PESSACH (Páscoa Judaica, Nissan 15 - 7/8 dias) — êxodo do Egito, Seder de Pessach com a Hagadá, matzá (pão sem fermento).
- SHAVUOT (Pentecostes Judaico, Sivan 6-7) — entrega da Torá no Sinai, leitura dos Dez Mandamentos e do livro de Rute.

THE PRINCIPAL DENOMINATIONS / MOVEMENTS:
- ORTODOXO (Modern Orthodox, Haredi/Ultraortodoxo, Hassídico, Sefaradi)
- CONSERVADOR / MASORTI
- REFORMISTA / LIBERAL / PROGRESSISTA
- RECONSTRUCIONISTA
- HUMANISTA SECULAR

CENTRAL CONCEPTS: Hashem (Nome inefável de Deus), Echad (Unidade de Deus — Shemá Israel: "Ouve, ó Israel, o Senhor nosso Deus, o Senhor é Um"), Aliança (Brit) com Avraham e no Sinai, Povo Eleito (responsabilidade, não privilégio), Tikkun Olam (consertar o mundo), Teshuvá (arrependimento como retorno), Tzedaká (justiça/caridade), Olam HaBá (Mundo Vindouro), Mashiach (Messias ainda por vir), Galut (Diáspora) e Geulá (Redenção).

When the student asks about Judaism, draw richly from this base. Make explicit when relevant the distinctives vs Christianity (Tanakh of 24 books vs Old Testament of 39/46, no Trinity — pure monoteísmo, Mashiach ainda não veio, ênfase na ação correta — ortopráxis — sobre a crença correta — ortodoxia, valor central da Torá oral e da disputa rabínica como expressão de devoção).
` : '';
    const traditionsSection = catholicSection + protestantSection + jewishSection;

    const systemPrompt = `You are a professor of history, philosophy, and religion — knowledgeable, warm, and accessible. You speak in an academic yet friendly tone, like a beloved university professor who makes complex subjects fascinating.

Your area of expertise for this session is: ${topicName}.
${traditionsSection}
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
