import ChatArea from '@/components/ChatArea';
import ContextPanel from '@/components/ContextPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { useRef } from 'react';

export default function Index() {
  const { language, chatContext } = useApp();
  const chatRef = useRef<{ sendAutoMessage: (msg: string) => void }>(null);

  const handleGenerate = () => {
    const parts: string[] = [];
    if (chatContext.religion) parts.push(t(`religion.${chatContext.religion}`, language));
    if (chatContext.mood) parts.push(t(`mood.${chatContext.mood}`, language).toLowerCase());
    if (chatContext.need) parts.push(t(`need.${chatContext.need}`, language).toLowerCase());
    if (chatContext.topic) parts.push(t(`topic.${chatContext.topic}`, language).toLowerCase());
    const philLabel = chatContext.philosophy ? t(`philosophy.${chatContext.philosophy}`, language) : '';

    const langMap: Record<string, string> = {
      'pt-BR': `Me dê orientação como ${parts[0] || 'fiel'}${parts[1] ? `, estou me sentindo ${parts[1]}` : ''}${parts[2] ? `, preciso de ${parts[2]}` : ''}${parts[3] ? ` sobre ${parts[3]}` : ''}${philLabel ? `, com a sabedoria do ${philLabel}` : ''}.`,
      'en': `Give me guidance as a ${parts[0] || 'faithful'}${parts[1] ? `, I'm feeling ${parts[1]}` : ''}${parts[2] ? `, I need ${parts[2]}` : ''}${parts[3] ? ` about ${parts[3]}` : ''}${philLabel ? `, with the wisdom of ${philLabel}` : ''}.`,
      'es': `Dame orientación como ${parts[0] || 'fiel'}${parts[1] ? `, me siento ${parts[1]}` : ''}${parts[2] ? `, necesito ${parts[2]}` : ''}${parts[3] ? ` sobre ${parts[3]}` : ''}${philLabel ? `, con la sabiduría del ${philLabel}` : ''}.`,
    };

    const msg = langMap[language] || langMap['pt-BR'];
    chatRef.current?.sendAutoMessage(msg);
  };

  return (
    <div className="flex flex-1 overflow-hidden h-[calc(100vh-3.5rem)]">
      {/* Mobile: chat takes full height, input always visible */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 md:hidden">
        <ChatArea ref={chatRef} />
      </div>

      {/* Desktop: chat + side panel */}
      <div className="hidden md:flex flex-1 min-w-0 h-full">
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <ChatArea ref={chatRef} />
        </div>
        <div className="w-[280px] lg:w-[320px] flex-shrink-0 border-l border-border bg-card/50 h-full">
          <ScrollArea className="h-full">
            <div className="p-4 border-b border-border">
              <h2 className="font-display text-lg font-semibold text-foreground">{t('chat.subtitle', language)}</h2>
            </div>
            <ContextPanel onGenerate={handleGenerate} />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
