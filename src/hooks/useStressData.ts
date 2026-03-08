import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { StressScan, StressStats, StressTrend } from '@/types/stress';

interface UseStressDataOptions {
  /** Number of days to look back (default: 7) */
  days?: number;
  /** Max rows to fetch (default: 500) */
  limit?: number;
  /** Whether to filter by current user (false = team view via RLS) */
  filterByUser?: boolean;
}

interface UseStressDataReturn {
  scans: StressScan[];
  stats: StressStats;
  trend: StressTrend | null;
  consecutiveHighDays: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const EMPTY_STATS: StressStats = {
  lowPercent: 0,
  moderatePercent: 0,
  highPercent: 0,
  totalScans: 0,
  avgHRV: 0,
};

function computeStats(scans: StressScan[]): StressStats {
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

function computeTrend(scans: StressScan[]): StressTrend | null {
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

function computeConsecutiveHighDays(scans: StressScan[]): number {
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

export function useStressData(options: UseStressDataOptions = {}): UseStressDataReturn {
  const { days = 7, limit = 500, filterByUser = false } = options;

  const [scans, setScans] = useState<StressScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const since = new Date();
      since.setDate(since.getDate() - days);

      let query = supabase
        .from('stress_scans')
        .select('stress_level, hrv_value, created_at')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (filterByUser) {
        query = query.eq('user_id', user.id);
      }

      const { data, error: queryError } = await query;
      if (queryError) throw queryError;
      setScans(data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(message);
      console.error('useStressData error:', err);
    } finally {
      setLoading(false);
    }
  }, [days, limit, filterByUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = computeStats(scans);
  const trend = computeTrend(scans);
  const consecutiveHighDays = computeConsecutiveHighDays(scans);

  return { scans, stats, trend, consecutiveHighDays, loading, error, refresh: fetchData };
}
