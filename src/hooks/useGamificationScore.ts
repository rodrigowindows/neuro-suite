import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/i18n';
import type { AchievementBadge } from '@/types/stress';

export interface GamificationLevel {
  level: number;
  title: string;
  titleKey?: string;
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
  { level: 1, title: 'Iniciante', titleKey: 'wellness.level.1', minXP: 0, maxXP: 50 },
  { level: 2, title: 'Observador', titleKey: 'wellness.level.2', minXP: 50, maxXP: 150 },
  { level: 3, title: 'Consciente', titleKey: 'wellness.level.3', minXP: 150, maxXP: 350 },
  { level: 4, title: 'Praticante', titleKey: 'wellness.level.4', minXP: 350, maxXP: 700 },
  { level: 5, title: 'Avançado', titleKey: 'wellness.level.5', minXP: 700, maxXP: 1200 },
  { level: 6, title: 'Expert', titleKey: 'wellness.level.6', minXP: 1200, maxXP: 2000 },
  { level: 7, title: 'Mestre', titleKey: 'wellness.level.7', minXP: 2000, maxXP: 3500 },
  { level: 8, title: 'Grão-Mestre', titleKey: 'wellness.level.8', minXP: 3500, maxXP: 5500 },
  { level: 9, title: 'Lenda', titleKey: 'wellness.level.9', minXP: 5500, maxXP: 8000 },
  { level: 10, title: 'NeuroElite', titleKey: 'wellness.level.10', minXP: 8000, maxXP: Infinity },
];

export function getLevelForXP(xp: number, t?: (key: string) => string): GamificationLevel {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      const lvl = LEVELS[i];
      return t ? { ...lvl, title: t(lvl.titleKey || `wellness.level.${lvl.level}`) } : lvl;
    }
  }
  const lvl0 = LEVELS[0];
  return t ? { ...lvl0, title: t(lvl0.titleKey || `wellness.level.${lvl0.level}`) } : lvl0;
}

export function computeXP(totalScans: number, streak: number, longestStreak: number, badges: AchievementBadge[]): number {
  // XP sources:
  // - Each scan: 10 XP
  // - Current streak bonus: streak * 5
  // - Longest streak bonus: longestStreak * 3
  // - Each badge: 25 XP
  return (totalScans * 10) + (streak * 5) + (longestStreak * 3) + (badges.length * 25);
}

export function useGamificationScore(options?: { t?: (key: string) => string }): GamificationData {
  const { t } = useI18n();
  const translator = options?.t || t;

  const [data, setData] = useState<Omit<GamificationData, 'refresh'>>({
    xp: 0,
    level: getLevelForXP(0, translator),
    nextLevel: getLevelForXP(50, translator),
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
        .select('total_scans, current_streak, longest_streak, badges')
        .eq('user_id', user.id)
        .maybeSingle();

      const totalScans = progress?.total_scans || 0;
      const streak = progress?.current_streak || 0;
      const longestStreak = progress?.longest_streak || 0;
      const badges = (progress?.badges as unknown as AchievementBadge[]) || [];

      const xp = computeXP(totalScans, streak, longestStreak, badges);
      const level = getLevelForXP(xp, translator);
      const levelIdx = LEVELS.findIndex((l) => l.level === level.level);
      const rawNextLevel = levelIdx < LEVELS.length - 1 ? LEVELS[levelIdx + 1] : null;
      const nextLevel = rawNextLevel ? getLevelForXP(rawNextLevel.minXP, translator) : null;

      const progressToNext = rawNextLevel
        ? Math.min(Math.round(((xp - level.minXP) / (rawNextLevel.minXP - level.minXP)) * 100), 100)
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
  }, [translator]);

  useEffect(() => {
    compute();
  }, [compute]);

  return { ...data, refresh: compute };
}

export { LEVELS };
