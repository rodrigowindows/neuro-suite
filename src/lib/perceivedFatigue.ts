import { z } from 'zod';

export const PERCEIVED_FATIGUE_PREFIX = 'crewvitals_perceived_fatigue_';

export const perceivedFatigueValueSchema = z
  .number({ invalid_type_error: 'Informe um número válido' })
  .int('O nível de fadiga deve ser um número inteiro')
  .min(1, 'Nível de fadiga deve ser entre 1 e 5')
  .max(5, 'Nível de fadiga deve ser entre 1 e 5');

export const perceivedFatigueEntrySchema = z.object({
  value: perceivedFatigueValueSchema,
  timestamp: z.string(),
});

export type PerceivedFatigueValue = z.infer<typeof perceivedFatigueValueSchema>;
export type PerceivedFatigueEntry = z.infer<typeof perceivedFatigueEntrySchema>;

export const FATIGUE_OPTIONS = [
  { value: 1, label: '1 - Sem fadiga' },
  { value: 2, label: '2 - Fadiga leve' },
  { value: 3, label: '3 - Fadiga moderada' },
  { value: 4, label: '4 - Fadiga alta' },
  { value: 5, label: '5 - Exaustão' },
] as const;

export const FATIGUE_DIVERGENCE_MESSAGE =
  'Divergência entre percepção e telemetria — considere reavaliar';

export function getFatigueLabel(val: number): string {
  const match = FATIGUE_OPTIONS.find((opt) => opt.value === val);
  return match ? match.label : String(val);
}

export function formatFatigueDate(date: Date | string = new Date()): string {
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    return new Date(date).toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
}

export function getFatigueStorageKey(date: Date | string = new Date()): string {
  const dateStr = formatFatigueDate(date);
  return `${PERCEIVED_FATIGUE_PREFIX}${dateStr}`;
}

export function savePerceivedFatigue(
  value: number,
  date: Date | string = new Date()
): PerceivedFatigueEntry {
  const parsedValue = perceivedFatigueValueSchema.parse(value);
  const entry: PerceivedFatigueEntry = {
    value: parsedValue,
    timestamp: new Date().toISOString(),
  };

  const key = getFatigueStorageKey(date);
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, JSON.stringify(entry));
  }

  return entry;
}

export function getPerceivedFatigue(
  date: Date | string = new Date()
): PerceivedFatigueEntry | null {
  const key = getFatigueStorageKey(date);
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  try {
    const json = JSON.parse(raw);
    const parsed = perceivedFatigueEntrySchema.safeParse(json);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function getLatestPerceivedFatigue(): PerceivedFatigueEntry | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  // 1. Tenta recuperar o registro da data atual
  const todayEntry = getPerceivedFatigue();
  if (todayEntry) return todayEntry;

  // 2. Se não houver hoje, busca pelas chaves com o prefixo
  const matchingKeys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(PERCEIVED_FATIGUE_PREFIX)) {
      matchingKeys.push(key);
    }
  }

  if (matchingKeys.length === 0) return null;

  // Ordena decrescente pelas datas YYYY-MM-DD
  matchingKeys.sort().reverse();

  for (const key of matchingKeys) {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      try {
        const json = JSON.parse(raw);
        const parsed = perceivedFatigueEntrySchema.safeParse(json);
        if (parsed.success) return parsed.data;
      } catch {
        continue;
      }
    }
  }

  return null;
}

export function checkFatigueDivergence(
  perceivedValue?: number | null,
  cockpitVerdict?: string | null
): boolean {
  if (perceivedValue === null || perceivedValue === undefined || !cockpitVerdict) {
    return false;
  }

  const normalized = cockpitVerdict.trim().toUpperCase();
  const isGo = normalized === 'GO' || normalized.startsWith('GO');
  const isNoGo = normalized === 'NO-GO' || normalized.startsWith('NO-GO');

  if (perceivedValue >= 4 && isGo) {
    return true;
  }

  if (perceivedValue <= 2 && isNoGo) {
    return true;
  }

  return false;
}
