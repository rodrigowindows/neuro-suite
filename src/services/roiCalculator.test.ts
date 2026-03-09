import { describe, it, expect } from "vitest";
import { calculateROI, formatCurrency, ROIInputs } from "./roiCalculator";

describe("calculateROI", () => {
  const baseInputs: ROIInputs = {
    totalEmployees: 100,
    avgSalary: 5000,
    turnoverRate: 20,
    absenteeismDays: 10,
  };

  it("calculates annual turnover cost correctly", () => {
    const result = calculateROI(baseInputs);
    // 100 employees * 20% turnover * (5000 * 6 months) = 600,000
    expect(result.annualTurnoverCost).toBe(600000);
  });

  it("calculates annual absenteeism cost correctly", () => {
    const result = calculateROI(baseInputs);
    // 100 employees * 10 days * (5000 / 22 days) ≈ 227,272.73
    expect(result.annualAbsenteeismCost).toBeCloseTo(227272.73, 0);
  });

  it("calculates total cost without NeuroSuite", () => {
    const result = calculateROI(baseInputs);
    expect(result.totalCostWithoutNeuroSuite).toBeCloseTo(827272.73, 0);
  });

  it("calculates turnover savings at 25% reduction", () => {
    const result = calculateROI(baseInputs);
    // 600,000 * 0.25 = 150,000
    expect(result.savingsTurnover).toBe(150000);
  });

  it("calculates absenteeism savings at 20% reduction", () => {
    const result = calculateROI(baseInputs);
    // 22,727.27 * 0.20 ≈ 4,545.45
    expect(result.savingsAbsenteeism).toBeCloseTo(4545.45, 0);
  });

  it("calculates total savings correctly", () => {
    const result = calculateROI(baseInputs);
    expect(result.totalSavings).toBeCloseTo(154545.45, 0);
  });

  it("calculates NeuroSuite annual cost", () => {
    const result = calculateROI(baseInputs);
    // 100 * 29 * 12 = 34,800
    expect(result.annualNeuroSuiteCost).toBe(34800);
  });

  it("calculates net ROI correctly", () => {
    const result = calculateROI(baseInputs);
    // 154,545.45 - 34,800 = 119,745.45
    expect(result.netROI).toBeCloseTo(119745.45, 0);
  });

  it("calculates ROI percentage correctly", () => {
    const result = calculateROI(baseInputs);
    // (119,745.45 / 34,800) * 100 ≈ 344%
    expect(result.roiPercentage).toBeGreaterThan(300);
  });

  it("handles zero employees", () => {
    const result = calculateROI({ ...baseInputs, totalEmployees: 0 });
    expect(result.annualTurnoverCost).toBe(0);
    expect(result.annualAbsenteeismCost).toBe(0);
    expect(result.annualNeuroSuiteCost).toBe(0);
    expect(result.roiPercentage).toBe(0);
  });

  it("handles zero turnover rate", () => {
    const result = calculateROI({ ...baseInputs, turnoverRate: 0 });
    expect(result.annualTurnoverCost).toBe(0);
    expect(result.savingsTurnover).toBe(0);
  });

  it("handles zero absenteeism days", () => {
    const result = calculateROI({ ...baseInputs, absenteeismDays: 0 });
    expect(result.annualAbsenteeismCost).toBe(0);
    expect(result.savingsAbsenteeism).toBe(0);
  });
});

describe("formatCurrency", () => {
  it("formats positive values correctly", () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain("1.234,56");
    expect(result).toContain("R$");
  });

  it("formats zero correctly", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0,00");
  });

  it("formats large numbers correctly", () => {
    const result = formatCurrency(1000000);
    expect(result).toContain("1.000.000");
  });

  it("formats negative values correctly", () => {
    const result = formatCurrency(-500);
    expect(result).toContain("500");
  });
});
