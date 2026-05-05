import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Loader2, Volume2, VolumeX, Mic, MicOff, MoreVertical, Trash2, XCircle, Copy, Sparkles, Lock, Brain, ShieldCheck, FileText, Download, LogIn } from 'lucide-react';

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PublishToMural from '@/components/mural/PublishToMural';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { ToastAction } from '@/components/ui/toast';
import TrialBanner from '@/components/TrialBanner';
import { isPreviewEnvironment } from '@/lib/access';
import { getEdgeAuthHeaders } from '@/lib/authHeader';

type Source = { id: string; title: string; author: string | null };
type Msg = { role: 'user' | 'assistant'; content: string; sources?: Source[] };

// Threshold to warn the user that their quota is running out (free/trial only)
const LOW_QUOTA_WARNING_THRESHOLD = 5;

function parseSuggestions(content: string): { text: string; suggestions: string[] } {
  const match = content.match(/\[SUGGESTIONS\](.*?)\[\/SUGGESTIONS\]/s);
  if (match) {
    const text = content.replace(/\[SUGGESTIONS\][\s\S]*?\[\/SUGGESTIONS\]/, '').trim();
    const suggestions = match[1].split('|').map(s => s.trim()).filter(Boolean);
    return { text, suggestions };
  }
  // Hide partial/streaming SUGGESTIONS marker (opened but not yet closed)
  const partialIdx = content.indexOf('[SUGGESTIONS]');
  if (partialIdx !== -1) {
    return { text: content.slice(0, partialIdx).trimEnd(), suggestions: [] };
  }
  // Hide incomplete opening tag like "[SUGGEST" or "[SUGGESTION" at the very end
  const openMatch = content.match(/\[(?:S(?:U(?:G(?:G(?:E(?:S(?:T(?:I(?:O(?:N(?:S)?)?)?)?)?)?)?)?)?)?)?$/);
  if (openMatch) {
    return { text: content.slice(0, openMatch.index).trimEnd(), suggestions: [] };
  }
  return { text: content, suggestions: [] };
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sacred-chat`;
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;
const STT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-stt`;
const GUEST_CHAT_ID_KEY = 'ts:guest-chat-id:v1';
const GUEST_REMAINING_KEY = 'ts:guest-questions-remaining:v1';
const GUEST_QUESTION_LIMIT = 20;

function getGuestChatId(): string {
  try {
    const existing = localStorage.getItem(GUEST_CHAT_ID_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(GUEST_CHAT_ID_KEY, id);
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

/* Minimalist sun icon for the divine avatar */
function DivineIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
    </svg>
  );
}

function MessageBubble({ msg, index, playingIndex, loadingAudio, onNarrate, onCopy, isLast, onSuggestionClick, isVisitor, onPremiumGate }: {
  msg: Msg; index: number; playingIndex: number | null; loadingAudio: number | null; 
  onNarrate: (text: string, index: number) => void; onCopy: (text: string) => void;
  isLast?: boolean; onSuggestionClick?: (text: string) => void;
  isVisitor?: boolean; onPremiumGate?: () => void;
}) {
  const isUser = msg.role === 'user';
  const { text: displayText, suggestions } = isUser ? { text: msg.content, suggestions: [] } : parseSuggestions(msg.content);
  
  return (
    <div className={cn("flex gap-2 animate-fade-in", isUser ? 'justify-end' : 'justify-start')}>
      {/* Divine avatar */}
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center mt-auto ring-1 ring-primary/20">
          <DivineIcon />
        </div>
      )}
      
      <div className={cn("flex flex-col gap-0.5", isUser ? "items-end" : "items-start", "max-w-[78%]")}>
        <div className={cn(
          "rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed",
          isUser
            ? "bg-foreground text-background rounded-br-sm"
            : "bg-card border border-border text-foreground rounded-bl-sm"
        )}>
          <p className="whitespace-pre-wrap">{displayText}</p>
          {!isUser && msg.sources && msg.sources.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/60">
              <p className="text-[11px] font-medium text-muted-foreground mb-1">📚 Fontes</p>
              <ul className="space-y-0.5">
                {msg.sources.map((s, i) => (
                  <li key={s.id} className="text-[11px] text-muted-foreground">
                    [{i + 1}] <span className="text-foreground/80">{s.title}</span>
                    {s.author && <span> — {s.author}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Action row for assistant messages — compact, below bubble */}
        {!isUser && displayText.length > 0 && (
          <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
               style={{ opacity: 1 }}>
            {isVisitor ? (
              <button
                onClick={onPremiumGate}
                className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                title="Entre para ouvir"
              >
                <Lock className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onNarrate(displayText, index)}
                disabled={loadingAudio === index}
                className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                title="Ouvir"
              >
                {loadingAudio === index ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : playingIndex === index ? (
                  <VolumeX className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5" />
                )}
              </button>
            )}
            {isVisitor ? (
              <>
                <button
                  onClick={onPremiumGate}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Entre para copiar"
                >
                  <Lock className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onPremiumGate}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Entre para publicar no Mural"
                >
                  <Lock className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onCopy(displayText)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Copiar"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <PublishToMural originalContent={displayText} />
              </>
            )}
          </div>
        )}

        {/* Follow-up suggestion chips — only on last assistant message */}
        {!isUser && suggestions.length > 0 && isLast && (
          <div className="mt-2.5 w-full flex flex-col gap-1.5 animate-fade-in">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70 ml-1">
              Continue a conversa
            </p>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(s)}
                className="text-left text-xs px-3 py-2 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all text-foreground/85 leading-snug"
              >
                <span className="text-primary mr-1">✨</span>{s}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const ChatArea = forwardRef<{ sendAutoMessage: (msg: string) => void }, {}>((_props, ref) => {
  const { language, user, chatContext, setChatContext, questionsRemaining, setQuestionsRemaining, messages, setMessages, chatInput, setChatInput, hasPendingUndo, undoClearChat, geo, memoryEnabled, setMemoryEnabled, chatTone, accessStatus, refreshProfile } = useApp();
  const religion = chatContext.religion || '';
  const [isLoading, setIsLoading] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<number | null>(null);
  const [ttsSpeed, setTtsSpeed] = useState(1.15);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [confessionalMode, setConfessionalMode] = useState(false);
  const [sessionClosed, setSessionClosed] = useState(false);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [lgpdAccepted, setLgpdAccepted] = useState(() => localStorage.getItem('lgpd_accepted') === 'true');
  const [guestQuestionsRemaining, setGuestQuestionsRemaining] = useState(() => {
    const raw = localStorage.getItem(GUEST_REMAINING_KEY);
    if (raw === null) return GUEST_QUESTION_LIMIT;
    const saved = Number(raw);
    return Number.isFinite(saved) && saved >= 0 ? saved : GUEST_QUESTION_LIMIT;
  });
  const [exploringFaith, setExploringFaith] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<number, string>>(new Map());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const prevAffiliationRef = useRef<string>('');
  const navigate = useNavigate();

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  // Detect "exploration return": user came back from /learn after clicking "Só explorar"
  useEffect(() => {
    if (!user) return;
    try {
      const explored = sessionStorage.getItem('exploring_faith');
      if (explored) {
        setExploringFaith(explored);
        sessionStorage.removeItem('exploring_faith');
        // Auto-hide after 20s
        const timer = setTimeout(() => setExploringFaith(null), 20000);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [user]);

  const adoptExploredFaith = async () => {
    if (!user || !exploringFaith) return;
    const key = exploringFaith;
    setExploringFaith(null);
    const { error } = await supabase.from('profiles').update({ preferred_religion: key }).eq('user_id', user.id);
    if (error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
      return;
    }
    setChatContext(prev => ({ ...prev, religion: key, philosophy: '' }));
    await refreshProfile();
    toast({ title: language === 'en' ? 'Faith updated' : language === 'es' ? 'Fe actualizada' : 'Fé atualizada' });
  };


  useEffect(() => {
    if (hasPendingUndo) {
      toast({
        title: t('chat.cleared', language) || 'Chat limpo',
        description: t('chat.cleared_desc', language) || 'A conversa foi limpa ao trocar de afiliação.',
        action: (
          <ToastAction altText="Desfazer" onClick={undoClearChat}>
            {t('chat.undo', language) || 'Desfazer'}
          </ToastAction>
        ),
        duration: 20000,
      });
    }
  }, [hasPendingUndo]);

  // Load messages filtered by current affiliation
  useEffect(() => {
    if (!user || confessionalMode) {
      if (!user) {
        setMessages([]);
        stopAudio();
        audioCacheRef.current.forEach(url => URL.revokeObjectURL(url));
        audioCacheRef.current.clear();
      }
      return;
    }

    const currentAffiliation = chatContext.philosophy || chatContext.religion || '';
    
    let query = supabase
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (chatContext.philosophy) {
      query = query.eq('philosophy', chatContext.philosophy);
    } else if (chatContext.religion) {
      query = query.eq('religion', chatContext.religion);
    }

    query.then(({ data }) => {
      if (data && data.length > 0) {
        setMessages(data.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })));
      } else {
        if (prevAffiliationRef.current !== currentAffiliation) {
          setMessages([]);
        }
      }
      prevAffiliationRef.current = currentAffiliation;
    });
  }, [user, chatContext.religion, chatContext.philosophy]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingIndex(null);
  }, []);

  const buildTTSHeaders = useCallback(async () => {
    return await getEdgeAuthHeaders();
  }, []);

  const preloadAudio = useCallback(async (text: string, index: number) => {
    if (audioCacheRef.current.has(index)) return;
    try {
      const headers = await buildTTSHeaders();
      const resp = await fetch(TTS_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text, speed: ttsSpeed }),
      });
      if (!resp.ok) return;
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      audioCacheRef.current.set(index, url);
    } catch { /* silent preload failure */ }
  }, [buildTTSHeaders, ttsSpeed]);

  const playNarration = useCallback(async (text: string, index: number) => {
    if (playingIndex === index) { stopAudio(); return; }
    stopAudio();

    const cachedUrl = audioCacheRef.current.get(index);
    if (cachedUrl) {
      try {
        const audio = new Audio(cachedUrl);
        audioRef.current = audio;
        setPlayingIndex(index);
        audio.onended = () => setPlayingIndex(null);
        audio.onerror = () => { setPlayingIndex(null); };
        await audio.play();
      } catch (e) {
        console.error('Playback error:', e);
        setPlayingIndex(null);
        toast({ title: t('chat.error', language), variant: 'destructive' });
      }
      return;
    }

    setLoadingAudio(index);
    try {
      const headers = await buildTTSHeaders();
      const resp = await fetch(TTS_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text, speed: ttsSpeed }),
      });
      if (resp.status === 429) {
        let payload: any = {};
        try { payload = await resp.json(); } catch {}
        toast({
          title: 'Limite mensal de áudio atingido',
          description: payload.message ?? 'Você usou todas as 300 narrações deste mês. O contador reinicia no próximo mês.',
          variant: 'destructive',
        });
        return;
      }
      if (!resp.ok) throw new Error('TTS failed');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      audioCacheRef.current.set(index, url);
      const audio = new Audio(url);
      audioRef.current = audio;
      setPlayingIndex(index);
      audio.onended = () => setPlayingIndex(null);
      audio.onerror = () => setPlayingIndex(null);
      await audio.play();
    } catch (e) {
      console.error(e);
      toast({ title: t('chat.error', language), variant: 'destructive' });
    } finally {
      setLoadingAudio(null);
    }
  }, [playingIndex, stopAudio, language, toast, buildTTSHeaders, ttsSpeed]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!' });
  }, [toast]);

  const userMessageCount = useMemo(() => messages.filter(m => m.role === 'user').length, [messages]);

  const doSendMessage = async (text: string) => {
    if (!text.trim() || isLoading || sessionClosed) return;
    if (!user && guestQuestionsRemaining <= 0) {
      setSessionClosed(true);
      navigate('/auth?next=/pricing');
      return;
    }

    const userMsg: Msg = { role: 'user', content: text.trim() };

    const headers = await getEdgeAuthHeaders();
    const guestId = user ? undefined : getGuestChatId();

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsLoading(true);

    let assistantSoFar = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [...messages, userMsg].slice(-40),
          context: chatContext,
          language,
          userId: user?.id,
          datetime: new Date().toISOString(),
          timezone,
          geo,
          guestId,
          skipMemory: confessionalMode || undefined,
          chatTone,
        }),
      });

      if (resp.status === 401 || resp.status === 403) {
        // Auth header invalid (expired session, malformed JWT). For guests this
        // shouldn't happen — show a clear message and roll back the user msg.
        setMessages(prev => prev.slice(0, -1));
        if (user) {
          // Try refreshing the session; if it fails, ask the user to sign back in.
          await supabase.auth.refreshSession().catch(() => {});
          toast({
            title: 'Sessão expirada',
            description: 'Por favor, entre novamente para continuar a conversa.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('chat.error', language),
            description: t('chat.error_desc', language),
            variant: 'destructive',
          });
        }
        setIsLoading(false);
        return;
      }

      if (resp.status === 429) {
        toast({ title: t('chat.rate_limit', language), description: t('chat.rate_limit_desc', language), variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        // Quota esgotada — atualiza contador, encerra a sessão e oferece upgrade
        if (!user) {
          setGuestQuestionsRemaining(0);
          localStorage.setItem(GUEST_REMAINING_KEY, '0');
        } else {
          setQuestionsRemaining(0);
          refreshProfile?.();
        }
        toast({
          title: 'Limite mensal atingido',
          description: user ? 'Você usou suas perguntas do mês. Faça upgrade para continuar.' : 'Entre para continuar sua conversa.',
        });
        setMessages(prev => prev.slice(0, -1)); // remove pergunta não respondida
        setSessionClosed(true);
        if (user) setShowUpgradeModal(true);
        else navigate('/auth?next=/pricing');
        setIsLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error('Failed to start stream');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      const handleSseEvent = (rawEvent: string) => {
        // An SSE "event" may contain multiple `data:` lines that should be concatenated.
        const dataLines: string[] = [];
        for (const rawLine of rawEvent.split('\n')) {
          const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
          if (!line || line.startsWith(':')) continue;
          if (line.startsWith('data:')) {
            dataLines.push(line.slice(5).replace(/^ /, ''));
          }
        }
        if (dataLines.length === 0) return;
        const payload = dataLines.join('\n').trim();
        if (!payload) return;
        if (payload === '[DONE]') { streamDone = true; return; }

        let parsed: any;
        try { parsed = JSON.parse(payload); } catch { return; /* skip malformed event */ }

        if (parsed.__sources && Array.isArray(parsed.__sources)) {
          const incomingSources = parsed.__sources as Source[];
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return prev.map((m, i) => i === prev.length - 1 ? { ...m, sources: incomingSources } : m);
            }
            return [...prev, { role: 'assistant', content: '', sources: incomingSources }];
          });
          return;
        }
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) {
          assistantSoFar += content;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
            }
            return [...prev, { role: 'assistant', content: assistantSoFar }];
          });
        }
      };

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) {
          textBuffer += decoder.decode();
          break;
        }
        textBuffer += decoder.decode(value, { stream: true });

        // SSE events are separated by a blank line. Process every complete event.
        while (true) {
          const lf = textBuffer.indexOf('\n\n');
          const crlf = textBuffer.indexOf('\r\n\r\n');
          if (lf === -1 && crlf === -1) break;
          let sepIndex: number;
          let sepLen = 2;
          if (crlf !== -1 && (lf === -1 || crlf < lf)) {
            sepIndex = crlf;
            sepLen = 4;
          } else {
            sepIndex = lf;
          }
          const rawEvent = textBuffer.slice(0, sepIndex);
          textBuffer = textBuffer.slice(sepIndex + sepLen);
          handleSseEvent(rawEvent);
          if (streamDone) break;
        }
      }

      // Flush any trailing event that wasn't terminated by a blank line.
      if (textBuffer.trim().length > 0) {
        handleSseEvent(textBuffer);
        textBuffer = '';
      }

      if (assistantSoFar.length === 0) {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && !last.content) return prev.slice(0, -1);
          return prev;
        });
        throw new Error('Empty stream');
      }

      // Free/trial tier: decrement local counter (server already incremented) and warn near the limit
      const isMetered = accessStatus !== 'subscriber' && accessStatus !== 'admin';
      let newRemaining = questionsRemaining;
      if (!user) {
        newRemaining = Math.max(0, guestQuestionsRemaining - 1);
        setGuestQuestionsRemaining(newRemaining);
        localStorage.setItem(GUEST_REMAINING_KEY, String(newRemaining));
      } else if (isMetered && questionsRemaining > 0) {
        newRemaining = questionsRemaining - 1;
        setQuestionsRemaining(newRemaining);
      }

      if (user && assistantSoFar.length > 0 && !confessionalMode) {
        const ctx = {
          user_id: user.id,
          religion: chatContext.religion || null,
          need: chatContext.need || null,
          mood: chatContext.mood || null,
          topic: chatContext.topic || null,
          philosophy: chatContext.philosophy || null,
        };
        supabase.from('chat_messages').insert([
          { ...ctx, role: 'user', content: userMsg.content },
          { ...ctx, role: 'assistant', content: assistantSoFar },
        ]).then(() => {});

        (supabase.from('activity_history' as any) as any).insert({
          user_id: user.id,
          type: 'chat',
          title: userMsg.content.length > 60 ? userMsg.content.slice(0, 60) + '...' : userMsg.content,
          content: `👤 ${userMsg.content}\n\n🕊️ ${assistantSoFar}`,
          metadata: { religion: chatContext.religion || null, philosophy: chatContext.philosophy || null },
        }).then(() => {});
      }

      if (assistantSoFar.length > 0) {
        const assistantIndex = messages.length + 1;
        preloadAudio(assistantSoFar, assistantIndex);
      }

      // Quota-based warnings/closing — never close arbitrarily by message count
      if (isMetered) {
        if (newRemaining === 0) {
          // Quota exhausted — gently close the session and offer upgrade
          setSessionClosed(true);
          setShowUpgradeModal(true);
        } else if (newRemaining > 0 && newRemaining <= LOW_QUOTA_WARNING_THRESHOLD) {
          const titleByLang: Record<string, string> = {
            'pt-BR': `Restam ${newRemaining} pergunta${newRemaining === 1 ? '' : 's'}`,
            en: `${newRemaining} question${newRemaining === 1 ? '' : 's'} left`,
            es: `Quedan ${newRemaining} pregunta${newRemaining === 1 ? '' : 's'}`,
          };
          const descByLang: Record<string, string> = {
            'pt-BR': 'Faça upgrade para continuar conversando sem limites.',
            en: 'Upgrade your plan to keep chatting without limits.',
            es: 'Mejora tu plan para seguir conversando sin límites.',
          };
          toast({
            title: titleByLang[language] || titleByLang['pt-BR'],
            description: descByLang[language] || descByLang['pt-BR'],
          });
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: t('chat.error', language), description: t('chat.error_desc', language), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const summaryHeaders = await getEdgeAuthHeaders();
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: summaryHeaders,
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: parseSuggestions(m.content).text })),
          context: chatContext,
          language,
          userId: user?.id,
          generateSummary: true,
        }),
      });

      if (!resp.ok || !resp.body) throw new Error('Summary failed');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let summaryContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) summaryContent += content;
          } catch { break; }
        }
      }

      setSummaryText(summaryContent);
      setShowSummaryDialog(true);
    } catch (e) {
      console.error(e);
      toast({ title: t('chat.summary_error', language), variant: 'destructive' });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const cleanSummary = (text: string) =>
    text
      .replace(/\[SUGGESTIONS\][\s\S]*?\[\/SUGGESTIONS\]/g, '')
      .replace(/[*#`_~]/g, '')
      .trim();

  const downloadSummaryPdf = async () => {
    const { jsPDF } = await import('jspdf');
    const { renderJourneyPdf } = await import('@/pages/Journey');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    renderJourneyPdf(doc, {
      title: `${t('chat.summary_title', language)} — ${chatContext.religion ? t(`religion.${chatContext.religion}`, language) : 'Jornada'}`,
      content: cleanSummary(summaryText),
      created_at: new Date().toISOString(),
    });
    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`templo-sagrado-${dateStr}.pdf`);
  };

  const saveToMemory = async () => {
    if (!user) {
      toast({ title: 'Faça login para guardar na sua memória', variant: 'destructive' });
      return;
    }
    const cleaned = cleanSummary(summaryText);
    const today = new Date().toLocaleDateString('pt-BR');
    const { error } = await supabase.from('activity_history').insert({
      user_id: user.id,
      type: 'summary',
      title: `Resumo — ${today}`,
      content: cleaned,
      metadata: { religion: chatContext.religion, philosophy: chatContext.philosophy },
    });
    if (error) {
      toast({ title: 'Não foi possível guardar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: t('chat.saved_memory', language) });
  };

  const sendMessage = () => doSendMessage(chatInput);

  useImperativeHandle(ref, () => ({
    sendAutoMessage: (msg: string) => doSendMessage(msg),
  }));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size === 0) return;

        setIsTranscribing(true);
        try {
          const formData = new FormData();
          formData.append('audio', blob, `recording.${mimeType === 'audio/webm' ? 'webm' : 'mp4'}`);
          formData.append('language', language);

          const resp = await fetch(STT_URL, {
            method: 'POST',
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: formData,
          });

          if (!resp.ok) throw new Error('STT failed');
          const { text } = await resp.json();
          if (text) setChatInput(chatInput ? `${chatInput} ${text}` : text);
        } catch (e) {
          console.error(e);
          toast({ title: 'Erro na transcrição', variant: 'destructive' });
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setIsRecording(false);
        }
      }, 60000);
    } catch (e) {
      console.error(e);
      toast({ title: 'Erro ao acessar microfone', variant: 'destructive' });
    }
  }, [isRecording, language, toast, setChatInput]);

  const questions = [
    t(`rec.${chatContext.religion || 'default'}.1`, language),
    t(`rec.${chatContext.religion || 'default'}.2`, language),
    t(`rec.${chatContext.religion || 'default'}.3`, language),
  ];

  const inPreview = isPreviewEnvironment();
  const trialExpired = !inPreview && accessStatus === 'expired';
  const isBlocked = false; // Chat is unlimited for everyone

  const handleLgpdAccept = () => {
    localStorage.setItem('lgpd_accepted', 'true');
    setLgpdAccepted(true);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* LGPD consent gate */}
      <Dialog open={!lgpdAccepted} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm [&>button[class*='absolute']]:hidden overflow-y-auto max-h-[90vh]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{t('lgpd.title', language)}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed pt-2">
              {t('lgpd.desc', language)}
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs text-muted-foreground pt-2">
            {t('lgpd.checkbox', language)}{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
              {language === 'en' ? 'Privacy Policy' : language === 'es' ? 'Política de Privacidad' : 'Política de Privacidade'}
            </a>
          </p>
          <Button onClick={handleLgpdAccept} className="w-full mt-2">
            {language === 'en' ? 'Accept and continue' : language === 'es' ? 'Aceptar y continuar' : 'Aceitar e continuar'}
          </Button>
        </DialogContent>
      </Dialog>
      {/* Trial / expired banner */}
      <TrialBanner />
      {/* Exploration return banner: user came back from /learn after exploring a different faith */}
      {exploringFaith && (
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/8 border-b border-primary/20 animate-fade-in">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs text-foreground/85 flex-1 leading-snug">
            Você estava explorando <strong className="text-primary">{t(`religion.${exploringFaith}` as any, language) || exploringFaith}</strong> — quer adotar como sua fé?
          </p>
          <button
            onClick={adoptExploredFaith}
            className="text-xs font-semibold text-primary hover:underline shrink-0 px-2 py-1"
          >
            Adotar
          </button>
          <button
            onClick={() => setExploringFaith(null)}
            className="text-xs text-muted-foreground hover:text-foreground shrink-0 px-1 py-1"
            aria-label="Dispensar"
          >
            ✕
          </button>
        </div>
      )}
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 md:py-4 space-y-3 md:space-y-4 mobile-scroll">
        {/* Empty state — welcome + suggested questions */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-4 md:py-8 animate-fade-in">
            <div className="w-11 h-11 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2 md:mb-3 ring-1 ring-primary/20">
              <DivineIcon />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">
              Olá! Como posso te ajudar?
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-5 text-center max-w-[280px]">
              Escolha uma pergunta ou escreva a sua
            </p>

            {/* Privacy banner */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/30 mb-3 md:mb-5 max-w-[320px]">
              <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-snug">
                🔒 Suas conversas são privadas e não são compartilhadas com ninguém.
                {confessionalMode
                  ? ` ${t('chat.confessional_privacy', language)}`
                  : !memoryEnabled ? ` ${t('chat.privacy_no_memory', language)}` : ''}
              </p>
            </div>

            <div className="w-full max-w-md space-y-1.5 md:space-y-2 px-2">
              {questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setChatInput(q)}
                  className="block w-full text-left px-3 py-2.5 md:px-4 md:py-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-xs md:text-sm text-foreground/80"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            msg={msg}
            index={i}
            playingIndex={playingIndex}
            loadingAudio={loadingAudio}
            onNarrate={playNarration}
            onCopy={handleCopy}
            isLast={i === messages.length - 1 && !isLoading && !sessionClosed}
            onSuggestionClick={(text) => doSendMessage(text)}
            isVisitor={!user}
            onPremiumGate={() => navigate('/auth?next=/pricing')}
          />
        ))}
        
        {/* Typing indicator */}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-2 justify-start animate-fade-in">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center mt-auto ring-1 ring-primary/20">
              <DivineIcon />
            </div>
            <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3">
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom input area */}
      <div className="border-t border-border/40 bg-background flex-shrink-0">
        {/* Confessional mode indicator */}
        {confessionalMode && (
          <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-primary/10 border-b border-primary/20">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-medium text-primary">{t('chat.confessional_banner', language)}</span>
          </div>
        )}
        {/* Blocked state — upgrade banner */}
        {isBlocked ? (
          <div className="px-4 py-3 md:py-4 text-center space-y-2 md:space-y-3"
               style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}>
            <div className="flex items-center justify-center gap-2 text-primary">
              <Lock className="h-5 w-5" />
              <span className="text-sm font-semibold">
                {trialExpired ? 'Seu período grátis terminou' : 'Limite de mensagens atingido'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-[300px] mx-auto leading-relaxed">
              {trialExpired
                ? 'Assine o Templo Sagrado para continuar conversando com o mentor.'
                : 'Para continuar sua jornada de reflexão, faça o upgrade para o Templo Sagrado Pro.'}
            </p>
            <div className="flex gap-2 justify-center">
              {!user ? (
                <Link to="/auth">
                  <Button className="bg-primary text-primary-foreground h-11 px-6 text-sm">
                    Fazer login
                  </Button>
                </Link>
              ) : (
                <Link to="/pricing">
                  <Button className="bg-primary text-primary-foreground gap-1.5 h-11 px-6 text-sm">
                    <Sparkles className="h-4 w-4" />
                    Ver planos
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Visitor CTA banner */}
            {!user && messages.length > 0 && (
              <Link
                to="/auth?next=/pricing"
                className="flex items-center justify-center gap-2 px-3 py-2 bg-primary/5 border-b border-primary/15 text-xs text-primary hover:bg-primary/10 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>💾 Salvar sua jornada e desbloquear áudio + Mural</span>
              </Link>
            )}
            {/* Remaining messages banner */}
            <div className="flex items-center justify-between px-4 py-1">
              <span className="text-xs font-medium text-muted-foreground">
                ✨ Conversa livre
              </span>

              <div className="flex items-center gap-1.5">
                {!user && (
                  <Link to="/auth" className="text-xs text-primary hover:underline font-medium min-h-[44px] flex items-center">
                    Fazer login
                  </Link>
                )}


                {messages.length > 0 && (
                  <button
                    onClick={async () => {
                      if (user) {
                        await supabase.from('chat_messages').delete().eq('user_id', user.id);
                      }
                      stopAudio();
                      audioCacheRef.current.clear();
                      setMessages([]);
                      setSessionClosed(false);
                    }}
                    className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors min-h-[44px] flex items-center"
                    title={t('chat.clear', language)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* Confessional mode toggle */}
                    <DropdownMenuItem
                      onClick={() => {
                        setConfessionalMode(!confessionalMode);
                        if (!confessionalMode) {
                          // Entering confessional: clear current messages from view
                          setMessages([]);
                          stopAudio();
                          audioCacheRef.current.clear();
                        }
                      }}
                      className={confessionalMode ? "text-primary font-medium" : "text-muted-foreground"}
                    >
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      {confessionalMode ? t('chat.confessional_on', language) : t('chat.confessional_off', language)}
                    </DropdownMenuItem>
                    {/* Memory toggle */}
                    {user && !confessionalMode && (
                      <DropdownMenuItem
                        onClick={() => setMemoryEnabled(!memoryEnabled)}
                        className="text-muted-foreground"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        {memoryEnabled ? t('chat.memory_on', language) : t('chat.memory_off', language)}
                      </DropdownMenuItem>
                    )}
                    {/* Summary generation */}
                    {messages.length > 0 && (
                      <DropdownMenuItem
                        onClick={generateSummary}
                        disabled={isGeneratingSummary}
                        className="text-muted-foreground"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                    {isGeneratingSummary ? t('chat.summary_loading', language) : t('chat.high_priest_word', language)}
                      </DropdownMenuItem>
                    )}
                    {messages.length > 0 && (
                      <DropdownMenuItem
                        onClick={async () => {
                          if (user && !confessionalMode) {
                            await supabase.from('chat_messages').delete().eq('user_id', user.id);
                          }
                          stopAudio();
                          audioCacheRef.current.clear();
                          setMessages([]);
                          setSessionClosed(false);
                        }}
                        className="text-muted-foreground"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('chat.clear', language)}
                      </DropdownMenuItem>
                    )}
                    {user && !confessionalMode && (
                      <DropdownMenuItem
                        onClick={() => setShowClearAllDialog(true)}
                        className="text-destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {t('chat.clear_all', language)}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Session closed state */}
            {sessionClosed ? (
              <div className="px-4 py-3 text-center space-y-3"
                   style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}>
                <p className="text-sm text-muted-foreground">
                  {t('chat.session_closed', language)}
                </p>
                <div className="flex flex-col gap-2 items-center">
                  <Button
                    onClick={generateSummary}
                    disabled={isGeneratingSummary}
                    variant="outline"
                    className="gap-1.5"
                  >
                    <FileText className="h-4 w-4" />
                    {isGeneratingSummary ? t('chat.summary_loading', language) : t('chat.high_priest_word', language)}
                  </Button>
                  {!user ? (
                    <Link to="/auth">
                      <Button className="gap-1.5 bg-primary text-primary-foreground">
                        <LogIn className="h-4 w-4" />
                        {t('chat.login_to_continue', language)}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={() => {
                        setMessages([]);
                        setSessionClosed(false);
                        stopAudio();
                        audioCacheRef.current.clear();
                      }}
                      variant="ghost"
                      className="gap-1.5"
                    >
                      <Sparkles className="h-4 w-4" />
                      {t('chat.new_conversation', language)}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Free quota exhausted banner — soft */}
                {user && !inPreview && accessStatus !== 'subscriber' && accessStatus !== 'admin' && questionsRemaining <= 0 && (
                  <div className="mx-3 mb-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                      <p className="text-sm font-medium text-foreground">
                        Você usou suas 20 perguntas do mês
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Assine o plano Devoto para continuar conversando com o Mentor.
                    </p>
                    <Link
                      to="/pricing"
                      className="inline-block text-xs font-medium text-primary hover:underline"
                    >
                      Ver planos →
                    </Link>
                  </div>
                )}
                {/* Free quota indicator — always visible for free users */}
                {((user && !inPreview && accessStatus !== 'subscriber' && accessStatus !== 'admin' && questionsRemaining > 0) || (!user && guestQuestionsRemaining > 0)) && (
                  <div className="mx-3 mb-1 px-1 flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      <span className={cn(
                        "font-semibold",
                        (user ? questionsRemaining : guestQuestionsRemaining) <= 3 ? "text-amber-600" : "text-foreground/70"
                      )}>
                        {user ? questionsRemaining : guestQuestionsRemaining}/20
                      </span>{' '}
                      {(user ? questionsRemaining : guestQuestionsRemaining) === 1 ? 'mensagem restante este mês' : 'mensagens restantes este mês'}
                    </p>
                    {(user ? questionsRemaining : guestQuestionsRemaining) <= 5 && (
                      <Link to={user ? "/pricing" : "/auth?next=/pricing"} className="text-xs font-medium text-primary hover:underline whitespace-nowrap">
                        {user ? 'Assinar Devoto →' : 'Entrar →'}
                      </Link>
                    )}
                  </div>
                )}
                {/* Persistent action bar — Consolidate conversation always visible */}
                {messages.length > 0 && !sessionClosed && (
                  <div className="flex items-center gap-2 mx-3 mb-1.5 px-2 py-1 rounded-lg border border-border/50 bg-muted/30">
                    <Button
                      onClick={generateSummary}
                      disabled={isGeneratingSummary}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1.5 text-foreground/80 hover:text-primary hover:bg-primary/5 px-2"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {isGeneratingSummary ? 'Consolidando...' : 'Consolidar conversa'}
                    </Button>
                    <span className="text-[10px] text-muted-foreground ml-auto hidden sm:inline">
                      Resumo • PDF • Copiar
                    </span>
                  </div>
                )}
                {/* Input row */}
                <div className="flex items-end gap-2 px-3 pb-2 md:pb-3 pt-1"
                     style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))' }}>
                  <Textarea
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      user && !inPreview && accessStatus !== 'subscriber' && accessStatus !== 'admin' && questionsRemaining <= 0
                        ? 'Limite mensal atingido — assine para continuar'
                        : !user && guestQuestionsRemaining <= 0
                          ? 'Limite grátis atingido — entre para continuar'
                        : 'Sua mensagem...'
                    }
                    disabled={(!!user && !inPreview && accessStatus !== 'subscriber' && accessStatus !== 'admin' && questionsRemaining <= 0) || (!user && guestQuestionsRemaining <= 0)}
                    className="min-h-[44px] max-h-[100px] resize-none text-base rounded-2xl bg-background border-border shadow-[0_0_10px_rgba(0,0,0,0.05)] focus-visible:ring-primary/30 disabled:opacity-50"
                    rows={1}
                  />
                  {user ? (
                    <Button
                      onClick={toggleRecording}
                      disabled={isTranscribing || (!inPreview && accessStatus !== 'subscriber' && accessStatus !== 'admin' && questionsRemaining <= 0)}
                      size="icon"
                      variant={isRecording ? "destructive" : "ghost"}
                      className={cn("shrink-0 h-10 w-10 rounded-full", isRecording && "animate-pulse")}
                    >
                      {isTranscribing ? <Loader2 className="h-5 w-5 animate-spin" /> : isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-muted-foreground" />}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate('/auth?next=/pricing')}
                      size="icon"
                      variant="ghost"
                      className="shrink-0 h-10 w-10 rounded-full"
                      title="Entrar para falar"
                    >
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  )}
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !chatInput.trim() || (!!user && !inPreview && accessStatus !== 'subscriber' && accessStatus !== 'admin' && questionsRemaining <= 0) || (!user && guestQuestionsRemaining <= 0)}
                    size="icon"
                    className="shrink-0 h-10 w-10 rounded-full bg-foreground text-background hover:bg-foreground/85 disabled:opacity-30"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Upgrade modal */}
      <Dialog open={showUpgradeModal && !inPreview} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Sparkles className="h-5 w-5 text-primary" />
              Templo Sagrado Pro
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed pt-2">
              Continue sua jornada de reflexão e receba orientações ilimitadas, versículos diários exclusivos e acesso a todas as funcionalidades.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-start gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Mensagens ilimitadas com o Divino</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Versículo do Dia exclusivo</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Publicar no Mural Sagrado</span>
            </div>
          </div>
          <Link to="/pricing" onClick={() => setShowUpgradeModal(false)}>
            <Button className="w-full bg-primary text-primary-foreground gap-1.5">
              <Sparkles className="h-4 w-4" />
              Ver planos a partir de R$19,90/mês
            </Button>
          </Link>
        </DialogContent>
      </Dialog>

      {/* Clear all dialog */}
      <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('chat.clear_all_title', language)}</AlertDialogTitle>
            <AlertDialogDescription>{t('chat.clear_all_desc', language)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('panel.keep', language)}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                await Promise.all([
                  supabase.from('chat_messages').delete().eq('user_id', user!.id),
                  supabase.from('activity_history').delete().eq('user_id', user!.id),
                  supabase.from('user_memory').delete().eq('user_id', user!.id),
                ]);
                stopAudio();
                audioCacheRef.current.clear();
                setMessages([]);
                setShowClearAllDialog(false);
                toast({ title: t('chat.clear_all_done', language) });
              }}
            >
              {t('chat.clear_all', language)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Summary dialog */}
      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {t('chat.high_priest_word', language)}
            </DialogTitle>
            <DialogDescription>{t('chat.summary_desc', language)}</DialogDescription>
          </DialogHeader>
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
            {cleanSummary(summaryText)}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => {
                navigator.clipboard.writeText(cleanSummary(summaryText));
                toast({ title: t('chat.summary_copied', language) });
              }}
            >
              <Copy className="h-4 w-4" />
              {t('chat.summary_copy', language)}
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={downloadSummaryPdf}
            >
              <Download className="h-4 w-4" />
              {t('chat.summary_pdf', language)}
            </Button>
            <Button
              className="flex-1 gap-1.5"
              onClick={saveToMemory}
            >
              <Brain className="h-4 w-4" />
              {t('chat.save_memory', language)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

ChatArea.displayName = 'ChatArea';
export default ChatArea;
