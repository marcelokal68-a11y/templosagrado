import ChatArea from '@/components/ChatArea';
import ContextPanel from '@/components/ContextPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

export default function Index() {
  const { language, chatContext } = useApp();
  const chatRef = useRef<{ sendAutoMessage: (msg: string) => void }>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    setDrawerOpen(false);
  };

  return (
    <div className="flex flex-1 overflow-hidden h-[calc(100vh-3.5rem)]">
      <div className="flex-1 flex flex-col min-w-0 pb-[56px] md:pb-0">
        <ChatArea ref={chatRef} />
      </div>

      {/* Mobile settings drawer — accessible from header menu or this small trigger */}
      <div className="md:hidden">
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed bottom-[5rem] right-3 z-40 rounded-full h-10 w-10 bg-card border border-border/50 shadow-md text-muted-foreground hover:text-primary"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="border-b border-border pb-3">
              <DrawerTitle className="font-display text-lg">{t('chat.subtitle', language)}</DrawerTitle>
            </DrawerHeader>
            <ScrollArea className="overflow-y-auto px-1 pb-6" style={{ maxHeight: 'calc(85vh - 60px)' }}>
              <ContextPanel onGenerate={handleGenerate} onClose={() => setDrawerOpen(false)} />
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      </div>

      <div className="hidden md:block w-[280px] lg:w-[320px] flex-shrink-0 border-l border-border bg-card/50">
        <ScrollArea className="h-full">
          <div className="p-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold text-foreground">{t('chat.subtitle', language)}</h2>
          </div>
          <ContextPanel onGenerate={handleGenerate} />
        </ScrollArea>
      </div>
    </div>
  );
}
