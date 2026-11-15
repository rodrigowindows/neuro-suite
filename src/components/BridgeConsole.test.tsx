import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react';
import BridgeConsole, { BridgeConsoleProps } from './BridgeConsole';
import {
  registerCountermeasureProtocol,
  clearCountermeasureProtocolToday,
  appendEvent,
  clearMissionEvents,
} from '@/lib/missionEvents';
import { setStoredDemoStage } from '@/lib/demoScenario';
import { useReadiness } from '@/hooks/useReadiness';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-astronaut-001', email: 'astronaut@mission.org' },
    loading: false,
    signOut: vi.fn(),
  })),
}));

vi.mock('@/hooks/useWellnessScore', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useWellnessScore')>()),
  useWellnessScore: vi.fn(() => ({
    score: null,
    loading: false,
  })),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-astronaut-001' } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    }),
  },
}));

async function renderCockpit(props: BridgeConsoleProps = {}) {
  let rendered;
  await act(async () => {
    rendered = render(<BridgeConsole {...props} />);
  });
  return rendered;
}

describe('BridgeConsole - Cockpit de 3 Níveis', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
    localStorage.clear();
    sessionStorage.clear();
    clearCountermeasureProtocolToday();
    clearMissionEvents();
    vi.clearAllMocks();
  });

  describe('Nível 1: Semáforo de Prontidão', () => {
    it('renderiza estado "AGUARDANDO SCAN" e botão "Iniciar Scan de Prontidão" sem PredictiveAlert quando não há dados', async () => {
      // Arrange
      const handleNavigate = vi.fn();

      // Act
      await renderCockpit({ onNavigateTab: handleNavigate });

      // Assert
      const statusBlock = screen.getByRole('status');
      expect(statusBlock).toBeInTheDocument();
      expect(statusBlock).toHaveAttribute('aria-live', 'polite');
      expect(statusBlock).toHaveClass('border-slate-500/30', 'bg-slate-500/10');
      expect(screen.getByText('AGUARDANDO SCAN')).toBeInTheDocument();
      expect(screen.getByText('Inicie o BioScore para avaliar a prontidão')).toBeInTheDocument();
      expect(screen.queryByText('SEM DADOS')).not.toBeInTheDocument();
      expect(screen.queryByText(/GO - APTO/i)).not.toBeInTheDocument();

      // PredictiveAlert NÃO deve ser renderizado quando status for unknown
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      // Botão primário único para AGUARDANDO SCAN é "Iniciar Scan de Prontidão"
      const actionBtn = screen.getByRole('button', { name: /Iniciar Scan de Prontidão/i });
      expect(actionBtn).toBeInTheDocument();
      fireEvent.click(actionBtn);
      expect(handleNavigate).toHaveBeenCalledWith('neuroscore');
    });

    it('renderiza estado "GO - APTO PARA O TURNO" quando estresse é low e hrv é ótimo', async () => {
      // Arrange
      const handleNavigate = vi.fn();

      // Act
      await renderCockpit({
        onNavigateTab: handleNavigate,
        stressLevel: 'low',
        hrvValue: 65,
        blinkRate: 16,
        bioScore: 90,
      });

      // Assert
      const statusBlock = screen.getByRole('status');
      expect(statusBlock).toBeInTheDocument();
      expect(statusBlock).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByText('GO - APTO PARA O TURNO')).toBeInTheDocument();

      // PredictiveAlert não deve ser renderizado quando status for 'go'
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      // Ação única primária para GO é "Iniciar Turno"
      const actionBtn = screen.getByRole('button', { name: /Iniciar Turno/i });
      expect(actionBtn).toBeInTheDocument();
      fireEvent.click(actionBtn);
      expect(handleNavigate).toHaveBeenCalledWith('checkin');
    });

    it('renderiza estado "ATENÇÃO - VIGILÂNCIA" e exibe PredictiveAlert quando estresse é moderate', async () => {
      // Arrange
      const handleNavigate = vi.fn();

      // Act
      await renderCockpit({
        onNavigateTab: handleNavigate,
        stressLevel: 'moderate',
        hrvValue: 45,
        blinkRate: 20,
        bioScore: 70,
      });

      // Assert
      const statusBlock = screen.getByRole('status');
      expect(statusBlock).toBeInTheDocument();
      expect(statusBlock).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByText('ATENÇÃO - VIGILÂNCIA')).toBeInTheDocument();

      // PredictiveAlert é renderizado logo abaixo
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByText(/Risco de erro em tarefas de precisão nas próximas 4 h — suspender acoplagem\/EVA/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Cenário demonstrativo — não é uma previsão clínica validada/i)
      ).toBeInTheDocument();

      // Ação única primária para ATENÇÃO é "Iniciar Protocolo 4-7-8"
      const actionBtn = screen.getByRole('button', { name: /Iniciar Protocolo 4-7-8/i });
      expect(actionBtn).toBeInTheDocument();
      fireEvent.click(actionBtn);
      expect(handleNavigate).toHaveBeenCalledWith('neurocoach');
    });

    it('renderiza estado "NO-GO - FADIGA (NÃO APTO)" e exibe PredictiveAlert quando estresse é high ou hrv < 30', async () => {
      // Arrange
      const handleNavigate = vi.fn();

      // Act
      await renderCockpit({
        onNavigateTab: handleNavigate,
        stressLevel: 'high',
        hrvValue: 25,
        blinkRate: 12,
        bioScore: 35,
      });

      // Assert
      const statusBlock = screen.getByRole('status');
      expect(statusBlock).toBeInTheDocument();
      expect(statusBlock).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByText('NO-GO - FADIGA (NÃO APTO)')).toBeInTheDocument();

      // PredictiveAlert é renderizado
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Ação única primária para NO-GO é "Iniciar Protocolo 4-7-8"
      const actionBtn = screen.getByRole('button', { name: /Iniciar Protocolo 4-7-8/i });
      expect(actionBtn).toBeInTheDocument();
      fireEvent.click(actionBtn);
      expect(handleNavigate).toHaveBeenCalledWith('neurocoach');
    });
  });

  describe('Suporte ao Roteiro de 30s da Pitch Demo (?demo=1)', () => {
    it('injeta estado NO-GO de demonstração quando ?demo=1 na URL e não há telemetria real', async () => {
      // Arrange
      window.history.pushState({}, '', '?demo=1');

      // Act
      await renderCockpit();

      // Assert
      expect(screen.getByText('NO-GO - FADIGA (NÃO APTO)')).toBeInTheDocument();
      // Valores fixos da demonstração conforme o brief (§6): BioScore 34, Piscadas 14, Sono 5.5h
      expect(screen.getByText('34')).toBeInTheDocument();
      expect(screen.getByText('14')).toBeInTheDocument();
      expect(screen.getByText('5.5h')).toBeInTheDocument();
      // PredictiveAlert e badge DEMO presentes
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getAllByText('DEMO').length).toBeGreaterThan(0);
      // Ação primária de NO-GO
      expect(screen.getByRole('button', { name: /Iniciar Protocolo 4-7-8/i })).toBeInTheDocument();
    });

    it('injeta estado NO-GO de demonstração quando isDemo prop é true e não há telemetria real', async () => {
      // Arrange / Act
      await renderCockpit({ isDemo: true });

      // Assert
      expect(screen.getByText('NO-GO - FADIGA (NÃO APTO)')).toBeInTheDocument();
      expect(screen.getByText('34')).toBeInTheDocument();
      expect(screen.getByText('14')).toBeInTheDocument();
      expect(screen.getByText('5.5h')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getAllByText('DEMO').length).toBeGreaterThan(0);
    });

    it('preserva telemetria real mesmo se demo estiver ativo', async () => {
      // Arrange / Act
      await renderCockpit({
        isDemo: true,
        stressLevel: 'low',
        hrvValue: 65,
        blinkRate: 16,
        bioScore: 90,
      });

      // Assert
      expect(screen.getByText('GO - APTO PARA O TURNO')).toBeInTheDocument();
      expect(screen.getByText('90')).toBeInTheDocument();
      expect(screen.getByText('16')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getAllByText('DEMO').length).toBeGreaterThan(0);
    });
  });

  describe('Nível 2: 3 Números Apenas & Sem Fallbacks Fabricados', () => {
    it('exibe exatamente os 3 números formatados quando dados são fornecidos', async () => {
      // Arrange / Act
      await renderCockpit({
        stressLevel: 'moderate',
        hrvValue: 48,
        blinkRate: 21.6,
        bioScore: 85,
      });

      // Assert - Labels
      expect(screen.getByText('BioScore')).toBeInTheDocument();
      expect(screen.getByText('Piscadas/min')).toBeInTheDocument();
      expect(screen.getByText('Sono')).toBeInTheDocument();

      // Valores
      expect(screen.getByText('85')).toBeInTheDocument();
      // Arredondamento de piscadas estritamente na fronteira de exibição: 21.6 -> 22
      expect(screen.getByText('22')).toBeInTheDocument();
      // Sono não veio no mock/props -> exibe "—" (sem injetar 7.5h fabricado)
      expect(screen.getByText('—')).toBeInTheDocument();

      // HRV foi removido como 4º número
      expect(screen.queryByText(/ms rMSSD/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Variabilidade Cardíaca \(HRV\)/i)).not.toBeInTheDocument();
    });

    it('elimina fallbacks fabricados silenciosos exibindo "—" quando não há dados de telemetria', async () => {
      // Arrange / Act
      await renderCockpit();

      // Assert: todos os 3 números devem exibir traço "—"
      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBe(3);

      // Nunca injetar defaults fabricados silenciosos
      expect(screen.queryByText('48')).not.toBeInTheDocument();
      expect(screen.queryByText('21.6')).not.toBeInTheDocument();
      expect(screen.queryByText('7.5h')).not.toBeInTheDocument();
      expect(screen.queryByText('ARED')).not.toBeInTheDocument();
    });

    it('não exibe o selo "DEMO" se isDemo não for informado e não houver demo na URL', async () => {
      // Arrange / Act
      await renderCockpit();

      // Assert
      expect(screen.queryByText('DEMO')).not.toBeInTheDocument();
    });
  });

  describe('Nível 3: Ação Única Primária & Links Secundários', () => {
    it('garante que o botão primário é estritamente único ("Iniciar Scan de Prontidão") quando sem dados', async () => {
      // Arrange / Act
      await renderCockpit();

      // Assert: busca todos os botões na tela
      const primaryButtons = screen.getAllByRole('button', { name: /Iniciar Scan de Prontidão/i });
      expect(primaryButtons).toHaveLength(1);

      // Não deve haver outros botões primários ou links secundários
      expect(screen.queryByRole('button', { name: /Iniciar Turno/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Iniciar Protocolo/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Atualizar scan/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Realizar BioScore/i })).not.toBeInTheDocument();
    });

    it('garante que existe apenas UM botão primário de ação na tela inteira quando apto (GO)', async () => {
      // Arrange / Act
      await renderCockpit({ stressLevel: 'low', hrvValue: 60 });

      // Assert: busca botões primários
      const primaryButtons = screen.getAllByRole('button', { name: /Iniciar Turno/i });
      expect(primaryButtons).toHaveLength(1);
      expect(screen.queryByRole('button', { name: /Iniciar Scan de Prontidão/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Realizar BioScore/i })).not.toBeInTheDocument();
    });

    it('permite atualizar scan via link secundário de texto quando há dados', async () => {
      // Arrange
      const handleNavigate = vi.fn();
      await renderCockpit({
        onNavigateTab: handleNavigate,
        stressLevel: 'low',
        hrvValue: 60,
      });

      // Assert & Act
      const updateLink = screen.getByRole('button', { name: /Atualizar scan/i });
      expect(updateLink).toBeInTheDocument();
      fireEvent.click(updateLink);
      expect(handleNavigate).toHaveBeenCalledWith('neuroscore');
    });
  });

  describe('Log de Eventos Recentes (Medical Event Log) - Somente em Demonstração', () => {
    it('não renderiza o card de log quando isDemo for falso ou omitido', async () => {
      // Arrange & Act
      await renderCockpit({ isDemo: false });

      // Assert
      expect(screen.queryByText('LOG DE EVENTOS RECENTES')).toBeNull();
      expect(screen.queryByText('LOG DE EVENTOS RECENTES')).not.toBeInTheDocument();
      expect(
        screen.queryByText(/\[Hoje, 10:30\] — Alerta Preditivo: Fadiga Elevada \(BioScore 34\)/i)
      ).not.toBeInTheDocument();
    });

    it('renderiza o card de log aeroespacial com selo DEMO e as 3 entradas quando isDemo for verdadeiro', async () => {
      // Arrange & Act
      await renderCockpit({ isDemo: true });

      // Assert
      expect(screen.getByText('LOG DE EVENTOS RECENTES')).toBeInTheDocument();
      expect(screen.getAllByText('DEMO').length).toBeGreaterThan(0);
      expect(
        screen.getByText(/\[Hoje, 10:30\] — Alerta Preditivo: Fadiga Elevada \(BioScore 34\)/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/\[Hoje, 10:35\] — Ação: Contramedida executada \(Respiração 4-7-8\)/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/\[Hoje, 10:40\] — Status atualizado: Estável/i)
      ).toBeInTheDocument();
    });

    it('renderiza os eventos reais gravados no formato "[Hoje, HH:mm] — descrição" sem o selo DEMO no card', async () => {
      // Arrange
      appendEvent({
        type: 'scan',
        label: 'BioScore: NO-GO (BioScore 38)',
        at: new Date('2026-11-15T10:42:00Z'),
      });
      appendEvent({
        type: 'protocol',
        label: 'Contramedida executada (Respiração 4-7-8)',
        at: new Date('2026-11-15T10:45:00Z'),
      });

      // Act
      await renderCockpit({ isDemo: false });

      // Assert
      expect(screen.getByText('LOG DE EVENTOS RECENTES')).toBeInTheDocument();
      expect(screen.queryByTestId('demo-badge-log')).not.toBeInTheDocument();
      expect(
        screen.getByText(/\[Hoje, \d{2}:\d{2}\] — Contramedida executada \(Respiração 4-7-8\)/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/\[Hoje, \d{2}:\d{2}\] — BioScore: NO-GO \(BioScore 38\)/i)
      ).toBeInTheDocument();
    });

    it('eventos reais sobrepõem o mock de demonstração mesmo quando isDemo for true', async () => {
      // Arrange
      appendEvent({
        type: 'assessment',
        label: 'Avaliação de Prontidão concluída (Energia: 4/5)',
        at: new Date(),
      });

      // Act
      await renderCockpit({ isDemo: true });

      // Assert
      expect(screen.getByText('LOG DE EVENTOS RECENTES')).toBeInTheDocument();
      expect(screen.queryByTestId('demo-badge-log')).not.toBeInTheDocument();
      expect(
        screen.getByText(/\[Hoje, \d{2}:\d{2}\] — Avaliação de Prontidão concluída \(Energia: 4\/5\)/i)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Alerta Preditivo: Fadiga Elevada \(BioScore 34\)/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('Lista de Eliminação Estrita', () => {
    it('confirma que todos os componentes e banners obsoletos foram removidos', async () => {
      // Arrange / Act
      await renderCockpit();

      // 1. Banner vermelho duplicado
      expect(
        screen.queryByText(/Atenção: Fadiga elevada\. Risco operacional\./i)
      ).not.toBeInTheDocument();

      // 2. Atalhos da Jornada do Astronauta
      expect(
        screen.queryByText(/Jornada do Astronauta · Navegação Rápida/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Registrar Sono & Treino \(Biometric Log\)/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Análise de Carga do Turno \(Fadiga Cognitiva\)/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Calibrar Scan Facial \(BioScore\)/i)
      ).not.toBeInTheDocument();

      // 3. Card gigante "Console da Ponte · Status Fisiológico"
      expect(
        screen.queryByText(/Console da Ponte · Status Fisiológico/i)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/Estimativa de Desempenho/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Nível de Carga/i)).not.toBeInTheDocument();

      // 4. Texto vazado de desenvolvedor
      expect(
        screen.queryByText(/Formatado na fronteira de exibição/i)
      ).not.toBeInTheDocument();

      // 5. Botão antigo AstroAssist
      expect(
        screen.queryByText(/Iniciar Contramedidas \(AstroAssist\)/i)
      ).not.toBeInTheDocument();

      // 6. Resumo do Biometric Log
      expect(
        screen.queryByText(/Abrir Biometric Log Completo/i)
      ).not.toBeInTheDocument();

      // 7. Toggle Uplink da Terra / Modo Autônomo
      expect(screen.queryByText(/Uplink da Terra/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Modo Autônomo/i)).not.toBeInTheDocument();
    });
  });

  describe('Protocolo de Contramedidas Registrado no Cockpit', () => {
    it('em uso real (!isDemo): mantém NO-GO com "Reavaliar com BioScore" e exibe "NO-GO - PROTOCOLO REGISTRADO"', async () => {
      // Arrange
      registerCountermeasureProtocol({ breathing: true });
      const handleNavigate = vi.fn();

      // Act
      await renderCockpit({
        isDemo: false,
        stressLevel: 'high',
        hrvValue: 25,
        onNavigateTab: handleNavigate,
      });

      // Assert
      expect(screen.getByText('NO-GO - PROTOCOLO REGISTRADO')).toBeInTheDocument();
      expect(screen.queryByText('GO - APTO PARA O TURNO')).not.toBeInTheDocument();

      const reevaluateBtn = screen.getByRole('button', { name: /Reavaliar com BioScore/i });
      expect(reevaluateBtn).toBeInTheDocument();
      fireEvent.click(reevaluateBtn);
      expect(handleNavigate).toHaveBeenCalledWith('neuroscore');
    });

    it('em modo demo (isDemo) sem estado salvo ignora protocolo gravado antes e começa em NO-GO', async () => {
      // Arrange
      registerCountermeasureProtocol({ breathing: true });
      const handleNavigate = vi.fn();

      // Act
      await renderCockpit({
        isDemo: true,
        stressLevel: 'high',
        hrvValue: 28,
        onNavigateTab: handleNavigate,
      });

      // Assert
      expect(screen.getByText('NO-GO - FADIGA (NÃO APTO)')).toBeInTheDocument();
      expect(screen.queryByText('GO - APTO PARA O TURNO')).not.toBeInTheDocument();
      expect(screen.getAllByText('DEMO').length).toBeGreaterThan(0);

      const startProtocolBtn = screen.getByRole('button', { name: /Iniciar Protocolo 4-7-8/i });
      expect(startProtocolBtn).toBeInTheDocument();
      fireEvent.click(startProtocolBtn);
      expect(handleNavigate).toHaveBeenCalledWith('neurocoach');
    });

    it('atualiza o estado dinamicamente quando evento CustomEvent "crewvitals:countermeasure-registered" é disparado', async () => {
      // Arrange
      await renderCockpit({
        isDemo: false,
        stressLevel: 'high',
        hrvValue: 25,
      });

      expect(screen.getByText('NO-GO - FADIGA (NÃO APTO)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Iniciar Protocolo 4-7-8/i })).toBeInTheDocument();

      // Act
      act(() => {
        registerCountermeasureProtocol({ breathing: true, hydration: true });
      });

      // Assert
      expect(screen.getByText('NO-GO - PROTOCOLO REGISTRADO')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reavaliar com BioScore/i })).toBeInTheDocument();
    });
  });

  describe('Bordas do BioScore no Cockpit (0, 49, 50, null)', () => {
    it('quando bioScore === 0: renderiza "AGUARDANDO SCAN", card cinza-azulado, sem PredictiveAlert e nunca exibe GO', async () => {
      // Arrange
      const handleNavigate = vi.fn();

      // Act
      await renderCockpit({
        onNavigateTab: handleNavigate,
        bioScore: 0,
      });

      // Assert: Estado unknown
      const statusBlock = screen.getByRole('status');
      expect(statusBlock).toBeInTheDocument();
      expect(statusBlock).toHaveAttribute('aria-live', 'polite');
      expect(statusBlock).toHaveClass('border-slate-500/30', 'bg-slate-500/10');
      expect(screen.getByText('AGUARDANDO SCAN')).toBeInTheDocument();
      expect(screen.getByText('Inicie o BioScore para avaliar a prontidão')).toBeInTheDocument();
      expect(screen.queryByText(/GO - APTO/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      const actionBtn = screen.getByRole('button', { name: /Iniciar Scan de Prontidão/i });
      expect(actionBtn).toBeInTheDocument();
      fireEvent.click(actionBtn);
      expect(handleNavigate).toHaveBeenCalledWith('neuroscore');
    });

    it('quando bioScore === 49 (< 50): renderiza NO-GO, PredictiveAlert e botão "Iniciar Protocolo 4-7-8"', async () => {
      // Arrange
      const handleNavigate = vi.fn();

      // Act
      await renderCockpit({
        onNavigateTab: handleNavigate,
        bioScore: 49,
      });

      // Assert: Estado nogo
      expect(screen.getByText('NO-GO - FADIGA (NÃO APTO)')).toBeInTheDocument();
      expect(screen.queryByText(/GO - APTO/i)).not.toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();

      const actionBtn = screen.getByRole('button', { name: /Iniciar Protocolo 4-7-8/i });
      expect(actionBtn).toBeInTheDocument();
      fireEvent.click(actionBtn);
      expect(handleNavigate).toHaveBeenCalledWith('neurocoach');
    });

    it('quando bioScore === 50 (>= 50): renderiza GO, sem PredictiveAlert e botão "Iniciar Turno"', async () => {
      // Arrange
      const handleNavigate = vi.fn();

      // Act
      await renderCockpit({
        onNavigateTab: handleNavigate,
        bioScore: 50,
      });

      // Assert: Estado go
      expect(screen.getByText('GO - APTO PARA O TURNO')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      const actionBtn = screen.getByRole('button', { name: /Iniciar Turno/i });
      expect(actionBtn).toBeInTheDocument();
      fireEvent.click(actionBtn);
      expect(handleNavigate).toHaveBeenCalledWith('checkin');
    });

    it('quando bioScore é null: preserva estado unknown sem scan e nunca exibe GO', async () => {
      // Arrange / Act
      await renderCockpit({
        bioScore: null as any,
      });

      // Assert
      expect(screen.getByText('AGUARDANDO SCAN')).toBeInTheDocument();
      expect(screen.queryByText(/GO - APTO/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Etapas da Demo no Cockpit (sem recarregar a página)', () => {
    it('registrar protocolo muda NO-GO para ATENÇÃO e "Simular novo scan" muda para GO', async () => {
      // Arrange
      window.history.pushState({}, '', '?demo=1');
      await renderCockpit({ isDemo: true });
      expect(screen.getByText('NO-GO - FADIGA (NÃO APTO)')).toBeInTheDocument();

      // Act
      act(() => {
        registerCountermeasureProtocol({ breathing: true });
      });

      // Assert
      expect(screen.getByText('ATENÇÃO - VIGILÂNCIA')).toBeInTheDocument();

      // Act
      fireEvent.click(screen.getByRole('button', { name: /Simular novo scan/i }));

      // Assert
      expect(screen.getByText('GO - APTO PARA O TURNO')).toBeInTheDocument();
    });

    it('com protocolo gravado hoje no localStorage, ?demo=1 sem estado salvo começa em NO-GO', async () => {
      // Arrange
      registerCountermeasureProtocol({ breathing: true });
      window.history.pushState({}, '', '?demo=1');

      // Act
      await renderCockpit();

      // Assert
      expect(screen.getByText('NO-GO - FADIGA (NÃO APTO)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Iniciar Protocolo 4-7-8/i })).toBeInTheDocument();
    });

    it('o botão "Simular novo scan" existe somente em demo na etapa 2', async () => {
      // Arrange
      window.history.pushState({}, '', '?demo=1');

      // Act: etapa 1
      const etapa1 = await renderCockpit();

      // Assert
      expect(screen.queryByRole('button', { name: /Simular novo scan/i })).not.toBeInTheDocument();
      etapa1.unmount();

      // Act: etapa 2
      setStoredDemoStage(2);
      const etapa2 = await renderCockpit();

      // Assert
      expect(screen.getByRole('button', { name: /Simular novo scan/i })).toBeInTheDocument();
      etapa2.unmount();

      // Act: etapa 3
      setStoredDemoStage(3);
      await renderCockpit();

      // Assert
      expect(screen.queryByRole('button', { name: /Simular novo scan/i })).not.toBeInTheDocument();
    });

    it('em modo real não exibe "Simular novo scan", selo DEMO nem log de demo, mesmo com etapa 2 salva', async () => {
      // Arrange
      setStoredDemoStage(2);

      // Act
      await renderCockpit({ stressLevel: 'moderate', hrvValue: 45 });

      // Assert
      expect(screen.queryByRole('button', { name: /Simular novo scan/i })).not.toBeInTheDocument();
      expect(screen.queryByText('DEMO')).not.toBeInTheDocument();
      expect(screen.queryByText('LOG DE EVENTOS RECENTES')).not.toBeInTheDocument();
    });

    it.each([
      [1, 'NO-GO - FADIGA (NÃO APTO)'],
      [2, 'ATENÇÃO - VIGILÂNCIA'],
      [3, 'GO - APTO PARA O TURNO'],
    ] as const)('etapa %i: cockpit mostra o estado que o hook de prontidão calcula', async (stage, titulo) => {
      // Arrange
      window.history.pushState({}, '', '?demo=1');
      setStoredDemoStage(stage);
      const { result } = renderHook(() => useReadiness({ isDemo: true }));

      // Act
      await renderCockpit();

      // Assert
      const esperado = { nogo: 'NO-GO - FADIGA (NÃO APTO)', caution: 'ATENÇÃO - VIGILÂNCIA', go: 'GO - APTO PARA O TURNO' } as const;
      expect(titulo).toBe(esperado[result.current.state as 'nogo' | 'caution' | 'go']);
      expect(screen.getByText(titulo)).toBeInTheDocument();
    });
  });
});
