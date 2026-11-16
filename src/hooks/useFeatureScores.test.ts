import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  computeNeuroscoreLabel,
  computeGamificationLabel,
  computeInsightsFromScans,
} from "./useFeatureScores";
import { LangProvider, translate } from "@/i18n";
import { AppSidebar } from "@/components/AppSidebar";
import { SectionTabs } from "@/components/SectionTabs";
import { SidebarProvider } from "@/components/ui/sidebar";

// Mocks for AppSidebar rendering
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    signOut: vi.fn().mockResolvedValue(undefined),
    user: { id: "test-user-id" },
  }),
}));

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

  it("supports i18n translation function for English", () => {
    // Arrange
    const tEn = (key: string) => translate("en", key);

    // Act & Assert
    expect(computeNeuroscoreLabel("low", tEn).label).toBe("Low");
    expect(computeNeuroscoreLabel("moderate", tEn).label).toBe("Moderate");
    expect(computeNeuroscoreLabel("high", tEn).label).toBe("High");
    expect(computeNeuroscoreLabel("unknown", tEn).label).toBe("High");
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

  it("supports i18n translation function for English scores", () => {
    // Arrange
    const tEn = (key: string) => translate("en", key);
    const moderateScans = [
      ...Array(8).fill(makeScan("low")),
      ...Array(2).fill(makeScan("high")),
    ];
    const highScans = [
      ...Array(5).fill(makeScan("low")),
      ...Array(5).fill(makeScan("high")),
    ];

    // Act
    const moderateResult = computeInsightsFromScans(moderateScans, tEn);
    const highResult = computeInsightsFromScans(highScans, tEn);

    // Assert
    expect(moderateResult.aiInsights.label).toBe("Caution");
    expect(moderateResult.nr1.label).toBe("Caution");
    expect(highResult.aiInsights.label).toBe("Alert");
    expect(highResult.nr1.label).toBe("Alert");
  });
});

describe("AppSidebar i18n bilingual navigation", () => {
  it("renders Portuguese navigation in default/pt mode and changes tabs", () => {
    // Arrange
    const onTabChange = vi.fn();
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(
          LangProvider,
          { initialLang: "pt" },
          React.createElement(
            SidebarProvider,
            null,
            React.createElement(AppSidebar, {
              activeTab: "bridge-console",
              onTabChange,
              isManager: true,
              isAdmin: true,
            })
          )
        )
      )
    );

    // Assert employee items in PT
    expect(screen.getByRole("button", { name: "Cockpit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Contramedidas" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Histórico de Voo" })).toBeInTheDocument();

    // Assert groups and footer in PT
    expect(screen.getByText("Sistemas de Cabine")).toBeInTheDocument();
    expect(screen.getByText("Comando")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Meu Perfil" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Admin" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();

    // Act: click Contramedidas
    fireEvent.click(screen.getByRole("button", { name: "Contramedidas" }));

    // Assert tab internal value is strictly preserved
    expect(onTabChange).toHaveBeenCalledWith("neurocoach");
  });

  it("renders English navigation in en mode and ensures Portuguese text is absent", () => {
    // Arrange
    const onTabChange = vi.fn();
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(
          LangProvider,
          { initialLang: "en" },
          React.createElement(
            SidebarProvider,
            null,
            React.createElement(AppSidebar, {
              activeTab: "bridge-console",
              onTabChange,
              isManager: true,
              isAdmin: true,
            })
          )
        )
      )
    );

    // Assert employee items in EN
    expect(screen.getByRole("button", { name: "Cockpit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Countermeasures" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Flight Log" })).toBeInTheDocument();

    // Assert groups and footer in EN
    expect(screen.getByText("Cabin Systems")).toBeInTheDocument();
    expect(screen.getByText("Command")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Admin" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();

    // Assert Portuguese texts do not appear in EN
    expect(screen.queryByText("Contramedidas")).toBeNull();
    expect(screen.queryByText("Histórico de Voo")).toBeNull();
    expect(screen.queryByText("Sistemas de Cabine")).toBeNull();
    expect(screen.queryByText("Meu Perfil")).toBeNull();
    expect(screen.queryByText("Sair")).toBeNull();

    // Act: click Flight Log
    fireEvent.click(screen.getByRole("button", { name: "Flight Log" }));

    // Assert tab internal value is strictly preserved
    expect(onTabChange).toHaveBeenCalledWith("mission-log");
  });
});

describe("SectionTabs i18n bilingual tabs", () => {
  it("renders cockpit tabs in Portuguese and English without changing values", () => {
    // Arrange
    const onTabChange = vi.fn();

    // Render PT
    const { unmount } = render(
      React.createElement(
        LangProvider,
        { initialLang: "pt" },
        React.createElement(SectionTabs, { activeTab: "bridge-console", onTabChange })
      )
    );

    expect(screen.getByRole("tab", { name: "Painel" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Avaliação de Prontidão" })).toBeInTheDocument();

    unmount();

    // Render EN
    render(
      React.createElement(
        LangProvider,
        { initialLang: "en" },
        React.createElement(SectionTabs, { activeTab: "bridge-console", onTabChange })
      )
    );

    expect(screen.getByRole("tab", { name: "Panel" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Readiness Assessment" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Painel" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "Avaliação de Prontidão" })).toBeNull();

    // Act: click Readiness Assessment
    fireEvent.click(screen.getByRole("tab", { name: "Readiness Assessment" }));
    expect(onTabChange).toHaveBeenCalledWith("checkin");
  });

  it("renders countermeasures tabs in Portuguese and English without changing values", () => {
    // Arrange
    const onTabChange = vi.fn();

    // Render PT
    const { unmount } = render(
      React.createElement(
        LangProvider,
        { initialLang: "pt" },
        React.createElement(SectionTabs, { activeTab: "neurocoach", onTabChange })
      )
    );

    expect(screen.getByRole("tab", { name: "AstroAssist" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Disciplina" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Métricas de Carga" })).toBeInTheDocument();

    unmount();

    // Render EN
    render(
      React.createElement(
        LangProvider,
        { initialLang: "en" },
        React.createElement(SectionTabs, { activeTab: "neurocoach", onTabChange })
      )
    );

    expect(screen.getByRole("tab", { name: "AstroAssist" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Discipline" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Workload Metrics" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Disciplina" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "Métricas de Carga" })).toBeNull();

    // Act: click Discipline
    fireEvent.click(screen.getByRole("tab", { name: "Discipline" }));
    expect(onTabChange).toHaveBeenCalledWith("gamification");
  });
});
