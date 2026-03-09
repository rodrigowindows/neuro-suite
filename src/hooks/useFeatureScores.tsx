import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface FeatureScores {
  neuroscore: { label: string; color: string } | null;
  gamification: { label: string; color: string } | null;
  neurocoach: { label: string; color: string } | null;
  'ai-insights': { label: string; color: string } | null;
  alerts: { label: string; color: string } | null;
  roi: { label: string; color: string } | null;
  nr1: { label: string; color: string } | null;
  integrations: { label: string; color: string } | null;
  'dashboard-rh': { label: string; color: string } | null;
}

const defaultScores: FeatureScores = {
  neuroscore: null,
  gamification: null,
  neurocoach: null,
  'ai-insights': null,
  alerts: null,
  roi: null,
  nr1: null,
  integrations: null,
  'dashboard-rh': null,
};

export function computeNeuroscoreLabel(stressLevel: string): { label: string; color: string } {
  return {
    label: stressLevel === 'low' ? '😊' : stressLevel === 'moderate' ? '😐' : '😟',
    color: stressLevel === 'low' ? 'bg-green-500' : stressLevel === 'moderate' ? 'bg-yellow-500' : 'bg-red-500',
  };
}

export function computeGamificationLabel(streak: number, totalScans: number): { label: string; color: string } {
  return {
    label: streak > 0 ? `🔥${streak}` : `${totalScans}`,
    color: streak >= 7 ? 'bg-orange-500' : streak >= 3 ? 'bg-yellow-500' : 'bg-muted',
  };
}

export function computeInsightsFromScans(scans: { stress_level: string; hrv_value: number | null }[]): {
  aiInsights: { label: string; color: string };
  alerts: { label: string; color: string };
  roi: { label: string; color: string };
  nr1: { label: string; color: string };
  dashboardRh: { label: string; color: string };
} {
  const total = scans.length;
  const high = scans.filter(s => s.stress_level === 'high').length;
  const low = scans.filter(s => s.stress_level === 'low').length;
  const highPercent = Math.round((high / total) * 100);
  const lowPercent = Math.round((low / total) * 100);

  const hrvValues = scans.filter(s => s.hrv_value).map(s => Number(s.hrv_value));
  const avgHRV = hrvValues.length > 0 ? Math.round(hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length) : 0;

  const aiInsights = {
    label: highPercent > 30 ? '⚠️' : highPercent > 15 ? '⚡' : '✅',
    color: highPercent > 30 ? 'bg-red-500' : highPercent > 15 ? 'bg-yellow-500' : 'bg-green-500',
  };

  let alertCount = 0;
  if (highPercent > 30) alertCount++;
  if (avgHRV > 0 && avgHRV < 30) alertCount++;
  const alerts = alertCount > 0 ? {
    label: `${alertCount}`,
    color: 'bg-red-500',
  } : {
    label: '✓',
    color: 'bg-green-500',
  };

  const wellnessScore = Math.round(lowPercent * 0.6 + (100 - highPercent) * 0.4);
  const roi = {
    label: `${wellnessScore}`,
    color: wellnessScore >= 70 ? 'bg-green-500' : wellnessScore >= 40 ? 'bg-yellow-500' : 'bg-red-500',
  };

  const riskLevel = highPercent > 30 ? 'high' : highPercent > 15 ? 'moderate' : 'low';
  const nr1 = {
    label: riskLevel === 'low' ? '✅' : riskLevel === 'moderate' ? '⚡' : '⚠️',
    color: riskLevel === 'low' ? 'bg-green-500' : riskLevel === 'moderate' ? 'bg-yellow-500' : 'bg-red-500',
  };

  const dashboardRh = { label: `${total}`, color: 'bg-primary' };

  return { aiInsights, alerts, roi, nr1, dashboardRh };
}

export function useFeatureScores() {
  const { user } = useAuth();
  const [scores, setScores] = useState<FeatureScores>(defaultScores);

  const loadScores = useCallback(async () => {
    if (!user) {
      setScores(defaultScores);
      return;
    }

    try {
      const [scansRes, progressRes, coachRes, recentScansRes] = await Promise.all([
        supabase
          .from('stress_scans')
          .select('stress_level, hrv_value, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from('user_progress')
          .select('current_streak, total_scans, badges')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('coach_conversations')
          .select('id')
          .eq('user_id', user.id)
          .limit(100),
        supabase
          .from('stress_scans')
          .select('stress_level, hrv_value')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .limit(200),
      ]);

      const newScores: FeatureScores = { ...defaultScores };

      if (scansRes.data) {
        newScores.neuroscore = computeNeuroscoreLabel(scansRes.data.stress_level);
      }

      if (progressRes.data) {
        newScores.gamification = computeGamificationLabel(
          progressRes.data.current_streak,
          progressRes.data.total_scans
        );
      }

      if (coachRes.data) {
        const count = coachRes.data.length;
        newScores.neurocoach = count > 0 ? { label: `${count}`, color: 'bg-primary' } : null;
      }

      if (recentScansRes.data && recentScansRes.data.length > 0) {
        const computed = computeInsightsFromScans(recentScansRes.data);
        newScores['ai-insights'] = computed.aiInsights;
        newScores.alerts = computed.alerts;
        newScores.roi = computed.roi;
        newScores.nr1 = computed.nr1;
        newScores['dashboard-rh'] = computed.dashboardRh;
      }

      setScores(newScores);
    } catch (error) {
      console.error('Error loading feature scores:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadScores();
  }, [loadScores]);

  return { scores, refreshScores: loadScores };
}
