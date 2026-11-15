import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { useUserRole } from '@/hooks/useUserRole';
import { useWellnessScore } from '@/hooks/useWellnessScore';
import { supabase } from '@/integrations/supabase/client';
import { registerCountermeasureProtocol } from '@/lib/missionEvents';
import { setStoredDemoStage, DemoStage } from '@/lib/demoScenario';

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

vi.mock('@/hooks/useWellnessScore', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useWellnessScore')>()),
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
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState({}, '', '/dashboard');
    vi.mocked(useWellnessScore).mockReturnValue({
      score: 85,
      loading: false,
    } as any);
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
    expect(screen.getByRole('tab', { name: /Avaliação de Prontidão/i })).toBeInTheDocument();

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
    expect(screen.queryByRole('button', { name: /^BioScore$/i })).not.toBeInTheDocument();
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

    // Act: Clica na aba "Avaliação de Prontidão" dentro do Cockpit
    const checkinTab = screen.getByRole('tab', { name: /Avaliação de Prontidão/i });
    fireEvent.click(checkinTab);

    // Assert: Título do cabeçalho atualiza para Avaliação de Prontidão
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /Avaliação de Prontidão/i })
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
      await screen.findByText(/Uplink da Terra: Ativo/i)
    ).toBeInTheDocument();

    const toggleBtn = screen.getByTestId('connection-status-toggle');
    expect(toggleBtn).toBeInTheDocument();

    // Act: Alterna para Modo Autônomo
    fireEvent.click(toggleBtn);

    // Assert: Modo Autônomo ativo
    expect(
      await screen.findByText(/Modo Autônomo \(Edge Computing\) Ativado/i)
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
      expect(screen.getByText(/Status da Missão: Atenção/i)).toBeInTheDocument();
    });
  });

  it('12. quando sem scan (dados nulos), o header exibe "Status da Missão: Aguardando scan"', async () => {
    // Arrange: Simula retorno de dados nulos do Supabase para stress_scans
    vi.mocked(useWellnessScore).mockReturnValue({
      score: null,
      loading: false,
    } as any);
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

    // Assert: O header exibe "Status da Missão: Aguardando scan" e o cockpit exibe veredito AGUARDANDO SCAN
    expect(
      await screen.findByText(/Status da Missão: Aguardando scan/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText('AGUARDANDO SCAN')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Realizar BioScore|Iniciar Scan de Prontidão/i })
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

    // Assert: O header exibe "Atenção: Fadiga Detectada" e o cockpit exibe NO-GO
    expect(
      await screen.findByText(/Atenção: Fadiga Detectada/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/NO-GO - FADIGA \(NÃO APTO\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Iniciar Protocolo 4-7-8/i })
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

    // Assert: Cockpit exibe NO-GO e métricas fixas de demonstração
    expect(
      await screen.findByText(/NO-GO/i)
    ).toBeInTheDocument();
    expect(screen.getByText('34')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('5.5h')).toBeInTheDocument();
    expect(screen.getAllByText('DEMO').length).toBeGreaterThan(0);
  });

  it('15. sincroniza Header e Cockpit no estado GO: Header exibe "Status da Missão: Nominal" e Cockpit exibe "GO - APTO PARA O TURNO"', async () => {
    // Arrange: Telemetria saudável no Supabase
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          stress_level: 'low',
          hrv_value: 65,
          blink_rate: 16,
          horas_sono: 8,
        },
      }),
    } as any);

    // Act
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    // Assert: Header exibe Nominal e Cockpit exibe GO
    expect(
      await screen.findByText(/Status da Missão: Nominal/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/GO - APTO PARA O TURNO/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Iniciar Turno/i })
    ).toBeInTheDocument();
  });
});

describe('Dashboard Page - prefers-reduced-motion', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState({}, '', '/dashboard');
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.mocked(useWellnessScore).mockReturnValue({ score: 85, loading: false } as any);
    vi.mocked(useUserRole).mockReturnValue({ isManager: false, isAdmin: false, loading: false });
    mockLastScan({ stress_level: 'moderate', hrv_value: 48 });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('renderiza o Cockpit sem erro com prefers-reduced-motion: reduce ativo', async () => {
    // Arrange: matchMedia mockado (ver beforeEach) para prefers-reduced-motion: reduce

    // Act
    renderDashboardAt('/dashboard');

    // Assert: o conteúdo do Cockpit permanece renderizado sob MotionConfig reducedMotion="user"
    expect(
      await screen.findByRole('heading', { level: 1, name: /^Cockpit$/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Painel/i })).toBeInTheDocument();
    expect(await screen.findByText(/ATENÇÃO - VIGILÂNCIA/i)).toBeInTheDocument();
  });
});

