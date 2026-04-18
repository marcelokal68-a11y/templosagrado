import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Sparkles, Church, BookOpen, Music, Flame, Sun, Leaf, Heart, ChevronRight, Moon, Globe, Cross, Compass, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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

// Curated sacred-music playlists per tradition (public Spotify playlists)
// Curated sacred-music playlists per tradition (2-3 options each)
type PlaylistOption = { id: string; label: string };
const SPOTIFY_PLAYLISTS: Record<string, PlaylistOption[]> = {
  christian: [
    { id: '37i9dQZF1DX0HRj9P7NxeE', label: 'Worship clássico' },
    { id: '37i9dQZF1DWYBO1MoTDhZI', label: 'Worship moderno' },
    { id: '37i9dQZF1DX559SQRTRVIZ', label: 'Hinos cristãos' },
  ],
  catholic: [
    { id: '4OS5x6yAS6dQQO8u2bXrnL', label: 'Cantos gregorianos' },
    { id: '37i9dQZF1DWUOhRO0bSCNz', label: 'Música católica' },
    { id: '6lPb7Eyk0NwzJ5DM1mEYZ4', label: 'Adoração eucarística' },
  ],
  protestant: [
    { id: '37i9dQZF1DX0HRj9P7NxeE', label: 'Hillsong & Worship' },
    { id: '37i9dQZF1DWYBO1MoTDhZI', label: 'Louvor moderno' },
    { id: '37i9dQZF1DX559SQRTRVIZ', label: 'Hinos clássicos' },
  ],
  spiritist: [
    { id: '3kg2IhbcbiRE4ZmvYWlUdw', label: 'Música espírita' },
    { id: '37i9dQZF1DWZqd5JICZI0u', label: 'Meditação' },
  ],
  umbanda: [
    { id: '3kg2IhbcbiRE4ZmvYWlUdw', label: 'Pontos cantados' },
    { id: '6XKZO8FJxMzZb5oFsyqMqQ', label: 'Tambores sagrados' },
  ],
  candomble: [
    { id: '3kg2IhbcbiRE4ZmvYWlUdw', label: 'Pontos cantados' },
    { id: '6XKZO8FJxMzZb5oFsyqMqQ', label: 'Tambores ancestrais' },
  ],
  jewish: [
    { id: '37i9dQZF1DWVcbzTgVpNRm', label: 'Salmos' },
    { id: '4Df7sCtQ3l4yYGRygi6sBp', label: 'Cantos hebraicos' },
    { id: '0HmQg9p2zP5kqfH5cYqM7Q', label: 'Música sefardita' },
  ],
  islam: [
    { id: '37i9dQZF1DX5q67ZpWyRrZ', label: 'Recitação do Alcorão' },
    { id: '37i9dQZF1DWZbU3xqv6QfG', label: 'Nasheeds' },
    { id: '6vVYwwIBDpwgCfbthIqp8M', label: 'Sufi & Qawwali' },
  ],
  hindu: [
    { id: '37i9dQZF1DX0XEnJgRtMrK', label: 'Mantras' },
    { id: '37i9dQZF1DWUS3jbm4YnVV', label: 'Bhajans devocionais' },
    { id: '5g5T5qB0n8Whz9tH9OBM4w', label: 'Kirtan & Yoga' },
  ],
  buddhist: [
    { id: '37i9dQZF1DWZqd5JICZI0u', label: 'Cantos tibetanos' },
    { id: '37i9dQZF1DX9uKNf5jGX6m', label: 'Zen meditação' },
    { id: '4o7gNCqVGyRxQHKvY7vrcY', label: 'Tigelas tibetanas' },
  ],
  mormon: [
    { id: '4LXVuZxkzLBaeOKQwzVz5z', label: 'Coro do Tabernáculo' },
    { id: '37i9dQZF1DWVFeEut75IAL', label: 'Hinos contemplativos' },
  ],
  agnostic: [
    { id: '37i9dQZF1DWVFeEut75IAL', label: 'Clássica contemplativa' },
    { id: '37i9dQZF1DX9uKNf5jGX6m', label: 'Ambiente meditativo' },
    { id: '37i9dQZF1DX4sWSpwq3LiO', label: 'Piano relaxante' },
  ],
  stoicism: [
    { id: '37i9dQZF1DWVFeEut75IAL', label: 'Clássica contemplativa' },
    { id: '37i9dQZF1DX4sWSpwq3LiO', label: 'Piano para reflexão' },
  ],
  philosophy: [
    { id: '37i9dQZF1DWVFeEut75IAL', label: 'Clássica contemplativa' },
    { id: '37i9dQZF1DX4sWSpwq3LiO', label: 'Piano para reflexão' },
  ],
  default: [
    { id: '37i9dQZF1DWVFeEut75IAL', label: 'Clássica contemplativa' },
  ],
};

