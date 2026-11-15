import { supabase } from '@/integrations/supabase/client';
import { isAutonomousMode } from '@/hooks/useConnectionMode';

export const OUTBOX_STORAGE_KEY = 'mars_offline_outbox_v1';
export const OUTBOX_SYNC_EVENT = 'mars-outbox-sync';

export type OutboxOp = 'insert' | 'upsert' | 'update';

export interface OutboxItem {
  id: string;
  table: string;
  op: OutboxOp;
  payload: Record<string, any> | Record<string, any>[];
  createdAt: string;
  filter?: { column: string; value: any };
}

export interface EnqueueParams {
  table: string;
  op: OutboxOp;
  payload: Record<string, any> | Record<string, any>[];
  createdAt?: string;
  /** Id do item na outbox (idempotencia). Nunca e usado como filtro de linha. */
  id?: string;
  /** Obrigatorio para 'update': define a linha alvo via .eq(column, value). */
  filter?: { column: string; value: any };
}

export interface FlushResult {
  flushed: number;
  remaining: number;
  errors: any[];
  status: 'completed' | 'aborted_autonomous' | 'aborted_unauthenticated' | 'in_progress';
}

let isFlushing = false;

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `outbox_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function notifyOutboxChange(count: number): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(OUTBOX_SYNC_EVENT, { detail: { count } })
    );
  }
}

export function getOutbox(): OutboxItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OUTBOX_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getOutboxCount(): number {
  return getOutbox().length;
}

function saveOutbox(items: OutboxItem[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(items));
  }
}

export function clearOutbox(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(OUTBOX_STORAGE_KEY);
    notifyOutboxChange(0);
  }
}

export function enqueue({
  table,
  op,
  payload,
  createdAt,
  id,
  filter,
}: EnqueueParams): OutboxItem {
  const item: OutboxItem = {
    id: id || generateId(),
    table,
    op,
    payload,
    createdAt: createdAt || new Date().toISOString(),
    filter,
  };

  const queue = getOutbox();
  queue.push(item);
  saveOutbox(queue);
  notifyOutboxChange(queue.length);

  return item;
}

export async function flush(client?: any): Promise<FlushResult> {
  if (isFlushing) {
    return {
      flushed: 0,
      remaining: getOutboxCount(),
      errors: [],
      status: 'in_progress',
    };
  }

  // So roda quando o modo volta a online
  if (isAutonomousMode()) {
    return {
      flushed: 0,
      remaining: getOutboxCount(),
      errors: [],
      status: 'aborted_autonomous',
    };
  }

  const supabaseClient = client || supabase;

  // So roda se ha usuario autenticado
  try {
    const { data } = await supabaseClient.auth.getUser();
    if (!data?.user) {
      return {
        flushed: 0,
        remaining: getOutboxCount(),
        errors: [],
        status: 'aborted_unauthenticated',
      };
    }
  } catch (authError) {
    return {
      flushed: 0,
      remaining: getOutboxCount(),
      errors: [authError],
      status: 'aborted_unauthenticated',
    };
  }

  isFlushing = true;
  let flushedCount = 0;
  const errors: any[] = [];

  try {
    const queue = getOutbox();

    while (queue.length > 0) {
      const item = queue[0];
      let opError: any = null;

      try {
        const query = supabaseClient.from(item.table);

        if (item.op === 'insert') {
          const res = await query.insert(item.payload);
          opError = res?.error || null;
        } else if (item.op === 'upsert') {
          const res = await query.upsert(item.payload);
          opError = res?.error || null;
        } else if (item.op === 'update') {
          if (!item.filter) {
            opError = new Error(`Outbox update sem filter (tabela ${item.table}, item ${item.id})`);
          } else {
            const res = await query
              .update(item.payload)
              .eq(item.filter.column, item.filter.value);
            opError = res?.error || null;
          }
        }
      } catch (execError) {
        opError = execError;
      }

      if (opError) {
        errors.push(opError);
        // Erro de flush mantem o item na fila e para a execucao para preservar a ordem
        break;
      }

      // Sucesso na operacao: remove o item processado
      queue.shift();
      flushedCount++;
      saveOutbox(queue);
      notifyOutboxChange(queue.length);
    }

    return {
      flushed: flushedCount,
      remaining: queue.length,
      errors,
      status: 'completed',
    };
  } finally {
    isFlushing = false;
  }
}
