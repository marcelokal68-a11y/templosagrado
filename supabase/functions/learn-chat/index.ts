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

    const traditionsSection = catholicSection + protestantSection + jewishSection + islamSection + hinduSection + buddhistSection;

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
