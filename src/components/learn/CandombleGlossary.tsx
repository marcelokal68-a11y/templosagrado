import { useApp } from '@/contexts/AppContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BookOpen, Sparkles } from 'lucide-react';

type Term = {
  term: string;
  origin: string;
  pt: string;
  en: string;
  es: string;
  emoji: string;
};

const TERMS: Term[] = [
  {
    term: 'Olorum',
    origin: 'Iorubá: Ọlọ́run — "Senhor do Céu"',
    emoji: '☁️',
    pt: 'Deus supremo, criador absoluto e fonte de todo Axé. Não tem culto direto, templos ou imagens — sua vontade é mediada pelos Orixás. Equivalente conceitual ao Olodumare, o princípio infinito.',
    en: 'Supreme God, absolute creator and source of all Axé. Has no direct cult, temples, or images — His will is mediated by the Orixás. Conceptually equivalent to Olodumare, the infinite principle.',
    es: 'Dios supremo, creador absoluto y fuente de todo Axé. No tiene culto directo, templos ni imágenes — su voluntad es mediada por los Orixás. Equivalente conceptual a Olodumare, el principio infinito.',
  },
  {
    term: 'Orixá',
    origin: 'Iorubá: òrìṣà — divindade',
    emoji: '🕯️',
    pt: 'Divindade ancestral que rege uma força da natureza e um arquétipo humano. No Candomblé Ketu cultuam-se cerca de 16 Orixás principais. Cada iniciado pertence a um Orixá de cabeça (regente) e um juntó (segundo).',
    en: 'Ancestral deity who rules a force of nature and a human archetype. About 16 main Orixás are worshiped in Candomblé Ketu. Each initiate belongs to a head Orixá (regent) and a juntó (secondary).',
    es: 'Divinidad ancestral que rige una fuerza de la naturaleza y un arquetipo humano. En el Candomblé Ketu se cultivan cerca de 16 Orixás principales. Cada iniciado pertenece a un Orixá de cabeza (regente) y un juntó (segundo).',
  },
  {
    term: 'Axé',
    origin: 'Iorubá: àṣẹ — força vital',
    emoji: '✨',
    pt: 'Energia sagrada que sustenta o universo. Está nas folhas, sangue, água, dendê, no canto e na palavra. Todo ritual visa concentrar e distribuir Axé — é o que mantém o terreiro "vivo" e a comunidade equilibrada.',
    en: 'Sacred energy that sustains the universe. Dwells in leaves, blood, water, palm oil, song, and the spoken word. Every ritual aims to concentrate and distribute Axé — it is what keeps the terreiro "alive" and the community balanced.',
    es: 'Energía sagrada que sostiene el universo. Habita en las hojas, sangre, agua, dendê, el canto y la palabra. Todo ritual busca concentrar y distribuir Axé — es lo que mantiene al terreiro "vivo" y a la comunidad equilibrada.',
  },
  {
    term: 'Orí',
    origin: 'Iorubá: orí — cabeça',
    emoji: '🧠',
    pt: 'Não é só a cabeça física, mas o destino individual escolhido antes de nascer e a porção divina dentro de cada pessoa. Cuidar do Orí (com Bori, ervas, abstinências) é a base de toda iniciação no Candomblé.',
    en: 'Not just the physical head, but the individual destiny chosen before birth and the divine portion within each person. Caring for Orí (through Bori, herbs, abstinence) is the foundation of all initiation in Candomblé.',
    es: 'No es solo la cabeza física, sino el destino individual elegido antes de nacer y la porción divina dentro de cada persona. Cuidar del Orí (con Bori, hierbas, abstinencias) es la base de toda iniciación en el Candomblé.',
  },
  {
    term: 'Iaô',
    origin: 'Iorubá: ìyàwó — esposa, noiva do Orixá',
    emoji: '👰',
    pt: 'Iniciado(a) recém-feito(a) ao santo, no período de 7 anos após a iniciação ("ano em ano"). Veste branco, segue interdições alimentares e comportamentais e aprende os fundamentos da casa antes de "tomar deká" (autonomia ritual).',
    en: 'Newly initiated person to the saint, during the 7-year period after initiation ("year by year"). Wears white, follows food and behavioral restrictions, and learns the house\'s fundamentals before "taking deká" (ritual autonomy).',
    es: 'Iniciado(a) recién hecho(a) al santo, durante el período de 7 años tras la iniciación ("año tras año"). Viste blanco, sigue interdicciones alimentarias y de comportamiento y aprende los fundamentos de la casa antes de "tomar deká" (autonomía ritual).',
  },
  {
    term: 'Iyalorixá',
    origin: 'Iorubá: ìyá + olórìṣà — "Mãe do Orixá"',
    emoji: '👑',
    pt: 'Sacerdotisa máxima de um terreiro (também chamada Mãe-de-santo). Equivalente masculino: Babalorixá (Pai-de-santo). Conduz iniciações, jogos de búzios, festas públicas e responde pela linhagem espiritual da casa.',
    en: 'Highest priestess of a terreiro (also called Mãe-de-santo). Male equivalent: Babalorixá (Pai-de-santo). Conducts initiations, cowrie divinations, public feasts, and is responsible for the spiritual lineage of the house.',
    es: 'Sacerdotisa máxima de un terreiro (también llamada Mãe-de-santo). Equivalente masculino: Babalorixá (Pai-de-santo). Conduce iniciaciones, juegos de búzios, fiestas públicas y responde por el linaje espiritual de la casa.',
  },
  {
    term: 'Ogã',
    origin: 'Iorubá: ògan — homem-honra',
    emoji: '🥁',
    pt: 'Cargo masculino confirmado (não inicia em transe). Subdivide-se em Alabê (toca os atabaques sagrados), Axogum (sacrifica os animais ritualmente) e Pejigã (cuida dos altares dos Orixás). É pilar protetor do terreiro.',
    en: 'Male confirmed position (does not enter trance). Subdivided into Alabê (plays the sacred atabaque drums), Axogum (ritually sacrifices animals), and Pejigã (takes care of the Orixás\' altars). A protective pillar of the terreiro.',
    es: 'Cargo masculino confirmado (no entra en trance). Se subdivide en Alabê (toca los atabaques sagrados), Axogum (sacrifica los animales ritualmente) y Pejigã (cuida los altares de los Orixás). Pilar protector del terreiro.',
  },
  {
    term: 'Ekedi',
    origin: 'Iorubá: ẹkẹ́jì — segunda, ajudante',
    emoji: '🤲',
    pt: 'Cargo feminino confirmado, não entra em transe. É quem cuida dos Orixás incorporados durante a festa: arruma vestes, conduz pela mão, oferece água. "Mão direita" da Iyalorixá no chão sagrado.',
    en: 'Female confirmed position, does not enter trance. The one who cares for incorporated Orixás during the feast: arranges robes, guides by the hand, offers water. The Iyalorixá\'s "right hand" on sacred ground.',
    es: 'Cargo femenino confirmado, no entra en trance. Es quien cuida de los Orixás incorporados durante la fiesta: arregla vestes, conduce de la mano, ofrece agua. "Mano derecha" de la Iyalorixá en el suelo sagrado.',
  },
  {
    term: 'Xirê',
    origin: 'Iorubá: ṣíré — brincar, divertir',
    emoji: '🥁',
    pt: 'Roda ritual em que se cantam e dançam, em ordem fixa, os cantigas dos 16 Orixás (de Exu, abridor de caminhos, a Oxalá, o último). É o coração público de toda festa de Candomblé.',
    en: 'Ritual circle where the songs of the 16 Orixás are sung and danced in fixed order (from Exu, opener of paths, to Oxalá, the last). The public heart of every Candomblé feast.',
    es: 'Rueda ritual en la que se cantan y bailan, en orden fijo, las canciones de los 16 Orixás (desde Exu, abridor de caminos, hasta Oxalá, el último). Es el corazón público de toda fiesta de Candomblé.',
  },
  {
    term: 'Bori',
    origin: 'Iorubá: bo orí — "alimentar a cabeça"',
    emoji: '🥥',
    pt: 'Ritual de fortalecimento do Orí (cabeça espiritual) com obi, água, frutas e ervas. Pode ser feito por não-iniciados como base prévia ou por iniciados em momentos de fragilidade. Devolve equilíbrio e clareza.',
    en: 'Ritual of strengthening the Orí (spiritual head) with obi nuts, water, fruits, and herbs. Can be performed by non-initiates as a preliminary base or by initiates in moments of fragility. Restores balance and clarity.',
    es: 'Ritual de fortalecimiento del Orí (cabeza espiritual) con obi, agua, frutas y hierbas. Puede ser realizado por no iniciados como base previa o por iniciados en momentos de fragilidad. Devuelve equilibrio y claridad.',
  },
  {
    term: 'Ifá',
    origin: 'Iorubá: Ifá — sistema oracular de Orunmilá',
    emoji: '📜',
    pt: 'Tradição divinatória completíssima (256 odus), de origem iorubá, conduzida pelo sacerdote Babalawo. No Brasil, o jogo de búzios é a forma mais comum derivada do mesmo corpo simbólico de Ifá.',
    en: 'Highly complete divinatory tradition (256 odus), of Yoruba origin, conducted by the Babalawo priest. In Brazil, the cowrie game is the most common form derived from the same symbolic body of Ifá.',
    es: 'Tradición divinatoria completísima (256 odus), de origen yoruba, conducida por el sacerdote Babalawo. En Brasil, el juego de búzios es la forma más común derivada del mismo cuerpo simbólico de Ifá.',
  },
  {
    term: 'Búzios',
    origin: 'Iorubá: ẹrindínlógún — "dezesseis"',
    emoji: '🐚',
    pt: 'Jogo oracular com 16 conchas (cauris), feito pela Iyalorixá ou Babalorixá. Cada combinação de conchas abertas e fechadas remete a um odu, narrativa-arquétipo que orienta sobre destino, obrigações e Orixá regente.',
    en: 'Oracular game with 16 cowrie shells, performed by the Iyalorixá or Babalorixá. Each combination of open and closed shells points to an odu, an archetype-narrative that guides on destiny, obligations, and ruling Orixá.',
    es: 'Juego oracular con 16 conchas (cauris), realizado por la Iyalorixá o Babalorixá. Cada combinación de conchas abiertas y cerradas remite a un odu, narrativa-arquetipo que orienta sobre destino, obligaciones y Orixá regente.',
  },
];

