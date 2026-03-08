import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, TrendingDown, Users, Calculator } from 'lucide-react';
import { useStressData } from '@/hooks/useStressData';
import { calculateROI, formatCurrency, type ROIInputs } from '@/services/roiCalculator';

export default function ROIDashboard() {
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
            Calculadora de ROI — NeuroSuite
          </CardTitle>
          <CardDescription>
            Simule a economia gerada pela redução de turnover e absenteísmo na sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employees" className="text-xs">Nº Colaboradores</Label>
              <Input id="employees" type="number" value={roiData.totalEmployees}
                onChange={(e) => updateField('totalEmployees', e.target.value)} className="h-9" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary" className="text-xs">Salário Médio (R$)</Label>
              <Input id="salary" type="number" value={roiData.avgSalary}
                onChange={(e) => updateField('avgSalary', e.target.value)} className="h-9" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="turnover" className="text-xs">Turnover Anual (%)</Label>
              <Input id="turnover" type="number" value={roiData.turnoverRate}
                onChange={(e) => updateField('turnoverRate', e.target.value)} className="h-9" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="absenteeism" className="text-xs">Dias Absenteísmo/Ano</Label>
              <Input id="absenteeism" type="number" value={roiData.absenteeismDays}
                onChange={(e) => updateField('absenteeismDays', e.target.value)} className="h-9" />
            </div>
          </div>

          {/* Custo atual SEM NeuroSuite */}
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Custo Atual (sem NeuroSuite)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Custo Turnover/Ano</p>
                  <p className="text-lg font-bold text-destructive">{formatCurrency(roi.annualTurnoverCost)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Custo Absenteísmo/Ano</p>
                  <p className="text-lg font-bold text-destructive">{formatCurrency(roi.annualAbsenteeismCost)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Total Perdas/Ano</p>
                  <p className="text-xl font-bold text-destructive">{formatCurrency(roi.totalCostWithoutNeuroSuite)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Economia COM NeuroSuite */}
          <Card className="bg-success/5 border-success/20" style={{ borderColor: 'hsl(var(--success) / 0.2)' }}>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'hsl(var(--success))' }}>
                <DollarSign className="h-4 w-4" />
                Economia com NeuroSuite (projeção anual)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Redução Turnover (-25%)</p>
                  <p className="text-lg font-bold" style={{ color: 'hsl(var(--success))' }}>{formatCurrency(roi.savingsTurnover)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Redução Absenteísmo (-20%)</p>
                  <p className="text-lg font-bold" style={{ color: 'hsl(var(--success))' }}>{formatCurrency(roi.savingsAbsenteeism)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Total Economia/Ano</p>
                  <p className="text-xl font-bold" style={{ color: 'hsl(var(--success))' }}>{formatCurrency(roi.totalSavings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ROI Final */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">Investimento NeuroSuite/Ano</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(roi.annualNeuroSuiteCost)}</p>
              <p className="text-[10px] text-muted-foreground">R$29/colaborador/mês</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">ROI Líquido/Ano</p>
              <p className="text-xl font-bold text-accent">{formatCurrency(roi.netROI)}</p>
            </div>
            <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">ROI %</p>
              <p className="text-3xl font-bold text-secondary">{roi.roiPercentage}%</p>
              <p className="text-[10px] text-muted-foreground">retorno sobre investimento</p>
            </div>
          </div>

          {/* Redução de estresse real */}
          {stressReduction > 0 && (
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-sm">📊 Dado Real do Seu Time:</p>
                  <p className="text-sm text-muted-foreground">
                    Redução de {stressReduction}% no estresse alto nos últimos 30 dias baseado nos scans realizados.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            * Benchmarks baseados em estudos da Gallup (2023), SHRM e meta-análise de programas de wellness corporativo.
            Custo de substituição = 6x salário mensal (SHRM, 2023).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
