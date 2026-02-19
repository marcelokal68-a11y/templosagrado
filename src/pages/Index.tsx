import ChatArea from '@/components/ChatArea';
import ContextPanel from '@/components/ContextPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { useState } from 'react';
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
  const { language } = useApp();

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0 pb-14 md:pb-0">
        <ChatArea />
      </div>

      {/* Mobile drawer trigger + drawer */}
      <div className="md:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-36 left-4 z-40 shadow-lg rounded-full h-10 w-10 bg-primary text-primary-foreground border-0"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="border-b border-border pb-3">
              <DrawerTitle className="font-display text-lg">{t('chat.subtitle', language)}</DrawerTitle>
            </DrawerHeader>
            <ScrollArea className="overflow-y-auto px-1 pb-6" style={{ maxHeight: 'calc(85vh - 60px)' }}>
              <ContextPanel />
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Context panel - desktop */}
      <div className="hidden md:block w-[320px] border-l border-border bg-card/50">
        <ScrollArea className="h-full">
          <div className="p-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold text-foreground">{t('chat.subtitle', language)}</h2>
          </div>
          <ContextPanel />
        </ScrollArea>
      </div>
    </div>
  );
}
