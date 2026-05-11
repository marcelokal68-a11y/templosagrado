import ChatArea from '@/components/ChatArea';
import ContextPanel from '@/components/ContextPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { useRef, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Index() {
  const { language, chatContext, preferredReligion } = useApp();
  const chatRef = useRef<{ sendAutoMessage: (msg: string) => void }>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

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

  const activeKey = chatContext.religion || chatContext.philosophy || '';
  const activeLabel = activeKey
    ? t(`religion.${activeKey}` as any, language) || t(`philosophy.${activeKey}` as any, language) || activeKey
    : (language === 'en' ? 'Choose your tradition' : language === 'es' ? 'Elige tu tradición' : 'Escolha sua tradição');
  const isPreferred = !!preferredReligion && preferredReligion === activeKey;
  const sheetTitle = language === 'en' ? 'Your tradition' : language === 'es' ? 'Tu tradición' : 'Sua tradição';

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden flex-col md:flex-row">
      {/* Mobile: faith selector chip + chat */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 md:hidden">
        <div className="px-3 py-2 border-b border-border bg-background/80 backdrop-blur-sm">
          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-full border text-sm transition-colors",
                  activeKey
                    ? "border-primary/40 bg-primary/5 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                )}
                aria-label={sheetTitle}
              >
                <span className="flex items-center gap-2 min-w-0 truncate">
                  <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">
                    {isPreferred && <span className="text-primary mr-1">★</span>}
                    {activeLabel}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] p-0 overflow-hidden flex flex-col">
              <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
                <SheetTitle className="text-base font-semibold">{sheetTitle}</SheetTitle>
              </SheetHeader>
              <ScrollArea className="flex-1">
                <ContextPanel onGenerate={handleGenerate} onClose={() => setMobileSheetOpen(false)} />
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <ChatArea ref={chatRef} />
        </div>
      </div>

      {/* Desktop: chat + side panel — each column scrolls independently */}
      <div className="hidden md:flex flex-1 min-w-0 min-h-0 h-full">
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <ChatArea ref={chatRef} />
        </div>
        <div className="w-[280px] lg:w-[320px] flex-shrink-0 border-l border-border bg-card/50 min-h-0 overflow-hidden">
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
