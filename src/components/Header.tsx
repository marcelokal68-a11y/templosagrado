import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { LogIn, LogOut, Gem, ArrowLeft, Menu, User, Heart, BookOpen, Settings, History, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import temploLogo from '@/assets/templo-logo.png';

export default function Header() {
  const { language, user, isSubscriber } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hiddenPaths = ['/landing', '/auth', '/invite'];
  const shouldHideNav = hiddenPaths.some(p => location.pathname.startsWith(p));

  const isHome = location.pathname === '/';
  const isSubpage = user && !isHome && !shouldHideNav;

  const getBackPath = () => {
    if (location.pathname.startsWith('/learn/')) return '/learn';
    return '/';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/landing');
  };

  const drawerItems = [
    { label: 'Perfil', icon: User, action: () => {} },
    { label: t('nav.prayers', language), icon: Heart, action: () => navigate('/prayers') },
    { label: t('nav.verse', language), icon: BookOpen, action: () => navigate('/verse') },
    { label: t('nav.history', language) || 'Histórico', icon: History, action: () => {} },
    { label: 'Configurações', icon: Settings, action: () => {} },
    // Plano — only for non-subscribers
    ...(!isSubscriber ? [{ label: 'Plano', icon: Gem, action: () => navigate('/pricing') }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 safe-top border-b border-border/40 bg-background/95 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-3">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {user && !shouldHideNav ? (
            isSubpage ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-primary hover:bg-primary/10"
                onClick={() => navigate(getBackPath())}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            ) : (
              <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-foreground/70 hover:text-primary hover:bg-primary/10"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0 bg-background border-r border-border/40">
                  {/* Drawer header */}
                  <div className="flex items-center justify-between px-4 py-4 border-b border-border/30">
                    <div className="flex items-center gap-2">
                      <img src={temploLogo} alt="Templo Sagrado" className="h-8" />
                    </div>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </Button>
                    </SheetClose>
                  </div>

                  {/* Drawer items */}
                  <nav className="flex flex-col py-2">
                    {drawerItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          item.action();
                          setDrawerOpen(false);
                        }}
                        className="flex items-center gap-3 px-5 py-3.5 text-foreground/80 hover:bg-primary/8 hover:text-primary transition-colors text-left"
                      >
                        <item.icon className="h-5 w-5 text-primary/70" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>

                  {/* Drawer footer */}
                  <div className="absolute bottom-0 left-0 right-0 border-t border-border/30 p-4">
                    <button
                      onClick={() => {
                        handleLogout();
                        setDrawerOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-2 py-2.5 text-destructive/80 hover:text-destructive transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="text-sm font-medium">{t('nav.logout', language)}</span>
                    </button>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {user.email}
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
            )
          ) : null}

          {/* Logo */}
          <Link to={user ? "/" : "/landing"} className="flex items-center gap-1.5">
            <img src={temploLogo} alt="Templo Sagrado" className="h-7 md:h-8" />
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          {/* Profile icon (logged in) or Login button */}
          {user ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
              onClick={() => setDrawerOpen(true)}
            >
              <User className="h-4.5 w-4.5" />
            </Button>
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
