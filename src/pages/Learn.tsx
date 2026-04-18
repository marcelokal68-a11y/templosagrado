import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useSearchParams } from 'react-router-dom';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
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
import { ArrowLeft, SendHorizonal, Loader2, GraduationCap, Sparkles, Shuffle } from 'lucide-react';
import ReligionIcon from '@/components/ReligionIcon';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import SanskritGlossary from '@/components/learn/SanskritGlossary';
import BuddhistSchoolsComparison from '@/components/learn/BuddhistSchoolsComparison';
import ChristianBranchesComparison from '@/components/learn/ChristianBranchesComparison';
import HinduDarshanasComparison from '@/components/learn/HinduDarshanasComparison';
import IslamBranchesComparison from '@/components/learn/IslamBranchesComparison';
import SpiritistGlossary from '@/components/learn/SpiritistGlossary';
import UmbandaGlossary from '@/components/learn/UmbandaGlossary';

const RELIGIONS = [
  'christian', 'catholic', 'protestant', 'mormon', 'jewish', 'islam',
  'hindu', 'buddhist', 'spiritist', 'umbanda', 'candomble', 'agnostic',
];

const PHILOSOPHIES = [
  'stoicism', 'logosophy', 'humanism', 'epicureanism', 'transhumanism',
  'pantheism', 'existentialism', 'objectivism', 'transcendentalism', 'altruism',
  'rationalism', 'optimistic_nihilism', 'absurdism', 'utilitarianism', 'pragmatism',
  'shamanism', 'taoism', 'anthroposophy', 'cosmism', 'ubuntu',
];

