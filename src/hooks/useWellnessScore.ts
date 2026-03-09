import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WellnessBreakdown {
  stressScore: number;    // 0-40 points (lower stress = higher score)
  consistencyScore: number; // 0-30 points (streak & frequency)
  hrvScore: number;        // 0-30 points (higher HRV = better)
}

export interface WellnessData {
  score: number;           // 0-100 overall
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

function getColor(score: number): string {
  if (score >= 80) return 'hsl(var(--success))';
  if (score >= 60) return 'hsl(185, 65%, 38%)';
  if (score >= 40) return 'hsl(var(--warning))';
  return 'hsl(var(--destructive))';
}

function computeStressScore(scans: { stress_level: string }[]): number {
  if (scans.length === 0) return 0;
  const recent = scans.slice(0, 10); // last 10 scans
  const points = recent.map(s => {
    if (s.stress_level === 'low') return 40;
    if (s.stress_level === 'moderate') return 24;
    return 8; // high
  });
  return Math.round(points.reduce((a, b) => a + b, 0) / points.length);
}

function computeConsistencyScore(streak: number, totalScans: number): number {
  // Streak contributes up to 20 points (max at 14 days)
  const streakPart = Math.min(streak / 14, 1) * 20;
  // Total scans contribute up to 10 points (max at 30 scans)
  const scansPart = Math.min(totalScans / 30, 1) * 10;
  return Math.round(streakPart + scansPart);
}

function computeHrvScore(scans: { hrv_value: number | null }[]): number {
  const withHrv = scans.filter(s => s.hrv_value != null);
  if (withHrv.length === 0) return 15; // neutral default
  const avgHrv = withHrv.reduce((sum, s) => sum + (s.hrv_value ?? 0), 0) / withHrv.length;
  // HRV 20-80ms range mapped to 0-30 points
  return Math.round(Math.min(Math.max((avgHrv - 20) / 60, 0), 1) * 30);
}

export function useWellnessScore(): WellnessData {
  const [data, setData] = useState<Omit<WellnessData, 'refresh'>>({
    score: 0,
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
      setData(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    compute();
  }, [compute]);

  return { ...data, refresh: compute };
}
