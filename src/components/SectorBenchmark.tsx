import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStressData } from '@/hooks/useStressData';
import { useI18n } from '@/i18n';
import { Building2, TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Bar } from 'react-chartjs-2';

// Mock industry benchmark averages (aggregated anonymous data)
const SECTOR_BENCHMARKS: Record<
  string,
  { labelKey: string; lowPercent: number; moderatePercent: number; highPercent: number; avgHRV: number; engagementRate: number }
> = {
  technology: { labelKey: 'command.benchmark.sector.technology', lowPercent: 42, moderatePercent: 38, highPercent: 20, avgHRV: 48, engagementRate: 65 },
  finance: { labelKey: 'command.benchmark.sector.finance', lowPercent: 35, moderatePercent: 40, highPercent: 25, avgHRV: 44, engagementRate: 58 },
  healthcare: { labelKey: 'command.benchmark.sector.healthcare', lowPercent: 30, moderatePercent: 35, highPercent: 35, avgHRV: 40, engagementRate: 72 },
  education: { labelKey: 'command.benchmark.sector.education', lowPercent: 45, moderatePercent: 35, highPercent: 20, avgHRV: 50, engagementRate: 60 },
  retail: { labelKey: 'command.benchmark.sector.retail', lowPercent: 38, moderatePercent: 37, highPercent: 25, avgHRV: 43, engagementRate: 45 },
  manufacturing: { labelKey: 'command.benchmark.sector.manufacturing', lowPercent: 33, moderatePercent: 40, highPercent: 27, avgHRV: 42, engagementRate: 50 },
  services: { labelKey: 'command.benchmark.sector.services', lowPercent: 40, moderatePercent: 38, highPercent: 22, avgHRV: 46, engagementRate: 55 },
  government: { labelKey: 'command.benchmark.sector.government', lowPercent: 37, moderatePercent: 38, highPercent: 25, avgHRV: 45, engagementRate: 42 },
};

function DiffBadge({ value, inverted = false, equalText }: { value: number; inverted?: boolean; equalText: string }) {
  const isPositive = inverted ? value < 0 : value > 0;
  const isNeutral = value === 0;

  if (isNeutral) return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      <Minus className="h-3 w-3" /> {equalText}
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
  const { t } = useI18n();
  const [sector, setSector] = useState('technology');
  const { stats, loading } = useStressData({ days: 30 });

  const benchmark = SECTOR_BENCHMARKS[sector];
  const benchmarkLabel = t(benchmark.labelKey);

  const diffLow = stats.lowPercent - benchmark.lowPercent;
  const diffHigh = stats.highPercent - benchmark.highPercent;
  const diffHRV = stats.avgHRV - benchmark.avgHRV;

  const overallPosition = diffLow > 5 ? 'above' : diffLow < -5 ? 'below' : 'average';

  const chartData = {
    labels: [
      t('command.benchmark.chart.low'),
      t('command.benchmark.chart.moderate'),
      t('command.benchmark.chart.high'),
      t('command.benchmark.chart.avgHrv')
    ],
    datasets: [
      {
        label: t('command.benchmark.chart.labelCompany'),
        data: [stats.lowPercent, stats.moderatePercent, stats.highPercent, stats.avgHRV],
        backgroundColor: 'hsla(var(--primary), 0.7)',
        borderColor: 'hsl(var(--primary))',
        borderWidth: 2,
      },
      {
        label: t('command.benchmark.chart.labelSector', { sector: benchmarkLabel }),
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
          <p className="text-sm text-muted-foreground">{t('command.benchmark.loading')}</p>
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
              {t('command.benchmark.title')}
            </CardTitle>
            <CardDescription>
              {t('command.benchmark.description')}
            </CardDescription>
          </div>
          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SECTOR_BENCHMARKS).map(([key, val]) => (
                <SelectItem key={key} value={key}>{t(val.labelKey)}</SelectItem>
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
              {overallPosition === 'above'
                ? t('command.benchmark.overall.above')
                : overallPosition === 'below'
                ? t('command.benchmark.overall.below')
                : t('command.benchmark.overall.average')}
            </span>
            <Badge variant={overallPosition === 'above' ? 'default' : overallPosition === 'below' ? 'destructive' : 'secondary'} className="text-[10px]">
              {benchmarkLabel}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {overallPosition === 'above'
              ? t('command.benchmark.overall.aboveDesc', { diff: Math.abs(diffLow), sector: benchmarkLabel })
              : overallPosition === 'below'
              ? t('command.benchmark.overall.belowDesc', { diff: Math.abs(diffLow), sector: benchmarkLabel })
              : t('command.benchmark.overall.averageDesc', { sector: benchmarkLabel })}
          </p>
        </div>

        {/* Comparison Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{t('command.benchmark.metric.lowStress')}</span>
              <DiffBadge value={diffLow} equalText={t('command.benchmark.diff.equal')} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{t('command.benchmark.metric.you')}</span>
                <span className="font-medium">{stats.lowPercent}%</span>
              </div>
              <Progress value={stats.lowPercent} className="h-2" />
              <div className="flex justify-between text-xs">
                <span>{t('command.benchmark.metric.sector')}</span>
                <span className="font-medium">{benchmark.lowPercent}%</span>
              </div>
              <Progress value={benchmark.lowPercent} className="h-2 opacity-50" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{t('command.benchmark.metric.highStress')}</span>
              <DiffBadge value={diffHigh} inverted equalText={t('command.benchmark.diff.equal')} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{t('command.benchmark.metric.you')}</span>
                <span className="font-medium">{stats.highPercent}%</span>
              </div>
              <Progress value={stats.highPercent} className="h-2" />
              <div className="flex justify-between text-xs">
                <span>{t('command.benchmark.metric.sector')}</span>
                <span className="font-medium">{benchmark.highPercent}%</span>
              </div>
              <Progress value={benchmark.highPercent} className="h-2 opacity-50" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{t('command.benchmark.metric.avgHrv')}</span>
              <DiffBadge value={diffHRV} equalText={t('command.benchmark.diff.equal')} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{t('command.benchmark.metric.you')}</span>
                <span className="font-medium">{stats.avgHRV}ms</span>
              </div>
              <Progress value={Math.min(stats.avgHRV, 100)} className="h-2" />
              <div className="flex justify-between text-xs">
                <span>{t('command.benchmark.metric.sector')}</span>
                <span className="font-medium">{benchmark.avgHRV}ms</span>
              </div>
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
                title: { display: true, text: t('command.benchmark.chart.title', { sector: benchmarkLabel }) },
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
          {t('command.benchmark.footnote')}
        </p>
      </CardContent>
    </Card>
  );
}
