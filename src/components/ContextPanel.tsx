import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Sparkles, Church, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const religions = ['christian', 'hindu', 'buddhist', 'islam', 'mormon', 'protestant', 'catholic', 'jewish', 'agnostic', 'spiritist', 'umbanda', 'candomble'];
const needs = ['inspiration', 'general', 'verse', 'confession', 'communion', 'comfort', 'prayer'];
const moods = ['happy', 'optimistic', 'indifferent', 'sad', 'anxious', 'pessimistic', 'angry', 'confused', 'spiritual'];
const philosophies = ['stoicism', 'logosophy', 'humanism', 'epicureanism', 'transhumanism', 'pantheism', 'existentialism', 'objectivism', 'transcendentalism', 'altruism', 'rationalism', 'optimistic_nihilism', 'absurdism', 'utilitarianism', 'pragmatism', 'shamanism', 'taoism', 'anthroposophy', 'cosmism', 'ubuntu'];

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

function CollapsibleChipGroup({ label, items, prefix, selected, onSelect, defaultOpen = true, activeColor = "bg-primary text-primary-foreground border-primary" }: {
  label: string; items: string[]; prefix: string; selected: string; onSelect: (v: string) => void; defaultOpen?: boolean; activeColor?: string;
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
                  ? `${activeColor} shadow-sm`
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

export default function ContextPanel({ onGenerate, onClose }: { onGenerate?: () => void; onClose?: () => void }) {
  const { language, chatContext, setChatContext } = useApp();
  const [activeMode, setActiveMode] = useState<'religion' | 'philosophy'>(
    chatContext.philosophy ? 'philosophy' : 'religion'
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingMode, setPendingMode] = useState<'religion' | 'philosophy' | null>(null);

  const topics = getTopicsForReligion(chatContext.religion);

  // Reset topic if current one is not in the new religion's list
  const currentTopicValid = !chatContext.topic || topics.includes(chatContext.topic);
  if (!currentTopicValid) {
    setChatContext(prev => ({ ...prev, topic: '' }));
  }

  const hasContext = chatContext.religion || chatContext.need || chatContext.mood || chatContext.topic || chatContext.philosophy;

  const handleModeSwitch = (newMode: 'religion' | 'philosophy') => {
    if (newMode === activeMode) return;

    const hasSelection = activeMode === 'religion' ? chatContext.religion : chatContext.philosophy;
    if (hasSelection) {
      setPendingMode(newMode);
      setShowConfirm(true);
    } else {
      setActiveMode(newMode);
    }
  };

  const confirmSwitch = () => {
    setChatContext(prev => ({ ...prev, religion: '', philosophy: '', topic: '' }));
    setActiveMode(pendingMode!);
    setShowConfirm(false);
    setPendingMode(null);
  };

  const cancelSwitch = () => {
    setShowConfirm(false);
    setPendingMode(null);
  };

  const getCurrentLabel = () => {
    if (activeMode === 'religion' && chatContext.religion) {
      return t(`religion.${chatContext.religion}`, language);
    }
    if (activeMode === 'philosophy' && chatContext.philosophy) {
      return t(`philosophy.${chatContext.philosophy}`, language);
    }
    return '';
  };

  const getTargetLabel = () => {
    return pendingMode === 'religion'
      ? t('panel.mode_religion', language)
      : t('panel.mode_philosophy', language);
  };

  const handleGenerate = () => {
    onGenerate?.();
    onClose?.();
  };

  return (
    <div className="space-y-1 p-4">
      {/* Mode Selector */}
      <div className="flex gap-2 pb-3 mb-2 border-b border-amber-200">
        <button
          onClick={() => handleModeSwitch('religion')}
          className={cn(
            "flex-1 rounded-xl px-4 py-2.5 font-semibold text-sm flex items-center justify-center gap-2 border transition-all",
            activeMode === 'religion'
              ? "bg-gradient-to-b from-amber-700 to-amber-900 text-amber-50 shadow-lg shadow-amber-900/30 border-amber-600"
              : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
          )}
        >
          <Church className="h-4 w-4" />
          {t('panel.mode_religion', language)}
        </button>
        <button
          onClick={() => handleModeSwitch('philosophy')}
          className={cn(
            "flex-1 rounded-xl px-4 py-2.5 font-semibold text-sm flex items-center justify-center gap-2 border transition-all",
            activeMode === 'philosophy'
              ? "bg-gradient-to-b from-amber-700 to-amber-900 text-amber-50 shadow-lg shadow-amber-900/30 border-amber-600"
              : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
          )}
        >
          <BookOpen className="h-4 w-4" />
          {t('panel.mode_philosophy', language)}
        </button>
      </div>

      {/* Religion section */}
      {activeMode === 'religion' && (
        <CollapsibleChipGroup
          label={t('panel.religion', language)}
          items={religions}
          prefix="religion"
          selected={chatContext.religion}
          onSelect={(v) => setChatContext(prev => ({ ...prev, religion: v, topic: '' }))}
          defaultOpen={true}
          activeColor="bg-amber-500 text-white border-amber-500"
        />
      )}

      {/* Philosophy section */}
      {activeMode === 'philosophy' && (
        <CollapsibleChipGroup
          label={t('panel.philosophy', language)}
          items={philosophies}
          prefix="philosophy"
          selected={chatContext.philosophy}
          onSelect={(v) => setChatContext(prev => ({ ...prev, philosophy: v, topic: '' }))}
          defaultOpen={true}
          activeColor="bg-violet-500 text-white border-violet-500"
        />
      )}

      <CollapsibleChipGroup
        label={t('panel.need', language)}
        items={needs}
        prefix="need"
        selected={chatContext.need}
        onSelect={(v) => setChatContext(prev => ({ ...prev, need: v }))}
        defaultOpen={false}
        activeColor="bg-emerald-500 text-white border-emerald-500"
      />
      <CollapsibleChipGroup
        label={t('panel.mood', language)}
        items={moods}
        prefix="mood"
        selected={chatContext.mood}
        onSelect={(v) => setChatContext(prev => ({ ...prev, mood: v }))}
        defaultOpen={false}
        activeColor="bg-rose-400 text-white border-rose-400"
      />
      <CollapsibleChipGroup
        label={t('panel.topics', language)}
        items={topics}
        prefix="topic"
        selected={chatContext.topic}
        onSelect={(v) => setChatContext(prev => ({ ...prev, topic: v }))}
        defaultOpen={false}
        activeColor="bg-sky-500 text-white border-sky-500"
      />

      {onGenerate && hasContext && (
        <div className="pt-3">
          <Button onClick={handleGenerate} className="w-full gap-2">
            <Sparkles className="h-4 w-4" />
            {t('panel.generate', language)}
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('panel.switch_title', language)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('panel.switch_message', language)
                .replace(/\{current\}/g, getCurrentLabel())
                .replace(/\{target\}/g, getTargetLabel())}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelSwitch}>{t('panel.keep', language)}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSwitch}>{t('panel.switch', language)}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
