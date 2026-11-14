import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Gamification from './Gamification';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'astronaut-001', email: 'pilot@crewvitals.space' },
    loading: false,
  })),
}));

const mockUserProgress = {
  current_streak: 5,
  longest_streak: 12,
  total_scans: 10,
  last_scan_date: '2026-11-14',
  badges: [
    {
      id: 'first_scan',
      name: 'Check-in Inicial',
      description: 'Completou primeiro scan!',
      icon: 'Target',
      earnedAt: '2026-11-10T12:00:00Z',
    },
    {
      id: 'warrior',
      name: 'Monitoramento Constante',
      description: '10 scans completos!',
      icon: 'Zap',
      earnedAt: '2026-11-14T12:00:00Z',
    },
  ],
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'user_progress') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: mockUserProgress,
            error: null,
          }),
          update: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    }),
  },
}));

describe('Gamification - Cockpit Sóbrio NASA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza o cabeçalho e estatísticas sem emojis no formato cockpit', async () => {
    // Arrange & Act
    await act(async () => {
      render(<Gamification />);
    });

    // Assert
    expect(screen.getByText('Disciplina de Missão')).toBeInTheDocument();
    expect(screen.getByText('Sequência de Monitoramento')).toBeInTheDocument();
    expect(screen.getByText('Ciclos Concluídos')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Sequência de monitoramento ativa')).toBeInTheDocument();

    // Zero emojis de fogo ou foguete no texto
    expect(screen.queryByText(/🔥/)).not.toBeInTheDocument();
    expect(screen.queryByText(/ON FIRE/i)).not.toBeInTheDocument();
  });

  it('substitui emojis de badges por ícones Lucide mantendo IDs intactos', async () => {
    // Arrange & Act
    await act(async () => {
      render(<Gamification />);
    });

    // Assert
    expect(screen.getByText('Protocolos em Dia (2)')).toBeInTheDocument();
    expect(screen.getByText('Check-in Inicial')).toBeInTheDocument();
    expect(screen.getByText('Monitoramento Constante')).toBeInTheDocument();

    // Verifica que os ícones Lucide foram renderizados via testid
    expect(screen.getByTestId('icon-target')).toBeInTheDocument();
    expect(screen.getByTestId('icon-zap')).toBeInTheDocument();

    // Não deve conter emojis literais de alvo ou raio no texto
    expect(screen.queryByText(/🎯/)).not.toBeInTheDocument();
    expect(screen.queryByText(/⚡/)).not.toBeInTheDocument();
  });

  it('apresenta próximo objetivo com linguagem técnica sem emojis', async () => {
    // Arrange & Act
    await act(async () => {
      render(<Gamification />);
    });

    // Assert
    expect(screen.getByText(/Próximo objetivo:/i)).toBeInTheDocument();
    expect(screen.getByText(/Faça scan por mais 2 dias para Protocolo de Resiliência/i)).toBeInTheDocument();
    expect(screen.queryByText(/🧘/)).not.toBeInTheDocument();
    expect(screen.queryByText(/🏆/)).not.toBeInTheDocument();
  });
});
