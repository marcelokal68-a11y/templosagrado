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

type NavItemProps = {
  to: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  collapsed: boolean;
  isJourney: boolean;
};

function NavItem({ to, label, Icon, active, collapsed, isJourney }: NavItemProps) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const [truncated, setTruncated] = useState(false);

  useLayoutEffect(() => {
    const el = labelRef.current;
    if (!el || collapsed) { setTruncated(false); return; }
    const measure = () => setTruncated(el.scrollWidth > el.clientWidth + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [label, collapsed]);

  const link = (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all min-w-0",
        active
          ? "bg-primary/15 text-primary font-semibold sacred-glow"
          : "text-foreground/60 hover:text-primary hover:bg-primary/5"
      )}
    >
      <Icon className={cn("shrink-0 h-6 w-6", active && "drop-shadow-[0_0_6px_hsl(38_80%_55%_/_0.5)]")} />
      {!collapsed && (
        <span className="text-base font-medium flex items-center gap-2 min-w-0 flex-1">
          <span ref={labelRef} className="whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
            {label}
          </span>
          {isJourney && (
            <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] leading-none uppercase tracking-wider font-bold bg-primary/15 text-primary border border-primary/30">
              Pro
            </span>
          )}
        </span>
      )}
    </Link>
  );

  const showTooltip = collapsed || truncated;
  if (!showTooltip) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">
        {label}{isJourney ? ' (Pro)' : ''}
      </TooltipContent>
    </Tooltip>
  );
}