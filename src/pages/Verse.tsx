import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, RefreshCw, Loader2, Sparkles, BookMarked, GraduationCap, Volume2, VolumeX, Target, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const religions = ['christian', 'hindu', 'buddhist', 'islam', 'mormon', 'protestant', 'catholic', 'jewish', 'agnostic', 'spiritist', 'umbanda', 'candomble'];

interface VerseContent {
  title: string;
  reference: string;
  explanation: string;
  reflection: string;
  sources?: string;
  scholarly_note?: string;
  practical_use?: string;
}

export default function Verse() {
  const { language, chatContext, user } = useApp();
  const [selectedReligion, setSelectedReligion] = useState(chatContext.religion || 'christian');
  const [content, setContent] = useState<VerseContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchVerse = async (religion?: string) => {
    setLoading(true);
    setContent(null);
    try {
      const { data, error } = await supabase.functions.invoke('verse-of-day', {
        body: { religion: religion || selectedReligion || 'christian', language },
      });
      if (error) throw error;
      if (data?.title || data?.explanation) {
        setContent(data);
        // Insert into activity_history
        if (user) {
          (supabase.from('activity_history' as any) as any).insert({
            user_id: user.id,
            type: 'verse',
            title: data.title || 'Versículo do Dia',
            content: `${data.explanation || ''}\n\n${data.practical_use || ''}`,
            metadata: { religion: religion || selectedReligion, reference: data.reference },
          }).then(() => {});
        }
      } else if (data?.verse) {
        // Legacy fallback
        setContent({ title: '', reference: '', explanation: data.verse, reflection: '', sources: '', scholarly_note: '' });
      }
    } catch (err) {
      console.error(err);
      setContent({ title: '', reference: '', explanation: t('verse.loading', language), reflection: '', sources: '', scholarly_note: '' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVerse(); }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  const handleReligionChange = (r: string) => {
    setSelectedReligion(r);
    setFeedbackGiven(null);
    fetchVerse(r);
  };

  const handleCopyPractical = async () => {
    if (!content?.practical_use) return;
    await navigator.clipboard.writeText(content.practical_use);
    toast({ title: t('verse.copied', language) });
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedbackGiven(type);
    toast({ title: t('verse.feedback_thanks', language) });
  };

  const handleNarrate = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      return;
    }
    if (!content) return;
    const text = `${content.title}. ${content.explanation}. ${content.reflection}`;
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
      audio.onended = () => { setIsPlaying(false); audioRef.current = null; };
      await audio.play();
      setIsPlaying(true);
    } catch (e) {
      console.error('TTS error:', e);
    } finally {
      setLoadingAudio(false);
    }
  };

  return (
    <div className="flex-1 flex items-start justify-center p-4 pb-24">
      <div className="w-full max-w-2xl space-y-4">
        <div className="text-center space-y-1">
          <BookOpen className="h-10 w-10 text-primary mx-auto" />
          <h1 className="font-display text-2xl font-bold">{t('verse.title', language)}</h1>
          <p className="text-sm text-muted-foreground">{t('verse.subtitle', language)}</p>
        </div>

        {/* Religion selector */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {religions.map(r => (
            <button
              key={r}
              onClick={() => handleReligionChange(r)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                selectedReligion === r
                  ? "sacred-gradient text-primary-foreground border-primary/50 shadow-sm sacred-glow"
                  : "bg-secondary text-secondary-foreground border-primary/10 hover:bg-primary/10 hover:border-primary/30"
              )}
            >
              {t(`religion.${r}`, language)}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <Card>
            <CardContent className="py-8 flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t('verse.loading', language)}</p>
            </CardContent>
          </Card>
        ) : content ? (
          <Card className="glass sacred-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {content.title || t('verse.title', language)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleNarrate} disabled={loadingAudio} className="flex items-center gap-1.5">
                    {loadingAudio ? <Loader2 className="h-4 w-4 animate-spin" /> : isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    <span className="text-xs">{isPlaying ? t('practice.stop', language) : t('practice.listen', language)}</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => fetchVerse()} className="gap-1.5">
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-xs hidden sm:inline">{t('verse.refresh', language)}</span>
                  </Button>
                </div>
              </div>
              {content.reference && (
                <p className="text-xs text-muted-foreground mt-1">{content.reference}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground leading-relaxed">{content.explanation}</p>

              {content.reflection && (
                <div className="bg-primary/8 rounded-lg p-3 border border-primary/15">
                  <p className="text-sm text-foreground italic">✨ {content.reflection}</p>
                </div>
              )}

              {content.sources && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <BookMarked className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <p><span className="font-medium">{t('practice.sources', language)}:</span> {content.sources}</p>
                </div>
              )}

              {content.scholarly_note && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <GraduationCap className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <p><span className="font-medium">{t('practice.scholarly_note', language)}:</span> {content.scholarly_note}</p>
                </div>
              )}

              {content.practical_use && (
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <h3 className="font-display text-sm font-semibold text-primary">{t('verse.practical_title', language)}</h3>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{content.practical_use}</p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFeedback('up')}
                        className={cn("p-1.5 rounded-md transition-colors", feedbackGiven === 'up' ? "text-primary bg-primary/15" : "text-muted-foreground hover:text-primary hover:bg-primary/10")}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleFeedback('down')}
                        className={cn("p-1.5 rounded-md transition-colors", feedbackGiven === 'down' ? "text-destructive bg-destructive/15" : "text-muted-foreground hover:text-destructive hover:bg-destructive/10")}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </button>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopyPractical} className="gap-1.5 text-xs">
                      <Copy className="h-3.5 w-3.5" />
                      {t('posts.copy', language)}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
