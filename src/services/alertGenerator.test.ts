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
    // Arrange
    const stats: StressStats = { ...defaultStats, highPercent: 40 };

    // Act
    const alerts = generateAlerts(stats, null, 0, defaultThresholds);
    const critical = alerts.find((a) => a.id === "high_stress");

    // Assert
    expect(critical).toBeDefined();
    expect(critical?.type).toBe("critical");
    expect(critical?.title).toBe("Limite de Estresse Alto Ultrapassado");
  });

  it("generates critical alert when HRV is below threshold", () => {
    // Arrange
    const stats: StressStats = { ...defaultStats, avgHRV: 25 };

    // Act
    const alerts = generateAlerts(stats, null, 0, defaultThresholds);
    const hrvAlert = alerts.find((a) => a.id === "low_hrv");

    // Assert
    expect(hrvAlert).toBeDefined();
    expect(hrvAlert?.type).toBe("critical");
    expect(hrvAlert?.title).toBe("HRV Médio Abaixo do Limite");
  });

  it("does not generate HRV alert when avgHRV is 0", () => {
    // Arrange
    const stats: StressStats = { ...defaultStats, avgHRV: 0 };

    // Act
    const alerts = generateAlerts(stats, null, 0, defaultThresholds);

    // Assert
    expect(alerts.find((a) => a.id === "low_hrv")).toBeUndefined();
  });

  it("generates warning for consecutive high days", () => {
    // Arrange & Act
    const alerts = generateAlerts(defaultStats, null, 5, defaultThresholds);
    const consecutive = alerts.find((a) => a.id === "consecutive_high");

    // Assert
    expect(consecutive).toBeDefined();
    expect(consecutive?.type).toBe("warning");
    expect(consecutive?.title).toBe("Estresse Alto Consecutivo");
  });

  it("generates warning for worsening trend", () => {
    // Arrange
    const trend: StressTrend = {
      direction: "worsening",
      recentHighPercent: 60,
      olderHighPercent: 30,
    };

    // Act
    const alerts = generateAlerts(defaultStats, trend, 0, defaultThresholds);
    const trendAlert = alerts.find((a) => a.id === "trend_worsening");

    // Assert
    expect(trendAlert).toBeDefined();
    expect(trendAlert?.type).toBe("warning");
    expect(trendAlert?.title).toBe("Tendência de Piora Detectada");
  });

  it("generates info for improving trend", () => {
    // Arrange
    const trend: StressTrend = {
      direction: "improving",
      recentHighPercent: 10,
      olderHighPercent: 50,
    };

    // Act
    const alerts = generateAlerts(defaultStats, trend, 0, defaultThresholds);
    const improving = alerts.find((a) => a.id === "trend_improving");

    // Assert
    expect(improving).toBeDefined();
    expect(improving?.type).toBe("info");
    expect(improving?.title).toBe("Tendência de Melhora");
  });

  it("generates low engagement alert for few scans", () => {
    // Arrange
    const stats: StressStats = { ...defaultStats, totalScans: 2 };

    // Act
    const alerts = generateAlerts(stats, null, 0, defaultThresholds);
    const engagement = alerts.find((a) => a.id === "low_engagement");

    // Assert
    expect(engagement).toBeDefined();
    expect(engagement?.type).toBe("info");
    expect(engagement?.title).toBe("Baixo Engajamento");
  });

  it("returns empty array when no thresholds exceeded", () => {
    // Arrange & Act
    const alerts = generateAlerts(defaultStats, null, 0, defaultThresholds);

    // Assert
    expect(alerts.length).toBe(0);
  });

  describe("English language variant (lang = 'en')", () => {
    it("generates critical alert in English when high stress exceeds threshold", () => {
      // Arrange
      const stats: StressStats = { ...defaultStats, highPercent: 40 };

      // Act
      const alerts = generateAlerts(stats, null, 0, defaultThresholds, "en");
      const critical = alerts.find((a) => a.id === "high_stress");

      // Assert
      expect(critical).toBeDefined();
      expect(critical?.type).toBe("critical");
      expect(critical?.title).toBe("High Stress Threshold Exceeded");
      expect(critical?.description).toContain("40% of scans indicate high stress");
      expect(critical?.title).not.toContain("Limite de Estresse");
    });

    it("generates critical alert in English when HRV is below threshold", () => {
      // Arrange
      const stats: StressStats = { ...defaultStats, avgHRV: 25 };

      // Act
      const alerts = generateAlerts(stats, null, 0, defaultThresholds, "en");
      const hrvAlert = alerts.find((a) => a.id === "low_hrv");

      // Assert
      expect(hrvAlert).toBeDefined();
      expect(hrvAlert?.type).toBe("critical");
      expect(hrvAlert?.title).toBe("Average HRV Below Threshold");
      expect(hrvAlert?.description).toContain("Average HRV: 25ms");
      expect(hrvAlert?.title).not.toContain("HRV Médio");
    });

    it("generates warning in English for consecutive high days", () => {
      // Arrange & Act
      const alerts = generateAlerts(defaultStats, null, 5, defaultThresholds, "en");
      const consecutive = alerts.find((a) => a.id === "consecutive_high");

      // Assert
      expect(consecutive).toBeDefined();
      expect(consecutive?.type).toBe("warning");
      expect(consecutive?.title).toBe("Consecutive High Stress");
      expect(consecutive?.description).toContain("5 consecutive days with majority of scans in high stress");
      expect(consecutive?.title).not.toContain("Estresse Alto Consecutivo");
    });

    it("generates warning in English for worsening trend", () => {
      // Arrange
      const trend: StressTrend = {
        direction: "worsening",
        recentHighPercent: 60,
        olderHighPercent: 30,
      };

      // Act
      const alerts = generateAlerts(defaultStats, trend, 0, defaultThresholds, "en");
      const trendAlert = alerts.find((a) => a.id === "trend_worsening");

      // Assert
      expect(trendAlert).toBeDefined();
      expect(trendAlert?.type).toBe("warning");
      expect(trendAlert?.title).toBe("Worsening Trend Detected");
      expect(trendAlert?.description).toContain("High stress increased by 30% in the recent week");
      expect(trendAlert?.title).not.toContain("Tendência de Piora");
    });

    it("generates info in English for improving trend", () => {
      // Arrange
      const trend: StressTrend = {
        direction: "improving",
        recentHighPercent: 10,
        olderHighPercent: 50,
      };

      // Act
      const alerts = generateAlerts(defaultStats, trend, 0, defaultThresholds, "en");
      const improving = alerts.find((a) => a.id === "trend_improving");

      // Assert
      expect(improving).toBeDefined();
      expect(improving?.type).toBe("info");
      expect(improving?.title).toBe("Improving Trend");
      expect(improving?.description).toContain("Countermeasures are working");
      expect(improving?.title).not.toContain("Tendência de Melhora");
    });

    it("generates low engagement alert in English for few scans", () => {
      // Arrange
      const stats: StressStats = { ...defaultStats, totalScans: 2 };

      // Act
      const alerts = generateAlerts(stats, null, 0, defaultThresholds, "en");
      const engagement = alerts.find((a) => a.id === "low_engagement");

      // Assert
      expect(engagement).toBeDefined();
      expect(engagement?.type).toBe("info");
      expect(engagement?.title).toBe("Low Engagement");
      expect(engagement?.description).toContain("Only 2 scans in the last 7 days");
      expect(engagement?.title).not.toContain("Baixo Engajamento");
    });
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
