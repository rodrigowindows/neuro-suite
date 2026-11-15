import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Demo from './Demo';
import { supabase } from '@/integrations/supabase/client';
import { AuthProvider } from '@/hooks/useAuth';
import { resetDemoStage } from '@/lib/demoScenario';

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

function renderDemoPage() {
  return render(
    <MemoryRouter initialEntries={['/demo']}>
      <AuthProvider>
        <Demo />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Demo Page (/demo) - Demonstração Pública sem Login e sem Rede', () => {
  beforeEach(() => {
    resetDemoStage();
    vi.clearAllMocks();
  });

  it('PUB-01 e PUB-02: renderiza o cockpit para visitante anonimo sem login e com 0 chamadas de rede (from, getUser, invoke)', () => {
    // Arrange & Act
    renderDemoPage();

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

    // Assert: Alerta preditivo rotulado como demonstração (PUB-04)
    expect(screen.getByText('Demonstração')).toBeInTheDocument();
    expect(screen.getByText(/não é uma previsão clínica validada/i)).toBeInTheDocument();

    // Assert: Acesso discreto para login sem obrigatoriedade
    const loginLink = screen.getByRole('link', { name: /Entrar/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/auth');
  });

  it('PUB-03: clique em "Simular novo scan" avança para GO e BioScore 72', () => {
    // Arrange
    renderDemoPage();
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
    renderDemoPage();
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
    renderDemoPage();
    expect(screen.getByText('NO-GO - FADIGA (NÃO APTO)')).toBeInTheDocument();
    expect(screen.getByText('34')).toBeInTheDocument();

    // Act 1: Aciona ação primária do protocolo de respiração
    const protocolBtn = screen.getByRole('button', { name: /Iniciar Protocolo 4-7-8/i });
    fireEvent.click(protocolBtn);

    // Assert: Transição para etapa 2 (ATENÇÃO) com BioScore 52
    expect(screen.getByText('ATENÇÃO - VIGILÂNCIA')).toBeInTheDocument();
    expect(screen.getByText('52')).toBeInTheDocument();
    expect(screen.getByText(/Contramedida local executada/i)).toBeInTheDocument();

    // Act 2: Aciona simular novo scan
    const simulateBtns = screen.getAllByRole('button', { name: /Simular novo scan/i });
    fireEvent.click(simulateBtns[0]);

    // Assert: Transição para etapa 3 (GO) com BioScore 72
    expect(screen.getByText('GO - APTO PARA O TURNO')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();

    // Assert: Zero chamadas de rede no Supabase durante todo o fluxo
    expect(supabase.from).not.toHaveBeenCalled();
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });
});
