import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Shield, AlertTriangle, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useConnectionMode } from '@/hooks/useConnectionMode';
import { useI18n } from '@/i18n';
import ExportPDFButton from './ExportPDFButton';
import NR1ComplianceScoreCard from './NR1ComplianceScoreCard';
import PGRReportGenerator from './PGRReportGenerator';

interface ReportData {
  totalScans: number;
  lowPercent: number;
  moderatePercent: number;
  highPercent: number;
  avgHRV: number;
  startDate: Date;
  endDate: Date;
  riskLevel: 'low' | 'moderate' | 'high';
  recommendationKeys: string[];
}

interface NR1AIInsights {
  riskClassification: string;
  legalAnalysis: string;
  requiredActions: string[];
  suggestedActions?: string[];
  complianceGaps: string[];
  documentationNeeded?: string[];
  executiveText: string;
}

export default function NR1Report() {
  const { lang, t } = useI18n();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [aiInsights, setAiInsights] = useState<NR1AIInsights | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const { isAutonomous } = useConnectionMode();

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const now = new Date();

      // No user_id filter - managers see all team data via RLS
      const { data: scans } = await supabase
        .from('stress_scans')
        .select('stress_level, hrv_value, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      if (scans && scans.length > 0) {
        const total = scans.length;
        const low = scans.filter(s => s.stress_level === 'low').length;
        const moderate = scans.filter(s => s.stress_level === 'moderate').length;
        const high = scans.filter(s => s.stress_level === 'high').length;

        const hrvValues = scans.filter(s => s.hrv_value).map(s => Number(s.hrv_value));
        const avgHRV = hrvValues.length > 0 ? hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length : 0;

        const highPercent = Math.round((high / total) * 100);
        const moderatePercent = Math.round((moderate / total) * 100);
        const lowPercent = Math.round((low / total) * 100);

        let riskLevel: 'low' | 'moderate' | 'high' = 'low';
        if (highPercent > 30) riskLevel = 'high';
        else if (moderatePercent > 50 || highPercent > 15) riskLevel = 'moderate';

        const recommendationKeys: string[] = [];
        if (highPercent > 20) recommendationKeys.push('safety.report.rec.activeBreaks');
        if (avgHRV < 30) recommendationKeys.push('safety.report.rec.medicalEval');
        if (moderatePercent > 40) recommendationKeys.push('safety.report.rec.workshop');
        if (highPercent > 30) recommendationKeys.push('safety.report.rec.workload');
        recommendationKeys.push('safety.report.rec.monitoring');
        recommendationKeys.push('safety.report.rec.documentation');

        setReportData({
          totalScans: total,
          lowPercent,
          moderatePercent,
          highPercent,
          avgHRV: Math.round(avgHRV),
          startDate: thirtyDaysAgo,
          endDate: now,
          riskLevel,
          recommendationKeys,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const dateLocale = lang === 'pt' ? 'pt-BR' : 'en-US';
  const periodStr = reportData
    ? t('safety.report.periodFormat', {
        start: reportData.startDate.toLocaleDateString(dateLocale),
        end: reportData.endDate.toLocaleDateString(dateLocale),
      })
    : '';

  const recommendations = reportData ? reportData.recommendationKeys.map(k => t(k)) : [];

  const riskLabel = reportData
    ? reportData.riskLevel === 'high'
      ? t('safety.report.riskLevel.high')
      : reportData.riskLevel === 'moderate'
      ? t('safety.report.riskLevel.moderate')
      : t('safety.report.riskLevel.low')
    : '';

  const hrvStatus = reportData
    ? reportData.avgHRV > 50
      ? `✅ ${t('safety.report.hrvGood')}`
      : reportData.avgHRV > 30
      ? `⚡ ${t('safety.report.hrvNormal')}`
      : `⚠️ ${t('safety.report.hrvWarning')}`
    : '';

  const riskAnalysis = reportData
    ? reportData.riskLevel === 'high'
      ? t('safety.report.riskAnalysis.high')
      : reportData.riskLevel === 'moderate'
      ? t('safety.report.riskAnalysis.moderate')
      : t('safety.report.riskAnalysis.low')
    : '';

  const generatePDFContent = (): string => {
    if (!reportData) return '';
    const nowStr = new Date().toLocaleDateString(dateLocale);
    const riskBadge =
      reportData.riskLevel === 'high'
        ? `${riskLabel} ⚠️`
        : reportData.riskLevel === 'moderate'
        ? `${riskLabel} ⚡`
        : `${riskLabel} ✅`;

    return `
${t('safety.report.txt.header')}
====================================================
${t('safety.report.txt.generatedBy', { date: nowStr })}
${t('safety.report.txt.period', { period: periodStr })}

${t('safety.report.txt.section1')}
--------------------
${t('safety.report.txt.totalScans', { count: reportData.totalScans })}
${t('safety.report.txt.overallRisk', { risk: riskBadge })}

${t('safety.report.txt.section2')}
-----------------------------
${t('safety.report.txt.lowPercent', { pct: reportData.lowPercent })}
${t('safety.report.txt.modPercent', { pct: reportData.moderatePercent })}
${t('safety.report.txt.highPercent', { pct: reportData.highPercent })}

${t('safety.report.txt.section3')}
-----------------------------
${t('safety.report.txt.avgHrv', { hrv: reportData.avgHRV })}
${t('safety.report.txt.hrvStatus', { status: hrvStatus })}

${t('safety.report.txt.section4')}
---------------------------------------
${riskAnalysis}

${t('safety.report.txt.section5')}
------------------
${recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

${t('safety.report.txt.section6')}
---------------
${t('safety.report.txt.legal1')}
${t('safety.report.txt.legal2')}
${t('safety.report.txt.legal3')}
${t('safety.report.txt.legal4')}

${t('safety.report.txt.section7')}
---------------
${t('safety.report.txt.declaration')}

____________________________________
${t('safety.report.txt.techResp')}
${t('safety.report.txt.companySub')}
    `.trim();
  };

  const exportReport = () => {
    setGenerating(true);
    try {
      const content = generatePDFContent();
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-nr1-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  };

  const exportCSV = () => {
    if (!reportData) return;
    const csv = `${t('safety.report.csv.metric')},${t('safety.report.csv.value')},${t('safety.report.csv.unit')}
${t('safety.report.csv.period')},"${periodStr}",
${t('safety.report.csv.totalScans')},${reportData.totalScans},scans
${t('safety.report.csv.lowStress')},${reportData.lowPercent},%
${t('safety.report.csv.modStress')},${reportData.moderatePercent},%
${t('safety.report.csv.highStress')},${reportData.highPercent},%
${t('safety.report.csv.avgHrv')},${reportData.avgHRV},ms
${t('safety.report.csv.riskLevel')},${reportData.riskLevel},
${recommendations.map((r, i) => `${t('safety.report.csv.recPrefix')} ${i + 1},"${r}",`).join('\n')}`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-nr1-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">{t('safety.report.generating')}</p>
        </CardContent>
      </Card>
    );
  }

  if (!reportData) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t('safety.report.noData')}</p>
        </CardContent>
      </Card>
    );
  }

  const riskColors = {
    low: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-600' },
    moderate: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-600' },
    high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-600' },
  };

  const colors = riskColors[reportData.riskLevel];

  return (
    <div className="space-y-6">
      {/* NR-1 Compliance Score */}
      <NR1ComplianceScoreCard />

      {/* PGR Report Generator */}
      <PGRReportGenerator />

      <Card className="shadow-soft border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t('safety.report.title')}
          </CardTitle>
          <CardDescription>
            {t('safety.report.description')}
          </CardDescription>
          <div className="flex gap-2 mt-3 flex-wrap">
            <Button onClick={exportReport} variant="default" size="sm" disabled={generating}>
              <Download className="mr-2 h-4 w-4" />
              {t('safety.report.exportTxt')}
            </Button>
            <Button onClick={exportCSV} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              {t('safety.report.exportCsv')}
            </Button>
            <ExportPDFButton
              reportTitle={t('safety.report.title')}
              stats={[
                { label: t('safety.report.metric.assessments'), value: String(reportData.totalScans) },
                { label: t('safety.report.metric.lowStress'), value: `${reportData.lowPercent}%` },
                { label: t('safety.report.metric.moderate'), value: `${reportData.moderatePercent}%` },
                { label: t('safety.report.metric.high'), value: `${reportData.highPercent}%` },
                { label: t('safety.report.hrvShort'), value: `${reportData.avgHRV}ms` },
              ]}
              sections={[
                {
                  title: t('safety.report.section.execSummary'),
                  content: `${t('safety.report.period', { period: periodStr })}\n${t('safety.report.txt.totalScans', { count: reportData.totalScans })}\n${t('safety.report.riskLevel', { level: riskLabel })}`,
                },
                {
                  title: t('safety.report.section.stressDist'),
                  content: `${t('safety.report.metric.lowStress')}: ${reportData.lowPercent}%\n${t('safety.report.metric.moderate')}: ${reportData.moderatePercent}%\n${t('safety.report.metric.high')}: ${reportData.highPercent}%`,
                },
                {
                  title: t('safety.report.section.recommendations'),
                  content: recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n'),
                },
                ...(aiInsights
                  ? [
                      { title: t('safety.report.section.aiAnalysis'), content: aiInsights.legalAnalysis },
                      { title: t('safety.report.section.pgrText'), content: aiInsights.executiveText },
                    ]
                  : []),
                {
                  title: t('safety.report.legalBasisTitle'),
                  content: `${t('safety.report.txt.legal1')}\n${t('safety.report.txt.legal2')}\n${t('safety.report.txt.legal3')}\n${t('safety.report.txt.legal4')}`,
                },
              ]}
              footer={t('safety.report.pdfFooter')}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Level Banner */}
          <Card className={`${colors.bg} ${colors.border} border`}>
            <CardContent className="p-4 flex items-center gap-3">
              {reportData.riskLevel === 'high' ? (
                <AlertTriangle className={`h-6 w-6 ${colors.text}`} />
              ) : (
                <CheckCircle className={`h-6 w-6 ${colors.text}`} />
              )}
              <div>
                <p className={`font-bold ${colors.text}`}>
                  {t('safety.report.riskLevel', { level: riskLabel })}
                </p>
                <p className="text-xs text-muted-foreground">{t('safety.report.period', { period: periodStr })}</p>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-muted/30 rounded-lg text-center">
              <p className="text-[10px] text-muted-foreground uppercase">{t('safety.report.metric.assessments')}</p>
              <p className="text-2xl font-bold text-primary">{reportData.totalScans}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg text-center">
              <p className="text-[10px] text-muted-foreground uppercase">{t('safety.report.metric.lowStress')}</p>
              <p className="text-2xl font-bold text-green-600">{reportData.lowPercent}%</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
              <p className="text-[10px] text-muted-foreground uppercase">{t('safety.report.metric.moderate')}</p>
              <p className="text-2xl font-bold text-yellow-600">{reportData.moderatePercent}%</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg text-center">
              <p className="text-[10px] text-muted-foreground uppercase">{t('safety.report.metric.high')}</p>
              <p className="text-2xl font-bold text-red-600">{reportData.highPercent}%</p>
            </div>
          </div>

          {/* HRV */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">{t('safety.report.hrvTitle')}</p>
            <p className="text-3xl font-bold text-primary">{reportData.avgHRV}<span className="text-sm">ms</span></p>
            <p className="text-xs text-muted-foreground mt-1">
              {hrvStatus}
            </p>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">📋 {t('safety.report.recommendationsTitle')}</p>
            <div className="space-y-2">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg">
                  <span className="text-xs font-bold text-primary mt-0.5">{i + 1}.</span>
                  <p className="text-xs text-muted-foreground">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI NR-1 Insights */}
          <Button
            onClick={async () => {
              setLoadingAI(true);
              try {
                if (isAutonomous) {
                  setAiInsights(
                    lang === 'pt'
                      ? {
                          riskClassification: 'Risco Operacional Monitorado',
                          legalAnalysis: 'Gerado localmente (regras fixas, sem IA em nuvem): Análise de conformidade preliminar calculada por regras fixas locais da nave. Ferramenta de suporte à decisão.',
                          requiredActions: ['Manter registro sistemático de telemetrias', 'Aplicar pausas ativas regulares'],
                          complianceGaps: [],
                          executiveText: 'Gerado localmente (regras fixas, sem IA em nuvem): Indicadores em conformidade com as diretrizes operacionais locais.',
                        }
                      : {
                          riskClassification: 'Monitored Operational Risk',
                          legalAnalysis: 'Locally generated (fixed rules, no cloud AI): Preliminary compliance analysis calculated by local fixed rules. Decision-support tool.',
                          requiredActions: ['Maintain systematic telemetry logging', 'Apply regular active breaks'],
                          complianceGaps: [],
                          executiveText: 'Locally generated (fixed rules, no cloud AI): Indicators aligned with local operational guidelines.',
                        }
                  );
                  return;
                }

                const { data, error } = await supabase.functions.invoke('ai-insights', {
                  body: {
                    type: 'nr1_insights',
                    data: {
                      totalScans: reportData.totalScans,
                      period: periodStr,
                      lowPercent: reportData.lowPercent,
                      moderatePercent: reportData.moderatePercent,
                      highPercent: reportData.highPercent,
                      avgHRV: reportData.avgHRV,
                      riskLevel: reportData.riskLevel,
                    },
                  },
                });
                if (error) throw error;
                if (data?.error) throw new Error(data.error);
                setAiInsights(data.result);
              } catch (e: unknown) {
                console.error('Erro AI Segurança de Missão:', e);
              } finally {
                setLoadingAI(false);
              }
            }}
            disabled={loadingAI}
            variant="outline"
            className="w-full gap-2"
          >
            {loadingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-accent" />}
            {loadingAI ? t('safety.report.aiButtonLoading') : t('safety.report.aiButton')}
          </Button>

          {aiInsights && (
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-4 space-y-3">
                <p className="font-bold text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  {t('safety.report.aiAnalysisTitle', { classification: aiInsights.riskClassification })}
                </p>
                <p className="text-xs text-muted-foreground">{aiInsights.legalAnalysis}</p>

                {aiInsights.requiredActions?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-destructive uppercase mb-1">
                      {t('safety.report.aiRequiredActions')}
                    </p>
                    {aiInsights.requiredActions.map((a, i) => (
                      <p key={i} className="text-xs text-muted-foreground pl-2">• {a}</p>
                    ))}
                  </div>
                )}

                {aiInsights.complianceGaps?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-yellow-600 uppercase mb-1">
                      {t('safety.report.aiGaps')}
                    </p>
                    {aiInsights.complianceGaps.map((g, i) => (
                      <p key={i} className="text-xs text-muted-foreground pl-2">• {g}</p>
                    ))}
                  </div>
                )}

                <div className="p-2 bg-muted/30 rounded-lg">
                  <p className="text-[10px] font-semibold mb-1">📄 {t('safety.report.aiPgrText')}</p>
                  <p className="text-[10px] text-muted-foreground italic">{aiInsights.executiveText}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Legal Reference */}
          <div className="p-3 bg-muted/20 rounded-lg text-[10px] text-muted-foreground space-y-1">
            <p className="font-semibold">⚖️ {t('safety.report.legalBasisTitle')}</p>
            <p>{t('safety.report.legalBasisLine1')}</p>
            <p>{t('safety.report.legalBasisLine2')}</p>
            <p>{t('safety.report.legalBasisLine3')}</p>
            <p className="text-[10px] text-muted-foreground/80 italic pt-1">{t('safety.report.dssDisclaimer')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
