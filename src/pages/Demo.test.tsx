import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Demo from './Demo';
import { supabase } from '@/integrations/supabase/client';
import { AuthProvider } from '@/hooks/useAuth';
import { LangProvider, Lang } from '@/i18n';
import { resetDemoStage, getDemoScenarioData } from '@/lib/demoScenario';
import { roundBlinkRate } from '@/lib/biometricDisplay';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    }),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  },
}));

function renderDemoPage(initialLang: Lang = 'pt') {
  return render(
    <MemoryRouter initialEntries={['/demo']}>
      <LangProvider initialLang={initialLang}>
        <AuthProvider>
          <Demo />
        </AuthProvider>
      </LangProvider>
    </MemoryRouter>
  );
}

describe('Demo Page (/demo) - Demonstração Pública sem Login e sem Rede', () => {
  beforeEach(() => {
    localStorage.clear();
    resetDemoStage();
    vi.clearAllMocks();
  });

  describe('Fluxos em Português (initialLang="pt")', () => {
    it('PUB-01 e PUB-02: renderiza o cockpit para visitante anonimo sem login e com 0 chamadas de rede (from, getUser, invoke)', () => {
      // Arrange & Act
      renderDemoPage('pt');

      // Assert: Zero chamadas de rede no Supabase
      expect(supabase.from).not.toHaveBeenCalled();
      expect(supabase.auth.getUser).not.toHaveBeenCalled();
      expect(supabase.functions.invoke).not.toHaveBeenCalled();

      // Assert: Selo obrigatório presente
      expect(screen.getByTestId('demo-fixed-seal')).toHaveTextContent('DEMO: dados simulados');

      // Assert: Semáforo e dados da Etapa 1
      expect(screen.getByText('NO-GO - FADIGA (NÃO APTO)')).toBeInTheDocument();
      expect(screen.getByText('34')).toBeInTheDocument(); // BioScore
      expect(screen.getByText('14')).toBeInTheDocument(); // Piscadas/min (roundBlinkRate)
      expect(screen.getByText('5.5h')).toBeInTheDocument(); // Sono

      // Assert: Rótulos das métricas
      expect(screen.getByText('BioScore')).toBeInTheDocument();
      expect(screen.getByText('Piscadas/min')).toBeInTheDocument();
      expect(screen.getByText('Sono')).toBeInTheDocument();

      // Assert: Alerta preditivo rotulado como demonstração (PUB-04)
      expect(screen.getByText('Demonstração')).toBeInTheDocument();
      expect(screen.getByText(/não é uma previsão clínica validada/i)).toBeInTheDocument();

      // Assert: Acesso discreto para login sem obrigatoriedade
      const loginLink = screen.getByRole('link', { name: /Entrar/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/auth');

      // Assert: Log da Etapa 1 em PT
      expect(screen.getByText('[há 10 min] — Alerta Preditivo: Fadiga Elevada (BioScore 34)')).toBeInTheDocument();
    });

    it('PUB-03: clique em "Simular novo scan" avança para GO e BioScore 72', () => {
      // Arrange
      renderDemoPage('pt');
      expect(screen.getByText('NO-GO - FADIGA (NÃO APTO)')).toBeInTheDocument();
      expect(screen.getByText('34')).toBeInTheDocument();

      // Act
      const simulateBtn = screen.getByRole('button', { name: /Simular novo scan/i });
      fireEvent.click(simulateBtn);

      // Assert: Avançou para etapa 3 (GO)
      expect(screen.getByText('GO - APTO PARA O TURNO')).toBeInTheDocument();
      expect(screen.getByText('72')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();

      // Assert: Nenhuma rede disparada
      expect(supabase.from).not.toHaveBeenCalled();
      expect(supabase.auth.getUser).not.toHaveBeenCalled();
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });

    it('PUB-03: clique em "Reiniciar demonstração" retorna à etapa 1 (NO-GO e BioScore 34)', () => {
      // Arrange: Começa na etapa 1 e simula scan para avançar
      renderDemoPage('pt');
      const simulateBtn = screen.getByRole('button', { name: /Simular novo scan/i });
      fireEvent.click(simulateBtn);
      expect(screen.getByText('72')).toBeInTheDocument();

      // Act: Reiniciar demonstração
      const resetBtn = screen.getByRole('button', { name: /Reiniciar demonstração/i });
      fireEvent.click(resetBtn);

      // Assert: Retornou para etapa 1
      expect(screen.getByText('NO-GO - FADIGA (NÃO APTO)')).toBeInTheDocument();
      expect(screen.getByText('34')).toBeInTheDocument();
      expect(screen.getByText('14')).toBeInTheDocument();

      // Assert: Nenhuma rede disparada
      expect(supabase.from).not.toHaveBeenCalled();
      expect(supabase.auth.getUser).not.toHaveBeenCalled();
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });

    it('PUB-03: fluxo completo guiado 1 (NO-GO, 34) -> Ação Primária -> 2 (ATENÇÃO, 52) -> Scan -> 3 (GO, 72)', () => {
      // Arrange
      renderDemoPage('pt');
      expect(screen.getByText('NO-GO - FADIGA (NÃO APTO)')).toBeInTheDocument();
      expect(screen.getByText('34')).toBeInTheDocument();

      // Act 1: Aciona ação primária do protocolo de respiração
      const protocolBtn = screen.getByRole('button', { name: /Iniciar Protocolo 4-7-8/i });
      fireEvent.click(protocolBtn);

      // Assert: Transição para etapa 2 (ATENÇÃO) com BioScore 52
      expect(screen.getByText('ATENÇÃO - VIGILÂNCIA')).toBeInTheDocument();
      expect(screen.getByText('52')).toBeInTheDocument();
      expect(screen.getByText(/Contramedida local executada: 3 ciclos de respiração 4-7-8 concluídos\./i)).toBeInTheDocument();

      // Act 2: Aciona simular novo scan
      const simulateBtns = screen.getAllByRole('button', { name: /Simular novo scan/i });
      fireEvent.click(simulateBtns[0]);

      // Assert: Transição para etapa 3 (GO) com BioScore 72
      expect(screen.getByText('GO - APTO PARA O TURNO')).toBeInTheDocument();
      expect(screen.getByText('72')).toBeInTheDocument();

      // Act 3: Iniciar Turno na etapa 3
      const startShiftBtn = screen.getByRole('button', { name: /Iniciar Turno/i });
      fireEvent.click(startShiftBtn);
      expect(screen.getByText(/Turno operacional iniciado com sucesso\./i)).toBeInTheDocument();

      // Assert: Zero chamadas de rede no Supabase durante todo o fluxo
      expect(supabase.from).not.toHaveBeenCalled();
      expect(supabase.auth.getUser).not.toHaveBeenCalled();
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });

    it('valida BioScore, piscadas inteiras (roundBlinkRate) e sono nas 3 etapas contra getDemoScenarioData(1|2|3) (AAA)', () => {
      // Arrange
      const scenario1 = getDemoScenarioData(1);
      const scenario2 = getDemoScenarioData(2);
      const scenario3 = getDemoScenarioData(3);
      renderDemoPage('pt');

      // Assert - Etapa 1
      expect(screen.getByText(String(scenario1.bioScore))).toBeInTheDocument();
      expect(screen.getByText(String(roundBlinkRate(scenario1.blinkRate)))).toBeInTheDocument();
      expect(screen.getByText(`${scenario1.horasSono}h`)).toBeInTheDocument();

      // Act - Transição para Etapa 2 (Ação Primária: Iniciar Protocolo 4-7-8)
      const protocolBtn = screen.getByRole('button', { name: /Iniciar Protocolo 4-7-8/i });
      fireEvent.click(protocolBtn);

      // Assert - Etapa 2
      expect(screen.getByText(String(scenario2.bioScore))).toBeInTheDocument();
      expect(screen.getByText(String(roundBlinkRate(scenario2.blinkRate)))).toBeInTheDocument();
      expect(screen.getByText(`${scenario2.horasSono}h`)).toBeInTheDocument();

      // Act - Transição para Etapa 3 (Simular novo scan)
      const simulateBtns = screen.getAllByRole('button', { name: /Simular novo scan/i });
      fireEvent.click(simulateBtns[0]);

      // Assert - Etapa 3
      expect(screen.getByText(String(scenario3.bioScore))).toBeInTheDocument();
      expect(screen.getByText(String(roundBlinkRate(scenario3.blinkRate)))).toBeInTheDocument();
      expect(screen.getByText(`${scenario3.horasSono}h`)).toBeInTheDocument();
    });
  });

  describe('Fluxos em Inglês (initialLang="en")', () => {
    it('renderiza cockpit para visitante anônimo em inglês com 0 chamadas de rede', () => {
      // Arrange & Act
      renderDemoPage('en');

      // Assert: Zero chamadas Supabase
      expect(supabase.from).not.toHaveBeenCalled();
      expect(supabase.auth.getUser).not.toHaveBeenCalled();
      expect(supabase.functions.invoke).not.toHaveBeenCalled();

      // Assert: Selo obrigatório em EN
      expect(screen.getByTestId('demo-fixed-seal')).toHaveTextContent('DEMO: simulated data');

      // Assert: Semáforo e dados da Etapa 1 em EN
      expect(screen.getByText('NO-GO - FATIGUE (NOT FIT)')).toBeInTheDocument();
      expect(screen.getByText('verdict based on stress and HRV')).toBeInTheDocument();
      expect(screen.getByText('34')).toBeInTheDocument();
      expect(screen.getByText('14')).toBeInTheDocument();
      expect(screen.getByText('5.5 h')).toBeInTheDocument();

      // Assert: Rótulos das métricas em EN
      expect(screen.getByText('BioScore')).toBeInTheDocument();
      expect(screen.getByText('Blinks/min')).toBeInTheDocument();
      expect(screen.getByText('Sleep')).toBeInTheDocument();

      // Assert: Botão de ação primária e controles em EN
      expect(screen.getByRole('button', { name: /Start 4-7-8 Protocol/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Simulate new scan/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Restart demo/i })).toBeInTheDocument();

      // Assert: Link de autenticação em EN
      const signInLink = screen.getByRole('link', { name: /Sign in/i });
      expect(signInLink).toBeInTheDocument();
      expect(signInLink).toHaveAttribute('href', '/auth');

      // Assert: Log de eventos em EN
      expect(screen.getByText('RECENT EVENT LOG')).toBeInTheDocument();
      expect(screen.getByText('[10 min ago] — Predictive alert: Elevated fatigue (BioScore 34)')).toBeInTheDocument();
    });

    it('fluxo guiado completo em inglês: Etapa 1 -> Protocol -> Etapa 2 -> Scan -> Etapa 3 -> Start Shift -> Reset', () => {
      // Arrange
      renderDemoPage('en');
      expect(screen.getByText('NO-GO - FATIGUE (NOT FIT)')).toBeInTheDocument();
      expect(screen.getByText('34')).toBeInTheDocument();

      // Act 1: Start 4-7-8 Protocol
      const protocolBtn = screen.getByRole('button', { name: /Start 4-7-8 Protocol/i });
      fireEvent.click(protocolBtn);

      // Assert 1: Etapa 2 em EN
      expect(screen.getByText('CAUTION - WATCH')).toBeInTheDocument();
      expect(screen.getByText('52')).toBeInTheDocument();
      expect(screen.getByText('Local countermeasure executed: 3 cycles of 4-7-8 breathing completed.')).toBeInTheDocument();

      // Fechar aviso
      const closeBtn = screen.getByRole('button', { name: /Close/i });
      fireEvent.click(closeBtn);
      expect(screen.queryByText('Local countermeasure executed: 3 cycles of 4-7-8 breathing completed.')).not.toBeInTheDocument();

      // Act 2: Simulate new scan
      const simulateBtns = screen.getAllByRole('button', { name: /Simulate new scan/i });
      fireEvent.click(simulateBtns[0]);

      // Assert 2: Etapa 3 em EN
      expect(screen.getByText('GO - FIT FOR SHIFT')).toBeInTheDocument();
      expect(screen.getByText('72')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
      expect(screen.getByText('[now] — Status updated: Stable (BioScore 72, HRV 62)')).toBeInTheDocument();

      // Act 3: Start Shift
      const startShiftBtn = screen.getByRole('button', { name: /Start Shift/i });
      fireEvent.click(startShiftBtn);
      expect(screen.getByText('Operational shift started.')).toBeInTheDocument();

      // Act 4: Restart demo
      const resetBtn = screen.getByRole('button', { name: /Restart demo/i });
      fireEvent.click(resetBtn);

      // Assert 4: Retorno à Etapa 1 em EN
      expect(screen.getByText('NO-GO - FATIGUE (NOT FIT)')).toBeInTheDocument();
      expect(screen.getByText('34')).toBeInTheDocument();
      expect(screen.getByText('14')).toBeInTheDocument();
      expect(screen.getByText('5.5 h')).toBeInTheDocument();

      // Assert: Zero chamadas Supabase durante todo o ciclo
      expect(supabase.from).not.toHaveBeenCalled();
      expect(supabase.auth.getUser).not.toHaveBeenCalled();
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });
  });

  describe('Alternância de Idioma em Tempo de Execução', () => {
    it('alterna dinamicamente entre EN e PT sem recarregar a página e preserva os números de telemetria', () => {
      // Arrange: Renderiza com inglês
      renderDemoPage('en');
      expect(screen.getByTestId('demo-fixed-seal')).toHaveTextContent('DEMO: simulated data');
      expect(screen.getByText('NO-GO - FATIGUE (NOT FIT)')).toBeInTheDocument();
      expect(screen.getByText('5.5 h')).toBeInTheDocument();
      expect(screen.getByText('Start 4-7-8 Protocol')).toBeInTheDocument();
      expect(screen.getByText('[10 min ago] — Predictive alert: Elevated fatigue (BioScore 34)')).toBeInTheDocument();

      // Act: Usuário clica no botão PT no LanguageToggle
      const ptToggleBtn = screen.getByRole('button', { name: 'PT' });
      act(() => {
        fireEvent.click(ptToggleBtn);
      });

      // Assert: Textos traduzidos instantaneamente para português
      expect(screen.getByTestId('demo-fixed-seal')).toHaveTextContent('DEMO: dados simulados');
      expect(screen.getByText('NO-GO - FADIGA (NÃO APTO)')).toBeInTheDocument();
      expect(screen.getByText('5.5h')).toBeInTheDocument();
      expect(screen.getByText('Iniciar Protocolo 4-7-8')).toBeInTheDocument();
      expect(screen.getByText('Simular novo scan')).toBeInTheDocument();
      expect(screen.getByText('Reiniciar demonstração')).toBeInTheDocument();
      expect(screen.getByText('Entrar')).toBeInTheDocument();
      expect(screen.getByText('[há 10 min] — Alerta Preditivo: Fadiga Elevada (BioScore 34)')).toBeInTheDocument();

      // Números permanecem idênticos
      expect(screen.getByText('34')).toBeInTheDocument();
      expect(screen.getByText('14')).toBeInTheDocument();

      // Act: Usuário clica no botão EN no LanguageToggle
      const enToggleBtn = screen.getByRole('button', { name: 'EN' });
      act(() => {
        fireEvent.click(enToggleBtn);
      });

      // Assert: Textos retornam instantaneamente para inglês
      expect(screen.getByTestId('demo-fixed-seal')).toHaveTextContent('DEMO: simulated data');
      expect(screen.getByText('NO-GO - FATIGUE (NOT FIT)')).toBeInTheDocument();
      expect(screen.getByText('5.5 h')).toBeInTheDocument();
      expect(screen.getByText('Start 4-7-8 Protocol')).toBeInTheDocument();
      expect(screen.getByText('Simulate new scan')).toBeInTheDocument();
      expect(screen.getByText('Restart demo')).toBeInTheDocument();
      expect(screen.getByText('Sign in')).toBeInTheDocument();
      expect(screen.getByText('[10 min ago] — Predictive alert: Elevated fatigue (BioScore 34)')).toBeInTheDocument();
    });
  });
});
