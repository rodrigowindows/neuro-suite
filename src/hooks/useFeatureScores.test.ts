import { describe, it, expect } from "vitest";
import {
  computeNeuroscoreLabel,
  computeGamificationLabel,
  computeInsightsFromScans,
} from "./useFeatureScores";

describe("computeNeuroscoreLabel", () => {
  it("returns Baixo and green for low stress", () => {
    // Arrange
    const stressLevel = "low";

    // Act
    const result = computeNeuroscoreLabel(stressLevel);

    // Assert
    expect(result.label).toBe("Baixo");
    expect(result.color).toContain("green");
  });

  it("returns Moderado and yellow for moderate stress", () => {
    // Arrange
    const stressLevel = "moderate";

    // Act
    const result = computeNeuroscoreLabel(stressLevel);

    // Assert
    expect(result.label).toBe("Moderado");
    expect(result.color).toContain("yellow");
  });

  it("returns Alto and red for high stress", () => {
    // Arrange
    const stressLevel = "high";

    // Act
    const result = computeNeuroscoreLabel(stressLevel);

    // Assert
    expect(result.label).toBe("Alto");
    expect(result.color).toContain("red");
  });

  it("returns Alto for unknown level", () => {
    // Arrange
    const stressLevel = "unknown";

    // Act
    const result = computeNeuroscoreLabel(stressLevel);

    // Assert
    expect(result.label).toBe("Alto");
  });
});

describe("computeGamificationLabel", () => {
  it("shows streak with d suffix when streak > 0", () => {
    // Arrange
    const streak = 5;
    const totalScans = 20;

    // Act
    const result = computeGamificationLabel(streak, totalScans);

    // Assert
    expect(result.label).toBe("5d");
  });

  it("shows total scans when streak is 0", () => {
    // Arrange
    const streak = 0;
    const totalScans = 15;

    // Act
    const result = computeGamificationLabel(streak, totalScans);

    // Assert
    expect(result.label).toBe("15");
  });

  it("returns orange for streak >= 7", () => {
    // Arrange
    const streak = 7;
    const totalScans = 0;

    // Act
    const result = computeGamificationLabel(streak, totalScans);

    // Assert
    expect(result.color).toContain("orange");
  });

  it("returns yellow for streak 3-6", () => {
    // Arrange & Act & Assert
    expect(computeGamificationLabel(3, 0).color).toContain("yellow");
    expect(computeGamificationLabel(6, 0).color).toContain("yellow");
  });

  it("returns muted for streak < 3", () => {
    // Arrange & Act & Assert
    expect(computeGamificationLabel(2, 0).color).toContain("muted");
    expect(computeGamificationLabel(0, 0).color).toContain("muted");
  });
});

describe("computeInsightsFromScans", () => {
  const makeScan = (level: string, hrv: number | null = null) => ({
    stress_level: level,
    hrv_value: hrv,
  });

  it("returns OK ai-insights when high% <= 15", () => {
    // Arrange
    const scans = Array(10).fill(makeScan("low"));

    // Act
    const result = computeInsightsFromScans(scans);

    // Assert
    expect(result.aiInsights.label).toBe("OK");
    expect(result.aiInsights.color).toContain("green");
  });

  it("returns Atenção ai-insights when high% is 16-30", () => {
    // Arrange
    const scans = [
      ...Array(8).fill(makeScan("low")),
      ...Array(2).fill(makeScan("high")),
    ];

    // Act
    const result = computeInsightsFromScans(scans);

    // Assert
    expect(result.aiInsights.label).toBe("Atenção");
    expect(result.aiInsights.color).toContain("yellow");
  });

  it("returns Alerta ai-insights when high% > 30", () => {
    // Arrange
    const scans = [
      ...Array(5).fill(makeScan("low")),
      ...Array(5).fill(makeScan("high")),
    ];

    // Act
    const result = computeInsightsFromScans(scans);

    // Assert
    expect(result.aiInsights.label).toBe("Alerta");
    expect(result.aiInsights.color).toContain("red");
  });

  it("returns OK alerts when no critical conditions", () => {
    // Arrange
    const scans = Array(10).fill(makeScan("low", 50));

    // Act
    const result = computeInsightsFromScans(scans);

    // Assert
    expect(result.alerts.label).toBe("OK");
    expect(result.alerts.color).toContain("green");
  });

  it("counts alert for high stress > 30%", () => {
    // Arrange
    const scans = [
      ...Array(3).fill(makeScan("low")),
      ...Array(7).fill(makeScan("high")),
    ];

    // Act
    const result = computeInsightsFromScans(scans);

    // Assert
    expect(result.alerts.label).toBe("1");
    expect(result.alerts.color).toContain("red");
  });

  it("counts alert for low HRV < 30", () => {
    // Arrange
    const scans = Array(10).fill(makeScan("low", 20));

    // Act
    const result = computeInsightsFromScans(scans);

    // Assert
    expect(result.alerts.label).toBe("1");
  });

  it("counts 2 alerts for high stress + low HRV", () => {
    // Arrange
    const scans = [
      ...Array(3).fill(makeScan("low", 20)),
      ...Array(7).fill(makeScan("high", 25)),
    ];

    // Act
    const result = computeInsightsFromScans(scans);

    // Assert
    expect(result.alerts.label).toBe("2");
  });

  it("calculates ROI wellness score correctly", () => {
    // Arrange
    const scans = Array(10).fill(makeScan("low"));

    // Act
    const result = computeInsightsFromScans(scans);

    // Assert
    expect(result.roi.label).toBe("100");
    expect(result.roi.color).toContain("green");
  });

  it("ROI red for mostly high stress", () => {
    // Arrange
    const scans = Array(10).fill(makeScan("high"));

    // Act
    const result = computeInsightsFromScans(scans);

    // Assert
    expect(result.roi.label).toBe("0");
    expect(result.roi.color).toContain("red");
  });

  it("NR1 returns OK for low risk", () => {
    // Arrange
    const scans = Array(10).fill(makeScan("low"));

    // Act
    const result = computeInsightsFromScans(scans);

    // Assert
    expect(result.nr1.label).toBe("OK");
  });

  it("NR1 returns Alerta for high risk", () => {
    // Arrange
    const scans = [
      ...Array(3).fill(makeScan("low")),
      ...Array(7).fill(makeScan("high")),
    ];

    // Act
    const result = computeInsightsFromScans(scans);

    // Assert
    expect(result.nr1.label).toBe("Alerta");
  });

  it("dashboard-rh shows total scan count", () => {
    // Arrange
    const scans = Array(7).fill(makeScan("low"));

    // Act
    const result = computeInsightsFromScans(scans);

    // Assert
    expect(result.dashboardRh.label).toBe("7");
  });
});
