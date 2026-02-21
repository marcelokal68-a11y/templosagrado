import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { t, Language, languageNames } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { LogIn, LogOut, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

export default function Header() {
  const { language, setLanguage, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleSidebar, state } = useSidebar();

  // Hide sidebar toggle on landing/auth/invite pages
  const hiddenPaths = ['/landing', '/auth', '/invite'];
  const showSidebarToggle = user && !hiddenPaths.some(p => location.pathname.startsWith(p));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/landing');
  };

  return (
    <header className="sticky top-0 z-50 border-b glass-strong safe-top">
      <div className="flex h-12 md:h-14 items-center justify-between px-3 md:px-4">
        <div className="flex items-center gap-2">
          {showSidebarToggle && (
            <Button variant="ghost" size="icon" className="hidden md:flex h-8 w-8" onClick={toggleSidebar}>
              {state === 'collapsed' ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          )}
          <Link to={user ? "/" : "/landing"} className="flex items-center gap-1.5">
            <span className="text-xl md:text-2xl">🕉️</span>
            <span className="font-display text-base md:text-lg font-semibold text-primary leading-tight">
              {t('chat.title', language)}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
            <SelectTrigger className="w-[100px] md:w-[120px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(languageNames) as Language[]).map(lang => (
                <SelectItem key={lang} value={lang}>{languageNames[lang]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 h-8">
                <LogOut className="h-3.5 w-3.5" />
                {t('nav.logout', language)}
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="gap-1.5 h-8">
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
