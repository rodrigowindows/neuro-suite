import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ConnectionStatusWidget, { STORAGE_KEY, SYNC_EVENT } from './ConnectionStatusWidget';
import { enqueue } from '@/lib/offlineOutbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LangProvider } from '@/i18n';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
  },
}));

describe('ConnectionStatusWidget Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('1. renderiza inicialmente no Estado Online com badge verde, subtexto acessível e sem toasts (AAA)', () => {
    // Arrange & Act
    render(<ConnectionStatusWidget />);

    // Assert: Badge com aria-live="polite", cor verde e texto exato
    const badge = screen.getByTestId('connection-status-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('aria-live', 'polite');
    expect(badge).toHaveTextContent('Uplink da Terra: Ativo');
    expect(badge.className).toContain('text-emerald-600');

    // Assert: Subtexto visível no mobile (sem classe hidden)
    const subtext = screen.getByTestId('connection-status-subtext');
    expect(subtext).toBeInTheDocument();
    expect(subtext).toHaveTextContent('Sincronização em nuvem operacional.');
    expect(subtext.className).not.toContain('hidden');

    // Assert: Botão de ação e ausência de toasts iniciais
    expect(screen.getByText('Simular Queda')).toBeInTheDocument();
    expect(toast.info).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('2. um clique gera exatamente 1 toast com texto exato, badge âmbar e persistência no localStorage (AAA)', () => {
    // Arrange
    render(<ConnectionStatusWidget />);
    const toggleBtn = screen.getByTestId('connection-status-toggle');

    // Act
    fireEvent.click(toggleBtn);

    // Assert: Exatamente 1 toast gerado com o texto exato
    expect(toast.info).toHaveBeenCalledTimes(1);
    expect(toast.info).toHaveBeenCalledWith(
      'Conexão com a Terra perdida. Processamento local assumido.'
    );
    expect(toast.success).not.toHaveBeenCalled();

    // Assert: Badge atualiza para âmbar e texto offline
    const badge = screen.getByTestId('connection-status-badge');
    expect(badge).toHaveTextContent('Modo Autônomo (Edge Computing) Ativado');
    expect(badge.className).toContain('text-amber-700');

    // Assert: Botão muda para Reconectar e subtexto atualiza
    expect(screen.getByText('Reconectar')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Processamento 100% Local na Nave · Zero-Trust Fallback (Latência Terra: 20 min).'
      )
    ).toBeInTheDocument();

    // Assert: Persistência no localStorage com chave e valor compatíveis
    expect(localStorage.getItem(STORAGE_KEY)).toBe('autonomous');
  });

  it('3. reconexão gera exatamente 1 toast com texto exato, restaura badge verde e localStorage (AAA)', () => {
    // Arrange: Coloca o widget inicialmente no modo autônomo (offline)
    render(<ConnectionStatusWidget />);
    const toggleBtn = screen.getByTestId('connection-status-toggle');
    fireEvent.click(toggleBtn);
    expect(toast.info).toHaveBeenCalledTimes(1);
    vi.clearAllMocks();

    // Act: Executa reconexão
    fireEvent.click(toggleBtn);

    // Assert: Exatamente 1 toast de sucesso gerado com o texto exato
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(
      'Uplink restabelecido. Sincronização retomada.'
    );
    expect(toast.info).not.toHaveBeenCalled();

    // Assert: Badge restaurado para verde e texto Online
    const badge = screen.getByTestId('connection-status-badge');
    expect(badge).toHaveTextContent('Uplink da Terra: Ativo');
    expect(badge.className).toContain('text-emerald-600');

    // Assert: Botão e subtexto restaurados
    expect(screen.getByText('Simular Queda')).toBeInTheDocument();
    expect(
      screen.getByText('Sincronização em nuvem operacional.')
    ).toBeInTheDocument();

    // Assert: Persistência no localStorage restaurada para online
    expect(localStorage.getItem(STORAGE_KEY)).toBe('online');
  });

  it('4. inicializa em Modo Autônomo quando localStorage já possui estado gravado (AAA)', () => {
    // Arrange: Prepara localStorage antes do carregamento
    localStorage.setItem(STORAGE_KEY, 'autonomous');

    // Act
    render(<ConnectionStatusWidget />);

    // Assert
    const badge = screen.getByTestId('connection-status-badge');
    expect(badge).toHaveTextContent('Modo Autônomo (Edge Computing) Ativado');
    expect(screen.getByText('Reconectar')).toBeInTheDocument();
    expect(toast.info).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('5. responde a eventos de sincronização SYNC_EVENT entre abas/componentes sem disparar toasts espúrios (AAA)', async () => {
    // Arrange
    render(<ConnectionStatusWidget />);
    expect(screen.getByTestId('connection-status-badge')).toHaveTextContent('Uplink da Terra: Ativo');

    // Act: Dispara CustomEvent de sincronização externa
    act(() => {
      window.dispatchEvent(
        new CustomEvent(SYNC_EVENT, { detail: { isAutonomous: true } })
      );
    });

    // Assert
    expect(
      await screen.findByText('Modo Autônomo (Edge Computing) Ativado')
    ).toBeInTheDocument();
    expect(toast.info).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('6. exibe chip discreto "N registros em fila" no modo autônomo e atualiza reativamente', () => {
    // Arrange: modo autonomo ativo
    localStorage.setItem(STORAGE_KEY, 'autonomous');

    // Act
    render(<ConnectionStatusWidget />);

    // Assert: chip presente mostrando 0 registros inicialmente
    const chip = screen.getByTestId('offline-outbox-chip');
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveTextContent('0 registros em fila');

    // Act: enfileira novos registros
    act(() => {
      enqueue({ table: 'daily_checkins', op: 'insert', payload: { mood: 'good' } });
      enqueue({ table: 'stress_scans', op: 'insert', payload: { blink_rate: 19 } });
    });

    // Assert: chip atualiza reativamente para 2 registros em fila
    expect(chip).toHaveTextContent('2 registros em fila');
  });

  it('7. ao reconectar com registros pendentes na outbox, o toast informa quantos foram sincronizados', async () => {
    // Arrange: modo autonomo com 2 registros na outbox
    localStorage.setItem(STORAGE_KEY, 'autonomous');
    enqueue({ table: 'daily_checkins', op: 'insert', payload: { mood: 'good' } });
    enqueue({ table: 'stress_scans', op: 'insert', payload: { blink_rate: 18 } });

    render(<ConnectionStatusWidget />);
    const toggleBtn = screen.getByTestId('connection-status-toggle');

    // Act: clica para reconectar uplink
    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    // Assert: toast informa a quantidade exata sincronizada
    expect(toast.success).toHaveBeenCalledWith(
      'Uplink restabelecido. 2 registros sincronizados.'
    );
  });

  describe('Internacionalização EN/PT do ConnectionStatusWidget', () => {
    it('renderiza textos em inglês no modo online sem textos em português', () => {
      // Arrange & Act
      render(
        <LangProvider initialLang="en">
          <ConnectionStatusWidget />
        </LangProvider>
      );

      // Assert: EN presente
      const badge = screen.getByTestId('connection-status-badge');
      expect(badge).toHaveTextContent('Earth Uplink: Active');
      const subtext = screen.getByTestId('connection-status-subtext');
      expect(subtext).toHaveTextContent('Cloud synchronization operational.');
      expect(screen.getByText('Simulate Outage')).toBeInTheDocument();

      const toggleBtn = screen.getByTestId('connection-status-toggle');
      expect(toggleBtn).toHaveAttribute(
        'aria-label',
        'Simulate communication disruption (Autonomous Mode)'
      );

      // Assert: PT ausente
      expect(screen.queryByText('Uplink da Terra: Ativo')).not.toBeInTheDocument();
      expect(screen.queryByText('Sincronização em nuvem operacional.')).not.toBeInTheDocument();
      expect(screen.queryByText('Simular Queda')).not.toBeInTheDocument();
    });

    it('renderiza textos e chips em inglês no modo autônomo', () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, 'autonomous');
      enqueue({ table: 'daily_checkins', op: 'insert', payload: { mood: 'good' } });

      // Act
      render(
        <LangProvider initialLang="en">
          <ConnectionStatusWidget />
        </LangProvider>
      );

      // Assert
      const badge = screen.getByTestId('connection-status-badge');
      expect(badge).toHaveTextContent('Autonomous Mode (Edge Computing) Active');
      expect(screen.getByText('Reconnect')).toBeInTheDocument();
      const chip = screen.getByTestId('offline-outbox-chip');
      expect(chip).toHaveTextContent('1 record in queue');
      const subtext = screen.getByTestId('connection-status-subtext');
      expect(subtext).toHaveTextContent(
        '100% Local On-Board Processing · Zero-Trust Fallback (Earth Latency: 20 min).'
      );

      const toggleBtn = screen.getByTestId('connection-status-toggle');
      expect(toggleBtn).toHaveAttribute('aria-label', 'Reconnect Earth uplink');

      // Assert: PT ausente
      expect(screen.queryByText('Modo Autônomo (Edge Computing) Ativado')).not.toBeInTheDocument();
      expect(screen.queryByText('Reconectar')).not.toBeInTheDocument();
      expect(screen.queryByText(/registro em fila/i)).not.toBeInTheDocument();
    });

    it('dispara toasts traduzidos para o inglês ao alternar conexão e reconectar outbox', async () => {
      // Arrange
      render(
        <LangProvider initialLang="en">
          <ConnectionStatusWidget />
        </LangProvider>
      );
      const toggleBtn = screen.getByTestId('connection-status-toggle');

      // Act 1: Simular queda
      act(() => {
        fireEvent.click(toggleBtn);
      });

      // Assert 1: Toast de queda em EN
      expect(toast.info).toHaveBeenCalledWith(
        'Earth connection lost. Local processing engaged.'
      );

      // Arrange 2: Enfileirar 2 registros
      act(() => {
        enqueue({ table: 'daily_checkins', op: 'insert', payload: { mood: 'good' } });
        enqueue({ table: 'stress_scans', op: 'insert', payload: { blink_rate: 16 } });
      });

      // Act 2: Reconectar
      await act(async () => {
        fireEvent.click(toggleBtn);
        await new Promise((r) => setTimeout(r, 0));
      });

      // Assert 2: Toast de reconexão sincronizada em EN
      expect(toast.success).toHaveBeenCalledWith(
        'Uplink restored. 2 records synchronized.'
      );
    });
  });
});
