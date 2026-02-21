import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, DollarSign, Heart, BookOpen, CheckSquare, Feather, ScrollText, Shield } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
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
  { to: '/pricing', labelKey: 'nav.pricing', icon: DollarSign },
  { to: '/posts', labelKey: 'nav.posts', icon: Feather },
  { to: '/prayers', labelKey: 'nav.prayers', icon: Heart },
  { to: '/verse', labelKey: 'nav.verse', icon: BookOpen },
  { to: '/practice', labelKey: 'nav.practice', icon: CheckSquare },
  { to: '/mural', labelKey: 'nav.mural', icon: ScrollText },
];

export default function AppSidebar() {
  const { language, user } = useApp();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
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

  const allItems = [
    ...navItems,
    ...(isAdmin ? [{ to: '/admin', labelKey: 'Admin' as const, icon: Shield }] : []),
  ];

  return (
    <Sidebar
      className={cn("hidden md:flex border-r transition-all duration-300", collapsed ? "w-14" : "w-48")}
      collapsible="icon"
    >
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {allItems.map(item => {
                const active = location.pathname === item.to;
                const label = item.labelKey === 'Admin' ? 'Admin' : t(item.labelKey, language);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.to} className={cn("flex items-center gap-2 px-3 py-2 rounded-md transition-colors", active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="text-sm truncate">{label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
