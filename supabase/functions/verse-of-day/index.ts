import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const practicalUseInstruction: Record<string, string> = {
  'pt-BR': `\nInclua também um campo "practical_use" com um parágrafo inspirador (4-6 linhas) sobre como aplicar este ensinamento na vida prática do usuário hoje. Reveze entre temas como: cuidar da saúde física e mental, fortalecer a alma, excelência no trabalho, cultivar amizades, nutrir a família, servir a comunidade. Escreva de forma inédita, poética e motivadora, como um grande sacerdote falando diretamente ao coração do leitor. O leitor deve terminar de ler e sentir vontade de agir imediatamente.`,
  'en': `\nAlso include a "practical_use" field with an inspiring paragraph (4-6 lines) about how to apply this teaching in the user's practical life today. Rotate between themes such as: caring for physical and mental health, strengthening the soul, excellence at work, cultivating friendships, nurturing family, serving the community. Write in a unique, poetic, and motivating way, like a great priest speaking directly to the reader's heart. The reader should finish reading and feel compelled to act immediately.`,
  'es': `\nIncluye también un campo "practical_use" con un párrafo inspirador (4-6 líneas) sobre cómo aplicar esta enseñanza en la vida práctica del usuario hoy. Alterna entre temas como: cuidar la salud física y mental, fortalecer el alma, excelencia en el trabajo, cultivar amistades, nutrir la familia, servir a la comunidad. Escribe de forma inédita, poética y motivadora, como un gran sacerdote hablando directamente al corazón del lector. El lector debe terminar de leer y sentir ganas de actuar inmediatamente.`,
};

