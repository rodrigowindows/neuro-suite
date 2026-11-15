import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { getLevelForXP, computeXP, LEVELS, useGamificationScore } from "./useGamificationScore";
import type { AchievementBadge } from "@/types/stress";

const { mockProgressSelect } = vi.hoisted(() => ({
  mockProgressSelect: vi.fn().mockReturnThis(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "astronaut-001" } } }),
    },
    from: vi.fn(() => {
      const chain = {
        select: mockProgressSelect,
        eq: vi.fn(() => chain),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
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
