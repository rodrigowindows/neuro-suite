import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFeatureScores } from '@/hooks/useFeatureScores';
import { useUserRole } from '@/hooks/useUserRole';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import FeedbackButton from '@/components/FeedbackButton';

// Lazy-loaded feature components
const NeuroScore = lazy(() => import('@/components/features/NeuroScore'));
const NeuroCoach = lazy(() => import('@/components/features/NeuroCoach'));
const DashboardRH = lazy(() => import('@/components/DashboardRH'));
const Gamification = lazy(() => import('@/components/Gamification'));
const MiniMeditation = lazy(() => import('@/components/MiniMeditation'));
const IntegrationsDashboard = lazy(() => import('@/components/IntegrationsDashboard'));
const ROIDashboard = lazy(() => import('@/components/ROIDashboard'));
const NR1Report = lazy(() => import('@/components/NR1Report'));
const HRAlerts = lazy(() => import('@/components/HRAlerts'));
const AIInsightsDashboard = lazy(() => import('@/components/AIInsightsDashboard'));
const LeadershipCoaching = lazy(() => import('@/components/LeadershipCoaching'));

const PAGE_TITLES: Record<string, string> = {
  neuroscore: 'NeuroScore',
  gamification: 'Gamificação',
  neurocoach: 'NeuroCoach IA',
  leadership: 'Coaching Liderança',
  'ai-insights': 'IA Insights',
  alerts: 'Alertas RH',
  roi: 'ROI & Economia',
  nr1: 'NR-1 Compliance',
  integrations: 'Integrações',
  'dashboard-rh': 'Dashboard RH',
};

const PAGE_DESCRIPTIONS: Record<string, string> = {
  neuroscore: 'Scan facial via webcam para estimar nível de estresse com neurociência',
  gamification: 'Acompanhe seu progresso, streaks e conquistas',
  neurocoach: 'Coach de alta performance com IA personalizada',
  leadership: 'Módulos premium de desenvolvimento de liderança com IA',
  'ai-insights': 'Análises preditivas de burnout e sentimento',
  alerts: 'Alertas inteligentes para gestão de equipes',
  roi: 'Retorno sobre investimento em saúde ocupacional',
  nr1: 'Compliance e relatórios NR-1 automatizados',
  integrations: 'Conecte com suas ferramentas de RH',
  'dashboard-rh': 'Visão consolidada dos indicadores de bem-estar',
};

function LazyFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin h-8 w-8 border-[3px] border-primary border-t-transparent rounded-full" />
    </div>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { scores, refreshScores } = useFeatureScores();
  const { isManager, isAdmin, loading: rolesLoading } = useUserRole();
  const [stressLevel, setStressLevel] = useState('');
  const [hrvValue, setHRVValue] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('neuroscore');
  const [showMeditation, setShowMeditation] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleStressLevelComplete = (level: string, hrv?: number) => {
    setStressLevel(level);
    setHRVValue(hrv);
    if (hrv && hrv < 30) setShowMeditation(true);
    setActiveTab('gamification');
    refreshScores();
  };

  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin h-10 w-10 border-[3px] border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'neuroscore':
        return <NeuroScore onScoreComplete={handleStressLevelComplete} />;
      case 'gamification':
        return stressLevel ? (
          <>
            <Gamification stressLevel={stressLevel} hrvValue={hrvValue} />
            {showMeditation && <MiniMeditation trigger={showMeditation} />}
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">Complete o NeuroScore primeiro</p>
            <p className="text-sm mt-1">Faça um scan para desbloquear a gamificação</p>
          </div>
        );
      case 'neurocoach':
        return <NeuroCoach stressLevel={stressLevel || undefined} />;
      case 'leadership':
        return <LeadershipCoaching stressLevel={stressLevel || undefined} />;
      case 'ai-insights':
        return isManager ? <AIInsightsDashboard /> : null;
      case 'alerts':
        return isManager ? <HRAlerts /> : null;
      case 'roi':
        return isManager ? <ROIDashboard /> : null;
      case 'nr1':
        return isManager ? <NR1Report /> : null;
      case 'integrations':
        return isManager ? <IntegrationsDashboard /> : null;
      case 'dashboard-rh':
        return isManager ? <DashboardRH /> : null;
      default:
        return null;
    }
  };

  return (
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

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-14 flex items-center gap-3 border-b bg-card/60 backdrop-blur-sm px-4 sticky top-0 z-40">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex flex-col min-w-0">
              <h1 className="font-display font-bold text-sm sm:text-base truncate">
                {PAGE_TITLES[activeTab]}
              </h1>
              <p className="text-[11px] text-muted-foreground truncate hidden sm:block">
                {PAGE_DESCRIPTIONS[activeTab]}
              </p>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-6"
              >
                <Suspense fallback={<LazyFallback />}>
                  {renderContent()}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Footer */}
          <footer className="border-t bg-card/30 px-4 py-3 text-center">
            <p className="text-[11px] text-muted-foreground">
              NeuroSuite v1.0 (Beta) · Lincolnectd Neurobusiness · LGPD
            </p>
          </footer>
        </div>

        <FeedbackButton />
      </div>
    </SidebarProvider>
  );
}
