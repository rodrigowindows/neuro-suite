import { describe, it, expect } from 'vitest';
import { computeStats, computeTrend, computeConsecutiveHighDays } from './stressAnalytics';
import type { StressScan } from '@/types/stress';

function makeScan(level: string, hrv?: number | null, date?: string): StressScan {
  return {
    stress_level: level,
    hrv_value: hrv ?? null,
    created_at: date ?? new Date().toISOString(),
  };
}

describe('computeStats', () => {
  it('returns empty stats for no scans', () => {
    const stats = computeStats([]);
    expect(stats).toEqual({ lowPercent: 0, moderatePercent: 0, highPercent: 0, totalScans: 0, avgHRV: 0 });
  });

  it('computes correct percentages', () => {
    const scans = [makeScan('low'), makeScan('low'), makeScan('moderate'), makeScan('high')];
    const stats = computeStats(scans);
    expect(stats.lowPercent).toBe(50);
    expect(stats.moderatePercent).toBe(25);
    expect(stats.highPercent).toBe(25);
    expect(stats.totalScans).toBe(4);
  });

  it('computes average HRV ignoring nulls', () => {
    const scans = [makeScan('low', 60), makeScan('low', 40), makeScan('low', null)];
    expect(computeStats(scans).avgHRV).toBe(50);
  });

  it('returns avgHRV 0 when all hrv values are null', () => {
    const scans = [makeScan('low', null), makeScan('high', null)];
    expect(computeStats(scans).avgHRV).toBe(0);
  });
});

describe('computeTrend', () => {
  it('returns null for fewer than 4 scans', () => {
    expect(computeTrend([makeScan('low'), makeScan('high'), makeScan('low')])).toBeNull();
  });

  it('detects worsening trend', () => {
    // Recent (first half): all high; Older (second half): all low
    const scans = [makeScan('high'), makeScan('high'), makeScan('low'), makeScan('low')];
    const trend = computeTrend(scans);
    expect(trend).not.toBeNull();
    expect(trend!.direction).toBe('worsening');
    expect(trend!.recentHighPercent).toBe(100);
    expect(trend!.olderHighPercent).toBe(0);
  });

  it('detects improving trend', () => {
    const scans = [makeScan('low'), makeScan('low'), makeScan('high'), makeScan('high')];
    const trend = computeTrend(scans);
    expect(trend!.direction).toBe('improving');
  });

  it('detects stable trend', () => {
    const scans = [makeScan('high'), makeScan('low'), makeScan('high'), makeScan('low')];
    const trend = computeTrend(scans);
    expect(trend!.direction).toBe('stable');
  });
});

describe('computeConsecutiveHighDays', () => {
  it('returns 0 for empty scans', () => {
    expect(computeConsecutiveHighDays([])).toBe(0);
  });

  it('returns 0 when most recent day is not high', () => {
    const scans = [makeScan('low', null, '2026-03-08T10:00:00Z'), makeScan('high', null, '2026-03-07T10:00:00Z')];
    expect(computeConsecutiveHighDays(scans)).toBe(0);
  });

  it('counts consecutive high days from most recent', () => {
    const scans = [
      makeScan('high', null, '2026-03-08T10:00:00Z'),
      makeScan('high', null, '2026-03-07T10:00:00Z'),
      makeScan('low', null, '2026-03-06T10:00:00Z'),
    ];
    expect(computeConsecutiveHighDays(scans)).toBe(2);
  });

  it('requires >50% high to count a day', () => {
    const scans = [
      makeScan('high', null, '2026-03-08T09:00:00Z'),
      makeScan('low', null, '2026-03-08T10:00:00Z'),
      makeScan('low', null, '2026-03-08T11:00:00Z'),
    ];
    // 1/3 = 33% high, should NOT count
    expect(computeConsecutiveHighDays(scans)).toBe(0);
  });
});
