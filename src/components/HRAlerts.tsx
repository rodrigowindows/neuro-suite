import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, AlertTriangle, CheckCircle, Settings, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

export default function HRAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [thresholds, setThresholds] = useState<AlertThresholds>({
    highStressPercent: 30,
    lowHRVThreshold: 30,
    consecutiveHighDays: 3,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

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
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (!scans || scans.length === 0) {
        setLoading(false);
        return;
      }

      const generatedAlerts: Alert[] = [];
      const total = scans.length;
      const highCount = scans.filter(s => s.stress_level === 'high').length;
      const highPercent = (highCount / total) * 100;

      // Alert 1: High stress threshold exceeded
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

      // Alert 2: Low HRV detected
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

      // Alert 3: Consecutive high stress days
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
        if (dayHighPercent > 0.5) {
          consecutiveHigh++;
        } else {
          break;
        }
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

      // Alert 4: Trend analysis
      if (scans.length >= 4) {
        const half = Math.floor(scans.length / 2);
        const recentHigh = scans.slice(0, half).filter(s => s.stress_level === 'high').length / half;
        const olderHigh = scans.slice(half).filter(s => s.stress_level === 'high').length / (scans.length - half);

        if (recentHigh > olderHigh * 1.5) {
          generatedAlerts.push({
            id: 'trend_worsening',
            type: 'warning',
            title: '📈 Tendência de Piora Detectada',
            description: `O estresse alto aumentou ${Math.round((recentHigh - olderHigh) * 100)}% na semana recente comparado ao período anterior.`,
            timestamp: new Date(),
            acknowledged: false,
          });
        }

        if (recentHigh < olderHigh * 0.5 && olderHigh > 0) {
          generatedAlerts.push({
            id: 'trend_improving',
            type: 'info',
            title: '✅ Tendência de Melhora',
            description: `O estresse alto reduziu significativamente. As intervenções estão funcionando!`,
            timestamp: new Date(),
            acknowledged: false,
          });
        }
      }

      // Alert 5: No recent scans
      if (scans.length < 3) {
        generatedAlerts.push({
          id: 'low_engagement',
          type: 'info',
          title: '📊 Baixo Engajamento',
          description: `Apenas ${scans.length} scans nos últimos 7 dias. Incentive o uso regular para dados mais confiáveis.`,
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

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    toast({ title: 'Alerta reconhecido', description: 'O alerta foi marcado como visto.' });
  };

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-500' };
      case 'warning':
        return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: 'text-yellow-500' };
      case 'info':
        return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-500' };
    }
  };

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

  const criticalCount = alerts.filter(a => a.type === 'critical' && !a.acknowledged).length;
  const warningCount = alerts.filter(a => a.type === 'warning' && !a.acknowledged).length;

  return (
    <div className="space-y-6">
      <Card className="shadow-soft border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Alertas Inteligentes — RH
                {criticalCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                    {criticalCount}
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full font-bold">
                    {warningCount}
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Alertas automáticos baseados em thresholds de estresse e HRV
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Settings Panel */}
          {showSettings && (
            <Card className="bg-muted/30 border-muted">
              <CardContent className="p-4 space-y-4">
                <p className="text-sm font-semibold">⚙️ Configurar Limites de Alerta</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="highStress" className="text-xs">% Estresse Alto Máximo</Label>
                    <Input
                      id="highStress"
                      type="number"
                      value={thresholds.highStressPercent}
                      onChange={(e) => setThresholds({ ...thresholds, highStressPercent: Number(e.target.value) || 30 })}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowHRV" className="text-xs">HRV Mínimo (ms)</Label>
                    <Input
                      id="lowHRV"
                      type="number"
                      value={thresholds.lowHRVThreshold}
                      onChange={(e) => setThresholds({ ...thresholds, lowHRVThreshold: Number(e.target.value) || 30 })}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consecutiveDays" className="text-xs">Dias Consecutivos Alto</Label>
                    <Input
                      id="consecutiveDays"
                      type="number"
                      value={thresholds.consecutiveHighDays}
                      onChange={(e) => setThresholds({ ...thresholds, consecutiveHighDays: Number(e.target.value) || 3 })}
                      className="h-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alerts */}
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-green-600">Tudo OK! 🎉</p>
              <p className="text-xs text-muted-foreground">Nenhum alerta ativo. Métricas dentro dos limites.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts
                .sort((a, b) => {
                  const priority = { critical: 0, warning: 1, info: 2 };
                  return priority[a.type] - priority[b.type];
                })
                .map((alert) => {
                  const styles = getAlertStyles(alert.type);
                  return (
                    <Card
                      key={alert.id}
                      className={`${styles.bg} ${styles.border} border ${alert.acknowledged ? 'opacity-50' : ''}`}
                    >
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0 text-xs"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
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
    </div>
  );
}
