import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { t, Language, languageNames } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, DollarSign, Heart, BookOpen, CheckSquare, LogIn, LogOut, Menu, X, Shield, Feather } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const { language, setLanguage, user } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await supabase.functions.invoke('admin', {
        body: { action: 'check-role' },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      setIsAdmin(resp.data?.isAdmin ?? false);
    })();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/landing');
  };

  const navItems = [
    { to: '/', label: t('nav.chat', language), icon: MessageCircle },
    { to: '/pricing', label: t('nav.pricing', language), icon: DollarSign },
    { to: '/posts', label: t('nav.posts', language), icon: Feather },
    { to: '/prayers', label: t('nav.prayers', language), icon: Heart },
    { to: '/verse', label: t('nav.verse', language), icon: BookOpen },
    { to: '/practice', label: t('nav.practice', language), icon: CheckSquare },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🕉️</span>
          <span className="font-display text-xl font-semibold text-primary">
            {t('chat.title', language)}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Link key={item.to} to={item.to}>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
            <SelectTrigger className="w-[120px] h-9 text-xs">
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
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
                <LogOut className="h-4 w-4" />
                {t('nav.logout', language)}
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="hidden md:flex gap-1.5">
                <LogIn className="h-4 w-4" />
                {t('nav.login', language)}
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile menu - login/logout only */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-2">
          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
          {user ? (
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => { handleLogout(); setMobileOpen(false); }}>
              <LogOut className="h-4 w-4" />
              {t('nav.logout', language)}
            </Button>
          ) : (
            <Link to="/auth" onClick={() => setMobileOpen(false)}>
              <Button className="w-full justify-start gap-2">
                <LogIn className="h-4 w-4" />
                {t('nav.login', language)}
              </Button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
