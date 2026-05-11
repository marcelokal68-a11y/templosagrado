import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, BookOpen, ScrollText, Shield, GraduationCap, Brain } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  { to: '/', labelKey: 'nav.chat', icon: MessageCircle },
  { to: '/learn', labelKey: 'nav.learn', icon: GraduationCap },
  { to: '/verse', labelKey: 'nav.verse', icon: BookOpen },
  { to: '/mural', labelKey: 'nav.mural', icon: ScrollText },
  { to: '/journey', labelKey: 'nav.journey', icon: Brain },
];

export default function AppSidebar() {
  const { language, user } = useApp();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  const hiddenPaths = ['/landing', '/auth', '/invite'];
  const shouldHide = hiddenPaths.some(p => location.pathname.startsWith(p));
  
  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) { setIsAdmin(false); return; }
        const resp = await supabase.functions.invoke('admin', {
          body: { action: 'check-role' },
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        setIsAdmin(resp.data?.isAdmin ?? false);
      } catch {
        setIsAdmin(false);
      }
    })();
  }, [user]);

  if (shouldHide) return null;

  const allItems = [
    ...navItems,
    ...(isAdmin ? [{ to: '/admin', labelKey: 'Admin' as const, icon: Shield }] : []),
  ];

  return (
    <Sidebar
      className={cn("hidden md:flex border-r border-primary/10 transition-all duration-300 shrink-0", collapsed ? "w-14" : "w-60")}
      style={!collapsed ? { ['--sidebar-width' as any]: '15rem' } : undefined}
      collapsible="icon"
    >
      <SidebarContent className="flex flex-col pt-24 h-full">
        <SidebarGroup>
          <SidebarGroupContent>
            <TooltipProvider delayDuration={0}>
              <SidebarMenu className="space-y-2">
                {allItems.map((item, idx) => {
                  const active = location.pathname === item.to;
                  const label = item.labelKey === 'Admin' ? 'Admin' : t(item.labelKey, language);
                  const isAdminItem = item.labelKey === 'Admin';
                  const prevIsAdmin = idx > 0 && allItems[idx - 1].labelKey === 'Admin';
                  const showDivider = isAdminItem && !prevIsAdmin;
                  const isJourney = item.to === '/journey';
                  return (
                    <div key={item.to}>
                      {showDivider && (
                        <div className="my-3 px-4">
                          <div className="border-t border-primary/10" />
                          {!collapsed && (
                            <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                              {language === 'pt-BR' ? 'Restrito' : 'Restricted'}
                            </p>
                          )}
                        </div>
                      )}
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={active}>
                          <NavItem
                            to={item.to}
                            label={label}
                            Icon={item.icon}
                            active={active}
                            collapsed={collapsed}
                            isJourney={isJourney}
                          />
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </div>
                  );
                })}
              </SidebarMenu>
            </TooltipProvider>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}