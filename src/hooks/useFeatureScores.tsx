import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export function useFeatureScores() {
  const [scores, setScores] = useState<FeatureScores>({
    neuroscore: null,
    gamification: null,
    neurocoach: null,
    'ai-insights': null,
    alerts: null,
    roi: null,
    nr1: null,
    integrations: null,
    'dashboard-rh': null,
  });

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Parallel fetch all data
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

      const newScores: FeatureScores = { ...scores };

      // NeuroScore - last stress level
      if (scansRes.data) {
        const level = scansRes.data.stress_level;
        newScores.neuroscore = {
          label: level === 'low' ? '😊' : level === 'moderate' ? '😐' : '😟',
          color: level === 'low' ? 'bg-green-500' : level === 'moderate' ? 'bg-yellow-500' : 'bg-red-500',
        };
      }

      // Gamification - streak
      if (progressRes.data) {
        const streak = progressRes.data.current_streak;
        const badges = (progressRes.data.badges as any[]) || [];
        newScores.gamification = {
          label: streak > 0 ? `🔥${streak}` : `${progressRes.data.total_scans}`,
          color: streak >= 7 ? 'bg-orange-500' : streak >= 3 ? 'bg-yellow-500' : 'bg-muted',
        };
      }

      // NeuroCoach - conversations count
      if (coachRes.data) {
        const count = coachRes.data.length;
        newScores.neurocoach = count > 0 ? {
          label: `${count}`,
          color: 'bg-primary',
        } : null;
      }

      // Weekly scans data for RH features
      if (recentScansRes.data && recentScansRes.data.length > 0) {
        const scans = recentScansRes.data;
        const total = scans.length;
        const high = scans.filter(s => s.stress_level === 'high').length;
        const low = scans.filter(s => s.stress_level === 'low').length;
        const highPercent = Math.round((high / total) * 100);
        const lowPercent = Math.round((low / total) * 100);

        const hrvValues = scans.filter(s => s.hrv_value).map(s => Number(s.hrv_value));
        const avgHRV = hrvValues.length > 0 ? Math.round(hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length) : 0;

        // AI Insights - risk indicator
        newScores['ai-insights'] = {
          label: highPercent > 30 ? '⚠️' : highPercent > 15 ? '⚡' : '✅',
          color: highPercent > 30 ? 'bg-red-500' : highPercent > 15 ? 'bg-yellow-500' : 'bg-green-500',
        };

        // Alerts - count of potential alerts
        let alertCount = 0;
        if (highPercent > 30) alertCount++;
        if (avgHRV > 0 && avgHRV < 30) alertCount++;
        newScores.alerts = alertCount > 0 ? {
          label: `${alertCount}`,
          color: 'bg-red-500',
        } : {
          label: '✓',
          color: 'bg-green-500',
        };

        // ROI - wellness score
        const wellnessScore = Math.round(lowPercent * 0.6 + (100 - highPercent) * 0.4);
        newScores.roi = {
          label: `${wellnessScore}`,
          color: wellnessScore >= 70 ? 'bg-green-500' : wellnessScore >= 40 ? 'bg-yellow-500' : 'bg-red-500',
        };

        // NR-1 - compliance status
        const riskLevel = highPercent > 30 ? 'high' : highPercent > 15 ? 'moderate' : 'low';
        newScores.nr1 = {
          label: riskLevel === 'low' ? '✅' : riskLevel === 'moderate' ? '⚡' : '⚠️',
          color: riskLevel === 'low' ? 'bg-green-500' : riskLevel === 'moderate' ? 'bg-yellow-500' : 'bg-red-500',
        };

        // Dashboard RH - total scans
        newScores['dashboard-rh'] = {
          label: `${total}`,
          color: 'bg-primary',
        };
      }

      setScores(newScores);
    } catch (error) {
      console.error('Error loading feature scores:', error);
    }
  };

  return { scores, refreshScores: loadScores };
}