export default function CandombleGlossary({ compact = false }: { compact?: boolean }) {
  const { language } = useApp();
  const lang = (language as 'pt' | 'en' | 'es') || 'pt';

  const headerLabel =
    lang === 'en'
      ? 'Key Candomblé terms'
      : lang === 'es'
        ? 'Términos clave del Candomblé'
        : 'Termos essenciais do Candomblé';

  const subLabel =
    lang === 'en'
      ? 'Tap a term to see its meaning'
      : lang === 'es'
        ? 'Toca un término para ver su significado'
        : 'Toque um termo para ver o significado';

  return (
    <section
      className={cnLocal(
        'rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-amber-500/5 p-4 sm:p-5',
        compact ? '' : 'shadow-sm',
      )}
    >
      <div className="flex items-center gap-2.5 mb-1">
        <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
          <BookOpen className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            {headerLabel}
            <Sparkles className="h-3 w-3 text-primary/70" />
          </h3>
          <p className="text-[11px] text-muted-foreground">{subLabel}</p>
        </div>
      </div>

      <TooltipProvider delayDuration={150}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-3">
          {TERMS.map((term) => {
            const meaning = term[lang] ?? term.pt;
            return (
              <Tooltip key={term.term}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="group flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-left active:scale-[0.98]"
                  >
                    <span className="text-lg shrink-0">{term.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-foreground group-hover:text-primary leading-tight truncate">
                        {term.term}
                      </span>
                      <span className="block text-[10px] text-muted-foreground italic leading-tight truncate">
                        {term.origin}
                      </span>
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-[280px] text-xs leading-relaxed bg-popover text-popover-foreground border border-border shadow-lg"
                >
                  <p className="font-semibold mb-1 text-primary">
                    {term.term} <span className="font-normal text-muted-foreground italic">· {term.origin}</span>
                  </p>
                  <p>{meaning}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </section>
  );
}

function cnLocal(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
