import { Activity, MessageCircle, Trophy, Brain, Bell, Calculator, Shield, Plug, BarChart, LogOut, Settings, GraduationCap, UserCircle, Sun, Eye, Coffee, FileText, MessageSquare } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const employeeItems = [
  { title: 'Check-in', value: 'checkin', icon: Sun, emoji: '☀️' },
  { title: 'NeuroScore', value: 'neuroscore', icon: Activity, emoji: '🧠' },
  { title: 'Gamificação', value: 'gamification', icon: Trophy, emoji: '🏆' },
  { title: 'NeuroCoach', value: 'neurocoach', icon: MessageCircle, emoji: '💬' },
  { title: 'Coaching Pro', value: 'leadership', icon: GraduationCap, emoji: '🎓' },
];

const managerItems = [
  { title: 'IA Insights', value: 'ai-insights', icon: Brain, emoji: '🤖' },
  { title: 'Alertas RH', value: 'alerts', icon: Bell, emoji: '🔔' },
  { title: 'ROI', value: 'roi', icon: Calculator, emoji: '💰' },
  { title: 'NR-1 Compliance', value: 'nr1', icon: Shield, emoji: '📋' },
  { title: 'Integrações', value: 'integrations', icon: Plug, emoji: '🔗' },
  { title: 'Dashboard RH', value: 'dashboard-rh', icon: BarChart, emoji: '📊' },
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

export function AppSidebar({ activeTab, onTabChange, gamificationDisabled, scores = {}, isManager = false, isAdmin = false }: AppSidebarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2.5 px-1">
          <img
            src={neuroSuiteLogo}
            alt="NeuroSuite Logo"
            className="h-8 w-8 rounded-md object-cover flex-shrink-0"
          />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-display font-bold text-sm text-sidebar-primary-foreground truncate">
                NeuroSuite
              </span>
              <span className="text-[10px] text-sidebar-muted-foreground">
                Beta v1.0
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
            {!collapsed ? 'Colaborador' : '👤'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {employeeItems.map((item) => (
                <SidebarMenuItem key={item.value} className="relative">
                  <SidebarMenuButton
                    onClick={() => {
                      if (item.value === 'gamification' && gamificationDisabled) return;
                      onTabChange(item.value);
                    }}
                    isActive={activeTab === item.value}
                    tooltip={item.title}
                    className={`transition-all duration-200 ${
                      activeTab === item.value
                        ? 'bg-sidebar-primary/15 text-sidebar-primary font-medium'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    } ${item.value === 'gamification' && gamificationDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.title}</span>
                    )}
                    {scores[item.value] && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white leading-none ${scores[item.value]!.color} ${collapsed ? 'absolute -top-1 -right-1 scale-75' : ''}`}>
                        {scores[item.value]!.label}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isManager && (
          <>
            <Separator className="my-1 bg-sidebar-border" />

            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                {!collapsed ? 'Gestor / RH' : '📊'}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {managerItems.map((item) => (
                    <SidebarMenuItem key={item.value} className="relative">
                      <SidebarMenuButton
                        onClick={() => onTabChange(item.value)}
                        isActive={activeTab === item.value}
                        tooltip={item.title}
                        className={`transition-all duration-200 ${
                          activeTab === item.value
                            ? 'bg-sidebar-primary/15 text-sidebar-primary font-medium'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent'
                        }`}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && (
                          <span className="truncate flex-1">{item.title}</span>
                        )}
                        {scores[item.value] && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white leading-none ${scores[item.value]!.color} ${collapsed ? 'absolute -top-1 -right-1 scale-75' : ''}`}>
                            {scores[item.value]!.label}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2 space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          className="w-full justify-start gap-2 text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <UserCircle className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Meu Perfil</span>}
        </Button>
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
            className="w-full justify-start gap-2 text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Admin</span>}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
