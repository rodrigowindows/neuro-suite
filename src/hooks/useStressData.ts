import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { StressScan, StressStats, StressTrend } from '@/types/stress';
import { computeStats, computeTrend, computeConsecutiveHighDays } from '@/services/stressAnalytics';

interface UseStressDataOptions {
  days?: number;
  limit?: number;
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

export function useStressData(options: UseStressDataOptions = {}): UseStressDataReturn {
  const { days = 7, limit = 500, filterByUser = false } = options;
  const { user } = useAuth();

  const [scans, setScans] = useState<StressScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setScans([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
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
  }, [user?.id, days, limit, filterByUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = computeStats(scans);
  const trend = computeTrend(scans);
  const consecutiveHighDays = computeConsecutiveHighDays(scans);

  return { scans, stats, trend, consecutiveHighDays, loading, error, refresh: fetchData };
}
