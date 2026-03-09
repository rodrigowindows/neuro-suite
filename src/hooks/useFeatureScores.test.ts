import { describe, it, expect } from "vitest";
import {
  computeNeuroscoreLabel,
  computeGamificationLabel,
  computeInsightsFromScans,
} from "./useFeatureScores";

describe("computeNeuroscoreLabel", () => {
  it("returns 😊 and green for low stress", () => {
    const result = computeNeuroscoreLabel("low");
    expect(result.label).toBe("😊");
    expect(result.color).toContain("green");
  });
  it("returns 😐 and yellow for moderate stress", () => {
    const result = computeNeuroscoreLabel("moderate");
    expect(result.label).toBe("😐");
    expect(result.color).toContain("yellow");
  });
  it("returns 😟 and red for high stress", () => {
    const result = computeNeuroscoreLabel("high");
    expect(result.label).toBe("😟");
    expect(result.color).toContain("red");
  });
  it("returns 😟 for unknown level", () => {
    expect(computeNeuroscoreLabel("unknown").label).toBe("😟");
  });
});

describe("computeGamificationLabel", () => {
  it("shows fire emoji with streak when streak > 0", () => {
    const result = computeGamificationLabel(5, 20);
    expect(result.label).toBe("🔥5");
  });
  it("shows total scans when streak is 0", () => {
    const result = computeGamificationLabel(0, 15);
    expect(result.label).toBe("15");
  });
  it("returns orange for streak >= 7", () => {
    expect(computeGamificationLabel(7, 0).color).toContain("orange");
  });
  it("returns yellow for streak 3-6", () => {
    expect(computeGamificationLabel(3, 0).color).toContain("yellow");
    expect(computeGamificationLabel(6, 0).color).toContain("yellow");
  });
  it("returns muted for streak < 3", () => {
    expect(computeGamificationLabel(2, 0).color).toContain("muted");
    expect(computeGamificationLabel(0, 0).color).toContain("muted");
  });
});

describe("computeInsightsFromScans", () => {
  const makeScan = (level: string, hrv: number | null = null) => ({
    stress_level: level,
    hrv_value: hrv,
  });

  it("returns ✅ ai-insights when high% <= 15", () => {
    const scans = Array(10).fill(makeScan("low"));
    const result = computeInsightsFromScans(scans);
    expect(result.aiInsights.label).toBe("✅");
    expect(result.aiInsights.color).toContain("green");
  });

  it("returns ⚡ ai-insights when high% is 16-30", () => {
    const scans = [
      ...Array(8).fill(makeScan("low")),
      ...Array(2).fill(makeScan("high")),
    ];
    const result = computeInsightsFromScans(scans);
    expect(result.aiInsights.label).toBe("⚡");
    expect(result.aiInsights.color).toContain("yellow");
  });

  it("returns ⚠️ ai-insights when high% > 30", () => {
    const scans = [
      ...Array(5).fill(makeScan("low")),
      ...Array(5).fill(makeScan("high")),
    ];
    const result = computeInsightsFromScans(scans);
    expect(result.aiInsights.label).toBe("⚠️");
    expect(result.aiInsights.color).toContain("red");
  });

  it("returns ✓ alerts when no critical conditions", () => {
    const scans = Array(10).fill(makeScan("low", 50));
    const result = computeInsightsFromScans(scans);
    expect(result.alerts.label).toBe("✓");
    expect(result.alerts.color).toContain("green");
  });

  it("counts alert for high stress > 30%", () => {
    const scans = [
      ...Array(3).fill(makeScan("low")),
      ...Array(7).fill(makeScan("high")),
    ];
    const result = computeInsightsFromScans(scans);
    expect(result.alerts.label).toBe("1");
    expect(result.alerts.color).toContain("red");
  });

  it("counts alert for low HRV < 30", () => {
    const scans = Array(10).fill(makeScan("low", 20));
    const result = computeInsightsFromScans(scans);
    expect(result.alerts.label).toBe("1");
  });

  it("counts 2 alerts for high stress + low HRV", () => {
    const scans = [
      ...Array(3).fill(makeScan("low", 20)),
      ...Array(7).fill(makeScan("high", 25)),
    ];
    const result = computeInsightsFromScans(scans);
    expect(result.alerts.label).toBe("2");
  });

  it("calculates ROI wellness score correctly", () => {
    // All low: lowPercent=100, highPercent=0 → 100*0.6 + 100*0.4 = 100
    const scans = Array(10).fill(makeScan("low"));
    const result = computeInsightsFromScans(scans);
    expect(result.roi.label).toBe("100");
    expect(result.roi.color).toContain("green");
  });

  it("ROI red for mostly high stress", () => {
    const scans = Array(10).fill(makeScan("high"));
    const result = computeInsightsFromScans(scans);
    // lowPercent=0, highPercent=100 → 0*0.6 + 0*0.4 = 0
    expect(result.roi.label).toBe("0");
    expect(result.roi.color).toContain("red");
  });

  it("NR1 returns ✅ for low risk", () => {
    const scans = Array(10).fill(makeScan("low"));
    expect(computeInsightsFromScans(scans).nr1.label).toBe("✅");
  });

  it("NR1 returns ⚠️ for high risk", () => {
    const scans = [
      ...Array(3).fill(makeScan("low")),
      ...Array(7).fill(makeScan("high")),
    ];
    expect(computeInsightsFromScans(scans).nr1.label).toBe("⚠️");
  });

  it("dashboard-rh shows total scan count", () => {
    const scans = Array(7).fill(makeScan("low"));
    expect(computeInsightsFromScans(scans).dashboardRh.label).toBe("7");
  });
});
