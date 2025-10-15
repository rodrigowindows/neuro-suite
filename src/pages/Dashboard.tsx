import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, LogOut, Activity, MessageCircle } from 'lucide-react';
import NeuroScore from '@/components/NeuroScore';
import NeuroCoach from '@/components/NeuroCoach';

export default function Dashboard() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [stressLevel, setStressLevel] = useState<string>('');
  const [activeTab, setActiveTab] = useState('neuroscore');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleStressLevelComplete = (level: string) => {
    setStressLevel(level);
    setActiveTab('neurocoach');
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
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-hero rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                NeuroSuite
              </h1>
              <p className="text-xs text-muted-foreground">Wellness & Performance</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold">
            🧠 NeuroSuite - Reduza Turnover e Aumente Produtividade
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-3xl">
            Scan via webcam detecta padrões de piscadas (NeuroScore) para estimar estresse baseado em neurociência. 
            Valide com HRV de pulseira. NeuroCoach IA personaliza plano com PNL para bem-estar, alta performance e compliance NR-1.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 p-1">
            <TabsTrigger value="neuroscore" className="gap-2">
              <Activity className="h-4 w-4" />
              NeuroScore
            </TabsTrigger>
            <TabsTrigger value="neurocoach" className="gap-2" disabled={!stressLevel}>
              <MessageCircle className="h-4 w-4" />
              NeuroCoach
            </TabsTrigger>
          </TabsList>

          <TabsContent value="neuroscore" className="space-y-6">
            <NeuroScore onScoreComplete={handleStressLevelComplete} />
          </TabsContent>

          <TabsContent value="neurocoach" className="space-y-6">
            {stressLevel ? (
              <NeuroCoach stressLevel={stressLevel} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Complete o NeuroScore primeiro para desbloquear o Coach IA
              </div>
            )}
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