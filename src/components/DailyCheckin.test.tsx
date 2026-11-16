import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DailyCheckin from './DailyCheckin';
import { LangProvider } from '@/i18n';
import { toast } from 'sonner';
import { useConnectionMode } from '@/hooks/useConnectionMode';
import { getOutboxCount, getOutbox, clearOutbox } from '@/lib/offlineOutbox';
import { supabase } from '@/integrations/supabase/client';

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'astronaut-001', email: 'pilot@crewvitals.space' },
    loading: false,
  })),
}));

vi.mock('@/hooks/useConnectionMode', () => ({
  useConnectionMode: vi.fn(() => ({
    isAutonomous: false,
    toggleConnectionMode: vi.fn(),
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockCheckinInsert = vi.fn().mockResolvedValue({ error: null });
const mockSupabaseSelect = vi.fn().mockReturnThis();
const mockSupabaseEq = vi.fn().mockReturnThis();
const mockSupabaseGte = vi.fn().mockReturnThis();
const mockSupabaseLte = vi.fn().mockReturnThis();
const mockSupabaseOrder = vi.fn().mockReturnThis();
let mockLimitResolvedValue: { data: unknown[]; error: unknown } = { data: [], error: null };

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSupabaseSelect,
      insert: mockCheckinInsert,
      eq: mockSupabaseEq,
      gte: mockSupabaseGte,
      lte: mockSupabaseLte,
      order: mockSupabaseOrder,
      limit: vi.fn(() => Promise.resolve(mockLimitResolvedValue)),
    })),
    functions: {
      invoke: vi.fn().mockResolvedValue({
        data: {
          sentiment: 0.8,
          wellbeingLevel: 'high',
          concerns: [],
          message: 'Prontidão operacional excelente.',
          needsAttention: false,
        },
        error: null,
      }),
    },
  },
}));

