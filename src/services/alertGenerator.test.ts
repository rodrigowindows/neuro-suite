import { describe, it, expect } from "vitest";
import { generateAlerts, sortAlerts, getAlertStyles, Alert } from "./alertGenerator";
import type { StressStats, StressTrend, AlertThresholds } from "@/types/stress";

const defaultStats: StressStats = {
  lowPercent: 50,
  moderatePercent: 30,
  highPercent: 20,
  totalScans: 10,
  avgHRV: 50,
};

const defaultThresholds: AlertThresholds = {
  highStressPercent: 30,
  lowHRVThreshold: 30,
  consecutiveHighDays: 3,
};

describe("generateAlerts", () => {
  it("generates critical alert when high stress exceeds threshold", () => {
    const stats: StressStats = { ...defaultStats, highPercent: 40 };
    const alerts = generateAlerts(stats, null, 0, defaultThresholds);
    const critical = alerts.find((a) => a.id === "high_stress");
    expect(critical).toBeDefined();
    expect(critical?.type).toBe("critical");
  });

  it("generates critical alert when HRV is below threshold", () => {
    const stats: StressStats = { ...defaultStats, avgHRV: 25 };
    const alerts = generateAlerts(stats, null, 0, defaultThresholds);
    const hrvAlert = alerts.find((a) => a.id === "low_hrv");
    expect(hrvAlert).toBeDefined();
    expect(hrvAlert?.type).toBe("critical");
  });

  it("does not generate HRV alert when avgHRV is 0", () => {
    const stats: StressStats = { ...defaultStats, avgHRV: 0 };
    const alerts = generateAlerts(stats, null, 0, defaultThresholds);
    expect(alerts.find((a) => a.id === "low_hrv")).toBeUndefined();
  });

  it("generates warning for consecutive high days", () => {
    const alerts = generateAlerts(defaultStats, null, 5, defaultThresholds);
    const consecutive = alerts.find((a) => a.id === "consecutive_high");
    expect(consecutive).toBeDefined();
    expect(consecutive?.type).toBe("warning");
  });

  it("generates warning for worsening trend", () => {
    const trend: StressTrend = {
      direction: "worsening",
      recentHighPercent: 60,
      olderHighPercent: 30,
    };
    const alerts = generateAlerts(defaultStats, trend, 0, defaultThresholds);
    const trendAlert = alerts.find((a) => a.id === "trend_worsening");
    expect(trendAlert).toBeDefined();
    expect(trendAlert?.type).toBe("warning");
  });

  it("generates info for improving trend", () => {
    const trend: StressTrend = {
      direction: "improving",
      recentHighPercent: 10,
      olderHighPercent: 50,
    };
    const alerts = generateAlerts(defaultStats, trend, 0, defaultThresholds);
    const improving = alerts.find((a) => a.id === "trend_improving");
    expect(improving).toBeDefined();
    expect(improving?.type).toBe("info");
  });

  it("generates low engagement alert for few scans", () => {
    const stats: StressStats = { ...defaultStats, totalScans: 2 };
    const alerts = generateAlerts(stats, null, 0, defaultThresholds);
    const engagement = alerts.find((a) => a.id === "low_engagement");
    expect(engagement).toBeDefined();
    expect(engagement?.type).toBe("info");
  });

  it("returns empty array when no thresholds exceeded", () => {
    const alerts = generateAlerts(defaultStats, null, 0, defaultThresholds);
    expect(alerts.length).toBe(0);
  });
});

describe("sortAlerts", () => {
  it("sorts critical alerts first", () => {
    const alerts: Alert[] = [
      { id: "1", type: "info", title: "", description: "", timestamp: new Date(), acknowledged: false },
      { id: "2", type: "critical", title: "", description: "", timestamp: new Date(), acknowledged: false },
      { id: "3", type: "warning", title: "", description: "", timestamp: new Date(), acknowledged: false },
    ];
    const sorted = sortAlerts(alerts);
    expect(sorted[0].type).toBe("critical");
    expect(sorted[1].type).toBe("warning");
    expect(sorted[2].type).toBe("info");
  });

  it("handles empty array", () => {
    expect(sortAlerts([])).toEqual([]);
  });

  it("preserves order for same type", () => {
    const alerts: Alert[] = [
      { id: "a", type: "warning", title: "", description: "", timestamp: new Date(), acknowledged: false },
      { id: "b", type: "warning", title: "", description: "", timestamp: new Date(), acknowledged: false },
    ];
    const sorted = sortAlerts(alerts);
    expect(sorted[0].id).toBe("a");
    expect(sorted[1].id).toBe("b");
  });
});

describe("getAlertStyles", () => {
  it("returns destructive styles for critical", () => {
    const styles = getAlertStyles("critical");
    expect(styles.bg).toContain("destructive");
    expect(styles.icon).toContain("destructive");
  });

  it("returns orange styles for warning", () => {
    const styles = getAlertStyles("warning");
    expect(styles.bg).toContain("orange");
    expect(styles.icon).toContain("orange");
  });

  it("returns primary styles for info", () => {
    const styles = getAlertStyles("info");
    expect(styles.bg).toContain("primary");
    expect(styles.icon).toContain("primary");
  });
});
