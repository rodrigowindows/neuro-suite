import { describe, it, expect } from "vitest";
import { getCompanyLabel, getCompanyColor, stressLevelToScore } from "./useCompanyScore";
import { translate } from "@/i18n";

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

  it("returns translated label when t function is provided", () => {
    // Arrange: mock translation function for English
    const mockT = (key: string) => {
      const map: Record<string, string> = {
        'command.companyScore.label.excellent': 'Excellent',
        'command.companyScore.label.good': 'Good',
        'command.companyScore.label.moderate': 'Moderate',
        'command.companyScore.label.attention': 'Attention',
        'command.companyScore.label.critical': 'Critical',
      };
      return map[key] || key;
    };

    // Act & Assert (AAA)
    expect(getCompanyLabel(85, mockT)).toBe("Excellent");
    expect(getCompanyLabel(70, mockT)).toBe("Good");
    expect(getCompanyLabel(50, mockT)).toBe("Moderate");
    expect(getCompanyLabel(30, mockT)).toBe("Attention");
    expect(getCompanyLabel(15, mockT)).toBe("Critical");
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

describe("command dictionary i18n translations", () => {
  it("translates command panel keys correctly in Portuguese and English", () => {
    // Arrange & Act
    const ptTitle = translate("pt", "command.dashboard.title");
    const enTitle = translate("en", "command.dashboard.title");

    const ptTurnover = translate("pt", "command.turnover.title");
    const enTurnover = translate("en", "command.turnover.title");

    const ptBenchmark = translate("pt", "command.benchmark.title");
    const enBenchmark = translate("en", "command.benchmark.title");

    const ptScore = translate("pt", "command.companyScore.title");
    const enScore = translate("en", "command.companyScore.title");

    const ptWeekly = translate("pt", "command.weekly.title");
    const enWeekly = translate("en", "command.weekly.title");

    const ptTrend = translate("pt", "command.trend.title");
    const enTrend = translate("en", "command.trend.title");

    // Assert (AAA)
    expect(ptTitle).toBe("Painel de Comando - Análise de Bem-Estar (7 dias)");
    expect(enTitle).toBe("Command Panel - Wellness Analysis (7 days)");

    expect(ptTurnover).toBe("Predição de Turnover com IA");
    expect(enTurnover).toBe("AI Turnover Prediction");

    expect(ptBenchmark).toBe("Benchmark por Setor");
    expect(enBenchmark).toBe("Sector Benchmark");

    expect(ptScore).toBe("Score da Empresa");
    expect(enScore).toBe("Company Score");

    expect(ptWeekly).toBe("Comparativo Semanal");
    expect(enWeekly).toBe("Weekly Comparison");

    expect(ptTrend).toBe("Evolução do Estresse");
    expect(enTrend).toBe("Stress Evolution");
  });

  it("provides demonstration badge for TurnoverPrediction in both languages", () => {
    // Arrange & Act
    const ptBadge = translate("pt", "command.turnover.badge");
    const enBadge = translate("en", "command.turnover.badge");

    // Assert (AAA)
    expect(ptBadge).toBe("Demonstração / Estimativa");
    expect(enBadge).toBe("Demo / Estimate");
  });
});
