import { describe, it, expect } from "vitest";
import {
  calculateStressLevel,
  getStressDisplay,
  getStressLabel,
  getDiagnosticLabel,
  getPnlTip,
} from "./stressCalculator";

describe("getStressDisplay", () => {
  it("returns low stress display by default", () => {
    expect(getStressDisplay("low")).toEqual({ emoji: "😊", message: "Foco otimizado, produtividade alta" });
  });

  it("returns moderate stress display", () => {
    expect(getStressDisplay("moderate")).toEqual({ emoji: "😐", message: "Atenção normal, sugira pausas para evitar burnout" });
  });

  it("returns high stress display", () => {
    expect(getStressDisplay("high")).toEqual({ emoji: "😟", message: "Alerta estresse, priorize reequilíbrio (NR-1)" });
  });

  it("returns low for unknown levels", () => {
    expect(getStressDisplay("unknown")).toEqual({ emoji: "😊", message: "Foco otimizado, produtividade alta" });
  });
});

describe("calculateStressLevel", () => {
  it("returns low stress for blink rate < 15", () => {
    const result = calculateStressLevel(10);
    expect(result.stressLevel).toBe("low");
    expect(result.blinkRate).toBe(10);
  });

  it("returns moderate stress for blink rate 15-25", () => {
    const result = calculateStressLevel(20);
    expect(result.stressLevel).toBe("moderate");
  });

  it("returns high stress for blink rate > 25", () => {
    const result = calculateStressLevel(30);
    expect(result.stressLevel).toBe("high");
  });

  it("rounds blink rate to 1 decimal", () => {
    const result = calculateStressLevel(12.345);
    expect(result.blinkRate).toBe(12.3);
  });

  it("triggers cross-validation alert with low HRV + high blinks", () => {
    const result = calculateStressLevel(30, 20);
    expect(result.stressLevel).toBe("high");
    expect(result.emoji).toBe("🚨");
    expect(result.message).toContain("validação cruzada");
  });

  it("does not trigger cross-validation when HRV is normal", () => {
    const result = calculateStressLevel(30, 50);
    expect(result.stressLevel).toBe("high");
    expect(result.emoji).not.toBe("🚨");
  });

  it("includes hrvValue in result when provided", () => {
    const result = calculateStressLevel(10, 45);
    expect(result.hrvValue).toBe(45);
  });

  it("boundary: blink rate exactly 15 is moderate", () => {
    expect(calculateStressLevel(15).stressLevel).toBe("moderate");
  });

  it("boundary: blink rate exactly 25 is moderate", () => {
    expect(calculateStressLevel(25).stressLevel).toBe("moderate");
  });
});

describe("getStressLabel", () => {
  it("returns Baixo for low", () => expect(getStressLabel("low")).toBe("Baixo"));
  it("returns Moderado for moderate", () => expect(getStressLabel("moderate")).toBe("Moderado"));
  it("returns Alto for high", () => expect(getStressLabel("high")).toBe("Alto"));
  it("returns Alto for unknown", () => expect(getStressLabel("unknown")).toBe("Alto"));
});

describe("getDiagnosticLabel", () => {
  it("returns Ótimo for low", () => expect(getDiagnosticLabel("low")).toBe("Ótimo"));
  it("returns Normal for moderate", () => expect(getDiagnosticLabel("moderate")).toBe("Normal"));
  it("returns Alerta for high", () => expect(getDiagnosticLabel("high")).toBe("Alerta"));
});

describe("getPnlTip", () => {
  it("returns anchor tip for low", () => expect(getPnlTip("low")).toContain("Ancore"));
  it("returns breathing tip for moderate", () => expect(getPnlTip("moderate")).toContain("4-7-8"));
  it("returns pause tip for high", () => expect(getPnlTip("high")).toContain("Pause"));
});
