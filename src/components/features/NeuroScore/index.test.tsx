import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import NeuroScore from './index';
import { LangProvider } from '@/i18n';

const { mockStressSelect } = vi.hoisted(() => ({
  mockStressSelect: vi.fn().mockReturnThis(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'astronaut-001' } } }),
    },
    from: vi.fn(() => {
      const chain: Record<string, unknown> = {
        select: mockStressSelect,
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

vi.mock('@/hooks/useUserProfile', () => ({
  useUserProfile: vi.fn(() => ({ profile: null })),
}));

vi.mock('@/components/WebcamCapture', () => ({ default: () => null }));
vi.mock('@/components/StressTrendChart', () => ({ default: () => null }));
vi.mock('./ScanResult', () => ({ default: () => null }));
vi.mock('./ScanProgress', () => ({ default: () => null }));

describe('features/NeuroScore - leitura de stress_scans', () => {
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

  it('renders in English under LangProvider initialLang="en"', async () => {
    let rendered: ReturnType<typeof render> | null = null;
    await act(async () => {
      rendered = render(
        <LangProvider initialLang="en">
          <NeuroScore onScoreComplete={vi.fn()} />
        </LangProvider>
      );
    });

    expect(rendered!.getByText('BioScore — Stress Detection')).toBeInTheDocument();
    expect(rendered!.getByText(/Webcam blink rate \+ HRV analysis/)).toBeInTheDocument();
    expect(rendered!.getByText('Start Scan (60s)')).toBeInTheDocument();
    expect(rendered!.queryByText('BioScore — Detecção de Estresse')).not.toBeInTheDocument();
    expect(rendered!.queryByText('Iniciar Scan (60s)')).not.toBeInTheDocument();
  });

  it('renders in Portuguese by default outside provider', async () => {
    let rendered: ReturnType<typeof render> | null = null;
    await act(async () => {
      rendered = render(<NeuroScore onScoreComplete={vi.fn()} />);
    });

    expect(rendered!.getByText('BioScore — Detecção de Estresse')).toBeInTheDocument();
    expect(rendered!.getByText(/Análise de taxa de piscadas \+ HRV/)).toBeInTheDocument();
    expect(rendered!.getByText('Iniciar Scan (60s)')).toBeInTheDocument();
  });
});