describe('DailyCheckin Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLimitResolvedValue = { data: [], error: null };
    vi.mocked(useConnectionMode).mockReturnValue({
      isAutonomous: false,
      toggleConnectionMode: vi.fn(),
    });
  });

  it('1. renderiza card inicial com título "Avaliação de Prontidão" sem menção a "Avaliação de Turno" (AAA)', async () => {
    // Arrange & Act
    render(<DailyCheckin />);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: /Avaliação de Prontidão/i })).toBeInTheDocument();
    });
    expect(screen.queryByText('Avaliação de Turno')).not.toBeInTheDocument();
    expect(screen.getAllByText('Avaliação de prontidão para o turno').length).toBeGreaterThan(0);
  });

  it('2. exibe pergunta e placeholder operacional no campo opcional de observações (AAA)', async () => {
    // Arrange
    render(<DailyCheckin />);

    // Act: Seleciona humor e avança para energia e depois para observações
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: /Avaliação de Prontidão/i })).toBeInTheDocument();
    });

    const goodMoodBtn = screen.getByText('Bom');
    fireEvent.click(goodMoodBtn);

    const continueBtn = await screen.findByRole('button', { name: /Continuar/i });
    fireEvent.click(continueBtn);

    // Assert: Verifica texto da pergunta e placeholder operacional
    expect(
      await screen.findByText(/Registre observações para o sistema/i)
    ).toBeInTheDocument();
    expect(screen.getByText('(Opcional)')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Ex: sono fragmentado, carga alta na EVA simulada...')
    ).toBeInTheDocument();
    expect(screen.queryByText(/Quer compartilhar algo\?/i)).not.toBeInTheDocument();
  });

  it('3. conclui o checkin exibindo confirmação e toast com "Avaliação de prontidão registrada!" (AAA)', async () => {
    // Arrange
    render(<DailyCheckin />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: /Avaliação de Prontidão/i })).toBeInTheDocument();
    });

    // Act: Seleciona humor, avança energia e envia
    fireEvent.click(screen.getByText('Ótimo'));
    const continueBtn = await screen.findByRole('button', { name: /Continuar/i });
    fireEvent.click(continueBtn);

    const skipOrSubmitBtn = await screen.findByRole('button', { name: /Pular/i });
    fireEvent.click(skipOrSubmitBtn);

    // Assert: Tela de sucesso e toast informam prontidão
    await waitFor(() => {
      expect(screen.getByText('Avaliação de prontidão registrada!')).toBeInTheDocument();
    });
    expect(toast.success).toHaveBeenCalledWith('Avaliação de prontidão registrada!');
    expect(screen.queryByText('Avaliação de turno registrada!')).not.toBeInTheDocument();
  });

  it('4. quando já existe checkin hoje, exibe "Avaliação de Prontidão" e botão "Nova avaliação de prontidão" (AAA)', async () => {
    // Arrange: Configura checkin existente para o dia de hoje
    mockLimitResolvedValue = {
      data: [
        {
          id: 'checkin-today-1',
          user_id: 'astronaut-001',
          mood: 'good',
          energy_level: 4,
          created_at: new Date().toISOString(),
          ai_response: 'Telemetria e prontidão validadas.',
        },
      ],
      error: null,
    };

    // Act
    render(<DailyCheckin />);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: /Avaliação de Prontidão/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Nova avaliação de prontidão/i })).toBeInTheDocument();
    expect(screen.queryByText('Avaliação de Turno')).not.toBeInTheDocument();
    expect(screen.queryByText('Nova avaliação de turno')).not.toBeInTheDocument();
  });

  it('5. em modo autônomo: gravações vão para a outbox, UI confirma uplink pendente e IA em nuvem não é chamada (AAA)', async () => {
    // Arrange: modo autonomo ativo
    clearOutbox();
    vi.mocked(useConnectionMode).mockReturnValue({
      isAutonomous: true,
      mode: 'autonomous',
      toggleConnection: vi.fn(),
      setMode: vi.fn(),
      setIsAutonomous: vi.fn(),
    });

    render(<DailyCheckin />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: /Avaliação de Prontidão/i })).toBeInTheDocument();
    });

    // Act: preenche e envia checkin
    fireEvent.click(screen.getByText('Bom'));
    const continueBtn = await screen.findByRole('button', { name: /Continuar/i });
    fireEvent.click(continueBtn);

    const skipOrSubmitBtn = await screen.findByRole('button', { name: /Pular/i });
    fireEvent.click(skipOrSubmitBtn);

    // Assert: confirma toast exato de outbox
    expect(toast.success).toHaveBeenCalledWith(
      'Registro salvo localmente — será enviado ao restabelecer o uplink'
    );

    // Assert: Supabase insert e cloud functions NÃO foram chamadas para envio
    expect(mockCheckinInsert).not.toHaveBeenCalled();
    expect(supabase.functions.invoke).not.toHaveBeenCalledWith('daily-checkin', expect.anything());

    // Assert: item foi salvo na outbox
    expect(getOutboxCount()).toBe(1);
    const item = getOutbox()[0];
    expect(item.table).toBe('daily_checkins');
    expect(item.op).toBe('insert');
    expect(item.payload.ai_response).toContain('Gerado localmente (regras fixas, sem IA em nuvem)');

    // Assert: UI exibe o texto determinístico local
    await waitFor(() => {
      expect(
        screen.getByText(/Gerado localmente \(regras fixas, sem IA em nuvem\)/i)
      ).toBeInTheDocument();
    });
  });

  it('6. consulta o check-in do dia com colunas explícitas, sem select("*") (AAA)', async () => {
    // Arrange
    const expectedColumns = 'mood, energy_level, ai_response, created_at';

    // Act
    render(<DailyCheckin />);

    // Assert
    await waitFor(() => {
      expect(mockSupabaseSelect).toHaveBeenCalledWith(expectedColumns);
    });
    expect(mockSupabaseSelect).not.toHaveBeenCalledWith('*');
  });

  describe('7. Internacionalização (LangProvider EN e PT)', () => {
    it('renderiza toda a jornada do checkin em inglês com LangProvider initialLang="en"', async () => {
      // Arrange
      render(
        <LangProvider initialLang="en">
          <DailyCheckin />
        </LangProvider>
      );

      // Assert Step 1: Heading e Moods em inglês
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 3, name: /Readiness Assessment/i })
        ).toBeInTheDocument();
      });
      expect(screen.queryByText('Avaliação de Prontidão')).not.toBeInTheDocument();
      expect(screen.getAllByText('Shift readiness assessment').length).toBeGreaterThan(0);
      expect(screen.getByText('Good')).toBeInTheDocument();
      expect(screen.getByText('Great')).toBeInTheDocument();
      expect(screen.getByText('Critical')).toBeInTheDocument();

      // Act: seleciona mood e avança
      fireEvent.click(screen.getByText('Good'));

      // Assert Step 2: Energy em inglês
      await waitFor(() => {
        expect(screen.getByText('Energy level?')).toBeInTheDocument();
      });
      expect(screen.queryByText('Nível de energia?')).not.toBeInTheDocument();
      expect(screen.getByText('1 (Minimum)')).toBeInTheDocument();
      expect(screen.getByText('5 (Maximum)')).toBeInTheDocument();

      const continueBtn = screen.getByRole('button', { name: /Continue/i });
      expect(screen.queryByText('Continuar')).not.toBeInTheDocument();
      fireEvent.click(continueBtn);

      // Assert Step 3: Note em inglês
      expect(
        await screen.findByText(/Record observations for the system/i)
      ).toBeInTheDocument();
      expect(screen.queryByText('Registre observações para o sistema')).not.toBeInTheDocument();
      expect(screen.getByText('(Optional)')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('E.g.: fragmented sleep, high load during simulated EVA...')
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Skip/i })).toBeInTheDocument();
      expect(screen.queryByText('Pular')).not.toBeInTheDocument();

      // Act: envia
      fireEvent.click(screen.getByRole('button', { name: /Skip/i }));

      // Assert Step 4: Done em inglês
      await waitFor(() => {
        expect(screen.getByText('Readiness assessment recorded!')).toBeInTheDocument();
      });
      expect(screen.queryByText('Avaliação de prontidão registrada!')).not.toBeInTheDocument();
      expect(toast.success).toHaveBeenCalledWith('Readiness assessment recorded!');
    });

    it('quando já existe checkin hoje, exibe textos em inglês com LangProvider initialLang="en"', async () => {
      // Arrange
      mockLimitResolvedValue = {
        data: [
          {
            id: 'checkin-today-en',
            user_id: 'astronaut-001',
            mood: 'good',
            energy_level: 4,
            created_at: new Date().toISOString(),
            ai_response: 'Nominal telemetry.',
          },
        ],
        error: null,
      };

      // Act
      render(
        <LangProvider initialLang="en">
          <DailyCheckin />
        </LangProvider>
      );

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 3, name: /Readiness Assessment/i })
        ).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /New readiness assessment/i })).toBeInTheDocument();
      expect(screen.queryByText('Nova avaliação de prontidão')).not.toBeInTheDocument();
      expect(screen.getByText(/Energy: 4\/5/i)).toBeInTheDocument();
    });
  });
});
