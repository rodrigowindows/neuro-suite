import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFeatureScores } from '@/hooks/useFeatureScores';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserProfile } from '@/hooks/useUserProfile';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

import DashboardSkeleton from '@/components/DashboardSkeleton';
import StressAlertBanner from '@/components/StressAlertBanner';
import DashboardContent from '@/components/DashboardContent';
import ResearchValidationModal from '@/components/ResearchValidationModal';
import ConnectionStatusWidget from '@/components/ConnectionStatusWidget';
import MissionStatusWidget from '@/components/MissionStatusWidget';
import { SectionTabs } from '@/components/SectionTabs';
import { useStressNotifications } from '@/hooks/useStressNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useWellnessScore } from '@/hooks/useWellnessScore';
import { useReadiness, getScanVerdictLabel } from '@/hooks/useReadiness';
import { appendEvent } from '@/lib/missionEvents';

const PAGE_TITLES: Record<string, string> = {
  'bridge-console': 'Cockpit',
  checkin: 'Avaliação de Prontidão',
  neuroscore: 'BioScore',
  gamification: 'Disciplina',
  neurocoach: 'Contramedidas',
  leadership: 'Liderança',
  'cognitive-fatigue': 'Métricas de Carga',
  'smart-breaks': 'Pausas',
  'mission-log': 'Histórico de Voo',
  'ai-insights': 'IA Insights',
  alerts: 'Alertas Comando',
  roi: 'ROI',
  nr1: 'Segurança',
  'narrative-reports': 'Relatórios IA',
  'nr1-chatbot': 'Chatbot Segurança',
  integrations: 'Integrações',
  'dashboard-rh': 'Painel de Comando',
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { scores, refreshScores } = useFeatureScores();
  const { isManager, isAdmin, loading: rolesLoading } = useUserRole();
  const { profile } = useUserProfile();
  const { score: currentBioScore } = useWellnessScore();
  const [stressLevel, setStressLevel] = useState('');
  const [hrvValue, setHRVValue] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('bridge-console');
  const [autoStartBreathing, setAutoStartBreathing] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const stressNotif = useStressNotifications();
  const readiness = useReadiness({ stressLevel, hrvValue });

  useEffect(() => {
    if (activeTab !== 'neurocoach') {
      setAutoStartBreathing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Load last stress level from DB so state persists across refreshes
  useEffect(() => {
    if (!user) return;
    const loadLastScan = async () => {
      const { data } = await supabase
        .from('stress_scans')
        .select('stress_level, hrv_value')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setStressLevel(data.stress_level);
        if (data.hrv_value) setHRVValue(Number(data.hrv_value));
      } else {
        setIsFirstVisit(true);
      }
    };
    loadLastScan();
  }, [user?.id]);

  const handleStressLevelComplete = (level: string, hrv?: number) => {
    setStressLevel(level);
    setHRVValue(hrv);
    setIsFirstVisit(false);
    if (hrv && hrv < 30) setShowMeditation(true);
    setActiveTab('bridge-console');
    refreshScores();

    const scanVerdict = getScanVerdictLabel(hrv, level);
    const scoreStr = currentBioScore != null ? ` (BioScore ${currentBioScore})` : '';
    appendEvent({
      type: 'scan',
      label: `BioScore: ${scanVerdict}${scoreStr}`,
      metadata: {
        verdict: scanVerdict,
        bioScore: currentBioScore ?? null,
        stressLevel: level,
        hrvValue: hrv ?? null,
      },
    });
  };

  const handleStartProtocol = () => {
    setAutoStartBreathing(true);
    setActiveTab('neurocoach');
  };

  if (loading || rolesLoading) {
    return <DashboardSkeleton />;
  }

  const isDemo =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location?.search || '').get('demo') === '1';

  const hasNoTelemetry = !stressLevel && hrvValue === undefined;
  const isDemoActive = Boolean(isDemo && hasNoTelemetry);

  const effectiveStress = isDemoActive ? 'high' : stressLevel;
  const effectiveHrv = isDemoActive ? 28 : hrvValue;

  return (
    <MotionConfig reducedMotion="user">
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          gamificationDisabled={!stressLevel}
          scores={scores as unknown as Record<string, { label: string; color: string } | null>}
          isManager={isManager}
          isAdmin={isAdmin}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <header className="h-14 flex items-center justify-between gap-2 sm:gap-3 border-b bg-card/60 backdrop-blur-sm px-3 sm:px-4 sticky top-0 z-40">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground shrink-0 min-h-[44px] min-w-[44px]" />
              <div className="flex flex-col min-w-0">
                <h1 className="font-display font-bold text-sm sm:text-base truncate">
                  {PAGE_TITLES[activeTab] || 'Cockpit'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
              <MissionStatusWidget
                state={readiness.state}
                label={readiness.label}
                isDemo={readiness.isDemo}
                stageBadge={readiness.stageBadge}
              />
              <ConnectionStatusWidget />
            </div>
          </header>

          <main className="flex-1 p-2.5 sm:p-4 lg:py-2.5 lg:px-6 max-w-5xl w-full mx-auto space-y-2 sm:space-y-3">
            <SectionTabs activeTab={activeTab} onTabChange={setActiveTab} />
            {stressNotif.isCritical && (
              <StressAlertBanner
                consecutiveHighDays={stressNotif.consecutiveHighDays}
                highPercent={stressNotif.highPercent}
                avgHRV={stressNotif.avgHRV}
              />
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-3 sm:space-y-4"
              >
                <DashboardContent
                  activeTab={activeTab}
                  stressLevel={effectiveStress}
                  hrvValue={effectiveHrv}
                  isDemo={isDemoActive ? true : isDemo}
                  readinessLabel={readiness.label}
                  showMeditation={showMeditation}
                  isFirstVisit={isFirstVisit}
                  isManager={isManager}
                  displayName={profile?.displayName || ''}
                  onScoreComplete={handleStressLevelComplete}
                  onTabChange={setActiveTab}
                  onStartProtocol={handleStartProtocol}
                  autoStartBreathing={autoStartBreathing}
                />
              </motion.div>
            </AnimatePresence>
          </main>

          <footer className="border-t bg-card/20 px-4 py-1.5 shrink-0">
            <div className="max-w-5xl w-full mx-auto flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <span>Zero-Trust Privacy</span>
              <span>·</span>
              <ResearchValidationModal
                triggerText="Validação de Pesquisa"
                triggerClassName="text-[11px] text-muted-foreground hover:text-foreground underline-offset-4 hover:underline min-h-[44px] inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </footer>
        </div>


      </div>
    </SidebarProvider>
    </MotionConfig>
  );
}