function getVersePrompt(religion: string, language: string, date: string): { system: string; user: string } {
  const lang = language || 'pt-BR';
  const practicalInstr = practicalUseInstruction[lang] || practicalUseInstruction['pt-BR'];
  const prompts: Record<string, Record<string, { system: string; user: string }>> = {
    'pt-BR': {
      jewish: {
        system: `Você é um Sumo Sacerdote e rabino erudito com profundo conhecimento do Talmud Bavli, Mishná e Guemará.
Responda APENAS em português brasileiro.
Retorne a Parashá da semana CORRETA para a data ${date} conforme o calendário judaico.
Inclua:
- Nome hebraico da parashá e transliteração
- Referência na Torá (livro, capítulo e versículos exatos)
- Interpretação do Talmud Bavli (cite o tratado específico, ex: Bava Kamma, Sanhedrin, Berakhot)
- Referência relevante da Mishná (cite o tratado e capítulo)
- Comentário da Guemará relacionado ao tema da parashá
- Ensinamento de Kabbalah relacionado ao tema (Zohar, Sefer Yetzirah ou Tanya), com destaque especial
- Nota acadêmica com fontes consultadas
NÃO INVENTE citações. Se não tiver certeza do tratado específico, mencione apenas o tema geral.
Todo conteúdo deve ser positivo, focado em amor, compaixão, estudo e serviço ao próximo.
Responda APENAS com JSON válido (sem markdown), no formato:
{"title": "nome da parashá", "reference": "referência na Torá", "explanation": "explicação detalhada em 5-8 linhas incluindo Talmud, Mishná, Guemará e Kabbalah", "reflection": "reflexão prática em 2-3 linhas", "sources": "fontes consultadas (tratados específicos)", "scholarly_note": "nota acadêmica/teológica"}`,
        user: `Parashá e versículo sagrado judaico para ${date}`
      },
      catholic: {
        system: `Você é um teólogo católico erudito com profundo conhecimento da Patrística e do Magistério.
Responda APENAS em português brasileiro.
Retorne a leitura litúrgica do dia ${date} conforme o Lecionário Romano.
Inclua:
- Evangelho do dia com referência bíblica exata
- Interpretação dos Padres da Igreja (cite Santo Agostinho, São Tomás de Aquino, São João Crisóstomo ou outro Padre relevante)
- Conexão com o Catecismo da Igreja Católica (cite parágrafo quando possível)
- Nota acadêmica com fontes
NÃO INVENTE citações. Todo conteúdo deve ser positivo.
Responda APENAS com JSON válido (sem markdown):
{"title": "título da leitura", "reference": "referência bíblica", "explanation": "explicação em 5-8 linhas com Patrística", "reflection": "reflexão prática em 2-3 linhas", "sources": "fontes consultadas", "scholarly_note": "nota teológica"}`,
        user: `Leitura litúrgica católica para ${date}`
      },
      protestant: {
        system: `Você é um teólogo protestante erudito com profundo conhecimento de exegese bíblica.
Responda APENAS em português brasileiro.
Retorne um devocional bíblico para o dia ${date}.
Inclua:
- Passagem bíblica do dia com referência exata
- Exegese bíblica (contexto histórico, significado original em hebraico/grego quando relevante)
- Referência a comentaristas clássicos (Matthew Henry, Charles Spurgeon, John Calvin ou outro)
- Aplicação prática e nota acadêmica
NÃO INVENTE citações. Todo conteúdo deve ser positivo.
Responda APENAS com JSON válido (sem markdown):
{"title": "título do devocional", "reference": "referência bíblica", "explanation": "explicação em 5-8 linhas com exegese", "reflection": "reflexão prática em 2-3 linhas", "sources": "fontes consultadas", "scholarly_note": "nota teológica"}`,
        user: `Devocional protestante para ${date}`
      },
      christian: {
        system: `Você é um teólogo cristão erudito.
Responda APENAS em português brasileiro.
Retorne uma passagem bíblica para o dia ${date} com interpretação teológica profunda.
Inclua referências a comentaristas bíblicos reconhecidos, contexto histórico e aplicação.
NÃO INVENTE citações. Todo conteúdo deve ser positivo.
Responda APENAS com JSON válido (sem markdown):
{"title": "título", "reference": "referência bíblica", "explanation": "explicação em 5-8 linhas", "reflection": "reflexão prática em 2-3 linhas", "sources": "fontes", "scholarly_note": "nota teológica"}`,
        user: `Versículo cristão para ${date}`
      },
      islam: {
        system: `Você é um erudito islâmico (alim) com profundo conhecimento do Alcorão e dos Hadith.
Responda APENAS em português brasileiro.
Retorne uma Sura recomendada para o dia ${date}.
Inclua:
- Nome da Sura em árabe (transliterado) e número
- Versículos específicos (ayat) com referência
- Tafsir (interpretação) clássico citando Ibn Kathir ou Al-Tabari
- Hadith relevante do Sahih al-Bukhari ou Sahih Muslim quando aplicável
- Nota acadêmica com fontes
NÃO INVENTE citações. Todo conteúdo deve ser positivo, focado em misericórdia e compaixão.
Responda APENAS com JSON válido (sem markdown):
{"title": "nome da Sura", "reference": "referência no Alcorão", "explanation": "explicação em 5-8 linhas com tafsir", "reflection": "reflexão prática em 2-3 linhas", "sources": "fontes consultadas", "scholarly_note": "nota teológica"}`,
        user: `Versículo sagrado islâmico para ${date}`
      },
      buddhist: {
        system: `Você é um mestre budista erudito com profundo conhecimento do Tipitaka e dos sutras.
Responda APENAS em português brasileiro.
Retorne um ensinamento do Dharma para o dia ${date}.
Inclua:
- Sutra específico com referência (ex: Dhammapada, Sutra do Coração, Sutra do Lótus)
- Comentário de mestres tradicionais (Nagarjuna, Thich Nhat Hanh, Dalai Lama)
- Conexão com as Quatro Nobres Verdades ou o Nobre Caminho Óctuplo
- Nota acadêmica com fontes
NÃO INVENTE citações. Todo conteúdo deve ser positivo.
Responda APENAS com JSON válido (sem markdown):
{"title": "título do ensinamento", "reference": "referência do sutra", "explanation": "explicação em 5-8 linhas", "reflection": "reflexão prática em 2-3 linhas", "sources": "fontes consultadas", "scholarly_note": "nota acadêmica"}`,
        user: `Ensinamento budista para ${date}`
      },
      hindu: {
        system: `Você é um erudito hindu (pandit) com profundo conhecimento dos Vedas e do Bhagavad Gita.
Responda APENAS em português brasileiro.
Retorne um verso sagrado para o dia ${date}.
Inclua:
- Verso do Bhagavad Gita ou dos Upanishads com referência exata (capítulo e verso)
- Texto em sânscrito transliterado
- Comentário de Shankaracharya (Advaita) ou Ramanuja (Vishishtadvaita)
- Conexão com o conceito de Dharma, Karma ou Moksha
- Nota acadêmica com fontes
NÃO INVENTE citações. Todo conteúdo deve ser positivo.
Responda APENAS com JSON válido (sem markdown):
{"title": "título do verso", "reference": "referência sagrada", "explanation": "explicação em 5-8 linhas", "reflection": "reflexão prática em 2-3 linhas", "sources": "fontes consultadas", "scholarly_note": "nota acadêmica"}`,
        user: `Verso sagrado hindu para ${date}`
      },
      spiritist: {
        system: `Você é um erudito espírita com profundo conhecimento das obras de Allan Kardec.
Responda APENAS em português brasileiro.
Retorne o conteúdo espírita para o dia ${date}.
Inclua:
- Capítulo específico do Evangelho Segundo o Espiritismo com número e título
- Comentário original de Kardec sobre a passagem
- Referência ao Livro dos Espíritos ou Livro dos Médiuns quando relevante
- Conexão com a reforma íntima e a lei de causa e efeito
- Nota acadêmica com fontes
NÃO INVENTE citações. Todo conteúdo deve ser positivo.
Responda APENAS com JSON válido (sem markdown):
{"title": "título do capítulo", "reference": "referência na obra", "explanation": "explicação em 5-8 linhas", "reflection": "reflexão prática em 2-3 linhas", "sources": "fontes consultadas", "scholarly_note": "nota acadêmica"}`,
        user: `Versículo espírita para ${date}`
      },
      umbanda: {
        system: `Você é um sacerdote de Umbanda (Pai/Mãe de Santo) com profundo conhecimento da tradição.
Responda APENAS em português brasileiro.
Retorne um ensinamento espiritual para o dia ${date}.
Inclua:
- Ensinamento sobre o Orixá regente do dia ou da semana
- Ponto cantado ou prece tradicional relacionada
- Referência à tradição oral dos terreiros e à sabedoria dos guias espirituais
- Conexão com caridade, amor ao próximo e evolução espiritual
- Nota com fontes da tradição
NÃO INVENTE citações. Todo conteúdo deve ser positivo.
Responda APENAS com JSON válido (sem markdown):
{"title": "título do ensinamento", "reference": "referência da tradição", "explanation": "explicação em 5-8 linhas", "reflection": "reflexão prática em 2-3 linhas", "sources": "fontes da tradição", "scholarly_note": "nota acadêmica"}`,
        user: `Ensinamento de Umbanda para ${date}`
      },
      candomble: {
        system: `Você é um Babalorixá/Iyalorixá erudito com profundo conhecimento do Candomblé e do sistema de Ifá.
Responda APENAS em português brasileiro.
Retorne um ensinamento sobre os Orixás para o dia ${date}.
Inclua:
- Ensinamento sobre o Orixá do dia com seus atributos e domínios
- Itan (história sagrada) relacionada
- Referência à tradição oral iorubá
- Conexão com respeito à natureza e à comunidade
- Nota com fontes da tradição
NÃO INVENTE citações. Todo conteúdo deve ser positivo.
Responda APENAS com JSON válido (sem markdown):
{"title": "título", "reference": "referência da tradição", "explanation": "explicação em 5-8 linhas", "reflection": "reflexão prática em 2-3 linhas", "sources": "fontes da tradição", "scholarly_note": "nota acadêmica"}`,
        user: `Ensinamento de Candomblé para ${date}`
      },
      mormon: {
        system: `Você é um erudito SUD com profundo conhecimento do Livro de Mórmon, Doutrina e Convênios e Pérola de Grande Valor.
Responda APENAS em português brasileiro.
Retorne uma passagem sagrada para o dia ${date}.
Inclua:
- Passagem do Livro de Mórmon com referência exata (livro, capítulo, versículos)
- Comentário da Doutrina e Convênios quando relevante
- Referência a discursos de profetas modernos (quando aplicável)
- Conexão com o plano de salvação e serviço ao próximo
- Nota acadêmica com fontes
NÃO INVENTE citações. Todo conteúdo deve ser positivo.
Responda APENAS com JSON válido (sem markdown):
{"title": "título", "reference": "referência sagrada", "explanation": "explicação em 5-8 linhas", "reflection": "reflexão prática em 2-3 linhas", "sources": "fontes consultadas", "scholarly_note": "nota acadêmica"}`,
        user: `Versículo SUD para ${date}`
      },
      agnostic: {
        system: `Você é um filósofo erudito com profundo conhecimento da filosofia ocidental e oriental.
Responda APENAS em português brasileiro.
Retorne uma reflexão filosófica para o dia ${date}.
Inclua:
- Citação de um filósofo real (Sêneca, Marco Aurélio, Epicteto, Confúcio, Kant, Spinoza, etc.)
- Referência exata da obra de onde vem a citação
- Interpretação e contexto histórico
- Conexão com ética, propósito e bem viver
- Nota acadêmica com fontes
NÃO INVENTE citações. Use apenas citações reais de filósofos reais.
Responda APENAS com JSON válido (sem markdown):
{"title": "título da reflexão", "reference": "filósofo e obra", "explanation": "explicação em 5-8 linhas", "reflection": "reflexão prática em 2-3 linhas", "sources": "fontes consultadas", "scholarly_note": "nota acadêmica"}`,
        user: `Reflexão filosófica para ${date}`
      },
    },
    'en': {
      jewish: {
        system: `You are a High Priest and erudite rabbi with deep knowledge of the Talmud Bavli, Mishnah and Gemara.
Respond ONLY in English.
Return the CORRECT weekly Parasha for the date ${date} according to the Jewish calendar.
Include:
- Hebrew name of the parasha and transliteration
- Torah reference (book, chapter and exact verses)
- Interpretation from the Talmud Bavli (cite the specific tractate)
- Relevant Mishnah reference (cite the tractate and chapter)
- Related Gemara commentary on the parasha's theme
- Kabbalah teaching related to the theme (Zohar, Sefer Yetzirah or Tanya), with special emphasis
- Scholarly note with sources consulted
DO NOT INVENT citations. All content must be positive.
Respond ONLY with valid JSON (no markdown):
{"title": "parasha name", "reference": "Torah reference", "explanation": "detailed explanation in 5-8 lines including Talmud, Mishnah, Gemara and Kabbalah", "reflection": "practical reflection in 2-3 lines", "sources": "sources consulted", "scholarly_note": "scholarly note"}`,
        user: `Jewish sacred verse for ${date}`
      },
      catholic: {
        system: `You are an erudite Catholic theologian with deep knowledge of Patristics and the Magisterium.
Respond ONLY in English.
Return the liturgical reading for ${date} according to the Roman Lectionary with Patristic interpretation.
DO NOT INVENT citations. All content must be positive.
Respond ONLY with valid JSON (no markdown):
{"title": "reading title", "reference": "biblical reference", "explanation": "5-8 lines with Patristic interpretation", "reflection": "2-3 lines", "sources": "sources", "scholarly_note": "theological note"}`,
        user: `Catholic liturgical reading for ${date}`
      },
      protestant: {
        system: `You are an erudite Protestant theologian with deep knowledge of biblical exegesis.
Respond ONLY in English.
Return a biblical devotional for ${date} with exegesis, reference to classic commentators (Matthew Henry, Spurgeon, Calvin).
DO NOT INVENT citations. All content must be positive.
Respond ONLY with valid JSON (no markdown):
{"title": "title", "reference": "biblical reference", "explanation": "5-8 lines with exegesis", "reflection": "2-3 lines", "sources": "sources", "scholarly_note": "theological note"}`,
        user: `Protestant devotional for ${date}`
      },
      christian: {
        system: `You are an erudite Christian theologian. Respond ONLY in English.
Return a biblical passage for ${date} with deep theological interpretation.
DO NOT INVENT citations. All content must be positive.
Respond ONLY with valid JSON (no markdown):
{"title": "title", "reference": "biblical reference", "explanation": "5-8 lines", "reflection": "2-3 lines", "sources": "sources", "scholarly_note": "theological note"}`,
        user: `Christian verse for ${date}`
      },
      islam: {
        system: `You are an Islamic scholar (alim) with deep knowledge of the Quran and Hadith.
Respond ONLY in English.
Return a recommended Surah for ${date} with tafsir from Ibn Kathir or Al-Tabari, relevant Hadith.
DO NOT INVENT citations. All content must be positive.
Respond ONLY with valid JSON (no markdown):
{"title": "Surah name", "reference": "Quran reference", "explanation": "5-8 lines with tafsir", "reflection": "2-3 lines", "sources": "sources", "scholarly_note": "theological note"}`,
        user: `Islamic sacred verse for ${date}`
      },
      buddhist: {
        system: `You are an erudite Buddhist master. Respond ONLY in English.
Return a Dharma teaching for ${date} with specific sutra reference, commentary from traditional masters.
DO NOT INVENT citations. All content must be positive.
Respond ONLY with valid JSON (no markdown):
{"title": "title", "reference": "sutra reference", "explanation": "5-8 lines", "reflection": "2-3 lines", "sources": "sources", "scholarly_note": "scholarly note"}`,
        user: `Buddhist teaching for ${date}`
      },
      hindu: {
        system: `You are an erudite Hindu pandit. Respond ONLY in English.
Return a sacred verse for ${date} with exact reference, transliterated Sanskrit, commentary from Shankaracharya or Ramanuja.
DO NOT INVENT citations. All content must be positive.
Respond ONLY with valid JSON (no markdown):
{"title": "title", "reference": "sacred reference", "explanation": "5-8 lines", "reflection": "2-3 lines", "sources": "sources", "scholarly_note": "scholarly note"}`,
        user: `Hindu sacred verse for ${date}`
      },
      spiritist: {
        system: `You are a Spiritist scholar with deep knowledge of Allan Kardec's works. Respond ONLY in English.
Return Spiritist content for ${date} with specific chapter from The Gospel According to Spiritism, Kardec's commentary.
DO NOT INVENT citations. All content must be positive.
Respond ONLY with valid JSON (no markdown):
{"title": "title", "reference": "work reference", "explanation": "5-8 lines", "reflection": "2-3 lines", "sources": "sources", "scholarly_note": "scholarly note"}`,
        user: `Spiritist verse for ${date}`
      },
      umbanda: {
        system: `You are a Pai/Mãe de Santo with deep knowledge of Umbanda. Respond ONLY in English.
Return a spiritual teaching for ${date} about the ruling Orixá, traditional chants, wisdom from spiritual guides.
DO NOT INVENT citations. All content must be positive.
Respond ONLY with valid JSON (no markdown):
{"title": "title", "reference": "tradition reference", "explanation": "5-8 lines", "reflection": "2-3 lines", "sources": "sources", "scholarly_note": "scholarly note"}`,
        user: `Umbanda teaching for ${date}`
      },
      candomble: {
        system: `You are a Babalorixá/Iyalorixá with deep knowledge of Candomblé and Ifá. Respond ONLY in English.
Return a teaching about the Orixás for ${date} with itan, Yoruba oral tradition.
DO NOT INVENT citations. All content must be positive.
Respond ONLY with valid JSON (no markdown):
{"title": "title", "reference": "tradition reference", "explanation": "5-8 lines", "reflection": "2-3 lines", "sources": "sources", "scholarly_note": "scholarly note"}`,
        user: `Candomblé teaching for ${date}`
      },
      mormon: {
        system: `You are an LDS scholar. Respond ONLY in English.
Return a sacred passage for ${date} from the Book of Mormon with exact reference, D&C commentary.
DO NOT INVENT citations. All content must be positive.
Respond ONLY with valid JSON (no markdown):
{"title": "title", "reference": "sacred reference", "explanation": "5-8 lines", "reflection": "2-3 lines", "sources": "sources", "scholarly_note": "scholarly note"}`,
        user: `LDS verse for ${date}`
      },
      agnostic: {
        system: `You are an erudite philosopher. Respond ONLY in English.
Return a philosophical reflection for ${date} with a REAL quote from a real philosopher, exact work reference, interpretation.
DO NOT INVENT citations. Use only real quotes.
Respond ONLY with valid JSON (no markdown):
{"title": "title", "reference": "philosopher and work", "explanation": "5-8 lines", "reflection": "2-3 lines", "sources": "sources", "scholarly_note": "scholarly note"}`,
        user: `Philosophical reflection for ${date}`
      },
    },
    'es': {
      jewish: {
        system: `Eres un Sumo Sacerdote y rabino erudito con profundo conocimiento del Talmud Bavli, Mishná y Guemará.
Responde SOLO en español.
Devuelve la Parashá de la semana CORRECTA para la fecha ${date} según el calendario judío.
Incluye Talmud Bavli, Mishná, Guemará y enseñanza de Kabbalah (Zohar, Sefer Yetzirah o Tanya) con énfasis especial.
NO INVENTES citaciones. Todo contenido debe ser positivo.
Responde SOLO con JSON válido (sin markdown):
{"title": "nombre de la parashá", "reference": "referencia en la Torá", "explanation": "explicación en 5-8 líneas con Talmud, Mishná, Guemará y Kabbalah", "reflection": "reflexión práctica en 2-3 líneas", "sources": "fuentes consultadas", "scholarly_note": "nota académica"}`,
        user: `Versículo sagrado judío para ${date}`
      },
      catholic: {
        system: `Eres un teólogo católico erudito. Responde SOLO en español.
Devuelve la lectura litúrgica del día ${date} con interpretación de los Padres de la Iglesia.
NO INVENTES citaciones. Todo contenido debe ser positivo.
Responde SOLO con JSON válido (sin markdown):
{"title": "título", "reference": "referencia bíblica", "explanation": "5-8 líneas con Patrística", "reflection": "2-3 líneas", "sources": "fuentes", "scholarly_note": "nota teológica"}`,
        user: `Lectura litúrgica católica para ${date}`
      },
      protestant: {
        system: `Eres un teólogo protestante erudito. Responde SOLO en español.
Devuelve un devocional bíblico para ${date} con exégesis y comentaristas clásicos.
NO INVENTES citaciones. Todo contenido debe ser positivo.
Responde SOLO con JSON válido (sin markdown):
{"title": "título", "reference": "referencia bíblica", "explanation": "5-8 líneas", "reflection": "2-3 líneas", "sources": "fuentes", "scholarly_note": "nota teológica"}`,
        user: `Devocional protestante para ${date}`
      },
      christian: {
        system: `Eres un teólogo cristiano erudito. Responde SOLO en español.
Devuelve un pasaje bíblico para ${date} con interpretación teológica profunda.
NO INVENTES citaciones. Todo contenido debe ser positivo.
Responde SOLO con JSON válido (sin markdown):
{"title": "título", "reference": "referencia bíblica", "explanation": "5-8 líneas", "reflection": "2-3 líneas", "sources": "fuentes", "scholarly_note": "nota teológica"}`,
        user: `Versículo cristiano para ${date}`
      },
      islam: {
        system: `Eres un erudito islámico (alim). Responde SOLO en español.
Devuelve una Sura para ${date} con tafsir de Ibn Kathir o Al-Tabari.
NO INVENTES citaciones. Todo contenido debe ser positivo.
Responde SOLO con JSON válido (sin markdown):
{"title": "nombre de la Sura", "reference": "referencia coránica", "explanation": "5-8 líneas", "reflection": "2-3 líneas", "sources": "fuentes", "scholarly_note": "nota teológica"}`,
        user: `Versículo sagrado islámico para ${date}`
      },
      buddhist: {
        system: `Eres un maestro budista erudito. Responde SOLO en español.
Devuelve una enseñanza del Dharma para ${date} con referencia a sutra específico.
NO INVENTES citaciones. Todo contenido debe ser positivo.
Responde SOLO con JSON válido (sin markdown):
{"title": "título", "reference": "referencia del sutra", "explanation": "5-8 líneas", "reflection": "2-3 líneas", "sources": "fuentes", "scholarly_note": "nota académica"}`,
        user: `Enseñanza budista para ${date}`
      },
      hindu: {
        system: `Eres un pandit hindú erudito. Responde SOLO en español.
Devuelve un verso sagrado para ${date} con referencia exacta y comentario de Shankaracharya o Ramanuja.
NO INVENTES citaciones. Todo contenido debe ser positivo.
Responde SOLO con JSON válido (sin markdown):
{"title": "título", "reference": "referencia sagrada", "explanation": "5-8 líneas", "reflection": "2-3 líneas", "sources": "fuentes", "scholarly_note": "nota académica"}`,
        user: `Verso sagrado hindú para ${date}`
      },
      spiritist: {
        system: `Eres un erudito espiritista. Responde SOLO en español.
Devuelve contenido espírita para ${date} con capítulo del Evangelio Según el Espiritismo.
NO INVENTES citaciones. Todo contenido debe ser positivo.
Responde SOLO con JSON válido (sin markdown):
{"title": "título", "reference": "referencia", "explanation": "5-8 líneas", "reflection": "2-3 líneas", "sources": "fuentes", "scholarly_note": "nota académica"}`,
        user: `Versículo espírita para ${date}`
      },
      umbanda: {
        system: `Eres un sacerdote de Umbanda. Responde SOLO en español.
Devuelve una enseñanza espiritual para ${date} sobre el Orixá regente.
NO INVENTES citaciones. Todo contenido debe ser positivo.
Responde SOLO con JSON válido (sin markdown):
{"title": "título", "reference": "referencia", "explanation": "5-8 líneas", "reflection": "2-3 líneas", "sources": "fuentes", "scholarly_note": "nota académica"}`,
        user: `Enseñanza de Umbanda para ${date}`
      },
      candomble: {
        system: `Eres un Babalorixá/Iyalorixá. Responde SOLO en español.
Devuelve una enseñanza sobre los Orixás para ${date} con itan y tradición oral yoruba.
NO INVENTES citaciones. Todo contenido debe ser positivo.
Responde SOLO con JSON válido (sin markdown):
{"title": "título", "reference": "referencia", "explanation": "5-8 líneas", "reflection": "2-3 líneas", "sources": "fuentes", "scholarly_note": "nota académica"}`,
        user: `Enseñanza de Candomblé para ${date}`
      },
      mormon: {
        system: `Eres un erudito SUD. Responde SOLO en español.
Devuelve un pasaje sagrado para ${date} del Libro de Mormón con referencia exacta.
NO INVENTES citaciones. Todo contenido debe ser positivo.
Responde SOLO con JSON válido (sin markdown):
{"title": "título", "reference": "referencia", "explanation": "5-8 líneas", "reflection": "2-3 líneas", "sources": "fuentes", "scholarly_note": "nota académica"}`,
        user: `Versículo SUD para ${date}`
      },
      agnostic: {
        system: `Eres un filósofo erudito. Responde SOLO en español.
Devuelve una reflexión filosófica para ${date} con cita REAL de un filósofo real.
NO INVENTES citaciones. Usa solo citas reales.
Responde SOLO con JSON válido (sin markdown):
{"title": "título", "reference": "filósofo y obra", "explanation": "5-8 líneas", "reflection": "2-3 líneas", "sources": "fuentes", "scholarly_note": "nota académica"}`,
        user: `Reflexión filosófica para ${date}`
      },
    },
  };

  const langPrompts = prompts[lang] || prompts['pt-BR'];
  const rel = langPrompts[religion] || langPrompts['christian'];
  // Inject practical_use instruction into every system prompt
  const jsonFieldPt = ', "practical_use": "parágrafo prático"';
  const jsonFieldEn = ', "practical_use": "practical paragraph"';
  const jsonFieldEs = ', "practical_use": "párrafo práctico"';
  const jsonField = lang === 'en' ? jsonFieldEn : lang === 'es' ? jsonFieldEs : jsonFieldPt;
  // Add practical_use to system prompt and JSON format
  const updatedSystem = rel.system.replace(
    /("scholarly_note":\s*"[^"]*")\s*}/,
    `$1${jsonField}}`
  ) + practicalInstr;
  return { system: updatedSystem, user: rel.user };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { religion, language, userDate, timezone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Use user's local date when provided; fallback to UTC
    let date = userDate && /^\d{4}-\d{2}-\d{2}$/.test(userDate)
      ? userDate
      : new Date().toISOString().slice(0, 10);
    const rel = religion || 'christian';
    const lang = language || 'pt-BR';
    console.log(`Request: date=${date} tz=${timezone || 'UTC'} religion=${rel} lang=${lang}`);

    // Supabase client (used by parasha cache below and verse cache further down)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // For Jewish tradition, fetch the actual Parashá of the week from Hebcal (authoritative)
    // with weekly cache to avoid hitting Hebcal on every miss
    let parashaContext = '';
    if (rel === 'jewish') {
      try {
        // Compute week_start as the most recent Sunday for the user's date
        const d = new Date(date + 'T00:00:00Z');
        d.setUTCDate(d.getUTCDate() - d.getUTCDay()); // back to Sunday
        const weekStart = d.toISOString().slice(0, 10);

        // Try cache first
        const { data: cachedParasha } = await sb
          .from('parasha_cache')
          .select('name_en, name_he, torah_ref')
          .eq('week_start', weekStart)
          .maybeSingle();

        let name = cachedParasha?.name_en || '';
        let hebrew = cachedParasha?.name_he || '';
        let torahRef = cachedParasha?.torah_ref || '';

        if (!name) {
          // Cache miss — fetch from Hebcal
          const end = new Date(weekStart);
          end.setDate(end.getDate() + 7);
          const endStr = end.toISOString().slice(0, 10);
          const hebcalUrl = `https://www.hebcal.com/leyning?cfg=json&start=${weekStart}&end=${endStr}`;
          const hebRes = await fetch(hebcalUrl);
          if (hebRes.ok) {
            const hebData = await hebRes.json();
            const items = (hebData?.items || []) as any[];
            const parasha = items.find((it: any) => it?.parasha || it?.leyning?.torah || it?.name?.en);
            if (parasha) {
              name = parasha?.name?.en || parasha?.parasha || '';
              hebrew = parasha?.name?.he || '';
              torahRef = parasha?.leyning?.torah || parasha?.leyning?.fullkriyah?.['1']?.[0] || '';
              // Persist (fire and forget)
              sb.from('parasha_cache')
                .upsert({ week_start: weekStart, name_en: name, name_he: hebrew, torah_ref: torahRef }, { onConflict: 'week_start' })
                .then(({ error }) => {
                  if (error) console.error('Parasha cache write error:', error);
                  else console.log(`Parasha cached: ${weekStart} — ${name}`);
                });
            }
          } else {
            console.warn(`Hebcal failed: ${hebRes.status}`);
          }
        } else {
          console.log(`Parasha cache hit: ${weekStart} — ${name}`);
        }

        if (name) {
          parashaContext = `\n\nIMPORTANTE: A Parashá desta semana (${date}) é "${name}"${hebrew ? ` (${hebrew})` : ''}${torahRef ? `, leitura da Torá: ${torahRef}` : ''}. Use EXATAMENTE este nome e referência. Não invente outra parashá.`;
        }
      } catch (e) {
        console.warn('Parasha lookup error (non-fatal):', e);
      }
    }

    // Check verse cache
    const { data: cached } = await sb
      .from('daily_verse_cache')
      .select('verse_data')
      .eq('cache_date', date)
      .eq('religion', rel)
      .eq('language', lang)
      .maybeSingle();

    if (cached?.verse_data) {
      // For Jewish: validate cached verse matches current Parashá (avoid serving stale week)
      if (rel === 'jewish' && parashaContext) {
        const parashaName = parashaContext.match(/é "([^"]+)"/)?.[1] || '';
        const cachedTitle = String((cached.verse_data as any)?.title || '');
        // Compare normalized (strip diacritics, lowercase) — accept partial match
        const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const parashaTokens = norm(parashaName).split(/[\s-]+/).filter(t => t.length > 2);
        const titleN = norm(cachedTitle);
        const matches = parashaTokens.some(t => titleN.includes(t));
        if (!matches) {
          console.log(`Stale Jewish cache: title="${cachedTitle}" vs parasha="${parashaName}". Regenerating.`);
          await sb.from('daily_verse_cache')
            .delete()
            .eq('cache_date', date)
            .eq('religion', rel)
            .eq('language', lang);
        } else {
          console.log(`Cache hit: ${date}/${rel}/${lang}`);
          return new Response(JSON.stringify(cached.verse_data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        console.log(`Cache hit: ${date}/${rel}/${lang}`);
        return new Response(JSON.stringify(cached.verse_data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Cache miss — call AI
    console.log(`Cache miss: ${date}/${rel}/${lang}, calling AI`);
    const prompt = getVersePrompt(rel, lang, date);
    const systemContent = prompt.system + (parashaContext || '');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: prompt.user },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonStr = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("JSON parse error, raw:", raw);
      parsed = {
        title: "", reference: "", explanation: raw,
        reflection: "", sources: "", scholarly_note: "",
      };
    }

    // Store in cache (fire and forget)
    sb.from('daily_verse_cache')
      .upsert({
        cache_date: date,
        religion: rel,
        language: lang,
        verse_data: parsed,
      }, { onConflict: 'cache_date,religion,language' })
      .then(({ error }) => {
        if (error) console.error("Cache write error:", error);
        else console.log(`Cached: ${date}/${rel}/${lang}`);
      });

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("verse error:", e);
    return new Response(JSON.stringify({ error: "Error fetching verse" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
