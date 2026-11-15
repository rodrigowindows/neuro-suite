import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  enqueue,
  flush,
  getOutbox,
  getOutboxCount,
  clearOutbox,
  OUTBOX_STORAGE_KEY,
} from './offlineOutbox';
import { STORAGE_KEY } from '@/hooks/useConnectionMode';

describe('offlineOutbox (AAA Tests)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('1. enfileira offline e persiste na chave versionada do localStorage', () => {
    // Arrange
    localStorage.setItem(STORAGE_KEY, 'autonomous');
    const payload = { user_id: 'user-123', mood: 'good', energy_level: 4 };

    // Act
    const item = enqueue({
      table: 'daily_checkins',
      op: 'insert',
      payload,
    });

    // Assert
    expect(item.id).toBeDefined();
    expect(item.createdAt).toBeDefined();
    expect(item.table).toBe('daily_checkins');
    expect(item.op).toBe('insert');
    expect(item.payload).toEqual(payload);

    expect(getOutboxCount()).toBe(1);
    const stored = JSON.parse(localStorage.getItem(OUTBOX_STORAGE_KEY) || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(item.id);
  });

  it('2. nada sai em modo autônomo (nenhuma chamada de rede ou Supabase)', async () => {
    // Arrange: modo autonomo ativo
    localStorage.setItem(STORAGE_KEY, 'autonomous');
    enqueue({
      table: 'stress_scans',
      op: 'insert',
      payload: { user_id: 'user-123', blink_rate: 20 },
    });

    const mockFrom = vi.fn();
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
      },
      from: mockFrom,
    };

    // Act: tenta executar flush
    const result = await flush(mockSupabase);

    // Assert: abortado por modo autonomo, nada enviado ao Supabase, item retido na fila
    expect(result.status).toBe('aborted_autonomous');
    expect(result.flushed).toBe(0);
    expect(result.remaining).toBe(1);
    expect(mockFrom).not.toHaveBeenCalled();
    expect(getOutboxCount()).toBe(1);
  });

  it('3. flush online executa os itens na ordem correta (FIFO) quando autenticado', async () => {
    // Arrange: modo online
    localStorage.setItem(STORAGE_KEY, 'online');

    const item1 = enqueue({
      table: 'profiles',
      op: 'update',
      filter: { column: 'id', value: 'user-123' },
      payload: { horas_sono: 8 },
    });
    const item2 = enqueue({
      table: 'stress_scans',
      op: 'insert',
      payload: { user_id: 'user-123', blink_rate: 16 },
    });

    const executionOrder: string[] = [];

    const mockUpdateEq = vi.fn().mockImplementation(() => {
      executionOrder.push('profiles:update');
      return Promise.resolve({ error: null });
    });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });

    const mockInsert = vi.fn().mockImplementation(() => {
      executionOrder.push('stress_scans:insert');
      return Promise.resolve({ error: null });
    });

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'profiles') return { update: mockUpdate };
      if (table === 'stress_scans') return { insert: mockInsert };
      return {};
    });

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
      },
      from: mockFrom,
    };

    // Act
    const result = await flush(mockSupabase);

    // Assert: flush completo de 2 itens na ordem exata
    expect(result.status).toBe('completed');
    expect(result.flushed).toBe(2);
    expect(result.remaining).toBe(0);
    expect(executionOrder).toEqual(['profiles:update', 'stress_scans:insert']);
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 'user-123');
    expect(getOutboxCount()).toBe(0);
  });

  it('4. falha no flush mantém o item na fila e preserva a ordem dos registros', async () => {
    // Arrange: modo online com 2 itens
    localStorage.setItem(STORAGE_KEY, 'online');

    enqueue({
      table: 'profiles',
      op: 'update',
      filter: { column: 'id', value: 'user-123' },
      payload: { horas_sono: 6 },
    });
    enqueue({
      table: 'daily_checkins',
      op: 'insert',
      payload: { user_id: 'user-123', mood: 'okay' },
    });

    const mockUpdateEq = vi.fn().mockResolvedValue({
      error: new Error('Falha de uplink temporária'),
    });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });
    const mockInsert = vi.fn();

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'profiles') return { update: mockUpdate };
      if (table === 'daily_checkins') return { insert: mockInsert };
      return {};
    });

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
      },
      from: mockFrom,
    };

    // Act: executa flush que falha no primeiro item
    const result = await flush(mockSupabase);

    // Assert: o item que falhou permanece na fila, e o proximo nao foi consumido
    expect(result.flushed).toBe(0);
    expect(result.remaining).toBe(2);
    expect(result.errors).toHaveLength(1);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(getOutboxCount()).toBe(2);

    const outbox = getOutbox();
    expect(outbox[0].table).toBe('profiles');
    expect(outbox[1].table).toBe('daily_checkins');
  });

  it('5. aborta flush quando não há usuário autenticado', async () => {
    // Arrange: modo online mas sem sessao
    localStorage.setItem(STORAGE_KEY, 'online');
    enqueue({
      table: 'daily_checkins',
      op: 'insert',
      payload: { mood: 'great' },
    });

    const mockFrom = vi.fn();
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
      from: mockFrom,
    };

    // Act
    const result = await flush(mockSupabase);

    // Assert
    expect(result.status).toBe('aborted_unauthenticated');
    expect(result.flushed).toBe(0);
    expect(mockFrom).not.toHaveBeenCalled();
    expect(getOutboxCount()).toBe(1);
  });

  describe('update exige filter (AAA)', () => {
    const authedSupabase = (from: any) => ({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
      },
      from,
    });

    it('a. dois enfileiramentos de update para a mesma linha geram ids de outbox diferentes', () => {
      // Arrange
      const filter = { column: 'id', value: 'user-123' };

      // Act
      const first = enqueue({ table: 'profiles', op: 'update', filter, payload: { horas_sono: 6 } });
      const second = enqueue({ table: 'profiles', op: 'update', filter, payload: { horas_sono: 7 } });

      // Assert
      expect(first.id).not.toBe(second.id);
      expect(first.id).not.toBe('user-123');
      expect(getOutboxCount()).toBe(2);
    });

    it('b. flush de update usa .eq(coluna, valor) do filter', async () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, 'online');
      enqueue({
        table: 'profiles',
        op: 'update',
        filter: { column: 'user_id', value: 'user-123' },
        payload: { treino_realizado: 'esteira' },
      });
      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });
      const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });

      // Act
      const result = await flush(authedSupabase(mockFrom));

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith({ treino_realizado: 'esteira' });
      expect(mockUpdateEq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(result.flushed).toBe(1);
      expect(getOutboxCount()).toBe(0);
    });

    it('c. update sem filter nao e executado, permanece na fila e registra erro', async () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, 'online');
      const queued = enqueue({ table: 'profiles', op: 'update', payload: { horas_sono: 6 } });
      const mockUpdate = vi.fn();
      const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });

      // Act
      const result = await flush(authedSupabase(mockFrom));

      // Assert
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(result.flushed).toBe(0);
      expect(result.remaining).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(getOutbox()[0].id).toBe(queued.id);
    });
  });
});
