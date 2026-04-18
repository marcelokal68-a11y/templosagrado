import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Sparkles, Palette, Utensils, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

type Lang = 'pt' | 'en' | 'es';

type DayGuide = {
  weekday: number; // 0 = Sunday, 1 = Monday…
  day: { pt: string; en: string; es: string };
  orixas: string;
  domain: { pt: string; en: string; es: string };
  accent: {
    bgSoft: string;
    border: string;
    chip: string;
    text: string;
    glyphBg: string;
  };
  colors: { pt: string; en: string; es: string };
  foods: { pt: string[]; en: string[]; es: string[] };
  greeting: string;
  greetingMeaning: { pt: string; en: string; es: string };
  emoji: string;
};

// Classical Candomblé day-rulership (Ketu/Nagô tradition).
// Sunday is left as a free/communal day in most terreiros — we omit it from the selector
// and fold its energy into Oxalá's correspondence on Friday, following common practice.
const GUIDES: DayGuide[] = [
  {
    weekday: 1,
    day: { pt: 'Segunda-feira', en: 'Monday', es: 'Lunes' },
    orixas: 'Exu & Obaluayê',
    domain: {
      pt: 'Abertura de caminhos (Exu) e cura/saúde (Obaluayê, senhor das pestes e da terra).',
      en: 'Opening of paths (Exu) and healing/health (Obaluayê, lord of pestilence and earth).',
      es: 'Apertura de caminos (Exu) y curación/salud (Obaluayê, señor de las pestes y de la tierra).',
    },
    accent: {
      bgSoft: 'bg-stone-50 dark:bg-stone-950/40',
      border: 'border-stone-400 dark:border-stone-700',
      chip: 'bg-stone-200/80 text-stone-950 dark:bg-stone-800 dark:text-stone-50',
      text: 'text-stone-900 dark:text-stone-100',
      glyphBg: 'bg-stone-100 dark:bg-stone-900',
    },
    colors: {
      pt: 'Vermelho e preto (Exu); preto, branco e palha-da-costa (Obaluayê)',
      en: 'Red and black (Exu); black, white and palha-da-costa straw (Obaluayê)',
      es: 'Rojo y negro (Exu); negro, blanco y paja de la costa (Obaluayê)',
    },
    foods: {
      pt: ['Padê de farofa de dendê (Exu)', 'Doburu / pipoca estourada na areia (Obaluayê)', 'Aluá de milho'],
      en: ['Padê — farofa with palm oil (Exu)', 'Doburu / popcorn popped in sand (Obaluayê)', 'Aluá (corn drink)'],
      es: ['Padê — farofa con dendê (Exu)', 'Doburu / palomitas reventadas en arena (Obaluayê)', 'Aluá de maíz'],
    },
    greeting: 'Laroyê, Exu! · Atotô, Obaluayê!',
    greetingMeaning: {
      pt: '"Laroyê" = saudação a Exu, abertura. "Atotô" = silêncio reverente diante de Obaluayê.',
      en: '"Laroyê" = salutation to Exu, opening. "Atotô" = reverent silence before Obaluayê.',
      es: '"Laroyê" = saludo a Exu, apertura. "Atotô" = silencio reverente ante Obaluayê.',
    },
    emoji: '🔥',
  },
  {
    weekday: 2,
    day: { pt: 'Terça-feira', en: 'Tuesday', es: 'Martes' },
    orixas: 'Ogum & Oxumarê',
    domain: {
      pt: 'Guerra justa, ferro e tecnologia (Ogum); arco-íris, ciclos e renovação (Oxumarê).',
      en: 'Just warfare, iron and technology (Ogum); rainbow, cycles and renewal (Oxumarê).',
      es: 'Guerra justa, hierro y tecnología (Ogum); arcoíris, ciclos y renovación (Oxumarê).',
    },
    accent: {
      bgSoft: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-400 dark:border-blue-800',
      chip: 'bg-blue-200/80 text-blue-950 dark:bg-blue-900 dark:text-blue-50',
      text: 'text-blue-950 dark:text-blue-100',
      glyphBg: 'bg-blue-100 dark:bg-blue-950',
    },
    colors: {
      pt: 'Azul-marinho ou verde-escuro (Ogum); verde e amarelo, ou todas as cores (Oxumarê)',
      en: 'Navy or dark green (Ogum); green and yellow, or all colors (Oxumarê)',
      es: 'Azul marino o verde oscuro (Ogum); verde y amarillo, o todos los colores (Oxumarê)',
    },
    foods: {
      pt: ['Feijoada de Ogum (sem dendê, com carne)', 'Inhame assado', 'Batata-doce com mel (Oxumarê)'],
      en: ['Ogum\'s feijoada (no palm oil, with meat)', 'Roasted yam', 'Sweet potato with honey (Oxumarê)'],
      es: ['Feijoada de Ogum (sin dendê, con carne)', 'Ñame asado', 'Batata dulce con miel (Oxumarê)'],
    },
    greeting: 'Ogunhê, meu pai! · Arroboboi, Oxumarê!',
    greetingMeaning: {
      pt: '"Ogunhê" = louvor a Ogum, vencedor de demandas. "Arroboboi" = saudação ao arco-íris-serpente.',
      en: '"Ogunhê" = praise to Ogum, conqueror of struggles. "Arroboboi" = salutation to the rainbow-serpent.',
      es: '"Ogunhê" = alabanza a Ogum, vencedor de demandas. "Arroboboi" = saludo a la serpiente-arcoíris.',
    },
    emoji: '⚔️',
  },
  {
    weekday: 3,
    day: { pt: 'Quarta-feira', en: 'Wednesday', es: 'Miércoles' },
    orixas: 'Xangô & Iansã',
    domain: {
      pt: 'Justiça, trovão e realeza (Xangô); ventos, tempestades e transformação (Iansã/Oyá).',
      en: 'Justice, thunder and royalty (Xangô); winds, storms and transformation (Iansã/Oyá).',
      es: 'Justicia, trueno y realeza (Xangô); vientos, tempestades y transformación (Iansã/Oyá).',
    },
    accent: {
      bgSoft: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-400 dark:border-red-800',
      chip: 'bg-red-200/80 text-red-950 dark:bg-red-900 dark:text-red-50',
      text: 'text-red-950 dark:text-red-100',
      glyphBg: 'bg-red-100 dark:bg-red-950',
    },
    colors: {
      pt: 'Vermelho e branco (Xangô); vermelho-coral / vinho (Iansã)',
      en: 'Red and white (Xangô); coral red / wine (Iansã)',
      es: 'Rojo y blanco (Xangô); rojo coral / vino (Iansã)',
    },
    foods: {
      pt: ['Amalá de Xangô (quiabo com camarão e dendê sobre inhame pilado)', 'Acarajé (Iansã)', 'Aberém'],
      en: ['Xangô\'s amalá (okra with shrimp and palm oil over pounded yam)', 'Acarajé (Iansã)', 'Aberém'],
      es: ['Amalá de Xangô (quingombó con camarón y dendê sobre ñame pilado)', 'Acarajé (Iansã)', 'Aberém'],
    },
    greeting: 'Kaô Cabecilê! · Eparrey, Oyá!',
    greetingMeaning: {
      pt: '"Kaô Cabecilê" = "Venham ver o rei chegar!", saudação a Xangô. "Eparrey" = grito de guerra de Iansã.',
      en: '"Kaô Cabecilê" = "Come see the king arrive!", salutation to Xangô. "Eparrey" = Iansã\'s war cry.',
      es: '"Kaô Cabecilê" = "¡Vengan a ver al rey llegar!", saludo a Xangô. "Eparrey" = grito de guerra de Iansã.',
    },
    emoji: '⚖️',
  },
  {
    weekday: 4,
    day: { pt: 'Quinta-feira', en: 'Thursday', es: 'Jueves' },
    orixas: 'Oxóssi & Ossain',
    domain: {
      pt: 'Caça, fartura e conhecimento das matas (Oxóssi); folhas sagradas e medicina ancestral (Ossain).',
      en: 'Hunt, abundance and forest knowledge (Oxóssi); sacred leaves and ancestral medicine (Ossain).',
      es: 'Caza, abundancia y conocimiento de los bosques (Oxóssi); hojas sagradas y medicina ancestral (Ossain).',
    },
    accent: {
      bgSoft: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-400 dark:border-emerald-800',
      chip: 'bg-emerald-200/80 text-emerald-950 dark:bg-emerald-900 dark:text-emerald-50',
      text: 'text-emerald-950 dark:text-emerald-100',
      glyphBg: 'bg-emerald-100 dark:bg-emerald-950',
    },
    colors: {
      pt: 'Verde-claro ou turquesa (Oxóssi); verde-folha (Ossain)',
      en: 'Light green or turquoise (Oxóssi); leaf green (Ossain)',
      es: 'Verde claro o turquesa (Oxóssi); verde hoja (Ossain)',
    },
    foods: {
      pt: ['Axoxó (milho vermelho com coco)', 'Frutas frescas da estação', 'Folhas sagradas em infusão (Ossain)'],
      en: ['Axoxó (red corn with coconut)', 'Fresh seasonal fruits', 'Sacred leaves in infusion (Ossain)'],
      es: ['Axoxó (maíz rojo con coco)', 'Frutas frescas de estación', 'Hojas sagradas en infusión (Ossain)'],
    },
    greeting: 'Okê Arô, Oxóssi! · Ewê ô, Ossain!',
    greetingMeaning: {
      pt: '"Okê Arô" = saudação ao caçador das matas. "Ewê ô" = "Salve as folhas!", louvor a Ossain.',
      en: '"Okê Arô" = salutation to the forest hunter. "Ewê ô" = "Hail the leaves!", praise to Ossain.',
      es: '"Okê Arô" = saludo al cazador de los bosques. "Ewê ô" = "¡Salve las hojas!", alabanza a Ossain.',
    },
    emoji: '🏹',
  },
  {
    weekday: 5,
    day: { pt: 'Sexta-feira', en: 'Friday', es: 'Viernes' },
    orixas: 'Oxalá',
    domain: {
      pt: 'Pai maior, criação da humanidade, paz e fé serena. Dia de obrigatório uso de branco.',
      en: 'Greatest father, creation of humanity, peace and serene faith. Day of mandatory white attire.',
      es: 'Padre mayor, creación de la humanidad, paz y fe serena. Día de uso obligatorio del blanco.',
    },
    accent: {
      bgSoft: 'bg-slate-50 dark:bg-slate-950/40',
      border: 'border-slate-400 dark:border-slate-700',
      chip: 'bg-slate-200/80 text-slate-950 dark:bg-slate-800 dark:text-slate-50',
      text: 'text-slate-900 dark:text-slate-100',
      glyphBg: 'bg-slate-100 dark:bg-slate-900',
    },
    colors: {
      pt: 'Branco puro (sem outras cores no corpo)',
      en: 'Pure white (no other colors on the body)',
      es: 'Blanco puro (sin otros colores en el cuerpo)',
    },
    foods: {
      pt: ['Ebô (canjica branca sem sal nem dendê)', 'Inhame pilado branco', 'Acaçá branco'],
      en: ['Ebô (white hominy, no salt, no palm oil)', 'White pounded yam', 'White acaçá'],
      es: ['Ebô (mote blanco sin sal ni dendê)', 'Ñame pilado blanco', 'Acaçá blanco'],
    },
    greeting: 'Epa Babá! · Exê-ê-ê Babá!',
    greetingMeaning: {
      pt: '"Epa Babá" = "Salve, pai!", saudação reverente a Oxalá, o mais velho dos orixás.',
      en: '"Epa Babá" = "Hail, father!", reverent salutation to Oxalá, the oldest of the orixás.',
      es: '"Epa Babá" = "¡Salve, padre!", saludo reverente a Oxalá, el más anciano de los orixás.',
    },
    emoji: '☁️',
  },
  {
    weekday: 6,
    day: { pt: 'Sábado', en: 'Saturday', es: 'Sábado' },
    orixas: 'Iemanjá & Oxum',
    domain: {
      pt: 'Mãe das águas salgadas e da maternidade (Iemanjá); águas doces, amor, ouro e vaidade sagrada (Oxum).',
      en: 'Mother of salt waters and motherhood (Iemanjá); fresh waters, love, gold and sacred vanity (Oxum).',
      es: 'Madre de las aguas saladas y la maternidad (Iemanjá); aguas dulces, amor, oro y vanidad sagrada (Oxum).',
    },
    accent: {
      bgSoft: 'bg-sky-50 dark:bg-sky-950/30',
      border: 'border-sky-400 dark:border-sky-800',
      chip: 'bg-sky-200/80 text-sky-950 dark:bg-sky-900 dark:text-sky-50',
      text: 'text-sky-950 dark:text-sky-100',
      glyphBg: 'bg-sky-100 dark:bg-sky-950',
    },
    colors: {
      pt: 'Azul-claro / cristal e prata (Iemanjá); amarelo-ouro (Oxum)',
      en: 'Light blue / crystal and silver (Iemanjá); golden yellow (Oxum)',
      es: 'Azul claro / cristal y plata (Iemanjá); amarillo oro (Oxum)',
    },
    foods: {
      pt: ['Manjar branco com calda de ameixa (Iemanjá)', 'Omolocum (feijão-fradinho com camarão e ovo)', 'Quindim e mel (Oxum)'],
      en: ['White manjar with plum syrup (Iemanjá)', 'Omolocum (black-eyed peas with shrimp and egg)', 'Quindim and honey (Oxum)'],
      es: ['Manjar blanco con almíbar de ciruela (Iemanjá)', 'Omolocum (frijol carita con camarón y huevo)', 'Quindim y miel (Oxum)'],
    },
    greeting: 'Odoyá, Iemanjá! · Ora yêyê ô, Oxum!',
    greetingMeaning: {
      pt: '"Odoyá" = saudação à mãe do mar. "Ora yêyê ô" = "Salve a mãezinha!", louvor a Oxum.',
      en: '"Odoyá" = salutation to the mother of the sea. "Ora yêyê ô" = "Hail the little mother!", praise to Oxum.',
      es: '"Odoyá" = saludo a la madre del mar. "Ora yêyê ô" = "¡Salve la madrecita!", alabanza a Oxum.',
    },
    emoji: '🌊',
  },
];

