import { describe, it, expect } from "vitest";
import {
  calculateProductivityGain,
  calculateTurnoverReduction,
  calculateAbsenteeismReduction,
  calculateNetBenefit,
  calculateROI,
} from "./roiCalculator";

describe("calculateProductivityGain", () => {
  it("calculates productivity gain correctly", () => {
    // Base case: 100 employees, R$5000 salary, 10% stress reduction, 15% productivity impact
    const result = calculateProductivityGain(100, 5000, 0.1, 0.15);
    // 100 * 5000 * 12 * 0.1 * 0.15 = R$90,000/year
    expect(result).toBe(90000);
  });

  it("returns 0 for no stress reduction", () => {
    const result = calculateProductivityGain(100, 5000, 0, 0.15);
    expect(result).toBe(0);
  });

  it("handles fractional employees", () => {
    const result = calculateProductivityGain(50.5, 4000, 0.2, 0.1);
    expect(result).toBeGreaterThan(0);
  });
});

describe("calculateTurnoverReduction", () => {
  it("calculates turnover savings correctly", () => {
    // 100 employees, 20% turnover rate, 3 months salary replacement cost, 10% reduction
    const result = calculateTurnoverReduction(100, 0.2, 5000, 3, 0.1);
    // 100 * 0.2 * 0.1 * 5000 * 3 = R$30,000/year
    expect(result).toBe(30000);
  });

  it("returns 0 for no stress reduction", () => {
    const result = calculateTurnoverReduction(100, 0.2, 5000, 3, 0);
    expect(result).toBe(0);
  });
});

describe("calculateAbsenteeismReduction", () => {
  it("calculates absenteeism savings correctly", () => {
    // 100 employees, 5 days average absence, R$250 daily cost, 15% reduction
    const result = calculateAbsenteeismReduction(100, 5, 250, 0.15);
    // 100 * 5 * 250 * 0.15 = R$18,750/year
    expect(result).toBe(18750);
  });

  it("returns 0 for zero absence days", () => {
    const result = calculateAbsenteeismReduction(100, 0, 250, 0.15);
    expect(result).toBe(0);
  });
});

describe("calculateNetBenefit", () => {
  it("sums all benefits correctly", () => {
    const result = calculateNetBenefit(10000, 5000, 3000);
    expect(result).toBe(18000);
  });

  it("handles zero values", () => {
    const result = calculateNetBenefit(0, 0, 0);
    expect(result).toBe(0);
  });
});

describe("calculateROI", () => {
  it("calculates ROI percentage correctly", () => {
    // Net benefit of R$100,000, investment of R$20,000
    const result = calculateROI(100000, 20000);
    // (100000 - 20000) / 20000 * 100 = 400%
    expect(result).toBe(400);
  });

  it("handles break-even scenario", () => {
    const result = calculateROI(20000, 20000);
    expect(result).toBe(0);
  });

  it("handles negative ROI", () => {
    const result = calculateROI(10000, 20000);
    expect(result).toBe(-50);
  });

  it("returns 0 for zero investment", () => {
    const result = calculateROI(10000, 0);
    expect(result).toBe(0);
  });
});
