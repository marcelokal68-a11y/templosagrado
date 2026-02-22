import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { t, Language, languageNames } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { LogIn, LogOut, PanelLeftClose, PanelLeft, Gem } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

export default function Header() {
  const { language, setLanguage, user, isSubscriber } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleSidebar, state } = useSidebar();

  const hiddenPaths = ['/landing', '/auth', '/invite'];
  const showSidebarToggle = user && !hiddenPaths.some(p => location.pathname.startsWith(p));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/landing');
  };

  return (
    <header className="sticky top-0 z-50 glass-strong safe-top border-b border-primary/10">
      <div className="flex h-12 md:h-14 items-center justify-between px-3 md:px-4">
        <div className="flex items-center gap-2">
          {showSidebarToggle && (
            <Button variant="ghost" size="icon" className="hidden md:flex h-8 w-8 text-foreground/70 hover:text-primary" onClick={toggleSidebar}>
              {state === 'collapsed' ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          )}
          <Link to={user ? "/" : "/landing"} className="flex items-center gap-1.5">
            <span className="text-xl md:text-2xl">🕉️</span>
            <span className="font-display text-base md:text-lg font-semibold text-gradient-sacred leading-tight">
              {t('chat.title', language)}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
            <SelectTrigger className="w-[100px] md:w-[120px] h-8 text-xs border-primary/20 bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(languageNames) as Language[]).map(lang => (
                <SelectItem key={lang} value={lang}>{languageNames[lang]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {user && !isSubscriber && (
            <Link to="/pricing">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary animate-pulse hover:animate-none">
                <Gem className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 h-8 border-primary/20 hover:border-primary/40">
                <LogOut className="h-3.5 w-3.5" />
                {t('nav.logout', language)}
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="gap-1.5 h-8 sacred-gradient text-primary-foreground border-0">
                <LogIn className="h-3.5 w-3.5" />
                {t('nav.login', language)}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
