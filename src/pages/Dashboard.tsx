import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Activity, MessageCircle, BarChart, Trophy, Plug, Calculator, Shield, Bell, Brain } from 'lucide-react';
import NeuroScore from '@/components/NeuroScore';
import NeuroCoach from '@/components/NeuroCoach';
import DashboardRH from '@/components/DashboardRH';
import Gamification from '@/components/Gamification';
import MiniMeditation from '@/components/MiniMeditation';
import IntegrationsDashboard from '@/components/IntegrationsDashboard';
import ROIDashboard from '@/components/ROIDashboard';
import NR1Report from '@/components/NR1Report';
import HRAlerts from '@/components/HRAlerts';
import AIInsightsDashboard from '@/components/AIInsightsDashboard';
import neuroSuiteLogo from '@/assets/neurosuite-logo.jpg';
import FeedbackButton from '@/components/FeedbackButton';
import BackButton from '@/components/BackButton';

export default function Dashboard() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [stressLevel, setStressLevel] = useState<string>('');
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
    
    // Ativar mini-meditação se HRV < 30
    if (hrv && hrv < 30) {
      setShowMeditation(true);
    }
    
    setActiveTab('gamification');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <BackButton />
      <FeedbackButton />
      
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src={neuroSuiteLogo} 
              alt="NeuroSuite Logo" 
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-5xl">
        <div className="mb-4 sm:mb-6 md:mb-8 space-y-2 sm:space-y-3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
            🧠 NeuroSuite - Reduza Turnover e Aumente Produtividade
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-3xl">
            Scan via webcam detecta padrões de piscadas (NeuroScore) para estimar estresse baseado em neurociência. 
            Valide com HRV de pulseira. NeuroCoach IA personaliza plano com PNL para bem-estar, alta performance e compliance NR-1.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-5 sm:grid-cols-9 p-0.5 sm:p-1 h-auto">
            <TabsTrigger value="neuroscore" className="gap-1 text-[10px] sm:text-xs py-2">
              <Activity className="h-3 w-3" />
              <span className="hidden sm:inline">Score</span>
              <span className="sm:hidden">Score</span>
            </TabsTrigger>
            <TabsTrigger value="gamification" className="gap-1 text-[10px] sm:text-xs py-2" disabled={!stressLevel}>
              <Trophy className="h-3 w-3" />
              <span>🏆</span>
            </TabsTrigger>
            <TabsTrigger value="neurocoach" className="gap-1 text-[10px] sm:text-xs py-2">
              <MessageCircle className="h-3 w-3" />
              <span className="hidden sm:inline">Coach</span>
              <span className="sm:hidden">IA</span>
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="gap-1 text-[10px] sm:text-xs py-2">
              <Brain className="h-3 w-3" />
              <span className="hidden sm:inline">IA</span>
              <span className="sm:hidden">🧠</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-1 text-[10px] sm:text-xs py-2">
              <Bell className="h-3 w-3" />
              <span className="hidden sm:inline">Alertas</span>
              <span className="sm:hidden">🔔</span>
            </TabsTrigger>
            <TabsTrigger value="roi" className="gap-1 text-[10px] sm:text-xs py-2">
              <Calculator className="h-3 w-3" />
              <span className="hidden sm:inline">ROI</span>
              <span className="sm:hidden">💰</span>
            </TabsTrigger>
            <TabsTrigger value="nr1" className="gap-1 text-[10px] sm:text-xs py-2">
              <Shield className="h-3 w-3" />
              <span className="hidden sm:inline">NR-1</span>
              <span className="sm:hidden">📋</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-1 text-[10px] sm:text-xs py-2">
              <Plug className="h-3 w-3" />
              <span className="hidden sm:inline">API</span>
              <span className="sm:hidden">🔗</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard-rh" className="gap-1 text-[10px] sm:text-xs py-2">
              <BarChart className="h-3 w-3" />
              <span className="hidden sm:inline">RH</span>
              <span className="sm:hidden">📊</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="neuroscore" className="space-y-6">
            <NeuroScore onScoreComplete={handleStressLevelComplete} />
          </TabsContent>

          <TabsContent value="gamification" className="space-y-6">
            {stressLevel ? (
              <>
                <Gamification stressLevel={stressLevel} hrvValue={hrvValue} />
                {showMeditation && <MiniMeditation trigger={showMeditation} />}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Complete o NeuroScore primeiro
              </div>
            )}
          </TabsContent>

          <TabsContent value="neurocoach" className="space-y-6">
            <NeuroCoach stressLevel={stressLevel || 'moderate'} />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <HRAlerts />
          </TabsContent>

          <TabsContent value="roi" className="space-y-6">
            <ROIDashboard />
          </TabsContent>

          <TabsContent value="nr1" className="space-y-6">
            <NR1Report />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <IntegrationsDashboard />
          </TabsContent>

          <TabsContent value="dashboard-rh" className="space-y-6">
            <DashboardRH />
          </TabsContent>
        </Tabs>

        <footer className="mt-12 p-6 bg-card/50 rounded-lg border text-sm space-y-3">
          <p className="font-semibold">🔬 Validação Científica:</p>
          <p className="text-muted-foreground">
            Compare NeuroScore com HRV da pulseira para validação cruzada. Para empresas: Reduza até 25% do absenteísmo 
            com compliance NR-1 (gestão de riscos psicossociais). Compartilhe feedback para evoluir a ferramenta.
          </p>
          <p className="text-xs text-muted-foreground pt-2 border-t">
            NeuroSuite v1.0 (Beta) | Desenvolvido por Lincolnectd Neurobusiness para demos corporativas | Dados anônimos protegidos por LGPD
          </p>
        </footer>
      </main>
    </div>
  );
}