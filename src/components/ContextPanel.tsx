import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Sparkles, Church, BookOpen, Music, Flame, Sun, Leaf, Heart, ChevronRight } from 'lucide-react';
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

const SPOTIFY_PLAYLISTS: Record<string, string> = {
  christian: '0Z5jq2YzMqMrqEQWMEVj9T',
  catholic: '25lg9pkqwUaa7nOcIvd4ta',
  protestant: '0Z5jq2YzMqMrqEQWMEVj9T',
  spiritist: '3kg2IhbcbiRE4ZmvYWlUdw',
  umbanda: '3kg2IhbcbiRE4ZmvYWlUdw',
  candomble: '3kg2IhbcbiRE4ZmvYWlUdw',
  agnostic: '1RJKluktWr9Dh7fXhhRkHV',
  stoicism: '0As0R4eZyxaMKAqZfW9zUL',
  philosophy: '37i9dQZF1DWVFeEut75IAL',
  default: '1RJKluktWr9Dh7fXhhRkHV',
};

const UNIVERSAL_TOPICS = ['future', 'deceased', 'animals', 'career', 'health', 'finances', 'relationship', 'family', 'politics', 'other'];

const TOPICS_BY_RELIGION: Record<string, string[]> = {
  catholic: ['jesus', 'heaven', 'hell', 'salvation', 'saints', 'mary', 'sacraments', 'prayer_topic', 'sacrifices', ...UNIVERSAL_TOPICS],
  protestant: ['jesus', 'heaven', 'hell', 'salvation', 'grace', 'scripture', 'prayer_topic', ...UNIVERSAL_TOPICS],
  spiritist: ['spirits', 'reincarnation', 'charity_spiritist', 'mediumship', 'gospel_kardec', ...UNIVERSAL_TOPICS],
  candomble: ['orishas_candomble', 'rituals_candomble', 'ancestors_candomble', 'ifa', 'offerings_candomble', ...UNIVERSAL_TOPICS],
  agnostic: ['ethics', 'philosophy', 'meaning', 'nature', 'science', ...UNIVERSAL_TOPICS],
};

function getTopicsForSelection(religion: string): string[] {
  if (!religion) return [...UNIVERSAL_TOPICS];
  return TOPICS_BY_RELIGION[religion] || [...UNIVERSAL_TOPICS];
}

const needs = ['inspiration', 'general', 'verse', 'confession', 'communion', 'comfort', 'prayer'];
const moods = ['happy', 'optimistic', 'indifferent', 'sad', 'anxious', 'pessimistic', 'angry', 'confused', 'spiritual'];

// The 5 MVP options
const FAITH_OPTIONS = [
  { key: 'catholic', label: 'Católico', sublabel: 'Tradição Católica', icon: Church, mode: 'religion' as const },
  { key: 'protestant', label: 'Evangélico', sublabel: 'Tradição Protestante', icon: Flame, mode: 'religion' as const },
  { key: 'spiritist', label: 'Espírita', sublabel: 'Doutrina Espírita', icon: Sun, mode: 'religion' as const },
  { key: 'candomble', label: 'Matriz Africana', sublabel: 'Umbanda & Candomblé', icon: Leaf, mode: 'religion' as const },
  { key: 'philosophy', label: 'Filosofia & Sabedoria', sublabel: 'Reflexão e autoconhecimento', icon: BookOpen, mode: 'philosophy' as const },
];

function ChipGroup({ label, items, prefix, selected, onSelect }: {
  label: string; items: string[]; prefix: string; selected: string; onSelect: (v: string) => void;
}) {
  const { language } = useApp();

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
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

export default function ContextPanel({ onGenerate, onClose }: { onGenerate?: () => void; onClose?: () => void }) {
  const { language, chatContext, setChatContext, clearChatWithUndo } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingOption, setPendingOption] = useState<typeof FAITH_OPTIONS[0] | null>(null);

  const currentSelection = chatContext.religion || chatContext.philosophy || '';
  const topics = getTopicsForSelection(chatContext.religion);

  const currentTopicValid = !chatContext.topic || topics.includes(chatContext.topic);
  if (!currentTopicValid) {
    setChatContext(prev => ({ ...prev, topic: '' }));
  }

  const hasContext = chatContext.religion || chatContext.need || chatContext.mood || chatContext.topic || chatContext.philosophy;

  const handleOptionSelect = (option: typeof FAITH_OPTIONS[0]) => {
    const isAlreadySelected =
      (option.mode === 'religion' && chatContext.religion === option.key) ||
      (option.mode === 'philosophy' && chatContext.philosophy === option.key);

    if (isAlreadySelected) {
      // Deselect
      setChatContext(prev => ({ ...prev, religion: '', philosophy: '', topic: '' }));
      return;
    }

    // If there's already a selection from a different mode, confirm the switch
    const hasExisting = chatContext.religion || chatContext.philosophy;
    if (hasExisting) {
      setPendingOption(option);
      setShowConfirm(true);
    } else {
      applyOption(option);
    }
  };

  const applyOption = (option: typeof FAITH_OPTIONS[0]) => {
    clearChatWithUndo();
    if (option.mode === 'religion') {
      setChatContext(prev => ({ ...prev, religion: option.key, philosophy: '', topic: '' }));
    } else {
      setChatContext(prev => ({ ...prev, philosophy: option.key, religion: '', topic: '' }));
    }
  };

  const confirmSwitch = () => {
    if (pendingOption) applyOption(pendingOption);
    setShowConfirm(false);
    setPendingOption(null);
  };

  const handleSkip = () => {
    setChatContext(prev => ({ ...prev, religion: '', philosophy: '', topic: '' }));
  };

  const handleGenerate = () => {
    onGenerate?.();
    onClose?.();
  };

  const activeKey = chatContext.religion || chatContext.philosophy || '';
  const playlistId = SPOTIFY_PLAYLISTS[activeKey] || SPOTIFY_PLAYLISTS.default;

  return (
    <div className="space-y-5 p-4">
      {/* Faith selection — 5 large cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Escolha seu caminho</h3>
        <div className="space-y-2">
          {FAITH_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive =
              (option.mode === 'religion' && chatContext.religion === option.key) ||
              (option.mode === 'philosophy' && chatContext.philosophy === option.key);

            return (
              <button
                key={option.key}
                onClick={() => handleOptionSelect(option)}
                className={cn(
                  "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left",
                  "active:scale-[0.98]",
                  isActive
                    ? "bg-primary/10 border-primary/40 shadow-sm shadow-primary/10"
                    : "bg-card border-border/60 hover:bg-muted/50 hover:border-border"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center h-10 w-10 rounded-lg shrink-0 transition-colors",
                  isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-semibold leading-tight",
                    isActive ? "text-primary" : "text-foreground"
                  )}>
                    {option.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{option.sublabel}</p>
                </div>
                {isActive && (
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Skip link */}
        <button
          onClick={handleSkip}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5"
        >
          Prefiro não especificar
        </button>
      </div>

      {/* Need & Mood chips */}
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

      {/* Spotify */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Music className="h-4 w-4" />
          {t('panel.music', language)}
        </h3>
        <div className="rounded-xl overflow-hidden border border-border">
          <iframe
            key={playlistId}
            src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl"
          />
        </div>
      </div>

      {onGenerate && hasContext && (
        <div className="pt-2">
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
            <AlertDialogTitle>Mudar de caminho?</AlertDialogTitle>
            <AlertDialogDescription>
              Ao trocar, sua conversa atual será limpa para começar uma nova jornada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowConfirm(false); setPendingOption(null); }}>
              Manter
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmSwitch}>
              Trocar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
