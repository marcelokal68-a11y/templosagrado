// Starter questions per tradition for /learn study sessions.
// Shown as clickable chips when the user enters a tradition,
// hidden once the user sends their first manual message.

type Lang = 'pt-BR' | 'en' | 'es';

type StarterSet = Record<Lang, string[]>;

const STARTERS: Record<string, StarterSet> = {
  // ===== Religions =====
  christian: {
    'pt-BR': [
      'Quem é Jesus Cristo segundo os Evangelhos?',
      'O que significa "amar ao próximo como a si mesmo"?',
      'Como o Cristianismo enxerga o sofrimento?',
      'Qual a diferença entre Antigo e Novo Testamento?',
      'O que é o Reino de Deus?',
    ],
    en: [
      'Who is Jesus Christ according to the Gospels?',
      'What does "love your neighbor as yourself" mean?',
      'How does Christianity view suffering?',
      'What is the difference between Old and New Testament?',
      'What is the Kingdom of God?',
    ],
    es: [
      '¿Quién es Jesucristo según los Evangelios?',
      '¿Qué significa "amar al prójimo como a ti mismo"?',
      '¿Cómo ve el Cristianismo el sufrimiento?',
      '¿Cuál es la diferencia entre Antiguo y Nuevo Testamento?',
      '¿Qué es el Reino de Dios?',
    ],
  },
  catholic: {
    'pt-BR': [
      'Por que os católicos rezam para Maria?',
      'O que são os 7 sacramentos?',
      'Qual o papel do Papa na Igreja?',
      'O que é o Purgatório?',
      'Diferença entre fé e obras na salvação católica',
    ],
    en: [
      'Why do Catholics pray to Mary?',
      'What are the 7 sacraments?',
      'What is the role of the Pope in the Church?',
      'What is Purgatory?',
      'Difference between faith and works in Catholic salvation',
    ],
    es: [
      '¿Por qué los católicos rezan a María?',
      '¿Cuáles son los 7 sacramentos?',
      '¿Cuál es el papel del Papa en la Iglesia?',
      '¿Qué es el Purgatorio?',
      'Diferencia entre fe y obras en la salvación católica',
    ],
  },
  protestant: {
    'pt-BR': [
      'O que foi a Reforma Protestante?',
      'Quem foi Martinho Lutero?',
      'O que significam as 5 Solas?',
      'Diferença entre protestantes e católicos',
      'Por que existem tantas denominações protestantes?',
    ],
    en: [
      'What was the Protestant Reformation?',
      'Who was Martin Luther?',
      'What do the 5 Solas mean?',
      'Difference between Protestants and Catholics',
      'Why are there so many Protestant denominations?',
    ],
    es: [
      '¿Qué fue la Reforma Protestante?',
      '¿Quién fue Martín Lutero?',
      '¿Qué significan las 5 Solas?',
      'Diferencia entre protestantes y católicos',
      '¿Por qué hay tantas denominaciones protestantes?',
    ],
  },
  mormon: {
    'pt-BR': [
      'Quem foi Joseph Smith?',
      'O que é o Livro de Mórmon?',
      'Diferença entre mórmons e cristãos tradicionais',
      'O que acontece em um templo mórmon?',
      'Por que os mórmons fazem missão de 2 anos?',
    ],
    en: [
      'Who was Joseph Smith?',
      'What is the Book of Mormon?',
      'Difference between Mormons and traditional Christians',
      'What happens in a Mormon temple?',
      'Why do Mormons serve a 2-year mission?',
    ],
    es: [
      '¿Quién fue Joseph Smith?',
      '¿Qué es el Libro de Mormón?',
      'Diferencia entre mormones y cristianos tradicionales',
      '¿Qué sucede en un templo mormón?',
      '¿Por qué los mormones hacen una misión de 2 años?',
    ],
  },
  jewish: {
    'pt-BR': [
      'Qual a diferença entre Torá Escrita e Torá Oral?',
      'Por que o Shabat é tão importante?',
      'O que é Tikun Olam?',
      'Diferença entre Ortodoxos, Conservadores e Reformistas',
      'Como os judeus enxergam o Messias?',
    ],
    en: [
      'What is the difference between Written and Oral Torah?',
      'Why is Shabbat so important?',
      'What is Tikkun Olam?',
      'Difference between Orthodox, Conservative and Reform',
      'How do Jews view the Messiah?',
    ],
    es: [
      '¿Cuál es la diferencia entre Torá Escrita y Torá Oral?',
      '¿Por qué el Shabat es tan importante?',
      '¿Qué es Tikún Olam?',
      'Diferencia entre Ortodoxos, Conservadores y Reformistas',
      '¿Cómo ven los judíos al Mesías?',
    ],
  },
  islam: {
    'pt-BR': [
      'Quais são os 5 pilares do Islã?',
      'Diferença entre Sunismo e Xiismo',
      'Por que os muçulmanos rezam 5 vezes ao dia?',
      'O que é o Hajj e por que é obrigatório?',
      'Como o Alcorão foi revelado?',
    ],
    en: [
      'What are the 5 pillars of Islam?',
      'Difference between Sunni and Shia',
      'Why do Muslims pray 5 times a day?',
      'What is the Hajj and why is it obligatory?',
      'How was the Quran revealed?',
    ],
    es: [
      '¿Cuáles son los 5 pilares del Islam?',
      'Diferencia entre Sunismo y Chiismo',
      '¿Por qué los musulmanes rezan 5 veces al día?',
      '¿Qué es el Hajj y por qué es obligatorio?',
      '¿Cómo fue revelado el Corán?',
    ],
  },
  hindu: {
    'pt-BR': [
      'Como pode haver milhões de deuses se Brahman é um?',
      'O que é karma e como funciona?',
      'Diferença entre as 6 escolas (Darshanas)',
      'O que são os 4 estágios da vida (Ashramas)?',
      'Por que a vaca é sagrada?',
    ],
    en: [
      'How can there be millions of gods if Brahman is one?',
      'What is karma and how does it work?',
      'Difference between the 6 schools (Darshanas)',
      'What are the 4 life stages (Ashramas)?',
      'Why is the cow sacred?',
    ],
    es: [
      '¿Cómo puede haber millones de dioses si Brahman es uno?',
      '¿Qué es el karma y cómo funciona?',
      'Diferencia entre las 6 escuelas (Darshanas)',
      '¿Cuáles son las 4 etapas de la vida (Ashramas)?',
      '¿Por qué la vaca es sagrada?',
    ],
  },
  buddhist: {
    'pt-BR': [
      'Quais são as 4 Nobres Verdades?',
      'O que é o Nobre Caminho Óctuplo?',
      'Diferença entre Theravada, Mahayana e Vajrayana',
      'Como pode haver renascimento sem alma (anatman)?',
      'O que é a meditação Vipassana?',
    ],
    en: [
      'What are the 4 Noble Truths?',
      'What is the Noble Eightfold Path?',
      'Difference between Theravada, Mahayana and Vajrayana',
      'How can there be rebirth without a soul (anatman)?',
      'What is Vipassana meditation?',
    ],
    es: [
      '¿Cuáles son las 4 Nobles Verdades?',
      '¿Qué es el Noble Óctuple Sendero?',
      'Diferencia entre Theravada, Mahayana y Vajrayana',
      '¿Cómo puede haber renacimiento sin alma (anatman)?',
      '¿Qué es la meditación Vipassana?',
    ],
  },
  spiritist: {
    'pt-BR': [
      'Quem foi Allan Kardec?',
      'O que é a reencarnação segundo Kardec?',
      'Como funciona o passe espírita?',
      'Diferença entre Espiritismo e Umbanda',
      'O que são os planos espirituais?',
    ],
    en: [
      'Who was Allan Kardec?',
      'What is reincarnation according to Kardec?',
      'How does the Spiritist passe work?',
      'Difference between Spiritism and Umbanda',
      'What are the spiritual planes?',
    ],
    es: [
      '¿Quién fue Allan Kardec?',
      '¿Qué es la reencarnación según Kardec?',
      '¿Cómo funciona el pase espírita?',
      'Diferencia entre Espiritismo y Umbanda',
      '¿Qué son los planos espirituales?',
    ],
  },
  umbanda: {
    'pt-BR': [
      'Quem foi Zélio Fernandino de Moraes?',
      'Quais são as 7 linhas da Umbanda?',
      'Diferenças entre Umbanda e Candomblé',
      'O que é uma Gira?',
      'Quem são os Pretos Velhos?',
    ],
    en: [
      'Who was Zélio Fernandino de Moraes?',
      'What are the 7 lines of Umbanda?',
      'Differences between Umbanda and Candomblé',
      'What is a Gira?',
      'Who are the Pretos Velhos?',
    ],
    es: [
      '¿Quién fue Zélio Fernandino de Moraes?',
      '¿Cuáles son las 7 líneas de la Umbanda?',
      'Diferencias entre Umbanda y Candomblé',
      '¿Qué es una Gira?',
      '¿Quiénes son los Pretos Velhos?',
    ],
  },
  candomble: {
    'pt-BR': [
      'Quem foi Mãe Menininha do Gantois?',
      'Conte o itan da criação por Oxalá',
      'Diferença entre Ketu, Jeje e Angola',
      'O que é uma feitura de santo?',
      'Quem foi Pierre Verger?',
    ],
    en: [
      'Who was Mãe Menininha do Gantois?',
      'Tell the itan of creation by Oxalá',
      'Difference between Ketu, Jeje and Angola',
      'What is a "feitura de santo"?',
      'Who was Pierre Verger?',
    ],
    es: [
      '¿Quién fue Mãe Menininha del Gantois?',
      'Cuenta el itan de la creación por Oxalá',
      'Diferencia entre Ketu, Jeje y Angola',
      '¿Qué es una "feitura de santo"?',
      '¿Quién fue Pierre Verger?',
    ],
  },
  agnostic: {
    'pt-BR': [
      'Diferença entre agnosticismo e ateísmo',
      'Pode-se ser espiritual sem religião?',
      'Como o agnóstico lida com a morte?',
      'O que disse Bertrand Russell sobre Deus?',
      'Como construir ética sem religião?',
    ],
    en: [
      'Difference between agnosticism and atheism',
      'Can one be spiritual without religion?',
      'How does an agnostic deal with death?',
      'What did Bertrand Russell say about God?',
      'How to build ethics without religion?',
    ],
    es: [
      'Diferencia entre agnosticismo y ateísmo',
      '¿Se puede ser espiritual sin religión?',
      '¿Cómo afronta la muerte un agnóstico?',
      '¿Qué dijo Bertrand Russell sobre Dios?',
      '¿Cómo construir ética sin religión?',
    ],
  },

  // ===== Philosophies =====
  stoicism: {
    'pt-BR': [
      'O que é a dicotomia do controle?',
      'O que significa "amor fati"?',
      'Quem foi Marco Aurélio?',
      'Diferença entre Estoicismo e Epicurismo',
      'O que é "premeditatio malorum"?',
    ],
    en: [
      'What is the dichotomy of control?',
      'What does "amor fati" mean?',
      'Who was Marcus Aurelius?',
      'Difference between Stoicism and Epicureanism',
      'What is "premeditatio malorum"?',
    ],
    es: [
      '¿Qué es la dicotomía del control?',
      '¿Qué significa "amor fati"?',
      '¿Quién fue Marco Aurelio?',
      'Diferencia entre Estoicismo y Epicureísmo',
      '¿Qué es "premeditatio malorum"?',
    ],
  },
  logosophy: {
    'pt-BR': [
      'Quem foi Carlos Bernardo González Pecotche?',
      'O que é o método logosófico?',
      'Como conhecer-se a si mesmo segundo a Logosofia?',
      'O que são os defeitos psicológicos?',
      'Como funciona a evolução consciente?',
    ],
    en: [
      'Who was Carlos Bernardo González Pecotche?',
      'What is the logosophic method?',
      'How to know yourself according to Logosophy?',
      'What are psychological defects?',
      'How does conscious evolution work?',
    ],
    es: [
      '¿Quién fue Carlos Bernardo González Pecotche?',
      '¿Qué es el método logosófico?',
      '¿Cómo conocerse a sí mismo según la Logosofía?',
      '¿Qué son los defectos psicológicos?',
      '¿Cómo funciona la evolución consciente?',
    ],
  },
  humanism: {
    'pt-BR': [
      'O que é o Humanismo Renascentista?',
      'Quem foi Erasmo de Roterdã?',
      'Diferença entre humanismo religioso e secular',
      'Como o humanismo influenciou os direitos humanos?',
      'O que é a "dignidade do homem"?',
    ],
    en: [
      'What is Renaissance Humanism?',
      'Who was Erasmus of Rotterdam?',
      'Difference between religious and secular humanism',
      'How did humanism influence human rights?',
      'What is the "dignity of man"?',
    ],
    es: [
      '¿Qué es el Humanismo Renacentista?',
      '¿Quién fue Erasmo de Róterdam?',
      'Diferencia entre humanismo religioso y secular',
      '¿Cómo influyó el humanismo en los derechos humanos?',
      '¿Qué es la "dignidad del hombre"?',
    ],
  },
  epicureanism: {
    'pt-BR': [
      'Quem foi Epicuro?',
      'O que é o "tetraphármacos"?',
      'Por que o prazer não é o que pensamos?',
      'Diferença entre Epicurismo e hedonismo vulgar',
      'O que é a ataraxia?',
    ],
    en: [
      'Who was Epicurus?',
      'What is the "tetrapharmakos"?',
      'Why is pleasure not what we think?',
      'Difference between Epicureanism and vulgar hedonism',
      'What is ataraxia?',
    ],
    es: [
      '¿Quién fue Epicuro?',
      '¿Qué es el "tetrafármaco"?',
      '¿Por qué el placer no es lo que pensamos?',
      'Diferencia entre Epicureísmo y hedonismo vulgar',
      '¿Qué es la ataraxia?',
    ],
  },
  taoism: {
    'pt-BR': [
      'O que é o Tao?',
      'Quem foi Lao Tsé?',
      'O que significa "wu wei" (não-ação)?',
      'O que é o Yin e Yang?',
      'Diferença entre Taoísmo filosófico e religioso',
    ],
    en: [
      'What is the Tao?',
      'Who was Lao Tzu?',
      'What does "wu wei" (non-action) mean?',
      'What is Yin and Yang?',
      'Difference between philosophical and religious Taoism',
    ],
    es: [
      '¿Qué es el Tao?',
      '¿Quién fue Lao-Tsé?',
      '¿Qué significa "wu wei" (no-acción)?',
      '¿Qué es el Yin y el Yang?',
      'Diferencia entre Taoísmo filosófico y religioso',
    ],
  },
  shamanism: {
    'pt-BR': [
      'O que é xamanismo?',
      'Quem é o xamã na sociedade tribal?',
      'O que são plantas sagradas?',
      'Diferença entre xamanismo e religiões organizadas',
      'O que é uma jornada xamânica?',
    ],
    en: [
      'What is shamanism?',
      'Who is the shaman in tribal society?',
      'What are sacred plants?',
      'Difference between shamanism and organized religions',
      'What is a shamanic journey?',
    ],
    es: [
      '¿Qué es el chamanismo?',
      '¿Quién es el chamán en la sociedad tribal?',
      '¿Qué son las plantas sagradas?',
      'Diferencia entre chamanismo y religiones organizadas',
      '¿Qué es un viaje chamánico?',
    ],
  },
  ubuntu: {
    'pt-BR': [
      'O que significa "Eu sou porque nós somos"?',
      'Origens africanas da filosofia Ubuntu',
      'Como Ubuntu influenciou Mandela e Tutu?',
      'Diferença entre Ubuntu e individualismo ocidental',
      'Aplicações modernas do Ubuntu',
    ],
    en: [
      'What does "I am because we are" mean?',
      'African origins of Ubuntu philosophy',
      'How did Ubuntu influence Mandela and Tutu?',
      'Difference between Ubuntu and Western individualism',
      'Modern applications of Ubuntu',
    ],
    es: [
      '¿Qué significa "Yo soy porque nosotros somos"?',
      'Orígenes africanos de la filosofía Ubuntu',
      '¿Cómo influyó Ubuntu en Mandela y Tutu?',
      'Diferencia entre Ubuntu e individualismo occidental',
      'Aplicaciones modernas del Ubuntu',
    ],
  },
};

