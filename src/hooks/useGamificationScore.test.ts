import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, renderHook, waitFor, screen } from "@testing-library/react";
import { getLevelForXP, computeXP, LEVELS, useGamificationScore } from "./useGamificationScore";
import { LangProvider, translate } from "@/i18n";
import GamificationScoreCard from "@/components/GamificationScoreCard";
import Gamification from "@/components/Gamification";
import SmartBreakAssistant from "@/components/SmartBreakAssistant";
import CognitiveFatigueAnalyzer from "@/components/CognitiveFatigueAnalyzer";
import LeadershipCoaching from "@/components/LeadershipCoaching";
import type { AchievementBadge } from "@/types/stress";

const { mockProgressSelect } = vi.hoisted(() => ({
  mockProgressSelect: vi.fn().mockReturnThis(),
}));

let mockUserData: {
  total_scans: number;
  current_streak: number;
  longest_streak: number;
  last_scan_date: string;
  badges: AchievementBadge[];
} | null = null;

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "astronaut-001", email: "pilot@crewvitals.space" },
    loading: false,
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "astronaut-001" } } }),
    },
    from: vi.fn(() => {
      const chain = {
        select: mockProgressSelect,
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockImplementation(() => Promise.resolve({ data: mockUserData, error: null })),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        update: vi.fn().mockResolvedValue({ error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
      return chain;
    }),
  },
}));

describe("getLevelForXP", () => {
  it("returns Iniciante for 0 XP", () => {
    expect(getLevelForXP(0).title).toBe("Iniciante");
  });
  it("returns Observador for 50 XP", () => {
    expect(getLevelForXP(50).title).toBe("Observador");
  });
  it("returns Consciente for 150 XP", () => {
    expect(getLevelForXP(150).title).toBe("Consciente");
  });
  it("returns NeuroElite for 8000+ XP", () => {
    expect(getLevelForXP(8000).title).toBe("NeuroElite");
    expect(getLevelForXP(99999).title).toBe("NeuroElite");
  });
  it("returns correct level at boundaries", () => {
    expect(getLevelForXP(49).level).toBe(1);
    expect(getLevelForXP(50).level).toBe(2);
    expect(getLevelForXP(149).level).toBe(2);
    expect(getLevelForXP(350).level).toBe(4);
  });
  it("supports translation function t for EN and PT", () => {
    const tEn = (key: string) => translate("en", key);
    const tPt = (key: string) => translate("pt", key);

    expect(getLevelForXP(0, tEn).title).toBe("Beginner");
    expect(getLevelForXP(50, tEn).title).toBe("Observer");
    expect(getLevelForXP(150, tEn).title).toBe("Conscious");
    expect(getLevelForXP(8000, tEn).title).toBe("NeuroElite");

    expect(getLevelForXP(0, tPt).title).toBe("Iniciante");
    expect(getLevelForXP(50, tPt).title).toBe("Observador");
    expect(getLevelForXP(150, tPt).title).toBe("Consciente");
  });
});

describe("computeXP", () => {
  it("returns 0 for zero inputs", () => {
    expect(computeXP(0, 0, 0, [])).toBe(0);
  });
  it("gives 10 XP per scan", () => {
    expect(computeXP(10, 0, 0, [])).toBe(100);
  });
  it("gives 5 XP per streak day", () => {
    expect(computeXP(0, 7, 0, [])).toBe(35);
  });
  it("gives 3 XP per longest streak day", () => {
    expect(computeXP(0, 0, 10, [])).toBe(30);
  });
  it("gives 25 XP per badge", () => {
    const badges = [
      { id: "b1", name: "Test", description: "d", icon: "Trophy", earnedAt: new Date().toISOString() },
      { id: "b2", name: "Test2", description: "d", icon: "Target", earnedAt: new Date().toISOString() },
    ] as AchievementBadge[];
    expect(computeXP(0, 0, 0, badges)).toBe(50);
  });
  it("sums all XP sources", () => {
    const badges = [
      { id: "b1", name: "Test", description: "d", icon: "Trophy", earnedAt: new Date().toISOString() },
    ] as AchievementBadge[];
    // 5*10 + 3*5 + 7*3 + 1*25 = 50+15+21+25 = 111
    expect(computeXP(5, 3, 7, badges)).toBe(111);
  });
});

describe("LEVELS", () => {
  it("has 10 levels", () => {
    expect(LEVELS).toHaveLength(10);
  });
  it("levels are in ascending order", () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].minXP).toBeGreaterThan(LEVELS[i - 1].minXP);
    }
  });
  it("last level has Infinity maxXP", () => {
    expect(LEVELS[LEVELS.length - 1].maxXP).toBe(Infinity);
  });
});

