import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BookOpen, Sparkles, X } from 'lucide-react';

type Term = {
  sanskrit: string;
  devanagari: string;
  pt: string;
  en: string;
  es: string;
  emoji: string;
};

const TERMS: Term[] = [
  {
    sanskrit: 'Brahman',
    devanagari: 'ब्रह्मन्',
    emoji: '🕉️',
    pt: 'A Realidade Última, infinita e impessoal — a Consciência Suprema que permeia tudo o que existe. Não é um deus pessoal, mas o "Ser" absoluto do qual o universo emerge.',
    en: 'The Ultimate Reality, infinite and impersonal — the Supreme Consciousness pervading all that exists. Not a personal god, but the absolute "Being" from which the universe emerges.',
    es: 'La Realidad Última, infinita e impersonal — la Conciencia Suprema que impregna todo lo que existe. No es un dios personal, sino el "Ser" absoluto del cual emerge el universo.',
  },
  {
    sanskrit: 'Atman',
    devanagari: 'आत्मन्',
    emoji: '✨',
    pt: 'A alma individual, o "Eu" verdadeiro e eterno em cada ser. O Vedanta ensina que Atman é idêntico a Brahman ("Tat Tvam Asi" — Tu És Aquilo).',
    en: 'The individual soul, the true and eternal "Self" in every being. Vedanta teaches that Atman is identical to Brahman ("Tat Tvam Asi" — Thou Art That).',
    es: 'El alma individual, el "Yo" verdadero y eterno en cada ser. El Vedanta enseña que Atman es idéntico a Brahman ("Tat Tvam Asi" — Tú Eres Aquello).',
  },
  {
    sanskrit: 'Dharma',
    devanagari: 'धर्म',
    emoji: '⚖️',
    pt: 'O dever sagrado, a lei cósmica e moral. Viver de acordo com seu dharma é cumprir o propósito da sua existência — agir com retidão segundo seu papel na vida.',
    en: 'Sacred duty, cosmic and moral law. Living according to your dharma is fulfilling the purpose of your existence — acting righteously according to your role in life.',
    es: 'El deber sagrado, la ley cósmica y moral. Vivir según tu dharma es cumplir el propósito de tu existencia — actuar con rectitud según tu rol en la vida.',
  },
  {
    sanskrit: 'Karma',
    devanagari: 'कर्म',
    emoji: '🔄',
    pt: 'Lei de causa e efeito moral. Toda ação (física, mental ou verbal) gera consequências que moldam sua vida atual e futuras encarnações. Não é castigo — é equilíbrio.',
    en: 'Law of moral cause and effect. Every action (physical, mental, or verbal) generates consequences that shape your current life and future incarnations. Not punishment — balance.',
    es: 'Ley de causa y efecto moral. Toda acción (física, mental o verbal) genera consecuencias que moldean tu vida actual y futuras encarnaciones. No es castigo — es equilibrio.',
  },
  {
    sanskrit: 'Moksha',
    devanagari: 'मोक्ष',
    emoji: '🪷',
    pt: 'Libertação final do ciclo de renascimentos (samsara). É a meta espiritual suprema do Hinduísmo: a alma reconhece sua unidade com Brahman e dissolve a ilusão do "eu" separado.',
    en: 'Final liberation from the cycle of rebirths (samsara). It is the supreme spiritual goal of Hinduism: the soul recognizes its unity with Brahman and dissolves the illusion of the separate "self".',
    es: 'Liberación final del ciclo de renacimientos (samsara). Es la meta espiritual suprema del Hinduismo: el alma reconoce su unidad con Brahman y disuelve la ilusión del "yo" separado.',
  },
  {
    sanskrit: 'Samsara',
    devanagari: 'संसार',
    emoji: '♾️',
    pt: 'O ciclo contínuo de nascimento, morte e renascimento. Enquanto há karma a equilibrar, a alma retorna em novos corpos. Sair de samsara é alcançar moksha (no Hinduísmo) ou nirvana (no Budismo).',
    en: 'The continuous cycle of birth, death, and rebirth. While there is karma to balance, the soul returns in new bodies. Exiting samsara is reaching moksha (in Hinduism) or nirvana (in Buddhism).',
    es: 'El ciclo continuo de nacimiento, muerte y renacimiento. Mientras haya karma por equilibrar, el alma regresa en nuevos cuerpos. Salir de samsara es alcanzar moksha (en el Hinduismo) o nirvana (en el Budismo).',
  },
];

export default function SanskritGlossary({ compact = false }: { compact?: boolean }) {
  const { language } = useApp();
  const lang = (language as 'pt' | 'en' | 'es') || 'pt';

  const headerLabel =
    lang === 'en'
      ? 'Key Sanskrit terms'
      : lang === 'es'
        ? 'Términos clave en sánscrito'
        : 'Termos sânscritos essenciais';

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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
          {TERMS.map((term) => {
            const meaning = term[lang] ?? term.pt;
            return (
              <Tooltip key={term.sanskrit}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="group flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-left active:scale-[0.98]"
                  >
                    <span className="text-lg shrink-0">{term.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-foreground group-hover:text-primary leading-tight truncate">
                        {term.sanskrit}
                      </span>
                      <span className="block text-[10px] text-muted-foreground font-serif leading-tight truncate">
                        {term.devanagari}
                      </span>
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-[280px] text-xs leading-relaxed bg-popover text-popover-foreground border border-border shadow-lg"
                >
                  <p className="font-semibold mb-1 text-primary">
                    {term.sanskrit} <span className="font-normal text-muted-foreground">· {term.devanagari}</span>
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

// Local cn to avoid extra import in this small file
function cnLocal(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