const PLAYLIST_PREF_KEY = 'ts:playlist-prefs:v1';

function loadPlaylistPrefs(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PLAYLIST_PREF_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePlaylistPref(traditionKey: string, playlistId: string) {
  try {
    const prefs = loadPlaylistPrefs();
    prefs[traditionKey] = playlistId;
    localStorage.setItem(PLAYLIST_PREF_KEY, JSON.stringify(prefs));
  } catch {}
}

const UNIVERSAL_TOPICS = ['future', 'deceased', 'animals', 'career', 'health', 'finances', 'relationship', 'family', 'politics', 'other'];

const TOPICS_BY_RELIGION: Record<string, string[]> = {
  christian: ['jesus', 'heaven', 'hell', 'salvation', 'scripture', 'prayer_topic', ...UNIVERSAL_TOPICS],
  catholic: ['jesus', 'mary', 'marian_dogmas', 'saints', 'doctors_church', 'encyclicals', 'eucharist', 'sacraments', 'magisterium', 'papacy', 'salvation', 'prayer_topic', 'heaven', 'hell', 'sacrifices', ...UNIVERSAL_TOPICS],
  protestant: ['jesus', 'salvation', 'grace', 'protestant_bible', 'sola_scriptura', 'reformation', 'pastors_prophets', 'revival', 'pentecost', 'prophets', 'prayer_topic', 'heaven', 'hell', ...UNIVERSAL_TOPICS],
  spiritist: ['spirits', 'reincarnation', 'charity_spiritist', 'mediumship', 'gospel_kardec', ...UNIVERSAL_TOPICS],
  umbanda: ['orishas_candomble', 'ancestors_candomble', 'mediumship', 'offerings_candomble', ...UNIVERSAL_TOPICS],
  candomble: ['orishas_candomble', 'rituals_candomble', 'ancestors_candomble', 'ifa', 'offerings_candomble', ...UNIVERSAL_TOPICS],
  jewish: ['torah', 'talmud', 'kabbalah', 'midrash', 'mitzvot', 'shabbat', 'pesach', 'yom_kippur', 'rosh_hashanah', 'sukkot', 'sages', 'tikkun_olam', 'prophets', 'covenant', 'prayer_topic', ...UNIVERSAL_TOPICS],
  islam: ['quran', 'five_pillars', 'tawhid', 'hadith', 'sunnah', 'prophets_islam', 'sufism', 'caliphs', 'islamic_theologians', 'ramadan', 'pilgrimage', 'jihad_greater', 'sharia', 'charity', 'prayer_topic', ...UNIVERSAL_TOPICS],
  hindu: ['vedas', 'upanishads', 'bhagavad_gita', 'puranas', 'main_deities', 'yoga', 'dharma_hindu', 'karma_hindu', 'moksha', 'samsara', 'vedanta', 'sankhya', 'rishis', 'meditation', 'prayer_topic', ...UNIVERSAL_TOPICS],
  buddhist: ['four_noble_truths', 'eightfold_path', 'theravada', 'mahayana', 'vajrayana', 'zen', 'sutras', 'dalai_lama', 'buddhist_masters', 'nirvana', 'bodhisattva', 'meditation', 'dharma_hindu', 'karma_hindu', 'suffering', 'enlightenment', ...UNIVERSAL_TOPICS],
  mormon: ['book_of_mormon', 'revelation', 'salvation', 'prayer_topic', 'jesus', ...UNIVERSAL_TOPICS],
  agnostic: ['ethics', 'philosophy', 'meaning', 'nature', 'science', ...UNIVERSAL_TOPICS],
};

function getTopicsForSelection(religion: string): string[] {
  if (!religion) return [...UNIVERSAL_TOPICS];
  return TOPICS_BY_RELIGION[religion] || [...UNIVERSAL_TOPICS];
}

const needs = ['inspiration', 'general', 'verse', 'confession', 'communion', 'comfort', 'prayer'];
const moods = ['happy', 'optimistic', 'indifferent', 'sad', 'anxious', 'pessimistic', 'angry', 'confused', 'spiritual'];

// 12 traditions — aligned with Learn (Estudo de Religiões)
const FAITH_OPTIONS = [
  { key: 'christian', label: 'Cristão', sublabel: 'Tradição Cristã', icon: Cross, mode: 'religion' as const },
  { key: 'catholic', label: 'Católico', sublabel: 'Tradição Católica', icon: Church, mode: 'religion' as const },
  { key: 'protestant', label: 'Evangélico', sublabel: 'Tradição Protestante', icon: Flame, mode: 'religion' as const },
  { key: 'mormon', label: 'Mórmon', sublabel: 'Santos dos Últimos Dias', icon: Church, mode: 'religion' as const },
  { key: 'jewish', label: 'Judaísmo', sublabel: 'Tradição Judaica', icon: Heart, mode: 'religion' as const },
  { key: 'islam', label: 'Islamismo', sublabel: 'Tradição Islâmica', icon: Moon, mode: 'religion' as const },
  { key: 'hindu', label: 'Hinduísmo', sublabel: 'Tradição Hindu', icon: Sun, mode: 'religion' as const },
  { key: 'buddhist', label: 'Budismo', sublabel: 'Tradição Budista', icon: Sun, mode: 'religion' as const },
  { key: 'spiritist', label: 'Espírita', sublabel: 'Doutrina Espírita', icon: Sun, mode: 'religion' as const },
  { key: 'umbanda', label: 'Umbanda', sublabel: 'Tradição de Matriz Africana', icon: Leaf, mode: 'religion' as const },
  { key: 'candomble', label: 'Candomblé', sublabel: 'Tradição de Matriz Africana', icon: Leaf, mode: 'religion' as const },
  { key: 'agnostic', label: 'Agnóstico / Filosofia', sublabel: 'Reflexão e autoconhecimento', icon: BookOpen, mode: 'philosophy' as const },
];

const COMING_SOON_OPTIONS: { key: string; label: string; sublabel: string; icon: typeof Sun }[] = [];

function ChipGroup({ label, items, prefix, selected, onSelect, specificItems }: {
  label: string; items: string[]; prefix: string; selected: string; onSelect: (v: string) => void;
  specificItems?: Set<string>;
}) {
  const { language } = useApp();

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        {label}
        {specificItems && specificItems.size > 0 && (
          <span className="text-[10px] font-normal text-muted-foreground inline-flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-primary/70" />
            {language === 'en' ? 'tradition-specific' : language === 'es' ? 'específico de la tradición' : 'específico da tradição'}
          </span>
        )}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map(item => {
          const isSpecific = specificItems?.has(item);
          const isSelected = selected === item;
          return (
            <button
              key={item}
              onClick={() => onSelect(isSelected ? '' : item)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border inline-flex items-center gap-1",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : isSpecific
                    ? "bg-primary/5 text-foreground border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                    : "bg-secondary text-secondary-foreground border-border hover:bg-primary/10 hover:border-primary/30"
              )}
              title={isSpecific
                ? (language === 'en' ? 'Specific to this tradition' : language === 'es' ? 'Específico de esta tradición' : 'Específico desta tradição')
                : undefined}
            >
              {isSpecific && (
                <Sparkles className={cn("h-2.5 w-2.5", isSelected ? "text-primary-foreground" : "text-primary/70")} />
              )}
              {t(`${prefix}.${item}`, language)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ContextPanel({ onGenerate, onClose }: { onGenerate?: () => void; onClose?: () => void }) {
  const { language, chatContext, setChatContext, clearChatWithUndo, preferredReligion, user, refreshProfile, changeFaithWithCleanup } = useApp();
  const navigate = useNavigate();
  const [exploreIntent, setExploreIntent] = useState<typeof FAITH_OPTIONS[0] | null>(null);
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
  const [pendingOption, setPendingOption] = useState<typeof FAITH_OPTIONS[0] | null>(null);

  const currentSelection = chatContext.religion || chatContext.philosophy || '';
  const topics = getTopicsForSelection(chatContext.religion);
  const specificTopics = new Set(topics.filter(t => !UNIVERSAL_TOPICS.includes(t)));

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
      setChatContext(prev => ({ ...prev, religion: '', philosophy: '', topic: '' }));
      return;
    }

    // If user has a preferred religion and this is a *different* option, show 3-option dialog
    const isDimmed = preferredReligion && option.key !== preferredReligion;
    if (isDimmed) {
      setExploreIntent(option);
      return;
    }

    // Otherwise fallback to prior behavior: if something else selected, confirm switch
    const hasExisting = chatContext.religion || chatContext.philosophy;
    if (hasExisting) {
      setPendingOption(option);
      setShowSwitchConfirm(true);
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
    setShowSwitchConfirm(false);
    setPendingOption(null);
  };

  // From the 3-option dialog: actually change the preferred faith
  const handleChangeFaith = async () => {
    if (!exploreIntent || !user) return;
    const option = exploreIntent;
    if (option.mode === 'religion') {
      await supabase.from('profiles').update({ preferred_religion: option.key } as any).eq('user_id', user.id);
    } else {
      // switching to philosophy clears preferred religion
      await supabase.from('profiles').update({ preferred_religion: null } as any).eq('user_id', user.id);
    }
    await refreshProfile();
    applyOption(option);
    setExploreIntent(null);
    toast.success(
      language === 'en' ? 'Faith updated' : language === 'es' ? 'Fe actualizada' : 'Fé atualizada'
    );
  };

  // From the 3-option dialog: explore in /learn without changing faith
  const handleExploreOnly = () => {
    if (!exploreIntent) return;
    const key = exploreIntent.key;
    const kind = exploreIntent.mode === 'religion' ? 'religion' : 'philosophy';
    setExploreIntent(null);
    onClose?.();
    navigate(`/learn?topic=${key}&kind=${kind}`);
  };

  const handleSkip = () => {
    setChatContext(prev => ({ ...prev, religion: '', philosophy: '', topic: '' }));
  };

  const handleGenerate = () => {
    onGenerate?.();
    onClose?.();
  };

  const activeKey = chatContext.religion || chatContext.philosophy || '';
  const playlistOptions = SPOTIFY_PLAYLISTS[activeKey] || SPOTIFY_PLAYLISTS.default;

  // Persisted playlist preference per tradition
  const [playlistPrefs, setPlaylistPrefs] = useState<Record<string, string>>(() => loadPlaylistPrefs());
  const savedPlaylistId = playlistPrefs[activeKey];
  const playlistId = playlistOptions.find(p => p.id === savedPlaylistId)?.id || playlistOptions[0].id;

  const handleSelectPlaylist = (id: string) => {
    savePlaylistPref(activeKey || 'default', id);
    setPlaylistPrefs(prev => ({ ...prev, [activeKey || 'default']: id }));
  };

  const exploreLabel = exploreIntent?.label ?? '';

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
            const isDimmed = !!preferredReligion && option.key !== preferredReligion && !isActive;
            const isPreferred = !!preferredReligion && option.key === preferredReligion;

            return (
              <button
                key={option.key}
                onClick={() => handleOptionSelect(option)}
                className={cn(
                  "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left",
                  "active:scale-[0.98]",
                  isActive
                    ? "bg-primary/10 border-primary/40 shadow-sm shadow-primary/10"
                    : "bg-card border-border/60 hover:bg-muted/50 hover:border-border",
                  isDimmed && "opacity-40 hover:opacity-90"
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
                    {isPreferred && (
                      <span className="ml-1.5 text-[10px] font-medium text-primary/80">★ sua fé</span>
                    )}
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

        {/* Coming soon (hidden when empty) */}
        {COMING_SOON_OPTIONS.length > 0 && (
          <>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex-1 h-px bg-border/60" />
              <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">Em breve</span>
              <div className="flex-1 h-px bg-border/60" />
            </div>
            <div className="space-y-2">
              {COMING_SOON_OPTIONS.map((option) => {
                const Icon = option.icon;
                const extraDim = !!preferredReligion;
                return (
                  <button
                    key={option.key}
                    onClick={() => toast('Disponível em breve!')}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-border/40 bg-card/50 text-left cursor-not-allowed",
                      extraDim ? "opacity-25" : "opacity-50"
                    )}
                  >
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg shrink-0 bg-muted text-muted-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-tight text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{option.sublabel}</p>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                      Em breve
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

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
        specificItems={specificTopics}
      />

      {/* Spotify */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Music className="h-4 w-4" />
          {t('panel.music', language)}
        </h3>

        {/* Playlist selector chips (only when more than 1 option) */}
        {playlistOptions.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {playlistOptions.map((p) => {
              const isActive = p.id === playlistId;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPlaylist(p.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-secondary text-secondary-foreground border-border hover:bg-primary/10 hover:border-primary/30"
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="relative rounded-xl overflow-hidden border border-border group">
          <iframe
            key={playlistId}
            src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0&autoplay=1`}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl transition-opacity duration-300"
          />
          {/* Floating "Play in Spotify app" button — deep link for real autoplay */}
          <button
            onClick={() => {
              const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
              const deepLink = `spotify://playlist/${playlistId}`;
              const webLink = `https://open.spotify.com/playlist/${playlistId}`;
              if (isMobile) {
                // Try to open the app; fall back to web after a short delay
                const timeout = setTimeout(() => {
                  window.location.href = webLink;
                }, 800);
                window.location.href = deepLink;
                // If the app opens, the page is hidden — clear fallback
                const onHide = () => {
                  if (document.hidden) clearTimeout(timeout);
                };
                document.addEventListener('visibilitychange', onHide, { once: true });
              } else {
                window.open(webLink, '_blank', 'noopener,noreferrer');
              }
            }}
            className={cn(
              "absolute bottom-2 right-2 z-10",
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
              "bg-[#1DB954] text-white text-xs font-semibold shadow-lg",
              "hover:bg-[#1ed760] active:scale-95 transition-all",
              "ring-2 ring-white/20"
            )}
            aria-label={
              language === 'en'
                ? 'Play now in Spotify app'
                : language === 'es'
                  ? 'Reproducir ahora en la app de Spotify'
                  : 'Tocar agora no app do Spotify'
            }
          >
            <Play className="h-3 w-3 fill-current" />
            {language === 'en' ? 'Play now' : language === 'es' ? 'Reproducir ahora' : 'Tocar agora'}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/70 text-center">
          {language === 'en'
            ? 'Tap "Play now" to open the Spotify app for real autoplay'
            : language === 'es'
              ? 'Toca "Reproducir ahora" para abrir la app de Spotify con autoplay real'
              : 'Toque "Tocar agora" para abrir o app do Spotify com autoplay real'}
        </p>
      </div>

      {onGenerate && hasContext && (
        <div className="pt-2">
          <Button onClick={handleGenerate} className="w-full gap-2">
            <Sparkles className="h-4 w-4" />
            {t('panel.generate', language)}
          </Button>
        </div>
      )}

      {/* Switch confirmation (when no preferred religion is set yet) */}
      <AlertDialog open={showSwitchConfirm} onOpenChange={setShowSwitchConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mudar de caminho?</AlertDialogTitle>
            <AlertDialogDescription>
              Ao trocar, sua conversa atual será limpa para começar uma nova jornada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowSwitchConfirm(false); setPendingOption(null); }}>
              Manter
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmSwitch}>
              Trocar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 3-option dialog: change faith vs. just explore */}
      <AlertDialog open={!!exploreIntent} onOpenChange={(open) => { if (!open) setExploreIntent(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'en'
                ? `Change to ${exploreLabel}?`
                : language === 'es'
                  ? `¿Cambiar a ${exploreLabel}?`
                  : `Mudar para ${exploreLabel}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'en'
                ? 'You can change your faith, or just explore this tradition in the Learn section without changing your profile.'
                : language === 'es'
                  ? 'Puedes cambiar tu fe, o solo explorar esta tradición en la sección Aprende sin cambiar tu perfil.'
                  : 'Você pode mudar sua fé, ou apenas explorar esta tradição na aba Aprenda sem alterar seu perfil.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            <Button onClick={handleChangeFaith} className="w-full">
              {language === 'en' ? 'Yes, change my faith' : language === 'es' ? 'Sí, cambiar mi fe' : 'Sim, mudar minha fé'}
            </Button>
            <Button onClick={handleExploreOnly} variant="outline" className="w-full">
              {language === 'en' ? 'Just explore (Learn)' : language === 'es' ? 'Solo explorar (Aprende)' : 'Só explorar (Aprenda)'}
            </Button>
            <Button onClick={() => setExploreIntent(null)} variant="ghost" className="w-full">
              {language === 'en' ? 'Cancel' : language === 'es' ? 'Cancelar' : 'Cancelar'}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
