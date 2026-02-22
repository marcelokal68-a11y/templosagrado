import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, GraduationCap, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type Msg = { role: 'user' | 'assistant'; content: string };

function parseSuggestions(text: string): { body: string; suggestions: string[] } {
  const idx = text.indexOf('---SUGGESTIONS---');
  if (idx === -1) return { body: text, suggestions: [] };
  const body = text.slice(0, idx).trim();
  const jsonPart = text.slice(idx + '---SUGGESTIONS---'.length).trim();
  try {
    const suggestions = JSON.parse(jsonPart);
    if (Array.isArray(suggestions)) return { body, suggestions: suggestions.slice(0, 3) };
  } catch { /* ignore */ }
  return { body, suggestions: [] };
}

export default function LearnTopic() {
  const { topic } = useParams<{ topic: string }>();
  const { language, user } = useApp();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialSent = useRef(false);

  const topicLabel = t(`religion.${topic}`, language) !== `religion.${topic}`
    ? t(`religion.${topic}`, language)
    : t(`philosophy.${topic}`, language) !== `philosophy.${topic}`
      ? t(`philosophy.${topic}`, language)
      : topic || '';

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || !topic) return;
    const userMsg: Msg = { role: 'user', content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setSuggestions([]);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/learn-chat`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
          topic,
          language,
        }),
      });

      if (!resp.ok || !resp.body) throw new Error('Stream failed');

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

      // Parse suggestions from final content
      const { body, suggestions: sug } = parseSuggestions(assistantSoFar);
      if (sug.length > 0) {
        setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: body } : m));
        setSuggestions(sug);
      }

      // Save to activity_history
      if (user) {
        supabase.from('activity_history').insert({
          user_id: user.id,
          type: 'learn',
          title: `${topicLabel}: ${text.slice(0, 80)}`,
          content: body || assistantSoFar,
          metadata: { topic, question: text } as any,
        }).then(() => {});
      }
    } catch (e) {
      console.error('learn-chat error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, topic, language, user, topicLabel]);

  // Auto-send intro message on mount
  useEffect(() => {
    if (!initialSent.current && topic) {
      initialSent.current = true;
      const introPrompts: Record<string, string> = {
        'pt-BR': `Conte-me uma breve história sobre ${topicLabel}. O que é, como surgiu e quais são seus princípios fundamentais?`,
        'en': `Tell me a brief history of ${topicLabel}. What is it, how did it originate, and what are its fundamental principles?`,
        'es': `Cuéntame una breve historia de ${topicLabel}. ¿Qué es, cómo surgió y cuáles son sus principios fundamentales?`,
      };
      sendMessage(introPrompts[language] || introPrompts['pt-BR']);
    }
  }, [topic, topicLabel, language, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-primary/10">
        <h1 className="text-lg font-bold text-primary flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          {topicLabel}
        </h1>
        <p className="text-xs text-muted-foreground">{t('learn.professor_mode', language)}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className={cn(
              'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-primary/10'
            )}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-2">
            <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <div className="bg-card border border-primary/10 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        {/* Clickable suggestions */}
        {suggestions.length > 0 && !isLoading && (
          <div className="flex flex-col gap-2 pl-10">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="text-left text-sm px-4 py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/15 transition-colors text-foreground/80 hover:text-foreground"
              >
                💡 {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-primary/10 safe-bottom">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('learn.ask_placeholder', language)}
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0 h-11 w-11"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
