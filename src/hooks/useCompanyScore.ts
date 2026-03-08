import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyScoreData {
  overallScore: number;       // 0-100
  label: string;
  color: string;
  totalEmployees: number;
  activeEmployees: number;    // scanned in last 30 days
  adoptionRate: number;       // % of employees who scanned
  avgStressScore: number;
  avgHrvScore: number;
  distribution: {
    excellent: number;  // 80-100
    good: number;       // 60-79
    moderate: number;   // 40-59
    attention: number;  // 0-39
  };
  trend: 'up' | 'down' | 'stable';
  loading: boolean;
  refresh: () => Promise<void>;
}

function getLabel(score: number): string {
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

function stressLevelToScore(level: string): number {
  if (level === 'low') return 40;
  if (level === 'moderate') return 24;
  return 8;
}

export function useCompanyScore(): CompanyScoreData {
  const [data, setData] = useState<Omit<CompanyScoreData, 'refresh'>>({
    overallScore: 0,
    label: 'Sem dados',
    color: 'hsl(var(--muted-foreground))',
    totalEmployees: 0,
    activeEmployees: 0,
    adoptionRate: 0,
    avgStressScore: 0,
    avgHrvScore: 0,
    distribution: { excellent: 0, good: 0, moderate: 0, attention: 0 },
    trend: 'stable',
    loading: true,
  });

  const compute = useCallback(async () => {
    try {
      const since30 = new Date();
      since30.setDate(since30.getDate() - 30);
      const since60 = new Date(since30.getTime() - 30 * 86400000);

      // Fetch all scans (manager RLS allows this) and profiles count
      const [scansRes, olderScansRes, profilesRes] = await Promise.all([
        supabase
          .from('stress_scans')
          .select('user_id, stress_level, hrv_value')
          .gte('created_at', since30.toISOString())
          .limit(1000),
        supabase
          .from('stress_scans')
          .select('user_id, stress_level, hrv_value')
          .gte('created_at', since60.toISOString())
          .lt('created_at', since30.toISOString())
          .limit(1000),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true }),
      ]);

      const scans = scansRes.data || [];
      const olderScans = olderScansRes.data || [];
      const totalEmployees = profilesRes.count || 0;

      if (scans.length === 0) {
        setData(prev => ({ ...prev, totalEmployees, loading: false }));
        return;
      }

      // Group scans by user and compute per-user scores
      const userScans = new Map<string, { stressScores: number[]; hrvValues: number[] }>();
      for (const scan of scans) {
        if (!userScans.has(scan.user_id)) {
          userScans.set(scan.user_id, { stressScores: [], hrvValues: [] });
        }
        const u = userScans.get(scan.user_id)!;
        u.stressScores.push(stressLevelToScore(scan.stress_level));
        if (scan.hrv_value != null) u.hrvValues.push(scan.hrv_value);
      }

      const activeEmployees = userScans.size;
      const adoptionRate = totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0;

      // Compute individual wellness scores (simplified: stress 60% + hrv 40%)
      const individualScores: number[] = [];
      userScans.forEach((u) => {
        const avgStress = u.stressScores.reduce((a, b) => a + b, 0) / u.stressScores.length;
        const stressPart = (avgStress / 40) * 60; // normalize to 60 pts
        const avgHrv = u.hrvValues.length > 0
          ? u.hrvValues.reduce((a, b) => a + b, 0) / u.hrvValues.length
          : 40; // default
        const hrvPart = Math.min(Math.max((avgHrv - 20) / 60, 0), 1) * 40;
        individualScores.push(Math.min(Math.round(stressPart + hrvPart), 100));
      });

      const overallScore = Math.round(individualScores.reduce((a, b) => a + b, 0) / individualScores.length);

      // Distribution
      const distribution = { excellent: 0, good: 0, moderate: 0, attention: 0 };
      for (const s of individualScores) {
        if (s >= 80) distribution.excellent++;
        else if (s >= 60) distribution.good++;
        else if (s >= 40) distribution.moderate++;
        else distribution.attention++;
      }

      // Avg metrics
      const allStress = scans.map(s => stressLevelToScore(s.stress_level));
      const avgStressScore = Math.round(allStress.reduce((a, b) => a + b, 0) / allStress.length);
      const hrvScans = scans.filter(s => s.hrv_value != null);
      const avgHrvScore = hrvScans.length > 0
        ? Math.round(hrvScans.reduce((sum, s) => sum + (s.hrv_value ?? 0), 0) / hrvScans.length)
        : 0;

      // Trend from older period
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (olderScans.length >= 5) {
        const olderAvg = olderScans.map(s => stressLevelToScore(s.stress_level));
        const olderScore = Math.round(olderAvg.reduce((a, b) => a + b, 0) / olderAvg.length);
        if (avgStressScore - olderScore >= 3) trend = 'up';
        else if (olderScore - avgStressScore >= 3) trend = 'down';
      }

      setData({
        overallScore,
        label: getLabel(overallScore),
        color: getColor(overallScore),
        totalEmployees,
        activeEmployees,
        adoptionRate,
        avgStressScore,
        avgHrvScore,
        distribution,
        trend,
        loading: false,
      });
    } catch (err) {
      console.error('useCompanyScore error:', err);
      setData(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    compute();
  }, [compute]);

  return { ...data, refresh: compute };
}
