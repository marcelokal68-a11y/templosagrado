import ChatArea from '@/components/ChatArea';
import ContextPanel from '@/components/ContextPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';

export default function Index() {
  const { language } = useApp();
  const [showPanel, setShowPanel] = useState(false);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0 pb-14 md:pb-0">
        <ChatArea />
      </div>

      {/* Mobile toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-28 right-4 z-40 md:hidden shadow-lg rounded-full h-12 w-12 bg-primary text-primary-foreground border-0"
        onClick={() => setShowPanel(!showPanel)}
      >
        {showPanel ? <X className="h-5 w-5" /> : <SlidersHorizontal className="h-5 w-5" />}
      </Button>

      {/* Context panel - desktop */}
      <div className="hidden md:block w-[320px] border-l border-border bg-card/50">
        <ScrollArea className="h-full">
          <div className="p-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold text-foreground">{t('chat.subtitle', language)}</h2>
          </div>
          <ContextPanel />
        </ScrollArea>
      </div>

      {/* Context panel - mobile overlay */}
      {showPanel && (
        <div className="fixed inset-0 z-30 md:hidden bg-background/80 backdrop-blur-sm" onClick={() => setShowPanel(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-[300px] bg-card border-l border-border shadow-xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">{t('chat.subtitle', language)}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowPanel(false)}><X className="h-4 w-4" /></Button>
            </div>
            <ContextPanel />
          </div>
        </div>
      )}
    </div>
  );
}
