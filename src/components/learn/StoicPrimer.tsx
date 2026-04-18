import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Columns, Crown, Dumbbell, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

type Lang = 'pt' | 'en' | 'es';

type Philosopher = {
  name: string;
  era: string;
  emoji: string;
  role: { pt: string; en: string; es: string };
  bio: { pt: string; en: string; es: string };
  quote: { pt: string; en: string; es: string };
};

const PHILOSOPHERS: Philosopher[] = [
  {
    name: 'Zenão de Cítio',
    era: 'c. 334–262 a.C.',
    emoji: '🏛️',
    role: { pt: 'Fundador do Estoicismo', en: 'Founder of Stoicism', es: 'Fundador del Estoicismo' },
    bio: {
      pt: 'Mercador fenício que naufragou em Atenas e descobriu a filosofia em uma livraria. Ensinava sob a Stoa Poikile (Pórtico Pintado) — daí o nome "estoico". Estabeleceu as três partes da filosofia: lógica, física e ética.',
      en: 'Phoenician merchant who shipwrecked in Athens and discovered philosophy in a bookshop. Taught under the Stoa Poikile (Painted Porch) — hence the name "Stoic". Established the three parts of philosophy: logic, physics, and ethics.',
      es: 'Mercader fenicio que naufragó en Atenas y descubrió la filosofía en una librería. Enseñaba bajo la Stoa Poikile (Pórtico Pintado) — de ahí el nombre "estoico". Estableció las tres partes de la filosofía: lógica, física y ética.',
    },
    quote: {
      pt: '"O homem conquista o mundo conquistando a si mesmo."',
      en: '"Man conquers the world by conquering himself."',
      es: '"El hombre conquista el mundo conquistándose a sí mismo."',
    },
  },
  {
    name: 'Crisipo de Solis',
    era: 'c. 279–206 a.C.',
    emoji: '📜',
    role: { pt: 'Segundo fundador — sistematizador', en: 'Second founder — the systematizer', es: 'Segundo fundador — sistematizador' },
    bio: {
      pt: 'Terceiro líder da Stoa, escreveu mais de 700 obras (quase todas perdidas). Desenvolveu a lógica proposicional estoica, antecipando logicistas modernos em 2000 anos. Diziam: "Sem Crisipo, não haveria Stoa."',
      en: 'Third head of the Stoa, wrote over 700 works (nearly all lost). Developed Stoic propositional logic, anticipating modern logicians by 2000 years. It was said: "Without Chrysippus, there would be no Stoa."',
      es: 'Tercer líder de la Stoa, escribió más de 700 obras (casi todas perdidas). Desarrolló la lógica proposicional estoica, anticipándose a los lógicos modernos en 2000 años. Decían: "Sin Crisipo, no habría Stoa."',
    },
    quote: {
      pt: '"Vivam de acordo com a natureza — a sua e a do todo."',
      en: '"Live according to nature — your own and the whole."',
      es: '"Vivan de acuerdo con la naturaleza — la suya y la del todo."',
    },
  },
  {
    name: 'Sêneca',
    era: '4 a.C.–65 d.C.',
    emoji: '✍️',
    role: { pt: 'Estoico romano — tutor de Nero', en: 'Roman Stoic — Nero\'s tutor', es: 'Estoico romano — tutor de Nerón' },
    bio: {
      pt: 'Filósofo, dramaturgo e estadista. Suas Cartas a Lucílio são guia prático para a vida boa. Forçado por Nero a se suicidar, enfrentou a morte com a mesma serenidade que pregava. Mestre da brevidade da vida.',
      en: 'Philosopher, playwright, and statesman. His Letters to Lucilius are a practical guide to the good life. Forced by Nero to commit suicide, he faced death with the same serenity he preached. Master of "the shortness of life".',
      es: 'Filósofo, dramaturgo y estadista. Sus Cartas a Lucilio son guía práctica para la vida buena. Forzado por Nerón al suicidio, enfrentó la muerte con la misma serenidad que predicaba. Maestro de la brevedad de la vida.',
    },
    quote: {
      pt: '"Não é que tenhamos pouco tempo: é que perdemos muito."',
      en: '"It is not that we have a short time to live, but that we waste a lot of it."',
      es: '"No es que tengamos poco tiempo: es que perdemos mucho."',
    },
  },
  {
    name: 'Epicteto',
    era: 'c. 50–135 d.C.',
    emoji: '⛓️',
    role: { pt: 'Escravo libertado, mestre prático', en: 'Freed slave, practical master', es: 'Esclavo liberto, maestro práctico' },
    bio: {
      pt: 'Nasceu escravo em Hierápolis. Conquistou a liberdade e fundou escola em Nicópolis. Não escreveu nada — seus ensinamentos sobrevivem nos Discursos e no Enchirídion (Manual), redigidos pelo aluno Arriano. Foco total na dicotomia do controle.',
      en: 'Born a slave in Hierapolis. Won his freedom and founded a school in Nicopolis. Wrote nothing — his teachings survive in the Discourses and the Enchiridion (Handbook), recorded by his student Arrian. Total focus on the dichotomy of control.',
      es: 'Nació esclavo en Hierápolis. Conquistó la libertad y fundó escuela en Nicópolis. No escribió nada — sus enseñanzas sobreviven en los Discursos y el Enquiridión (Manual), redactados por su alumno Arriano. Foco total en la dicotomía del control.',
    },
    quote: {
      pt: '"Não são as coisas que perturbam os homens, mas suas opiniões sobre as coisas."',
      en: '"Men are disturbed not by things, but by the views which they take of them."',
      es: '"No son las cosas las que perturban a los hombres, sino sus opiniones sobre las cosas."',
    },
  },
  {
    name: 'Marco Aurélio',
    era: '121–180 d.C.',
    emoji: '👑',
    role: { pt: 'Imperador-filósofo', en: 'Philosopher-emperor', es: 'Emperador-filósofo' },
    bio: {
      pt: 'Último dos "cinco bons imperadores" de Roma. Suas Meditações foram anotações privadas para autoexame, nunca destinadas à publicação — por isso tão sinceras. Governou um império enquanto cultivava virtude interior nas trincheiras das guerras germânicas.',
      en: 'Last of the "Five Good Emperors" of Rome. His Meditations were private notes for self-examination, never intended for publication — hence so sincere. Ruled an empire while cultivating inner virtue in the trenches of the Germanic wars.',
      es: 'Último de los "cinco buenos emperadores" de Roma. Sus Meditaciones fueron anotaciones privadas para autoexamen, nunca destinadas a la publicación — por eso tan sinceras. Gobernó un imperio mientras cultivaba virtud interior en las trincheras de las guerras germánicas.',
    },
    quote: {
      pt: '"Tens poder sobre tua mente — não sobre os eventos externos. Compreende isso e encontrarás força."',
      en: '"You have power over your mind — not outside events. Realize this, and you will find strength."',
      es: '"Tienes poder sobre tu mente — no sobre los eventos externos. Compréndelo y hallarás fuerza."',
    },
  },
];

