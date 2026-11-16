import { useI18n } from '@/i18n';
import CompanyScoreCard from '@/components/CompanyScoreCard';
import TurnoverPrediction from '@/components/TurnoverPrediction';
import SectorBenchmark from '@/components/SectorBenchmark';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Download, TrendingUp } from 'lucide-react';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useStressData } from '@/hooks/useStressData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function getPrediction(
  highPercent: number,
  moderatePercent: number,
  lowPercent: number,
  t: (key: string, vars?: Record<string, string | number>) => string
): string {
  if (highPercent > 30) {
    return `⚠️ ${t('command.dashboard.prediction.high', { percent: highPercent })}`;
  }
  if (moderatePercent > 50) {
    return `⚡ ${t('command.dashboard.prediction.moderate', { percent: moderatePercent })}`;
  }
  return `✅ ${t('command.dashboard.prediction.low', { percent: lowPercent })}`;
}

export default function DashboardRH() {
  const { t } = useI18n();
  const { stats, loading } = useStressData({ days: 7 });

  const prediction = getPrediction(stats.highPercent, stats.moderatePercent, stats.lowPercent, t);

  const exportCSV = () => {
    const csv = `${t('command.dashboard.csv.headerMetric')},${t('command.dashboard.csv.headerValue')}
${t('command.dashboard.csv.lowStress')},${stats.lowPercent}
${t('command.dashboard.csv.moderateStress')},${stats.moderatePercent}
${t('command.dashboard.csv.highStress')},${stats.highPercent}
${t('command.dashboard.csv.totalScans')},${stats.totalScans}
${t('command.dashboard.csv.avgHrv')},${stats.avgHRV}
${t('command.dashboard.csv.prediction')},"${prediction}"`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-rh-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const chartData = {
    labels: [
      t('command.dashboard.chart.low'),
      t('command.dashboard.chart.moderate'),
      t('command.dashboard.chart.high')
    ],
    datasets: [
      {
        label: t('command.dashboard.chart.dataset'),
        data: [stats.lowPercent, stats.moderatePercent, stats.highPercent],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(234, 179, 8, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">{t('command.dashboard.loading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Score */}
      <CompanyScoreCard />

      {/* Turnover Prediction */}
      <TurnoverPrediction />

      {/* Sector Benchmark */}
      <SectorBenchmark />

      <Card className="shadow-soft border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            {t('command.dashboard.title')}
          </CardTitle>
          <CardDescription>
            {t('command.dashboard.description')}
          </CardDescription>
          <Button onClick={exportCSV} variant="outline" size="sm" className="mt-3">
            <Download className="mr-2 h-4 w-4" />
            {t('command.dashboard.exportCsv')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-xs text-muted-foreground mb-1">{t('command.dashboard.stats.lowStress')}</p>
              <p className="text-3xl font-bold text-green-500">{stats.lowPercent}%</p>
            </div>
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-xs text-muted-foreground mb-1">{t('command.dashboard.stats.moderate')}</p>
              <p className="text-3xl font-bold text-yellow-500">{stats.moderatePercent}%</p>
            </div>
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <p className="text-xs text-muted-foreground mb-1">{t('command.dashboard.stats.highStress')}</p>
              <p className="text-3xl font-bold text-red-500">{stats.highPercent}%</p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-xs text-muted-foreground mb-1">{t('command.dashboard.stats.avgHrv')}</p>
              <p className="text-3xl font-bold text-blue-500">{stats.avgHRV}<span className="text-sm">ms</span></p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: {
                    display: true,
                    text: t('command.dashboard.chart.title'),
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: (value) => value + '%',
                    },
                  },
                },
              }}
            />
          </div>

          {/* Prediction */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm mb-1">🤖 {t('command.dashboard.prediction.title')}</p>
                  <p className="text-sm text-muted-foreground">{prediction}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics */}
          <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
            <p className="font-semibold mb-1">📊 {t('command.dashboard.metrics.title')}</p>
            <p>• {t('command.dashboard.metrics.totalScans', { count: stats.totalScans })}</p>
            <p>• {t('command.dashboard.metrics.avgHrv', {
              val: stats.avgHRV,
              status: stats.avgHRV > 50
                ? t('command.dashboard.metrics.hrvGood')
                : stats.avgHRV > 30
                ? t('command.dashboard.metrics.hrvNormal')
                : t('command.dashboard.metrics.hrvAttention')
            })}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
