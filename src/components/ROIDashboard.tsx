import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, TrendingDown, Users, Calculator } from 'lucide-react';
import { useStressData } from '@/hooks/useStressData';
import { calculateROI, formatCurrency, type ROIInputs } from '@/services/roiCalculator';
import { useI18n } from '@/i18n';

export default function ROIDashboard() {
  const { lang, t } = useI18n();
  const [roiData, setRoiData] = useState<ROIInputs>({
    totalEmployees: 100,
    avgSalary: 5000,
    turnoverRate: 15,
    absenteeismDays: 12,
  });

  const { trend } = useStressData({ days: 30 });
  const stressReduction = trend?.direction === 'improving'
    ? Math.max(0, trend.olderHighPercent - trend.recentHighPercent)
    : 0;

  const roi = useMemo(() => calculateROI(roiData), [roiData]);

  const updateField = (field: keyof ROIInputs, value: string) => {
    setRoiData(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            {t('insights.roi.title')}
          </CardTitle>
          <CardDescription>
            {t('insights.roi.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employees" className="text-xs">{t('insights.roi.input.employees')}</Label>
              <Input id="employees" type="number" value={roiData.totalEmployees}
                onChange={(e) => updateField('totalEmployees', e.target.value)} className="h-9" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary" className="text-xs">{t('insights.roi.input.salary')}</Label>
              <Input id="salary" type="number" value={roiData.avgSalary}
                onChange={(e) => updateField('avgSalary', e.target.value)} className="h-9" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="turnover" className="text-xs">{t('insights.roi.input.turnover')}</Label>
              <Input id="turnover" type="number" value={roiData.turnoverRate}
                onChange={(e) => updateField('turnoverRate', e.target.value)} className="h-9" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="absenteeism" className="text-xs">{t('insights.roi.input.absenteeism')}</Label>
              <Input id="absenteeism" type="number" value={roiData.absenteeismDays}
                onChange={(e) => updateField('absenteeismDays', e.target.value)} className="h-9" />
            </div>
          </div>

          {/* Current Cost without NeuroSuite */}
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                {t('insights.roi.currentCost.title')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">{t('insights.roi.currentCost.turnover')}</p>
                  <p className="text-lg font-bold text-destructive">{formatCurrency(roi.annualTurnoverCost, lang)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">{t('insights.roi.currentCost.absenteeism')}</p>
                  <p className="text-lg font-bold text-destructive">{formatCurrency(roi.annualAbsenteeismCost, lang)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">{t('insights.roi.currentCost.total')}</p>
                  <p className="text-xl font-bold text-destructive">{formatCurrency(roi.totalCostWithoutNeuroSuite, lang)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings with NeuroSuite */}
          <Card className="bg-success/5 border-success/20" style={{ borderColor: 'hsl(var(--success) / 0.2)' }}>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'hsl(var(--success))' }}>
                <DollarSign className="h-4 w-4" />
                {t('insights.roi.savings.title')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">{t('insights.roi.savings.turnover')}</p>
                  <p className="text-lg font-bold" style={{ color: 'hsl(var(--success))' }}>{formatCurrency(roi.savingsTurnover, lang)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">{t('insights.roi.savings.absenteeism')}</p>
                  <p className="text-lg font-bold" style={{ color: 'hsl(var(--success))' }}>{formatCurrency(roi.savingsAbsenteeism, lang)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">{t('insights.roi.savings.total')}</p>
                  <p className="text-xl font-bold" style={{ color: 'hsl(var(--success))' }}>{formatCurrency(roi.totalSavings, lang)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Final ROI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('insights.roi.final.investment')}</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(roi.annualNeuroSuiteCost, lang)}</p>
              <p className="text-[10px] text-muted-foreground">{t('insights.roi.final.investmentRate')}</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('insights.roi.final.netROI')}</p>
              <p className="text-xl font-bold text-accent">{formatCurrency(roi.netROI, lang)}</p>
            </div>
            <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('insights.roi.final.roiPercentage')}</p>
              <p className="text-3xl font-bold text-secondary">{roi.roiPercentage.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR')}%</p>
              <p className="text-[10px] text-muted-foreground">{t('insights.roi.final.roiSubtitle')}</p>
            </div>
          </div>

          {/* Real stress reduction */}
          {stressReduction > 0 && (
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-sm">{t('insights.roi.realData.title')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('insights.roi.realData.text', { reduction: stressReduction.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR') })}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            {t('insights.roi.benchmark.footnote')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
