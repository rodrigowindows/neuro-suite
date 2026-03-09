import { describe, it, expect } from "vitest";
import { getCompanyLabel, getCompanyColor, stressLevelToScore } from "./useCompanyScore";

describe("getCompanyLabel", () => {
  it("returns Excelente for >= 80", () => {
    expect(getCompanyLabel(80)).toBe("Excelente");
  });
  it("returns Bom for 60-79", () => {
    expect(getCompanyLabel(60)).toBe("Bom");
  });
  it("returns Moderado for 40-59", () => {
    expect(getCompanyLabel(40)).toBe("Moderado");
  });
  it("returns Atenção for 20-39", () => {
    expect(getCompanyLabel(20)).toBe("Atenção");
  });
  it("returns Crítico for < 20", () => {
    expect(getCompanyLabel(10)).toBe("Crítico");
  });
});

describe("getCompanyColor", () => {
  it("returns success for >= 80", () => {
    expect(getCompanyColor(80)).toContain("success");
  });
  it("returns teal for 60-79", () => {
    expect(getCompanyColor(65)).toContain("185");
  });
  it("returns warning for 40-59", () => {
    expect(getCompanyColor(45)).toContain("warning");
  });
  it("returns destructive for < 40", () => {
    expect(getCompanyColor(10)).toContain("destructive");
  });
});

describe("stressLevelToScore", () => {
  it("returns 40 for low", () => {
    expect(stressLevelToScore("low")).toBe(40);
  });
  it("returns 24 for moderate", () => {
    expect(stressLevelToScore("moderate")).toBe(24);
  });
  it("returns 8 for high", () => {
    expect(stressLevelToScore("high")).toBe(8);
  });
  it("returns 8 for unknown values", () => {
    expect(stressLevelToScore("unknown")).toBe(8);
  });
});