const LEARN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/learn-chat`;

// ===== Trending traditions (deterministic weekly seed) =====
type TrendingItem = { key: string; kind: 'religion' | 'philosophy' };

function getISOWeekSeed(): number {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return d.getUTCFullYear() * 100 + weekNo;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getWeeklyTrending(preferredReligion: string | null, shuffleOffset = 0): TrendingItem[] {
  const pool: TrendingItem[] = [
    ...RELIGIONS.map(k => ({ key: k, kind: 'religion' as const })),
    ...PHILOSOPHIES.map(k => ({ key: k, kind: 'philosophy' as const })),
  ].filter(item => item.key !== preferredReligion); // never recommend the user's own faith

  const rand = mulberry32(getISOWeekSeed() + shuffleOffset * 7919);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 3);
}

type Msg = { role: 'user' | 'assistant'; content: string; suggestions?: string[] };

function parseSuggestions(content: string): { text: string; suggestions: string[] } {
  const idx = content.indexOf('---SUGGESTIONS---');
  if (idx === -1) return { text: content, suggestions: [] };
  const text = content.slice(0, idx).trim();
  const rest = content.slice(idx + '---SUGGESTIONS---'.length).trim();
  try {
    const arr = JSON.parse(rest);
    if (Array.isArray(arr)) return { text, suggestions: arr.filter(s => typeof s === 'string') };
  } catch { /* ignore */ }
  return { text, suggestions: [] };
}

export default function Learn() {
  const { language, user, setChatContext, preferredReligion, changeFaithWithCleanup } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [topic, setTopic] = useState<string | null>(null);
  const [topicKind, setTopicKind] = useState<'religion' | 'philosophy' | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFaithPrompt, setShowFaithPrompt] = useState(false);
  const [trendingShuffle, setTrendingShuffle] = useState(0);
  const [faithPromptShown, setFaithPromptShown] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle ?topic=key&kind=religion|philosophy from ContextPanel explore
  useEffect(() => {
    const qTopic = searchParams.get('topic');
    const qKind = searchParams.get('kind') as 'religion' | 'philosophy' | null;
    if (qTopic && (qKind === 'religion' || qKind === 'philosophy')) {
      setSearchParams({}, { replace: true });
      startTopic(qTopic, qKind);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const labelFor = (key: string, kind: 'religion' | 'philosophy') => {
    return t(`${kind}.${key}` as any, language);
  };

  const startTopic = async (key: string, kind: 'religion' | 'philosophy') => {
    setTopic(key);
    setTopicKind(kind);
    setMessages([]);
    setFaithPromptShown(false);
    // Track exploration: if user has a different preferred faith, mark this as "exploring"
    if (kind === 'religion' && preferredReligion && preferredReligion !== key) {
      try { sessionStorage.setItem('exploring_faith', key); } catch {}
    }
    const introQuestion = language === 'en'
      ? `Give me a brief, fascinating introduction to ${labelFor(key, kind)}.`
      : language === 'es'
        ? `Dame una breve y fascinante introducción al/a la ${labelFor(key, kind)}.`
        : `Faça uma introdução breve e fascinante sobre ${labelFor(key, kind)}.`;
    await sendMessage(introQuestion, key, kind, []);
  };

  const sendMessage = async (text: string, t_key?: string, t_kind?: 'religion' | 'philosophy', baseMessages?: Msg[]) => {
    const activeTopic = t_key ?? topic;
    const activeKind = t_kind ?? topicKind;
    if (!activeTopic || loading) return;
    const history = baseMessages ?? messages;

    const userMsg: Msg = { role: 'user', content: text };
    setMessages([...history, userMsg]);
    setInput('');
    setLoading(true);

    let assistantSoFar = '';
    try {
      const resp = await fetch(LEARN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...history, userMsg].map(m => ({ role: m.role, content: m.content })),
          topic: activeTopic,
          language,
        }),
      });

      if (resp.status === 429) {
        toast.error(t('chat.rate_limit', language));
        setLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error(t('chat.credits_out', language));
        setLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error('stream failed');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { done = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const c = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (c) {
              assistantSoFar += c;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Parse suggestions from final content
      const { text: finalText, suggestions } = parseSuggestions(assistantSoFar);
      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1 && m.role === 'assistant'
          ? { ...m, content: finalText, suggestions }
          : m
      ));

      // Offer faith prompt for religions after first response
      if (activeKind === 'religion' && !faithPromptShown && user) {
        setFaithPromptShown(true);
        setShowFaithPrompt(true);
      }
    } catch (e) {
      console.error('learn-chat error:', e);
      toast.error(t('chat.error', language));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const text = input.trim();
    if (!text || loading) return;
    sendMessage(text);
  };

  const handleConfirmFaith = async () => {
    if (!user || !topic) return;
    // Only religions can be saved as preferred faith
    if (topicKind !== 'religion') return;
    // If user already had a different faith → wipe history; otherwise just set it
    if (preferredReligion && preferredReligion !== topic) {
      await changeFaithWithCleanup(topic);
      toast.success(
        language === 'en' ? 'Faith updated — chat history cleared'
          : language === 'es' ? 'Fe actualizada — historial borrado'
            : 'Fé atualizada — histórico apagado'
      );
    } else {
      await supabase.from('profiles').update({ preferred_religion: topic } as any).eq('user_id', user.id);
      setChatContext(prev => ({ ...prev, religion: topic, philosophy: '' }));
      toast.success(language === 'en' ? 'Faith updated' : language === 'es' ? 'Fe actualizada' : 'Fé atualizada');
    }
    try { sessionStorage.removeItem('exploring_faith'); } catch {}
    setShowFaithPrompt(false);
  };

  const resetTopic = () => {
    setTopic(null);
    setTopicKind(null);
    setMessages([]);
    setInput('');
    setFaithPromptShown(false);
  };

  // ===== Topic selection grid =====
  if (!topic) {
    return (
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
              {t('learn.title', language)}
            </h1>
          </div>
          <p className="text-muted-foreground mb-8 ml-13">
            {t('learn.subtitle', language)}
          </p>

          <section className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              {language === 'en' ? 'Religions' : language === 'es' ? 'Religiones' : 'Religiões'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {RELIGIONS.map(key => {
                const isPreferred = preferredReligion === key;
                const isDimmed = !!preferredReligion && !isPreferred;
                return (
                  <button
                    key={key}
                    onClick={() => startTopic(key, 'religion')}
                    className={cn(
                      "group flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                      isPreferred
                        ? "border-primary/60 bg-primary/10 ring-2 ring-primary/30 shadow-sm"
                        : "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
                      isDimmed && "opacity-50 hover:opacity-100"
                    )}
                  >
                    <ReligionIcon religion={key} className="shrink-0" />
                    <span className={cn(
                      "text-sm font-medium",
                      isPreferred ? "text-primary" : "text-foreground group-hover:text-primary"
                    )}>
                      {labelFor(key, 'religion')}
                      {isPreferred && <span className="block text-[10px] font-medium text-primary/80">★ sua tradição</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Sanskrit glossary — visual primer for beginners (relevant to Hindu, Buddhist, Yoga) */}
          <section className="mb-10">
            <SanskritGlossary />
          </section>

          {/* Buddhist schools comparison — visual primer */}
          <section className="mb-10">
            <BuddhistSchoolsComparison />
          </section>

          {/* Hindu Darshanas comparison — visual primer */}
          <section className="mb-10">
            <HinduDarshanasComparison />
          </section>

          {/* Islam branches comparison — visual primer */}
          <section className="mb-10">
            <IslamBranchesComparison />
          </section>

          {/* Christian branches comparison — visual primer */}
          <section className="mb-10">
            <ChristianBranchesComparison />
          </section>

          {/* Umbanda glossary — visual primer */}
          <section className="mb-10">
            <UmbandaGlossary />
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              {language === 'en' ? 'Life Philosophies' : language === 'es' ? 'Filosofías de Vida' : 'Filosofias de Vida'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {PHILOSOPHIES.map(key => {
                const isDimmed = !!preferredReligion;
                return (
                  <button
                    key={key}
                    onClick={() => startTopic(key, 'philosophy')}
                    className={cn(
                      "group flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-left",
                      isDimmed && "opacity-50 hover:opacity-100"
                    )}
                  >
                    <span className="shrink-0 text-base">📖</span>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary">
                      {labelFor(key, 'philosophy')}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Trending traditions — 3 picks rotating weekly */}
          <section className="mt-10">
            <div className="flex items-center justify-between mb-3 gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {language === 'en' ? 'Recommended traditions' : language === 'es' ? 'Tradiciones recomendadas' : 'Tradições recomendadas'}
              </h2>
              <button
                onClick={() => setTrendingShuffle(s => s + 1)}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-muted/50"
                title={language === 'en' ? 'Shuffle recommendations' : language === 'es' ? 'Sortear nuevas' : 'Sortear novas'}
              >
                <Shuffle className="h-3 w-3" />
                {language === 'en' ? 'See another' : language === 'es' ? 'Ver otra' : 'Ver outra recomendação'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {getWeeklyTrending(preferredReligion, trendingShuffle).map(item => (
                <button
                  key={`${item.kind}-${item.key}-${trendingShuffle}`}
                  onClick={() => startTopic(item.key, item.kind)}
                  className="group relative flex items-center gap-3 p-4 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 hover:border-primary/50 transition-all text-left"
                >
                  {item.kind === 'religion' ? (
                    <ReligionIcon religion={item.key} className="shrink-0" />
                  ) : (
                    <span className="shrink-0 text-base">📖</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary truncate">
                      {labelFor(item.key, item.kind)}
                    </p>
                    <p className="text-[10px] font-medium text-primary/80 mt-0.5 flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" />
                      {trendingShuffle === 0
                        ? (language === 'en' ? 'Trending this week' : language === 'es' ? 'En tendencia esta semana' : 'Em alta esta semana')
                        : (language === 'en' ? 'New suggestion' : language === 'es' ? 'Nueva sugerencia' : 'Nova sugestão')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ===== Chat interface =====
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetTopic}
            className="gap-1.5 h-9 px-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              {language === 'en' ? 'Change topic' : language === 'es' ? 'Cambiar tema' : 'Trocar tópico'}
            </span>
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            {topicKind === 'religion' ? (
              <ReligionIcon religion={topic} />
            ) : (
              <span className="text-base">📖</span>
            )}
            <h1 className="text-base font-semibold text-foreground truncate">
              {labelFor(topic, topicKind!)}
            </h1>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
          {/* Sanskrit glossary inside Hindu/Buddhist study sessions */}
          {(topic === 'hindu' || topic === 'buddhist') && (
            <SanskritGlossary compact />
          )}

          {/* Hindu Darshanas comparison inside Hindu study session */}
          {topic === 'hindu' && (
            <HinduDarshanasComparison compact />
          )}

          {/* Buddhist schools comparison inside Buddhist study session */}
          {topic === 'buddhist' && (
            <BuddhistSchoolsComparison compact />
          )}

          {/* Islam branches comparison inside Islam study session */}
          {topic === 'islam' && (
            <IslamBranchesComparison compact />
          )}

          {/* Christian branches comparison inside Christian study sessions */}
          {(topic === 'christian' || topic === 'catholic' || topic === 'protestant') && (
            <ChristianBranchesComparison compact />
          )}

          {/* Spiritist glossary inside Spiritism study session */}
          {topic === 'spiritist' && (
            <SpiritistGlossary compact />
          )}

          {/* Umbanda glossary inside Umbanda study session */}
          {topic === 'umbanda' && (
            <UmbandaGlossary compact />
          )}

          {messages.length === 0 && loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">{t('learn.professor_mode', language)}…</span>
            </div>
          )}

          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            const { text: displayText, suggestions } = isUser
              ? { text: msg.content, suggestions: [] as string[] }
              : msg.suggestions
                ? { text: msg.content, suggestions: msg.suggestions }
                : parseSuggestions(msg.content);
            const isLast = i === messages.length - 1;

            return (
              <div key={i} className={cn('flex gap-2', isUser ? 'justify-end' : 'justify-start')}>
                {!isUser && (
                  <div className="shrink-0 w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center mt-auto ring-1 ring-primary/20">
                    <GraduationCap className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={cn('flex flex-col gap-2', isUser ? 'items-end' : 'items-start', 'max-w-[85%]')}>
                  <div className={cn(
                    'rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap',
                    isUser
                      ? 'bg-foreground text-background rounded-br-sm'
                      : 'bg-card border border-border text-foreground rounded-bl-sm'
                  )}>
                    {displayText || (loading && isLast ? '…' : '')}
                  </div>

                  {!isUser && isLast && !loading && suggestions.length > 0 && (
                    <div className="flex flex-col gap-1.5 w-full">
                      {suggestions.map((s, si) => (
                        <button
                          key={si}
                          onClick={() => sendMessage(s)}
                          className="text-left text-sm px-3 py-2 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 text-foreground/90 hover:text-primary transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-2 justify-start">
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center ring-1 ring-primary/20">
                <GraduationCap className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={t('learn.ask_placeholder', language)}
              rows={1}
              disabled={loading}
              className="resize-none min-h-[44px] max-h-32 text-[15px]"
            />
            <Button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              size="icon"
              className="h-11 w-11 shrink-0"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showFaithPrompt} onOpenChange={setShowFaithPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('learn.ask_faith', language).replace('{religion}', topic ? labelFor(topic, 'religion') : '')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {preferredReligion && preferredReligion !== topic
                ? (language === 'en'
                    ? 'This will set this tradition as your default AND permanently erase your current chat history so the Mentor starts fresh.'
                    : language === 'es'
                      ? 'Esto establecerá esta tradición como tu predeterminada Y borrará permanentemente tu historial de chat para que el Mentor comience de nuevo.'
                      : 'Isso definirá esta tradição como sua padrão E apagará permanentemente seu histórico de conversas para que o Mentor recomece.')
                : (language === 'en'
                    ? 'This will set this tradition as your default in chat and other features.'
                    : language === 'es'
                      ? 'Esto establecerá esta tradición como tu predeterminada en el chat y otras funciones.'
                      : 'Isso definirá esta tradição como sua padrão no chat e outras funções.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('learn.not_now', language)}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmFaith}>{t('learn.yes', language)}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
