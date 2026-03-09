import { lazy, Suspense } from 'react';
import WelcomeBanner from '@/components/WelcomeBanner';

const NeuroScore = lazy(() => import('@/components/features/NeuroScore'));
const WellnessScoreCard = lazy(() => import('@/components/WellnessScoreCard'));
const NeuroCoach = lazy(() => import('@/components/features/NeuroCoach'));
const DashboardRH = lazy(() => import('@/components/DashboardRH'));
const Gamification = lazy(() => import('@/components/Gamification'));
const GamificationScoreCard = lazy(() => import('@/components/GamificationScoreCard'));
const MiniMeditation = lazy(() => import('@/components/MiniMeditation'));
const IntegrationsDashboard = lazy(() => import('@/components/IntegrationsDashboard'));
const ROIDashboard = lazy(() => import('@/components/ROIDashboard'));
const NR1Report = lazy(() => import('@/components/NR1Report'));
const HRAlerts = lazy(() => import('@/components/HRAlerts'));
const AIInsightsDashboard = lazy(() => import('@/components/AIInsightsDashboard'));
const LeadershipCoaching = lazy(() => import('@/components/LeadershipCoaching'));
const DailyCheckin = lazy(() => import('@/components/DailyCheckin'));
const CheckinHistory = lazy(() => import('@/components/CheckinHistory'));
const WeeklyComparison = lazy(() => import('@/components/WeeklyComparison'));
const WellnessReportPDF = lazy(() => import('@/components/WellnessReportPDF'));
const CognitiveFatigueAnalyzer = lazy(() => import('@/components/CognitiveFatigueAnalyzer'));
const SmartBreakAssistant = lazy(() => import('@/components/SmartBreakAssistant'));
const NarrativeReportGenerator = lazy(() => import('@/components/NarrativeReportGenerator'));
const NR1ComplianceChatbot = lazy(() => import('@/components/NR1ComplianceChatbot'));

function LazyFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin h-8 w-8 border-[3px] border-primary border-t-transparent rounded-full" />
    </div>
  );
}

interface DashboardContentProps {
  activeTab: string;
  stressLevel: string;
  hrvValue?: number;
  showMeditation: boolean;
  isFirstVisit: boolean;
  isManager: boolean;
  displayName: string;
  onScoreComplete: (level: string, hrv?: number) => void;
}

export default function DashboardContent({
  activeTab,
  stressLevel,
  hrvValue,
  showMeditation,
  isFirstVisit,
  isManager,
  displayName,
  onScoreComplete,
}: DashboardContentProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'checkin':
        return (
          <>
            <DailyCheckin />
            <CheckinHistory />
            <WeeklyComparison />
            <div className="flex justify-center">
              <WellnessReportPDF />
            </div>
          </>
        );
      case 'neuroscore':
        return (
          <>
            {isFirstVisit && <WelcomeBanner displayName={displayName} />}
            <WellnessScoreCard />
            <NeuroScore onScoreComplete={onScoreComplete} />
          </>
        );
      case 'gamification':
        return stressLevel ? (
          <>
            <GamificationScoreCard />
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
      case 'cognitive-fatigue':
        return <CognitiveFatigueAnalyzer stressLevel={stressLevel || undefined} />;
      case 'smart-breaks':
        return <SmartBreakAssistant stressLevel={stressLevel || undefined} hrvValue={hrvValue} />;
      case 'ai-insights':
        return isManager ? <AIInsightsDashboard /> : null;
      case 'alerts':
        return isManager ? <HRAlerts /> : null;
      case 'roi':
        return isManager ? <ROIDashboard /> : null;
      case 'nr1':
        return isManager ? <NR1Report /> : null;
      case 'narrative-reports':
        return isManager ? <NarrativeReportGenerator /> : null;
      case 'nr1-chatbot':
        return isManager ? <NR1ComplianceChatbot /> : null;
      case 'integrations':
        return isManager ? <IntegrationsDashboard /> : null;
      case 'dashboard-rh':
        return isManager ? <DashboardRH /> : null;
      default:
        return null;
    }
  };

  return (
    <Suspense fallback={<LazyFallback />}>
      {renderContent()}
    </Suspense>
  );
}
