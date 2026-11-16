import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, Shield, ClipboardList, Calendar, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useConnectionMode } from '@/hooks/useConnectionMode';
import { useI18n } from '@/i18n';

interface PGRReport {
  titulo: string;
  versao: string;
  identificacaoEmpresa: { nota: string };
  objetivos: string[];
  fundamentacaoLegal: { norma: string; dispositivo: string; descricao: string }[];
  inventarioRiscos: {
    fatoresIdentificados: { fator: string; fonte: string; classificacao: string; populacaoExposta: string; medidasControle: string }[];
    classificacaoGeral: string;
    metodologia: string;
  };
  analiseQuantitativa: {
    resumo: string;
    indicadores: { indicador: string; valor: string; interpretacao: string }[];
  };
  planoAcao: { acao: string; responsavel: string; prazo: string; prioridade: string; indicadorEficacia: string }[];
  cronograma: { fase: string; periodo: string; atividades: string[] }[];
  monitoramento: { frequencia: string; indicadores: string[]; responsavel: string };
  declaracaoLGPD: string;
  conclusao: string;
}

export default function PGRReportGenerator() {
  const { lang, t } = useI18n();
  const [report, setReport] = useState<PGRReport | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAutonomous } = useConnectionMode();
  const { toast } = useToast();

  const generatePGR = async () => {
    setLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const now = new Date();
      const dateLocale = lang === 'pt' ? 'pt-BR' : 'en-US';

      const { data: scans } = await supabase
        .from('stress_scans')
        .select('stress_level, hrv_value, created_at, user_id')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

      if (!scans || scans.length === 0) {
        toast({
          title: t('safety.pgr.toast.noDataTitle'),
          description: t('safety.pgr.toast.noDataDesc'),
          variant: 'destructive',
        });
        return;
      }

      const total = scans.length;
      const uniqueUsers = new Set(scans.map(s => s.user_id));
      const low = scans.filter(s => s.stress_level === 'low').length;
      const moderate = scans.filter(s => s.stress_level === 'moderate').length;
      const high = scans.filter(s => s.stress_level === 'high').length;
      const hrvValues = scans.filter(s => s.hrv_value).map(s => Number(s.hrv_value));
      const avgHRV = hrvValues.length > 0 ? Math.round(hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length) : 0;
      const highPercent = Math.round((high / total) * 100);
      const riskLevel = highPercent > 30 ? 'high' : highPercent > 15 ? 'moderate' : 'low';

      const period = t('safety.report.periodFormat', {
        start: thirtyDaysAgo.toLocaleDateString(dateLocale),
        end: now.toLocaleDateString(dateLocale),
      });

      if (isAutonomous) {
        const localReport: PGRReport =
          lang === 'pt'
            ? {
                titulo: 'Relatório Técnico PGR (Regras Fixas Locais)',
                versao: '1.0-autonomo',
                identificacaoEmpresa: { nota: 'Modo Autônomo da Missão (sem uplink)' },
                objetivos: ['Gerenciamento operacional contínuo de riscos psicossociais'],
                fundamentacaoLegal: [
                  {
                    norma: 'NR-1',
                    dispositivo: 'Item 1.5.3',
                    descricao: 'Gerado localmente (regras fixas, sem IA em nuvem): Avaliação preliminar de risco ocupacional.',
                  },
                ],
                inventarioRiscos: {
                  fatoresIdentificados: [
                    {
                      fator: 'Carga Mental e Fadiga no Cockpit',
                      fonte: 'Telemetria Biocognitiva Local',
                      classificacao: riskLevel === 'high' ? 'grave' : riskLevel === 'moderate' ? 'moderado' : 'leve',
                      populacaoExposta: `${uniqueUsers.size} tripulante(s)`,
                      medidasControle: 'Gerado localmente (regras fixas, sem IA em nuvem): Protocolo de contramedidas e pausas 4-7-8',
                    },
                  ],
                  classificacaoGeral: riskLevel === 'high' ? 'Alto Risco Operacional' : riskLevel === 'moderate' ? 'Risco Moderado' : 'Baixo Risco',
                  metodologia: 'Avaliação biocognitiva e telemetria de prontidão operacional',
                },
                analiseQuantitativa: {
                  resumo: 'Gerado localmente (regras fixas, sem IA em nuvem): Análise quantitativa consolidada via regras locais.',
                  indicadores: [
                    { indicador: 'Total de Scans Locais', valor: String(total), interpretacao: 'Amostragem operacional' },
                    { indicador: 'HRV Médio', valor: `${avgHRV}ms`, interpretacao: 'Índice de tônus parassimpático' },
                  ],
                },
                planoAcao: [
                  {
                    acao: 'Gerado localmente (regras fixas, sem IA em nuvem): Manter hidratação e pausas guiadas',
                    responsavel: 'Operador de Voo',
                    prazo: 'Imediato',
                    prioridade: 'alta',
                    indicadorEficacia: 'Estabilidade de HRV',
                  },
                ],
                cronograma: [
                  {
                    fase: 'Turno Atual',
                    periodo: '24 horas',
                    atividades: ['Registro sistemático de fadiga e contramedidas'],
                  },
                ],
                monitoramento: {
                  frequencia: 'Diária',
                  indicadores: ['BioScore', 'Percepção de Fadiga'],
                  responsavel: 'Oficial Médico / Sistema Autônomo',
                },
                declaracaoLGPD: 'Dados protegidos e tratados localmente na espaçonave em conformidade com a Zero-Trust Privacy.',
                conclusao: 'Gerado localmente (regras fixas, sem IA em nuvem): Tripulação em condições de prontidão operacional monitorada.',
              }
            : {
                titulo: 'PGR Technical Report (Local Fixed Rules)',
                versao: '1.0-autonomous',
                identificacaoEmpresa: { nota: 'Mission Autonomous Mode (no uplink)' },
                objetivos: ['Continuous operational management of psychosocial risks'],
                fundamentacaoLegal: [
                  {
                    norma: 'NR-1 (Brazilian workplace safety regulation)',
                    dispositivo: 'Item 1.5.3',
                    descricao: 'Locally generated (fixed rules, no cloud AI): Preliminary occupational risk assessment.',
                  },
                ],
                inventarioRiscos: {
                  fatoresIdentificados: [
                    {
                      fator: 'Mental Workload and Cockpit Fatigue',
                      fonte: 'Local Biocognitive Telemetry',
                      classificacao: riskLevel === 'high' ? 'grave' : riskLevel === 'moderate' ? 'moderado' : 'leve',
                      populacaoExposta: `${uniqueUsers.size} crew member(s)`,
                      medidasControle: 'Locally generated (fixed rules, no cloud AI): Countermeasure protocol and 4-7-8 breathing breaks',
                    },
                  ],
                  classificacaoGeral: riskLevel === 'high' ? 'High Operational Risk' : riskLevel === 'moderate' ? 'Moderate Risk' : 'Low Risk',
                  metodologia: 'Biocognitive evaluation and operational readiness telemetry',
                },
                analiseQuantitativa: {
                  resumo: 'Locally generated (fixed rules, no cloud AI): Consolidated quantitative analysis via local rules.',
                  indicadores: [
                    { indicador: 'Total Local Scans', valor: String(total), interpretacao: 'Operational sample' },
                    { indicador: 'Average HRV', valor: `${avgHRV}ms`, interpretacao: 'Parasympathetic tone index' },
                  ],
                },
                planoAcao: [
                  {
                    acao: 'Locally generated (fixed rules, no cloud AI): Maintain hydration and guided breaks',
                    responsavel: 'Flight Operator',
                    prazo: 'Immediate',
                    prioridade: 'alta',
                    indicadorEficacia: 'HRV Stability',
                  },
                ],
                cronograma: [
                  {
                    fase: 'Current Shift',
                    periodo: '24 hours',
                    atividades: ['Systematic fatigue logging and countermeasures'],
                  },
                ],
                monitoramento: {
                  frequencia: 'Daily',
                  indicadores: ['BioScore', 'Perceived Fatigue'],
                  responsavel: 'Medical Officer / Autonomous System',
                },
                declaracaoLGPD: 'Data protected and processed locally aboard the spacecraft under Zero-Trust Privacy.',
                conclusao: 'Locally generated (fixed rules, no cloud AI): Crew in monitored operational readiness condition.',
              };

        setReport(localReport);
        toast({
          title: t('safety.pgr.toast.successTitle'),
          description: t('safety.pgr.toast.successDesc'),
        });
        return;
      }

      const { data: result, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          type: 'pgr_report',
          data: {
            totalScans: total,
            totalEmployees: uniqueUsers.size,
            activeEmployees: uniqueUsers.size,
            adoptionRate: Math.round((uniqueUsers.size / Math.max(uniqueUsers.size, 1)) * 100),
            lowPercent: Math.round((low / total) * 100),
            moderatePercent: Math.round((moderate / total) * 100),
            highPercent,
            avgHRV,
            riskLevel,
            period,
            trend: 'estável',
          },
        },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      setReport(result.result);
      toast({
        title: t('safety.pgr.toast.successTitle'),
        description: t('safety.pgr.toast.successDesc'),
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({
        title: t('safety.pgr.toast.errorTitle'),
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!report) return;
    const dateLocale = lang === 'pt' ? 'pt-BR' : 'en-US';
    const now = new Date().toLocaleDateString(dateLocale);

    const fundamentacaoHtml = report.fundamentacaoLegal?.map(f => `
      <tr><td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;font-weight:600;">${f.norma}</td>
      <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;">${f.dispositivo}</td>
      <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;">${f.descricao}</td></tr>
    `).join('') || '';

    const inventarioHtml = report.inventarioRiscos?.fatoresIdentificados?.map(f => `
      <tr>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;">${f.fator}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;">${f.fonte}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;font-weight:600;color:${f.classificacao === 'grave' ? '#dc2626' : f.classificacao === 'moderado' ? '#d97706' : '#16a34a'}">${f.classificacao?.toUpperCase()}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;">${f.populacaoExposta}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;">${f.medidasControle}</td>
      </tr>
    `).join('') || '';

    const planoHtml = report.planoAcao?.map((a, i) => `
      <tr>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;">${i + 1}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;">${a.acao}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;">${a.responsavel}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;">${a.prazo}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;font-weight:600;color:${a.prioridade?.toLowerCase() === 'alta' ? '#dc2626' : a.prioridade?.toLowerCase() === 'média' || a.prioridade?.toLowerCase() === 'media' ? '#d97706' : '#16a34a'}">${a.prioridade?.toUpperCase()}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;">${a.indicadorEficacia}</td>
      </tr>
    `).join('') || '';

    const cronogramaHtml = report.cronograma?.map(c => `
      <tr>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;font-weight:600;">${c.fase}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;">${c.periodo}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;">${c.atividades?.join('; ')}</td>
      </tr>
    `).join('') || '';

    const indicadoresHtml = report.analiseQuantitativa?.indicadores?.map(ind => `
      <tr>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;font-weight:600;">${ind.indicador}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;text-align:center;">${ind.valor}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;">${ind.interpretacao}</td>
      </tr>
    `).join('') || '';

    const html = `<!DOCTYPE html>
<html lang="${lang === 'pt' ? 'pt-BR' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>${report.titulo}</title>
  <style>
    @media print { body { margin: 0; } @page { margin: 1.5cm; size: A4; } }
    body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px; color: #222; line-height: 1.6; }
    h1 { font-size: 18px; color: #1a3a4a; border-bottom: 3px solid #1a7a7a; padding-bottom: 8px; }
    h2 { font-size: 14px; color: #1a3a4a; border-bottom: 2px solid #1a7a7a; padding-bottom: 4px; margin-top: 24px; }
    h3 { font-size: 12px; color: #1a5a6a; margin-top: 16px; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; }
    th { background: #f0f7f7; padding: 6px 8px; border: 1px solid #ddd; font-size: 10px; text-transform: uppercase; color: #1a5a6a; text-align: left; }
    p, li { font-size: 12px; }
    .stamp { background: #f0f7f7; border: 2px solid #1a7a7a; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center; }
  </style>
</head>
<body>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
    <div>
      <h1 style="margin:0;border:none;padding:0;">${report.titulo}</h1>
      <p style="color:#888;font-size:11px;margin:4px 0 0;">${t('safety.pgr.pdf.generatedBy', { version: report.versao, date: now })}</p>
    </div>
    <div style="font-size:28px;font-weight:800;color:#1a7a7a;">NS</div>
  </div>
  <hr style="border:none;border-top:3px solid #1a7a7a;margin-bottom:20px;">

  <div class="stamp">
    <p style="font-size:10px;color:#666;margin:0;">${report.identificacaoEmpresa?.nota || ''}</p>
  </div>

  <h2>${t('safety.pgr.section.objectives')}</h2>
  <ul>${report.objetivos?.map(o => `<li>${o}</li>`).join('') || ''}</ul>

  <h2>${t('safety.pgr.section.legalBasis')}</h2>
  <table>
    <thead><tr><th>${t('safety.pgr.th.standard')}</th><th>${t('safety.pgr.th.provision')}</th><th>${t('safety.pgr.th.description')}</th></tr></thead>
    <tbody>${fundamentacaoHtml}</tbody>
  </table>

  <h2>${t('safety.pgr.section.riskInventory')}</h2>
  <h3>${t('safety.pgr.section.methodology')}</h3>
  <p>${report.inventarioRiscos?.metodologia || ''}</p>
  <h3>${t('safety.pgr.section.generalClassification')}</h3>
  <p>${report.inventarioRiscos?.classificacaoGeral || ''}</p>
  <h3>${t('safety.pgr.section.identifiedFactors')}</h3>
  <table>
    <thead><tr><th>${t('safety.pgr.th.factor')}</th><th>${t('safety.pgr.th.source')}</th><th>${t('safety.pgr.th.classification')}</th><th>${t('safety.pgr.th.exposedPop')}</th><th>${t('safety.pgr.th.controlMeasures')}</th></tr></thead>
    <tbody>${inventarioHtml}</tbody>
  </table>

  <h2>${t('safety.pgr.section.quantitative')}</h2>
  <p>${report.analiseQuantitativa?.resumo || ''}</p>
  <table>
    <thead><tr><th>${t('safety.pgr.th.indicator')}</th><th>${t('safety.pgr.th.value')}</th><th>${t('safety.pgr.th.interpretation')}</th></tr></thead>
    <tbody>${indicadoresHtml}</tbody>
  </table>

  <h2>${t('safety.pgr.section.actionPlan')}</h2>
  <table>
    <thead><tr><th>#</th><th>${t('safety.pgr.th.action')}</th><th>${t('safety.pgr.th.owner')}</th><th>${t('safety.pgr.th.deadline')}</th><th>${t('safety.pgr.th.priority')}</th><th>${t('safety.pgr.th.effectiveness')}</th></tr></thead>
    <tbody>${planoHtml}</tbody>
  </table>

  <h2>${t('safety.pgr.section.schedule')}</h2>
  <table>
    <thead><tr><th>${t('safety.pgr.th.phase')}</th><th>${t('safety.pgr.th.period')}</th><th>${t('safety.pgr.th.activities')}</th></tr></thead>
    <tbody>${cronogramaHtml}</tbody>
  </table>

  <h2>${t('safety.pgr.section.monitoring')}</h2>
  <p><strong>${t('safety.pgr.th.period')}:</strong> ${report.monitoramento?.frequencia || ''}</p>
  <p><strong>${t('safety.pgr.th.owner')}:</strong> ${report.monitoramento?.responsavel || ''}</p>
  <p><strong>${t('safety.pgr.card.monitoring')}:</strong></p>
  <ul>${report.monitoramento?.indicadores?.map(i => `<li>${i}</li>`).join('') || ''}</ul>

  <h2>${t('safety.pgr.section.dataProtection')}</h2>
  <p>${report.declaracaoLGPD || ''}</p>

  <h2>${t('safety.pgr.section.conclusion')}</h2>
  <p>${report.conclusao || ''}</p>

  <div style="margin-top:40px;padding-top:16px;border-top:2px solid #1a7a7a;">
    <p style="font-size:10px;color:#999;text-align:center;">
      ${t('safety.pgr.pdf.disclaimer')}
    </p>
    <div style="display:flex;justify-content:space-between;margin-top:24px;">
      <div style="text-align:center;flex:1;">
        <div style="border-top:1px solid #333;width:200px;margin:0 auto;padding-top:4px;">
          <p style="font-size:10px;color:#666;">${t('safety.pgr.pdf.techResp')}</p>
        </div>
      </div>
      <div style="text-align:center;flex:1;">
        <div style="border-top:1px solid #333;width:200px;margin:0 auto;padding-top:4px;">
          <p style="font-size:10px;color:#666;">${t('safety.pgr.pdf.legalRep')}</p>
        </div>
      </div>
    </div>
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (!w) {
      const a = document.createElement('a');
      a.href = url;
      a.download = `pgr-riscos-psicossociais-${new Date().toISOString().split('T')[0]}.html`;
      a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const getPriorityColor = (p: string) => {
    const lower = p?.toLowerCase();
    if (lower === 'alta' || lower === 'high') return 'text-destructive';
    if (lower === 'média' || lower === 'media' || lower === 'medium') return 'text-yellow-600';
    return 'text-green-600';
  };

  const getClassColor = (c: string) => {
    const lower = c?.toLowerCase();
    if (lower === 'grave' || lower === 'severe' || lower === 'high') return 'bg-destructive/10 text-destructive';
    if (lower === 'moderado' || lower === 'moderate') return 'bg-yellow-500/10 text-yellow-600';
    return 'bg-green-500/10 text-green-600';
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t('safety.pgr.title')}
          </CardTitle>
          <CardDescription>
            {t('safety.pgr.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={generatePGR} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {loading ? t('safety.pgr.generatingBtn') : t('safety.pgr.generateBtn')}
            </Button>
            {report && (
              <Button onClick={exportPDF} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                {t('safety.pgr.exportPdf')}
              </Button>
            )}
          </div>

          {loading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
              <p className="text-sm text-muted-foreground">{t('safety.pgr.loadingText')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('safety.pgr.loadingSubtext')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Objetivos */}
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" />
                {t('safety.pgr.card.objectives')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {report.objetivos?.map((o, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2">
                    <span className="text-primary font-bold">{i + 1}.</span> {o}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Fundamentação Legal */}
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                {t('safety.pgr.card.legalBasis')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.fundamentacaoLegal?.map((f, i) => (
                  <div key={i} className="p-2.5 bg-muted/30 rounded-lg">
                    <p className="text-xs font-semibold">{f.norma} — {f.dispositivo}</p>
                    <p className="text-xs text-muted-foreground">{f.descricao}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inventário de Riscos */}
          <Card className="shadow-soft border-destructive/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-destructive" />
                {t('safety.pgr.card.riskInventory')}
              </CardTitle>
              <CardDescription className="text-xs">{report.inventarioRiscos?.metodologia}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">{report.inventarioRiscos?.classificacaoGeral}</p>
              <div className="space-y-2">
                {report.inventarioRiscos?.fatoresIdentificados?.map((f, i) => (
                  <div key={i} className="p-3 bg-muted/20 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold">{f.fator}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getClassColor(f.classificacao)}`}>
                        {f.classificacao?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{t('safety.pgr.label.source', { source: f.fonte })}</p>
                    <p className="text-[10px] text-muted-foreground">{t('safety.pgr.label.exposedPop', { pop: f.populacaoExposta })}</p>
                    <p className="text-[10px] text-muted-foreground">{t('safety.pgr.label.measures', { measures: f.medidasControle })}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Análise Quantitativa */}
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                {t('safety.pgr.card.quantitative')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">{report.analiseQuantitativa?.resumo}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {report.analiseQuantitativa?.indicadores?.map((ind, i) => (
                  <div key={i} className="p-2.5 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-[10px] text-muted-foreground uppercase">{ind.indicador}</p>
                    <p className="text-lg font-bold text-primary">{ind.valor}</p>
                    <p className="text-[10px] text-muted-foreground">{ind.interpretacao}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Plano de Ação */}
          <Card className="shadow-soft border-accent/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-accent" />
                {t('safety.pgr.card.actionPlan')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.planoAcao?.map((a, i) => (
                  <div key={i} className="p-3 bg-muted/20 rounded-lg border-l-4" style={{ borderLeftColor: a.prioridade?.toLowerCase() === 'alta' ? 'hsl(var(--destructive))' : a.prioridade?.toLowerCase() === 'média' || a.prioridade?.toLowerCase() === 'media' ? '#d97706' : '#16a34a' }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold">{i + 1}. {a.acao}</p>
                      <span className={`text-[10px] font-bold ${getPriorityColor(a.prioridade)}`}>{a.prioridade?.toUpperCase()}</span>
                    </div>
                    <div className="flex gap-4 text-[10px] text-muted-foreground">
                      <span>👤 {t('safety.pgr.label.owner', { owner: a.responsavel })}</span>
                      <span>⏱️ {t('safety.pgr.label.deadline', { deadline: a.prazo })}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">📊 {t('safety.pgr.label.effectiveness', { indicator: a.indicadorEficacia })}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cronograma */}
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {t('safety.pgr.card.schedule')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.cronograma?.map((c, i) => (
                  <div key={i} className="p-2.5 bg-muted/30 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-semibold">{c.fase}</p>
                      <span className="text-[10px] text-primary font-medium">{c.periodo}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{c.atividades?.join(' · ')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monitoramento + LGPD + Conclusão */}
          <Card className="shadow-soft">
            <CardContent className="p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold mb-1">📡 {t('safety.pgr.card.monitoring')}</p>
                <p className="text-[10px] text-muted-foreground">{t('safety.pgr.card.monitoringDetail', { freq: report.monitoramento?.frequencia, resp: report.monitoramento?.responsavel })}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {report.monitoramento?.indicadores?.map((ind, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">{ind}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1">🔒 {t('safety.pgr.card.privacy')}</p>
                <p className="text-[10px] text-muted-foreground">{report.declaracaoLGPD}</p>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-xs font-semibold mb-1">✅ {t('safety.pgr.card.conclusion')}</p>
                <p className="text-xs text-muted-foreground">{report.conclusao}</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!report && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t('safety.pgr.empty.title')}</p>
          <p className="text-xs mt-1">{t('safety.pgr.empty.desc')}</p>
        </div>
      )}
    </div>
  );
}
