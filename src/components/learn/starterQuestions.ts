// Curated 5 starter questions per tradition — trilingual (PT/EN/ES)
// Used by StarterQuestionChips on /learn study sessions

export type StarterLang = 'pt' | 'en' | 'es';

type QuestionSet = Record<StarterLang, string[]>;

export const STARTER_QUESTIONS: Record<string, QuestionSet> = {
  christian: {
    pt: [
      'Quem foi Jesus historicamente e por que ele transformou tantas vidas?',
      'Qual a diferença entre os Evangelhos sinóticos e o de João?',
      'O que significa "graça" no Cristianismo?',
      'Como surgiu a Igreja primitiva nos primeiros séculos?',
      'O que é a Trindade e como entendê-la sem complicar?',
    ],
    en: [
      'Who was Jesus historically and why did he transform so many lives?',
      'What is the difference between the synoptic Gospels and John?',
      'What does "grace" mean in Christianity?',
      'How did the early Church arise in the first centuries?',
      'What is the Trinity and how can I understand it simply?',
    ],
    es: [
      '¿Quién fue Jesús históricamente y por qué transformó tantas vidas?',
      '¿Cuál es la diferencia entre los Evangelios sinópticos y el de Juan?',
      '¿Qué significa "gracia" en el Cristianismo?',
      '¿Cómo surgió la Iglesia primitiva en los primeros siglos?',
      '¿Qué es la Trinidad y cómo entenderla sin complicarse?',
    ],
  },
  catholic: {
    pt: [
      'Por que os católicos veneram Maria e os santos?',
      'O que é a Eucaristia e por que é tão central?',
      'Como funciona a sucessão apostólica e o papado?',
      'Quais são os sete sacramentos e seu significado?',
      'O que é o Catecismo e como ele orienta a fé católica?',
    ],
    en: [
      'Why do Catholics venerate Mary and the saints?',
      'What is the Eucharist and why is it so central?',
      'How do apostolic succession and the papacy work?',
      'What are the seven sacraments and their meaning?',
      'What is the Catechism and how does it guide Catholic faith?',
    ],
    es: [
      '¿Por qué los católicos veneran a María y a los santos?',
      '¿Qué es la Eucaristía y por qué es tan central?',
      '¿Cómo funciona la sucesión apostólica y el papado?',
      '¿Cuáles son los siete sacramentos y su significado?',
      '¿Qué es el Catecismo y cómo guía la fe católica?',
    ],
  },
  protestant: {
    pt: [
      'O que foi a Reforma Protestante e por que ela aconteceu?',
      'Quais são os "5 Solas" da Reforma?',
      'Qual a diferença entre luteranos, calvinistas e anglicanos?',
      'Como protestantes interpretam a salvação pela fé?',
      'Por que existem tantas denominações protestantes hoje?',
    ],
    en: [
      'What was the Protestant Reformation and why did it happen?',
      'What are the "5 Solas" of the Reformation?',
      'What is the difference between Lutherans, Calvinists, and Anglicans?',
      'How do Protestants interpret salvation by faith?',
      'Why are there so many Protestant denominations today?',
    ],
    es: [
      '¿Qué fue la Reforma Protestante y por qué sucedió?',
      '¿Cuáles son las "5 Solas" de la Reforma?',
      '¿Cuál es la diferencia entre luteranos, calvinistas y anglicanos?',
      '¿Cómo interpretan los protestantes la salvación por la fe?',
      '¿Por qué hay tantas denominaciones protestantes hoy?',
    ],
  },
  mormon: {
    pt: [
      'Quem foi Joseph Smith e como surgiu a Igreja Mórmon?',
      'O que é o Livro de Mórmon?',
      'Quais são as práticas distintas dos Santos dos Últimos Dias?',
      'Como mórmons entendem a salvação e a vida após a morte?',
      'O que é o templo mórmon e o que acontece nele?',
    ],
    en: [
      'Who was Joseph Smith and how did the Mormon Church begin?',
      'What is the Book of Mormon?',
      'What are the distinct practices of Latter-day Saints?',
      'How do Mormons understand salvation and the afterlife?',
      'What is the Mormon temple and what happens inside it?',
    ],
    es: [
      '¿Quién fue Joseph Smith y cómo surgió la Iglesia Mormona?',
      '¿Qué es el Libro de Mormón?',
      '¿Cuáles son las prácticas distintivas de los Santos de los Últimos Días?',
      '¿Cómo entienden los mormones la salvación y la vida después de la muerte?',
      '¿Qué es el templo mormón y qué sucede en él?',
    ],
  },
  jewish: {
    pt: [
      'O que significa ser judeu — religião, povo ou ambos?',
      'Qual a diferença entre judaísmo Ortodoxo, Conservador e Reformista?',
      'O que é o Shabat e como ele é vivido?',
      'O que é Tikun Olam e por que é tão importante?',
      'Como judeus entendem o Messias e o Olam Habá?',
    ],
    en: [
      'What does it mean to be Jewish — religion, people, or both?',
      'What is the difference between Orthodox, Conservative, and Reform Judaism?',
      'What is Shabbat and how is it lived?',
      'What is Tikkun Olam and why is it so important?',
      'How do Jews understand the Messiah and Olam Ha-Ba?',
    ],
    es: [
      '¿Qué significa ser judío — religión, pueblo o ambos?',
      '¿Cuál es la diferencia entre judaísmo Ortodoxo, Conservador y Reformista?',
      '¿Qué es el Shabat y cómo se vive?',
      '¿Qué es Tikun Olam y por qué es tan importante?',
      '¿Cómo entienden los judíos al Mesías y el Olam Habá?',
    ],
  },
  islam: {
    pt: [
      'Quais são os 5 pilares do Islã e o que cada um significa?',
      'Qual a diferença entre Sunismo, Xiismo, Sufismo e Ibadismo?',
      'O que é o Alcorão e como ele foi compilado?',
      'Quem foi o profeta Muhammad e qual sua missão?',
      'O que é a Sunnah e por que ela complementa o Alcorão?',
    ],
    en: [
      'What are the 5 pillars of Islam and what does each mean?',
      'What is the difference between Sunnism, Shiism, Sufism, and Ibadism?',
      'What is the Quran and how was it compiled?',
      'Who was the Prophet Muhammad and what was his mission?',
      'What is the Sunnah and why does it complement the Quran?',
    ],
    es: [
      '¿Cuáles son los 5 pilares del Islam y qué significa cada uno?',
      '¿Cuál es la diferencia entre Sunismo, Chiismo, Sufismo e Ibadismo?',
      '¿Qué es el Corán y cómo fue compilado?',
      '¿Quién fue el profeta Mahoma y cuál fue su misión?',
      '¿Qué es la Sunnah y por qué complementa al Corán?',
    ],
  },
  hindu: {
    pt: [
      'O que é Brahman e como ele se relaciona com Atman?',
      'Quais são os 6 Darshanas e como diferem entre si?',
      'O que é Dharma e como descobrir o meu?',
      'Como funcionam karma, samsara e moksha juntos?',
      'Quem são os principais deuses hindus e o que representam?',
    ],
    en: [
      'What is Brahman and how does it relate to Atman?',
      'What are the 6 Darshanas and how do they differ?',
      'What is Dharma and how can I discover mine?',
      'How do karma, samsara, and moksha work together?',
      'Who are the main Hindu gods and what do they represent?',
    ],
    es: [
      '¿Qué es Brahman y cómo se relaciona con Atman?',
      '¿Cuáles son los 6 Darshanas y en qué se diferencian?',
      '¿Qué es Dharma y cómo descubrir el mío?',
      '¿Cómo funcionan juntos karma, samsara y moksha?',
      '¿Quiénes son los principales dioses hindúes y qué representan?',
    ],
  },
  buddhist: {
    pt: [
      'Quais são as Quatro Nobres Verdades do Budismo?',
      'O que é o Nobre Caminho Óctuplo e como praticá-lo?',
      'Qual a diferença entre Theravada, Mahayana e Vajrayana?',
      'O que é Anatman ("não-eu") e por que é tão central?',
      'Como o Budismo se diferencia do Hinduísmo na origem?',
    ],
    en: [
      'What are the Four Noble Truths of Buddhism?',
      'What is the Noble Eightfold Path and how to practice it?',
      'What is the difference between Theravada, Mahayana, and Vajrayana?',
      'What is Anatman ("non-self") and why is it so central?',
      'How does Buddhism differ from Hinduism at its origin?',
    ],
    es: [
      '¿Cuáles son las Cuatro Nobles Verdades del Budismo?',
      '¿Qué es el Noble Sendero Óctuple y cómo practicarlo?',
      '¿Cuál es la diferencia entre Theravada, Mahayana y Vajrayana?',
      '¿Qué es Anatman ("no-yo") y por qué es tan central?',
      '¿En qué se diferencia el Budismo del Hinduismo en su origen?',
    ],
  },
  spiritist: {
    pt: [
      'Quem foi Allan Kardec e como surgiu o Espiritismo?',
      'O que ensina O Livro dos Espíritos?',
      'Como o Espiritismo entende a reencarnação?',
      'O que é a "lei do progresso" segundo Kardec?',
      'Qual o papel da caridade no Espiritismo?',
    ],
    en: [
      'Who was Allan Kardec and how did Spiritism arise?',
      'What does The Spirits\' Book teach?',
      'How does Spiritism understand reincarnation?',
      'What is the "law of progress" according to Kardec?',
      'What role does charity play in Spiritism?',
    ],
    es: [
      '¿Quién fue Allan Kardec y cómo surgió el Espiritismo?',
      '¿Qué enseña El Libro de los Espíritus?',
      '¿Cómo entiende el Espiritismo la reencarnación?',
      '¿Qué es la "ley del progreso" según Kardec?',
      '¿Qué papel tiene la caridad en el Espiritismo?',
    ],
  },
  umbanda: {
    pt: [
      'Como surgiu a Umbanda no Brasil?',
      'Quem são as 7 linhas da Umbanda?',
      'O que são guias espirituais como Pretos-Velhos e Caboclos?',
      'Como funciona uma sessão (gira) de Umbanda?',
      'Qual a relação entre Umbanda, Candomblé e Espiritismo?',
    ],
    en: [
      'How did Umbanda arise in Brazil?',
      'Who are the 7 lines of Umbanda?',
      'What are spiritual guides like Pretos-Velhos and Caboclos?',
      'How does an Umbanda session (gira) work?',
      'What is the relationship between Umbanda, Candomblé, and Spiritism?',
    ],
    es: [
      '¿Cómo surgió la Umbanda en Brasil?',
      '¿Quiénes son las 7 líneas de la Umbanda?',
      '¿Qué son guías espirituales como Pretos-Velhos y Caboclos?',
      '¿Cómo funciona una sesión (gira) de Umbanda?',
      '¿Cuál es la relación entre Umbanda, Candomblé y Espiritismo?',
    ],
  },
  candomble: {
    pt: [
      'Quem são os Orixás e o que cada um representa?',
      'Qual a origem africana do Candomblé?',
      'O que é axé e por que é tão importante?',
      'Como funciona a iniciação no Candomblé?',
      'Qual a diferença entre as nações Ketu, Jeje e Angola?',
    ],
    en: [
      'Who are the Orishas and what does each represent?',
      'What is the African origin of Candomblé?',
      'What is axé and why is it so important?',
      'How does initiation in Candomblé work?',
      'What is the difference between Ketu, Jeje, and Angola nations?',
    ],
    es: [
      '¿Quiénes son los Orishás y qué representa cada uno?',
      '¿Cuál es el origen africano del Candomblé?',
      '¿Qué es el axé y por qué es tan importante?',
      '¿Cómo funciona la iniciación en el Candomblé?',
      '¿Cuál es la diferencia entre las naciones Ketu, Jeje y Angola?',
    ],
  },
  agnostic: {
    pt: [
      'Qual a diferença entre agnosticismo e ateísmo?',
      'É possível ter espiritualidade sem religião?',
      'Como agnósticos lidam com a finitude e a morte?',
      'O que pensadores como Bertrand Russell defendiam?',
      'Como construir uma ética sem dogmas religiosos?',
    ],
    en: [
      'What is the difference between agnosticism and atheism?',
      'Is it possible to have spirituality without religion?',
      'How do agnostics deal with finitude and death?',
      'What did thinkers like Bertrand Russell defend?',
      'How to build an ethics without religious dogmas?',
    ],
    es: [
      '¿Cuál es la diferencia entre agnosticismo y ateísmo?',
      '¿Es posible tener espiritualidad sin religión?',
      '¿Cómo lidian los agnósticos con la finitud y la muerte?',
      '¿Qué defendían pensadores como Bertrand Russell?',
      '¿Cómo construir una ética sin dogmas religiosos?',
    ],
  },
  // Philosophies
  stoicism: {
    pt: [
      'Quais são os princípios fundamentais do Estoicismo?',
      'Quem foram Sêneca, Epicteto e Marco Aurélio?',
      'O que significa a "dicotomia do controle"?',
      'Como praticar Estoicismo no dia a dia moderno?',
      'Qual a diferença entre Estoicismo e Epicurismo?',
    ],
    en: [
      'What are the fundamental principles of Stoicism?',
      'Who were Seneca, Epictetus, and Marcus Aurelius?',
      'What does the "dichotomy of control" mean?',
      'How to practice Stoicism in modern daily life?',
      'What is the difference between Stoicism and Epicureanism?',
    ],
    es: [
      '¿Cuáles son los principios fundamentales del Estoicismo?',
      '¿Quiénes fueron Séneca, Epicteto y Marco Aurelio?',
      '¿Qué significa la "dicotomía del control"?',
      '¿Cómo practicar Estoicismo en el día a día moderno?',
      '¿Cuál es la diferencia entre Estoicismo y Epicureísmo?',
    ],
  },
  taoism: {
    pt: [
      'Quem foi Lao Tsé e o que ensina o Tao Te Ching?',
      'O que é o Tao e como ele se manifesta?',
      'O que significa "Wu Wei" (não-ação)?',
      'Qual a diferença entre Taoísmo e Confucionismo?',
      'Como aplicar o Taoísmo na vida moderna?',
    ],
    en: [
      'Who was Lao Tzu and what does the Tao Te Ching teach?',
      'What is the Tao and how does it manifest?',
      'What does "Wu Wei" (non-action) mean?',
      'What is the difference between Taoism and Confucianism?',
      'How to apply Taoism in modern life?',
    ],
    es: [
      '¿Quién fue Lao Tse y qué enseña el Tao Te Ching?',
      '¿Qué es el Tao y cómo se manifiesta?',
      '¿Qué significa "Wu Wei" (no-acción)?',
      '¿Cuál es la diferencia entre Taoísmo y Confucionismo?',
      '¿Cómo aplicar el Taoísmo en la vida moderna?',
    ],
  },
};

