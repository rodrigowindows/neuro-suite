import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConnectionStatusWidget from './ConnectionStatusWidget';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

describe('ConnectionStatusWidget Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('1. renderiza inicialmente no Estado 1 (Online) com badge verde e subtexto de sincronização em nuvem', () => {
    render(<ConnectionStatusWidget />);

    expect(
      screen.getByText('Uplink da Terra: Ativo (Latência: 1.2s)')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Sincronização em nuvem operacional.')
    ).toBeInTheDocument();
    expect(screen.getByText('Simular Queda')).toBeInTheDocument();
  });

  it('2. alterna para o Estado 2 (Simulação de Queda / Modo Autônomo) e dispara o toast informativo', () => {
    render(<ConnectionStatusWidget />);

    const toggleBtn = screen.getByTestId('connection-status-toggle');
    fireEvent.click(toggleBtn);

    // Verifica badge e subtexto atualizados
    expect(
      screen.getByText('Modo Autônomo Ativado (Edge Computing)')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Processamento 100% Local na Nave · Zero-Trust Fallback (Latência Terra: 20 min).'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Simulação Ativa')).toBeInTheDocument();

    // Valida toast informativo obrigatório
    expect(toast.info).toHaveBeenCalledWith(
      'Comunicação com a Terra interrompida. Sistema alternou para processamento autônomo local.'
    );
  });

  it('3. alterna de volta para o Estado 1 (Online) ao clicar novamente', () => {
    render(<ConnectionStatusWidget />);

    const toggleBtn = screen.getByTestId('connection-status-toggle');
    // Alterna para Autônomo
    fireEvent.click(toggleBtn);
    expect(
      screen.getByText('Modo Autônomo Ativado (Edge Computing)')
    ).toBeInTheDocument();

    // Alterna de volta para Online
    fireEvent.click(toggleBtn);
    expect(
      screen.getByText('Uplink da Terra: Ativo (Latência: 1.2s)')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Sincronização em nuvem operacional.')
    ).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith(
      'Uplink com a Terra restabelecido. Sincronização em nuvem operacional.'
    );
  });
});