interface Props {
  compact?: boolean;
}

export default function CandombleDayGuide({ compact = false }: Props) {
  const { language } = useApp();
  const lang = (language === 'en' || language === 'es' ? language : 'pt') as Lang;

  const todayJs = new Date().getDay(); // 0..6
  // Default to today if mapped (1..6), else Friday (Oxalá).
  const defaultWeekday = GUIDES.some((g) => g.weekday === todayJs) ? todayJs : 5;
  const [selected, setSelected] = useState<number>(defaultWeekday);
  const guide = GUIDES.find((g) => g.weekday === selected) ?? GUIDES[0];

  const labels = {
    title: lang === 'en' ? 'Orixá of the Day — Candomblé' : lang === 'es' ? 'Orixá del Día — Candomblé' : 'Orixá do Dia — Candomblé',
    subtitle: lang === 'en'
      ? 'Each weekday in the Ketu/Nagô tradition is dedicated to one or two Orixás. Tap a day to see colors, votive foods, and the proper Yoruba salutation.'
      : lang === 'es'
        ? 'Cada día de la semana en la tradición Ketu/Nagô se dedica a uno o dos Orixás. Toca un día para ver colores, comidas votivas y el saludo yoruba correcto.'
        : 'Cada dia da semana na tradição Ketu/Nagô é dedicado a um ou dois Orixás. Toque em um dia para ver cores, comidas votivas e a saudação iorubá correta.',
    today: lang === 'en' ? 'Today' : lang === 'es' ? 'Hoy' : 'Hoje',
    domainLbl: lang === 'en' ? 'Domain' : lang === 'es' ? 'Dominio' : 'Domínio',
    colorsLbl: lang === 'en' ? 'Liturgical colors' : lang === 'es' ? 'Colores litúrgicos' : 'Cores litúrgicas',
    foodsLbl: lang === 'en' ? 'Votive foods' : lang === 'es' ? 'Comidas votivas' : 'Comidas votivas',
    greetingLbl: lang === 'en' ? 'Yoruba salutation' : lang === 'es' ? 'Saludo yoruba' : 'Saudação iorubá',
    disclaimer: lang === 'en'
      ? 'Note: Day-rulership follows the Ketu/Nagô lineage; Jeje and Angola houses may have variations. Sundays are typically reserved for community and ancestral celebrations.'
      : lang === 'es'
        ? 'Nota: La regencia sigue el linaje Ketu/Nagô; las casas Jeje y Angola pueden tener variaciones. Los domingos se reservan típicamente a celebraciones comunitarias y ancestrales.'
        : 'Obs.: A regência segue a linhagem Ketu/Nagô; casas Jeje e Angola podem ter variações. Domingos costumam ser reservados a celebrações comunitárias e ancestrais.',
  };

  return (
    <Card className={cn('p-4 sm:p-5 border-2', guide.accent.border, guide.accent.bgSoft, compact && 'mb-4')}>
      <div className="flex items-start gap-3 mb-4">
        <div className={cn('h-9 w-9 rounded-full flex items-center justify-center shrink-0', guide.accent.glyphBg)}>
          <Sparkles className={cn('h-4 w-4', guide.accent.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn('font-display font-semibold text-base sm:text-lg leading-tight', guide.accent.text)}>
            {labels.title}
          </h3>
          {!compact && (
            <p className="text-xs text-muted-foreground mt-1">{labels.subtitle}</p>
          )}
        </div>
      </div>

      {/* Weekday selector — 6 days (Mon–Sat) */}
      <div className="grid grid-cols-6 gap-1 sm:gap-1.5 mb-4">
        {GUIDES.map((g) => {
          const isSelected = g.weekday === selected;
          const isToday = g.weekday === todayJs;
          const dayShort = g.day[lang].slice(0, 3);
          return (
            <button
              key={g.weekday}
              onClick={() => setSelected(g.weekday)}
              className={cn(
                'flex flex-col items-center justify-center rounded-md py-2 px-1 text-[10px] sm:text-xs font-medium transition-all border',
                isSelected
                  ? cn(g.accent.chip, 'border-transparent shadow-sm scale-105')
                  : 'bg-background/60 border-border text-muted-foreground hover:bg-background hover:text-foreground'
              )}
              aria-label={g.day[lang]}
            >
              <span className="text-base leading-none mb-0.5">{g.emoji}</span>
              <span className="uppercase tracking-wide">{dayShort}</span>
              {isToday && (
                <span className="text-[8px] font-semibold mt-0.5 uppercase opacity-80">
                  {labels.today}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day details */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              {guide.day[lang]}
            </p>
            <p className={cn('font-display text-xl sm:text-2xl font-bold leading-tight', guide.accent.text)}>
              {guide.emoji} {guide.orixas}
            </p>
          </div>
        </div>

        <p className="text-sm text-foreground/80 leading-relaxed">
          {guide.domain[lang]}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Colors */}
          <div className="rounded-md bg-background/70 p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1.5">
              <Palette className={cn('h-3.5 w-3.5', guide.accent.text)} />
              <span className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
                {labels.colorsLbl}
              </span>
            </div>
            <p className="text-sm text-foreground/90">{guide.colors[lang]}</p>
          </div>

          {/* Foods */}
          <div className="rounded-md bg-background/70 p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1.5">
              <Utensils className={cn('h-3.5 w-3.5', guide.accent.text)} />
              <span className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
                {labels.foodsLbl}
              </span>
            </div>
            <ul className="text-sm text-foreground/90 space-y-0.5">
              {guide.foods[lang].map((f) => (
                <li key={f} className="flex items-baseline gap-1.5">
                  <span className="text-muted-foreground">·</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Greeting */}
        <div className={cn('rounded-md p-3 border-l-4 bg-background/70', guide.accent.border)}>
          <div className="flex items-center gap-2 mb-1.5">
            <Megaphone className={cn('h-3.5 w-3.5', guide.accent.text)} />
            <span className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
              {labels.greetingLbl}
            </span>
          </div>
          <p className={cn('text-base font-display font-semibold leading-tight mb-1', guide.accent.text)}>
            {guide.greeting}
          </p>
          <p className="text-xs italic text-foreground/75 leading-relaxed">
            {guide.greetingMeaning[lang]}
          </p>
        </div>

        <p className="text-[10px] text-muted-foreground italic pt-1">
          {labels.disclaimer}
        </p>
      </div>
    </Card>
  );
}