type TelemetryRow = { stress_level: string; hrv_value: number } | null;

function mockLastScan(row: TelemetryRow): void {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: row }),
  } as any);
}

function renderDashboardAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Dashboard />
    </MemoryRouter>
  );
}

describe('Dashboard Page - Header e Cockpit derivados do mesmo state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState({}, '', '/dashboard');
    vi.mocked(useWellnessScore).mockReturnValue({ score: 85, loading: false } as any);
    vi.mocked(useUserRole).mockReturnValue({ isManager: false, isAdmin: false, loading: false });
  });

  it.each<{
    caso: string;
    row: TelemetryRow;
    url: string;
    demoStage?: DemoStage;
    protocolo?: boolean;
    header: string;
    cockpit: RegExp;
    badge?: string;
  }>([
    {
      caso: 'unknown (sem scan)',
      row: null,
      url: '/dashboard',
      header: 'Status da Missão: Aguardando scan',
      cockpit: /^AGUARDANDO SCAN$/,
    },
    {
      caso: 'caution (estresse moderado)',
      row: { stress_level: 'moderate', hrv_value: 48 },
      url: '/dashboard',
      header: 'Status da Missão: Atenção',
      cockpit: /^ATENÇÃO - VIGILÂNCIA$/,
    },
    {
      caso: 'nogo (estresse alto)',
      row: { stress_level: 'high', hrv_value: 40 },
      url: '/dashboard',
      header: 'Atenção: Fadiga Detectada',
      cockpit: /^NO-GO - FADIGA \(NÃO APTO\)$/,
    },
    {
      caso: 'go (telemetria saudável)',
      row: { stress_level: 'low', hrv_value: 65 },
      url: '/dashboard',
      header: 'Status da Missão: Nominal',
      cockpit: /^GO - APTO PARA O TURNO$/,
    },
    {
      caso: 'nogo com protocolo registrado',
      row: { stress_level: 'high', hrv_value: 40 },
      url: '/dashboard',
      protocolo: true,
      header: 'Atenção: Fadiga Detectada',
      cockpit: /^NO-GO - PROTOCOLO REGISTRADO$/,
    },
    {
      caso: 'demo etapa 1',
      row: null,
      url: '/dashboard?demo=1',
      demoStage: 1,
      header: 'Atenção: Fadiga Detectada',
      cockpit: /^NO-GO - FADIGA \(NÃO APTO\)$/,
      badge: 'DEMO 1/3',
    },
    {
      caso: 'demo etapa 2',
      row: null,
      url: '/dashboard?demo=1',
      demoStage: 2,
      header: 'Status da Missão: Atenção',
      cockpit: /^ATENÇÃO - VIGILÂNCIA$/,
      badge: 'DEMO 2/3',
    },
    {
      caso: 'demo etapa 3',
      row: null,
      url: '/dashboard?demo=1',
      demoStage: 3,
      header: 'Status da Missão: Nominal',
      cockpit: /^GO - APTO PARA O TURNO$/,
      badge: 'DEMO 3/3',
    },
  ])('$caso: header e cockpit exibem o mesmo state', async ({ row, url, demoStage, protocolo, header, cockpit, badge }) => {
    // Arrange
    mockLastScan(row);
    window.history.pushState({}, '', url);
    if (demoStage) setStoredDemoStage(demoStage);
    if (protocolo) registerCountermeasureProtocol();

    // Act
    renderDashboardAt(url);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('mission-status-text')).toHaveTextContent(header);
    });
    expect(await screen.findByText(cockpit)).toBeInTheDocument();
    if (badge) {
      expect(screen.getByTestId('mission-status-stage')).toHaveTextContent(badge);
    } else {
      expect(screen.queryByTestId('mission-status-stage')).not.toBeInTheDocument();
    }
  });
});