type Concept = {
  title: string;
  latin?: string;
  emoji: string;
  short: { pt: string; en: string; es: string };
  practice: { pt: string; en: string; es: string };
};

const CONCEPTS: Concept[] = [
  {
    title: 'Dicotomia do Controle',
    latin: 'τὰ ἐφ\' ἡμῖν / τὰ οὐκ ἐφ\' ἡμῖν',
    emoji: '🎯',
    short: {
      pt: 'A pedra angular de Epicteto: separe rigorosamente o que depende de você (suas opiniões, intenções, esforços) do que não depende (corpo, reputação, riqueza, eventos). Sofrimento nasce de querer controlar o incontrolável.',
      en: 'Epictetus\'s cornerstone: rigorously separate what depends on you (your opinions, intentions, efforts) from what does not (body, reputation, wealth, events). Suffering arises from wanting to control the uncontrollable.',
      es: 'La piedra angular de Epicteto: separe rigurosamente lo que depende de usted (sus opiniones, intenciones, esfuerzos) de lo que no (cuerpo, reputación, riqueza, eventos). El sufrimiento nace de querer controlar lo incontrolable.',
    },
    practice: {
      pt: 'Antes de qualquer reação, pergunte: "Isto está sob meu controle?" Se sim, aja com vigor. Se não, aceite com serenidade.',
      en: 'Before any reaction, ask: "Is this within my control?" If yes, act vigorously. If not, accept serenely.',
      es: 'Antes de cualquier reacción, pregunte: "¿Esto está bajo mi control?" Si sí, actúe con vigor. Si no, acepte con serenidad.',
    },
  },
  {
    title: 'Amor Fati',
    latin: 'amor fati — "amor ao destino"',
    emoji: '🌹',
    short: {
      pt: 'Não apenas suportar o que acontece, mas amá-lo. Tudo que ocorre é parte da Razão Universal (Logos). Nietzsche, séculos depois, retomou: "Minha fórmula para a grandeza no homem é amor fati."',
      en: 'Not merely enduring what happens, but loving it. All that occurs is part of Universal Reason (Logos). Nietzsche, centuries later, echoed: "My formula for greatness in a human being is amor fati."',
      es: 'No solo soportar lo que sucede, sino amarlo. Todo lo que ocurre es parte de la Razón Universal (Logos). Nietzsche, siglos después, retomó: "Mi fórmula para la grandeza en el hombre es amor fati."',
    },
    practice: {
      pt: 'Quando algo difícil acontecer, diga em voz alta: "Isto também faz parte. Eu acolho." Transforme obstáculo em material de virtude.',
      en: 'When something difficult happens, say aloud: "This too is part of it. I welcome it." Turn obstacles into material for virtue.',
      es: 'Cuando algo difícil suceda, diga en voz alta: "Esto también forma parte. Lo acojo." Transforme obstáculo en material de virtud.',
    },
  },
  {
    title: 'Premeditatio Malorum',
    latin: 'premeditatio malorum — "premeditação dos males"',
    emoji: '🌫️',
    short: {
      pt: 'Visualizar deliberadamente os piores cenários: perda da saúde, do trabalho, dos entes queridos. Não para se afligir, mas para inocular contra o choque, valorizar o presente e descobrir que o medo é maior que o mal.',
      en: 'Deliberately visualize worst-case scenarios: loss of health, job, loved ones. Not to grieve, but to inoculate against shock, treasure the present, and discover that fear is greater than the harm.',
      es: 'Visualizar deliberadamente los peores escenarios: pérdida de la salud, del trabajo, de los seres queridos. No para afligirse, sino para inocularse contra el choque, valorar el presente y descubrir que el miedo es mayor que el mal.',
    },
    practice: {
      pt: 'Reserve 5 minutos pela manhã para imaginar perder algo importante. Depois retorne à vida com gratidão renovada.',
      en: 'Set aside 5 minutes in the morning to imagine losing something important. Then return to life with renewed gratitude.',
      es: 'Reserve 5 minutos por la mañana para imaginar perder algo importante. Luego vuelva a la vida con gratitud renovada.',
    },
  },
  {
    title: 'Vista de Cima',
    latin: 'view from above',
    emoji: '🌍',
    short: {
      pt: 'Exercício de Marco Aurélio: imaginar-se elevando-se sobre a cidade, depois sobre o continente, depois sobre o planeta — e contemplar a pequenez das próprias preocupações no panorama cósmico. Devolve perspectiva.',
      en: 'Marcus Aurelius\'s exercise: imagine yourself rising above your city, then the continent, then the planet — and contemplate the smallness of your worries in the cosmic panorama. Restores perspective.',
      es: 'Ejercicio de Marco Aurelio: imaginarse elevándose sobre la ciudad, luego sobre el continente, luego sobre el planeta — y contemplar la pequeñez de las propias preocupaciones en el panorama cósmico. Devuelve perspectiva.',
    },
    practice: {
      pt: 'Nos momentos de raiva ou ansiedade, feche os olhos e "suba": daqui a 100 anos, isto importará?',
      en: 'In moments of anger or anxiety, close your eyes and "rise": in 100 years, will this matter?',
      es: 'En momentos de ira o ansiedad, cierre los ojos y "suba": dentro de 100 años, ¿esto importará?',
    },
  },
];

