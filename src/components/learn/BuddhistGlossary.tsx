import { useApp } from '@/contexts/AppContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BookOpen, Sparkles } from 'lucide-react';

type Term = {
  sanskrit: string;
  script: string; // Devanagari (Sanskrit) ou Pali em Devanagari
  pt: string;
  en: string;
  es: string;
  emoji: string;
};

const TERMS: Term[] = [
  {
    sanskrit: 'Buddha',
    script: 'बुद्ध',
    emoji: '🧘',
    pt: '"O Desperto". Título dado a Siddhartha Gautama (séc. VI–V AEC), que despertou para a verdade do sofrimento e do caminho de libertação. Não é deus — é alguém que viu a realidade como ela é.',
    en: '"The Awakened One". Title given to Siddhartha Gautama (6th–5th c. BCE), who awakened to the truth of suffering and the path of liberation. Not a god — one who saw reality as it is.',
    es: '"El Despierto". Título dado a Siddhartha Gautama (s. VI–V a.C.), que despertó a la verdad del sufrimiento y al camino de liberación. No es un dios — alguien que vio la realidad tal como es.',
  },
  {
    sanskrit: 'Dharma',
    script: 'धर्म',
    emoji: '☸️',
    pt: 'No Budismo: o ensinamento do Buda e a verdade última da realidade. Inclui as Quatro Nobres Verdades e o Nobre Caminho Óctuplo. É um dos Três Refúgios.',
    en: 'In Buddhism: the Buddha\'s teaching and the ultimate truth of reality. Includes the Four Noble Truths and the Noble Eightfold Path. One of the Three Refuges.',
    es: 'En el Budismo: la enseñanza del Buda y la verdad última de la realidad. Incluye las Cuatro Nobles Verdades y el Noble Óctuple Sendero. Es uno de los Tres Refugios.',
  },
  {
    sanskrit: 'Sangha',
    script: 'संघ',
    emoji: '🤝',
    pt: 'A comunidade dos praticantes — monges, monjas e leigos. Terceiro dos Três Refúgios (Buda, Dharma, Sangha). Apoio mútuo é essencial no caminho.',
    en: 'The community of practitioners — monks, nuns, and laypeople. Third of the Three Refuges (Buddha, Dharma, Sangha). Mutual support is essential on the path.',
    es: 'La comunidad de practicantes — monjes, monjas y laicos. Tercero de los Tres Refugios (Buda, Dharma, Sangha). El apoyo mutuo es esencial en el camino.',
  },
  {
    sanskrit: 'Karma',
    script: 'कर्म',
    emoji: '🔄',
    pt: 'Ação intencional (cetanā) que gera consequências. Diferente do hindu: no Budismo, sem alma permanente — o que se transmite é uma corrente de causas, não um "eu".',
    en: 'Intentional action (cetanā) that generates consequences. Different from Hindu: in Buddhism, no permanent soul — what carries on is a stream of causes, not a "self".',
    es: 'Acción intencional (cetanā) que genera consecuencias. Diferente del hindú: en el Budismo, sin alma permanente — lo que se transmite es una corriente de causas, no un "yo".',
  },
  {
    sanskrit: 'Samsara',
    script: 'संसार',
    emoji: '♾️',
    pt: 'O ciclo contínuo de nascimento, morte e renascimento, alimentado pela ignorância e pelo desejo (tanhā). O objetivo budista é despertar para sair desse ciclo.',
    en: 'The continuous cycle of birth, death, and rebirth, fueled by ignorance and craving (tanhā). The Buddhist goal is to awaken and exit this cycle.',
    es: 'El ciclo continuo de nacimiento, muerte y renacimiento, alimentado por la ignorancia y el deseo (tanhā). La meta budista es despertar y salir de ese ciclo.',
  },
  {
    sanskrit: 'Nirvana',
    script: 'निर्वाण',
    emoji: '🪷',
    pt: 'Literalmente "extinção" (do fogo do desejo, ódio e ilusão). Não é um lugar — é o cessar do sofrimento e a libertação de samsara. Estado de paz inefável.',
    en: 'Literally "extinction" (of the fire of desire, hatred, and delusion). Not a place — it is the cessation of suffering and liberation from samsara. State of ineffable peace.',
    es: 'Literalmente "extinción" (del fuego del deseo, odio e ilusión). No es un lugar — es el cese del sufrimiento y la liberación de samsara. Estado de paz inefable.',
  },
  {
    sanskrit: 'Bodhisattva',
    script: 'बोधिसत्त्व',
    emoji: '💫',
    pt: '"Ser de iluminação". No Mahayana, aquele que adia o nirvana pessoal por compaixão, votando salvar todos os seres antes de si. Ideal supremo: Avalokiteśvara, Tara, Manjushri.',
    en: '"Being of awakening". In Mahayana, one who postpones personal nirvana out of compassion, vowing to save all beings before themselves. Supreme ideal: Avalokiteśvara, Tara, Manjushri.',
    es: '"Ser de iluminación". En el Mahayana, aquel que pospone el nirvana personal por compasión, jurando salvar a todos los seres antes que a sí mismo. Ideal supremo: Avalokiteśvara, Tara, Manjushri.',
  },
  {
    sanskrit: 'Sunyata',
    script: 'शून्यता',
    emoji: '⚪',
    pt: '"Vacuidade". Doutrina central do Mahayana (Nāgārjuna): nada existe por si mesmo — tudo surge interdependentemente. Não é niilismo, é interdependência radical.',
    en: '"Emptiness". Central doctrine of Mahayana (Nāgārjuna): nothing exists by itself — everything arises interdependently. Not nihilism, but radical interdependence.',
    es: '"Vacuidad". Doctrina central del Mahayana (Nāgārjuna): nada existe por sí mismo — todo surge interdependientemente. No es nihilismo, es interdependencia radical.',
  },
  {
    sanskrit: 'Anatman',
    script: 'अनात्मन्',
    emoji: '🚫',
    pt: '"Não-eu". Negação budista do Atman hindu: não existe alma permanente, imutável e independente. O "eu" é um processo composto, em fluxo constante. Uma das Três Marcas da existência.',
    en: '"Non-self". Buddhist denial of the Hindu Atman: there is no permanent, unchanging, independent soul. The "self" is a composite process in constant flux. One of the Three Marks of existence.',
    es: '"No-yo". Negación budista del Atman hindú: no existe alma permanente, inmutable e independiente. El "yo" es un proceso compuesto, en flujo constante. Una de las Tres Marcas de la existencia.',
  },
  {
    sanskrit: 'Anicca',
    script: 'अनिच्च',
    emoji: '🌊',
    pt: '"Impermanência" (Pali). Tudo que surge, passa. Corpos, emoções, pensamentos, civilizações — nada dura. Aceitar isso reduz o sofrimento. Outra das Três Marcas.',
    en: '"Impermanence" (Pali). Everything that arises passes away. Bodies, emotions, thoughts, civilizations — nothing lasts. Accepting this reduces suffering. Another of the Three Marks.',
    es: '"Impermanencia" (Pali). Todo lo que surge, pasa. Cuerpos, emociones, pensamientos, civilizaciones — nada dura. Aceptarlo reduce el sufrimiento. Otra de las Tres Marcas.',
  },
  {
    sanskrit: 'Skandhas',
    script: 'स्कन्ध',
    emoji: '🧩',
    pt: 'Os 5 "agregados" que compõem a experiência do "eu": forma (rūpa), sensação (vedanā), percepção (saññā), formações mentais (saṅkhāra) e consciência (viññāṇa). Nenhum é o "eu".',
    en: 'The 5 "aggregates" that make up the experience of "self": form (rūpa), sensation (vedanā), perception (saññā), mental formations (saṅkhāra) and consciousness (viññāṇa). None is the "self".',
    es: 'Los 5 "agregados" que componen la experiencia del "yo": forma (rūpa), sensación (vedanā), percepción (saññā), formaciones mentales (saṅkhāra) y conciencia (viññāṇa). Ninguno es el "yo".',
  },
  {
    sanskrit: 'Pratityasamutpada',
    script: 'प्रतीत्यसमुत्पाद',
    emoji: '🕸️',
    pt: '"Surgimento dependente". Tudo surge em dependência de causas e condições — nada existe isoladamente. Os 12 elos (nidānas) explicam como ignorância gera samsara, e como cessá-la gera nirvana.',
    en: '"Dependent origination". Everything arises in dependence on causes and conditions — nothing exists in isolation. The 12 links (nidānas) explain how ignorance generates samsara, and how stopping it generates nirvana.',
    es: '"Originación dependiente". Todo surge en dependencia de causas y condiciones — nada existe aisladamente. Los 12 eslabones (nidānas) explican cómo la ignorancia genera samsara, y cómo detenerla genera nirvana.',
  },
];

