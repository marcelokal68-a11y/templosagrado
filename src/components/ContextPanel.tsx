import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const religions = ['christian', 'hindu', 'buddhist', 'islam', 'mormon', 'protestant', 'catholic', 'jewish', 'agnostic', 'spiritist', 'umbanda', 'candomble'];
const needs = ['inspiration', 'general', 'verse', 'confession', 'communion', 'comfort', 'prayer'];
const moods = ['happy', 'optimistic', 'indifferent', 'sad', 'anxious', 'pessimistic', 'angry', 'confused', 'spiritual'];
const topics = ['jesus', 'hell', 'heaven', 'future', 'deceased', 'animals', 'career', 'health', 'finances', 'relationship', 'family', 'politics', 'sacrifices', 'other'];

function ChipGroup({ label, items, prefix, selected, onSelect }: {
  label: string; items: string[]; prefix: string; selected: string; onSelect: (v: string) => void;
}) {
  const { language } = useApp();
  return (
    <div className="space-y-2">
      <h3 className="font-display text-sm font-semibold text-foreground">{label}</h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map(item => (
          <button
            key={item}
            onClick={() => onSelect(selected === item ? '' : item)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
              selected === item
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-secondary text-secondary-foreground border-border hover:bg-primary/10 hover:border-primary/30"
            )}
          >
            {t(`${prefix}.${item}`, language)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ContextPanel() {
  const { language, chatContext, setChatContext } = useApp();

  return (
    <div className="space-y-5 p-4">
      <ChipGroup
        label={t('panel.religion', language)}
        items={religions}
        prefix="religion"
        selected={chatContext.religion}
        onSelect={(v) => setChatContext(prev => ({ ...prev, religion: v }))}
      />
      <ChipGroup
        label={t('panel.need', language)}
        items={needs}
        prefix="need"
        selected={chatContext.need}
        onSelect={(v) => setChatContext(prev => ({ ...prev, need: v }))}
      />
      <ChipGroup
        label={t('panel.mood', language)}
        items={moods}
        prefix="mood"
        selected={chatContext.mood}
        onSelect={(v) => setChatContext(prev => ({ ...prev, mood: v }))}
      />
      <ChipGroup
        label={t('panel.topics', language)}
        items={topics}
        prefix="topic"
        selected={chatContext.topic}
        onSelect={(v) => setChatContext(prev => ({ ...prev, topic: v }))}
      />
    </div>
  );
}
