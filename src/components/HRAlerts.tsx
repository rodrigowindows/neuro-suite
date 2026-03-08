import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, AlertTriangle, CheckCircle, Settings, TrendingUp, Brain, Users, Loader2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useStressData } from '@/hooks/useStressData';
import type { AlertThresholds } from '@/types/stress';
import { generateAlerts, sortAlerts, getAlertStyles, type Alert } from '@/services/alertGenerator';

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
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());
  const [proactiveAlerts, setProactiveAlerts] = useState<ProactiveAlert[]>([]);
  const [aiSummary, setAiSummary] = useState('');
  const [teamStats, setTeamStats] = useState({ totalMonitored: 0, atRiskCount: 0, totalScans: 0 });
  const [thresholds, setThresholds] = useState<AlertThresholds>({
    highStressPercent: 30,
    lowHRVThreshold: 30,
    consecutiveHighDays: 3,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [proactiveLoading, setProactiveLoading] = useState(false);
  const { toast } = useToast();

  const { stats, trend, consecutiveHighDays, loading } = useStressData({ days: 7 });

  const alerts = useMemo(() => {
    if (loading || stats.totalScans === 0) return [];
    const generated = generateAlerts(stats, trend, consecutiveHighDays, thresholds);
    return generated.map(a => ({
      ...a,
      acknowledged: acknowledgedIds.has(a.id),
    }));
  }, [stats, trend, consecutiveHighDays, thresholds, loading, acknowledgedIds]);

  const sortedAlerts = useMemo(() => sortAlerts(alerts), [alerts]);

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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro desconhecido';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setProactiveLoading(false);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAcknowledgedIds(prev => new Set(prev).add(alertId));
    toast({ title: 'Alerta reconhecido' });
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

              {sortedAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3 opacity-60" />
                  <p className="text-sm font-semibold">Tudo OK! 🎉</p>
                  <p className="text-xs text-muted-foreground">Nenhum alerta ativo.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedAlerts.map((alert) => {
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
