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
    term: 'Axé',
    origin: 'Iorubá: àṣẹ — força vital',
    emoji: '✨',
    pt: 'Energia sagrada que move o universo e flui dos Orixás. Está nas pessoas, nas folhas, nas águas, nas pedras e nos rituais. Todo gesto litúrgico — do ponto cantado ao alimento oferecido — busca atrair, manter e distribuir Axé.',
    en: 'Sacred energy that moves the universe and flows from the Orixás. It dwells in people, leaves, waters, stones, and rituals. Every liturgical gesture — from sung points to offered food — seeks to attract, sustain, and distribute Axé.',
    es: 'Energía sagrada que mueve el universo y fluye de los Orixás. Habita en las personas, las hojas, las aguas, las piedras y los rituales. Todo gesto litúrgico — del punto cantado al alimento ofrecido — busca atraer, mantener y distribuir Axé.',
  },
  {
    term: 'Orixá',
    origin: 'Iorubá: òrìṣà — divindade',
    emoji: '🕯️',
    pt: 'Divindades de origem africana que regem forças da natureza e arquétipos humanos. Na Umbanda atuam como pais e mães espirituais — cada filho de santo tem um Orixá de cabeça (regente) e um adjuntó (segundo regente).',
    en: 'African-origin deities that rule forces of nature and human archetypes. In Umbanda they act as spiritual fathers and mothers — each initiate has a "head Orixá" (regent) and an adjuntó (secondary regent).',
    es: 'Divinidades de origen africano que rigen fuerzas de la naturaleza y arquetipos humanos. En la Umbanda actúan como padres y madres espirituales — cada hijo de santo tiene un Orixá de cabeza (regente) y un adjuntó (segundo regente).',
  },
  {
    term: 'Caboclo',
    origin: 'Tupi-guarani: kaa\'boc — vindo da mata',
    emoji: '🪶',
    pt: 'Espírito de indígena ancestral, símbolo da brasilidade espiritual. Trabalha pela cura, força e desobsessão, geralmente vinculado a Oxóssi ou Ogum. Suas falanges incluem Caboclo Pena Branca, Sete Flechas e Tupinambá.',
    en: 'Spirit of an ancestral indigenous person, symbol of spiritual Brazilianness. Works for healing, strength, and disobsession, usually linked to Oxóssi or Ogum. Their phalanxes include Caboclo Pena Branca, Sete Flechas, and Tupinambá.',
    es: 'Espíritu de indígena ancestral, símbolo de la brasilianidad espiritual. Trabaja por la cura, fuerza y desobsesión, generalmente vinculado a Oxóssi u Ogum. Sus falanges incluyen Caboclo Pena Branca, Sete Flechas y Tupinambá.',
  },
  {
    term: 'Preto Velho',
    origin: 'Sabedoria ancestral africana no Brasil',
    emoji: '🪵',
    pt: 'Espírito de antigo escravizado africano que retorna como avô espiritual: paciente, sábio, fumando cachimbo no banquinho. Fala devagar, cura mágoas antigas e ensina humildade. Sexta-feira é seu dia.',
    en: 'Spirit of an elder enslaved African who returns as a spiritual grandparent: patient, wise, smoking a pipe on a low stool. Speaks slowly, heals old wounds, and teaches humility. Friday is their day.',
    es: 'Espíritu de antiguo esclavizado africano que retorna como abuelo espiritual: paciente, sabio, fumando pipa en el banquito. Habla despacio, cura heridas antiguas y enseña humildad. El viernes es su día.',
  },
  {
    term: 'Exu',
    origin: 'Iorubá: Èṣù — guardião dos caminhos',
    emoji: '🔥',
    pt: 'Na Umbanda, o Exu é entidade trabalhadora da Esquerda — não é o demônio cristão. Atua como guardião, abridor de caminhos e cumpridor da lei kármica. Usa cartola, capa preta-vermelha e responde com lealdade a quem o respeita.',
    en: 'In Umbanda, Exu is a working entity of the Left — not the Christian devil. Acts as guardian, path-opener, and enforcer of karmic law. Wears top hat, black-and-red cape, and responds with loyalty to those who respect him.',
    es: 'En la Umbanda, el Exu es entidad trabajadora de la Izquierda — no es el demonio cristiano. Actúa como guardián, abridor de caminos y ejecutor de la ley kármica. Usa chistera, capa negra-roja y responde con lealtad a quien lo respeta.',
  },
  {
    term: 'Pombagira',
    origin: 'Bantu: pambu njila — encruzilhada',
    emoji: '🌹',
    pt: 'Entidade feminina das encruzilhadas, contraparte dos Exus. Senhora da sensualidade sagrada, da liberdade feminina e da quebra de tabus. Ajuda em questões amorosas, autoestima e libertação de relações tóxicas. Maria Padilha e Sete Saias são clássicas.',
    en: 'Feminine entity of crossroads, counterpart of Exus. Lady of sacred sensuality, female freedom, and the breaking of taboos. Helps in matters of love, self-esteem, and liberation from toxic relationships. Maria Padilha and Sete Saias are classics.',
    es: 'Entidad femenina de las encrucijadas, contraparte de los Exus. Señora de la sensualidad sagrada, de la libertad femenina y de la ruptura de tabúes. Ayuda en cuestiones amorosas, autoestima y liberación de relaciones tóxicas. María Padilla y Sete Saias son clásicas.',
  },
  {
    term: 'Gira',
    origin: 'Bantu: kuzunga — girar, rodar',
    emoji: '🌀',
    pt: 'Sessão ritual de Umbanda em que médiuns incorporam guias e atendem consulentes. Tem hierarquia clara: defumação, abertura de pontos cantados, incorporação, atendimento, encerramento. Cada gira tem uma "linha" (Caboclos, Pretos-Velhos, Crianças, Exus etc.).',
    en: 'Ritual session of Umbanda where mediums incorporate guides and serve seekers. Has clear hierarchy: smoking ritual, opening of sung points, incorporation, consultation, closing. Each gira has a "line" (Caboclos, Pretos-Velhos, Children, Exus, etc.).',
    es: 'Sesión ritual de Umbanda donde médiums incorporan guías y atienden consultantes. Tiene jerarquía clara: defumación, apertura de puntos cantados, incorporación, atención, cierre. Cada gira tiene una "línea" (Caboclos, Pretos-Velhos, Niños, Exus, etc.).',
  },
  {
    term: 'Ponto Cantado',
    origin: 'Tradição oral afro-brasileira',
    emoji: '🎶',
    pt: 'Cânticos rituais que invocam, saúdam e despedem entidades. Cada Orixá e cada guia tem seus pontos próprios. Cantados em coro com palmas e atabaques, abrem portais espirituais e mantêm a vibração da gira firme.',
    en: 'Ritual chants that invoke, salute, and dismiss entities. Each Orixá and each guide has its own points. Sung in chorus with handclaps and atabaque drums, they open spiritual portals and keep the gira\'s vibration firm.',
    es: 'Cánticos rituales que invocan, saludan y despiden entidades. Cada Orixá y cada guía tiene sus puntos propios. Cantados en coro con palmas y atabaques, abren portales espirituales y mantienen firme la vibración de la gira.',
  },
  {
    term: 'Pemba',
    origin: 'Banto-quicongo: mpemba — giz sagrado',
    emoji: '✏️',
    pt: 'Bastão de giz consagrado usado pelas entidades para riscar pontos no chão — assinaturas mágicas de cada guia que abrem trabalhos, fixam a energia e selam acordos espirituais. Cada cor tem uso ritual específico.',
    en: 'Consecrated chalk stick used by entities to draw "pontos riscados" on the ground — magical signatures of each guide that open works, fix energy, and seal spiritual agreements. Each color has a specific ritual use.',
    es: 'Bastón de tiza consagrado usado por las entidades para trazar puntos en el suelo — firmas mágicas de cada guía que abren trabajos, fijan la energía y sellan acuerdos espirituales. Cada color tiene un uso ritual específico.',
  },
  {
    term: 'Defumação',
    origin: 'Tradição indígena e africana',
    emoji: '🌿',
    pt: 'Ritual de purificação com fumaça de ervas sagradas (alecrim, arruda, guiné, alfazema, benjoim) feito antes da gira. Limpa o ambiente, afasta energias densas e prepara médiuns e consulentes para receberem os guias.',
    en: 'Purification ritual with the smoke of sacred herbs (rosemary, rue, guiné, lavender, benzoin) performed before the gira. Cleanses the environment, drives away dense energies, and prepares mediums and seekers to receive the guides.',
    es: 'Ritual de purificación con humo de hierbas sagradas (romero, ruda, guiné, lavanda, benjuí) realizado antes de la gira. Limpia el ambiente, aleja energías densas y prepara a médiums y consultantes para recibir a los guías.',
  },
];

export default function UmbandaGlossary({ compact = false }: { compact?: boolean }) {
  const { language } = useApp();
  const lang = (language as 'pt' | 'en' | 'es') || 'pt';

  const headerLabel =
    lang === 'en'
      ? 'Key Umbanda terms'
      : lang === 'es'
        ? 'Términos clave de la Umbanda'
        : 'Termos essenciais da Umbanda';

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
