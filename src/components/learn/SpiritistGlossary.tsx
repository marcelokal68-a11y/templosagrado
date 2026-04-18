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
    term: 'Perispírito',
    origin: 'Le Livre des Esprits, q. 93',
    emoji: '🌫️',
    pt: 'Corpo semimaterial intermediário entre o Espírito e o corpo físico. É o "molde" do corpo carnal: sobrevive à morte e funciona como veículo das comunicações mediúnicas.',
    en: 'Semi-material body intermediating between the Spirit and the physical body. It is the "mold" of the carnal body: it survives death and serves as the vehicle of mediumistic communications.',
    es: 'Cuerpo semimaterial intermediario entre el Espíritu y el cuerpo físico. Es el "molde" del cuerpo carnal: sobrevive a la muerte y funciona como vehículo de las comunicaciones mediúmnicas.',
  },
  {
    term: 'Reencarnação',
    origin: 'Le Livre des Esprits, q. 166-222',
    emoji: '🔄',
    pt: 'Múltiplas existências corpóreas necessárias à evolução do Espírito. É sempre humana (jamais regressão a animais) e progressiva — o sofrimento atual pode ser prova ou expiação de faltas pretéritas.',
    en: 'Multiple bodily existences necessary for the Spirit\'s evolution. Always human (never regression to animals) and progressive — current suffering may be a trial or expiation of past faults.',
    es: 'Múltiples existencias corpóreas necesarias para la evolución del Espíritu. Siempre humana (nunca regresión a animales) y progresiva — el sufrimiento actual puede ser prueba o expiación de faltas pasadas.',
  },
  {
    term: 'Mediunidade',
    origin: 'Le Livre des Médiums, 1861',
    emoji: '✨',
    pt: 'Faculdade natural de intercâmbio com o mundo espiritual, presente em graus variados em todas as pessoas. Subdivide-se em efeitos físicos (materializações) e intelectuais (psicografia, psicofonia, intuição, vidência).',
    en: 'Natural faculty of exchange with the spiritual world, present in varying degrees in all people. Subdivided into physical effects (materializations) and intellectual ones (automatic writing, mediumistic speech, intuition, clairvoyance).',
    es: 'Facultad natural de intercambio con el mundo espiritual, presente en grados variados en todas las personas. Se subdivide en efectos físicos (materializaciones) e intelectuales (psicografía, psicofonía, intuición, videncia).',
  },
  {
    term: 'Obsessão',
    origin: 'Le Livre des Médiums, cap. XXIII',
    emoji: '🌀',
    pt: 'Influência persistente exercida por um Espírito sobre uma pessoa encarnada. Tem 3 graus: simples (incômodo passageiro), fascinação (ilusão dos próprios pensamentos) e subjugação (domínio físico/moral).',
    en: 'Persistent influence exerted by a Spirit upon an incarnate person. Has 3 degrees: simple (passing nuisance), fascination (illusion of one\'s own thoughts), and subjugation (physical/moral domination).',
    es: 'Influencia persistente ejercida por un Espíritu sobre una persona encarnada. Tiene 3 grados: simple (incomodidad pasajera), fascinación (ilusión de los propios pensamientos) y subyugación (dominio físico/moral).',
  },
  {
    term: 'Passe',
    origin: 'Prática espírita brasileira',
    emoji: '🙏',
    pt: 'Transmissão de fluidos benéficos através da imposição de mãos por um médium passista, com auxílio dos Espíritos benfeitores. Promove equilíbrio energético e bem-estar — gratuito, jamais cobrado.',
    en: 'Transmission of beneficial fluids through the laying on of hands by a passist medium, with the help of benevolent Spirits. Promotes energetic balance and well-being — always free of charge.',
    es: 'Transmisión de fluidos benéficos a través de la imposición de manos por un médium pasista, con auxilio de los Espíritus benefactores. Promueve equilibrio energético y bienestar — gratuito, jamás cobrado.',
  },
  {
    term: 'Desobsessão',
    origin: 'Reuniões mediúnicas',
    emoji: '🕯️',
    pt: 'Trabalho mediúnico de esclarecimento ao Espírito obsessor, conduzido em reunião restrita por equipe treinada. Combina prece, doutrinação fraterna e irradiação de fluidos para libertar obsediado e obsessor.',
    en: 'Mediumistic work of enlightenment toward the obsessing Spirit, conducted in private sessions by trained teams. Combines prayer, fraternal instruction, and radiation of fluids to free both obsessed and obsessor.',
    es: 'Trabajo mediúmnico de esclarecimiento al Espíritu obsesor, conducido en reunión restringida por equipo entrenado. Combina prece, doctrinación fraterna e irradiación de fluidos para liberar al obsediado y al obsesor.',
  },
  {
    term: 'Erraticidade',
    origin: 'Le Livre des Esprits, q. 223-273',
    emoji: '🌌',
    pt: 'Estado do Espírito entre duas encarnações: sem corpo físico, no mundo espiritual. Pode ser breve ou longo conforme o grau evolutivo — Espíritos superiores escolhem voltar; inferiores aguardam.',
    en: 'State of the Spirit between two incarnations: without a physical body, in the spiritual world. May be brief or long according to evolutionary degree — superior Spirits choose to return; inferior ones wait.',
    es: 'Estado del Espíritu entre dos encarnaciones: sin cuerpo físico, en el mundo espiritual. Puede ser breve o largo según el grado evolutivo — los Espíritus superiores eligen volver; los inferiores aguardan.',
  },
];

export default function SpiritistGlossary({ compact = false }: { compact?: boolean }) {
  const { language } = useApp();
  const lang = (language as 'pt' | 'en' | 'es') || 'pt';

  const headerLabel =
    lang === 'en'
      ? 'Key spiritist terms'
      : lang === 'es'
        ? 'Términos espíritas clave'
        : 'Termos espíritas essenciais';

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