type Comparison = {
  axis: { pt: string; en: string; es: string };
  stoic: { pt: string; en: string; es: string };
  epicurean: { pt: string; en: string; es: string };
};

const COMPARISONS: Comparison[] = [
  {
    axis: { pt: 'Bem supremo', en: 'Highest good', es: 'Bien supremo' },
    stoic: { pt: 'Virtude (areté) — viver de acordo com a Razão.', en: 'Virtue (areté) — living according to Reason.', es: 'Virtud (areté) — vivir de acuerdo con la Razón.' },
    epicurean: { pt: 'Prazer (hedoné) — ausência de dor física e mental (ataraxia).', en: 'Pleasure (hedoné) — absence of physical and mental pain (ataraxia).', es: 'Placer (hedoné) — ausencia de dolor físico y mental (ataraxia).' },
  },
  {
    axis: { pt: 'Visão dos deuses', en: 'View of the gods', es: 'Visión de los dioses' },
    stoic: { pt: 'Providência divina ativa — Logos permeia tudo.', en: 'Active divine providence — Logos permeates everything.', es: 'Providencia divina activa — Logos permea todo.' },
    epicurean: { pt: 'Deuses existem mas não interferem — vivem em ataraxia entre os mundos.', en: 'Gods exist but do not interfere — they live in ataraxia between worlds.', es: 'Dioses existen pero no interfieren — viven en ataraxia entre los mundos.' },
  },
  {
    axis: { pt: 'Vida pública', en: 'Public life', es: 'Vida pública' },
    stoic: { pt: 'Dever cosmopolita — participar ativamente da pólis.', en: 'Cosmopolitan duty — actively participate in the polis.', es: 'Deber cosmopolita — participar activamente en la polis.' },
    epicurean: { pt: '"Lathe biósas" — viva escondido. Evite política e multidões.', en: '"Lathe biósas" — live hidden. Avoid politics and crowds.', es: '"Lathe biósas" — vive oculto. Evita política y multitudes.' },
  },
  {
    axis: { pt: 'Diante da dor', en: 'Facing pain', es: 'Ante el dolor' },
    stoic: { pt: 'Suportar com indiferença — a dor é "preferível evitar" mas não é mal.', en: 'Endure with indifference — pain is "preferable to avoid" but not evil.', es: 'Soportar con indiferencia — el dolor es "preferible evitar" pero no es mal.' },
    epicurean: { pt: 'Minimizar inteligentemente — buscar prazeres duradouros, evitar dores intensas.', en: 'Intelligently minimize — seek lasting pleasures, avoid intense pains.', es: 'Minimizar inteligentemente — buscar placeres duraderos, evitar dolores intensos.' },
  },
  {
    axis: { pt: 'Morte', en: 'Death', es: 'Muerte' },
    stoic: { pt: 'Retorno ao Logos — natural, indiferente, oportunidade de virtude final.', en: 'Return to the Logos — natural, indifferent, opportunity for final virtue.', es: 'Retorno al Logos — natural, indiferente, oportunidad de virtud final.' },
    epicurean: { pt: '"Quando ela está, eu não estou; quando eu estou, ela não está." Não temer.', en: '"When it is, I am not; when I am, it is not." Do not fear.', es: '"Cuando ella está, yo no estoy; cuando yo estoy, ella no está." No temer.' },
  },
];

