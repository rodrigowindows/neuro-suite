import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, FileText, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useConnectionMode } from '@/hooks/useConnectionMode';
import { useI18n } from '@/i18n';

interface BurnoutPrediction {
  riskScore: number;
  riskLevel: string;
  prediction: string;
  factors: string[];
  recommendation: string;
  timeframe: string;
}

interface WeeklySummary {
  headline: string;
  highlights: string[];
  concerns: string[];
  actions: string[];
  wellnessScore: number;
  complianceStatus: string;
  executiveSummary: string;
}

interface SentimentResult {
  overallSentiment: string;
  sentimentScore: number;
  emotions: string[];
  themes: string[];
  engagementLevel: string;
  insight: string;
}

interface MessageItem {
  role?: string;
  content?: string;
}

export default function AIInsightsDashboard() {
  const { t } = useI18n();
  const [burnout, setBurnout] = useState<BurnoutPrediction | null>(null);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { isAutonomous } = useConnectionMode();
  const { toast } = useToast();

  const getStressData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error(t('insights.ai.error.unauthenticated'));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: scans } = await supabase
      .from('stress_scans')
      .select('stress_level, hrv_value, created_at')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(200);

    if (!scans || scans.length === 0) throw new Error(t('insights.ai.error.insufficientData'));

    const total = scans.length;
    const low = scans.filter(s => s.stress_level === 'low').length;
    const moderate = scans.filter(s => s.stress_level === 'moderate').length;
    const high = scans.filter(s => s.stress_level === 'high').length;

    const hrvValues = scans.filter(s => s.hrv_value).map(s => Number(s.hrv_value));
    const avgHRV = hrvValues.length > 0 ? Math.round(hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length) : 0;

    // Trend
    const half = Math.floor(total / 2);
    const recentHigh = scans.slice(0, half).filter(s => s.stress_level === 'high').length / half;
    const olderHigh = scans.slice(half).filter(s => s.stress_level === 'high').length / (total - half);
    const trend = recentHigh > olderHigh * 1.2 ? 'piorando' : recentHigh < olderHigh * 0.8 ? 'melhorando' : 'estável';

    // Consecutive high days
    const scansByDay = new Map<string, string[]>();
    scans.forEach(s => {
      const day = new Date(s.created_at!).toISOString().split('T')[0];
      if (!scansByDay.has(day)) scansByDay.set(day, []);
      scansByDay.get(day)!.push(s.stress_level);
    });
    let consecutiveHighDays = 0;
    for (const day of Array.from(scansByDay.keys()).sort().reverse()) {
      const dayScans = scansByDay.get(day)!;
      if (dayScans.filter(s => s === 'high').length / dayScans.length > 0.5) {
        consecutiveHighDays++;
      } else break;
    }

    const { data: progress } = await supabase
      .from('user_progress')
      .select('current_streak')
      .eq('user_id', user.id)
      .single();

    return {
      totalScans: total,
      lowPercent: Math.round((low / total) * 100),
      moderatePercent: Math.round((moderate / total) * 100),
      highPercent: Math.round((high / total) * 100),
      avgHRV,
      trend,
      consecutiveHighDays,
      currentStreak: progress?.current_streak || 0,
      scansPerDay: Math.round(total / 7 * 10) / 10,
    };
  };

  const callAI = async (type: string, data: Record<string, unknown>) => {
    if (isAutonomous) {
      if (type === 'burnout_prediction') {
        const highPercent = typeof data.highPercent === 'number' ? data.highPercent : 20;
        const consecutiveHighDays = typeof data.consecutiveHighDays === 'number' ? data.consecutiveHighDays : 0;
        return {
          riskScore: Math.min(100, Math.round(highPercent * 1.2)),
          riskLevel: consecutiveHighDays >= 2 ? 'high' : highPercent > 30 ? 'moderate' : 'low',
          prediction: 'Gerado localmente (regras fixas, sem IA em nuvem): Análise de tendência baseada em contagem de scans com estresse elevado.',
          factors: ['Fadiga operacional identificada nos registros locais'],
          recommendation: 'Gerado localmente (regras fixas, sem IA em nuvem): Priorize hidratação e pausas guiadas 4-7-8.',
          timeframe: 'Próximos 7 dias',
        };
      }
      if (type === 'weekly_summary') {
        return {
          narrative: 'Gerado localmente (regras fixas, sem IA em nuvem): Resumo semanal sintetizado a partir de medições locais de prontidão e HRV.',
          highlights: ['Medições consistentes com protocolos de prontidão'],
          keyInsight: 'Gerado localmente (regras fixas, sem IA em nuvem): Estabilidade observada nos dados locais.',
          recommendations: ['Manter rotina de contramedidas e hidratação.'],
        };
      }
      if (type === 'sentiment_analysis') {
        return {
          overallSentiment: 'neutral',
          score: 50,
          summary: 'Gerado localmente (regras fixas, sem IA em nuvem): Sentimento monitorado via regras fixas.',
          concerns: [],
          recommendations: ['Continuar monitoramento regular.'],
        };
      }
      return {
        summary: 'Gerado localmente (regras fixas, sem IA em nuvem)',
      };
    }

    const { data: result, error } = await supabase.functions.invoke('ai-insights', {
      body: { type, data },
    });
    if (error) throw error;
    if (result?.error) throw new Error(result.error);
    return result.result;
  };

  const runBurnoutPrediction = async () => {
    setLoading(prev => ({ ...prev, burnout: true }));
    try {
      const data = await getStressData();
      const result = await callAI('burnout_prediction', data);
      setBurnout(result);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro';
      toast({ title: t('insights.ai.toast.error'), description: message, variant: 'destructive' });
    } finally {
      setLoading(prev => ({ ...prev, burnout: false }));
    }
  };

  const runWeeklySummary = async () => {
    setLoading(prev => ({ ...prev, summary: true }));
    try {
      const data = await getStressData();
      const result = await callAI('weekly_summary', data);
      setSummary(result);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro';
      toast({ title: t('insights.ai.toast.error'), description: message, variant: 'destructive' });
    } finally {
      setLoading(prev => ({ ...prev, summary: false }));
    }
  };

  const runSentimentAnalysis = async () => {
    setLoading(prev => ({ ...prev, sentiment: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t('insights.ai.error.unauthenticated'));

      const { data: conversations } = await supabase
        .from('coach_conversations')
        .select('messages')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (!conversations || conversations.length === 0) throw new Error(t('insights.ai.error.noConversations'));

      const allUserMessages = conversations.flatMap(c => {
        const msgs = Array.isArray(c.messages) ? (c.messages as MessageItem[]) : [];
        return msgs.filter(m => m.role === 'user');
      });
      if (allUserMessages.length === 0) throw new Error(t('insights.ai.error.noUserMessages'));

      const result = await callAI('sentiment_analysis', { messages: allUserMessages });
      setSentiment(result);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro';
      toast({ title: t('insights.ai.toast.error'), description: message, variant: 'destructive' });
    } finally {
      setLoading(prev => ({ ...prev, sentiment: false }));
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500';
      case 'neutral': return 'text-blue-500';
      case 'negative': return 'text-red-500';
      case 'mixed': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {t('insights.ai.title')}
          </CardTitle>
          <CardDescription>
            {t('insights.ai.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button onClick={runBurnoutPrediction} disabled={loading.burnout} variant="outline" className="h-auto py-3 flex-col gap-1">
              {loading.burnout ? <Loader2 className="h-5 w-5 animate-spin" /> : <TrendingUp className="h-5 w-5 text-orange-500" />}
              <span className="text-xs font-semibold">{t('insights.ai.btn.burnout')}</span>
            </Button>
            <Button onClick={runWeeklySummary} disabled={loading.summary} variant="outline" className="h-auto py-3 flex-col gap-1">
              {loading.summary ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5 text-blue-500" />}
              <span className="text-xs font-semibold">{t('insights.ai.btn.weeklySummary')}</span>
            </Button>
            <Button onClick={runSentimentAnalysis} disabled={loading.sentiment} variant="outline" className="h-auto py-3 flex-col gap-1">
              {loading.sentiment ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="h-5 w-5 text-purple-500" />}
              <span className="text-xs font-semibold">{t('insights.ai.btn.sentiment')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Burnout Prediction Result */}
      {burnout && (
        <Card className="shadow-soft border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              {t('insights.ai.burnout.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold" style={{ color: burnout.riskScore > 70 ? 'hsl(var(--destructive))' : burnout.riskScore > 40 ? 'hsl(var(--warning))' : 'hsl(var(--success))' }}>
                  {burnout.riskScore}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase">{t('insights.ai.burnout.riskScoreLabel')}</p>
              </div>
              <div className="flex-1">
                <p className={`font-bold ${getRiskColor(burnout.riskLevel)}`}>
                  {t('insights.ai.burnout.riskLabel', {
                    level: burnout.riskLevel === 'critical'
                      ? t('insights.ai.risk.critical')
                      : burnout.riskLevel === 'high'
                      ? t('insights.ai.risk.high')
                      : burnout.riskLevel === 'moderate'
                      ? t('insights.ai.risk.moderate')
                      : t('insights.ai.risk.low'),
                  })}
                </p>
                <p className="text-sm text-muted-foreground">{burnout.prediction}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold">{t('insights.ai.burnout.factorsTitle')}</p>
              {burnout.factors?.map((f, i) => (
                <p key={i} className="text-xs text-muted-foreground pl-3">• {f}</p>
              ))}
            </div>

            <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-xs font-semibold text-accent mb-1">{t('insights.ai.burnout.recommendationTitle')}</p>
              <p className="text-xs text-muted-foreground">{burnout.recommendation}</p>
            </div>

            <p className="text-[10px] text-muted-foreground">{t('insights.ai.burnout.timeframe', { timeframe: burnout.timeframe })}</p>
          </CardContent>
        </Card>
      )}

      {/* Weekly Summary Result */}
      {summary && (
        <Card className="shadow-soft border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-blue-500" />
              {t('insights.ai.summary.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="font-bold text-sm">{summary.headline}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-secondary/10 rounded-lg">
                <p className="text-3xl font-bold text-secondary">{summary.wellnessScore}</p>
                <p className="text-[10px] text-muted-foreground">{t('insights.ai.summary.wellnessScoreLabel')}</p>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <p className={`text-sm font-bold ${summary.complianceStatus === 'compliant' ? 'text-green-500' : summary.complianceStatus === 'attention' ? 'text-yellow-500' : 'text-red-500'}`}>
                  {summary.complianceStatus === 'compliant'
                    ? t('insights.ai.summary.status.compliant')
                    : summary.complianceStatus === 'attention'
                    ? t('insights.ai.summary.status.attention')
                    : t('insights.ai.summary.status.nonCompliant')}
                </p>
                <p className="text-[10px] text-muted-foreground">{t('insights.ai.summary.complianceLabel')}</p>
              </div>
            </div>

            {summary.highlights?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold">{t('insights.ai.summary.highlightsTitle')}</p>
                {summary.highlights.map((h, i) => (
                  <p key={i} className="text-xs text-muted-foreground pl-3">• {h}</p>
                ))}
              </div>
            )}

            {summary.concerns?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold">{t('insights.ai.summary.concernsTitle')}</p>
                {summary.concerns.map((c, i) => (
                  <p key={i} className="text-xs text-muted-foreground pl-3">• {c}</p>
                ))}
              </div>
            )}

            {summary.actions?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold">{t('insights.ai.summary.actionsTitle')}</p>
                {summary.actions.map((a, i) => (
                  <p key={i} className="text-xs text-muted-foreground pl-3">{i + 1}. {a}</p>
                ))}
              </div>
            )}

            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs font-semibold mb-1">{t('insights.ai.summary.executiveSummaryTitle')}</p>
              <p className="text-xs text-muted-foreground">{summary.executiveSummary}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sentiment Analysis Result */}
      {sentiment && (
        <Card className="shadow-soft border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              {t('insights.ai.sentiment.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className={`text-3xl font-bold ${getSentimentColor(sentiment.overallSentiment)}`}>
                  {sentiment.sentimentScore > 0 ? '+' : ''}{sentiment.sentimentScore}
                </p>
                <p className="text-[10px] text-muted-foreground">{t('insights.ai.sentiment.scoreLabel')}</p>
              </div>
              <div>
                <p className={`font-bold ${getSentimentColor(sentiment.overallSentiment)}`}>
                  {sentiment.overallSentiment === 'positive'
                    ? t('insights.ai.sentiment.type.positive')
                    : sentiment.overallSentiment === 'negative'
                    ? t('insights.ai.sentiment.type.negative')
                    : sentiment.overallSentiment === 'mixed'
                    ? t('insights.ai.sentiment.type.mixed')
                    : t('insights.ai.sentiment.type.neutral')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('insights.ai.sentiment.engagement', {
                    level: sentiment.engagementLevel === 'high'
                      ? t('insights.ai.engagement.high')
                      : sentiment.engagementLevel === 'medium'
                      ? t('insights.ai.engagement.medium')
                      : t('insights.ai.engagement.low'),
                  })}
                </p>
              </div>
            </div>

            {sentiment.emotions?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {sentiment.emotions.map((e, i) => (
                  <span key={i} className="px-2 py-1 bg-purple-500/10 text-purple-600 text-[10px] rounded-full font-medium">{e}</span>
                ))}
              </div>
            )}

            {sentiment.themes?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold">{t('insights.ai.sentiment.themesTitle')}</p>
                {sentiment.themes.map((tItem, i) => (
                  <p key={i} className="text-xs text-muted-foreground pl-3">• {tItem}</p>
                ))}
              </div>
            )}

            <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
              <p className="text-xs font-semibold mb-1"><Sparkles className="h-3 w-3 inline text-purple-500" /> {t('insights.ai.sentiment.insightTitle')}</p>
              <p className="text-xs text-muted-foreground">{sentiment.insight}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!burnout && !summary && !sentiment && (
        <div className="text-center py-8 text-muted-foreground">
          <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t('insights.ai.empty.title')}</p>
          <p className="text-xs mt-1">{t('insights.ai.empty.subtitle')}</p>
        </div>
      )}
    </div>
  );
}
