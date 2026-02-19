import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sacred-chat`;

export default function ChatArea() {
  const { language, user, chatContext, questionsRemaining, setQuestionsRemaining } = useApp();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (questionsRemaining <= 0) {
      toast({ title: t('chat.no_questions', language), description: t('chat.upgrade', language), variant: 'destructive' });
      return;
    }

    const userMsg: Msg = { role: 'user', content: input.trim() };
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
        toast({ title: 'Rate limit', description: 'Aguarde um momento antes de enviar outra pergunta.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast({ title: 'Créditos esgotados', description: 'Adicione créditos para continuar.', variant: 'destructive' });
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

      setQuestionsRemaining(Math.max(0, questionsRemaining - 1));
    } catch (e) {
      console.error(e);
      toast({ title: 'Erro', description: 'Não foi possível conectar ao sacerdote.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const recommendedQuestions: Record<string, string[]> = {
    christian: ['What does Jesus teach about forgiveness?', 'How can I strengthen my faith?', 'What does the Bible say about love?'],
    buddhist: ['What is the path to enlightenment?', 'How can I practice mindfulness?', 'What are the Four Noble Truths?'],
    islam: ['What does the Quran say about mercy?', 'How can I improve my prayers?', 'What is the meaning of Ramadan?'],
    jewish: ['What does the Torah teach about justice?', 'How can I observe Shabbat better?', 'What is the meaning of Tikkun Olam?'],
    hindu: ['What is Dharma?', 'How can I practice meditation?', 'What does the Bhagavad Gita teach?'],
    spiritist: ['What is the spirit world?', 'How does reincarnation work?', 'What did Allan Kardec teach?'],
    '': ['How can I find peace?', 'What is the meaning of life?', 'How do I connect with the divine?'],
  };

  const questions = recommendedQuestions[chatContext.religion] || recommendedQuestions[''];

  return (
    <div className="flex flex-col h-full">
      {/* Recommended questions */}
      {messages.length === 0 && (
        <div className="p-4 space-y-3">
          <h3 className="font-display text-sm font-semibold text-muted-foreground">{t('chat.recommended', language)}</h3>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <button
                key={i}
                onClick={() => { setInput(q); }}
                className="block w-full text-left px-4 py-3 rounded-lg border border-border bg-card hover:bg-primary/5 hover:border-primary/30 transition-all text-sm"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              msg.role === 'user'
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-card border border-border rounded-bl-md"
            )}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
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
          <span>{questionsRemaining} {t('chat.questions_remaining', language)}</span>
          {questionsRemaining <= 3 && (
            <Link to="/pricing" className="text-primary hover:underline font-medium">
              {t('chat.upgrade', language)}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
