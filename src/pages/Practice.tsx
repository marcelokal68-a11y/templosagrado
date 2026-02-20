import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { BookOpen, Loader2, Sparkles, Volume2, VolumeX, BookMarked, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const religions = ['christian', 'hindu', 'buddhist', 'islam', 'mormon', 'protestant', 'catholic', 'jewish', 'agnostic', 'spiritist', 'umbanda', 'candomble'];
const philosophies = ['stoicism', 'logosophy', 'humanism', 'epicureanism', 'transhumanism', 'pantheism', 'existentialism', 'objectivism', 'transcendentalism', 'altruism', 'rationalism', 'optimistic_nihilism', 'absurdism', 'utilitarianism', 'pragmatism', 'shamanism', 'taoism', 'anthroposophy', 'cosmism', 'ubuntu'];

const CHECKLISTS: Record<string, { items: string[]; genderSpecific?: boolean }> = {
  jewish: { genderSpecific: true, items: [] },
  catholic: { items: ['morning_prayer', 'gospel', 'rosary', 'charity_act', 'conscience_exam', 'thank_god'] },
  protestant: { items: ['devotional', 'bible_reading', 'personal_prayer', 'kindness', 'word_reflection', 'thank_god'] },
  christian: { items: ['morning_prayer', 'gospel', 'personal_prayer', 'charity_act', 'word_reflection', 'thank_god'] },
  islam: { items: ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'quran_reading', 'sadaqah'] },
  buddhist: { items: ['morning_meditation', 'mindfulness', 'dharma_reading', 'compassion', 'four_truths', 'avoid_suffering'] },
  hindu: { items: ['puja', 'gita_verse', 'yoga_meditation', 'seva', 'mantra', 'dharma_reflection'] },
  spiritist: { items: ['morning_prayer_sp', 'kardec_gospel', 'charity_sp', 'positive_vibes', 'kardec_study', 'inner_reform'] },
  umbanda: { items: ['oxala_prayer', 'herbs_bath', 'charity_umb', 'spiritual_focus', 'thank_guides', 'help_needy'] },
  candomble: { items: ['orixas_greeting', 'offering', 'nature_respect', 'meditation_cand', 'community_help', 'oral_tradition'] },
  mormon: { items: ['morning_prayer_m', 'book_of_mormon_reading', 'service', 'scripture_study', 'revelation_reflection', 'thank_god'] },
  agnostic: { items: ['morning_reflection', 'philosophy_reading', 'kindness_act', 'meditation_silence', 'gratitude', 'common_good'] },
};

const PHILOSOPHY_CHECKLISTS: Record<string, string[]> = {
  stoicism: ['stoic_morning', 'dichotomy_control', 'stoic_journal', 'read_stoics', 'practice_virtue', 'stoic_evening'],
  logosophy: ['logosophy_study', 'self_knowledge', 'deficiency_work', 'logosophy_reading', 'conscious_evolution', 'stoic_evening'],
  humanism: ['human_dignity', 'empathy_act', 'humanist_reading', 'critical_thinking', 'common_good_phil', 'conscious_gratitude'],
  epicureanism: ['pleasure_moderation', 'epicurean_reading', 'friendship', 'simple_joy', 'avoid_pain', 'nature_contemplation'],
  transhumanism: ['tech_reflection', 'transhumanist_reading', 'self_improvement', 'future_thinking', 'critical_thinking', 'conscious_evolution'],
  pantheism: ['spinoza_reflection', 'pantheist_reading', 'nature_connection', 'nature_contemplation', 'conscious_gratitude', 'stoic_evening'],
  existentialism: ['authenticity', 'conscious_freedom', 'existentialist_reading', 'face_anxiety', 'present_moment', 'personal_purpose'],
  objectivism: ['objective_thinking', 'objectivist_reading', 'self_interest', 'practice_virtue', 'critical_thinking', 'stoic_evening'],
  transcendentalism: ['walden_reflection', 'transcendentalist_reading', 'intuition_exercise', 'nature_connection', 'nature_contemplation', 'conscious_gratitude'],
  altruism: ['effective_altruism', 'altruist_reading', 'help_others', 'empathy_act', 'common_good_phil', 'conscious_gratitude'],
  rationalism: ['rational_analysis', 'rationalist_reading', 'logical_exercise', 'critical_thinking', 'stoic_journal', 'stoic_evening'],
  optimistic_nihilism: ['nihilist_reading', 'freedom_meaning', 'create_own_value', 'simple_joy', 'present_moment', 'conscious_gratitude'],
  absurdism: ['joyful_acceptance', 'absurdist_reading', 'create_meaning', 'present_moment', 'conscious_freedom', 'simple_joy'],
  utilitarianism: ['utility_analysis', 'utilitarian_reading', 'maximize_wellbeing', 'empathy_act', 'common_good_phil', 'critical_thinking'],
  pragmatism: ['pragmatic_action', 'pragmatist_reading', 'practical_result', 'critical_thinking', 'self_improvement', 'conscious_gratitude'],
  shamanism: ['earth_connection', 'ancestor_meditation', 'nature_offering', 'shamanic_reading', 'passage_ritual', 'ancestral_gratitude'],
  taoism: ['wu_wei_meditation', 'tao_te_ching_reading', 'non_action_practice', 'nature_contemplation', 'tai_chi', 'yin_yang_balance'],
  anthroposophy: ['eurythmy_exercise', 'steiner_reading', 'anthroposophic_meditation', 'artistic_activity', 'body_soul_spirit', 'nature_connection'],
  cosmism: ['cosmic_reflection', 'fedorov_reading', 'universe_contemplation', 'self_transcendence', 'immortality_reflection', 'science_spirit_connection'],
  ubuntu: ['community_act', 'ubuntu_reading', 'help_others', 'i_am_because_we_are', 'community_dialogue', 'collective_gratitude'],
};

