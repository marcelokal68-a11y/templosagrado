import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, DollarSign, Heart, BookOpen, CheckSquare, Feather, ScrollText } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const items = [
  { to: '/', icon: MessageCircle, labelKey: 'nav.chat' },
  { to: '/pricing', icon: DollarSign, labelKey: 'nav.pricing' },
  { to: '/posts', icon: Feather, labelKey: 'nav.posts' },
  { to: '/prayers', icon: Heart, labelKey: 'nav.prayers' },
  { to: '/verse', icon: BookOpen, labelKey: 'nav.verse' },
  { to: '/practice', icon: CheckSquare, labelKey: 'nav.practice' },
  { to: '/mural', icon: ScrollText, labelKey: 'nav.mural' },
] as const;

export default function BottomNav() {
  const { pathname } = useLocation();
  const { language, user } = useApp();

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t glass-strong">
      <div className="flex items-center justify-around h-14">
        {items.map(({ to, icon: Icon, labelKey }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-300",
                active ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary animate-scale-in" />
              )}
              <Icon className={cn("h-5 w-5 transition-transform duration-300", active && "animate-scale-in")} />
              <span className={cn("text-[10px] font-medium leading-none transition-all duration-300", active && "font-semibold")}>{t(labelKey, language)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