export default function BuddhistGlossary({ compact = false }: { compact?: boolean }) {
  const { language } = useApp();
  const lang = (language as 'pt' | 'en' | 'es') || 'pt';
  const [selected, setSelected] = useState<Term | null>(null);

  const headerLabel =
    lang === 'en' ? 'Key Buddhist terms'
      : lang === 'es' ? 'Términos budistas clave'
        : 'Termos budistas essenciais';

  const subLabel =
    lang === 'en' ? 'Tap a term to see its meaning'
      : lang === 'es' ? 'Toca un término para ver su significado'
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
          {TERMS.map((term) => {
            const meaning = term[lang] ?? term.pt;
            const isActive = selected?.sanskrit === term.sanskrit;
            return (
              <Tooltip key={term.sanskrit}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setSelected(isActive ? null : term)}
                    className={cnLocal(
                      'group flex items-center gap-2 px-2.5 py-2 rounded-lg border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-left active:scale-[0.98]',
                      isActive ? 'border-primary/60 bg-primary/10' : 'border-border/60',
                    )}
                  >
                    <span className="text-lg shrink-0">{term.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className={cnLocal('block text-xs font-semibold leading-tight truncate', isActive ? 'text-primary' : 'text-foreground group-hover:text-primary')}>
                        {term.sanskrit}
                      </span>
                      <span className="block text-[10px] text-muted-foreground font-serif leading-tight truncate">
                        {term.script}
                      </span>
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="hidden md:block max-w-[280px] text-xs leading-relaxed bg-popover text-popover-foreground border border-border shadow-lg"
                >
                  <p className="font-semibold mb-1 text-primary">
                    {term.sanskrit} <span className="font-normal text-muted-foreground">· {term.script}</span>
                  </p>
                  <p>{meaning}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {selected && (
        <div className="mt-3 rounded-xl border border-primary/30 bg-card p-3 animate-fade-in relative">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50"
            aria-label="Fechar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <p className="text-sm font-semibold text-primary mb-1 pr-6">
            {selected.emoji} {selected.sanskrit}
            <span className="font-normal text-muted-foreground ml-1.5 font-serif">· {selected.script}</span>
          </p>
          <p className="text-xs text-foreground/85 leading-relaxed">{selected[lang] ?? selected.pt}</p>
        </div>
      )}
    </section>
  );
}

function cnLocal(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
