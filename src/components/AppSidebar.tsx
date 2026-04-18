import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, BookOpen, ScrollText, Shield, GraduationCap, Brain } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
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
      className={cn("hidden md:flex border-r border-primary/10 transition-all duration-300 shrink-0", collapsed ? "w-14" : "w-52")}
      collapsible="icon"
    >
      <SidebarContent className="flex flex-col pt-24 h-full">
        <SidebarGroup>
          <SidebarGroupContent>
            <TooltipProvider delayDuration={0}>
              <SidebarMenu className="space-y-2">
                {allItems.map(item => {
                  const active = location.pathname === item.to;
                  const label = item.labelKey === 'Admin' ? 'Admin' : t(item.labelKey, language);
                  const linkEl = (
                    <Link
                      to={item.to}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                        active
                          ? "bg-primary/15 text-primary font-semibold sacred-glow"
                          : "text-foreground/60 hover:text-primary hover:bg-primary/5"
                      )}
                    >
                      <item.icon className={cn("shrink-0 h-6 w-6", active && "drop-shadow-[0_0_6px_hsl(38_80%_55%_/_0.5)]")} />
                      {!collapsed && <span className="text-base font-medium">{label}</span>}
                    </Link>
                  );
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={active}>
                        {collapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {linkEl}
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              {label}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          linkEl
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
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