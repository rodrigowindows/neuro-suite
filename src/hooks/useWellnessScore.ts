import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WellnessBreakdown {
  stressScore: number;    // 0-40 points (lower stress = higher score)
  consistencyScore: number; // 0-30 points (streak & frequency)
  hrvScore: number;        // 0-30 points (higher HRV = better)
}

export interface WellnessData {
  score: number | null;    // 0-100 overall; null while loading or after a failed fetch
  breakdown: WellnessBreakdown;
  label: string;
  color: string;
  trend: 'up' | 'down' | 'stable';
  totalScans: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function getLabel(score: number): string {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bom';
  if (score >= 40) return 'Moderado';
  if (score >= 20) return 'Atenção';
  return 'Crítico';
}

export function getColor(score: number): string {
  if (score >= 80) return 'hsl(var(--success))';
  if (score >= 60) return 'hsl(185, 65%, 38%)';
  if (score >= 40) return 'hsl(var(--warning))';
  return 'hsl(var(--destructive))';
}

export { computeStressScore, computeConsistencyScore, computeHrvScore } from '@/lib/wellnessScoring';
import { computeStressScore, computeConsistencyScore, computeHrvScore } from '@/lib/wellnessScoring';

export function useWellnessScore(): WellnessData {
  const [data, setData] = useState<Omit<WellnessData, 'refresh'>>({
    score: null,
    breakdown: { stressScore: 0, consistencyScore: 0, hrvScore: 0 },
    label: 'Sem dados',
    color: 'hsl(var(--muted-foreground))',
    trend: 'stable',
    totalScans: 0,
    loading: true,
  });

  const compute = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch recent scans (last 30 days)
      const since = new Date();
      since.setDate(since.getDate() - 30);

      const [scansRes, progressRes, olderScansRes] = await Promise.all([
        supabase
          .from('stress_scans')
          .select('stress_level, hrv_value, created_at')
          .eq('user_id', user.id)
          .gte('created_at', since.toISOString())
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('user_progress')
          .select('current_streak, total_scans')
          .eq('user_id', user.id)
          .maybeSingle(),
        // Older scans for trend comparison (30-60 days ago)
        supabase
          .from('stress_scans')
          .select('stress_level, hrv_value')
          .eq('user_id', user.id)
          .lt('created_at', since.toISOString())
          .gte('created_at', new Date(since.getTime() - 30 * 86400000).toISOString())
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      const scans = scansRes.data || [];
      const progress = progressRes.data;
      const olderScans = olderScansRes.data || [];

      const streak = progress?.current_streak || 0;
      const totalScans = progress?.total_scans || 0;

      const stressScore = computeStressScore(scans);
      const consistencyScore = computeConsistencyScore(streak, totalScans);
      const hrvScore = computeHrvScore(scans);
      const score = Math.min(stressScore + consistencyScore + hrvScore, 100);

      // Trend: compare current vs older period
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (olderScans.length >= 3 && scans.length >= 3) {
        const oldStress = computeStressScore(olderScans);
        if (stressScore - oldStress >= 5) trend = 'up';
        else if (oldStress - stressScore >= 5) trend = 'down';
      }

      setData({
        score: scans.length === 0 ? 0 : score,
        breakdown: { stressScore, consistencyScore, hrvScore },
        label: scans.length === 0 ? 'Sem dados' : getLabel(score),
        color: scans.length === 0 ? 'hsl(var(--muted-foreground))' : getColor(score),
        trend,
        totalScans,
        loading: false,
      });
    } catch (err) {
      console.error('useWellnessScore error:', err);
      setData(prev => ({ ...prev, score: null, loading: false }));
    }
  }, []);

  useEffect(() => {
    compute();
  }, [compute]);

  return { ...data, refresh: compute };
}
