import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Volume2, VolumeX, Trash2, Gauge } from 'lucide-react';
import ReligionIcon from '@/components/ReligionIcon';
import ChatHistory from '@/components/ChatHistory';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sacred-chat`;
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-2">
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

function MessageBubble({ msg, index, playingIndex, loadingAudio, onNarrate, religion }: {
  msg: Msg; index: number; playingIndex: number | null; loadingAudio: number | null; onNarrate: (text: string, index: number) => void; religion: string;
}) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
          <ReligionIcon religion={religion} />
        </div>
      )}
      <div className="flex flex-col gap-1 max-w-[80%]">
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card border border-border rounded-bl-md shadow-sm"
        )}>
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>
        {!isUser && msg.content.length > 0 && (
          <button
            onClick={() => onNarrate(msg.content, index)}
            disabled={loadingAudio === index}
            className={cn(
              "self-start flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl border transition-all",
              playingIndex === index
                ? "text-primary bg-primary/15 border-primary/30 shadow-sm"
                : loadingAudio === index
                  ? "text-muted-foreground bg-muted/50 border-border"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 border-border"
            )}
          >
            {loadingAudio === index ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : playingIndex === index ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
            <span>{loadingAudio === index ? 'Carregando...' : playingIndex === index ? 'Parar' : '🔊 Ouvir'}</span>
          </button>
        )}
      </div>
      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center mt-1">
          <span className="text-xs font-semibold text-secondary-foreground">Eu</span>
        </div>
      )}
    </div>
  );
}

const ChatArea = forwardRef<{ sendAutoMessage: (msg: string) => void }, {}>((_props, ref) => {
  const { language, user, chatContext, questionsRemaining, setQuestionsRemaining } = useApp();
  const religion = chatContext.religion || '';
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<number | null>(null);
  const [ttsSpeed, setTtsSpeed] = useState(1.15);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<number, string>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    supabase
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setMessages(data.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })));
        }
      });
  }, [user]);

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
      const audio = new Audio(cachedUrl);
      audioRef.current = audio;
      setPlayingIndex(index);
      audio.onended = () => setPlayingIndex(null);
      audio.onerror = () => setPlayingIndex(null);
      await audio.play();
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

  const navigate = useNavigate();

  const getAnonCount = () => parseInt(localStorage.getItem('anon_chat_count') || '0', 10);
  const incrementAnonCount = () => {
    const count = getAnonCount() + 1;
    localStorage.setItem('anon_chat_count', count.toString());
    return count;
  };

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
    setInput('');
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
          messages: [...messages, userMsg],
          context: chatContext,
          language,
          userId: user?.id,
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
        };
        supabase.from('chat_messages').insert([
          { ...ctx, role: 'user', content: userMsg.content },
          { ...ctx, role: 'assistant', content: assistantSoFar },
        ]).then(() => {});
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

  const sendMessage = () => doSendMessage(input);

  useImperativeHandle(ref, () => ({
    sendAutoMessage: (msg: string) => doSendMessage(msg),
  }));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const questions = [
    t(`rec.${chatContext.religion || 'default'}.1`, language),
    t(`rec.${chatContext.religion || 'default'}.2`, language),
    t(`rec.${chatContext.religion || 'default'}.3`, language),
  ];

  return (
    <div className="flex flex-col h-full">
      {messages.length > 0 && (
        <div className="flex justify-between items-center gap-1 p-2 border-b border-border">
          <div className="flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={ttsSpeed}
              onChange={e => {
                setTtsSpeed(parseFloat(e.target.value));
                audioCacheRef.current.clear();
                stopAudio();
              }}
              className="text-xs bg-transparent border border-border rounded px-1.5 py-0.5 text-muted-foreground focus:outline-none"
            >
              <option value={0.8}>0.8×</option>
              <option value={0.9}>0.9×</option>
              <option value={1.0}>1.0×</option>
              <option value={1.15}>1.15×</option>
              <option value={1.2}>1.2×</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <ChatHistory />
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive gap-1.5"
              onClick={async () => {
                if (user) {
                  await supabase.from('chat_messages').delete().eq('user_id', user.id);
                }
                stopAudio();
                audioCacheRef.current.clear();
                setMessages([]);
              }}
            >
              <Trash2 className="h-4 w-4" />
              {t('chat.clear', language) || 'Limpar conversa'}
            </Button>
          </div>
        </div>
      )}
      {messages.length === 0 && (
        <div className="p-4 space-y-3 animate-fade-in">
          <h3 className="font-display text-sm font-semibold text-muted-foreground">{t('chat.recommended', language)}</h3>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="block w-full text-left px-4 py-3 rounded-lg border border-border bg-card hover:bg-primary/5 hover:border-primary/30 transition-all text-sm hover-scale"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            msg={msg}
            index={i}
            playingIndex={playingIndex}
            loadingAudio={loadingAudio}
            onNarrate={playNarration}
            religion={religion}
          />
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-3 justify-start animate-fade-in">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
              <ReligionIcon religion={religion} />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder', language)}
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon" className="shrink-0">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {user 
              ? `${questionsRemaining} ${t('chat.questions_remaining', language)}`
              : `${Math.max(0, 10 - getAnonCount())} ${t('chat.questions_remaining', language)} (sem login)`
            }
          </span>
          {!user && (
            <Link to="/auth" className="text-primary hover:underline font-medium">
              Fazer login
            </Link>
          )}
          {user && questionsRemaining <= 3 && (
            <Link to="/pricing" className="text-primary hover:underline font-medium">
              {t('chat.upgrade', language)}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
});

ChatArea.displayName = 'ChatArea';
export default ChatArea;
