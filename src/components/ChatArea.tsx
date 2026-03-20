import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Loader2, Volume2, VolumeX, Mic, MicOff, MoreVertical, Trash2, XCircle, Copy, Sparkles, Lock } from 'lucide-react';
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

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sacred-chat`;
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;
const STT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-stt`;

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

function MessageBubble({ msg, index, playingIndex, loadingAudio, onNarrate, onCopy }: {
  msg: Msg; index: number; playingIndex: number | null; loadingAudio: number | null; 
  onNarrate: (text: string, index: number) => void; onCopy: (text: string) => void;
}) {
  const isUser = msg.role === 'user';
  
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
          "rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card border border-border/50 text-foreground rounded-bl-sm"
        )}>
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>
        
        {/* Action row for assistant messages — compact, below bubble */}
        {!isUser && msg.content.length > 0 && (
          <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
               style={{ opacity: 1 }}>
            <button
              onClick={() => onNarrate(msg.content, index)}
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
            <button
              onClick={() => onCopy(msg.content)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Copiar"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <PublishToMural originalContent={msg.content} />
          </div>
        )}
      </div>
    </div>
  );
}

const ChatArea = forwardRef<{ sendAutoMessage: (msg: string) => void }, {}>((_props, ref) => {
  const { language, user, chatContext, questionsRemaining, setQuestionsRemaining, messages, setMessages, chatInput, setChatInput, hasPendingUndo, undoClearChat, geo } = useApp();
  const religion = chatContext.religion || '';
  const [isLoading, setIsLoading] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<number | null>(null);
  const [ttsSpeed, setTtsSpeed] = useState(1.15);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<number, string>>(new Map());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const prevAffiliationRef = useRef<string>('');
  const navigate = useNavigate();

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

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
    if (!user) {
      setMessages([]);
      stopAudio();
      audioCacheRef.current.forEach(url => URL.revokeObjectURL(url));
      audioCacheRef.current.clear();
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

  const preloadAudio = useCallback(async (text: string, index: number) => {
    if (audioCacheRef.current.has(index)) return;
    try {
      const resp = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text, speed: ttsSpeed }),
      });
      if (!resp.ok) return;
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      audioCacheRef.current.set(index, url);
    } catch { /* silent preload failure */ }
  }, []);

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
      const resp = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text, speed: ttsSpeed }),
      });
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
  }, [playingIndex, stopAudio, language, toast]);

  const getAnonCount = () => parseInt(localStorage.getItem('anon_chat_count') || '0', 10);
  const incrementAnonCount = () => {
    const count = getAnonCount() + 1;
    localStorage.setItem('anon_chat_count', count.toString());
    return count;
  };

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!' });
  }, [toast]);

  const doSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    if (!user) {
      const anonUsed = getAnonCount();
      if (anonUsed >= 10) {
        toast({ title: 'Limite atingido', description: 'Faça login para continuar conversando.', variant: 'destructive' });
        navigate('/auth');
        return;
      }
    }

    if (user && questionsRemaining <= 0) {
      toast({ title: t('chat.no_questions', language), description: t('chat.upgrade', language), variant: 'destructive' });
      return;
    }

    const userMsg: Msg = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].slice(-40),
          context: chatContext,
          language,
          userId: user?.id,
          datetime: new Date().toISOString(),
          timezone,
          geo,
        }),
      });

      if (resp.status === 429) {
        toast({ title: t('chat.rate_limit', language), description: t('chat.rate_limit_desc', language), variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast({ title: t('chat.credits_out', language), description: t('chat.credits_out_desc', language), variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error('Failed to start stream');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
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
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      if (user) {
        setQuestionsRemaining(Math.max(0, questionsRemaining - 1));
      } else {
        incrementAnonCount();
      }

      if (user && assistantSoFar.length > 0) {
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
    } catch (e) {
      console.error(e);
      toast({ title: t('chat.error', language), description: t('chat.error_desc', language), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
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

  const remainingCount = user ? questionsRemaining : Math.max(0, 10 - getAnonCount());
  const isBlocked = remainingCount <= 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-4 mobile-scroll">
        {/* Empty state — welcome + suggested questions */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-8 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-1 ring-primary/20">
              <DivineIcon />
            </div>
            <h3 className="text-base font-medium text-foreground mb-1">
              {t('chat.title', language)}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-[280px]">
              {t('chat.recommended', language)}
            </p>
            <div className="w-full max-w-md space-y-2 px-2">
              {questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setChatInput(q)}
                  className="block w-full text-left px-4 py-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-sm text-foreground/80"
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
      <div className="border-t border-border/40 bg-background">
        {/* Blocked state — upgrade banner */}
        {isBlocked ? (
          <div className="px-4 py-4 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Lock className="h-5 w-5" />
              <span className="text-sm font-semibold">Limite de mensagens atingido</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-[300px] mx-auto leading-relaxed">
              Para continuar sua jornada de reflexão e receber orientações ilimitadas, faça o upgrade para o Templo Sagrado Pro.
            </p>
            <div className="flex gap-2 justify-center">
              {!user ? (
                <Link to="/auth">
                  <Button size="sm" className="bg-primary text-primary-foreground">
                    Fazer login
                  </Button>
                </Link>
              ) : (
                <Link to="/pricing">
                  <Button size="sm" className="bg-primary text-primary-foreground gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Upgrade Pro
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Remaining messages banner */}
            <div className="flex items-center justify-between px-4 py-1">
              <span className={cn(
                "text-[11px] font-medium",
                remainingCount > 5 ? "text-muted-foreground" : remainingCount > 2 ? "text-amber-600" : "text-destructive animate-pulse"
              )}>
                {remainingCount} {t('chat.questions_remaining', language)}
              </span>
              <div className="flex items-center gap-1">
                {!user && (
                  <Link to="/auth" className="text-[11px] text-primary hover:underline font-medium">
                    Fazer login
                  </Link>
                )}
                {user && questionsRemaining <= 3 && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    {t('chat.upgrade', language)}
                  </button>
                )}
                {messages.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={async () => {
                          if (user) {
                            await supabase.from('chat_messages').delete().eq('user_id', user.id);
                          }
                          stopAudio();
                          audioCacheRef.current.clear();
                          setMessages([]);
                        }}
                        className="text-muted-foreground"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('chat.clear', language)}
                      </DropdownMenuItem>
                      {user && (
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
                )}
              </div>
            </div>

            {/* Input row */}
            <div className="flex items-end gap-2 px-3 pb-3 pt-1">
              <Textarea
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.placeholder', language)}
                className="min-h-[44px] max-h-[100px] resize-none text-base rounded-2xl bg-card border-border/50 focus-visible:ring-primary/30"
                rows={1}
              />
              <Button
                onClick={toggleRecording}
                disabled={isTranscribing}
                size="icon"
                variant={isRecording ? "destructive" : "ghost"}
                className={cn("shrink-0 h-10 w-10 rounded-full", isRecording && "animate-pulse")}
              >
                {isTranscribing ? <Loader2 className="h-5 w-5 animate-spin" /> : isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-muted-foreground" />}
              </Button>
              <Button
                onClick={sendMessage}
                disabled={isLoading || !chatInput.trim()}
                size="icon"
                className="shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Upgrade modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
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
    </div>
  );
});

ChatArea.displayName = 'ChatArea';
export default ChatArea;
