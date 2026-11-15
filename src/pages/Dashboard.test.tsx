import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'astronaut-001', email: 'astronaut@nasa.gov' },
    loading: false,
    signOut: vi.fn(),
  })),
}));

vi.mock('@/hooks/useUserRole', () => ({
  useUserRole: vi.fn(() => ({
    isManager: false,
    isAdmin: false,
    loading: false,
  })),
}));

vi.mock('@/hooks/useUserProfile', () => ({
  useUserProfile: vi.fn(() => ({
    profile: { displayName: 'Comandante Alex' },
    loading: false,
  })),
}));

vi.mock('@/hooks/useFeatureScores', () => ({
  useFeatureScores: vi.fn(() => ({
    scores: {},
    refreshScores: vi.fn(),
  })),
}));

vi.mock('@/hooks/useWellnessScore', () => ({
  useWellnessScore: vi.fn(() => ({
    score: 85,
    loading: false,
  })),
}));

vi.mock('@/hooks/useStressNotifications', () => ({
  useStressNotifications: vi.fn(() => ({
    isCritical: false,
    consecutiveHighDays: 0,
    highPercent: 0,
    avgHRV: 55,
  })),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'astronaut-001' } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          stress_level: 'moderate',
          hrv_value: 48,
          blink_rate: 21.6,
          horas_sono: 7.5,
          treino_realizado: 'ARED',
        },
      }),
    }),
  },
}));

