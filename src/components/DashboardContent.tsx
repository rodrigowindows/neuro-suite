import { lazy, Suspense } from 'react';

const BridgeConsole = lazy(() => import('@/components/BridgeConsole'));
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
const WellnessReportPDF = lazy(() => import('@/components/WellnessReportPDF'));
const CognitiveFatigueAnalyzer = lazy(() => import('@/components/CognitiveFatigueAnalyzer'));
const SmartBreakAssistant = lazy(() => import('@/components/SmartBreakAssistant'));
const NarrativeReportGenerator = lazy(() => import('@/components/NarrativeReportGenerator'));
const NR1ComplianceChatbot = lazy(() => import('@/components/NR1ComplianceChatbot'));
const MissionLog = lazy(() => import('@/components/MissionLog'));

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
  blinkRate?: number;
  bioScore?: number;
  horasSono?: number | null;
  showMeditation: boolean;
  isFirstVisit: boolean;
  isManager: boolean;
  displayName: string;
  onScoreComplete: (level: string, hrv?: number) => void;
  onTabChange?: (tab: string) => void;
  onStartProtocol?: () => void;
  autoStartBreathing?: boolean;
  isDemo?: boolean;
  readinessLabel?: string;
}

export default function DashboardContent({
  activeTab,
  stressLevel,
  hrvValue,
  blinkRate,
  bioScore,
  horasSono,
  showMeditation,
  isFirstVisit,
  isManager,
  displayName,
  onScoreComplete,
  onTabChange,
  onStartProtocol,
  autoStartBreathing,
  isDemo,
  readinessLabel,
}: DashboardContentProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'bridge-console':
        return (
          <BridgeConsole
            onNavigateTab={onTabChange}
            onStartProtocol={onStartProtocol}
            stressLevel={stressLevel}
            hrvValue={hrvValue}
            blinkRate={blinkRate}
            bioScore={bioScore}
            horasSono={horasSono}
            isDemo={isDemo}
          />
        );
      case 'checkin':
        return (
          <>
            <DailyCheckin />
            <CheckinHistory />

            <div className="flex justify-center">
              <WellnessReportPDF />
            </div>
          </>
        );
      case 'neuroscore':
        return (
          <>
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
            <p className="text-lg font-medium">Complete o BioScore primeiro</p>
            <p className="text-sm mt-1">Faça um scan para desbloquear a gamificação</p>
          </div>
        );
      case 'neurocoach':
        return (
          <NeuroCoach
            stressLevel={stressLevel || undefined}
            autoStartBreathing={autoStartBreathing}
          />
        );
      case 'leadership':
        return <LeadershipCoaching stressLevel={stressLevel || undefined} />;
      case 'cognitive-fatigue':
        return <CognitiveFatigueAnalyzer stressLevel={stressLevel || undefined} />;
      case 'smart-breaks':
        return <SmartBreakAssistant stressLevel={stressLevel || undefined} hrvValue={hrvValue} />;
      case 'mission-log': {
        const isDemoActive = Boolean(isDemo && !stressLevel && hrvValue === undefined);
        const effectiveStress = isDemoActive ? 'high' : stressLevel;
        const effectiveHrv = isDemoActive ? 28 : hrvValue;
        return (
          <MissionLog
            cockpitVerdict={readinessLabel}
            stressLevel={effectiveStress}
            hrvValue={effectiveHrv}
          />
        );
      }
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
