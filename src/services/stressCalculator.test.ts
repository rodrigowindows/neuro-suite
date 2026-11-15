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
    // Arrange
    const level = "low";

    // Act
    const result = getStressDisplay(level);

    // Assert
    expect(result).toEqual({ emoji: "OK", message: "Foco otimizado, produtividade alta" });
  });

  it("returns moderate stress display", () => {
    // Arrange
    const level = "moderate";

    // Act
    const result = getStressDisplay(level);

    // Assert
    expect(result).toEqual({ emoji: "Atenção", message: "Atenção normal, sugira pausas para evitar burnout" });
  });

  it("returns high stress display", () => {
    // Arrange
    const level = "high";

    // Act
    const result = getStressDisplay(level);

    // Assert
    expect(result.emoji).toBe("Alerta");
    expect(result.message).toBe("Fadiga detectada. Risco de erro operacional");
  });

  it("returns low for unknown levels", () => {
    // Arrange
    const level = "unknown";

    // Act
    const result = getStressDisplay(level);

    // Assert
    expect(result).toEqual({ emoji: "OK", message: "Foco otimizado, produtividade alta" });
  });
});

describe("calculateStressLevel", () => {
  it("returns low stress for blink rate < 15", () => {
    // Arrange
    const blinkRate = 10;

    // Act
    const result = calculateStressLevel(blinkRate);

    // Assert
    expect(result.stressLevel).toBe("low");
    expect(result.blinkRate).toBe(10);
    expect(result.emoji).toBe("OK");
  });

  it("returns moderate stress for blink rate 15-25", () => {
    // Arrange
    const blinkRate = 20;

    // Act
    const result = calculateStressLevel(blinkRate);

    // Assert
    expect(result.stressLevel).toBe("moderate");
    expect(result.emoji).toBe("Atenção");
  });

  it("returns high stress for blink rate > 25", () => {
    // Arrange
    const blinkRate = 30;

    // Act
    const result = calculateStressLevel(blinkRate);

    // Assert
    expect(result.stressLevel).toBe("high");
    expect(result.emoji).toBe("Alerta");
  });

  it("rounds blink rate to 1 decimal", () => {
    // Arrange
    const blinkRate = 12.345;

    // Act
    const result = calculateStressLevel(blinkRate);

    // Assert
    expect(result.blinkRate).toBe(12.3);
  });

  it("triggers cross-validation alert with low HRV + high blinks", () => {
    // Arrange
    const blinkRate = 30;
    const hrvValue = 20;

    // Act
    const result = calculateStressLevel(blinkRate, hrvValue);

    // Assert
    expect(result.stressLevel).toBe("high");
    expect(result.emoji).toBe("Crítico");
    expect(result.message).toContain("validação cruzada");
  });

  it("does not trigger cross-validation when HRV is normal", () => {
    // Arrange
    const blinkRate = 30;
    const hrvValue = 50;

    // Act
    const result = calculateStressLevel(blinkRate, hrvValue);

    // Assert
    expect(result.stressLevel).toBe("high");
    expect(result.emoji).not.toBe("Crítico");
  });

  it("includes hrvValue in result when provided", () => {
    // Arrange
    const blinkRate = 10;
    const hrvValue = 45;

    // Act
    const result = calculateStressLevel(blinkRate, hrvValue);

    // Assert
    expect(result.hrvValue).toBe(45);
  });

  it("boundary: blink rate exactly 15 is moderate", () => {
    // Arrange & Act
    const result = calculateStressLevel(15);

    // Assert
    expect(result.stressLevel).toBe("moderate");
  });

  it("boundary: blink rate exactly 25 is moderate", () => {
    // Arrange & Act
    const result = calculateStressLevel(25);

    // Assert
    expect(result.stressLevel).toBe("moderate");
  });
});

describe("getStressLabel", () => {
  it("returns Baixo for low", () => {
    expect(getStressLabel("low")).toBe("Baixo");
  });

  it("returns Moderado for moderate", () => {
    expect(getStressLabel("moderate")).toBe("Moderado");
  });

  it("returns Alto for high", () => {
    expect(getStressLabel("high")).toBe("Alto");
  });

  it("returns Alto for unknown", () => {
    expect(getStressLabel("unknown")).toBe("Alto");
  });
});

describe("getDiagnosticLabel", () => {
  it("returns Ótimo for low", () => {
    expect(getDiagnosticLabel("low")).toBe("Ótimo");
  });

  it("returns Normal for moderate", () => {
    expect(getDiagnosticLabel("moderate")).toBe("Normal");
  });

  it("returns Alerta for high", () => {
    expect(getDiagnosticLabel("high")).toBe("Alerta");
  });
});

describe("getPnlTip", () => {
  it("returns anchor tip for low", () => {
    expect(getPnlTip("low")).toContain("Ancore");
  });

  it("returns breathing tip for moderate", () => {
    expect(getPnlTip("moderate")).toContain("4-7-8");
  });

  it("returns pause tip for high", () => {
    expect(getPnlTip("high")).toContain("Pause");
  });
});