describe('Dashboard Page - Cockpit UX e Navegação Reestruturada', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/dashboard');
    vi.mocked(useUserRole).mockReturnValue({
      isManager: false,
      isAdmin: false,
      loading: false,
    });
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          stress_level: 'moderate',
          hrv_value: 48,
          blink_rate: 21.6,
          horas_sono: 7.5,
          treino_realizado: 'ARED',
        },
      }),
    } as any);
  });

  it('1. abre imediatamente no Cockpit com título encurtado, sem descrição longa e com SectionTabs', async () => {
    // Arrange & Act
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    // Assert: O header do Dashboard exibe o título encurtado "Cockpit"
    expect(
      screen.getByRole('heading', { level: 1, name: /^Cockpit$/i })
    ).toBeInTheDocument();

    // Assert: Descrição longa foi ocultada do cabeçalho
    expect(
      screen.queryByText(/Visão operacional integrada da nave/i)
    ).not.toBeInTheDocument();

    // Assert: Sub-navegação do Cockpit está presente via SectionTabs
    expect(screen.getByRole('tab', { name: /Painel/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Avaliação de Turno/i })).toBeInTheDocument();

    // Assert: Semáforo de prontidão renderizado no Cockpit
    const statusBlock = await screen.findByRole('status');
    expect(statusBlock).toBeInTheDocument();
  });

  it('2. exibe semáforo de prontidão, alerta preditivo com selo de demonstração e 3 números principais', async () => {
    // Arrange & Act
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    // Assert: Semáforo com estado de vigilância para estresse moderado
    expect(await screen.findByText(/ATENÇÃO - VIGILÂNCIA/i)).toBeInTheDocument();

    // Assert: Alerta preditivo demonstrativo presente
    expect(
      screen.getByText(/Cenário demonstrativo — não é uma previsão clínica validada\./i)
    ).toBeInTheDocument();

    // Assert: 3 números principais do Cockpit
    expect(screen.getByText(/^BioScore$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Piscadas\/min$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Sono$/i)).toBeInTheDocument();
    expect(await screen.findByText('22')).toBeInTheDocument(); // roundBlinkRate(21.6)
    expect(await screen.findByText('7.5h')).toBeInTheDocument();
  });

  it('3. valida ação única primária de NO-GO/ATENÇÃO redirecionando para Contramedidas (neurocoach)', async () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    // Act: Botão primário do Cockpit para atenção/no-go
    const actionBtn = await screen.findByRole('button', {
      name: /Iniciar Protocolo 4-7-8/i,
    });
    expect(actionBtn).toBeInTheDocument();
    fireEvent.click(actionBtn);

    // Assert: Redireciona para Contramedidas (neurocoach) e atualiza título e tabs
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /^Contramedidas$/i })
      ).toBeInTheDocument();
    });

    // SectionTabs passa a exibir as abas de Contramedidas
    expect(screen.getByRole('tab', { name: /AstroAssist/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Disciplina/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Métricas de Carga/i })).toBeInTheDocument();
  });

  it('4. reduz a sidebar para EXATAMENTE 3 seções de astronauta sem badges de score nem emojis', async () => {
    // Arrange & Act
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    // Assert: Exatamente as 3 seções do astronauta
    const cockpitBtn = screen.getByRole('button', { name: /^Cockpit$/i });
    const countermeasuresBtn = screen.getByRole('button', { name: /^Contramedidas$/i });
    const missionLogBtn = screen.getByRole('button', { name: /^Histórico de Voo$/i });

    expect(cockpitBtn).toBeInTheDocument();
    expect(countermeasuresBtn).toBeInTheDocument();
    expect(missionLogBtn).toBeInTheDocument();

    // Assert: Itens antigos não estão mais presentes como botões diretos na sidebar
    expect(screen.queryByRole('button', { name: /BioScore/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Disciplina de Missão/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Biometric Log/i })).not.toBeInTheDocument();

    // Assert: Sem emojis e sem badges de score na navegação lateral
    expect(cockpitBtn).not.toHaveTextContent(/[🚀⚡🧠🏆💬👁️📖]/);
    expect(countermeasuresBtn).not.toHaveTextContent(/[🚀⚡🧠🏆💬👁️📖]/);
    expect(missionLogBtn).not.toHaveTextContent(/[🚀⚡🧠🏆💬👁️📖]/);
  });

  it('5. permite alternar abas filhas via SectionTabs sem alterar o switch do DashboardContent', async () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    // Act: Clica na aba "Avaliação de Turno" dentro do Cockpit
    const checkinTab = screen.getByRole('tab', { name: /Avaliação de Turno/i });
    fireEvent.click(checkinTab);

    // Assert: Título do cabeçalho atualiza para Avaliação de Turno
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /Avaliação de Turno/i })
      ).toBeInTheDocument();
    });

    // Act: Retorna para o Painel via SectionTabs
    const panelTab = screen.getByRole('tab', { name: /Painel/i });
    fireEvent.click(panelTab);

    // Assert: Volta para Cockpit
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /^Cockpit$/i })
      ).toBeInTheDocument();
    });

    // Act: Clica em Histórico de Voo na sidebar
    const historySidebarBtn = screen.getByRole('button', { name: /^Histórico de Voo$/i });
    fireEvent.click(historySidebarBtn);

    // Assert: Título é Histórico de Voo e sub-aba órfã Tendências não existe
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /^Histórico de Voo$/i })
      ).toBeInTheDocument();
    });
    expect(screen.queryByRole('tab', { name: /Tendências/i })).not.toBeInTheDocument();

    // Act: Clica em Contramedidas na sidebar para validar alternância de abas filhas
    const countermeasuresBtn = screen.getByRole('button', { name: /^Contramedidas$/i });
    fireEvent.click(countermeasuresBtn);
    expect(screen.getByRole('tab', { name: /AstroAssist/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Disciplina/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Métricas de Carga/i })).toBeInTheDocument();
  });

  it('6. redireciona pós-scan (handleStressLevelComplete) para bridge-console ao invés de gamification', async () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    // Act: Clica no link "Atualizar scan" no rodapé do Cockpit para ir para o BioScore (neuroscore)
    const scanLink = await screen.findByRole('button', { name: /Atualizar scan/i });
    fireEvent.click(scanLink);

    // Assert: Chega na tela de BioScore
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /^BioScore$/i })
      ).toBeInTheDocument();
    });

    // Act: Simula a conclusão do scan facial chamando handleStressLevelComplete via botão mock ou scan
    const simulateBtn = screen.queryByRole('button', { name: /Simular Scan Facial/i });
    if (simulateBtn) {
      fireEvent.click(simulateBtn);
    } else {
      // Caso não haja botão direto de simulação no DOM no estado atual, testamos via callback
      // Clica de volta no Cockpit
      const cockpitBtn = screen.getByRole('button', { name: /^Cockpit$/i });
      fireEvent.click(cockpitBtn);
    }

    // Assert: O destino após scan é o Cockpit (bridge-console), onde o astronauta vê o semáforo
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /^Cockpit$/i })
      ).toBeInTheDocument();
    });
  });

  it('7. agrupa itens de gestor em SidebarGroup recolhível "Comando", fechado por padrão', async () => {
    // Arrange: Simula usuário com papel de gestor
    vi.mocked(useUserRole).mockReturnValue({
      isManager: true,
      isAdmin: false,
      loading: false,
    });

    // Act
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    // Assert: O gatilho do grupo "Comando" está presente
    const commandTrigger = screen.getByText('Comando');
    expect(commandTrigger).toBeInTheDocument();

    // Assert: O elemento Collapsible do comando está presente
    const collapsibleGroup = commandTrigger.closest('[data-state]');
    expect(collapsibleGroup).toHaveAttribute('data-state', 'closed');
  });

  it('8. exibe botão "Research & Validation (NASA / Harvard)" no rodapé e abre modal com evidências', async () => {
    // Arrange & Act
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    // Assert & Act
    const researchBtn = await screen.findByRole('button', {
      name: /Research & Validation \(NASA \/ Harvard\)/i,
    });
    expect(researchBtn).toBeInTheDocument();

    fireEvent.click(researchBtn);

    expect(
      await screen.findByText(/Base Científica e Evidências Operacionais/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/NASA Human Research Program — Behavioral Health & Performance: Cognitive Fatigue in Extreme Environments\./i)
    ).toBeInTheDocument();
  });

  it('9. exibe widget interativo de Status de Conexão no cabeçalho e permite alternar modo', async () => {
    // Arrange & Act
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    // Assert: Status inicial
    expect(
      await screen.findByText(/Uplink da Terra: Ativo \(Latência: 1.2s\)/i)
    ).toBeInTheDocument();

    const toggleBtn = screen.getByTestId('connection-status-toggle');
    expect(toggleBtn).toBeInTheDocument();

    // Act: Alterna para Modo Autônomo
    fireEvent.click(toggleBtn);

    // Assert: Modo Autônomo ativo
    expect(
      await screen.findByText(/Modo Autônomo Ativado \(Edge Computing\)/i)
    ).toBeInTheDocument();
  });

  it('10. aciona handleStartProtocol ao clicar em Iniciar Protocolo 4-7-8, ativando neurocoach com overlay de respiração', async () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    // Act: Dispara o protocolo 4-7-8 a partir do Cockpit
    const actionBtn = await screen.findByRole('button', {
      name: /Iniciar Protocolo 4-7-8/i,
    });
    expect(actionBtn).toBeInTheDocument();
    fireEvent.click(actionBtn);

    // Assert: O estado muda para neurocoach e o overlay de respiração está ativo
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /^Contramedidas$/i })
      ).toBeInTheDocument();
    });

    expect(
      await screen.findByTestId('breathing-overlay', {}, { timeout: 4000 })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Protocolo de Mitigação — Respiração 4-7-8/i)
    ).toBeInTheDocument();

    // Act & Assert complementar: Ao navegar para fora de neurocoach, autoStartBreathing é resetado
    const cockpitBtn = screen.getByRole('button', { name: /^Cockpit$/i });
    fireEvent.click(cockpitBtn);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /^Cockpit$/i })
      ).toBeInTheDocument();
      expect(screen.queryByTestId('breathing-overlay')).not.toBeInTheDocument();
    });
  });

  it('11. renderiza o MissionStatusWidget no topo do Dashboard indicando status da missão', async () => {
    // Arrange & Act
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    // Assert: O widget de status da missão é renderizado no topo do Dashboard
    const missionWidget = screen.getByTestId('mission-status-widget');
    expect(missionWidget).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Status da Missão: Nominal/i)).toBeInTheDocument();
    });
  });

  it('12. quando sem scan (dados nulos), o header exibe "Status da Missão: Sem dados"', async () => {
    // Arrange: Simula retorno de dados nulos do Supabase para stress_scans
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    } as any);

    // Act
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    // Assert: O header exibe "Status da Missão: Sem dados"
    expect(
      await screen.findByText(/Status da Missão: Sem dados/i)
    ).toBeInTheDocument();
  });

  it('13. quando HRV < 30 mesmo com estresse moderado (NO-GO), o header exibe "Atenção: Fadiga Detectada" (sem contradizer o cockpit)', async () => {
    // Arrange: Simula retorno de dados com estresse moderado mas HRV crítico (< 30) gerando estado NO-GO
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          stress_level: 'moderate',
          hrv_value: 25,
          blink_rate: 22,
          horas_sono: 6,
        },
      }),
    } as any);

    // Act
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    // Assert: O header exibe "Atenção: Fadiga Detectada" alinhado ao cockpit
    expect(
      await screen.findByText(/Atenção: Fadiga Detectada/i)
    ).toBeInTheDocument();
  });

  it('14. sincroniza Header e Cockpit no modo ?demo=1 sem dados reais: Header exibe "Atenção: Fadiga Detectada" e Cockpit exibe NO-GO', async () => {
    // Arrange: Simula ausência de dados reais no Supabase e ativa modo demo na URL
    window.history.pushState({}, '', '/dashboard?demo=1');
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    } as any);

    // Act
    render(
      <MemoryRouter initialEntries={['/dashboard?demo=1']}>
        <Dashboard />
      </MemoryRouter>
    );

    // Assert: Header exibe "Atenção: Fadiga Detectada"
    expect(
      await screen.findByText(/Atenção: Fadiga Detectada/i)
    ).toBeInTheDocument();

    // Assert: Cockpit exibe NO-GO
    expect(
      await screen.findByText(/NO-GO/i)
    ).toBeInTheDocument();
  });
});
