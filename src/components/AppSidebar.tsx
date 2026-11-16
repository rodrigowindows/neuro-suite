import {
  Rocket,
  Zap,
  BookOpen,
  Brain,
  Bell,
  Calculator,
  Shield,
  FileText,
  MessageSquare,
  Plug,
  BarChart,
  LogOut,
  Settings,
  UserCircle,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import neuroSuiteLogo from '@/assets/neurosuite-logo.jpg';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useI18n } from '@/i18n';

const employeeItems = [
  { titleKey: 'nav.item.cockpit', value: 'bridge-console', icon: Rocket },
  { titleKey: 'nav.item.countermeasures', value: 'neurocoach', icon: Zap },
  { titleKey: 'nav.item.flightLog', value: 'mission-log', icon: BookOpen },
];

const managerItems = [
  { titleKey: 'nav.item.aiInsights', value: 'ai-insights', icon: Brain },
  { titleKey: 'nav.item.commandAlerts', value: 'alerts', icon: Bell },
  { titleKey: 'nav.item.roi', value: 'roi', icon: Calculator },
  { titleKey: 'nav.item.missionSafety', value: 'nr1', icon: Shield },
  { titleKey: 'nav.item.aiReports', value: 'narrative-reports', icon: FileText },
  { titleKey: 'nav.item.missionSafetyChatbot', value: 'nr1-chatbot', icon: MessageSquare },
  { titleKey: 'nav.item.integrations', value: 'integrations', icon: Plug },
  { titleKey: 'nav.item.commandPanel', value: 'dashboard-rh', icon: BarChart },
];

interface FeatureScore {
  label: string;
  color: string;
}

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  gamificationDisabled?: boolean;
  scores?: Record<string, FeatureScore | null>;
  isManager?: boolean;
  isAdmin?: boolean;
}

export function AppSidebar({
  activeTab,
  onTabChange,
  isManager = false,
  isAdmin = false,
}: AppSidebarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const { t } = useI18n();
  const collapsed = state === 'collapsed';

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const isEmployeeItemActive = (value: string) => {
    if (value === 'bridge-console') return ['bridge-console', 'checkin', 'neuroscore'].includes(activeTab);
    if (value === 'neurocoach') return ['neurocoach', 'gamification', 'cognitive-fatigue'].includes(activeTab);
    if (value === 'mission-log') return activeTab === 'mission-log';
    return activeTab === value;
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0" aria-label={t('nav.aria.sidebar')}>
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2.5 px-1">
          <img
            src={neuroSuiteLogo}
            alt={t('nav.aria.logo')}
            className="h-8 w-8 rounded-md object-cover flex-shrink-0"
          />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-display font-bold text-sm text-sidebar-primary-foreground truncate">
                CrewVitals
              </span>
              <span className="text-[10px] text-sidebar-muted-foreground">
                Beta v1.0
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup aria-label={t('nav.group.cabinSystems')}>
          <SidebarGroupLabel className="text-sidebar-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
            {!collapsed ? t('nav.group.cabinSystems') : t('nav.group.cabin')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {employeeItems.map((item) => {
                const title = t(item.titleKey);
                return (
                  <SidebarMenuItem key={item.value} className="relative">
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.value)}
                      isActive={isEmployeeItemActive(item.value)}
                      tooltip={title}
                      aria-label={title}
                      className={`h-auto py-2 transition-all duration-200 ${
                        isEmployeeItemActive(item.value)
                          ? 'bg-sidebar-primary/15 text-sidebar-primary font-medium'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <span className="truncate text-xs font-medium leading-none flex-1 text-left">
                          {title}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isManager && (
          <>
            <Separator className="my-1 bg-sidebar-border" />

            <Collapsible defaultOpen={false} className="group/collapsible">
              <SidebarGroup aria-label={t('nav.group.command')}>
                <SidebarGroupLabel asChild className="text-sidebar-muted-foreground text-[10px] uppercase tracking-wider font-semibold cursor-pointer">
                  <CollapsibleTrigger
                    className="flex w-full items-center justify-between hover:text-sidebar-foreground"
                    aria-label={t('nav.group.commandToggle')}
                  >
                    <span>{t('nav.group.command')}</span>
                    {!collapsed && (
                      <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                    )}
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {managerItems.map((item) => {
                        const title = t(item.titleKey);
                        return (
                          <SidebarMenuItem key={item.value} className="relative">
                            <SidebarMenuButton
                              onClick={() => onTabChange(item.value)}
                              isActive={activeTab === item.value}
                              tooltip={title}
                              aria-label={title}
                              className={`transition-all duration-200 ${
                                activeTab === item.value
                                  ? 'bg-sidebar-primary/15 text-sidebar-primary font-medium'
                                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
                              }`}
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              {!collapsed && (
                                <span className="truncate flex-1 text-xs">{title}</span>
                              )}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2 space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          aria-label={t('nav.footer.profile')}
          className="w-full justify-start gap-2 text-sidebar-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
        >
          <UserCircle className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>{t('nav.footer.profile')}</span>}
        </Button>
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
            aria-label={t('nav.footer.admin')}
            className="w-full justify-start gap-2 text-sidebar-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>{t('nav.footer.admin')}</span>}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          aria-label={t('nav.footer.logout')}
          className="w-full justify-start gap-2 text-sidebar-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>{t('nav.footer.logout')}</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
