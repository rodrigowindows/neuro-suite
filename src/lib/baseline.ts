import { roundBlinkRate } from './biometricDisplay';

export interface BaselineScanInput {
  hrv_value?: number | null;
  blink_rate?: number | null;
  created_at?: string | null;
  [key: string]: unknown;
}

export interface ValidBaselineScan {
  hrv_value: number;
  blink_rate: number;
  created_at?: string | null;
  [key: string]: unknown;
}

export interface BaselineResult {
  hrv: number;
  blinkRate: number;
  hrv_value: number;
  blink_rate: number;
  count: number;
}

/**
 * Computa a mediana de um array de numeros.
 * Tamanho impar: elemento central.
 * Tamanho par: media aritmetica dos dois elementos centrais.
 */
export function computeMedian(values: number[]): number {
  if (!values || values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calcula o delta percentual entre o valor atual e a linha de base:
 * ((current - baseline) / baseline) * 100
 * Retorna 0 quando baseline for 0 ou invalido para evitar divisao por zero.
 */
export function delta(current: number, baseline: number): number {
  if (
    baseline === 0 ||
    !Number.isFinite(baseline) ||
    !Number.isFinite(current)
  ) {
    return 0;
  }
  return ((current - baseline) / baseline) * 100;
}

export const calculateDelta = delta;

/**
 * Valida se um scan contem valores numericos validos de hrv_value e blink_rate.
 */
export function isValidScan(
  scan: BaselineScanInput | null | undefined
): scan is ValidBaselineScan {
  if (!scan || typeof scan !== 'object') return false;
  const hrv = scan.hrv_value;
  const blink = scan.blink_rate;
  return (
    typeof hrv === 'number' &&
    Number.isFinite(hrv) &&
    typeof blink === 'number' &&
    Number.isFinite(blink)
  );
}

/**
 * Filtra a lista de scans mantendo apenas os scans validos.
 */
export function filterValidScans(
  scans: BaselineScanInput[] | null | undefined
): ValidBaselineScan[] {
  if (!Array.isArray(scans)) return [];
  return scans.filter(isValidScan);
}

export const MIN_BASELINE_SCANS = 3;

/**
 * Computa a linha de base pessoal:
 * Mediana dos ultimos N scans anteriores ao scan atual (N=7 por padrao)
 * para hrv_value e blink_rate. O scan atual e excluido do conjunto da mediana.
 * Exige minimo de 3 scans validos (atual + anteriores), senao devolve null.
 * O blink_rate e mantido com precisao total.
 */
export function computeBaseline(
  history: BaselineScanInput[] | null | undefined,
  currentScan?: BaselineScanInput | null,
  n = 7
): BaselineResult | null {
  const current = isValidScan(currentScan) ? currentScan : null;
  const previous = filterValidScans(history).filter((s) => s !== current);
  if (previous.length + (current ? 1 : 0) < MIN_BASELINE_SCANS) {
    return null;
  }

  const hasDates = previous.every(
    (s) => typeof s.created_at === 'string' && !Number.isNaN(Date.parse(s.created_at))
  );

  let targetScans: ValidBaselineScan[];
  if (hasDates) {
    const sorted = [...previous].sort(
      (a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
    );
    targetScans = sorted.slice(0, n);
  } else {
    targetScans = previous.slice(0, n);
  }

  const hrvValues = targetScans.map((s) => s.hrv_value);
  const blinkValues = targetScans.map((s) => s.blink_rate);

  const hrvMedian = computeMedian(hrvValues);
  const blinkMedian = computeMedian(blinkValues);

  return {
    hrv: hrvMedian,
    blinkRate: blinkMedian,
    hrv_value: hrvMedian,
    blink_rate: blinkMedian,
    count: targetScans.length,
  };
}

/**
 * Formata o delta percentual para exibicao:
 * Exemplo: '−18% vs. sua linha de base' ou '+10% vs. sua linha de base'
 */
export function formatDelta(percent: number): string {
  if (!Number.isFinite(percent)) {
    return '0% vs. sua linha de base';
  }
  const rounded = Math.round(percent);
  if (rounded > 0) {
    return `+${rounded}% vs. sua linha de base`;
  }
  if (rounded < 0) {
    return `\u2212${Math.abs(rounded)}% vs. sua linha de base`;
  }
  return '0% vs. sua linha de base';
}

export { roundBlinkRate };
