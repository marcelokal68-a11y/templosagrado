import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Sparkles, Flame, Leaf, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

type DayGuide = {
  weekday: number; // 0 = Sunday, 1 = Monday, …
  day: { pt: string; en: string; es: string };
  orixa: string;
  falange: { pt: string; en: string; es: string };
  domain: { pt: string; en: string; es: string };
  // Tailwind utility classes built from design tokens via opacity layers + ring colors.
  // We avoid raw hex; we map each Orixá to a tasteful semantic + tonal accent.
  accent: {
    bgSoft: string;     // background of card
    border: string;     // border color
    chip: string;       // chip / tag color
    text: string;       // emphasized text
    glyphBg: string;    // icon container
  };
  colors: { pt: string; en: string; es: string };
  herbs: { pt: string[]; en: string[]; es: string[] };
  prayer: { pt: string; en: string; es: string };
  emoji: string;
};

// Mapping based on classical Umbanda day-rulership tradition (varies slightly by terreiro;
// this is the most widely accepted correspondence taught in introductory studies).
const GUIDES: DayGuide[] = [
  {
    weekday: 0,
    day: { pt: 'Domingo', en: 'Sunday', es: 'Domingo' },
    orixa: 'Oxalá',
    falange: { pt: 'Falange da Paz e da Fé', en: 'Phalanx of Peace and Faith', es: 'Falange de la Paz y la Fe' },
    domain: { pt: 'Pai maior, criação, fé serena', en: 'Greatest Father, creation, serene faith', es: 'Padre mayor, creación, fe serena' },
    accent: {
      bgSoft: 'bg-slate-50 dark:bg-slate-950/40',
      border: 'border-slate-300 dark:border-slate-700',
      chip: 'bg-slate-200/80 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
      text: 'text-slate-900 dark:text-slate-100',
      glyphBg: 'bg-slate-100 dark:bg-slate-900',
    },
    colors: { pt: 'Branco', en: 'White', es: 'Blanco' },
    herbs: {
      pt: ['Boldo', 'Girassol', 'Alecrim'],
      en: ['Boldo', 'Sunflower', 'Rosemary'],
      es: ['Boldo', 'Girasol', 'Romero'],
    },
    prayer: {
      pt: 'Oxalá, meu pai, cubra-me com seu manto branco de paz. Que minha fé seja firme e meu coração sereno. Saravá meu pai Oxalá!',
      en: 'Oxalá, my father, cover me with your white mantle of peace. May my faith be firm and my heart serene. Saravá my father Oxalá!',
      es: '¡Oxalá, mi padre, cúbreme con tu manto blanco de paz. Que mi fe sea firme y mi corazón sereno. Saravá mi padre Oxalá!',
    },
    emoji: '☀️',
  },
  {
    weekday: 1,
    day: { pt: 'Segunda-feira', en: 'Monday', es: 'Lunes' },
    orixa: 'Exu & Pomba-Gira',
    falange: { pt: 'Falange dos Guardiões da Lei', en: 'Phalanx of the Guardians of the Law', es: 'Falange de los Guardianes de la Ley' },
    domain: { pt: 'Caminhos, encruzilhadas, abertura de portas', en: 'Paths, crossroads, opening of doors', es: 'Caminos, encrucijadas, apertura de puertas' },
    accent: {
      bgSoft: 'bg-rose-50 dark:bg-rose-950/30',
      border: 'border-rose-300 dark:border-rose-800',
      chip: 'bg-rose-200/80 text-rose-950 dark:bg-rose-900 dark:text-rose-50',
      text: 'text-rose-950 dark:text-rose-100',
      glyphBg: 'bg-rose-100 dark:bg-rose-950',
    },
    colors: { pt: 'Vermelho e preto', en: 'Red and black', es: 'Rojo y negro' },
    herbs: {
      pt: ['Arruda', 'Guiné', 'Pimenteira'],
      en: ['Rue', 'Guiné', 'Pepper plant'],
      es: ['Ruda', 'Guiné', 'Pimentero'],
    },
    prayer: {
      pt: 'Seu Exu, guardião dos meus caminhos, abra as portas que devem se abrir e feche as que devem ficar fechadas. Laroyê Exu!',
      en: 'Senhor Exu, guardian of my paths, open the doors that must open and close those that must remain closed. Laroyê Exu!',
      es: '¡Señor Exu, guardián de mis caminos, abre las puertas que deben abrirse y cierra las que deben permanecer cerradas. Laroyê Exu!',
    },
    emoji: '🔥',
  },
  {
    weekday: 2,
    day: { pt: 'Terça-feira', en: 'Tuesday', es: 'Martes' },
    orixa: 'Ogum',
    falange: { pt: 'Falange dos Caboclos da Demanda', en: 'Phalanx of the Caboclos of the Quest', es: 'Falange de los Caboclos de la Demanda' },
    domain: { pt: 'Coragem, vitórias, abertura de demandas', en: 'Courage, victories, breakthroughs', es: 'Coraje, victorias, apertura de demandas' },
    accent: {
      bgSoft: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-300 dark:border-red-800',
      chip: 'bg-red-200/80 text-red-950 dark:bg-red-900 dark:text-red-50',
      text: 'text-red-950 dark:text-red-100',
      glyphBg: 'bg-red-100 dark:bg-red-950',
    },
    colors: { pt: 'Vermelho', en: 'Red', es: 'Rojo' },
    herbs: {
      pt: ['Espada-de-São-Jorge', 'Aroeira', 'Comigo-ninguém-pode'],
      en: ['Sword of Saint George', 'Aroeira', 'Dumb cane'],
      es: ['Espada de San Jorge', 'Aroeira', 'Caña muda'],
    },
    prayer: {
      pt: 'Ogum, meu pai guerreiro, dê-me coragem para vencer minhas batalhas com honra e justiça. Ogunhê meu pai Ogum!',
      en: 'Ogum, my warrior father, give me courage to win my battles with honor and justice. Ogunhê my father Ogum!',
      es: '¡Ogum, mi padre guerrero, dame coraje para vencer mis batallas con honor y justicia. Ogunhê mi padre Ogum!',
    },
    emoji: '⚔️',
  },
  {
    weekday: 3,
    day: { pt: 'Quarta-feira', en: 'Wednesday', es: 'Miércoles' },
    orixa: 'Xangô',
    falange: { pt: 'Falange da Justiça e da Sabedoria', en: 'Phalanx of Justice and Wisdom', es: 'Falange de la Justicia y la Sabiduría' },
    domain: { pt: 'Justiça divina, sabedoria, decisões firmes', en: 'Divine justice, wisdom, firm decisions', es: 'Justicia divina, sabiduría, decisiones firmes' },
    accent: {
      bgSoft: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-300 dark:border-amber-800',
      chip: 'bg-amber-200/80 text-amber-950 dark:bg-amber-900 dark:text-amber-50',
      text: 'text-amber-950 dark:text-amber-100',
      glyphBg: 'bg-amber-100 dark:bg-amber-950',
    },
    colors: { pt: 'Marrom e branco', en: 'Brown and white', es: 'Marrón y blanco' },
    herbs: {
      pt: ['Erva-de-Xangô (Sete-camadas)', 'Quaresmeira', 'Levante'],
      en: ['Xangô herb (Seven-layers)', 'Glory tree', 'Lemon balm'],
      es: ['Hierba de Xangô (Siete-capas)', 'Quaresmeira', 'Toronjil'],
    },
    prayer: {
      pt: 'Xangô, justiceiro e sábio, ilumine minhas decisões e traga justiça onde houver desequilíbrio. Kaô Cabecilê!',
      en: 'Xangô, just and wise, enlighten my decisions and bring justice where there is imbalance. Kaô Cabecilê!',
      es: '¡Xangô, justiciero y sabio, ilumina mis decisiones y trae justicia donde haya desequilibrio. Kaô Cabecilê!',
    },
    emoji: '⚖️',
  },
  {
    weekday: 4,
    day: { pt: 'Quinta-feira', en: 'Thursday', es: 'Jueves' },
    orixa: 'Oxóssi',
    falange: { pt: 'Falange dos Caboclos de Pena', en: 'Phalanx of the Feathered Caboclos', es: 'Falange de los Caboclos de Pluma' },
    domain: { pt: 'Conhecimento, fartura, ligação com a natureza', en: 'Knowledge, abundance, connection with nature', es: 'Conocimiento, abundancia, conexión con la naturaleza' },
    accent: {
      bgSoft: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-300 dark:border-emerald-800',
      chip: 'bg-emerald-200/80 text-emerald-950 dark:bg-emerald-900 dark:text-emerald-50',
      text: 'text-emerald-950 dark:text-emerald-100',
      glyphBg: 'bg-emerald-100 dark:bg-emerald-950',
    },
    colors: { pt: 'Verde', en: 'Green', es: 'Verde' },
    herbs: {
      pt: ['Alecrim-do-campo', 'Jurema', 'Sete-ervas'],
      en: ['Wild rosemary', 'Jurema', 'Seven-herbs'],
      es: ['Romero silvestre', 'Jurema', 'Siete-hierbas'],
    },
    prayer: {
      pt: 'Oxóssi, caçador das matas, traga fartura ao meu lar e conhecimento à minha mente. Okê Arô meu pai Oxóssi!',
      en: 'Oxóssi, hunter of the forests, bring abundance to my home and knowledge to my mind. Okê Arô my father Oxóssi!',
      es: '¡Oxóssi, cazador de los bosques, trae abundancia a mi hogar y conocimiento a mi mente. Okê Arô mi padre Oxóssi!',
    },
    emoji: '🏹',
  },
  {
    weekday: 5,
    day: { pt: 'Sexta-feira', en: 'Friday', es: 'Viernes' },
    orixa: 'Iansã & Pretos-Velhos',
    falange: { pt: 'Falange dos Pretos-Velhos da Ancestralidade', en: 'Phalanx of the Pretos-Velhos of Ancestry', es: 'Falange de los Pretos-Velhos de la Ancestralidad' },
    domain: { pt: 'Ancestralidade, paciência, transformação dos ventos', en: 'Ancestry, patience, transformation of the winds', es: 'Ancestralidad, paciencia, transformación de los vientos' },
    accent: {
      bgSoft: 'bg-violet-50 dark:bg-violet-950/30',
      border: 'border-violet-300 dark:border-violet-800',
      chip: 'bg-violet-200/80 text-violet-950 dark:bg-violet-900 dark:text-violet-50',
      text: 'text-violet-950 dark:text-violet-100',
      glyphBg: 'bg-violet-100 dark:bg-violet-950',
    },
    colors: { pt: 'Amarelo (Iansã) e branco/preto (Pretos-Velhos)', en: 'Yellow (Iansã) and white/black (Pretos-Velhos)', es: 'Amarillo (Iansã) y blanco/negro (Pretos-Velhos)' },
    herbs: {
      pt: ['Manjericão', 'Para-raio', 'Alfazema'],
      en: ['Basil', 'Lightning rod plant', 'Lavender'],
      es: ['Albahaca', 'Pararrayos', 'Lavanda'],
    },
    prayer: {
      pt: 'Vovô, vovó, sentem comigo no banquinho da humildade. Iansã, leve com seus ventos tudo o que não me serve mais. Eparrey Iansã, salve os Pretos-Velhos!',
      en: 'Grandfather, grandmother, sit with me on the bench of humility. Iansã, take with your winds all that no longer serves me. Eparrey Iansã, hail the Pretos-Velhos!',
      es: '¡Abuelo, abuela, siéntense conmigo en el banquito de la humildad. Iansã, llévate con tus vientos todo lo que ya no me sirve. Eparrey Iansã, salve los Pretos-Velhos!',
    },
    emoji: '🌬️',
  },
  {
    weekday: 6,
    day: { pt: 'Sábado', en: 'Saturday', es: 'Sábado' },
    orixa: 'Iemanjá & Oxum',
    falange: { pt: 'Falange das Águas — Maternidade e Amor', en: 'Phalanx of the Waters — Motherhood and Love', es: 'Falange de las Aguas — Maternidad y Amor' },
    domain: { pt: 'Amor, maternidade, águas que curam emoções', en: 'Love, motherhood, waters that heal emotions', es: 'Amor, maternidad, aguas que curan emociones' },
    accent: {
      bgSoft: 'bg-sky-50 dark:bg-sky-950/30',
      border: 'border-sky-300 dark:border-sky-800',
      chip: 'bg-sky-200/80 text-sky-950 dark:bg-sky-900 dark:text-sky-50',
      text: 'text-sky-950 dark:text-sky-100',
      glyphBg: 'bg-sky-100 dark:bg-sky-950',
    },
    colors: { pt: 'Azul-claro (Iemanjá) e amarelo-ouro (Oxum)', en: 'Light blue (Iemanjá) and golden yellow (Oxum)', es: 'Azul claro (Iemanjá) y amarillo oro (Oxum)' },
    herbs: {
      pt: ['Pringa-da-praia', 'Colônia', 'Camomila'],
      en: ['Beach pringa', 'Colônia (shell ginger)', 'Chamomile'],
      es: ['Pringa de playa', 'Colônia', 'Manzanilla'],
    },
    prayer: {
      pt: 'Mamãe Iemanjá, mãe das águas salgadas, e Mamãe Oxum, das águas doces, lavem minhas dores e me cubram de amor. Odoyá Iemanjá! Ora yêyê ô, mamãe Oxum!',
      en: 'Mother Iemanjá of the salt waters, and Mother Oxum of the sweet waters, wash my sorrows and cover me with love. Odoyá Iemanjá! Ora yêyê ô, mother Oxum!',
      es: '¡Madre Iemanjá de las aguas saladas, y Madre Oxum de las aguas dulces, laven mis dolores y cúbranme de amor. Odoyá Iemanjá! Ora yêyê ô, ¡madre Oxum!',
    },
    emoji: '🌊',
  },
];

