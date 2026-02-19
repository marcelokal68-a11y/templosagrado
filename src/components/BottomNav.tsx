import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, DollarSign, Heart, BookOpen } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const items = [
  { to: '/', icon: MessageCircle, labelKey: 'nav.chat' },
  { to: '/pricing', icon: DollarSign, labelKey: 'nav.pricing' },
  { to: '/prayers', icon: Heart, labelKey: 'nav.prayers' },
  { to: '/verse', icon: BookOpen, labelKey: 'nav.verse' },
] as const;

export default function BottomNav() {
  const { pathname } = useLocation();
  const { language } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around h-14">
        {items.map(({ to, icon: Icon, labelKey }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">{t(labelKey, language)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
