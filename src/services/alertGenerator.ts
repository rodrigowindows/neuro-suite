/** Alert generation logic extracted from HRAlerts */

import type { StressStats, StressTrend, AlertThresholds } from '@/types/stress';

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  acknowledged: boolean;
}

export function generateAlerts(
  stats: StressStats,
  trend: StressTrend | null,
  consecutiveHighDays: number,
  thresholds: AlertThresholds,
  lang: 'en' | 'pt' = 'pt',
): Alert[] {
  const alerts: Alert[] = [];
  const isEn = lang === 'en';

  if (stats.highPercent > thresholds.highStressPercent) {
    alerts.push({
      id: 'high_stress',
      type: 'critical',
      title: isEn ? 'High Stress Threshold Exceeded' : 'Limite de Estresse Alto Ultrapassado',
      description: isEn
        ? `${stats.highPercent}% of scans indicate high stress (threshold: ${thresholds.highStressPercent}%). Urgent intervention recommended.`
        : `${stats.highPercent}% dos scans indicam estresse alto (limite: ${thresholds.highStressPercent}%). Intervenção urgente recomendada.`,
      timestamp: new Date(),
      acknowledged: false,
    });
  }

  if (stats.avgHRV > 0 && stats.avgHRV < thresholds.lowHRVThreshold) {
    alerts.push({
      id: 'low_hrv',
      type: 'critical',
      title: isEn ? 'Average HRV Below Threshold' : 'HRV Médio Abaixo do Limite',
      description: isEn
        ? `Average HRV: ${stats.avgHRV}ms (threshold: ${thresholds.lowHRVThreshold}ms). Possible autonomic nervous system overload.`
        : `HRV médio: ${stats.avgHRV}ms (limite: ${thresholds.lowHRVThreshold}ms). Possível sobrecarga do sistema nervoso autônomo.`,
      timestamp: new Date(),
      acknowledged: false,
    });
  }

  if (consecutiveHighDays >= thresholds.consecutiveHighDays) {
    alerts.push({
      id: 'consecutive_high',
      type: 'warning',
      title: isEn ? 'Consecutive High Stress' : 'Estresse Alto Consecutivo',
      description: isEn
        ? `${consecutiveHighDays} consecutive days with majority of scans in high stress. Burnout risk.`
        : `${consecutiveHighDays} dias consecutivos com maioria de scans em estresse alto. Risco de burnout.`,
      timestamp: new Date(),
      acknowledged: false,
    });
  }

  if (trend) {
    if (trend.recentHighPercent > trend.olderHighPercent * 1.5) {
      alerts.push({
        id: 'trend_worsening',
        type: 'warning',
        title: isEn ? 'Worsening Trend Detected' : 'Tendência de Piora Detectada',
        description: isEn
          ? `High stress increased by ${trend.recentHighPercent - trend.olderHighPercent}% in the recent week.`
          : `O estresse alto aumentou ${trend.recentHighPercent - trend.olderHighPercent}% na semana recente.`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }

    if (trend.recentHighPercent < trend.olderHighPercent * 0.5 && trend.olderHighPercent > 0) {
      alerts.push({
        id: 'trend_improving',
        type: 'info',
        title: isEn ? 'Improving Trend' : 'Tendência de Melhora',
        description: isEn
          ? 'High stress decreased significantly. Countermeasures are working!'
          : 'O estresse alto reduziu significativamente. As intervenções estão funcionando!',
        timestamp: new Date(),
        acknowledged: false,
      });
    }
  }

  if (stats.totalScans < 3) {
    alerts.push({
      id: 'low_engagement',
      type: 'info',
      title: isEn ? 'Low Engagement' : 'Baixo Engajamento',
      description: isEn
        ? `Only ${stats.totalScans} scans in the last 7 days. Encourage regular check-ins.`
        : `Apenas ${stats.totalScans} scans nos últimos 7 dias. Incentive o uso regular.`,
      timestamp: new Date(),
      acknowledged: false,
    });
  }

  return alerts;
}

export function sortAlerts(alerts: Alert[]): Alert[] {
  const priority: Record<Alert['type'], number> = { critical: 0, warning: 1, info: 2 };
  return [...alerts].sort((a, b) => priority[a.type] - priority[b.type]);
}

export function getAlertStyles(type: Alert['type']) {
  switch (type) {
    case 'critical': return { bg: 'bg-destructive/10', border: 'border-destructive/30', icon: 'text-destructive' };
    case 'warning': return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: 'text-orange-500' };
    case 'info': return { bg: 'bg-primary/10', border: 'border-primary/30', icon: 'text-primary' };
  }
}
