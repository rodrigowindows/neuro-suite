import { z } from 'zod';

export const COUNTERMEASURE_REGISTERED_EVENT = 'crewvitals:countermeasure-registered';
export const COUNTERMEASURE_STORAGE_KEY_PREFIX = 'crewvitals_countermeasures_registered_';
export const COUNTERMEASURE_LAST_DATE_KEY = 'crewvitals_countermeasure_last_registered_date';

export const MISSION_EVENTS_STORAGE_KEY = 'crewvitals_mission_events';
export const MISSION_EVENT_ADDED_EVENT = 'crewvitals:mission-event-added';
export const MAX_MISSION_EVENTS = 50;

export type MissionEventType =
  | 'scan'
  | 'protocol'
  | 'assessment'
  | 'perceived_fatigue'
  | string;

export const missionEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string(),
  at: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  timestamp: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type MissionEvent = z.infer<typeof missionEventSchema>;

export interface AppendEventParams {
  type: MissionEventType;
  label?: string;
  title?: string;
  description?: string;
  at?: string | number | Date;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export interface CountermeasureProtocolData {
  registeredAt: string;
  countermeasures?: {
    breathing?: boolean;
    hydration?: boolean;
    rest?: boolean;
  };
}

export function registerCountermeasureProtocol(countermeasures?: {
  breathing?: boolean;
  hydration?: boolean;
  rest?: boolean;
}): void {
  const today = getTodayDateString();
  try {
    localStorage.setItem(COUNTERMEASURE_LAST_DATE_KEY, today);
    localStorage.setItem(
      `${COUNTERMEASURE_STORAGE_KEY_PREFIX}${today}`,
      JSON.stringify({
        registeredAt: new Date().toISOString(),
        countermeasures: countermeasures ?? {},
      })
    );
  } catch {
    // ignore storage quota / sandbox errors
  }

  if (typeof window !== 'undefined') {
    const event = new CustomEvent(COUNTERMEASURE_REGISTERED_EVENT, {
      detail: {
        date: today,
        timestamp: Date.now(),
        countermeasures,
      },
    });
    window.dispatchEvent(event);
  }
}

export function hasCountermeasureProtocolToday(targetDate?: string): boolean {
  const today = targetDate || getTodayDateString();
  try {
    const lastDate = localStorage.getItem(COUNTERMEASURE_LAST_DATE_KEY);
    if (lastDate === today) return true;
    const item = localStorage.getItem(`${COUNTERMEASURE_STORAGE_KEY_PREFIX}${today}`);
    return Boolean(item);
  } catch {
    return false;
  }
}

export function clearCountermeasureProtocolToday(targetDate?: string): void {
  const today = targetDate || getTodayDateString();
  try {
    localStorage.removeItem(`${COUNTERMEASURE_STORAGE_KEY_PREFIX}${today}`);
    if (localStorage.getItem(COUNTERMEASURE_LAST_DATE_KEY) === today) {
      localStorage.removeItem(COUNTERMEASURE_LAST_DATE_KEY);
    }
  } catch {
    // ignore
  }
}

export function subscribeToCountermeasureEvents(onRegistered: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = () => {
    onRegistered();
  };

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === COUNTERMEASURE_LAST_DATE_KEY ||
      (event.key && event.key.startsWith(COUNTERMEASURE_STORAGE_KEY_PREFIX))
    ) {
      onRegistered();
    }
  };

  window.addEventListener(COUNTERMEASURE_REGISTERED_EVENT, handleCustomEvent);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(COUNTERMEASURE_REGISTERED_EVENT, handleCustomEvent);
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * Formata o timestamp de um evento para o padrao aeroespacial:
 * - Mesmo dia: "Hoje, HH:mm"
 * - Dia anterior: "Ontem, HH:mm"
 * - Outros dias: "DD/MM, HH:mm"
 */
export function formatEventDate(
  at?: string | number | Date,
  referenceDate: Date = new Date()
): string {
  if (!at) return 'Hoje';
  const d = new Date(at);
  if (isNaN(d.getTime())) return String(at);

  const ref = new Date(referenceDate);

  const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  const dStart = startOfDay(d);
  const refStart = startOfDay(ref);

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const dayDiff = Math.round((refStart - dStart) / ONE_DAY_MS);

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (dayDiff === 0) {
    return `Hoje, ${timeStr}`;
  }
  if (dayDiff === 1) {
    return `Ontem, ${timeStr}`;
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}, ${timeStr}`;
}

/**
 * Formata a linha completa do evento: "[Hoje, HH:mm] — descricao"
 */
export function formatMissionEvent(event: MissionEvent, referenceDate?: Date): string {
  const text = event.label || event.description || event.title || '';
  return `[${formatEventDate(event.at || event.timestamp, referenceDate)}] — ${text}`;
}

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Retorna os N eventos mais recentes gravados (padrao: 50).
 */
export function getRecentEvents(n: number = MAX_MISSION_EVENTS): MissionEvent[] {
  try {
    const storage = getStorage();
    if (!storage) return [];
    const raw = storage.getItem(MISSION_EVENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, Math.max(0, n));
  } catch {
    return [];
  }
}

/**
 * Registra um evento de missao no localStorage.
 * Mantem no maximo 50 eventos ordenados dos mais recentes para os mais antigos.
 */
export function appendEvent(params: AppendEventParams): MissionEvent {
  const label = params.label || params.title || params.description || '';
  let atIso: string;
  const atValue = params.at || params.timestamp;
  if (!atValue) {
    atIso = new Date().toISOString();
  } else if (atValue instanceof Date) {
    atIso = atValue.toISOString();
  } else if (typeof atValue === 'number') {
    atIso = new Date(atValue).toISOString();
  } else {
    const parsed = new Date(atValue);
    atIso = isNaN(parsed.getTime()) ? atValue : parsed.toISOString();
  }

  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const newEvent: MissionEvent = {
    id,
    type: params.type,
    label,
    title: params.title || label,
    description: params.description || label,
    at: atIso,
    timestamp: atIso,
    metadata: params.metadata,
  };

  try {
    const storage = getStorage();
    if (storage) {
      let list: MissionEvent[] = [];
      const raw = storage.getItem(MISSION_EVENTS_STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            list = parsed;
          }
        } catch {
          list = [];
        }
      }
      const updated = [newEvent, ...list].slice(0, MAX_MISSION_EVENTS);
      storage.setItem(MISSION_EVENTS_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch {
    // ignore quota/sandbox errors
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(MISSION_EVENT_ADDED_EVENT, { detail: newEvent })
    );
  }

  return newEvent;
}

/**
 * Apaga todos os eventos de missao gravados e notifica os ouvintes.
 */
export function clearMissionEvents(): void {
  try {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(MISSION_EVENTS_STORAGE_KEY);
    }
  } catch {
    // ignore
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(MISSION_EVENT_ADDED_EVENT, { detail: null }));
  }
}
