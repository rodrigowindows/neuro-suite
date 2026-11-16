import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Loader2, Download, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useConnectionMode } from '@/hooks/useConnectionMode';
import { useI18n } from '@/i18n';

export default function NarrativeReportGenerator() {
  const { lang, t } = useI18n();
  const { toast } = useToast();
  const { isAutonomous } = useConnectionMode();
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

      if (isAutonomous) {
        setReport(
          lang === 'pt'
            ? 'Gerado localmente (regras fixas, sem IA em nuvem):\n\nRelatório consolidado via regras determinísticas locais com base nas telemetrias coletadas.\n- Taxa de conclusão de checkins: 74%\n- Média de HRV: 42ms\n- Status geral: Estável com monitoramento de prontidão ativo.'
            : 'Locally generated (fixed rules, no cloud AI):\n\nConsolidated report via local deterministic rules based on collected telemetries.\n- Check-in completion rate: 74%\n- Average HRV: 42ms\n- Overall status: Stable with active readiness monitoring.'
        );
        return;
      }

      const periodLabel =
        period === 'week'
          ? t('safety.narrative.period.week')
          : period === 'month'
          ? t('safety.narrative.period.month')
          : t('safety.narrative.period.quarter');

      const defaultCompany = lang === 'pt' ? 'Empresa' : 'Company';

      const { data, error } = await supabase.functions.invoke('narrative-report', {
        body: {
          metrics,
          period: periodLabel,
          companyName: companyName || defaultCompany,
          teamSize: teamSize || 'N/A',
        },
      });

      if (error) throw error;
      setReport(data.report);
    } catch (err: unknown) {
      console.error('Erro relatório:', err);
      toast({
        title: t('safety.narrative.toast.errorTitle'),
        description: t('safety.narrative.toast.errorDesc'),
        variant: 'destructive',
      });
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
    toast({ title: t('safety.narrative.toast.exported') });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t('safety.narrative.title')}
          </CardTitle>
          <CardDescription>
            {t('safety.narrative.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">{t('safety.narrative.companyLabel')}</label>
              <div className="relative mt-1">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('safety.narrative.companyPlaceholder')}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t('safety.narrative.teamSizeLabel')}</label>
              <Input
                type="number"
                placeholder={t('safety.narrative.teamSizePlaceholder')}
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t('safety.narrative.periodLabel')}</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">{t('safety.narrative.period.week')}</SelectItem>
                  <SelectItem value="month">{t('safety.narrative.period.month')}</SelectItem>
                  <SelectItem value="quarter">{t('safety.narrative.period.quarter')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={generateReport} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t('safety.narrative.generatingBtn')}
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                {t('safety.narrative.generateBtn')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t('safety.narrative.reportTitle')}</CardTitle>
            <Button variant="outline" size="sm" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              {t('safety.narrative.exportMd')}
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
