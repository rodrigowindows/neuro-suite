import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AchievementBadge } from '@/types/stress';

export interface GamificationLevel {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
}

export interface GamificationData {
  xp: number;
  level: GamificationLevel;
  nextLevel: GamificationLevel | null;
  progressToNext: number; // 0-100%
  badges: AchievementBadge[];
  streak: number;
  longestStreak: number;
  totalScans: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

const LEVELS: GamificationLevel[] = [
  { level: 1, title: 'Iniciante', minXP: 0, maxXP: 50 },
  { level: 2, title: 'Observador', minXP: 50, maxXP: 150 },
  { level: 3, title: 'Consciente', minXP: 150, maxXP: 350 },
  { level: 4, title: 'Praticante', minXP: 350, maxXP: 700 },
  { level: 5, title: 'Avançado', minXP: 700, maxXP: 1200 },
  { level: 6, title: 'Expert', minXP: 1200, maxXP: 2000 },
  { level: 7, title: 'Mestre', minXP: 2000, maxXP: 3500 },
  { level: 8, title: 'Grão-Mestre', minXP: 3500, maxXP: 5500 },
  { level: 9, title: 'Lenda', minXP: 5500, maxXP: 8000 },
  { level: 10, title: 'NeuroElite', minXP: 8000, maxXP: Infinity },
];

function getLevelForXP(xp: number): GamificationLevel {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

function computeXP(totalScans: number, streak: number, longestStreak: number, badges: AchievementBadge[]): number {
  // XP sources:
  // - Each scan: 10 XP
  // - Current streak bonus: streak * 5
  // - Longest streak bonus: longestStreak * 3
  // - Each badge: 25 XP
  return (totalScans * 10) + (streak * 5) + (longestStreak * 3) + (badges.length * 25);
}

export function useGamificationScore(): GamificationData {
  const [data, setData] = useState<Omit<GamificationData, 'refresh'>>({
    xp: 0,
    level: LEVELS[0],
    nextLevel: LEVELS[1],
    progressToNext: 0,
    badges: [],
    streak: 0,
    longestStreak: 0,
    totalScans: 0,
    loading: true,
  });

  const compute = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const totalScans = progress?.total_scans || 0;
      const streak = progress?.current_streak || 0;
      const longestStreak = progress?.longest_streak || 0;
      const badges = (progress?.badges as unknown as AchievementBadge[]) || [];

      const xp = computeXP(totalScans, streak, longestStreak, badges);
      const level = getLevelForXP(xp);
      const levelIdx = LEVELS.indexOf(level);
      const nextLevel = levelIdx < LEVELS.length - 1 ? LEVELS[levelIdx + 1] : null;

      const progressToNext = nextLevel
        ? Math.min(Math.round(((xp - level.minXP) / (nextLevel.minXP - level.minXP)) * 100), 100)
        : 100;

      setData({
        xp,
        level,
        nextLevel,
        progressToNext,
        badges,
        streak,
        longestStreak,
        totalScans,
        loading: false,
      });
    } catch (err) {
      console.error('useGamificationScore error:', err);
      setData(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    compute();
  }, [compute]);

  return { ...data, refresh: compute };
}

export { LEVELS };
