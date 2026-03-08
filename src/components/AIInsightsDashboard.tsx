import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, FileText, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export default function AIInsightsDashboard() {
  const [burnout, setBurnout] = useState<BurnoutPrediction | null>(null);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const getStressData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: scans } = await supabase
      .from('stress_scans')
      .select('stress_level, hrv_value, created_at')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(200);

    if (!scans || scans.length === 0) throw new Error('Sem dados suficientes. Realize scans primeiro.');

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

  const callAI = async (type: string, data: any) => {
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
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
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
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(prev => ({ ...prev, summary: false }));
    }
  };

  const runSentimentAnalysis = async () => {
    setLoading(prev => ({ ...prev, sentiment: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { data: conversations } = await supabase
        .from('coach_conversations')
        .select('messages')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (!conversations?.messages) throw new Error('Sem conversas para analisar. Use o NeuroCoach primeiro.');

      const userMessages = (conversations.messages as any[]).filter((m: any) => m.role === 'user');
      if (userMessages.length === 0) throw new Error('Sem mensagens do usuário para analisar.');

      const result = await callAI('sentiment_analysis', { messages: userMessages });
      setSentiment(result);
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
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
            Central de Inteligência Artificial
          </CardTitle>
          <CardDescription>
            Análises avançadas com IA para prevenção de burnout, resumos executivos e insights emocionais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button onClick={runBurnoutPrediction} disabled={loading.burnout} variant="outline" className="h-auto py-3 flex-col gap-1">
              {loading.burnout ? <Loader2 className="h-5 w-5 animate-spin" /> : <TrendingUp className="h-5 w-5 text-orange-500" />}
              <span className="text-xs font-semibold">Previsão de Burnout</span>
            </Button>
            <Button onClick={runWeeklySummary} disabled={loading.summary} variant="outline" className="h-auto py-3 flex-col gap-1">
              {loading.summary ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5 text-blue-500" />}
              <span className="text-xs font-semibold">Resumo Semanal</span>
            </Button>
            <Button onClick={runSentimentAnalysis} disabled={loading.sentiment} variant="outline" className="h-auto py-3 flex-col gap-1">
              {loading.sentiment ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="h-5 w-5 text-purple-500" />}
              <span className="text-xs font-semibold">Análise de Sentimento</span>
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
              🧠 Análise Preditiva de Burnout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold" style={{ color: burnout.riskScore > 70 ? 'hsl(var(--destructive))' : burnout.riskScore > 40 ? 'hsl(var(--warning))' : 'hsl(var(--success))' }}>
                  {burnout.riskScore}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase">Risk Score</p>
              </div>
              <div className="flex-1">
                <p className={`font-bold ${getRiskColor(burnout.riskLevel)}`}>
                  Risco: {burnout.riskLevel === 'critical' ? 'CRÍTICO' : burnout.riskLevel === 'high' ? 'ALTO' : burnout.riskLevel === 'moderate' ? 'MODERADO' : 'BAIXO'}
                </p>
                <p className="text-sm text-muted-foreground">{burnout.prediction}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold">⚠️ Fatores de Risco:</p>
              {burnout.factors?.map((f, i) => (
                <p key={i} className="text-xs text-muted-foreground pl-3">• {f}</p>
              ))}
            </div>

            <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-xs font-semibold text-accent mb-1">💡 Recomendação:</p>
              <p className="text-xs text-muted-foreground">{burnout.recommendation}</p>
            </div>

            <p className="text-[10px] text-muted-foreground">⏱️ Horizonte: {burnout.timeframe}</p>
          </CardContent>
        </Card>
      )}

      {/* Weekly Summary Result */}
      {summary && (
        <Card className="shadow-soft border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-blue-500" />
              📊 Resumo Semanal Inteligente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="font-bold text-sm">{summary.headline}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-secondary/10 rounded-lg">
                <p className="text-3xl font-bold text-secondary">{summary.wellnessScore}</p>
                <p className="text-[10px] text-muted-foreground">Wellness Score</p>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <p className={`text-sm font-bold ${summary.complianceStatus === 'compliant' ? 'text-green-500' : summary.complianceStatus === 'attention' ? 'text-yellow-500' : 'text-red-500'}`}>
                  {summary.complianceStatus === 'compliant' ? '✅ Compliance' : summary.complianceStatus === 'attention' ? '⚡ Atenção' : '❌ Não-Compliance'}
                </p>
                <p className="text-[10px] text-muted-foreground">Status NR-1</p>
              </div>
            </div>

            {summary.highlights?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold">✅ Destaques:</p>
                {summary.highlights.map((h, i) => (
                  <p key={i} className="text-xs text-muted-foreground pl-3">• {h}</p>
                ))}
              </div>
            )}

            {summary.concerns?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold">⚠️ Preocupações:</p>
                {summary.concerns.map((c, i) => (
                  <p key={i} className="text-xs text-muted-foreground pl-3">• {c}</p>
                ))}
              </div>
            )}

            {summary.actions?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold">🎯 Ações Recomendadas:</p>
                {summary.actions.map((a, i) => (
                  <p key={i} className="text-xs text-muted-foreground pl-3">{i + 1}. {a}</p>
                ))}
              </div>
            )}

            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs font-semibold mb-1">📋 Resumo Executivo (C-Level):</p>
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
              💬 Análise de Sentimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className={`text-3xl font-bold ${getSentimentColor(sentiment.overallSentiment)}`}>
                  {sentiment.sentimentScore > 0 ? '+' : ''}{sentiment.sentimentScore}
                </p>
                <p className="text-[10px] text-muted-foreground">Score</p>
              </div>
              <div>
                <p className={`font-bold ${getSentimentColor(sentiment.overallSentiment)}`}>
                  {sentiment.overallSentiment === 'positive' ? '😊 Positivo' : sentiment.overallSentiment === 'negative' ? '😟 Negativo' : sentiment.overallSentiment === 'mixed' ? '🤔 Misto' : '😐 Neutro'}
                </p>
                <p className="text-xs text-muted-foreground">Engajamento: {sentiment.engagementLevel === 'high' ? 'Alto' : sentiment.engagementLevel === 'medium' ? 'Médio' : 'Baixo'}</p>
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
                <p className="text-xs font-semibold">🏷️ Temas Identificados:</p>
                {sentiment.themes.map((t, i) => (
                  <p key={i} className="text-xs text-muted-foreground pl-3">• {t}</p>
                ))}
              </div>
            )}

            <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
              <p className="text-xs font-semibold mb-1"><Sparkles className="h-3 w-3 inline text-purple-500" /> Insight:</p>
              <p className="text-xs text-muted-foreground">{sentiment.insight}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!burnout && !summary && !sentiment && (
        <div className="text-center py-8 text-muted-foreground">
          <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Clique em um dos botões acima para gerar análises com IA</p>
          <p className="text-xs mt-1">Requer dados de scans para funcionar</p>
        </div>
      )}
    </div>
  );
}