const JEWISH_MALE = ['tefilin', 'shacharit', 'parasha', 'mitzvah', 'shema', 'torah_study'];
const JEWISH_FEMALE = ['shabbat_candles', 'morning_prayer_jf', 'parasha', 'mitzvah', 'shema', 'torah_study'];

function getStorageKey(date: string, religion: string, gender?: string) {
  return `practice_${date}_${religion}${gender ? `_${gender}` : ''}`;
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

interface DailyContent {
  title: string;
  reference: string;
  explanation: string;
  reflection: string;
  sources?: string;
  scholarly_note?: string;
}

export default function Practice() {
  const { language, chatContext } = useApp();
  const [religion, setReligion] = useState(chatContext.religion || '');
  const [philosophy, setPhilosophy] = useState(chatContext.philosophy || '');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [dailyContent, setDailyContent] = useState<DailyContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const today = getTodayStr();

  const getItems = (): string[] => {
    const religionItems = religion === 'jewish' 
      ? (gender === 'male' ? JEWISH_MALE : JEWISH_FEMALE)
      : (CHECKLISTS[religion]?.items || []);
    const philItems = philosophy ? (PHILOSOPHY_CHECKLISTS[philosophy] || []) : [];
    // Merge: religion items first, then philosophy items (deduplicated)
    const combined = [...religionItems];
    philItems.forEach(item => { if (!combined.includes(item)) combined.push(item); });
    return combined;
  };

  // Load from localStorage
  useEffect(() => {
    if (!religion && !philosophy) return;
    const key = getStorageKey(today, religion || philosophy, religion === 'jewish' ? gender : undefined);
    const saved = localStorage.getItem(key);
    if (saved) {
      try { setChecked(JSON.parse(saved)); } catch { setChecked({}); }
    } else {
      setChecked({});
    }
  }, [religion, philosophy, gender, today]);

  // Save to localStorage
  useEffect(() => {
    if (!religion && !philosophy) return;
    const key = getStorageKey(today, religion || philosophy, religion === 'jewish' ? gender : undefined);
    localStorage.setItem(key, JSON.stringify(checked));
  }, [checked, religion, philosophy, gender, today]);

  // Fetch daily content
  useEffect(() => {
    if (!religion && !philosophy) { setDailyContent(null); return; }
    setLoadingContent(true);
    setDailyContent(null);
    supabase.functions.invoke('daily-practice', {
      body: { religion, philosophy, date: today, language, gender: religion === 'jewish' ? gender : undefined },
    }).then(({ data, error }) => {
      if (!error && data) setDailyContent(data);
      setLoadingContent(false);
    }).catch(() => setLoadingContent(false));
  }, [religion, philosophy, gender, today, language]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleNarrate = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      return;
    }

    if (!dailyContent) return;

    const text = `${dailyContent.title}. ${dailyContent.explanation}. ${dailyContent.reflection}`;
    setLoadingAudio(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, speed: 1.15 }),
        }
      );

      if (!response.ok) throw new Error('TTS failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };

      await audio.play();
      setIsPlaying(true);
    } catch (e) {
      console.error('TTS error:', e);
    } finally {
      setLoadingAudio(false);
    }
  };

  const items = getItems();
  const checkedCount = items.filter(i => checked[i]).length;

  return (
    <main className="flex-1 container max-w-2xl py-6 px-4 pb-24 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-display font-bold text-foreground">
          {t('practice.title', language)}
        </h1>
        <p className="text-sm text-muted-foreground">{t('practice.subtitle', language)}</p>
      </div>

      {/* Religion selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {religions.map(r => (
          <button
            key={r}
            onClick={() => { setReligion(religion === r ? '' : r); setPhilosophy(''); setChecked({}); }}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
              religion === r
                ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                : "bg-secondary text-secondary-foreground border-border hover:bg-amber-500/10 hover:border-amber-500/30"
            )}
          >
            {t(`religion.${r}`, language)}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center italic">
        {t('panel.choose_one', language)}
      </p>

      {/* Philosophy selector */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground text-center">{t('panel.philosophy', language)}</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {philosophies.map(p => (
            <button
              key={p}
              onClick={() => { setPhilosophy(philosophy === p ? '' : p); setReligion(''); setChecked({}); }}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                philosophy === p
                  ? "bg-violet-500 text-white border-violet-500 shadow-sm"
                  : "bg-secondary text-secondary-foreground border-border hover:bg-violet-500/10 hover:border-violet-500/30"
              )}
            >
              {t(`philosophy.${p}`, language)}
            </button>
          ))}
        </div>
      </div>

      {/* Gender selector for Judaism */}
      {religion === 'jewish' && (
        <Card>
          <CardContent className="pt-4">
            <Label className="text-sm font-semibold mb-2 block">{t('practice.gender', language)}</Label>
            <RadioGroup value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')} className="flex gap-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">{t('practice.male', language)}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">{t('practice.female', language)}</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Checklist */}
      {(religion || philosophy) && items.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>{t('practice.checklist', language)}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {checkedCount}/{items.length}
              </span>
            </CardTitle>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${items.length ? (checkedCount / items.length) * 100 : 0}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map(item => (
              <label key={item} className="flex items-start gap-3 cursor-pointer group">
                <Checkbox
                  checked={!!checked[item]}
                  onCheckedChange={(v) => setChecked(prev => ({ ...prev, [item]: !!v }))}
                  className="mt-0.5"
                />
                <span className={cn(
                  "text-sm transition-all",
                  checked[item] ? "line-through text-muted-foreground" : "text-foreground"
                )}>
                  {t(`practice.item.${item}`, language)}
                </span>
              </label>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Daily sacred content */}
      {(religion || philosophy) && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {t('practice.daily_content', language)}
              </CardTitle>
              {dailyContent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNarrate}
                  disabled={loadingAudio}
                  className="flex items-center gap-1.5"
                >
                  {loadingAudio ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isPlaying ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                  <span className="text-xs">
                    {isPlaying ? t('practice.stop', language) : t('practice.listen', language)}
                  </span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loadingContent ? (
              <div className="flex items-center gap-2 text-muted-foreground py-4 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{t('practice.loading', language)}</span>
              </div>
            ) : dailyContent ? (
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {dailyContent.title}
                  </h3>
                  {dailyContent.reference && (
                    <p className="text-xs text-muted-foreground mt-0.5">{dailyContent.reference}</p>
                  )}
                </div>
                <p className="text-sm text-foreground leading-relaxed">{dailyContent.explanation}</p>
                <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                  <p className="text-sm text-foreground italic">✨ {dailyContent.reflection}</p>
                </div>

                {/* Sources */}
                {dailyContent.sources && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <BookMarked className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <p><span className="font-medium">{t('practice.sources', language)}:</span> {dailyContent.sources}</p>
                  </div>
                )}

                {/* Scholarly note */}
                {dailyContent.scholarly_note && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <GraduationCap className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <p><span className="font-medium">{t('practice.scholarly_note', language)}:</span> {dailyContent.scholarly_note}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('practice.select_philosophy', language)}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
