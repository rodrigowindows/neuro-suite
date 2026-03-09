import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Loader2, Download, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function NarrativeReportGenerator() {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [period, setPeriod] = useState('week');
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState('');

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // Build mock metrics from available context
      const metrics = {
        avgStressScore: 62,
        highStressPercent: 28,
        avgHRV: 42,
        checkinCompletionRate: 74,
        avgEnergyLevel: 3.2,
        moodDistribution: { otimo: 15, bem: 35, neutro: 30, cansado: 15, estressado: 5 },
        coachSessionsCompleted: 47,
        avgCoachRating: 4.3,
        burnoutRiskCount: 3,
        absenteeismRate: 4.2,
        turnoverRisk: 'moderate',
      };

      const { data, error } = await supabase.functions.invoke('narrative-report', {
        body: {
          metrics,
          period: period === 'week' ? 'Última Semana' : period === 'month' ? 'Último Mês' : 'Último Trimestre',
          companyName: companyName || 'Empresa',
          teamSize: teamSize || 'N/A',
        },
      });

      if (error) throw error;
      setReport(data.report);
    } catch (err: any) {
      console.error('Erro relatório:', err);
      toast({ title: 'Erro', description: 'Não foi possível gerar o relatório.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-executivo-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    toast({ title: 'Relatório exportado! 📄' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Relatórios Narrativos com IA
          </CardTitle>
          <CardDescription>
            Converta métricas em relatórios executivos profissionais para RH e C-Level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Empresa</label>
              <div className="relative mt-1">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome da empresa"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Tamanho da equipe</label>
              <Input
                type="number"
                placeholder="Ex: 150"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Período</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última Semana</SelectItem>
                  <SelectItem value="month">Último Mês</SelectItem>
                  <SelectItem value="quarter">Último Trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={generateReport} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Gerando relatório executivo...</>
            ) : (
              <><FileText className="h-4 w-4 mr-2" />Gerar Relatório Narrativo</>
            )}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">📊 Relatório Gerado</CardTitle>
            <Button variant="outline" size="sm" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar .md
            </Button>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
              {report}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
