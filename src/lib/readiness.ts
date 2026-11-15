export type ReadinessState = 'go' | 'caution' | 'nogo' | 'unknown';
export type ReadinessLabel = 'GO' | 'ATENÇÃO' | 'NO-GO' | 'AGUARDANDO SCAN' | 'SEM DADOS';

export interface ReadinessStatus {
  state: ReadinessState;
  label: ReadinessLabel;
  headline: string;
  colorClass: string;
  badgeClass: string;
}

export const MAX_STRESS_POINTS = 40;
export const MAX_HRV_POINTS = 30;

/**
 * Pontuação fisiológica pura (0-100) para o veredito de prontidão.
 * Usa apenas stressScore (0-40) + hrvScore (0-30), sem engajamento/gamificação.
 */
export function computePhysioVerdictScore(stressScore: number, hrvScore: number): number {
  const raw = ((stressScore + hrvScore) / (MAX_STRESS_POINTS + MAX_HRV_POINTS)) * 100;
  return Math.round(Math.min(Math.max(raw, 0), 100));
}

export function getReadinessStatus(
  hrv?: number | null,
  stress?: string | null,
  bioScore?: number | null
): ReadinessStatus {
  const isHrvDefined = hrv !== null && hrv !== undefined;
  const isStressDefined =
    stress !== null && stress !== undefined && stress.trim() !== '';
  const isBioScoreDefined = bioScore !== null && bioScore !== undefined;

  // bioScore 0 só significa 'sem scan' quando hrv e stress também são indefinidos.
  // bioScore ausente (null/undefined) não conta como telemetria.
  if (!isHrvDefined && !isStressDefined && (!isBioScoreDefined || bioScore === 0)) {
    return {
      state: 'unknown',
      label: 'AGUARDANDO SCAN',
      headline: 'Inicie o BioScore para avaliar a prontidão',
      colorClass: 'text-muted-foreground',
      badgeClass: 'bg-muted text-muted-foreground border-border',
    };
  }

  // Nova regra: bioScore != null && bioScore > 0 && bioScore < 50 => 'nogo'
  // Limites existentes inalterados: stress === 'high' || hrv < 30 => 'nogo'
  if (
    stress === 'high' ||
    (isHrvDefined && hrv < 30) ||
    (isBioScoreDefined && bioScore > 0 && bioScore < 50)
  ) {
    return {
      state: 'nogo',
      label: 'NO-GO',
      headline: 'FADIGA — NÃO APTO AO TURNO',
      colorClass: 'text-destructive',
      badgeClass: 'bg-destructive/15 text-destructive border-destructive/30',
    };
  }

  // Limites existentes inalterados: stress === 'moderate' || hrv < 55 => 'caution'
  if (stress === 'moderate' || (isHrvDefined && hrv < 55)) {
    return {
      state: 'caution',
      label: 'ATENÇÃO',
      headline: 'VIGILÂNCIA OPERACIONAL RECOMENDADA',
      colorClass: 'text-amber-500',
      badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    };
  }

  return {
    state: 'go',
    label: 'GO',
    headline: 'APTO PARA O TURNO',
    colorClass: 'text-emerald-500',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  };
}
