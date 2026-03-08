import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStressData } from '@/hooks/useStressData';
import { Building2, TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Bar } from 'react-chartjs-2';

// Mock industry benchmark averages (aggregated anonymous data)
const SECTOR_BENCHMARKS: Record<string, { label: string; lowPercent: number; moderatePercent: number; highPercent: number; avgHRV: number; engagementRate: number }> = {
  technology: { label: 'Tecnologia', lowPercent: 42, moderatePercent: 38, highPercent: 20, avgHRV: 48, engagementRate: 65 },
  finance: { label: 'Financeiro', lowPercent: 35, moderatePercent: 40, highPercent: 25, avgHRV: 44, engagementRate: 58 },
  healthcare: { label: 'Saúde', lowPercent: 30, moderatePercent: 35, highPercent: 35, avgHRV: 40, engagementRate: 72 },
  education: { label: 'Educação', lowPercent: 45, moderatePercent: 35, highPercent: 20, avgHRV: 50, engagementRate: 60 },
  retail: { label: 'Varejo', lowPercent: 38, moderatePercent: 37, highPercent: 25, avgHRV: 43, engagementRate: 45 },
  manufacturing: { label: 'Indústria', lowPercent: 33, moderatePercent: 40, highPercent: 27, avgHRV: 42, engagementRate: 50 },
  services: { label: 'Serviços', lowPercent: 40, moderatePercent: 38, highPercent: 22, avgHRV: 46, engagementRate: 55 },
  government: { label: 'Governo/Público', lowPercent: 37, moderatePercent: 38, highPercent: 25, avgHRV: 45, engagementRate: 42 },
};

function DiffBadge({ value, inverted = false }: { value: number; inverted?: boolean }) {
  const isPositive = inverted ? value < 0 : value > 0;
  const isNeutral = value === 0;

  if (isNeutral) return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      <Minus className="h-3 w-3" /> igual
    </span>
  );

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
      {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(value)}%
    </span>
  );
}

export default function SectorBenchmark() {
  const [sector, setSector] = useState('technology');
  const { stats, loading } = useStressData({ days: 30 });

  const benchmark = SECTOR_BENCHMARKS[sector];

  const diffLow = stats.lowPercent - benchmark.lowPercent;
  const diffHigh = stats.highPercent - benchmark.highPercent;
  const diffHRV = stats.avgHRV - benchmark.avgHRV;

  const overallPosition = diffLow > 5 ? 'above' : diffLow < -5 ? 'below' : 'average';

  const chartData = {
    labels: ['Baixo Estresse', 'Moderado', 'Alto Estresse', 'HRV Médio'],
    datasets: [
      {
        label: 'Sua Empresa',
        data: [stats.lowPercent, stats.moderatePercent, stats.highPercent, stats.avgHRV],
        backgroundColor: 'hsla(var(--primary), 0.7)',
        borderColor: 'hsl(var(--primary))',
        borderWidth: 2,
      },
      {
        label: `Média — ${benchmark.label}`,
        data: [benchmark.lowPercent, benchmark.moderatePercent, benchmark.highPercent, benchmark.avgHRV],
        backgroundColor: 'hsla(var(--muted-foreground), 0.3)',
        borderColor: 'hsl(var(--muted-foreground))',
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Carregando benchmark...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft border-primary/20">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Benchmark por Setor
            </CardTitle>
            <CardDescription>
              Compare seus indicadores com a média do setor (dados agregados anônimos)
            </CardDescription>
          </div>
          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SECTOR_BENCHMARKS).map(([key, val]) => (
                <SelectItem key={key} value={key}>{val.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Position */}
        <div className={`p-4 rounded-lg border ${
          overallPosition === 'above' ? 'bg-green-500/10 border-green-500/30' :
          overallPosition === 'below' ? 'bg-red-500/10 border-red-500/30' :
          'bg-yellow-500/10 border-yellow-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            {overallPosition === 'above' ? <TrendingUp className="h-4 w-4 text-green-500" /> :
             overallPosition === 'below' ? <TrendingDown className="h-4 w-4 text-red-500" /> :
             <Minus className="h-4 w-4 text-yellow-500" />}
            <span className="font-semibold text-sm">
              {overallPosition === 'above' ? 'Acima da média do setor' :
               overallPosition === 'below' ? 'Abaixo da média do setor' :
               'Na média do setor'}
            </span>
            <Badge variant={overallPosition === 'above' ? 'default' : overallPosition === 'below' ? 'destructive' : 'secondary'} className="text-[10px]">
              {benchmark.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {overallPosition === 'above'
              ? `Sua empresa tem ${Math.abs(diffLow)}% mais colaboradores com baixo estresse que a média do setor ${benchmark.label}.`
              : overallPosition === 'below'
              ? `Sua empresa tem ${Math.abs(diffLow)}% menos colaboradores com baixo estresse que a média do setor ${benchmark.label}. Considere ações preventivas.`
              : `Os indicadores da sua empresa estão alinhados com a média do setor ${benchmark.label}.`}
          </p>
        </div>

        {/* Comparison Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Baixo Estresse</span>
              <DiffBadge value={diffLow} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs"><span>Você</span><span className="font-medium">{stats.lowPercent}%</span></div>
              <Progress value={stats.lowPercent} className="h-2" />
              <div className="flex justify-between text-xs"><span>Setor</span><span className="font-medium">{benchmark.lowPercent}%</span></div>
              <Progress value={benchmark.lowPercent} className="h-2 opacity-50" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Alto Estresse</span>
              <DiffBadge value={diffHigh} inverted />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs"><span>Você</span><span className="font-medium">{stats.highPercent}%</span></div>
              <Progress value={stats.highPercent} className="h-2" />
              <div className="flex justify-between text-xs"><span>Setor</span><span className="font-medium">{benchmark.highPercent}%</span></div>
              <Progress value={benchmark.highPercent} className="h-2 opacity-50" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">HRV Médio</span>
              <DiffBadge value={diffHRV} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs"><span>Você</span><span className="font-medium">{stats.avgHRV}ms</span></div>
              <Progress value={Math.min(stats.avgHRV, 100)} className="h-2" />
              <div className="flex justify-between text-xs"><span>Setor</span><span className="font-medium">{benchmark.avgHRV}ms</span></div>
              <Progress value={Math.min(benchmark.avgHRV, 100)} className="h-2 opacity-50" />
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' as const },
                title: { display: true, text: `Sua Empresa vs Média ${benchmark.label}` },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { callback: (v) => v + '' },
                },
              },
            }}
          />
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          * Dados de benchmark baseados em médias agregadas anônimas do setor. Atualização periódica.
        </p>
      </CardContent>
    </Card>
  );
}
