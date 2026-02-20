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
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [dailyContent, setDailyContent] = useState<DailyContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const today = getTodayStr();

  const getItems = (): string[] => {
    if (religion === 'jewish') return gender === 'male' ? JEWISH_MALE : JEWISH_FEMALE;
    return CHECKLISTS[religion]?.items || [];
  };

  // Load from localStorage
  useEffect(() => {
    if (!religion) return;
    const key = getStorageKey(today, religion, religion === 'jewish' ? gender : undefined);
    const saved = localStorage.getItem(key);
    if (saved) {
      try { setChecked(JSON.parse(saved)); } catch { setChecked({}); }
    } else {
      setChecked({});
    }
  }, [religion, gender, today]);

  // Save to localStorage
  useEffect(() => {
    if (!religion) return;
    const key = getStorageKey(today, religion, religion === 'jewish' ? gender : undefined);
    localStorage.setItem(key, JSON.stringify(checked));
  }, [checked, religion, gender, today]);

  // Fetch daily content
  useEffect(() => {
    if (!religion) { setDailyContent(null); return; }
    setLoadingContent(true);
    setDailyContent(null);
    supabase.functions.invoke('daily-practice', {
      body: { religion, date: today, language, gender: religion === 'jewish' ? gender : undefined },
    }).then(({ data, error }) => {
      if (!error && data) setDailyContent(data);
      setLoadingContent(false);
    }).catch(() => setLoadingContent(false));
  }, [religion, gender, today, language]);

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
            onClick={() => { setReligion(r); setChecked({}); }}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
              religion === r
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-secondary text-secondary-foreground border-border hover:bg-primary/10 hover:border-primary/30"
            )}
          >
            {t(`religion.${r}`, language)}
          </button>
        ))}
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
      {religion && items.length > 0 && (
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
      {religion && (
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
                {t('practice.select_religion', language)}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
