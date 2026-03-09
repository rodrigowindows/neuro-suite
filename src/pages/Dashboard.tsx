import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFeatureScores } from '@/hooks/useFeatureScores';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserProfile } from '@/hooks/useUserProfile';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import FeedbackButton from '@/components/FeedbackButton';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import StressAlertBanner from '@/components/StressAlertBanner';
import DashboardContent from '@/components/DashboardContent';
import { useStressNotifications } from '@/hooks/useStressNotifications';
import { supabase } from '@/integrations/supabase/client';

const PAGE_TITLES: Record<string, string> = {
  checkin: 'Check-in Diário',
  neuroscore: 'NeuroScore',
  gamification: 'Gamificação',
  neurocoach: 'NeuroCoach IA',
  leadership: 'Coaching Liderança',
  'cognitive-fatigue': 'Análise de Fadiga Cognitiva',
  'smart-breaks': 'Pausas Inteligentes',
  'ai-insights': 'IA Insights',
  alerts: 'Alertas RH',
  roi: 'ROI & Economia',
  nr1: 'NR-1 Compliance',
  'narrative-reports': 'Relatórios Narrativos IA',
  'nr1-chatbot': 'Chatbot NR-1',
  integrations: 'Integrações',
  'dashboard-rh': 'Dashboard RH',
};

const PAGE_DESCRIPTIONS: Record<string, string> = {
  checkin: 'Triagem emocional rápida de 30 segundos',
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

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { scores, refreshScores } = useFeatureScores();
  const { isManager, isAdmin, loading: rolesLoading } = useUserRole();
  const { profile } = useUserProfile();
  const [stressLevel, setStressLevel] = useState('');
  const [hrvValue, setHRVValue] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('checkin');
  const [showMeditation, setShowMeditation] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const stressNotif = useStressNotifications();

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
    setActiveTab('gamification');
    refreshScores();
  };

  if (loading || rolesLoading) {
    return <DashboardSkeleton />;
  }

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

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-4">
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
                className="space-y-6"
              >
                <DashboardContent
                  activeTab={activeTab}
                  stressLevel={stressLevel}
                  hrvValue={hrvValue}
                  showMeditation={showMeditation}
                  isFirstVisit={isFirstVisit}
                  isManager={isManager}
                  displayName={profile?.displayName || ''}
                  onScoreComplete={handleStressLevelComplete}
                />
              </motion.div>
            </AnimatePresence>
          </main>

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
