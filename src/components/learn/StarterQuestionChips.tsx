import { useApp } from '@/contexts/AppContext';
import { Sparkles } from 'lucide-react';
import { getStarterQuestions } from './starterQuestions';

interface Props {
  topic: string;
  topicLabel: string;
  disabled?: boolean;
  onPick: (q: string) => void;
}

export default function StarterQuestionChips({ topic, topicLabel, disabled, onPick }: Props) {
  const { language } = useApp();
  const lang = (language as 'pt-BR' | 'en' | 'es') || 'pt-BR';
  const questions = getStarterQuestions(topic, lang, topicLabel);

  const headerLabel =
    lang === 'en'
      ? 'Suggested questions to get started'
      : lang === 'es'
        ? 'Preguntas sugeridas para empezar'
        : 'Perguntas sugeridas para começar';

  const hint =
    lang === 'en'
      ? 'Tap a question — or write your own below'
      : lang === 'es'
        ? 'Toca una pregunta — o escribe la tuya abajo'
        : 'Toque uma pergunta — ou escreva a sua abaixo';

  return (
    <section className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-amber-500/5 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground leading-tight">{headerLabel}</h3>
          <p className="text-[11px] text-muted-foreground leading-tight">{hint}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onPick(q)}
            className="text-left text-[13px] px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {q}
          </button>
        ))}
      </div>
    </section>
  );
}