// Generic fallback for any tradition without explicit starters.
function genericStarters(label: string, lang: Lang): string[] {
  if (lang === 'en') {
    return [
      `What are the core ideas of ${label}?`,
      `Who were the main thinkers of ${label}?`,
      `How does ${label} view life and death?`,
      `What can ${label} teach me today?`,
      `What are common misconceptions about ${label}?`,
    ];
  }
  if (lang === 'es') {
    return [
      `¿Cuáles son las ideas centrales de ${label}?`,
      `¿Quiénes fueron los principales pensadores de ${label}?`,
      `¿Cómo ve ${label} la vida y la muerte?`,
      `¿Qué puede enseñarme ${label} hoy?`,
      `¿Cuáles son los malentendidos comunes sobre ${label}?`,
    ];
  }
  return [
    `Quais são as ideias centrais do(a) ${label}?`,
    `Quem foram os principais pensadores do(a) ${label}?`,
    `Como o(a) ${label} enxerga a vida e a morte?`,
    `O que o(a) ${label} pode me ensinar hoje?`,
    `Quais são os mal-entendidos comuns sobre ${label}?`,
  ];
}

export function getStarterQuestions(topic: string, lang: Lang, fallbackLabel: string): string[] {
  const set = STARTERS[topic];
  if (set && set[lang]) return set[lang];
  return genericStarters(fallbackLabel, lang);
}
