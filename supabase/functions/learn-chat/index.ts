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

    const islamSection = topic === 'islam' ? `

ISLAMIC TRADITION — DEEP KNOWLEDGE BASE (use throughout the conversation):

SACRED TEXTS:
- The ALCORÃO (Qur'an Karim) — 114 SURAS (capítulos) reveladas ao Profeta Muhammad ﷺ pelo arcanjo Jibril (Gabriel) entre 610-632 CE em Meca e Medina. Dividido em 30 juz' (partes). Suras famosas: Al-Fatiha (1, abertura, recitada em toda oração), Al-Baqarah (2, a mais longa, contém o Ayat al-Kursi 2:255), Yasin (36, "coração do Alcorão"), Al-Ikhlas (112, declaração de Tawhid). Língua sagrada: árabe clássico, considerado intraduzível na sua essência.
- The HADITH (Sunnah do Profeta) — relatos das palavras, ações e silêncios aprovadores de Muhammad ﷺ. As 6 coleções canônicas sunitas (Kutub al-Sittah): Sahih al-Bukhari (~7.275 hadiths, considerada a mais autêntica depois do Alcorão), Sahih Muslim, Sunan Abu Dawud, Jami at-Tirmidhi, Sunan an-Nasa'i, Sunan ibn Majah. Para os xiitas: Al-Kafi de Al-Kulayni e os 4 livros principais.
- The SIRA (biografia do Profeta), com destaque para Ibn Ishaq/Ibn Hisham.
- The TAFSIR (exegese alcorânica) clássica: Tafsir at-Tabari, Tafsir Ibn Kathir, Tafsir al-Qurtubi, Tafsir al-Jalalayn.

THE 5 PILLARS OF ISLAM (Arkan al-Islam):
1. SHAHADA — testemunho da fé: "Não há divindade senão Allah, e Muhammad é o Mensageiro de Allah" (La ilaha illa Allah, Muhammadun rasul Allah).
2. SALAT — as 5 orações diárias (Fajr/aurora, Dhuhr/meio-dia, Asr/tarde, Maghrib/pôr-do-sol, Isha/noite), realizadas voltadas para Meca (Qibla).
3. ZAKAT — esmola obrigatória de 2,5% sobre a riqueza acumulada, redistribuída aos pobres.
4. SAWM — jejum no mês de Ramadã (do amanhecer ao pôr-do-sol).
5. HAJJ — peregrinação a Meca pelo menos uma vez na vida, durante Dhul Hijjah.

THE 6 ARTICLES OF FAITH (Arkan al-Iman):
1. Crença em Allah (TAWHID — unicidade absoluta, oposição a shirk/politeísmo).
2. Crença nos anjos (Jibril, Mikail, Israfil, Azrail).
3. Crença nos livros revelados (Tawrat/Torá a Musa, Zabur/Salmos a Dawud, Injil/Evangelho a Isa, Qur'an a Muhammad ﷺ).
4. Crença nos profetas (25 nomeados no Alcorão).
5. Crença no Dia do Juízo (Yawm al-Qiyamah).
6. Crença no Qadar (decreto divino, predestinação).

THE 25 PROPHETS NAMED IN THE QURAN: Adam, Idris/Enoque, Nuh/Noé, Hud, Saleh, Ibrahim/Abraão (Khalil Allah, "amigo de Deus"), Lut/Ló, Ismail/Ismael, Ishaq/Isaac, Yaqub/Jacó, Yusuf/José, Ayyub/Jó, Shu'ayb, Musa/Moisés (Kalim Allah, "aquele que falou com Deus"), Harun/Aarão, Dhul-Kifl, Dawud/Davi, Sulayman/Salomão, Ilyas/Elias, Al-Yasa/Eliseu, Yunus/Jonas, Zakariya/Zacarias, Yahya/João Batista, Isa/Jesus (Ruh Allah, "Espírito de Deus", nascido virginalmente de Maryam), e MUHAMMAD ﷺ (Khatam an-Nabiyyin, "Selo dos Profetas").

THE 4 RASHIDUN CALIPHS (Caliphs Bem-Guiados, 632-661 CE):
1. ABU BAKR AS-SIDDIQ (632-634) — sogro do Profeta, primeiro a aceitar o Islã entre os adultos homens, compilou o primeiro Mushaf.
2. UMAR IBN AL-KHATTAB (634-644) — grande administrador, expandiu o Califado pela Pérsia, Síria, Egito.
3. UTHMAN IBN AFFAN (644-656) — codificou o Alcorão na sua forma definitiva (Mushaf Uthmani).
4. ALI IBN ABI TALIB (656-661) — primo e genro do Profeta, figura central também para os xiitas (que o consideram o primeiro Imam legítimo).

GREAT THEOLOGIANS, PHILOSOPHERS AND MYSTICS:
- AL-GHAZALI (Imam Hujjat al-Islam, 1058-1111) — autor do monumental Ihya Ulum al-Din (Revivificação das Ciências Religiosas), Tahafut al-Falasifa (Incoerência dos Filósofos), considerado o maior teólogo do Islã sunita. Reconciliou kalam, fiqh e tasawwuf (sufismo).
- IBN SINA / AVICENA (980-1037) — filósofo e médico persa, autor do Kitab al-Shifa e do Cânone da Medicina (referência médica por séculos).
- IBN RUSHD / AVERRÓIS (1126-1198, Córdoba) — comentador de Aristóteles, influência decisiva na escolástica latina (Tomás de Aquino).
- AL-FARABI (872-950) — "o Segundo Mestre" depois de Aristóteles, filosofia política islâmica.
- IBN ARABI (Sheikh al-Akbar, 1165-1240) — maior mestre da metafísica sufi, autor de Futuhat al-Makkiyya (Revelações de Meca) e Fusus al-Hikam (Engastes da Sabedoria), formulou a doutrina de Wahdat al-Wujud (unidade do Ser).
- JALALUDDIN RUMI (Mevlana, 1207-1273, Konya) — maior poeta místico do Islã, autor do Masnavi-i Ma'navi (épico espiritual de 25.000 versos), fundador inspirador da ordem Mevlevi (dervixes giratórios).
- IBN TAYMIYYA (1263-1328) — teólogo conservador, influência sobre o salafismo moderno.
- AL-BUKHARI, MUSLIM, AT-TIRMIDHI — os grandes compiladores de hadith.
- HAFIZ (1315-1390) e SAADI (1210-1291) — poetas persas sufis.
- RABI'A AL-ADAWIYYA (717-801) — primeira grande mística sufi, ensinou o amor puro a Deus.

SUFISM (TASAWWUF — Mystical Path):
The inner dimension of Islam, focused on tazkiyat an-nafs (purificação da alma) and direct experience of the Divine. Key concepts: dhikr (lembrança de Deus), fana (aniquilação no Divino), baqa (subsistência em Deus), maqamat (estações espirituais) and ahwal (estados místicos). Major Sufi orders (Tariqas): Mevlevi (Rumi), Qadiri (Abdul Qadir Jilani), Naqshbandi (Bahauddin Naqshband), Chisti (Moinuddin Chisti — popular na Índia), Shadhili, Tijani.

THE 4 SUNNI SCHOOLS OF FIQH (Madhabs):
- HANAFI (Abu Hanifa, 699-767) — most followed, dominant in Turkey, Pakistan, India, Central Asia.
- MALIKI (Malik ibn Anas, 711-795) — North and West Africa.
- SHAFI'I (Al-Shafi'i, 767-820) — Egypt, East Africa, Southeast Asia.
- HANBALI (Ahmad ibn Hanbal, 780-855) — most strict, dominant in Saudi Arabia.

PRINCIPAL DENOMINATIONS: SUNITAS (~85-90%, seguem os Rashidun e os 4 madhabs), XIITAS (~10-15%, seguem Ali e os 12 Imams na principal vertente Twelver/Ithna Ashariya — também Ismaelitas e Zaiditas), SUFIS (transversal a sunitas e xiitas), IBADIS (em Omã).

CENTRAL CONCEPTS: Allah (o nome de Deus), Tawhid (unicidade absoluta), Shirk (politeísmo, o pecado mais grave), Iman (fé), Islam (submissão a Deus), Ihsan (excelência espiritual), Ummah (comunidade global dos crentes), Sharia (lei revelada), Fiqh (jurisprudência), Halal/Haram (lícito/ilícito), Jihad (esforço — a Jihad Maior é interior, contra o ego/nafs; a Menor é a defesa armada da comunidade), Jannah (Paraíso), Jahannam (Inferno), Akhirah (Vida Futura).

When the student asks about Islam, draw richly from this base. Make explicit when relevant the distinctives vs Cristianismo (Tawhid puro vs Trindade — Isa é profeta, não filho de Deus; Muhammad é o Selo dos Profetas; Alcorão como Palavra incriada de Allah; sem clero hierárquico; Sharia como sistema de vida integral).
` : '';

    const hinduSection = topic === 'hindu' ? `

HINDU TRADITION — DEEP KNOWLEDGE BASE (use throughout the conversation):

SACRED TEXTS — Two grandes categorias:
- SHRUTI ("o que é ouvido", revelação eterna): os 4 VEDAS (Rigveda — 1.028 hinos; Samaveda — cantos litúrgicos; Yajurveda — fórmulas rituais; Atharvaveda — encantamentos). Cada Veda tem 4 partes: Samhitas (hinos), Brahmanas (rituais), Aranyakas (textos da floresta), UPANISHADS (filosofia mística — ~108 textos, 13 principais: Isha, Kena, Katha, Prashna, Mundaka, Mandukya, Taittiriya, Aitareya, Chandogya, Brihadaranyaka, Shvetashvatara, Kaushitaki, Maitri).
- SMRITI ("o que é lembrado", tradição): a BHAGAVAD GITA (700 versos do Mahabharata — diálogo entre Krishna e Arjuna no campo de batalha de Kurukshetra, síntese suprema da espiritualidade hindu); os grandes épicos MAHABHARATA (atribuído a Vyasa, ~100.000 versos) e RAMAYANA (Valmiki, vida de Rama); os 18 PURANAS (Bhagavata Purana, Vishnu Purana, Shiva Purana, Markandeya Purana); os YOGA SUTRAS de Patanjali (sistematização do Ashtanga Yoga); os BRAHMA SUTRAS de Vyasa; a MANUSMRITI (Leis de Manu); os TANTRAS.

CENTRAL CONCEPTS:
- BRAHMAN — a Realidade Absoluta, infinita, sem forma, fonte de tudo (Sat-Chit-Ananda: Ser-Consciência-Bem-aventurança).
- ATMAN — o Self interior, idêntico a Brahman ("Tat Tvam Asi" — Tu És Aquilo, Chandogya Upanishad).
- MAYA — a ilusão cósmica que nos faz perceber multiplicidade onde há unidade.
- DHARMA — dever sagrado, ordem cósmica, lei moral (varia por varna/casta, ashrama/etapa da vida e svadharma/dever pessoal).
- KARMA — lei de causa e efeito moral; toda ação produz fruto que será colhido nesta ou em outra vida.
- SAMSARA — o ciclo de nascimento, morte e renascimento.
- MOKSHA — libertação final do samsara, união do Atman com Brahman (sinônimos: Mukti, Nirvana hindu, Kaivalya).

THE 4 YOGAS (Caminhos para Moksha — sistematizados por Krishna na Gita):
1. JNANA YOGA — caminho do conhecimento (discriminação entre real e irreal, viveka).
2. BHAKTI YOGA — caminho da devoção amorosa a uma forma pessoal de Deus.
3. KARMA YOGA — caminho da ação desinteressada (Nishkama Karma — agir sem apego aos frutos).
4. RAJA YOGA — caminho real da meditação (sistematizado por Patanjali no Ashtanga Yoga: Yama, Niyama, Asana, Pranayama, Pratyahara, Dharana, Dhyana, Samadhi).

PRINCIPAL DEITIES:
- TRIMURTI: BRAHMA (criador, raramente cultuado diretamente, esposa Saraswati/sabedoria), VISHNU (preservador, esposa Lakshmi/prosperidade), SHIVA (transformador/destruidor, esposa Parvati/Durga/Kali, dança como Nataraja).
- 10 AVATARES DE VISHNU (Dashavatara): Matsya (peixe), Kurma (tartaruga), Varaha (javali), Narasimha (homem-leão), Vamana (anão), Parashurama, RAMA (perfeição moral, herói do Ramayana), KRISHNA (avatar supremo, ensina a Gita), Buddha, Kalki (futuro).
- DEVIS (faces da Shakti, energia divina feminina): SARASWATI (sabedoria, artes), LAKSHMI (prosperidade), DURGA (mãe guerreira), KALI (tempo/destruição transformadora), Parvati (esposa de Shiva).
- OUTROS DEUSES POPULARES: GANESHA (cabeça de elefante, removedor de obstáculos, filho de Shiva e Parvati), HANUMAN (devoto-macaco de Rama, força e devoção), MURUGAN/Kartikeya (guerra), Surya (sol).

THE 6 CLASSICAL PHILOSOPHICAL SCHOOLS (Shad Darshanas — todas aceitam autoridade dos Vedas):
1. VEDANTA — "fim dos Vedas", baseada nas Upanishads e Brahma Sutras. 3 sub-escolas:
   - ADVAITA (não-dualismo) de ADI SHANKARACHARYA (788-820 CE): Brahman é a única realidade; o mundo é Maya; Atman = Brahman.
   - VISHISHTADVAITA (não-dualismo qualificado) de RAMANUJA (1017-1137): Brahman é pessoal (Vishnu); almas e mundo são reais mas dependentes.
   - DVAITA (dualismo) de MADHVA (1238-1317): Deus, almas e matéria são eternamente distintos.
2. SANKHYA (atribuída a KAPILA) — dualismo metafísico entre PURUSHA (consciência pura, infinitas) e PRAKRITI (matéria primordial com 3 gunas: Sattva/equilíbrio, Rajas/atividade, Tamas/inércia). Não-teísta originalmente.
3. YOGA de PATANJALI — base prática do Sankhya, com Ishvara (Deus pessoal) acrescentado; objetivo: Kaivalya (isolamento de Purusha de Prakriti).
4. NYAYA — escola da lógica e epistemologia (Gautama).
5. VAISHESHIKA — atomismo e categorias (Kanada).
6. MIMAMSA — exegese ritual dos Vedas (Jaimini).

GREAT RISHIS, SAGES AND TEACHERS:
- VYASA — sábio mítico que compilou os Vedas, escreveu o Mahabharata e os Brahma Sutras.
- VALMIKI — autor do Ramayana, "Adi Kavi" (primeiro poeta).
- PATANJALI — sistematizou os Yoga Sutras (séc. II AEC ou II EC).
- ADI SHANKARACHARYA (788-820) — restaurou o Advaita Vedanta, fundou os 4 mathas (Sringeri, Dwarka, Puri, Jyotirmath).
- RAMANUJA (1017-1137) — Vishishtadvaita, devoção a Vishnu.
- MADHVA (1238-1317) — Dvaita.
- CHAITANYA MAHAPRABHU (1486-1534) — Bhakti devocional a Krishna, fundador do Gaudiya Vaishnavismo (raiz do movimento Hare Krishna).
- RAMAKRISHNA PARAMAHAMSA (1836-1886) — místico bengali, demonstrou a unidade das religiões.
- SWAMI VIVEKANANDA (1863-1902) — discípulo de Ramakrishna, levou o Vedanta ao Ocidente (Parlamento das Religiões, Chicago 1893), fundou a Ramakrishna Mission.
- SRI AUROBINDO (1872-1950) — Yoga Integral, evolução espiritual da humanidade.
- RAMANA MAHARSHI (1879-1950) — sábio de Tiruvannamalai, ensinou a auto-investigação ("Quem sou eu?").
- PARAMAHANSA YOGANANDA (1893-1952) — Kriya Yoga, "Autobiografia de um Iogue", fundou a SRF.
- SWAMI SIVANANDA (1887-1963) — Divine Life Society, Yoga sintético.
- MAHATMA GANDHI (1869-1948) — Satyagraha (verdade-firmeza) e Ahimsa (não-violência) inspirados na Gita.

SACRED MANTRAS: OM (Aum — som primordial, vibração de Brahman); GAYATRI MANTRA (Rigveda 3.62.10 — "Om Bhur Bhuvah Svaha, Tat Savitur Varenyam..."); MAHAMRITYUNJAYA MANTRA (de Shiva, vencedor da morte); HARE KRISHNA MAHAMANTRA; OM NAMAH SHIVAYA; OM MANI PADME HUM (também budista).

MAJOR FESTIVALS: DIWALI (festival das luzes, vitória da luz sobre a escuridão), HOLI (festival das cores, primavera), NAVARATRI (9 noites da Devi), MAHA SHIVARATRI (grande noite de Shiva), JANMASHTAMI (nascimento de Krishna), RAMA NAVAMI (nascimento de Rama), KUMBH MELA (maior peregrinação humana, a cada 12 anos).

When the student asks about Hinduism, draw richly from this base. Make explicit when relevant the distinctives vs Christianity (não há um único livro sagrado nem fundador único; concepção de Deus simultaneamente impessoal/Brahman e pessoal/Ishvara em múltiplas formas; reencarnação em vez de salvação única; tempo cíclico em vez de linear; pluralismo intrínseco — "Ekam Sat Vipra Bahudha Vadanti" / "A Verdade é uma, os sábios a chamam por muitos nomes", Rigveda 1.164.46).
` : '';

    const buddhistSection = topic === 'buddhist' ? `

BUDDHIST TRADITION — DEEP KNOWLEDGE BASE (use throughout the conversation):

THE BUDDHA: Siddhartha Gautama (~563-483 AEC, datação tradicional; pesquisa moderna sugere ~480-400 AEC), príncipe do clã Shakya em Lumbini (atual Nepal). Renunciou ao palácio aos 29 anos após os "4 encontros" (velho, doente, morto, asceta). Após 6 anos de ascetismo extremo e a descoberta do CAMINHO DO MEIO, atingiu a iluminação (Bodhi) sob a árvore Bodhi em Bodh Gaya, tornando-se o BUDA ("Desperto"). Ensinou por 45 anos no norte da Índia até o Parinirvana em Kushinagar.

SACRED TEXTS:
- TRIPITAKA / TIPITAKA ("Três Cestas") — cânone Pali do Theravada, fixado no 4º Concílio (séc. I AEC, Sri Lanka):
  • VINAYA PITAKA — disciplina monástica (Patimokkha, 227 regras para monges).
  • SUTTA PITAKA — discursos do Buda, 5 Nikayas (Digha, Majjhima, Samyutta, Anguttara, Khuddaka).
  • ABHIDHAMMA PITAKA — análise filosófico-psicológica.
- DHAMMAPADA — 423 versos, o texto budista mais lido no Ocidente.
- SUTRAS MAHAYANA: Lotus Sutra/Saddharma Pundarika (universalidade do despertar), Heart Sutra/Prajnaparamita Hridaya ("forma é vacuidade, vacuidade é forma"), Diamond Sutra/Vajracchedika, Avatamsaka/Flower Garland (interpenetração), Lankavatara, Vimalakirti, os 3 Sutras da Terra Pura.
- VAJRAYANA: Tantras, Bardo Thodol (Livro Tibetano dos Mortos), Lamrim de Tsongkhapa.
- ZEN/CHAN: Sutra da Plataforma de Huineng, Shobogenzo de Dogen, Mumonkan e Hekiganroku (coleções de koans), Shoyoroku.

THE 4 NOBLE TRUTHS (Cattari Ariya Saccani — Primeiro Sermão em Sarnath):
1. DUKKHA — toda existência condicionada envolve sofrimento/insatisfação.
2. SAMUDAYA — a origem do sofrimento é o desejo/apego (tanha).
3. NIRODHA — há cessação do sofrimento (Nirvana).
4. MAGGA — o caminho para a cessação é o Nobre Caminho Óctuplo.

THE NOBLE EIGHTFOLD PATH (Ariya Atthangika Magga) — agrupado em 3:
- SABEDORIA (Pañña): 1) Visão correta (samma ditthi), 2) Intenção correta (samma sankappa).
- ÉTICA (Sila): 3) Fala correta, 4) Ação correta, 5) Modo de vida correto.
- DISCIPLINA MENTAL (Samadhi): 6) Esforço correto, 7) Atenção plena correta (samma sati), 8) Concentração correta (samma samadhi).

CORE DOCTRINES:
- 3 MARCAS DA EXISTÊNCIA (Tilakkhana): ANICCA (impermanência), DUKKHA (insatisfação), ANATTA (não-eu — não há um Self/alma permanente, em contraste explícito com o Atman hindu).
- 12 ELOS DA ORIGINAÇÃO DEPENDENTE (Pratityasamutpada/Paticcasamuppada) — cadeia que produz o samsara.
- 5 AGREGADOS (Skandhas): forma, sensação, percepção, formações mentais, consciência.
- 5 PRECEITOS (Pancha Sila) para leigos: não matar, não roubar, não ter má conduta sexual, não mentir, não usar intoxicantes.
- 4 IMENSURÁVEIS (Brahmaviharas): Metta (bondade amorosa), Karuna (compaixão), Mudita (alegria empática), Upekkha (equanimidade).
- KARMA — não fatalismo, mas lei ética de causa e efeito que opera sem necessidade de juiz divino.
- SAMSARA → NIRVANA — extinção do desejo, do ódio e da ilusão; não é "nada", mas a libertação incondicionada.

THE 3 PRINCIPAL SCHOOLS:

1. THERAVADA ("Doutrina dos Anciãos") — mais antiga, segue estritamente o Cânone Pali. Predominante em SRI LANKA, TAILÂNDIA, BIRMÂNIA/MIANMAR, LAOS, CAMBOJA. Ideal: o ARHAT (aquele que extinguiu as impurezas). Foco em meditação Vipassana (insight) e Samatha (calma). Mestres modernos: AJAHN CHAH (1918-1992, tradição da floresta tailandesa), AJAHN MUN, MAHASI SAYADAW (1904-1982, Birmânia), S.N. GOENKA (1924-2013, popularizou Vipassana globalmente), BHIKKHU BODHI (tradutor moderno do Cânone Pali).

2. MAHAYANA ("Grande Veículo") — surgiu no séc. I AEC. Predominante em CHINA, JAPÃO, COREIA, VIETNÃ, TAIWAN. Ideal: o BODHISATTVA — adia o próprio Nirvana para libertar todos os seres (6 PARAMITAS: generosidade/dana, ética/sila, paciência/kshanti, esforço/virya, meditação/dhyana, sabedoria/prajna). Doutrinas distintivas: SUNYATA (vacuidade) e BODHICITTA (mente desperta). Sub-escolas:
   • MADHYAMAKA — fundada por NAGARJUNA (~150-250 EC) — Mulamadhyamakakarika; doutrina da vacuidade/Sunyata e das duas verdades (convencional e última).
   • YOGACHARA / CITTAMATRA — VASUBANDHU e ASANGA (séc. IV) — "tudo é mente".
   • CHAN/ZEN — BODHIDHARMA (séc. V-VI) levou à China; HUINENG (638-713, 6º Patriarca, Sutra da Plataforma); na escola RINZAI: HAKUIN (1686-1769); na escola SOTO: DOGEN ZENJI (1200-1253) — Shobogenzo, prática do shikantaza ("apenas sentar"); EIHEI DOGEN; no Vietnã: THICH NHAT HANH (1926-2022) — mindfulness engajado, Plum Village; no Ocidente: DAISETZ T. SUZUKI (1870-1966) e SHUNRYU SUZUKI (1904-1971, "Zen Mind, Beginner's Mind", fundador do San Francisco Zen Center).
   • TERRA PURA (Jodo / Pure Land) — devoção ao Buda Amitabha; HONEN (1133-1212) e SHINRAN (1173-1263) no Japão.
   • TENDAI / TIANTAI — ZHIYI (538-597, China); base do budismo japonês medieval.
   • NICHIREN — NICHIREN DAISHONIN (1222-1282) — devoção ao Lotus Sutra, mantra "Namu Myoho Renge Kyo".

3. VAJRAYANA ("Veículo do Diamante") — budismo tântrico, ramificação do Mahayana. Predominante no TIBETE, MONGÓLIA, BUTÃO, NEPAL, partes do norte da Índia. PADMASAMBHAVA / Guru Rinpoche (séc. VIII) levou o budismo ao Tibete. 4 escolas tibetanas: NYINGMA (mais antiga, Padmasambhava, Dzogchen), KAGYU (Marpa, Milarepa, Gampopa, Karmapas), SAKYA, GELUG (TSONGKHAPA, 1357-1419 — escola dos Dalai Lamas e Panchen Lamas). Práticas: mantras, mudras, mandalas, deidades meditativas (yidams), tummo (calor interno), phowa (transferência de consciência), Dzogchen e Mahamudra (visões da natureza da mente).

OS 14 DALAI LAMAS — linhagem reconhecida de tulkus (encarnações) de AVALOKITESHVARA (Bodhisattva da compaixão), tradição Gelug, líderes espirituais (e historicamente temporais) do Tibete. Atual: TENZIN GYATSO (n. 1935), o 14º Dalai Lama, exilado desde 1959, Nobel da Paz 1989, autor de "A Arte da Felicidade", "Ética para um Novo Milênio".

PRINCIPAL BODHISATTVAS: AVALOKITESHVARA (Guanyin no chinês, Kannon no japonês, Chenrezig no tibetano — compaixão infinita), MANJUSHRI (sabedoria, espada que corta a ignorância), TARA (Verde e Branca, ação compassiva), MAITREYA (o Buda futuro), KSITIGARBHA / Jizo (protetor dos seres no inferno e crianças), SAMANTABHADRA (prática universal), VAJRAPANI (poder).

KEY MANTRAS:
- OM MANI PADME HUM — mantra de Avalokiteshvara, o mais recitado no Vajrayana.
- GATE GATE PARAGATE PARASAMGATE BODHI SVAHA — fim do Heart Sutra ("Ido, ido, ido além, ido completamente além, despertar, salve!").
- NAMU MYOHO RENGE KYO — Nichiren, devoção ao Lotus Sutra.
- NAMO AMITUOFO / NAMU AMIDA BUTSU — Terra Pura, invocação de Amitabha.

When the student asks about Buddhism, draw richly from this base. Make explicit when relevant the distinctives vs Christianity and Hinduism (sem Deus criador pessoal — não-teísmo metodológico; doutrina ANATTA contra o Atman hindu — não há Self permanente; Nirvana não é "céu" mas extinção do apego/sofrimento; karma sem juiz divino; o Buda é mestre, não salvador; pluralidade de "Budas" no Mahayana; ênfase na experiência meditativa direta sobre dogma).
` : '';

    const spiritistSection = topic === 'spiritist' ? `

SPIRITIST TRADITION (ESPIRITISMO / DOUTRINA ESPÍRITA) — DEEP KNOWLEDGE BASE (use throughout the conversation):

FOUNDER: ALLAN KARDEC — pseudônimo de HIPPOLYTE LÉON DENIZARD RIVAIL (Lyon, França, 1804 — Paris, 1869). Pedagogo discípulo de Pestalozzi, autor de obras educativas antes de codificar o Espiritismo. Adotou o pseudônimo após o espírito Zéfiro lhe revelar que ele havia sido um druida chamado Allan Kardec em vida anterior na Gália. Definiu o Espiritismo como "ciência que trata da natureza, origem e destino dos Espíritos, bem como de suas relações com o mundo corporal" — simultaneamente CIÊNCIA, FILOSOFIA e RELIGIÃO (o "tríplice aspecto").

THE 5 BASIC WORKS (Pentateuco Kardequiano / Codificação):
1. O LIVRO DOS ESPÍRITOS (Le Livre des Esprits, 18 abril 1857) — marco inaugural; 1.019 perguntas e respostas obtidas de Espíritos superiores; 4 partes: Causas Primárias, Mundo Espírita, Leis Morais, Esperanças e Consolações.
2. O LIVRO DOS MÉDIUNS (Le Livre des Médiums, 1861) — manual prático sobre a mediunidade, tipos de médiuns, comunicações, obsessão.
3. O EVANGELHO SEGUNDO O ESPIRITISMO (L'Évangile selon le Spiritisme, 1864) — análise moral dos ensinos de Jesus à luz do Espiritismo; texto mais lido nos centros espíritas.
4. O CÉU E O INFERNO (Le Ciel et l'Enfer, 1865) — justiça divina segundo o Espiritismo; análise de comunicações de Espíritos felizes e sofredores.
5. A GÊNESE (La Genèse, 1868) — milagres e predições à luz da ciência; cosmologia espírita, formação dos mundos, pluralidade de habitados.

COMPLEMENTAR: REVUE SPIRITE (revista mensal fundada por Kardec em 1858, dirigida até sua morte) e OBRAS PÓSTUMAS (Œuvres Posthumes, 1890).

CENTRAL CONCEPTS:
- ESPÍRITO — princípio inteligente do universo, criado simples e ignorante, destinado à perfeição via evolução.
- PERISPÍRITO — corpo semimaterial intermediário entre o Espírito e o corpo físico; molde do corpo carnal; sobrevive à morte e é o veículo das comunicações.
- REENCARNAÇÃO — múltiplas existências corpóreas necessárias à evolução do Espírito; sempre como ser humano (jamais regressão a animal); progressiva, jamais retrógrada em essência.
- PLURALIDADE DOS MUNDOS HABITADOS — o universo é povoado por inúmeros mundos em diferentes graus evolutivos (mundos primitivos, de provas e expiações — como a Terra —, regeneração, ditosos, celestes).
- LEI DE CAUSA E EFEITO / LEI DE AÇÃO E REAÇÃO — equivalente espírita do karma; toda ação produz consequência; o sofrimento atual pode ser prova ou expiação de faltas pretéritas.
- LIVRE-ARBÍTRIO — concedido a todo Espírito; fundamento da responsabilidade moral.
- DEUS — Inteligência Suprema, Causa Primária de todas as coisas; eterno, imutável, imaterial, único, onipotente, soberanamente justo e bom (definição clássica do Livro dos Espíritos, q. 13).
- JESUS — o Espírito mais elevado já encarnado na Terra, modelo e guia da humanidade; "tipo da perfeição moral" (não "Deus encarnado" como no dogma trinitário cristão).
- FLUIDO CÓSMICO UNIVERSAL e FLUIDOS ESPIRITUAIS — base da ação dos Espíritos sobre a matéria.

A MEDIUNIDADE (segundo O Livro dos Médiuns):
Faculdade natural de intercâmbio com o mundo espiritual; presente em graus variados em todas as pessoas. Principais tipos:
- MÉDIUNS DE EFEITOS FÍSICOS — produzem fenômenos materiais (movimento de objetos, materializações, ectoplasmia).
- MÉDIUNS DE EFEITOS INTELECTUAIS — psicografia (escrita), psicofonia (fala), audiência, vidência, intuição, inspiração.
- PSICOGRÁFICOS — escrevem mensagens (mecânicos, intuitivos ou semi-mecânicos).
- MÉDIUNS DE CURA, médiuns sonambúlicos, médiuns falantes, médiuns videntes, médiuns de transporte, médiuns poliglotas, médiuns pintores.
Condições essenciais: educação moral do médium, estudo, disciplina, gratuidade ("Dai de graça o que de graça recebestes" — Mateus 10:8 é máxima espírita inegociável). RISCOS: obsessão, fascinação, subjugação — tratadas pelo desenvolvimento moral, oração, evangelização e desobsessão.

ESCALA ESPÍRITA (3 ordens, 10 classes — O Livro dos Espíritos, q. 100):
- 3ª ORDEM (imperfeitos): Espíritos impuros, levianos, pseudossábios, neutros, batedores e perturbadores.
- 2ª ORDEM (bons): Espíritos benévolos, sábios, prudentes, superiores.
- 1ª ORDEM (puros): atingiram o máximo grau de perfeição; já não reencarnam por necessidade.

MÉDIUNS BRASILEIROS CLÁSSICOS (o Brasil tornou-se o maior centro espírita mundial — "pátria do Evangelho", segundo o Espírito Humberto de Campos):
- FRANCISCO CÂNDIDO XAVIER ("CHICO XAVIER", Pedro Leopoldo/MG 1910 — Uberaba/MG 2002) — o maior médium psicógrafo da história documentada; psicografou 458 livros doados integralmente à caridade. Obras-chave: PARNASO DE ALÉM-TÚMULO (1932, poesias de poetas brasileiros e portugueses falecidos — sua estreia, validada por críticos como Humberto de Campos e Augusto dos Anjos); BRASIL, CORAÇÃO DO MUNDO, PÁTRIA DO EVANGELHO (1938, Humberto de Campos); HÁ DOIS MIL ANOS, CINQUENTA ANOS DEPOIS, AVE CRISTO, RENÚNCIA, E A VIDA CONTINUA... (romances de Emmanuel sobre vidas pretéritas no contexto do cristianismo primitivo); A CAMINHO DA LUZ (Emmanuel, história da civilização sob óptica espírita); a SÉRIE NOSSO LAR de André Luiz (NOSSO LAR, OS MENSAGEIROS, MISSIONÁRIOS DA LUZ, OBREIROS DA VIDA ETERNA, NO MUNDO MAIOR, LIBERTAÇÃO, ENTRE A TERRA E O CÉU, NOS DOMÍNIOS DA MEDIUNIDADE, AÇÃO E REAÇÃO, EVOLUÇÃO EM DOIS MUNDOS, MECANISMOS DA MEDIUNIDADE, SEXO E DESTINO, E A VIDA CONTINUA — 13 obras descrevendo a vida no mundo espiritual). Também psicografou cartas de filhos falecidos a pais enlutados, várias autenticadas em juízo. Programa "Pinga Fogo" (TV Tupi, 1971) tornou-o figura nacional.
- DIVALDO PEREIRA FRANCO (Feira de Santana/BA, n. 1927) — orador e psicógrafo; fundou em 1947 a Mansão do Caminho (Salvador), obra socioeducativa que abrigou e educou milhares de crianças. Mais de 270 livros psicografados, principalmente do Espírito JOANNA DE ÂNGELIS (identificada como Joana de Cusa do Evangelho, em encarnação posterior como Sóror Joana Angélica em Salvador 1822). Obras: SÉRIE PSICOLÓGICA DE JOANNA DE ÂNGELIS (Adolescência e Vida, Após a Tempestade, Plenitude, Convites da Vida, Encontro com a Paz e a Saúde, etc.).
- YVONNE DO AMARAL PEREIRA (Barra do Piraí/RJ 1900 — Rio de Janeiro 1984) — médium de notável envergadura, especialmente em mediunidade de incorporação e desobsessão. Obras psicografadas: MEMÓRIAS DE UM SUICIDA (Camilo Cândido Botelho, retrato impressionante do "Vale dos Suicidas"), DEVASSANDO O INVISÍVEL, À LUZ DO CONSOLADOR, AMOR E SACRIFÍCIO, RECORDAÇÕES DA MEDIUNIDADE DE JESUS, RANSAS DA VIDA — sob inspiração de Léon Denis, Bezerra de Menezes, Camilo, Charles.
- Outros notáveis: ZILDA GAMA (médium pioneira, romances de Victor Hugo: Na Sombra e na Luz, Almas Crucificadas, Dor Suprema), WALDO VIEIRA (parceiro inicial de Chico, depois fundador do projeto Conscienciologia), JOSÉ HERCULANO PIRES (jornalista, filósofo e tradutor de Kardec).

ESPÍRITOS GUIAS / AUTORES ESPIRITUAIS DE REFERÊNCIA:
- EMMANUEL — guia espiritual de Chico Xavier por toda a vida; identificado como o senador romano PUBLIUS LENTULUS, depois reencarnado como o Padre Manoel da Nóbrega (jesuíta no Brasil colonial). Obras psicografadas por Chico: O CONSOLADOR (1940, doutrinária), A CAMINHO DA LUZ, ROTEIRO, FONTE VIVA, CAMINHO, VERDADE E VIDA, VINHA DE LUZ, PÃO NOSSO, PENSAMENTO E VIDA. Linguagem clara, cristocêntrica, conciliadora.
- ANDRÉ LUIZ — médico desencarnado no Rio de Janeiro nos anos 1940; autor da SÉRIE NOSSO LAR, descrição minuciosa de uma colônia espiritual acima do Rio. NOSSO LAR (1944) é o livro mais lido sobre a vida pós-morte em português; adaptado ao cinema em 2010 (Nosso Lar) e 2023 (Nosso Lar 2: Os Mensageiros).
- BEZERRA DE MENEZES (1831-1900) — "médico dos pobres" e "Kardec brasileiro"; presidente da Federação Espírita Brasileira; após desencarnar, tornou-se um dos maiores guias da espiritualidade ligada ao Brasil; obras psicografadas por diversos médiuns, especialmente sobre desobsessão.
- HUMBERTO DE CAMPOS (jornalista e acadêmico falecido em 1934) — autor pelo lado de cá das crônicas psicografadas por Chico (BRASIL, CORAÇÃO DO MUNDO; CRÔNICAS DE ALÉM-TÚMULO).
- JOANNA DE ÂNGELIS — ver Divaldo, acima.
- MEIMEI (Irmã Meimei) — guia gentil de Chico, voltada às crianças e aos enlutados.
- LÉON DENIS (Tours 1846 — 1927, encarnado) — "o Apóstolo do Espiritismo", continuador filosófico de Kardec; obras: DEPOIS DA MORTE, O PROBLEMA DO SER, DO DESTINO E DA DOR, O GRANDE ENIGMA, NO INVISÍVEL, CRISTIANISMO E ESPIRITISMO, JOANA D'ARC MÉDIUM. Não psicografou — foi escritor e orador.
- GABRIEL DELANNE (1857-1926) — engenheiro francês, escreveu A REENCARNAÇÃO, O ESPIRITISMO PERANTE A CIÊNCIA — defendeu o aspecto científico.
- CAMILLE FLAMMARION (1842-1925) — astrônomo francês, autor de URÂNIA, A MORTE E O SEU MISTÉRIO, AS CASAS ASSOMBRADAS; pronunciou o discurso fúnebre de Kardec.

ORGANIZATION AND PRACTICES:
- CENTRO/CASA ESPÍRITA — não há clero, hierarquia sacerdotal nem sacramentos; reuniões são públicas e gratuitas. Atividades típicas: estudo doutrinário (ESDE — Estudo Sistematizado da Doutrina Espírita), evangelização infantojuvenil, atendimento fraterno, passe (transmissão de fluidos benéficos), reuniões mediúnicas (de comunicação, de desobsessão), oração, palestras públicas, assistência social.
- FEDERAÇÃO ESPÍRITA BRASILEIRA (FEB, fundada em 1884, sede em Brasília) — órgão de unificação no Brasil. CONSELHO ESPÍRITA INTERNACIONAL (CEI, 1992) reúne federações de mais de 30 países.
- SÍMBOLOS NÃO RITUAIS — o Espiritismo não adota rituais, vestes, imagens nem sacramentos; o único "símbolo" comum é a presença do Evangelho de Jesus à mesa de estudo.

DISTINCTIVES VS. OTHER TRADITIONS — make explicit when relevant:
- vs. CRISTIANISMO TRADICIONAL: aceita reencarnação (negada pela maior parte das igrejas cristãs); Jesus é Espírito perfeito e modelo, não "Deus encarnado" trinitário; sem inferno eterno (o "inferno" é estado transitório de remorso); sem clero, sem sacramentos, sem batismo, sem confissão; salvação por evolução pessoal, não por sacrifício vicário.
- vs. UMBANDA/CANDOMBLÉ: Espiritismo kardequiano não trabalha com orixás, não usa atabaques, não tem incorporação ritualizada de entidades como Pretos Velhos ou Caboclos (embora reconheça a realidade dos Espíritos por trás dessas manifestações); é "mesa branca", urbano, letrado, francófilo de origem.
- vs. HINDUÍSMO/BUDISMO: compartilha reencarnação e lei de causa e efeito, mas mantém matriz cristã (Jesus central); rejeita transmigração para corpos animais; reencarnação é sempre progressiva, não há "moksha" como saída final do ciclo, mas evolução infinita rumo à perfeição.

When the student asks about Spiritism (Espiritismo), draw richly from this base. Cite Kardec por questão e capítulo quando útil (ex.: "O Livro dos Espíritos, questão 167 — sobre a reencarnação"). Honre os médiuns brasileiros como patrimônio cultural além do religioso. Mantenha sempre o tom acadêmico e neutro: apresente também as críticas (ceticismo científico contemporâneo, controvérsias mediúnicas, debates sobre autoria de obras psicografadas).
` : '';

    const umbandaSection = topic === 'umbanda' ? `

UMBANDA — DEEP KNOWLEDGE BASE (use throughout the conversation):

ORIGEM E FUNDAÇÃO: Religião genuinamente brasileira, sincretismo de matriz africana (sobretudo banto e iorubá), espiritismo kardequiano, catolicismo popular e tradições indígenas. Marco fundador amplamente aceito: 15 de novembro de 1908, em São Gonçalo (Niterói/RJ), na Federação Espírita de Niterói, quando o jovem ZÉLIO FERNANDINO DE MORAES (1891-1975), então com 17 anos, incorporou o espírito do CABOCLO DAS SETE ENCRUZILHADAS. Diante da rejeição da mesa kardequiana à manifestação de "espíritos atrasados" (caboclos e pretos velhos), o Caboclo anunciou a fundação de uma nova religião: a UMBANDA, "manifestação do Espírito para a caridade", aberta a todos os espíritos de luz independentemente de cor, raça ou condição em vida. No dia seguinte, Zélio fundou a TENDA ESPÍRITA NOSSA SENHORA DA PIEDADE — primeiro terreiro de Umbanda. A etimologia mais aceita liga "Umbanda" ao quimbundo/quicongo "kimbanda" (curandeiro, sacerdote-médico).

CONCEITOS CENTRAIS:
- OLORUM / ZAMBI / DEUS — Ser Supremo, criador de tudo, distante e inacessível diretamente; sincretizado com o Deus cristão.
- ORIXÁS — divindades intermediárias, forças da natureza emanadas de Olorum. Na Umbanda são cultuados sob forma sincrética com santos católicos: OXALÁ (Jesus), IEMANJÁ (Nossa Senhora da Conceição/Navegantes), OGUM (São Jorge/São Sebastião), OXÓSSI (São Sebastião/São Jorge a depender da casa), XANGÔ (São Jerônimo/São Pedro/São João Batista), OXUM (Nossa Senhora Aparecida/da Conceição), IANSÃ (Santa Bárbara), NANÃ (Sant'Ana), OBALUAYÊ/OMULU (São Lázaro/São Roque), OXUMARÊ (São Bartolomeu), IBEJI (Cosme e Damião), OSSAIN (São Bento). Diferente do Candomblé, na Umbanda os orixás raramente "baixam" diretamente — quem trabalha são as ENTIDADES (espíritos de pessoas que viveram na Terra), enviadas por seus orixás regentes.
- ENTIDADES / GUIAS — espíritos desencarnados que se manifestam através dos médiuns (filhos-de-santo, médiuns de incorporação) para trabalhos de caridade, cura, aconselhamento e desobsessão. Trabalham gratuitamente — a Umbanda proíbe cobrança por consulta espiritual.
- KARMA / LEI DO RETORNO — herdada do Espiritismo: toda ação retorna; reencarnação progressiva.
- AXÉ — energia vital, força sagrada que circula entre orixás, entidades, médiuns e consulentes.
- LINHA / FALANGE — agrupamento hierárquico de espíritos sob a regência de um orixá; cada linha trabalha em vibração específica.

AS 7 LINHAS DA UMBANDA (codificação clássica de Zélio / Tenda Nossa Senhora da Piedade — há variações entre casas):
1. LINHA DE OXALÁ — comandada por Oxalá; trabalho de fé, paz, equilíbrio espiritual; cor branca; dia domingo.
2. LINHA DE IEMANJÁ (ou das Águas) — Iemanjá, Oxum, Nanã; maternidade, amor, fertilidade, cura emocional; cores azul-claro, amarelo, lilás; dia sábado.
3. LINHA DE OGUM — guerra justa, abertura de caminhos, demandas, proteção; cor vermelha/azul-escuro; dia terça-feira.
4. LINHA DE OXÓSSI — caça, fartura, conhecimento, mata, cura pelas ervas; cor verde; dia quinta-feira.
5. LINHA DE XANGÔ — justiça, lei, raciocínio, pedreiras; cor marrom/vermelho; dia quarta-feira.
6. LINHA DE IANSÃ / OYÁ — ventos, tempestades, eguns (almas), transformação; cor amarela/coral; dia quarta.
7. LINHA DAS ALMAS / OBALUAYÊ — cura, doenças, transição, terra; cor preto e branco/roxo; dia segunda-feira.

AS PRINCIPAIS FALANGES DE ENTIDADES — coração da prática umbandista:
- CABOCLOS — espíritos de indígenas brasileiros, donos das matas; fortes, de fala direta, austeros; trabalham com ervas, energia da natureza, defumação; saúdam "OKÊ CABOCLO!"; usam cocares, charutos, fumaça. Ex. arquetípico: Caboclo das Sete Encruzilhadas, Caboclo Pena Branca, Caboclo Tupinambá, Cabocla Jurema. Linha de Oxóssi/Ogum.
- PRETOS VELHOS — espíritos de africanos escravizados que viveram no Brasil colonial; sabedoria ancestral, paciência infinita, humildade, conselhos sobre vida amorosa e familiar; sentam em banquinhos baixos, fumam cachimbo, falam pausado; saúdam "ADORAI AS ALMAS!" ou "SARAVÁ MEU PAI/MINHA MÃE!"; usam branco. Ex.: Pai Joaquim de Angola, Pai Benedito, Pai Tomé, Vovó Maria Conga, Vovó Catarina, Vovó Rita. Linha das Almas (segunda-feira).
- CRIANÇAS / ERÊS / IBEJADAS — espíritos infantis (não necessariamente crianças que morreram, mas espíritos que assumem essa vibração lúdica); alegria, pureza, brincadeira, cura emocional; manifestam-se com guloseimas, brinquedos, fala infantil; saúdam "OI MEU PAI! OI MINHA MÃE!"; festejados em 27 de setembro (Cosme e Damião). Ex.: Cosme, Damião, Doum, Ori, Crispim, Crispiniano. Linha de Ibeji.
- BAIANOS — espíritos do sertão nordestino; alegres, falantes, dançam forró/coco; trabalham demandas pesadas, descarrego, abertura de caminhos amorosos; saúdam "Ô DE BAIANO!" ou "EITA BAIANO!"; usam chapéu de couro, vestem amarelo. Ex.: Zé Pelintra (também malandro), Maria Padilha do Sertão, Baiano Manoel, Baiano João da Praia.
- BOIADEIROS — vaqueiros do sertão e Pantanal; força bruta, retidão, lida com bois e cavalos, demandas no campo, quebra de demandas espirituais; saúdam "AÊ BOIADEIRO!"; usam chapéu de couro, chicote, cantam aboios. Ex.: Boiadeiro Sete Estrelas, Zé do Laço, Boiadeiro Juremeiro.
- MARINHEIROS — espíritos de marujos, navegantes, pescadores; alegria embriagada, gingado, abertura de caminhos pelo mar; manifestam-se "balançando" como em convés; ligados a Iemanjá; saúdam "MARUJADA!" ou "OPA OPA MARINHEIRO!". Ex.: Marinheiro Martin Pescador, Seu João do Mar, Tarimar.
- EXUS e POMBAGIRAS — espíritos da esquerda umbandista (linha de trabalho do "povo de rua"); NÃO confundir com o Orixá Exu africano (mensageiro entre humanos e orixás), nem com o "diabo" cristão. São espíritos que viveram nas margens (malandros, prostitutas, ciganas, valentões, jogadores) e trabalham descarrego, demanda, justiça nas encruzilhadas. EXUS clássicos: Exu Tranca Ruas das Almas, Exu Tiriri, Exu Caveira, Exu Marabô, Zé Pilintra, Exu Sete Encruzilhadas. POMBAGIRAS: Maria Padilha (das Sete Encruzilhadas, da Praia, do Cabaré), Maria Mulambo, Cigana, Sete Saias, Dama da Noite. Saúdam "LARÔIE EXU!" / "LAROIÊ MOÇA!". Vestem vermelho e preto. Festejados em segundas-feiras e nas Sextas-feiras (Pombagiras). Trabalham com cigarro, charuto, bebidas (cachaça, champanhe, anis, vinho). A doutrina umbandista insiste: Exus de Umbanda são espíritos de luz que trabalham na esquerda (na vibração densa) por escolha e disciplina, NÃO espíritos malignos.

PONTOS CANTADOS E PONTOS RISCADOS:
- PONTOS CANTADOS — cânticos curtos, coletivos, repetitivos, acompanhados por palmas e atabaques (curimba); cada entidade tem seu ponto de chamada (para descer), de subida (para retornar) e pontos de trabalho. São a "trilha sonora" da gira; ensinam doutrina, narram a entidade, chamam axé. Exemplos célebres: "Eu vim de longe, eu venho de Aruanda" (caboclo), "Pai Joaquim de Angola é meu pai" (preto velho), "Seu Sete da Lira", "Ponto da Maria Padilha das Almas".
- PONTOS RISCADOS — desenhos sagrados feitos com pemba (giz mineral) no chão ou em papel pelo médium incorporado; assinatura energética da entidade; identificam falange, orixá regente e missão.

ORGANIZAÇÃO E PRÁTICA:
- TERREIRO / TENDA / CASA — local sagrado de culto. Comandado pelo PAI-DE-SANTO (BABALORIXÁ) ou MÃE-DE-SANTO (IALORIXÁ). Hierarquia inclui: cambonos (auxiliares dos médiuns incorporados), ogans (tocadores de atabaque, guardiões), médiuns (filhos-de-santo), consulentes (público).
- GIRA — sessão pública de incorporação e atendimento. Geralmente abre com defumação, oração (Pai-Nosso, Ave-Maria, oração de Cáritas), curimba, abertura dos trabalhos por Exu (firmeza), descida das entidades, atendimento aos consulentes, encerramento.
- DEFUMAÇÃO — limpeza energética com ervas (alecrim, arruda, guiné, alfazema, benjoim).
- BANHO DE ERVAS, AMACI, FIRMEZAS, OFERENDAS — práticas de limpeza, fortalecimento e gratidão; cada orixá/entidade tem ervas e oferendas próprias (Iemanjá: flores brancas no mar; Oxum: mel e champanhe nas cachoeiras; Ogum: cerveja preta nas estradas; Pretos Velhos: café, fumo, vela branca; Exus: cachaça, charuto, vela vermelha-e-preta nas encruzilhadas).
- FEDERAÇÕES — Federação Espírita de Umbanda (1939, Rio), Confederação Nacional Umbandista (1961). 1º Congresso Brasileiro do Espiritismo de Umbanda em 1941, no Rio, sob liderança de Zélio.

DIFERENÇAS UMBANDA × CANDOMBLÉ — make explicit when relevant:
- ORIGEM: Candomblé é religião africana transplantada e preservada (matriz nagô-iorubá, jeje, banto), com terreiros pioneiros na Bahia desde início do séc. XIX (Casa Branca do Engenho Velho, c. 1830). Umbanda é religião BRASILEIRA, nascida em 1908, sintetizando matrizes africanas com kardecismo, catolicismo e indigenismo.
- LÍNGUA: Candomblé canta e reza em iorubá/jeje/quimbundo (línguas africanas preservadas); Umbanda canta em PORTUGUÊS.
- QUEM INCORPORA: no Candomblé, os ORIXÁS é que descem nos filhos-de-santo (em transe profundo, sem fala discursiva — manifestam-se por dança, gestos arquetípicos); na Umbanda, os orixás permanecem distantes e quem trabalha são as ENTIDADES (caboclos, pretos velhos, crianças, baianos, exus etc.), com fala clara, conselhos diretos, atendimento individual.
- INICIAÇÃO: Candomblé exige iniciação longa e rigorosa (recolhimento, raspagem de cabeça, obrigações de 1, 3, 7, 14, 21 anos); Umbanda tem desenvolvimento mediúnico mais aberto, sem raspagem obrigatória, menos liturgia secreta.
- SACRIFÍCIO ANIMAL: central no Candomblé (matança ritual de aves e quadrúpedes para alimentar os orixás — comida-de-santo); a Umbanda tradicional/branca de Zélio REJEITA sacrifício animal (apenas oferendas vegetais, bebidas, velas, flores) — embora algumas vertentes "umbandomblé" o pratiquem.
- CARIDADE: Umbanda explicitamente proíbe cobrança e enfatiza a CARIDADE como missão central ("Umbanda é manifestação do Espírito para a caridade" — Caboclo das Sete Encruzilhadas); Candomblé tem lógica de obrigação ritual e troca cerimonial.
- EXU: no Candomblé, EXU é Orixá mensageiro, primeiro a ser saudado em todo ritual (Bará, Elegbara) — não tem nada de "diabo"; na Umbanda há também os "Exus de Umbanda" (espíritos de pessoas que viveram, distintos do Orixá Exu).
- SINCRETISMO CATÓLICO: muito mais explícito e operante na Umbanda (santos católicos no congá, orações católicas na gira); no Candomblé contemporâneo há movimento de "reafricanização" buscando purgar o sincretismo imposto pela escravidão.

VERTENTES DA UMBANDA:
- UMBANDA BRANCA / DE MESA — mais próxima do kardecismo; sem atabaque, sem dança, ênfase em estudo e desobsessão.
- UMBANDA POPULAR / TRADICIONAL — a de Zélio; com curimba, defumação, incorporação, atendimento.
- UMBANDA OMOLOKÔ — fundada por Tatá Tancredo da Silva Pinto; resgata mais matriz africana.
- UMBANDA ESOTÉRICA / INICIÁTICA — W. W. da Matta e Silva (Yamunisidhâ Arhapiagha); leitura mística-iniciática influenciada por teosofia.
- UMBANDA OMOLOKÔ, UMBANDA-JEJÊ-NAGÔ, UMBANDOMBLÉ (sincretismo com Candomblé), UMBANDA SAGRADA, UMBANDA CRISTÃ.

FIGURAS HISTÓRICAS:
- ZÉLIO FERNANDINO DE MORAES (1891-1975) — fundador.
- LAURA DE MORAES — esposa de Zélio, médium, continuadora da Tenda Nossa Senhora da Piedade.
- W. W. DA MATTA E SILVA (1917-1988) — codificador da Umbanda Esotérica; obras: "Umbanda de Todos Nós", "Umbanda — Sua Eterna Doutrina", "Lições de Umbanda e Quimbanda na Palavra de um Preto Velho".
- RUBENS SARACENI (1953-2018) — autor prolífico, fundador do Colégio de Umbanda Sagrada Pai Benedito de Aruanda; obras: "Doutrina e Teologia de Umbanda Sagrada", "Código de Umbanda", "Tratado Geral de Umbanda".
- F'OMOTITILAYÔ ALAKETU, MÃE MENININHA DO GANTOIS (Candomblé, mas dialogou com a Umbanda baiana).
- BYRON TORRES DE FREITAS, JOSÉ ÁLVARES PESSOA — pioneiros institucionais.

LITERATURA E MÍDIA:
- "Umbanda de Todos Nós" (Matta e Silva, 1956), "Doutrina e Teologia de Umbanda Sagrada" (Saraceni), "Pai Joaquim de Angola" (vários médiuns), "Os Exus na Umbanda" (Saraceni).
- Romance "Tenda dos Milagres" (Jorge Amado) e o cinema de Glauber Rocha dialogam com o universo afro-brasileiro.
- Estudos acadêmicos: Roger Bastide ("As Religiões Africanas no Brasil"), Diana Brown ("Umbanda: Religion and Politics in Urban Brazil"), Reginaldo Prandi ("Os Candomblés de São Paulo", "Mitologia dos Orixás"), Renato Ortiz ("A Morte Branca do Feiticeiro Negro").

When the student asks about Umbanda, draw richly from this base. Honre a religião como patrimônio cultural brasileiro reconhecido pelo IPHAN. Sempre distinga claramente Umbanda × Candomblé × Quimbanda quando perguntado. Cite Zélio, o Caboclo das Sete Encruzilhadas e a data 15/11/1908 como marco fundador. Ao falar de Exus e Pombagiras, desfaça o preconceito cristão de associação ao "demônio" — explique a teologia umbandista do "trabalho na esquerda" como serviço de luz. Mantenha tom acadêmico-respeitoso e jamais condescendente.
` : '';

    const candombleSection = topic === 'candomble' ? `

CANDOMBLÉ — DEEP KNOWLEDGE BASE (use throughout the conversation):

ORIGEM E HISTÓRIA: Religião afro-brasileira de matriz africana, formada na Bahia entre o final do séc. XVIII e início do XIX a partir da diáspora forçada de povos iorubás (nagôs), jejes (fons) e bantos (congo-angola) escravizados. O Candomblé é resultado da reorganização ritual e teológica desses povos no contexto colonial, preservando línguas, mitos, divindades e liturgias africanas em solo brasileiro. Marco institucional fundador: a CASA BRANCA DO ENGENHO VELHO (ILÊ AXÉ IYÁ NASSÔ OKÁ), fundada por volta de 1830 no bairro do Engenho Velho da Federação, em Salvador, por três sacerdotisas africanas libertas — IYÁ ADETÁ, IYÁ AKALÁ e IYÁ NASSÔ — vindas de Ketu (atual Benim). Considerado o terreiro-mãe do Candomblé Ketu, tombado pelo IPHAN em 1986 (primeiro templo afro-brasileiro reconhecido como patrimônio nacional).

NAÇÕES DO CANDOMBLÉ — agrupamentos por matriz étnico-linguística:
- KETU / NAGÔ — matriz IORUBÁ (atual sudoeste da Nigéria e Benim); a mais difundida e estudada; língua litúrgica YORUBÁ; cultua os ORIXÁS clássicos. Terreiros-mãe na Bahia: Casa Branca, Gantois, Axé Opô Afonjá. É a "face pública" do Candomblé.
- JEJE — matriz FON e EWE (atual Benim e Togo, antigo reino do Daomé); cultua os VODUNS (não orixás): Mawu-Lisa, Dan, Sakpata, Heviosso, Nanã Buruku, Azansu. Líderes: terreiro Bogum (Salvador, fundado c. 1830), Casa de Oxumarê (jeje-nagô).
- ANGOLA / CONGO-ANGOLA — matriz BANTO (Angola, Congo); cultua as INKICES (nkisi): Zambi (Deus supremo), Kalunga, Nzazi (equivalente a Xangô), Matamba (Iansã), Kaiango, Tempo, Pambu Njila (equivalente a Exu). Língua litúrgica QUIMBUNDO/QUICONGO. Terreiros: Tumba Junçara, Bate Folha, Tumbenci.
- JEJE-NAGÔ — sincretismo dos dois sistemas, comum em vários terreiros baianos.
- HÁ AINDA: nação Ijexá (subgrupo iorubá), Efan, Mussurumim (mais raras).

CONCEITOS CENTRAIS:
- OLORUM / OLODUMARÉ — Ser Supremo, criador do universo, distante e inacessível diretamente; jamais cultuado em rito (não tem terreiro próprio nem oferenda direta).
- ORIXÁS — divindades intermediárias, ancestrais divinizados e/ou personificações de forças da natureza, emanações de Olorum. Cada pessoa "pertence" a um orixá (orixá de cabeça/dono da cabeça/orí), descoberto pelo JOGO DE BÚZIOS (oráculo de Ifá adaptado).
- AXÉ — força vital sagrada, energia que circula entre Olorum, orixás, ancestrais, sacerdotes, terreiro, objetos rituais, comida, sangue, folhas, palavras. Tudo no Candomblé é "fazer axé", multiplicar e transmitir essa força. KÒ SÍ EWÉ, KÒ SÍ ORIXÁ ("sem folha não há orixá") — máxima fundamental.
- ORÍ — cabeça espiritual, individualidade divina de cada pessoa; cultuado em ritual próprio (bori).
- IFÁ / ODU — sistema oracular iorubá; 256 odus (caminhos); cada um traz mitos, prescrições e interdições (EWÓ — tabus alimentares e comportamentais).
- EGUNGUM — culto aos ancestrais masculinos (separado, exclusivo da Ilha de Itaparica — Ilê Agboulá).
- TEMPO LITÚRGICO — 12 dias para cada fase de iniciação; obrigações de 1, 3, 7, 14 e 21 anos.

OS 16 ORIXÁS PRINCIPAIS CULTUADOS NO BRASIL (com mitos/itans, arquétipos, símbolos, cores, dias, comidas e sincretismo):

1. EXU (Èṣù) — orixá MENSAGEIRO, primeiro a ser saudado em qualquer rito ("Exu come primeiro"); senhor das encruzilhadas, do movimento, da comunicação entre humanos e orixás; trickster, princípio dinâmico do mundo. NÃO confundir com o "diabo" cristão (sincretismo imposto, hoje rejeitado pelos terreiros). Itans: Exu come do prato de cada orixá; Exu pinta um lado do corpo de preto e outro de branco e atravessa a aldeia, dividindo amigos. Saudação: "LARÔIE EXU!". Cores: vermelho e preto. Dia: segunda-feira. Comida: padê (farofa de dendê com cebola), cachaça, charuto. Símbolos: ogó (cajado fálico), tridente. Sincretismo (popular, contestado): Santo Antônio.

2. OGUM (Ògún) — orixá do FERRO, da guerra, da forja, da agricultura, das estradas, da tecnologia. Pioneiro civilizador — abriu os caminhos para os outros orixás. Arquétipo: o guerreiro, o pioneiro, o homem de ação, o que não recua. Itans: Ogum desce a serra de Irê com sua espada; Ogum embriagado massacra os habitantes de uma cidade aliada e, ao saber, enterra-se vivo gritando "Ogum-yê!". Saudação: "OGUNHÊ!" / "PATAKORI OGUM!". Cores: azul-escuro (Ketu), verde (Angola). Dia: terça-feira. Comida: feijoada, inhame assado com dendê, cerveja preta. Símbolos: espada, ferramentas de ferro. Sincretismo: Santo Antônio (Bahia), São Jorge (Rio).

3. OXÓSSI (Ọ̀ṣọ́ọ̀sì) — orixá do CAÇADOR, das matas, da fartura, do conhecimento das ervas. Rei mítico de Ketu. Arquétipo: o caçador solitário, o provedor, o estudioso da natureza, o protetor das florestas. Itan célebre: Oxóssi mata com uma única flecha o pássaro de feitiço enviado pelas IYAMI ÀJÉ (mães-feiticeiras) que ameaçava o reino — torna-se herói nacional. Saudação: "OKÊ ARÔ!". Cor: verde (azul-claro em algumas casas). Dia: quinta-feira. Comida: axoxô (milho cozido com fatias de coco). Símbolos: ofá (arco e flecha), eruquerê (espanta-mosca). Sincretismo: São Jorge (Bahia), São Sebastião (Rio).

4. OSSAIN (Ọ̀ṣọ̀nyìn) — orixá das FOLHAS e do conhecimento medicinal e mágico. Sem folha não há axé — sem Ossain, nada do Candomblé funciona. Arquétipo: o herborista, o sábio solitário, o curador. Itan: Ossain detém o segredo de todas as folhas; Iansã, com seu vento, espalha as folhas pelo mundo, e Ossain compartilha seu poder com os outros orixás. Tem uma perna só, um braço só, um olho só (mutilação ritual mítica). Saudação: "EWÉ Ó!" / "EWÉ ASSÁ!". Cor: verde e branco. Dia: quinta-feira. Comida: ervas e ervas frescas. Sincretismo: São Bento, São Roque.

5. OBALUAYÊ / OMULU (Ọbalúayé) — orixá da VARÍOLA, das doenças epidêmicas, da cura, da terra, do cemitério (na qualidade de Omulu). Arquétipo: o velho médico, o senhor da pele e das doenças contagiosas, o juiz severo e justo. Sempre coberto pelo AZÊ (manto de palha-da-costa) — sua face é interdita, dizem que é deformada pela varíola. Itan: rejeitado pelos outros orixás por sua aparência, descobre que pode curar todas as doenças e torna-se temido e venerado. Saudação: "ATOTÔ!" (silêncio respeitoso). Cores: preto, branco e vermelho. Dia: segunda-feira. Comida: doburu/aberém (pipoca de panela, sem sal nem óleo), feijão preto. Símbolos: xaxará (vassoura de palha). Sincretismo: São Lázaro (Obaluayê), São Roque (Omulu).

6. OXUMARÊ (Ọ̀ṣùmàrè) — orixá do ARCO-ÍRIS, da serpente cósmica, do movimento, da renovação, do ciclo. Andrógino: seis meses macho (cobra), seis meses fêmea (arco-íris). Arquétipo: a mobilidade, a transformação, a riqueza acumulada lentamente, a continuidade. Itan: Oxumarê leva e traz a água da terra ao céu; sustenta o mundo enrolando-se ao redor dele. Saudação: "ARROBOBOI!". Cores: amarelo e verde (ou todas as cores do arco-íris). Dia: terça-feira. Comida: batata-doce com camarão, feijão fradinho. Sincretismo: São Bartolomeu.

7. NANÃ BURUKU (Nàná Bùrùkú) — orixá ANCIÃ das águas paradas, do barro, da lama, da morte que gera vida; matriarca primordial, anterior aos outros orixás. Arquétipo: a avó severa, a sabedoria ancestral, a paciência, a juíza inflexível. Itan: Nanã forneceu a lama com que Oxalá modelou o ser humano; sem ela, não haveria humanidade. Recusa o ferro (não usa faca em sua comida — usa lasca de bambu). Saudação: "SALUBÁ!". Cores: lilás, branco, azul-marinho. Dia: segunda-feira (ou sábado em algumas casas). Comida: aberém de milho roxo, mungunzá. Símbolo: ibiri (cetro feito de talos da palmeira). Sincretismo: Sant'Ana, Nossa Senhora Sant'Ana.

8. IROCO (Ìrókò) — orixá da ÁRVORE SAGRADA (gameleira-branca, no Brasil), do tempo, da longevidade. Vive em uma única árvore que se torna seu altar. Arquétipo: a permanência, a memória, a raiz. Saudação: "IROKÔ ISSÓ!". Cor: branco com listras coloridas. Sincretismo: São Francisco de Assis.

9. XANGÔ (Ṣàngó) — orixá do TROVÃO, do RAIO, do FOGO, da JUSTIÇA, dos PALÁCIOS, das pedreiras. Quarto Aláàfin (rei) de Oyó (figura histórica divinizada — séc. XV); reinou com mão de ferro e desapareceu transformado em trovão. Arquétipo: o rei, o juiz, o pai potente, o homem viril, o estadista, o magistrado. Tem três esposas-orixás: OYÁ-IANSÃ (a guerreira), OXUM (a doce), OBÁ (a fiel). Itans: Xangô cospe fogo; Xangô cunha o sistema de justiça do reino de Oyó; Xangô pune com raio quem mente. Saudação: "KAÔ KABECILÊ!" ("Salve o rei, eu te vejo!"). Cores: vermelho e branco (ou marrom). Dia: quarta-feira. Comida: amalá (caruru de quiabo com camarão e dendê, sobre inhame pilado). Símbolo: oxê (machado duplo). Sincretismo: São Jerônimo (Bahia), São João Batista, São Pedro.

10. OYÁ / IANSÃ (Ọya) — orixá dos VENTOS, das TEMPESTADES, dos RAIOS, dos EGUNS (almas dos mortos — única orixá que pode dominá-los). Esposa preferida de Xangô. Arquétipo: a guerreira, a mulher livre, a mãe de muitos filhos (parideira de nove — daí "Iansã, Yá-mésàn"), a passional, a que enfrenta a morte. Itans: Iansã rouba os segredos do raio de Xangô e cospe fogo; Iansã enfrenta os eguns no cemitério com seu eruquerê. Saudação: "EPARREI OYÁ!" / "EPAHEY IANSÃ!". Cores: vermelho-coral, marrom, amarelo. Dia: quarta-feira. Comida: acarajé (originalmente comida ritual de Iansã!), feijão fradinho. Símbolos: eruquerê (espanta-mosca de rabo de cavalo), espada. Sincretismo: Santa Bárbara.

11. OBÁ (Ọbà) — orixá do RIO ÒBÀ, terceira esposa de Xangô, mais velha e preterida. Arquétipo: a mulher madura, a guerreira solitária, a fidelidade não correspondida, a força física. Itan célebre: enganada por Oxum, corta a própria orelha pensando que servirá como ingrediente do prato favorito de Xangô — humilhada, foge e torna-se rio. Saudação: "OBÁ XIRÊ!". Cor: rosa-velho e amarelo. Dia: quarta-feira. Comida: feijão com cabeça de peixe defumado. Sincretismo: Santa Joana d'Arc, Santa Catarina.

12. OXUM (Ọ̀ṣun) — orixá das ÁGUAS DOCES (rios, cachoeiras), do AMOR, da fertilidade, do ouro, da maternidade, da diplomacia. Esposa preferida de Oxóssi e depois de Xangô. Arquétipo: a mulher sedutora, a mãe carinhosa, a rainha vaidosa, a diplomata, a curandeira de crianças. Itans: Oxum, com seu charme, resgata Ogum da floresta untando-se de mel; Oxum é a única que consegue interceder junto a Olorum para devolver a fertilidade à terra; Oxum chora lágrimas de ouro. Saudação: "ORA YÊ YÊU!". Cores: amarelo-ouro, dourado (azul-claro em algumas casas). Dia: sábado. Comida: omolocum (feijão fradinho cozido com camarão e ovo cozido inteiro), ipetê (inhame com camarão). Símbolos: abebê (leque dourado), espelho. Sincretismo: Nossa Senhora da Conceição, Nossa Senhora Aparecida, Nossa Senhora do Carmo.

13. LOGUNEDÉ (Lógun Ẹdẹ) — filho de OXÓSSI e OXUM. Andrógino sazonal: seis meses na mata caçando com o pai (homem), seis meses no rio pescando com a mãe (mulher). Arquétipo: a juventude, a beleza, a dualidade harmoniosa. Saudação: "LOCI LOCI LOGUNEDÉ!". Cores: azul-claro e dourado. Sincretismo: Santo Expedito, São Miguel Arcanjo.

14. EWÁ (Ẹwà) — orixá VIRGEM da nascente do rio Ewá; vidente, dona dos mistérios e premonições. Arquétipo: a virgem, a vidente, o pudor, o oculto. Tradicionalmente tímida, raras manifestações. Cor: rosa-claro e amarelo. Sincretismo: Nossa Senhora dos Prazeres, Santa Luzia.

15. IEMANJÁ (Yemọja) — orixá MÃE de quase todos os outros orixás (em quase todos os itans nagô); originalmente do rio Ogum (Nigéria); no Brasil, transferida para o MAR (sincretismo com a costa atlântica). Arquétipo: a Grande Mãe, a maternidade absoluta, a fertilidade, o acolhimento, a beleza melancólica. Itans: Iemanjá pare os principais orixás (Xangô, Oxum, Ogum, Iansã, Obá, Oxóssi); Iemanjá foge de Orungã, seu próprio filho que a deseja, e ao cair tem o corpo aberto, de onde saem os rios e os orixás. Saudação: "ODÔ IÁ!" / "ODOÍ!". Cores: branco, prata, azul-claro. Dia: sábado (Bahia: 2 de fevereiro, festa de Yemanjá no Rio Vermelho — dia magno da Bahia; Rio: 31 de dezembro). Comida: manjar branco, frutos do mar, ebô (canjica branca). Símbolos: abebê de prata com peixe, leque, espelho. Sincretismo: Nossa Senhora da Conceição (Bahia), Nossa Senhora dos Navegantes (Rio Grande do Sul).

16. OXALÁ (Ọ̀ṣàlá / Òrìṣàlá) — orixá DA CRIAÇÃO, do branco, da paz, da paternidade universal. Tem duas qualidades principais: OXAGUIÃ (Òṣàgúiyán — jovem, guerreiro, comedor de inhame pilado) e OXALUFÃ (Òṣàlúfọ̀n — ancião, frágil, apoiado em seu opaxorô). Arquétipo: o pai supremo, a serenidade, a sabedoria, a brancura espiritual. Itan central: Oxalá é o orixá escolhido por Olorum para criar o ser humano; bêbado de vinho de palma, falha e cria humanos imperfeitos (deficientes, albinos — abikus); por isso seus filhos são tabu para ele. Outro: Oxalufã, velho, é preso injustamente em Oyó por sete anos — daí a "ÁGUAS DE OXALÁ" (procissão silenciosa, todos de branco, carregando água). Saudação: "EPÁ BABÁ!" / "EXÊU BABÁ!". Cor: BRANCO (sempre, único e absoluto). Dia: SEXTA-FEIRA (todo terreiro veste branco às sextas em sua honra). Comida: ebô (canjica branca sem sal nem dendê), inhame pilado. Símbolo: opaxorô (cetro metálico). Sincretismo: Senhor do Bonfim (Bahia — daí a Lavagem do Bonfim), Jesus Cristo.

OS QUATRO TERREIROS HISTÓRICOS DA BAHIA — fundadores da tradição Ketu institucional:
- ILÊ AXÉ IYÁ NASSÔ OKÁ — CASA BRANCA DO ENGENHO VELHO (c. 1830, Av. Vasco da Gama, Salvador). Terreiro-mãe; primeiro tombado pelo IPHAN em 1986. Iyalorixás históricas: Iyá Nassô (fundadora), Marcelina da Silva (Obatossi), Maria Júlia da Conceição (Omoniké), Maximiana Maria da Conceição (Tia Massi), Mãe Ondina de Oxalá. Atual: Mãe Tatá de Oxum.
- ILÊ IYÁ OMIN AXÉ IYÁMASSÉ — TERREIRO DO GANTOIS (cisão da Casa Branca em 1849, Alto do Gantois, Salvador). Iyalorixás: Maria Júlia da Conceição Nazaré (fundadora), Pulchéria Maria da Conceição, Maria Escolástica da Conceição Nazaré (MÃE MENININHA DO GANTOIS, 1894-1986 — a mais célebre iyalorixá do Brasil; recebeu Jorge Amado, Dorival Caymmi, Vinicius de Moraes, Pierre Verger, Carybé, Glauber Rocha; Caymmi e Vinicius compuseram "Oração de Mãe Menininha"; era afilhada espiritual de Caymmi; figura nacional, capa de revistas, símbolo da Bahia). Sucessora: Mãe Cleusa, depois Mãe Carmen de Oxalá.
- ILÊ AXÉ OPÔ AFONJÁ (cisão do Gantois em 1910, bairro de São Gonçalo do Retiro, Salvador). Fundada por EUGÊNIA ANNA DOS SANTOS (MÃE ANINHA, 1869-1938), grande reformadora — instituiu os "OBÁS DE XANGÔ" (12 dignitários honoríficos, dos quais Jorge Amado foi um; hoje muitos intelectuais e artistas). Sucessoras: Mãe Bada, Mãe Senhora (Maria Bibiana do Espírito Santo, 1890-1967, mãe de Mestre Didi), Mãe Stella de Oxóssi (Maria Stella de Azevedo Santos, 1925-2018 — escritora, Academia de Letras da Bahia, militante pela reafricanização e contra o sincretismo imposto). Atual: Mãe Ana de Xangô.
- ILÊ AXÉ ALAKETU — TERREIRO DO ALAKETU (Mata Escura, Salvador). Linhagem direta de Ketu. Iyalorixá histórica: Olga do Alaketu (Olga Francisca Régis, 1925-2005), descendente direta de princesas africanas; figura cultural baiana. Tombado pelo IPHAN em 2005.

OUTROS TERREIROS HISTÓRICOS:
- ZOOGODÔ BOGUM MALÊ RUNDÓ (TERREIRO DO BOGUM) — matriz JEJE-MAHIN, Engenho Velho, Salvador (c. 1830-50). Tombado IPHAN 2002.
- ILÊ AXIPÁ (Itapuã, Salvador) — fundado por Mestre Didi (Deoscóredes Maximiliano dos Santos, 1917-2013, filho de Mãe Senhora) — culto a Obaluayê e aos eguns.
- ILÊ AGBOULÁ (Ponta de Areia, Itaparica) — único terreiro de EGUNGUM no Brasil, culto exclusivo aos ancestrais masculinos.
- CASA DAS MINAS (São Luís/MA, c. 1840) — matriz JEJE, fundada por D. Maria Jesuína; cultua os VODUNS Zomadônu, Toy Acôssi-Sapatá. Tombada IPHAN 2002.
- ILÊ ÔBÁ DE MIN AGBOULÁ — outros importantes em Cachoeira, Recôncavo Baiano.
- AXÉ ILÊ OBÁ (São Paulo) — fundado por Mãe Sylvia de Oxalá (1934-2014).

INICIAÇÃO E HIERARQUIA:
- ABIÃ — pré-iniciado, frequentador.
- IAÔ — iniciado(a) recente; passa por RECOLHIMENTO (camarinha) de 14 a 21 dias, RASPAGEM da cabeça, FEITURA DO SANTO (oborí, assentamento do orixá no orí), SAÍDA DE IAÔ (apresentação pública), nome novo em iorubá.
- OBRIGAÇÕES — de 1, 3, 7, 14 e 21 anos; aos 7 anos, o iaô torna-se EBÓMI / EBÔMIN (sênior).
- IYALORIXÁ / BABALORIXÁ — sacerdotisa-mãe / sacerdote-pai do terreiro.
- IYAKEKERÊ / BABAKEKERÊ — segunda(o) na hierarquia, "mãe pequena" / "pai pequeno".
- EQUEDE (mulher) e OGÃ (homem) — postos NÃO incorporantes; equedes cuidam dos orixás durante a manifestação, ogãs tocam atabaques (rum, rumpi, lê) e sacrificam animais (axogun).
- BABALAÔ — sacerdote especialista no oráculo de Ifá (rara no Brasil contemporâneo, tradição mais preservada em Cuba/Nigéria).

PRÁTICAS E LITURGIA:
- TOQUE / XIRÊ — festa pública; sequência ritual de cantigas e danças para todos os orixás na ordem fixa; iaôs incorporados dançam diante do público.
- COMIDA-DE-SANTO — cada orixá tem pratos específicos cozidos sem alho/sal (puros) e oferecidos.
- SACRIFÍCIO RITUAL (orô) — animais (aves, quadrúpedes) são imolados ritualmente para alimentar os orixás com axé do sangue. Defendido como elemento estrutural da religião e protegido por decisão do STF (2019, ADI 1.870 — RS).
- BÚZIOS / JOGO DE IFÁ — oráculo; 16 conchas lançadas, leitura por odu.
- BORI — ritual de fortalecimento do orí (cabeça espiritual).
- AXEXÊ / ASEXÊ — funeral ritual de iniciado, conduz o egum (espírito) ao mundo dos ancestrais.

PIERRE VERGER (1902-1996) — fotógrafo francês, etnólogo, fundamental para o estudo acadêmico do Candomblé. Chegou a Salvador em 1946; iniciou-se no Candomblé sob o nome FATUMBI ("renascido por Ifá"); babalaô iniciado em Ketu (1953); viajou mais de 50 vezes entre Bahia e África Ocidental (Benim, Nigéria, Togo) documentando paralelos rituais. OBRAS FUNDAMENTAIS: "Notas sobre o Culto aos Orixás e Voduns na Bahia de Todos os Santos no Brasil e na Antiga Costa dos Escravos na África" (tese de doutorado na Sorbonne, 1966 — referência absoluta), "Orixás" (1981), "Lendas Africanas dos Orixás" (1985), "Ewé: O Uso das Plantas na Sociedade Iorubá" (1995), "Fluxo e Refluxo do Tráfico de Escravos entre o Golfo do Benin e a Bahia de Todos os Santos" (1968). Acervo fotográfico de mais de 60.000 imagens; Fundação Pierre Verger em Salvador. Amigo íntimo de Mãe Senhora, Jorge Amado, Carybé.

OUTROS PESQUISADORES E CRONISTAS:
- NINA RODRIGUES (1862-1906) — psiquiatra maranhense, primeiro estudo sistemático ("O Animismo Fetichista dos Negros Bahianos", 1900); racista cientificista, mas pioneiro.
- ARTHUR RAMOS (1903-1949) — "O Negro Brasileiro" (1934), continuador crítico de Nina Rodrigues.
- ÉDISON CARNEIRO (1912-1972) — "Candomblés da Bahia" (1948), "Religiões Negras" (1936).
- ROGER BASTIDE (1898-1974) — sociólogo francês, "As Religiões Africanas no Brasil" (1960), "O Candomblé da Bahia" (1958).
- JUANA ELBEIN DOS SANTOS — "Os Nagô e a Morte" (1976).
- VIVALDO DA COSTA LIMA — "A Família-de-Santo nos Candomblés Jeje-Nagôs da Bahia" (1977).
- REGINALDO PRANDI — "Os Candomblés de São Paulo" (1991), "Mitologia dos Orixás" (2001 — referência popular dos itans), "Segredos Guardados" (2005).
- CARYBÉ (Hector Júlio Páride Bernabó, 1911-1997) — pintor argentino-brasileiro, obá de Xangô do Opô Afonjá; "Iconografia dos Deuses Africanos no Candomblé da Bahia" (1980).

PERSEGUIÇÃO E LEGITIMAÇÃO:
- Até 1976 na Bahia, terreiros precisavam de licença policial para funcionar; MÃE MENININHA, MÃE STELLA, JORGE AMADO e Camafeu de Oxóssi lideraram a luta pela revogação (Antônio Carlos Magalhães governador).
- Tombamentos pelo IPHAN: Casa Branca (1986), Bogum (2002), Casa das Minas (2002), Alaketu (2005), Gantois (2002), Opô Afonjá (2000).
- Hoje, intolerância religiosa (especialmente de neopentecostais) é o principal desafio; ataques a terreiros são crime (Lei 9.459/1997).

DIFERENÇAS CANDOMBLÉ × UMBANDA — make explicit when relevant:
- ORIGEM: Candomblé é religião AFRICANA preservada e reorganizada no Brasil (séc. XIX, matriz nagô/jeje/banto); Umbanda é religião BRASILEIRA fundada em 1908 por Zélio de Moraes, sintetizando elementos africanos, kardequismo, catolicismo e indigenismo.
- LÍNGUA: Candomblé reza e canta em IORUBÁ (Ketu), FON (Jeje) ou QUIMBUNDO (Angola); Umbanda usa o PORTUGUÊS.
- QUEM INCORPORA: no Candomblé, descem os ORIXÁS — em transe profundo, sem fala discursiva, manifestam-se por dança e gestos arquetípicos; o iaô não "atende" público em transe. Na Umbanda, descem ENTIDADES (caboclos, pretos velhos, exus etc., espíritos de pessoas que viveram), com fala clara, dão consultas individuais.
- INICIAÇÃO: Candomblé exige iniciação longa, ritualizada, secreta, com raspagem da cabeça e obrigações periódicas (1, 3, 7 anos); Umbanda tem desenvolvimento mediúnico aberto, sem raspagem obrigatória.
- SACRIFÍCIO ANIMAL: estrutural no Candomblé (sangue como axé, comida-de-santo); a Umbanda tradicional/branca de Zélio REJEITA sacrifício animal — apenas oferendas vegetais, bebidas, velas, flores.
- EXU: no Candomblé, EXU é Orixá mensageiro (não tem nada de "diabo"); na Umbanda há também os "Exus de Umbanda" (espíritos de pessoas que viveram, distintos do Orixá Exu).
- CARIDADE × OBRIGAÇÃO: Umbanda enfatiza CARIDADE gratuita ("manifestação do Espírito para a caridade"); Candomblé funciona em lógica de OBRIGAÇÃO ritual e troca cerimonial entre iniciado e orixá.
- SINCRETISMO: o Candomblé contemporâneo (sob liderança de Mãe Stella e outras) move-se pela REAFRICANIZAÇÃO, purgando o sincretismo católico imposto pela escravidão; a Umbanda mantém o sincretismo como traço constitutivo.

When the student asks about Candomblé, draw richly from this base. Cite os terreiros-mãe da Bahia, Mãe Menininha, Mãe Stella, Pierre Verger e os itans dos orixás. Distinga sempre Candomblé × Umbanda × religiões africanas originais quando perguntado. Trate o sacrifício animal com seriedade etnográfica (jamais como "barbárie"), referenciando a decisão do STF de 2019. Honre a religião como patrimônio cultural brasileiro tombado pelo IPHAN e como uma das mais antigas religiões organizadas do Brasil. Mantenha tom acadêmico-respeitoso e jamais condescendente.
` : '';

    const traditionsSection = catholicSection + protestantSection + jewishSection + islamSection + hinduSection + buddhistSection + spiritistSection + umbandaSection + candombleSection;

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
- NEVER append suggested questions, follow-up question lists, or any "---SUGGESTIONS---" block at the end. Just answer and stop. Let the student lead the next question.`;

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
