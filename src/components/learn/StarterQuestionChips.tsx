import { useApp } from '@/contexts/AppContext';
import { getStarterQuestions } from './starterQuestions';
import { Sparkles, MessageCircleQuestion } from 'lucide-react';

interface Props {
  topic: string;
  topicLabel: string;
  disabled?: boolean;
  onPick: (question: string) => void;
}

export default function StarterQuestionChips({ topic, topicLabel, disabled, onPick }: Props) {
  const { language } = useApp();
  const questions = getStarterQuestions(topic, language);

  const headerLabel =
    language === 'en'
      ? `Suggested questions about ${topicLabel}`
      : language === 'es'
        ? `Preguntas sugeridas sobre ${topicLabel}`
        : `Perguntas sugeridas sobre ${topicLabel}`;

  const subLabel =
    language === 'en'
      ? 'Tap one to start the conversation'
      : language === 'es'
        ? 'Toca una para comenzar la conversación'
        : 'Toque uma para começar a conversa';

  return (
    <section className="rounded-2xl border border-primary/15 bg-gradient-to-br from-amber-500/5 via-background to-primary/5 p-4 sm:p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
          <MessageCircleQuestion className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            {headerLabel}
            <Sparkles className="h-3 w-3 text-primary/70" />
          </h3>
          <p className="text-[11px] text-muted-foreground">{subLabel}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {questions.map((q, i) => (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onPick(q)}
            className="text-left text-sm px-3 py-2.5 rounded-lg border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
          >
            {q}
          </button>
        ))}
      </div>
    </section>
  );
}