describe("useGamificationScore - leitura de user_progress", () => {
  beforeEach(() => {
    mockProgressSelect.mockClear();
    mockUserData = null;
  });

  it("consulta apenas as colunas usadas no cálculo, sem select(\"*\")", async () => {
    // Arrange
    const expectedColumns = "total_scans, current_streak, longest_streak, badges";

    // Act
    renderHook(() => useGamificationScore());

    // Assert
    await waitFor(() => {
      expect(mockProgressSelect).toHaveBeenCalledWith(expectedColumns);
    });
    expect(mockProgressSelect).not.toHaveBeenCalledWith("*");
  });
});

describe("Bilingual Wellness Components (EN & PT)", () => {
  beforeEach(() => {
    mockUserData = {
      total_scans: 10,
      current_streak: 5,
      longest_streak: 12,
      last_scan_date: "2026-11-14",
      badges: [
        {
          id: "first_scan",
          name: "Check-in Inicial",
          description: "Completou primeiro scan!",
          icon: "Target",
          earnedAt: "2026-11-10T12:00:00Z",
        },
        {
          id: "warrior",
          name: "Monitoramento Constante",
          description: "10 scans completos!",
          icon: "Zap",
          earnedAt: "2026-11-14T12:00:00Z",
        },
      ],
    };
  });

  describe("GamificationScoreCard", () => {
    it("renders in English and ensures Portuguese texts do not appear", async () => {
      render(
        React.createElement(
          LangProvider,
          { initialLang: "en" },
          React.createElement(GamificationScoreCard, null)
        )
      );

      await waitFor(() => {
        expect(screen.getByText("Mission Discipline")).toBeInTheDocument();
        expect(screen.getByText("10 Cycles Completed")).toBeInTheDocument();
      });

      expect(screen.getByText("Completed Cycles")).toBeInTheDocument();
      expect(screen.getByText("Monitoring Streak")).toBeInTheDocument();
      expect(screen.getByText("Protocols Up to Date")).toBeInTheDocument();
      expect(screen.getByText("Stage 3")).toBeInTheDocument();

      // Assert Portuguese texts do not appear in EN
      expect(screen.queryByText("Ciclos Concluídos")).toBeNull();
      expect(screen.queryByText("Sequência de Monitoramento")).toBeNull();
      expect(screen.queryByText("Protocolos em Dia")).toBeNull();
      expect(screen.queryByText("Etapa 3")).toBeNull();
    });

    it("renders in Portuguese correctly", async () => {
      render(
        React.createElement(
          LangProvider,
          { initialLang: "pt" },
          React.createElement(GamificationScoreCard, null)
        )
      );

      await waitFor(() => {
        expect(screen.getByText("Disciplina de Missão")).toBeInTheDocument();
        expect(screen.getByText("10 Ciclos Concluídos")).toBeInTheDocument();
      });

      expect(screen.getByText("Ciclos Concluídos")).toBeInTheDocument();
      expect(screen.getByText("Sequência de Monitoramento")).toBeInTheDocument();
      expect(screen.getByText("Protocolos em Dia")).toBeInTheDocument();
      expect(screen.getByText("Etapa 3")).toBeInTheDocument();
    });
  });

  describe("Gamification", () => {
    it("renders in English and verifies badge translation and no Portuguese strings", async () => {
      render(
        React.createElement(
          LangProvider,
          { initialLang: "en" },
          React.createElement(Gamification, null)
        )
      );

      await waitFor(() => {
        expect(screen.getByText("Mission Discipline")).toBeInTheDocument();
        expect(screen.getByText("Active monitoring streak")).toBeInTheDocument();
      });

      expect(screen.getByText("Protocols Up to Date (2)")).toBeInTheDocument();
      expect(screen.getByText("Initial Check-in")).toBeInTheDocument();
      expect(screen.getByText("Completed first scan!")).toBeInTheDocument();
      expect(screen.getByText("Constant Monitoring")).toBeInTheDocument();
      expect(screen.getByText("10 scans completed!")).toBeInTheDocument();
      expect(screen.getByText("Scan for 2 more days for Resilience Protocol")).toBeInTheDocument();

      // Assert old Portuguese texts do not appear in EN
      expect(screen.queryByText("Check-in Inicial")).toBeNull();
      expect(screen.queryByText("Completou primeiro scan!")).toBeNull();
      expect(screen.queryByText("Monitoramento Constante")).toBeNull();
      expect(screen.queryByText("10 scans completos!")).toBeNull();
      expect(screen.queryByText(/Faça scan por mais 2 dias/i)).toBeNull();
    });
  });

  describe("SmartBreakAssistant", () => {
    it("renders in English and checks absence of Portuguese texts", () => {
      render(
        React.createElement(
          LangProvider,
          { initialLang: "en" },
          React.createElement(SmartBreakAssistant, null)
        )
      );

      expect(screen.getByText("Smart Break Assistant")).toBeInTheDocument();
      expect(screen.getByText("Current cognitive load")).toBeInTheDocument();
      expect(screen.getByText("Generate Break Suggestions")).toBeInTheDocument();

      // Assert Portuguese texts do not appear in EN
      expect(screen.queryByText("Assistente de Pausas Inteligentes")).toBeNull();
      expect(screen.queryByText("Carga cognitiva atual")).toBeNull();
      expect(screen.queryByText("Gerar Sugestões de Pausa")).toBeNull();
    });

    it("renders in Portuguese correctly", () => {
      render(
        React.createElement(
          LangProvider,
          { initialLang: "pt" },
          React.createElement(SmartBreakAssistant, null)
        )
      );

      expect(screen.getByText("Assistente de Pausas Inteligentes")).toBeInTheDocument();
      expect(screen.getByText("Carga cognitiva atual")).toBeInTheDocument();
      expect(screen.getByText("Gerar Sugestões de Pausa")).toBeInTheDocument();
    });
  });

  describe("CognitiveFatigueAnalyzer", () => {
    it("renders in English and checks absence of Portuguese texts", () => {
      render(
        React.createElement(
          LangProvider,
          { initialLang: "en" },
          React.createElement(CognitiveFatigueAnalyzer, null)
        )
      );

      expect(screen.getByText("Cognitive Fatigue Metrics")).toBeInTheDocument();
      expect(
        screen.getByText("Workload and operational fatigue monitoring (decision support)")
      ).toBeInTheDocument();
      expect(screen.getByText("Analyze Cognitive Load")).toBeInTheDocument();

      // Assert Portuguese texts do not appear in EN
      expect(screen.queryByText("Métricas de Fadiga Cognitiva")).toBeNull();
      expect(
        screen.queryByText("Monitoramento de carga de trabalho e fadiga operacional (apoio operacional)")
      ).toBeNull();
      expect(screen.queryByText("Analisar Carga Cognitiva")).toBeNull();
    });

    it("renders in Portuguese correctly", () => {
      render(
        React.createElement(
          LangProvider,
          { initialLang: "pt" },
          React.createElement(CognitiveFatigueAnalyzer, null)
        )
      );

      expect(screen.getByText("Métricas de Fadiga Cognitiva")).toBeInTheDocument();
      expect(
        screen.getByText("Monitoramento de carga de trabalho e fadiga operacional (apoio operacional)")
      ).toBeInTheDocument();
      expect(screen.getByText("Analisar Carga Cognitiva")).toBeInTheDocument();
    });
  });

  describe("LeadershipCoaching", () => {
    it("renders in English and checks absence of Portuguese texts", () => {
      render(
        React.createElement(
          LangProvider,
          { initialLang: "en" },
          React.createElement(LeadershipCoaching, null)
        )
      );

      expect(screen.getAllByText("Self-Management").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Conflict Management")).toBeInTheDocument();
      expect(screen.getByText("Neuroscientific Leadership")).toBeInTheDocument();
      expect(screen.getByText("Career Transition")).toBeInTheDocument();
      expect(screen.getByText("Unlock Leadership Coaching")).toBeInTheDocument();

      // Assert Portuguese texts do not appear in EN
      expect(screen.queryByText("Auto Gerenciamento")).toBeNull();
      expect(screen.queryByText("Gestão de Conflitos")).toBeNull();
      expect(screen.queryByText("Liderança Neurocientífica")).toBeNull();
      expect(screen.queryByText("Mudança de Carreira")).toBeNull();
      expect(screen.queryByText("Desbloqueie Coaching de Liderança")).toBeNull();
    });

    it("renders in Portuguese correctly", () => {
      render(
        React.createElement(
          LangProvider,
          { initialLang: "pt" },
          React.createElement(LeadershipCoaching, null)
        )
      );

      expect(screen.getAllByText("Auto Gerenciamento").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Gestão de Conflitos")).toBeInTheDocument();
      expect(screen.getByText("Liderança Neurocientífica")).toBeInTheDocument();
      expect(screen.getByText("Mudança de Carreira")).toBeInTheDocument();
      expect(screen.getByText("Desbloqueie Coaching de Liderança")).toBeInTheDocument();
    });
  });
});