// Fallback generic questions when topic key not mapped
export const GENERIC_STARTERS: QuestionSet = {
  pt: [
    'Pode me dar uma introdução breve e cativante?',
    'Quais são os textos sagrados ou fundamentais?',
    'Como esta tradição entende a vida após a morte?',
    'Quais são as práticas espirituais centrais?',
    'Quem são os mestres ou figuras históricas mais importantes?',
  ],
  en: [
    'Can you give me a brief and engaging introduction?',
    'What are the sacred or foundational texts?',
    'How does this tradition understand the afterlife?',
    'What are the central spiritual practices?',
    'Who are the most important teachers or historical figures?',
  ],
  es: [
    '¿Puedes darme una introducción breve y cautivadora?',
    '¿Cuáles son los textos sagrados o fundamentales?',
    '¿Cómo entiende esta tradición la vida después de la muerte?',
    '¿Cuáles son las prácticas espirituales centrales?',
    '¿Quiénes son los maestros o figuras históricas más importantes?',
  ],
};

export function getStarterQuestions(topic: string, language: string): string[] {
  const lang = (language === 'en' ? 'en' : language === 'es' ? 'es' : 'pt') as StarterLang;
  const set = STARTER_QUESTIONS[topic] || GENERIC_STARTERS;
  return set[lang] || set.pt;
}
