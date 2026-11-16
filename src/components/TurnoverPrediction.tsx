import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserMinus, Loader2, AlertTriangle, TrendingDown, DollarSign, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useConnectionMode } from '@/hooks/useConnectionMode';
import { useI18n } from '@/i18n';

interface Employee {
  id: string;
  riskScore: number;
  riskLevel: string;
  factors: string[];
  recommendation: string;
  signals: string[];
}

interface RetentionAction {
  action: string;
  priority: string;
  impact: string;
}

interface TurnoverResult {
  overallRisk: string;
  overallScore: number;
  summary: string;
  employees: Employee[];
  topRisks: string[];
  retentionActions: RetentionAction[];
  costEstimate: string;
}

export default function TurnoverPrediction() {
  const { t } = useI18n();
  const [result, setResult] = useState<TurnoverResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAutonomous } = useConnectionMode();
  const { toast } = useToast();

  const analyze = async () => {
    setLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: scans } = await supabase
        .from('stress_scans')
        .select('stress_level, hrv_value, created_at, user_id')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

      if (!scans || scans.length === 0) {
        toast({
          title: t('command.turnover.toast.noDataTitle'),
          description: t('command.turnover.toast.noDataDesc'),
          variant: 'destructive',
        });
        return;
      }

      // Aggregate per employee
      const byUser = new Map<string, typeof scans>();
      scans.forEach(s => {
        if (!byUser.has(s.user_id)) byUser.set(s.user_id, []);
        byUser.get(s.user_id)!.push(s);
      });

      const now = new Date();
      const employees = Array.from(byUser.entries()).map(([userId, userScans], idx) => {
        const total = userScans.length;
        const high = userScans.filter(s => s.stress_level === 'high').length;
        const moderate = userScans.filter(s => s.stress_level === 'moderate').length;
        const low = userScans.filter(s => s.stress_level === 'low').length;
        const hrvValues = userScans.filter(s => s.hrv_value).map(s => Number(s.hrv_value));
        const avgHRV = hrvValues.length > 0 ? Math.round(hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length) : 0;

        const uniqueDays = new Set(userScans.map(s => new Date(s.created_at!).toISOString().split('T')[0]));
        const lastScan = new Date(userScans[0].created_at!);
        const daysSinceLast = Math.round((now.getTime() - lastScan.getTime()) / (1000 * 60 * 60 * 24));

        // Trend: compare first half vs second half high%
        const half = Math.floor(total / 2);
        const recentHigh = total > 1 ? userScans.slice(0, half).filter(s => s.stress_level === 'high').length / Math.max(half, 1) : 0;
        const olderHigh = total > 1 ? userScans.slice(half).filter(s => s.stress_level === 'high').length / Math.max(total - half, 1) : 0;
        const trend = recentHigh > olderHigh * 1.2
          ? t('command.turnover.trend.worsening')
          : recentHigh < olderHigh * 0.8
          ? t('command.turnover.trend.improving')
          : t('command.turnover.trend.stable');

        return {
          id: `COL-${String(idx + 1).padStart(3, '0')}`,
          totalScans: total,
          highPercent: Math.round((high / total) * 100),
          moderatePercent: Math.round((moderate / total) * 100),
          lowPercent: Math.round((low / total) * 100),
          avgHRV,
          activeDays: uniqueDays.size,
          lastScanDaysAgo: daysSinceLast,
          trend,
        };
      });

      const totalEmployees = employees.length;
      const companyHighPercent = Math.round(employees.reduce((a, e) => a + e.highPercent, 0) / totalEmployees);

      if (isAutonomous) {
        const localResult: TurnoverResult = {
          overallRisk: companyHighPercent > 40 ? 'high' : companyHighPercent > 20 ? 'moderate' : 'low',
          overallScore: companyHighPercent,
          summary: t('command.turnover.autonomous.summary'),
          topRisks: [t('command.turnover.autonomous.topRisk')],
          costEstimate: t('command.turnover.autonomous.costEstimate'),
          retentionActions: [
            {
              action: t('command.turnover.autonomous.action'),
              priority: 'high',
              impact: t('command.turnover.autonomous.impact'),
            },
          ],
          employees: employees.map((emp) => ({
            id: emp.id,
            riskScore: emp.highPercent,
            riskLevel: emp.highPercent > 40 ? 'high' : emp.highPercent > 20 ? 'moderate' : 'low',
            factors: [t('command.turnover.autonomous.factor')],
            recommendation: t('command.turnover.autonomous.recommendation'),
            signals: [t('command.turnover.autonomous.signal')],
          })),
        };
        setResult(localResult);
        toast({
          title: t('command.turnover.toast.successTitle'),
          description: t('command.turnover.toast.successDesc'),
        });
        return;
      }

      const { data: aiResult, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          type: 'turnover_prediction',
          data: {
            employees,
            totalEmployees,
            adoptionRate: 100,
            companyHighPercent,
          },
        },
      });

      if (error) throw error;
      if (aiResult?.error) throw new Error(aiResult.error);
      setResult(aiResult.result);
      toast({
        title: t('command.turnover.toast.successTitle'),
        description: t('command.turnover.toast.successDesc'),
      });
    } catch (e: unknown) {
      toast({
        title: t('command.turnover.toast.errorTitle'),
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-orange-500';
      case 'moderate': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-destructive/10 border-destructive/20';
      case 'high': return 'bg-orange-500/10 border-orange-500/20';
      case 'moderate': return 'bg-yellow-500/10 border-yellow-500/20';
      default: return 'bg-green-500/10 border-green-500/20';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical': return t('command.turnover.level.critical');
      case 'high': return t('command.turnover.level.high');
      case 'moderate': return t('command.turnover.level.moderate');
      default: return t('command.turnover.level.low');
    }
  };

  const getPriorityColor = (p: string) => {
    const norm = p?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (norm === 'alta' || norm === 'high') return 'text-destructive';
    if (norm === 'media' || norm === 'medium') return 'text-yellow-600';
    return 'text-green-600';
  };

  const getPriorityLabel = (p: string) => {
    const norm = p?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (norm === 'alta' || norm === 'high') return t('command.turnover.priority.high');
    if (norm === 'media' || norm === 'medium') return t('command.turnover.priority.medium');
    return t('command.turnover.priority.low');
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-primary" />
              {t('command.turnover.title')}
            </CardTitle>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-muted-foreground/30 text-muted-foreground">
              {t('command.turnover.badge')}
            </span>
          </div>
          <CardDescription>
            {t('command.turnover.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={analyze} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingDown className="h-4 w-4" />}
            {loading ? t('command.turnover.btn.analyzing') : t('command.turnover.btn.analyze')}
          </Button>
          {loading && (
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground mt-2">{t('command.turnover.loadingText')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Overall Risk */}
          <Card className={`shadow-soft border ${getRiskBg(result.overallRisk)}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="text-center">
                <p className={`text-4xl font-bold ${getRiskColor(result.overallRisk)}`}>{result.overallScore}</p>
                <p className="text-[10px] text-muted-foreground uppercase">{t('command.turnover.riskScoreLabel')}</p>
              </div>
              <div className="flex-1">
                <p className={`font-bold ${getRiskColor(result.overallRisk)}`}>
                  {t('command.turnover.riskTitle', { level: getRiskLabel(result.overallRisk) })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{result.summary}</p>
              </div>
            </CardContent>
          </Card>

          {/* Cost Estimate */}
          <Card className="shadow-soft">
            <CardContent className="p-4 flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="text-xs font-semibold">💰 {t('command.turnover.costEstimateTitle')}</p>
                <p className="text-xs text-muted-foreground">{result.costEstimate}</p>
              </div>
            </CardContent>
          </Card>

          {/* Top Risks */}
          {result.topRisks?.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  {t('command.turnover.topRisksTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {result.topRisks.map((r, i) => (
                    <p key={i} className="text-xs text-muted-foreground">⚠️ {r}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Employee Risk Table */}
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserMinus className="h-4 w-4 text-primary" />
                {t('command.turnover.employeeRiskTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.employees?.map((emp, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${getRiskBg(emp.riskLevel)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-muted-foreground">{emp.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getRiskColor(emp.riskLevel)} ${getRiskBg(emp.riskLevel)}`}>
                          {getRiskLabel(emp.riskLevel)}
                        </span>
                      </div>
                      <span className={`text-lg font-bold ${getRiskColor(emp.riskLevel)}`}>{emp.riskScore}</span>
                    </div>

                    {emp.signals?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {emp.signals.map((s, j) => (
                          <span key={j} className="text-[10px] px-1.5 py-0.5 bg-muted/50 rounded text-muted-foreground">📍 {s}</span>
                        ))}
                      </div>
                    )}

                    {emp.factors?.length > 0 && (
                      <div className="mb-1.5">
                        {emp.factors.map((f, j) => (
                          <p key={j} className="text-[10px] text-muted-foreground">• {f}</p>
                        ))}
                      </div>
                    )}

                    <p className="text-[10px] text-primary font-medium">💡 {emp.recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Retention Actions */}
          {result.retentionActions?.length > 0 && (
            <Card className="shadow-soft border-accent/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" />
                  {t('command.turnover.retentionPlanTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.retentionActions.map((a, i) => (
                    <div
                      key={i}
                      className="p-3 bg-muted/20 rounded-lg border-l-4"
                      style={{
                        borderLeftColor: (a.priority?.toLowerCase().includes('alt') || a.priority?.toLowerCase() === 'high')
                          ? 'hsl(var(--destructive))'
                          : (a.priority?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === 'media' || a.priority?.toLowerCase() === 'medium')
                          ? '#d97706'
                          : '#16a34a'
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold">{a.action}</p>
                        <span className={`text-[10px] font-bold ${getPriorityColor(a.priority)}`}>
                          {getPriorityLabel(a.priority)}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">📈 {a.impact}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <UserMinus className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t('command.turnover.emptyState.line1')}</p>
          <p className="text-xs mt-1">{t('command.turnover.emptyState.line2')}</p>
        </div>
      )}
    </div>
  );
}
