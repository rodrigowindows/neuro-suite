import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import NeuroScore from './NeuroScore';

const { mockStressSelect } = vi.hoisted(() => ({
  mockStressSelect: vi.fn().mockReturnThis(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'astronaut-001' } } }),
    },
    from: vi.fn((table: string) => {
      const chain: Record<string, unknown> = {
        select: table === 'stress_scans' ? mockStressSelect : vi.fn().mockReturnThis(),
        eq: vi.fn(() => chain),
        order: vi.fn(() => chain),
        limit: vi.fn(() => chain),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      return chain;
    }),
  },
}));

vi.mock('@/hooks/useConnectionMode', () => ({
  useConnectionMode: vi.fn(() => ({ isAutonomous: false })),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({ toast: vi.fn() })),
}));

vi.mock('@/components/WebcamCapture', () => ({ default: () => null }));
vi.mock('@/components/StressTrendChart', () => ({ default: () => null }));
vi.mock('@/components/PostScanActionPlan', () => ({ default: () => null }));

describe('NeuroScore (legado) - leitura de stress_scans', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carrega o último scan com colunas explícitas, sem select("*") (AAA)', async () => {
    // Arrange
    const expectedColumns = 'blink_rate, stress_level, hrv_value';

    // Act
    await act(async () => {
      render(<NeuroScore onScoreComplete={vi.fn()} />);
    });

    // Assert
    expect(mockStressSelect).toHaveBeenCalledWith(expectedColumns);
    expect(mockStressSelect).not.toHaveBeenCalledWith('*');
  });
});
