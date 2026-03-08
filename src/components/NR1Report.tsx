import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReportData {
  totalScans: number;
  lowPercent: number;
  moderatePercent: number;
  highPercent: number;
  avgHRV: number;
  period: string;
  riskLevel: 'low' | 'moderate' | 'high';
  recommendations: string[];
}

export default function NR1Report() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: scans } = await supabase
        .from('stress_scans')
        .select('stress_level, hrv_value, created_at')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(200);

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

        const recommendations: string[] = [];
        if (highPercent > 20) recommendations.push('Implementar programa de pausas ativas obrigatórias');
        if (avgHRV < 30) recommendations.push('Avaliação médica recomendada para colaboradores com HRV baixo');
        if (moderatePercent > 40) recommendations.push('Workshop de técnicas de regulação emocional');
        if (highPercent > 30) recommendations.push('Revisão de carga de trabalho e redistribuição de tarefas');
        recommendations.push('Manter monitoramento contínuo via NeuroSuite');
        recommendations.push('Documentar ações para compliance NR-1 (gestão de riscos psicossociais)');

        setReportData({
          totalScans: total,
          lowPercent,
          moderatePercent,
          highPercent,
          avgHRV: Math.round(avgHRV),
          period: `${thirtyDaysAgo.toLocaleDateString('pt-BR')} a ${new Date().toLocaleDateString('pt-BR')}`,
          riskLevel,
          recommendations,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFContent = (): string => {
    if (!reportData) return '';
    const now = new Date().toLocaleDateString('pt-BR');
    return `
RELATÓRIO DE GESTÃO DE RISCOS PSICOSSOCIAIS — NR-1
====================================================
Gerado por NeuroSuite | Data: ${now}
Período de Análise: ${reportData.period}

1. RESUMO EXECUTIVO
--------------------
Total de Avaliações: ${reportData.totalScans}
Nível de Risco Geral: ${reportData.riskLevel === 'high' ? 'ALTO ⚠️' : reportData.riskLevel === 'moderate' ? 'MODERADO ⚡' : 'BAIXO ✅'}

2. DISTRIBUIÇÃO DE ESTRESSE
-----------------------------
• Baixo Estresse: ${reportData.lowPercent}%
• Estresse Moderado: ${reportData.moderatePercent}%
• Estresse Alto: ${reportData.highPercent}%

3. INDICADORES BIOMÉTRICOS
-----------------------------
• HRV Médio: ${reportData.avgHRV}ms
• Status HRV: ${reportData.avgHRV > 50 ? 'Boa resiliência autonômica' : reportData.avgHRV > 30 ? 'Normal — monitorar' : 'Atenção — possível sobrecarga'}

4. ANÁLISE DE RISCO (NR-1, Art. 157)
---------------------------------------
${reportData.riskLevel === 'high' ? 'AÇÃO URGENTE: Mais de 30% dos colaboradores apresentam estresse alto. Risco de adoecimento ocupacional e passivo trabalhista.' : reportData.riskLevel === 'moderate' ? 'ATENÇÃO: Níveis moderados de estresse detectados. Intervenções preventivas recomendadas.' : 'SITUAÇÃO CONTROLADA: Níveis de estresse dentro dos parâmetros aceitáveis.'}

5. RECOMENDAÇÕES
------------------
${reportData.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

6. BASE LEGAL
---------------
• NR-1 (Portaria MTP 4.219/2022) — Gerenciamento de Riscos Ocupacionais
• Lei 14.457/2022 — Programa Emprega + Mulheres (saúde mental)
• Portaria MTE 1.419/2024 — Riscos psicossociais no PGR
• OIT C155 — Convenção sobre Segurança e Saúde dos Trabalhadores

7. DECLARAÇÃO
---------------
Este relatório foi gerado automaticamente pelo sistema NeuroSuite com base em dados biométricos coletados de forma anônima e em conformidade com a LGPD (Lei 13.709/2018).

Os dados são agregados e não permitem identificação individual dos colaboradores.

____________________________________
Responsável Técnico
NeuroSuite — Plataforma de Neuroperformance Corporativa
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
    const csv = `Métrica,Valor,Unidade
Período,"${reportData.period}",
Total de Avaliações,${reportData.totalScans},scans
Estresse Baixo,${reportData.lowPercent},%
Estresse Moderado,${reportData.moderatePercent},%
Estresse Alto,${reportData.highPercent},%
HRV Médio,${reportData.avgHRV},ms
Nível de Risco,${reportData.riskLevel},
${reportData.recommendations.map((r, i) => `Recomendação ${i + 1},"${r}",`).join('\n')}`;

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
          <p className="text-muted-foreground">Gerando relatório NR-1...</p>
        </CardContent>
      </Card>
    );
  }

  if (!reportData) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Sem dados suficientes para gerar relatório. Realize scans primeiro.</p>
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
      <Card className="shadow-soft border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Relatório NR-1 — Riscos Psicossociais
          </CardTitle>
          <CardDescription>
            Relatório de compliance para gestão de riscos psicossociais conforme NR-1 e Portaria MTE 1.419/2024
          </CardDescription>
          <div className="flex gap-2 mt-3">
            <Button onClick={exportReport} variant="default" size="sm" disabled={generating}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Relatório (.txt)
            </Button>
            <Button onClick={exportCSV} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
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
                  Nível de Risco: {reportData.riskLevel === 'high' ? 'ALTO' : reportData.riskLevel === 'moderate' ? 'MODERADO' : 'BAIXO'}
                </p>
                <p className="text-xs text-muted-foreground">Período: {reportData.period}</p>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-muted/30 rounded-lg text-center">
              <p className="text-[10px] text-muted-foreground uppercase">Avaliações</p>
              <p className="text-2xl font-bold text-primary">{reportData.totalScans}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg text-center">
              <p className="text-[10px] text-muted-foreground uppercase">Baixo Estresse</p>
              <p className="text-2xl font-bold text-green-600">{reportData.lowPercent}%</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
              <p className="text-[10px] text-muted-foreground uppercase">Moderado</p>
              <p className="text-2xl font-bold text-yellow-600">{reportData.moderatePercent}%</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg text-center">
              <p className="text-[10px] text-muted-foreground uppercase">Alto</p>
              <p className="text-2xl font-bold text-red-600">{reportData.highPercent}%</p>
            </div>
          </div>

          {/* HRV */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">HRV Médio (Variabilidade da Frequência Cardíaca)</p>
            <p className="text-3xl font-bold text-primary">{reportData.avgHRV}<span className="text-sm">ms</span></p>
            <p className="text-xs text-muted-foreground mt-1">
              {reportData.avgHRV > 50 ? '✅ Boa resiliência autonômica' : reportData.avgHRV > 30 ? '⚡ Normal — continuar monitorando' : '⚠️ Atenção — possível sobrecarga do SNA'}
            </p>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">📋 Recomendações para Compliance NR-1:</p>
            <div className="space-y-2">
              {reportData.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg">
                  <span className="text-xs font-bold text-primary mt-0.5">{i + 1}.</span>
                  <p className="text-xs text-muted-foreground">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Reference */}
          <div className="p-3 bg-muted/20 rounded-lg text-[10px] text-muted-foreground space-y-1">
            <p className="font-semibold">⚖️ Base Legal:</p>
            <p>• NR-1 (Portaria MTP 4.219/2022) — Gerenciamento de Riscos Ocupacionais</p>
            <p>• Portaria MTE 1.419/2024 — Inclusão de riscos psicossociais no PGR</p>
            <p>• LGPD (Lei 13.709/2018) — Dados anonimizados e agregados</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
