import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, Shield, ClipboardList, Calendar, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [report, setReport] = useState<PGRReport | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generatePGR = async () => {
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
        toast({ title: 'Sem dados', description: 'Sem dados de scans para gerar o PGR.', variant: 'destructive' });
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

      const period = `${thirtyDaysAgo.toLocaleDateString('pt-BR')} a ${new Date().toLocaleDateString('pt-BR')}`;

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
      toast({ title: 'PGR gerado! 📋', description: 'Documento técnico pronto para download.' });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!report) return;
    const now = new Date().toLocaleDateString('pt-BR');

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
        <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px;font-weight:600;color:${a.prioridade === 'alta' ? '#dc2626' : a.prioridade === 'média' ? '#d97706' : '#16a34a'}">${a.prioridade?.toUpperCase()}</td>
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
<html lang="pt-BR">
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
      <p style="color:#888;font-size:11px;margin:4px 0 0;">${report.versao} · Gerado por NeuroSuite · ${now}</p>
    </div>
    <div style="font-size:28px;font-weight:800;color:#1a7a7a;">NS</div>
  </div>
  <hr style="border:none;border-top:3px solid #1a7a7a;margin-bottom:20px;">

  <div class="stamp">
    <p style="font-size:10px;color:#666;margin:0;">${report.identificacaoEmpresa?.nota || ''}</p>
  </div>

  <h2>1. OBJETIVOS</h2>
  <ul>${report.objetivos?.map(o => `<li>${o}</li>`).join('') || ''}</ul>

  <h2>2. FUNDAMENTAÇÃO LEGAL</h2>
  <table>
    <thead><tr><th>Norma</th><th>Dispositivo</th><th>Descrição</th></tr></thead>
    <tbody>${fundamentacaoHtml}</tbody>
  </table>

  <h2>3. INVENTÁRIO DE RISCOS PSICOSSOCIAIS</h2>
  <h3>3.1 Metodologia</h3>
  <p>${report.inventarioRiscos?.metodologia || ''}</p>
  <h3>3.2 Classificação Geral</h3>
  <p>${report.inventarioRiscos?.classificacaoGeral || ''}</p>
  <h3>3.3 Fatores de Risco Identificados</h3>
  <table>
    <thead><tr><th>Fator</th><th>Fonte</th><th>Classificação</th><th>Pop. Exposta</th><th>Medidas de Controle</th></tr></thead>
    <tbody>${inventarioHtml}</tbody>
  </table>

  <h2>4. ANÁLISE QUANTITATIVA</h2>
  <p>${report.analiseQuantitativa?.resumo || ''}</p>
  <table>
    <thead><tr><th>Indicador</th><th>Valor</th><th>Interpretação</th></tr></thead>
    <tbody>${indicadoresHtml}</tbody>
  </table>

  <h2>5. PLANO DE AÇÃO</h2>
  <table>
    <thead><tr><th>#</th><th>Ação</th><th>Responsável</th><th>Prazo</th><th>Prioridade</th><th>Indicador de Eficácia</th></tr></thead>
    <tbody>${planoHtml}</tbody>
  </table>

  <h2>6. CRONOGRAMA DE IMPLEMENTAÇÃO</h2>
  <table>
    <thead><tr><th>Fase</th><th>Período</th><th>Atividades</th></tr></thead>
    <tbody>${cronogramaHtml}</tbody>
  </table>

  <h2>7. MONITORAMENTO E REVISÃO</h2>
  <p><strong>Frequência:</strong> ${report.monitoramento?.frequencia || ''}</p>
  <p><strong>Responsável:</strong> ${report.monitoramento?.responsavel || ''}</p>
  <p><strong>Indicadores:</strong></p>
  <ul>${report.monitoramento?.indicadores?.map(i => `<li>${i}</li>`).join('') || ''}</ul>

  <h2>8. PROTEÇÃO DE DADOS (LGPD)</h2>
  <p>${report.declaracaoLGPD || ''}</p>

  <h2>9. CONCLUSÃO</h2>
  <p>${report.conclusao || ''}</p>

  <div style="margin-top:40px;padding-top:16px;border-top:2px solid #1a7a7a;">
    <p style="font-size:10px;color:#999;text-align:center;">
      Documento gerado automaticamente pelo sistema NeuroSuite — Plataforma de Neuroperformance Corporativa<br>
      Dados agregados e anonimizados em conformidade com a LGPD (Lei 13.709/2018)
    </p>
    <div style="display:flex;justify-content:space-between;margin-top:24px;">
      <div style="text-align:center;flex:1;">
        <div style="border-top:1px solid #333;width:200px;margin:0 auto;padding-top:4px;">
          <p style="font-size:10px;color:#666;">Responsável Técnico SST</p>
        </div>
      </div>
      <div style="text-align:center;flex:1;">
        <div style="border-top:1px solid #333;width:200px;margin:0 auto;padding-top:4px;">
          <p style="font-size:10px;color:#666;">Representante Legal da Empresa</p>
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
    if (p === 'alta') return 'text-destructive';
    if (p === 'média') return 'text-yellow-600';
    return 'text-green-600';
  };

  const getClassColor = (c: string) => {
    if (c === 'grave') return 'bg-destructive/10 text-destructive';
    if (c === 'moderado') return 'bg-yellow-500/10 text-yellow-600';
    return 'bg-green-500/10 text-green-600';
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Relatório PGR — Riscos Psicossociais
          </CardTitle>
          <CardDescription>
            Documento técnico do Programa de Gerenciamento de Riscos conforme NR-1 e Portaria MTE 1.419/2024, gerado automaticamente com IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={generatePGR} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {loading ? 'Gerando documento PGR...' : 'Gerar Relatório PGR com IA'}
            </Button>
            {report && (
              <Button onClick={exportPDF} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
            )}
          </div>

          {loading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
              <p className="text-sm text-muted-foreground">A IA está elaborando o documento técnico completo...</p>
              <p className="text-xs text-muted-foreground mt-1">Isso pode levar alguns segundos</p>
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
                Objetivos do PGR
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
                Fundamentação Legal
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
                Inventário de Riscos Psicossociais
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
                    <p className="text-[10px] text-muted-foreground">Fonte: {f.fonte}</p>
                    <p className="text-[10px] text-muted-foreground">Pop. Exposta: {f.populacaoExposta}</p>
                    <p className="text-[10px] text-muted-foreground">Medidas: {f.medidasControle}</p>
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
                Análise Quantitativa
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
                Plano de Ação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.planoAcao?.map((a, i) => (
                  <div key={i} className="p-3 bg-muted/20 rounded-lg border-l-4" style={{ borderLeftColor: a.prioridade === 'alta' ? 'hsl(var(--destructive))' : a.prioridade === 'média' ? '#d97706' : '#16a34a' }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold">{i + 1}. {a.acao}</p>
                      <span className={`text-[10px] font-bold ${getPriorityColor(a.prioridade)}`}>{a.prioridade?.toUpperCase()}</span>
                    </div>
                    <div className="flex gap-4 text-[10px] text-muted-foreground">
                      <span>👤 {a.responsavel}</span>
                      <span>⏱️ {a.prazo}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">📊 {a.indicadorEficacia}</p>
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
                Cronograma de Implementação
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
                <p className="text-xs font-semibold mb-1">📡 Monitoramento</p>
                <p className="text-[10px] text-muted-foreground">Frequência: {report.monitoramento?.frequencia} · Responsável: {report.monitoramento?.responsavel}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {report.monitoramento?.indicadores?.map((ind, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">{ind}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1">🔒 LGPD</p>
                <p className="text-[10px] text-muted-foreground">{report.declaracaoLGPD}</p>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-xs font-semibold mb-1">✅ Conclusão</p>
                <p className="text-xs text-muted-foreground">{report.conclusao}</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!report && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Clique no botão acima para gerar o documento PGR completo</p>
          <p className="text-xs mt-1">O relatório inclui inventário de riscos, plano de ação, cronograma e fundamentação legal</p>
        </div>
      )}
    </div>
  );
}
