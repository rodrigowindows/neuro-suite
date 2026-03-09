import { describe, it, expect } from "vitest";
import {
  getLabel,
  getColor,
  computeStressScore,
  computeConsistencyScore,
  computeHrvScore,
} from "./useWellnessScore";

describe("getLabel", () => {
  it("returns Excelente for score >= 80", () => {
    expect(getLabel(80)).toBe("Excelente");
    expect(getLabel(100)).toBe("Excelente");
  });
  it("returns Bom for score 60-79", () => {
    expect(getLabel(60)).toBe("Bom");
    expect(getLabel(79)).toBe("Bom");
  });
  it("returns Moderado for score 40-59", () => {
    expect(getLabel(40)).toBe("Moderado");
  });
  it("returns Atenção for score 20-39", () => {
    expect(getLabel(20)).toBe("Atenção");
  });
  it("returns Crítico for score < 20", () => {
    expect(getLabel(0)).toBe("Crítico");
    expect(getLabel(19)).toBe("Crítico");
  });
});

describe("getColor", () => {
  it("returns success color for >= 80", () => {
    expect(getColor(80)).toContain("success");
  });
  it("returns teal for 60-79", () => {
    expect(getColor(60)).toContain("185");
  });
  it("returns warning for 40-59", () => {
    expect(getColor(40)).toContain("warning");
  });
  it("returns destructive for < 40", () => {
    expect(getColor(39)).toContain("destructive");
  });
});

describe("computeStressScore", () => {
  it("returns 0 for empty scans", () => {
    expect(computeStressScore([])).toBe(0);
  });
  it("returns 40 for all low stress", () => {
    const scans = Array(5).fill({ stress_level: "low" });
    expect(computeStressScore(scans)).toBe(40);
  });
  it("returns 8 for all high stress", () => {
    const scans = Array(5).fill({ stress_level: "high" });
    expect(computeStressScore(scans)).toBe(8);
  });
  it("returns 24 for all moderate stress", () => {
    const scans = Array(5).fill({ stress_level: "moderate" });
    expect(computeStressScore(scans)).toBe(24);
  });
  it("uses only last 10 scans", () => {
    const scans = [
      ...Array(10).fill({ stress_level: "low" }),
      ...Array(10).fill({ stress_level: "high" }),
    ];
    expect(computeStressScore(scans)).toBe(40);
  });
  it("averages mixed stress levels", () => {
    const scans = [
      { stress_level: "low" },
      { stress_level: "high" },
    ];
    // (40 + 8) / 2 = 24
    expect(computeStressScore(scans)).toBe(24);
  });
});

describe("computeConsistencyScore", () => {
  it("returns 0 for no streak and no scans", () => {
    expect(computeConsistencyScore(0, 0)).toBe(0);
  });
  it("caps streak at 14 days (20 pts)", () => {
    expect(computeConsistencyScore(14, 0)).toBe(20);
    expect(computeConsistencyScore(28, 0)).toBe(20);
  });
  it("caps scans at 30 (10 pts)", () => {
    expect(computeConsistencyScore(0, 30)).toBe(10);
    expect(computeConsistencyScore(0, 60)).toBe(10);
  });
  it("maxes at 30 for full streak + scans", () => {
    expect(computeConsistencyScore(14, 30)).toBe(30);
  });
  it("calculates partial values correctly", () => {
    // streak 7/14 = 10 pts, scans 15/30 = 5 pts = 15
    expect(computeConsistencyScore(7, 15)).toBe(15);
  });
});

describe("computeHrvScore", () => {
  it("returns 15 (neutral) when no HRV data", () => {
    expect(computeHrvScore([])).toBe(15);
    expect(computeHrvScore([{ hrv_value: null }])).toBe(15);
  });
  it("returns 0 for HRV at 20ms", () => {
    expect(computeHrvScore([{ hrv_value: 20 }])).toBe(0);
  });
  it("returns 30 for HRV at 80ms+", () => {
    expect(computeHrvScore([{ hrv_value: 80 }])).toBe(30);
    expect(computeHrvScore([{ hrv_value: 120 }])).toBe(30);
  });
  it("returns 15 for HRV at 50ms", () => {
    // (50-20)/60 = 0.5 * 30 = 15
    expect(computeHrvScore([{ hrv_value: 50 }])).toBe(15);
  });
  it("averages multiple HRV values", () => {
    // avg = (20+80)/2 = 50 → (50-20)/60 * 30 = 15
    expect(computeHrvScore([{ hrv_value: 20 }, { hrv_value: 80 }])).toBe(15);
  });
});
