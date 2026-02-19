import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const religions = ['christian', 'hindu', 'buddhist', 'islam', 'mormon', 'protestant', 'catholic', 'jewish', 'agnostic', 'spiritist', 'umbanda', 'candomble'];
const needs = ['inspiration', 'general', 'verse', 'confession', 'communion', 'comfort', 'prayer'];
const moods = ['happy', 'optimistic', 'indifferent', 'sad', 'anxious', 'pessimistic', 'angry', 'confused', 'spiritual'];
const topics = ['jesus', 'hell', 'heaven', 'future', 'deceased', 'animals', 'career', 'health', 'finances', 'relationship', 'family', 'politics', 'sacrifices', 'other'];

function CollapsibleChipGroup({ label, items, prefix, selected, onSelect, defaultOpen = true }: {
  label: string; items: string[]; prefix: string; selected: string; onSelect: (v: string) => void; defaultOpen?: boolean;
}) {
  const { language } = useApp();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
        <h3 className="font-display text-sm font-semibold text-foreground">{label}</h3>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          open && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="flex flex-wrap gap-1.5 pb-2">
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
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function ContextPanel() {
  const { language, chatContext, setChatContext } = useApp();

  return (
    <div className="space-y-1 p-4">
      <CollapsibleChipGroup
        label={t('panel.religion', language)}
        items={religions}
        prefix="religion"
        selected={chatContext.religion}
        onSelect={(v) => setChatContext(prev => ({ ...prev, religion: v }))}
        defaultOpen={true}
      />
      <CollapsibleChipGroup
        label={t('panel.need', language)}
        items={needs}
        prefix="need"
        selected={chatContext.need}
        onSelect={(v) => setChatContext(prev => ({ ...prev, need: v }))}
        defaultOpen={false}
      />
      <CollapsibleChipGroup
        label={t('panel.mood', language)}
        items={moods}
        prefix="mood"
        selected={chatContext.mood}
        onSelect={(v) => setChatContext(prev => ({ ...prev, mood: v }))}
        defaultOpen={false}
      />
      <CollapsibleChipGroup
        label={t('panel.topics', language)}
        items={topics}
        prefix="topic"
        selected={chatContext.topic}
        onSelect={(v) => setChatContext(prev => ({ ...prev, topic: v }))}
        defaultOpen={false}
      />
    </div>
  );
}
