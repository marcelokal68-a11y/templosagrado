import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { HelpCircle, SlidersHorizontal, MessageCircle, Heart, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const steps = [
  { step: 1, icon: SlidersHorizontal, titleKey: 'landing.step1_title', descKey: 'landing.step1_desc' },
  { step: 2, icon: MessageCircle, titleKey: 'landing.step2_title', descKey: 'landing.step2_desc' },
  { step: 3, icon: Heart, titleKey: 'landing.step3_title', descKey: 'landing.step3_desc' },
  { step: 4, icon: CheckSquare, titleKey: 'landing.step4_title', descKey: 'landing.step4_desc' },
];

export default function QuickTutorial() {
  const { language, user } = useApp();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 right-14 z-40 w-9 h-9 rounded-full bg-primary/15 text-primary hover:bg-primary/25 transition-colors flex items-center justify-center md:right-16"
        aria-label="Tutorial"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">{t('tutorial.quick_title', language)}</DialogTitle>
            <DialogDescription className="sr-only">Tutorial steps</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            {steps.map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{t(item.titleKey, language)}</h4>
                  <p className="text-xs text-muted-foreground">{t(item.descKey, language)}</p>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={() => setOpen(false)} className="w-full">
            {t('tutorial.got_it', language)}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
