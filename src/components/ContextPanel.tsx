import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const religions = ['christian', 'hindu', 'buddhist', 'islam', 'mormon', 'protestant', 'catholic', 'jewish', 'agnostic', 'spiritist', 'umbanda', 'candomble'];
const needs = ['inspiration', 'general', 'verse', 'confession', 'communion', 'comfort', 'prayer'];
const moods = ['happy', 'optimistic', 'indifferent', 'sad', 'anxious', 'pessimistic', 'angry', 'confused', 'spiritual'];

const UNIVERSAL_TOPICS = ['future', 'deceased', 'animals', 'career', 'health', 'finances', 'relationship', 'family', 'politics', 'other'];

const TOPICS_BY_RELIGION: Record<string, string[]> = {
  christian: ['jesus', 'heaven', 'hell', 'salvation', 'prayer_topic', 'sacrifices', ...UNIVERSAL_TOPICS],
  catholic: ['jesus', 'heaven', 'hell', 'salvation', 'saints', 'mary', 'sacraments', 'prayer_topic', 'sacrifices', ...UNIVERSAL_TOPICS],
  protestant: ['jesus', 'heaven', 'hell', 'salvation', 'grace', 'scripture', 'prayer_topic', ...UNIVERSAL_TOPICS],
  mormon: ['jesus', 'heaven', 'salvation', 'book_of_mormon', 'revelation', 'prayer_topic', ...UNIVERSAL_TOPICS],
  jewish: ['torah', 'shabbat', 'tikkun_olam', 'prophets', 'covenant', 'prayer_topic', ...UNIVERSAL_TOPICS],
  islam: ['quran', 'ramadan', 'pilgrimage', 'prophets_islam', 'charity', 'prayer_topic', ...UNIVERSAL_TOPICS],
  buddhist: ['nirvana', 'karma', 'dharma', 'meditation', 'suffering', 'enlightenment', ...UNIVERSAL_TOPICS],
  hindu: ['dharma_hindu', 'karma_hindu', 'moksha', 'vedas', 'yoga', 'meditation', ...UNIVERSAL_TOPICS],
  spiritist: ['spirits', 'reincarnation', 'charity_spiritist', 'mediumship', 'gospel_kardec', ...UNIVERSAL_TOPICS],
  umbanda: ['orishas', 'rituals', 'ancestors', 'offerings', 'mediumship_umbanda', ...UNIVERSAL_TOPICS],
  candomble: ['orishas_candomble', 'rituals_candomble', 'ancestors_candomble', 'ifa', 'offerings_candomble', ...UNIVERSAL_TOPICS],
  agnostic: ['ethics', 'philosophy', 'meaning', 'nature', 'science', ...UNIVERSAL_TOPICS],
};

function getTopicsForReligion(religion: string): string[] {
  if (!religion) return [...UNIVERSAL_TOPICS];
  return TOPICS_BY_RELIGION[religion] || [...UNIVERSAL_TOPICS];
}

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

export default function ContextPanel({ onGenerate }: { onGenerate?: () => void }) {
  const { language, chatContext, setChatContext } = useApp();
  const topics = getTopicsForReligion(chatContext.religion);

  // Reset topic if current one is not in the new religion's list
  const currentTopicValid = !chatContext.topic || topics.includes(chatContext.topic);
  if (!currentTopicValid) {
    setChatContext(prev => ({ ...prev, topic: '' }));
  }

  const hasContext = chatContext.religion || chatContext.need || chatContext.mood || chatContext.topic;

  return (
    <div className="space-y-1 p-4">
      <CollapsibleChipGroup
        label={t('panel.religion', language)}
        items={religions}
        prefix="religion"
        selected={chatContext.religion}
        onSelect={(v) => setChatContext(prev => ({ ...prev, religion: v, topic: '' }))}
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

      {onGenerate && hasContext && (
        <div className="pt-3">
          <Button onClick={onGenerate} className="w-full gap-2">
            <Sparkles className="h-4 w-4" />
            {t('panel.generate', language)}
          </Button>
        </div>
      )}
    </div>
  );
}
