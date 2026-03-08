import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, AlertTriangle, CheckCircle, Settings, TrendingUp, Brain, Users, Loader2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface AlertThresholds {
  highStressPercent: number;
  lowHRVThreshold: number;
  consecutiveHighDays: number;
}

interface ProactiveAlert {
  userId: string;
  userName: string;
  userEmail: string;
  highPercent: number;
  avgHRV: number | null;
  consecutiveHigh: number;
  totalScans: number;
  severity: 'critical' | 'warning';
}

export default function HRAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [proactiveAlerts, setProactiveAlerts] = useState<ProactiveAlert[]>([]);
  const [aiSummary, setAiSummary] = useState('');
  const [teamStats, setTeamStats] = useState({ totalMonitored: 0, atRiskCount: 0, totalScans: 0 });
  const [thresholds, setThresholds] = useState<AlertThresholds>({
    highStressPercent: 30,
    lowHRVThreshold: 30,
    consecutiveHighDays: 3,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [proactiveLoading, setProactiveLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    analyzeAndGenerateAlerts();
  }, [thresholds]);

  const analyzeAndGenerateAlerts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: scans } = await supabase
        .from('stress_scans')
        .select('stress_level, hrv_value, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      if (!scans || scans.length === 0) {
        setLoading(false);
        return;
      }

      const generatedAlerts: Alert[] = [];
      const total = scans.length;
      const highCount = scans.filter(s => s.stress_level === 'high').length;
      const highPercent = (highCount / total) * 100;

      if (highPercent > thresholds.highStressPercent) {
        generatedAlerts.push({
          id: 'high_stress',
          type: 'critical',
          title: '🚨 Limite de Estresse Alto Ultrapassado',
          description: `${Math.round(highPercent)}% dos scans indicam estresse alto (limite: ${thresholds.highStressPercent}%). Intervenção urgente recomendada.`,
          timestamp: new Date(),
          acknowledged: false,
        });
      }

      const hrvValues = scans.filter(s => s.hrv_value).map(s => Number(s.hrv_value));
      const avgHRV = hrvValues.length > 0 ? hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length : 0;

      if (avgHRV > 0 && avgHRV < thresholds.lowHRVThreshold) {
        generatedAlerts.push({
          id: 'low_hrv',
          type: 'critical',
          title: '❤️ HRV Médio Abaixo do Limite',
          description: `HRV médio: ${Math.round(avgHRV)}ms (limite: ${thresholds.lowHRVThreshold}ms). Possível sobrecarga do sistema nervoso autônomo.`,
          timestamp: new Date(),
          acknowledged: false,
        });
      }

      const scansByDay = new Map<string, string[]>();
      scans.forEach(s => {
        const day = new Date(s.created_at!).toISOString().split('T')[0];
        if (!scansByDay.has(day)) scansByDay.set(day, []);
        scansByDay.get(day)!.push(s.stress_level);
      });

      let consecutiveHigh = 0;
      const sortedDays = Array.from(scansByDay.keys()).sort().reverse();
      for (const day of sortedDays) {
        const dayScans = scansByDay.get(day)!;
        const dayHighPercent = dayScans.filter(s => s === 'high').length / dayScans.length;
        if (dayHighPercent > 0.5) consecutiveHigh++;
        else break;
      }

      if (consecutiveHigh >= thresholds.consecutiveHighDays) {
        generatedAlerts.push({
          id: 'consecutive_high',
          type: 'warning',
          title: '⚠️ Estresse Alto Consecutivo',
          description: `${consecutiveHigh} dias consecutivos com maioria de scans em estresse alto. Risco de burnout.`,
          timestamp: new Date(),
          acknowledged: false,
        });
      }

      if (scans.length >= 4) {
        const half = Math.floor(scans.length / 2);
        const recentHigh = scans.slice(0, half).filter(s => s.stress_level === 'high').length / half;
        const olderHigh = scans.slice(half).filter(s => s.stress_level === 'high').length / (scans.length - half);

        if (recentHigh > olderHigh * 1.5) {
          generatedAlerts.push({
            id: 'trend_worsening',
            type: 'warning',
            title: '📈 Tendência de Piora Detectada',
            description: `O estresse alto aumentou ${Math.round((recentHigh - olderHigh) * 100)}% na semana recente.`,
            timestamp: new Date(),
            acknowledged: false,
          });
        }

        if (recentHigh < olderHigh * 0.5 && olderHigh > 0) {
          generatedAlerts.push({
            id: 'trend_improving',
            type: 'info',
            title: '✅ Tendência de Melhora',
            description: 'O estresse alto reduziu significativamente. As intervenções estão funcionando!',
            timestamp: new Date(),
            acknowledged: false,
          });
        }
      }

      if (scans.length < 3) {
        generatedAlerts.push({
          id: 'low_engagement',
          type: 'info',
          title: '📊 Baixo Engajamento',
          description: `Apenas ${scans.length} scans nos últimos 7 dias. Incentive o uso regular.`,
          timestamp: new Date(),
          acknowledged: false,
        });
      }

      setAlerts(generatedAlerts);
    } catch (error) {
      console.error('Erro ao gerar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const runProactiveAnalysis = async () => {
    setProactiveLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('proactive-alerts', {
        body: { action: 'analyze' },
      });

      if (error) throw error;

      setProactiveAlerts(data.alerts || []);
      setAiSummary(data.summary || '');
      setTeamStats({
        totalMonitored: data.totalMonitored || 0,
        atRiskCount: data.atRiskCount || 0,
        totalScans: data.totalScans || 0,
      });

      toast({
        title: 'Análise concluída',
        description: `${data.atRiskCount} colaborador(es) em risco identificados.`,
      });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setProactiveLoading(false);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    toast({ title: 'Alerta reconhecido' });
  };

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return { bg: 'bg-destructive/10', border: 'border-destructive/30', icon: 'text-destructive' };
      case 'warning': return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: 'text-orange-500' };
      case 'info': return { bg: 'bg-primary/10', border: 'border-primary/30', icon: 'text-primary' };
    }
  };

  const criticalCount = alerts.filter(a => a.type === 'critical' && !a.acknowledged).length;
  const warningCount = alerts.filter(a => a.type === 'warning' && !a.acknowledged).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Analisando dados para alertas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="realtime" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="realtime" className="gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            Alertas em Tempo Real
            {criticalCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[10px] rounded-full font-bold">
                {criticalCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="proactive" className="gap-1.5">
            <Brain className="h-3.5 w-3.5" />
            Alertas Proativos IA
          </TabsTrigger>
        </TabsList>

        {/* Real-time alerts tab */}
        <TabsContent value="realtime" className="space-y-4 mt-4">
          <Card className="shadow-soft border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-5 w-5 text-primary" />
                    Alertas Inteligentes
                    {warningCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] rounded-full font-bold">
                        {warningCount}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>Baseados nos thresholds configurados</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showSettings && (
                <Card className="bg-muted/30 border-muted">
                  <CardContent className="p-4 space-y-4">
                    <p className="text-sm font-semibold">⚙️ Configurar Limites</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="highStress" className="text-xs">% Estresse Alto Máximo</Label>
                        <Input id="highStress" type="number" value={thresholds.highStressPercent}
                          onChange={(e) => setThresholds({ ...thresholds, highStressPercent: Number(e.target.value) || 30 })}
                          className="h-8" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lowHRV" className="text-xs">HRV Mínimo (ms)</Label>
                        <Input id="lowHRV" type="number" value={thresholds.lowHRVThreshold}
                          onChange={(e) => setThresholds({ ...thresholds, lowHRVThreshold: Number(e.target.value) || 30 })}
                          className="h-8" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="consecutiveDays" className="text-xs">Dias Consecutivos Alto</Label>
                        <Input id="consecutiveDays" type="number" value={thresholds.consecutiveHighDays}
                          onChange={(e) => setThresholds({ ...thresholds, consecutiveHighDays: Number(e.target.value) || 3 })}
                          className="h-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3 opacity-60" />
                  <p className="text-sm font-semibold">Tudo OK! 🎉</p>
                  <p className="text-xs text-muted-foreground">Nenhum alerta ativo.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts
                    .sort((a, b) => ({ critical: 0, warning: 1, info: 2 }[a.type] - { critical: 0, warning: 1, info: 2 }[b.type]))
                    .map((alert) => {
                      const styles = getAlertStyles(alert.type);
                      return (
                        <Card key={alert.id} className={`${styles.bg} ${styles.border} border ${alert.acknowledged ? 'opacity-50' : ''}`}>
                          <CardContent className="p-3 sm:p-4 flex items-start gap-3">
                            {alert.type === 'critical' ? (
                              <AlertTriangle className={`h-5 w-5 ${styles.icon} shrink-0 mt-0.5`} />
                            ) : alert.type === 'warning' ? (
                              <TrendingUp className={`h-5 w-5 ${styles.icon} shrink-0 mt-0.5`} />
                            ) : (
                              <CheckCircle className={`h-5 w-5 ${styles.icon} shrink-0 mt-0.5`} />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold">{alert.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                            </div>
                            {!alert.acknowledged && (
                              <Button variant="ghost" size="sm" className="shrink-0 text-xs" onClick={() => acknowledgeAlert(alert.id)}>
                                OK
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Proactive AI alerts tab */}
        <TabsContent value="proactive" className="space-y-4 mt-4">
          <Card className="shadow-soft border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-5 w-5 text-primary" />
                Detecção Proativa de Burnout
              </CardTitle>
              <CardDescription>
                IA analisa padrões da equipe e identifica colaboradores em risco antes que o problema escale
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runProactiveAnalysis} disabled={proactiveLoading} className="w-full gap-2">
                {proactiveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                {proactiveLoading ? 'Analisando equipe...' : 'Executar Análise Proativa'}
              </Button>

              {teamStats.totalMonitored > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xl font-bold">{teamStats.totalMonitored}</p>
                    <p className="text-[10px] text-muted-foreground">Monitorados</p>
                  </div>
                  <div className="text-center p-3 bg-destructive/10 rounded-lg">
                    <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-destructive" />
                    <p className="text-xl font-bold text-destructive">{teamStats.atRiskCount}</p>
                    <p className="text-[10px] text-muted-foreground">Em Risco</p>
                  </div>
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-xl font-bold text-primary">{teamStats.totalScans}</p>
                    <p className="text-[10px] text-muted-foreground">Scans 7d</p>
                  </div>
                </div>
              )}

              {aiSummary && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                      <Brain className="h-3.5 w-3.5 text-primary" />
                      Resumo IA da Equipe
                    </p>
                    <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{aiSummary}</p>
                  </CardContent>
                </Card>
              )}

              {proactiveAlerts.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold">Colaboradores em Risco:</p>
                  {proactiveAlerts.map((alert, i) => (
                    <Card key={i} className={`border ${alert.severity === 'critical' ? 'border-destructive/30 bg-destructive/5' : 'border-orange-500/30 bg-orange-500/5'}`}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <AlertTriangle className={`h-5 w-5 shrink-0 ${alert.severity === 'critical' ? 'text-destructive' : 'text-orange-500'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold truncate">{alert.userName}</p>
                            <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'} className="text-[9px]">
                              {alert.severity === 'critical' ? 'CRÍTICO' : 'ATENÇÃO'}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {alert.highPercent}% estresse alto · {alert.consecutiveHigh}d consecutivos
                            {alert.avgHRV ? ` · HRV ${alert.avgHRV}ms` : ''} · {alert.totalScans} scans
                          </p>
                        </div>
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!proactiveLoading && proactiveAlerts.length === 0 && teamStats.totalMonitored === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Brain className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Clique acima para executar a análise proativa</p>
                  <p className="text-xs mt-1">A IA identificará padrões de burnout na equipe</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
