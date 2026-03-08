import type { StressScan, StressStats, StressTrend } from '@/types/stress';

const EMPTY_STATS: StressStats = {
  lowPercent: 0,
  moderatePercent: 0,
  highPercent: 0,
  totalScans: 0,
  avgHRV: 0,
};

export function computeStats(scans: StressScan[]): StressStats {
  const total = scans.length;
  if (total === 0) return EMPTY_STATS;

  const low = scans.filter(s => s.stress_level === 'low').length;
  const moderate = scans.filter(s => s.stress_level === 'moderate').length;
  const high = scans.filter(s => s.stress_level === 'high').length;

  const hrvValues = scans
    .filter(s => s.hrv_value != null)
    .map(s => Number(s.hrv_value));
  const avgHRV = hrvValues.length > 0
    ? Math.round(hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length)
    : 0;

  return {
    lowPercent: Math.round((low / total) * 100),
    moderatePercent: Math.round((moderate / total) * 100),
    highPercent: Math.round((high / total) * 100),
    totalScans: total,
    avgHRV,
  };
}

export function computeTrend(scans: StressScan[]): StressTrend | null {
  if (scans.length < 4) return null;

  const half = Math.floor(scans.length / 2);
  const recentHighPercent = scans.slice(0, half).filter(s => s.stress_level === 'high').length / half;
  const olderHighPercent = scans.slice(half).filter(s => s.stress_level === 'high').length / (scans.length - half);

  let direction: StressTrend['direction'] = 'stable';
  if (recentHighPercent > olderHighPercent * 1.2) direction = 'worsening';
  else if (recentHighPercent < olderHighPercent * 0.8) direction = 'improving';

  return {
    direction,
    recentHighPercent: Math.round(recentHighPercent * 100),
    olderHighPercent: Math.round(olderHighPercent * 100),
  };
}

export function computeConsecutiveHighDays(scans: StressScan[]): number {
  const scansByDay = new Map<string, string[]>();
  scans.forEach(s => {
    if (!s.created_at) return;
    const day = new Date(s.created_at).toISOString().split('T')[0];
    if (!scansByDay.has(day)) scansByDay.set(day, []);
    scansByDay.get(day)!.push(s.stress_level);
  });

  let consecutive = 0;
  const sortedDays = Array.from(scansByDay.keys()).sort().reverse();
  for (const day of sortedDays) {
    const dayScans = scansByDay.get(day)!;
    const dayHighPercent = dayScans.filter(s => s === 'high').length / dayScans.length;
    if (dayHighPercent > 0.5) consecutive++;
    else break;
  }
  return consecutive;
}