interface Props {
  compact?: boolean;
}

export default function UmbandaDayGuide({ compact = false }: Props) {
  const { language } = useApp();
  const lang = (language === 'en' || language === 'es' ? language : 'pt') as 'pt' | 'en' | 'es';

  const today = new Date().getDay();
  const [selected, setSelected] = useState<number>(today);
  const guide = GUIDES[selected];

  const labels = {
    title: lang === 'en' ? 'Line of the Day — Umbanda' : lang === 'es' ? 'Línea del Día — Umbanda' : 'Linha do Dia — Umbanda',
    subtitle: lang === 'en'
      ? 'Each weekday is ruled by an Orixá and their phalanx. Tap a day to see colors, herbs, and a short prayer.'
      : lang === 'es'
        ? 'Cada día de la semana es regido por un Orixá y su falange. Toca un día para ver colores, hierbas y una oración corta.'
        : 'Cada dia da semana é regido por um Orixá e sua falange. Toque em um dia para ver cores, ervas e uma oração curta.',
    today: lang === 'en' ? 'Today' : lang === 'es' ? 'Hoy' : 'Hoje',
    falangeLbl: lang === 'en' ? 'Phalanx' : lang === 'es' ? 'Falange' : 'Falange',
    domainLbl: lang === 'en' ? 'Domain' : lang === 'es' ? 'Dominio' : 'Domínio',
    colorsLbl: lang === 'en' ? 'Colors' : lang === 'es' ? 'Colores' : 'Cores',
    herbsLbl: lang === 'en' ? 'Sacred herbs' : lang === 'es' ? 'Hierbas sagradas' : 'Ervas sagradas',
    prayerLbl: lang === 'en' ? 'Short prayer' : lang === 'es' ? 'Oración corta' : 'Oração curta',
    disclaimer: lang === 'en'
      ? 'Note: Day-rulership varies between terreiros. This is the most widely taught Umbanda correspondence.'
      : lang === 'es'
        ? 'Nota: La regencia de los días varía entre terreiros. Esta es la correspondencia más enseñada en la Umbanda.'
        : 'Obs.: A regência dos dias varia entre terreiros. Esta é a correspondência mais ensinada na Umbanda.',
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

      {/* Weekday selector */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-4">
        {GUIDES.map((g) => {
          const isSelected = g.weekday === selected;
          const isToday = g.weekday === today;
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
              {guide.emoji} {guide.orixa}
            </p>
          </div>
          <span className={cn('text-[11px] px-2 py-1 rounded-full font-medium', guide.accent.chip)}>
            {guide.falange[lang]}
          </span>
        </div>

        <p className="text-sm text-foreground/80 leading-relaxed">
          {guide.domain[lang]}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Colors */}
          <div className="rounded-md bg-background/70 p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1.5">
              <Flame className={cn('h-3.5 w-3.5', guide.accent.text)} />
              <span className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
                {labels.colorsLbl}
              </span>
            </div>
            <p className="text-sm text-foreground/90">{guide.colors[lang]}</p>
          </div>

          {/* Herbs */}
          <div className="rounded-md bg-background/70 p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1.5">
              <Leaf className={cn('h-3.5 w-3.5', guide.accent.text)} />
              <span className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
                {labels.herbsLbl}
              </span>
            </div>
            <ul className="text-sm text-foreground/90 space-y-0.5">
              {guide.herbs[lang].map((h) => (
                <li key={h} className="flex items-baseline gap-1.5">
                  <span className="text-muted-foreground">·</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Prayer */}
        <div className={cn('rounded-md p-3 border-l-4 bg-background/70', guide.accent.border)}>
          <div className="flex items-center gap-2 mb-1.5">
            <Heart className={cn('h-3.5 w-3.5', guide.accent.text)} />
            <span className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
              {labels.prayerLbl}
            </span>
          </div>
          <p className="text-sm italic text-foreground/90 leading-relaxed font-serif">
            "{guide.prayer[lang]}"
          </p>
        </div>

        <p className="text-[10px] text-muted-foreground italic pt-1">
          {labels.disclaimer}
        </p>
      </div>
    </Card>
  );
}
