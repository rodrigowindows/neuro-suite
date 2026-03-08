/** Shared stress-related types used across the application */

export type StressLevel = 'low' | 'moderate' | 'high';

export interface StressScan {
  stress_level: string;
  hrv_value: number | null;
  created_at: string | null;
}

export interface StressStats {
  lowPercent: number;
  moderatePercent: number;
  highPercent: number;
  totalScans: number;
  avgHRV: number;
}

export interface StressTrend {
  direction: 'improving' | 'worsening' | 'stable';
  recentHighPercent: number;
  olderHighPercent: number;
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface AlertThresholds {
  highStressPercent: number;
  lowHRVThreshold: number;
  consecutiveHighDays: number;
}