interface Props {
  compact?: boolean;
}

export default function StoicPrimer({ compact = false }: Props) {
  const { language } = useApp();
  const lang = (language === 'en' || language === 'es' ? language : 'pt') as Lang;
  const [tab, setTab] = useState<'philosophers' | 'concepts' | 'vs'>('philosophers');

  const labels = {
    title: lang === 'en' ? 'Stoicism — Visual Primer' : lang === 'es' ? 'Estoicismo — Guía Visual' : 'Estoicismo — Guia Visual',
    subtitle: lang === 'en'
      ? 'From Zeno to Marcus Aurelius: thinkers, practices, and how it differs from Epicureanism.'
      : lang === 'es'
        ? 'De Zenón a Marco Aurelio: pensadores, prácticas y en qué se diferencia del Epicureísmo.'
        : 'De Zenão a Marco Aurélio: pensadores, práticas e como difere do Epicurismo.',
    tabPhilosophers: lang === 'en' ? 'Philosophers' : lang === 'es' ? 'Filósofos' : 'Filósofos',
    tabConcepts: lang === 'en' ? 'Key practices' : lang === 'es' ? 'Prácticas clave' : 'Práticas-chave',
    tabVs: lang === 'en' ? 'Stoicism vs Epicureanism' : lang === 'es' ? 'Estoicismo vs Epicureísmo' : 'Estoicismo vs Epicurismo',
    practiceLbl: lang === 'en' ? 'Daily practice' : lang === 'es' ? 'Práctica diaria' : 'Prática diária',
    stoicCol: lang === 'en' ? 'Stoicism' : lang === 'es' ? 'Estoicismo' : 'Estoicismo',
    epicCol: lang === 'en' ? 'Epicureanism' : lang === 'es' ? 'Epicureísmo' : 'Epicurismo',
  };

  return (
    <Card className={cn('p-4 sm:p-5 border-2 border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/60 via-background to-stone-50/60 dark:from-amber-950/20 dark:via-background dark:to-stone-950/30', compact && 'mb-4')}>
      <div className="flex items-start gap-3 mb-4">
        <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
          <Columns className="h-4 w-4 text-amber-700 dark:text-amber-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-base sm:text-lg leading-tight text-foreground">
            {labels.title}
          </h3>
          {!compact && (
            <p className="text-xs text-muted-foreground mt-1">{labels.subtitle}</p>
          )}
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="grid w-full grid-cols-3 mb-4 h-auto">
          <TabsTrigger value="philosophers" className="text-[11px] sm:text-xs gap-1.5 py-2">
            <Crown className="h-3 w-3" />
            <span className="truncate">{labels.tabPhilosophers}</span>
          </TabsTrigger>
          <TabsTrigger value="concepts" className="text-[11px] sm:text-xs gap-1.5 py-2">
            <Dumbbell className="h-3 w-3" />
            <span className="truncate">{labels.tabConcepts}</span>
          </TabsTrigger>
          <TabsTrigger value="vs" className="text-[11px] sm:text-xs gap-1.5 py-2">
            <Scale className="h-3 w-3" />
            <span className="truncate">{labels.tabVs}</span>
          </TabsTrigger>
        </TabsList>

        {/* PHILOSOPHERS */}
        <TabsContent value="philosophers" className="space-y-3 mt-0">
          {PHILOSOPHERS.map((p) => (
            <div key={p.name} className="rounded-md border border-border/60 bg-background/70 p-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0 leading-none mt-0.5">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="font-display font-semibold text-sm sm:text-base text-foreground leading-tight">
                      {p.name}
                    </p>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-mono">
                      {p.era}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300 mt-0.5 mb-1.5">
                    {p.role[lang]}
                  </p>
                  <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                    {p.bio[lang]}
                  </p>
                  <blockquote className="mt-2 text-xs italic text-foreground/70 border-l-2 border-amber-300 dark:border-amber-700 pl-2.5 font-serif">
                    {p.quote[lang]}
                  </blockquote>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* CONCEPTS */}
        <TabsContent value="concepts" className="space-y-3 mt-0">
          {CONCEPTS.map((c) => (
            <div key={c.title} className="rounded-md border border-border/60 bg-background/70 p-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0 leading-none mt-0.5">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm sm:text-base text-foreground leading-tight">
                    {c.title}
                  </p>
                  {c.latin && (
                    <p className="text-[10px] italic text-muted-foreground mt-0.5 font-mono">
                      {c.latin}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed mt-1.5">
                    {c.short[lang]}
                  </p>
                  <div className="mt-2 rounded bg-amber-50 dark:bg-amber-950/40 border-l-2 border-amber-400 dark:border-amber-600 px-2.5 py-1.5">
                    <p className="text-[10px] uppercase tracking-wide font-semibold text-amber-800 dark:text-amber-300 mb-0.5">
                      {labels.practiceLbl}
                    </p>
                    <p className="text-xs text-foreground/85 leading-relaxed">
                      {c.practice[lang]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* VS EPICUREANISM */}
        <TabsContent value="vs" className="mt-0">
          {/* Mobile: cards */}
          <div className="space-y-3 sm:hidden">
            {COMPARISONS.map((c) => (
              <div key={c.axis.pt} className="rounded-md border border-border/60 bg-background/70 p-3">
                <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground mb-2">
                  {c.axis[lang]}
                </p>
                <div className="space-y-2">
                  <div className="rounded bg-amber-50 dark:bg-amber-950/30 border-l-2 border-amber-500 px-2.5 py-1.5">
                    <p className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 mb-0.5">
                      🏛️ {labels.stoicCol}
                    </p>
                    <p className="text-xs text-foreground/85 leading-relaxed">{c.stoic[lang]}</p>
                  </div>
                  <div className="rounded bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-emerald-500 px-2.5 py-1.5">
                    <p className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 mb-0.5">
                      🍇 {labels.epicCol}
                    </p>
                    <p className="text-xs text-foreground/85 leading-relaxed">{c.epicurean[lang]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block rounded-md border border-border/60 bg-background/70 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  <th className="text-left p-2.5 font-semibold text-muted-foreground uppercase tracking-wide text-[10px] w-[20%]">
                    &nbsp;
                  </th>
                  <th className="text-left p-2.5 font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide text-[10px]">
                    🏛️ {labels.stoicCol}
                  </th>
                  <th className="text-left p-2.5 font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide text-[10px]">
                    🍇 {labels.epicCol}
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISONS.map((c, i) => (
                  <tr key={c.axis.pt} className={cn('border-b border-border/40 last:border-0', i % 2 === 1 && 'bg-muted/20')}>
                    <td className="p-2.5 align-top font-semibold text-foreground text-xs">
                      {c.axis[lang]}
                    </td>
                    <td className="p-2.5 align-top text-foreground/85 leading-relaxed">
                      {c.stoic[lang]}
                    </td>
                    <td className="p-2.5 align-top text-foreground/85 leading-relaxed">
                      {c.epicurean[lang]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
