import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, TrendingDown, Users, Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ROIData {
  totalEmployees: number;
  avgSalary: number;
  turnoverRate: number;
  absenteeismDays: number;
}

export default function ROIDashboard() {
  const [roiData, setRoiData] = useState<ROIData>({
    totalEmployees: 100,
    avgSalary: 5000,
    turnoverRate: 15,
    absenteeismDays: 12,
  });
  const [stressReduction, setStressReduction] = useState(0);

  useEffect(() => {
    loadStressData();
  }, []);

  const loadStressData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // No user_id filter - managers see all team data via RLS
      const { data: scans } = await supabase
        .from('stress_scans')
        .select('stress_level, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true })
        .limit(500);

      if (scans && scans.length >= 2) {
        const half = Math.floor(scans.length / 2);
        const firstHalf = scans.slice(0, half);
        const secondHalf = scans.slice(half);

        const highFirst = firstHalf.filter(s => s.stress_level === 'high').length / firstHalf.length;
        const highSecond = secondHalf.filter(s => s.stress_level === 'high').length / secondHalf.length;

        const reduction = Math.max(0, Math.round((highFirst - highSecond) * 100));
        setStressReduction(reduction);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de estresse:', error);
    }
  };

  // Cálculos de ROI
  const turnoverCostPerEmployee = roiData.avgSalary * 6; // 6 meses de salário para substituir
  const annualTurnoverCost = (roiData.totalEmployees * (roiData.turnoverRate / 100)) * turnoverCostPerEmployee;
  const absenteeismCostPerDay = roiData.avgSalary / 22; // custo por dia útil
  const annualAbsenteeismCost = roiData.totalEmployees * roiData.absenteeismDays * absenteeismCostPerDay;
  const totalCostWithoutNeuroSuite = annualTurnoverCost + annualAbsenteeismCost;

  // NeuroSuite reduz turnover em 25% e absenteísmo em 20% (benchmarks do mercado)
  const turnoverReductionRate = 0.25;
  const absenteeismReductionRate = 0.20;
  const savingsTurnover = annualTurnoverCost * turnoverReductionRate;
  const savingsAbsenteeism = annualAbsenteeismCost * absenteeismReductionRate;
  const totalSavings = savingsTurnover + savingsAbsenteeism;

  const neuroSuiteCost = roiData.totalEmployees * 29; // R$29/colaborador/mês
  const annualNeuroSuiteCost = neuroSuiteCost * 12;
  const netROI = totalSavings - annualNeuroSuiteCost;
  const roiPercentage = annualNeuroSuiteCost > 0 ? Math.round((netROI / annualNeuroSuiteCost) * 100) : 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

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
              <Input
                id="employees"
                type="number"
                value={roiData.totalEmployees}
                onChange={(e) => setRoiData({ ...roiData, totalEmployees: Number(e.target.value) || 0 })}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary" className="text-xs">Salário Médio (R$)</Label>
              <Input
                id="salary"
                type="number"
                value={roiData.avgSalary}
                onChange={(e) => setRoiData({ ...roiData, avgSalary: Number(e.target.value) || 0 })}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="turnover" className="text-xs">Turnover Anual (%)</Label>
              <Input
                id="turnover"
                type="number"
                value={roiData.turnoverRate}
                onChange={(e) => setRoiData({ ...roiData, turnoverRate: Number(e.target.value) || 0 })}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="absenteeism" className="text-xs">Dias Absenteísmo/Ano</Label>
              <Input
                id="absenteeism"
                type="number"
                value={roiData.absenteeismDays}
                onChange={(e) => setRoiData({ ...roiData, absenteeismDays: Number(e.target.value) || 0 })}
                className="h-9"
              />
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
                  <p className="text-lg font-bold text-destructive">{formatCurrency(annualTurnoverCost)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Custo Absenteísmo/Ano</p>
                  <p className="text-lg font-bold text-destructive">{formatCurrency(annualAbsenteeismCost)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Total Perdas/Ano</p>
                  <p className="text-xl font-bold text-destructive">{formatCurrency(totalCostWithoutNeuroSuite)}</p>
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
                  <p className="text-lg font-bold" style={{ color: 'hsl(var(--success))' }}>{formatCurrency(savingsTurnover)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Redução Absenteísmo (-20%)</p>
                  <p className="text-lg font-bold" style={{ color: 'hsl(var(--success))' }}>{formatCurrency(savingsAbsenteeism)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Total Economia/Ano</p>
                  <p className="text-xl font-bold" style={{ color: 'hsl(var(--success))' }}>{formatCurrency(totalSavings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ROI Final */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">Investimento NeuroSuite/Ano</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(annualNeuroSuiteCost)}</p>
              <p className="text-[10px] text-muted-foreground">R$29/colaborador/mês</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">ROI Líquido/Ano</p>
              <p className="text-xl font-bold text-accent">{formatCurrency(netROI)}</p>
            </div>
            <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">ROI %</p>
              <p className="text-3xl font-bold text-secondary">{roiPercentage}%</p>
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
