import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import BridgeConsole, { BridgeConsoleProps } from './BridgeConsole';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-astronaut-001', email: 'astronaut@mission.org' },
    loading: false,
    signOut: vi.fn(),
  })),
}));

vi.mock('@/hooks/useWellnessScore', () => ({
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
    vi.clearAllMocks();
  });

  describe('Nível 1: Semáforo de Prontidão', () => {
    it('renderiza estado "SEM DADOS" e botão "Realizar BioScore" sem PredictiveAlert quando não há dados', async () => {
      // Arrange
      const handleNavigate = vi.fn();

      // Act
      await renderCockpit({ onNavigateTab: handleNavigate });

      // Assert
      const statusBlock = screen.getByRole('status');
      expect(statusBlock).toBeInTheDocument();
      expect(statusBlock).toHaveAttribute('aria-live', 'polite');
      expect(statusBlock).toHaveClass('border-muted-foreground/30', 'bg-muted/40');
      expect(screen.getByText('SEM DADOS')).toBeInTheDocument();
      expect(screen.getByText('SEM SCAN — REALIZE O BIOSCORE')).toBeInTheDocument();

      // PredictiveAlert NÃO deve ser renderizado quando status for unknown
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      // Botão primário único para SEM DADOS é "Realizar BioScore"
      const actionBtn = screen.getByRole('button', { name: /Realizar BioScore/i });
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
      expect(screen.getByText('DEMO')).toBeInTheDocument();
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
      expect(screen.getByText('DEMO')).toBeInTheDocument();
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
      expect(screen.getByText('DEMO')).toBeInTheDocument();
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
    it('garante que o botão primário é estritamente único ("Realizar BioScore") quando sem dados', async () => {
      // Arrange / Act
      await renderCockpit();

      // Assert: busca todos os botões na tela
      const primaryButtons = screen.getAllByRole('button', { name: /Realizar BioScore/i });
      expect(primaryButtons).toHaveLength(1);

      // Não deve haver outros botões primários ou links secundários
      expect(screen.queryByRole('button', { name: /Iniciar Turno/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Iniciar Protocolo/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Atualizar scan/i })).not.toBeInTheDocument();
    });

    it('garante que existe apenas UM botão primário de ação na tela inteira quando apto (GO)', async () => {
      // Arrange / Act
      await renderCockpit({ stressLevel: 'low', hrvValue: 60 });

      // Assert: busca botões primários
      const primaryButtons = screen.getAllByRole('button', { name: /Iniciar Turno/i });
      expect(primaryButtons).toHaveLength(1);
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
});
