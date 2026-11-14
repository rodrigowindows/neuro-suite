import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CheckinHistory from './CheckinHistory';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'astronaut-001', email: 'pilot@crewvitals.space' },
    loading: false,
  })),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            mood: 'great',
            energy_level: 4,
            created_at: new Date().toISOString(),
          },
          {
            mood: 'okay',
            energy_level: 3,
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        error: null,
      }),
    })),
  },
}));

vi.mock('recharts', async () => {
  const actual: any = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => <div data-testid="recharts-container">{children}</div>,
  };
});

describe('CheckinHistory Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza o cabeçalho "Histórico — 7 dias" e ícones Lucide sóbrios sem emojis', async () => {
    // Arrange & Act
    render(<CheckinHistory />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Histórico — 7 dias/i)).toBeInTheDocument();
    });

    // Check that aria-labels for mood icons exist
    expect(screen.getByLabelText('Ótimo')).toBeInTheDocument();
    expect(screen.getByLabelText('Nominal')).toBeInTheDocument();

    // Verify no emojis are rendered in the container
    const container = screen.getByText(/Histórico — 7 dias/i).closest('.shadow-soft');
    expect(container?.textContent).not.toMatch(/🤩|😊|⚡|😔|😩/);
  });

  it('exibe a legenda explicativa sem emojis decorativos', async () => {
    // Arrange & Act
    render(<CheckinHistory />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Barras = prontidão\/energia • Indicador = carga cognitiva do dia/i)).toBeInTheDocument();
    });
  });
});
