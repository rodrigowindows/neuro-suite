import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { StressScan } from '@/types/stress';
import { computeStats, computeTrend, computeConsecutiveHighDays } from '@/services/stressAnalytics';

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
