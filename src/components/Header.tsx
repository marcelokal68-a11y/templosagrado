import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { LogIn, LogOut, Gem, ArrowLeft, Menu, User, BookOpen, X, ScrollText, Gift, GraduationCap, MessageCircle, Brain } from 'lucide-react';
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

  const getBackPath = () => '/';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/landing');
  };

  // Drawer items for logged-in users
  const loggedInItems = [
    { label: t('nav.chat', language), icon: MessageCircle, action: () => navigate('/') },
    { label: 'Meu Perfil', icon: User, action: () => navigate('/profile') },
    { label: t('nav.learn', language), icon: GraduationCap, action: () => navigate('/learn') },
    { label: t('nav.verse', language), icon: BookOpen, action: () => navigate('/verse') },
    { label: 'Mural', icon: ScrollText, action: () => navigate('/mural') },
    { label: t('nav.journey', language), icon: Brain, action: () => navigate('/journey') },
    { label: 'Convidar Amigos', icon: Gift, action: () => navigate('/invite-friends') },
    ...(!isSubscriber ? [{ label: 'Plano Pro ⭐', icon: Gem, action: () => navigate('/pricing') }] : []),
  ];

  // Drawer items for visitors (not logged in) — show all features; gating happens at route
  const visitorItems = [
    { label: t('nav.chat', language), icon: MessageCircle, action: () => navigate('/') },
    { label: 'Entrar', icon: LogIn, action: () => navigate('/auth') },
    { label: t('nav.learn', language), icon: GraduationCap, action: () => navigate('/learn') },
    { label: t('nav.verse', language), icon: BookOpen, action: () => navigate('/verse') },
    { label: 'Mural', icon: ScrollText, action: () => navigate('/mural') },
    { label: t('nav.journey', language), icon: Brain, action: () => navigate('/journey') },
    { label: 'Ver Planos', icon: Gem, action: () => navigate('/pricing') },
  ];

  const drawerItems = user ? loggedInItems : visitorItems;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 safe-top border-b border-border/40 bg-background/95 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-3">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Always show hamburger on non-hidden paths */}
          {!shouldHideNav ? (
            isSubpage ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 text-primary hover:bg-primary/10"
                onClick={() => navigate(getBackPath())}
              >
                <ArrowLeft className="h-7 w-7" />
              </Button>
            ) : (
              <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 text-foreground/70 hover:text-primary hover:bg-primary/10"
                  >
                    <Menu className="h-7 w-7" />
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
                        className={cn(
                          "flex items-center gap-3 px-5 py-4 text-foreground/80 hover:bg-primary/8 hover:text-primary transition-colors text-left",
                          item.label.includes('Pro') && "text-primary font-semibold"
                        )}
                      >
                        <item.icon className={cn("h-6 w-6", item.label.includes('Pro') ? "text-primary" : "text-primary/70")} />
                        <span className="text-base font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>

                  {/* Drawer footer */}
                  {user && (
                    <div className="absolute bottom-0 left-0 right-0 border-t border-border/30 p-4">
                      <button
                        onClick={() => {
                          handleLogout();
                          setDrawerOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-2 py-2.5 text-destructive/80 hover:text-destructive transition-colors"
                      >
                        <LogOut className="h-6 w-6" />
                        <span className="text-base font-medium">{t('nav.logout', language)}</span>
                      </button>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        {user.email}
                      </p>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            )
          ) : null}

          {/* Logo */}
          <Link to={user ? "/" : "/landing"} className="flex items-center gap-1.5">
            <img src={temploLogo} alt="Templo Sagrado" className="h-9 md:h-10" />
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          {user ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
              onClick={() => setDrawerOpen(true)}
            >
              <User className="h-6 w-6" />
            </Button>
          ) : !shouldHideNav ? (
            <Link to="/auth">
              <Button className="gap-1.5 h-11 px-5 text-base sacred-gradient text-primary-foreground border-0">
                <LogIn className="h-4 w-4" />
                {t('nav.login', language)}
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}