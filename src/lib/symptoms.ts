import { z } from 'zod';

export const SYMPTOM_OPTIONS = [
  'febre ou calafrios',
  'dor de cabeça',
  'náusea',
  'tontura',
  'dor musculoesquelética',
  'humor rebaixado',
  'sono fragmentado',
  'desconforto ocular',
] as const;

export const symptomSchema = z.enum(SYMPTOM_OPTIONS);
export type Symptom = z.infer<typeof symptomSchema>;

export const SYMPTOMS_STORAGE_PREFIX = 'crewvitals_symptoms_';

export const dailySymptomsEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  symptoms: z.array(symptomSchema),
  timestamp: z.string(),
});

export type DailySymptomsEntry = z.infer<typeof dailySymptomsEntrySchema>;

export const DECISION_SUPPORT_RECOMMENDATION =
  'Considere contato com o Cirurgião de Voo. Pacote disponível em Histórico de Voo.';

export const DECISION_SUPPORT_DISCLAIMER =
  'Apoio à decisão, não diagnóstico';

export interface DecisionSupportResult {
  triggered: boolean;
  recommendation: string | null;
  disclaimer: string;
}

export function formatSymptomDate(date: Date | string = new Date()): string {
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    return new Date(date).toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
}

export function getSymptomsStorageKey(date: Date | string = new Date()): string {
  const dateStr = formatSymptomDate(date);
  return `${SYMPTOMS_STORAGE_PREFIX}${dateStr}`;
}

export function saveDailySymptoms(
  symptoms: Symptom[] | string[],
  date: Date | string = new Date()
): DailySymptomsEntry {
  const dateStr = formatSymptomDate(date);
  const validatedSymptoms = z.array(symptomSchema).parse(symptoms);
  const entry: DailySymptomsEntry = {
    date: dateStr,
    symptoms: validatedSymptoms,
    timestamp: new Date().toISOString(),
  };

  const key = getSymptomsStorageKey(date);
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, JSON.stringify(entry));
  }

  return entry;
}

export function getDailySymptoms(date: Date | string = new Date()): Symptom[] {
  const key = getSymptomsStorageKey(date);
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];

  try {
    const json = JSON.parse(raw);
    if (Array.isArray(json)) {
      const parsed = z.array(symptomSchema).safeParse(json);
      return parsed.success ? parsed.data : [];
    }
    const parsed = dailySymptomsEntrySchema.safeParse(json);
    return parsed.success ? parsed.data.symptoms : [];
  } catch {
    return [];
  }
}

export function getDailySymptomsEntry(date: Date | string = new Date()): DailySymptomsEntry | null {
  const key = getSymptomsStorageKey(date);
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  try {
    const json = JSON.parse(raw);
    const parsed = dailySymptomsEntrySchema.safeParse(json);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function isNoGoVerdict(verdict?: string | null): boolean {
  if (!verdict) return false;
  const clean = verdict.trim().toUpperCase().replace(/[\s_]/g, '-');
  return clean === 'NO-GO' || clean === 'NOGO';
}

/**
 * Regra de apoio à decisão (função pura testável):
 * - >= 2 sintomas E veredito NO-GO => aciona recomendação
 * - >= 3 sintomas em qualquer veredito => aciona recomendação
 * - Exibe sempre o disclaimer 'Apoio à decisão, não diagnóstico'
 */
export function evaluateDecisionSupport(
  symptoms: Symptom[] | string[] | number,
  verdict?: string | null
): DecisionSupportResult {
  const count = typeof symptoms === 'number' ? symptoms : symptoms.length;
  const isNoGo = isNoGoVerdict(verdict);
  const triggered = (count >= 2 && isNoGo) || count >= 3;

  return {
    triggered,
    recommendation: triggered ? DECISION_SUPPORT_RECOMMENDATION : null,
    disclaimer: DECISION_SUPPORT_DISCLAIMER,
  };
}
