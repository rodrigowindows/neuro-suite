export type ReadinessState = 'go' | 'caution' | 'nogo' | 'unknown';
export type ReadinessLabel = 'GO' | 'ATENÇÃO' | 'NO-GO' | 'SEM DADOS';

export interface ReadinessStatus {
  state: ReadinessState;
  label: ReadinessLabel;
  headline: string;
  colorClass: string;
  badgeClass: string;
}

export function getReadinessStatus(
  hrv?: number | null,
  stress?: string | null
): ReadinessStatus {
  const isHrvDefined = hrv !== null && hrv !== undefined;
  const isStressDefined = stress !== null && stress !== undefined;

  if (!isHrvDefined && !isStressDefined) {
    return {
      state: 'unknown',
      label: 'SEM DADOS',
      headline: 'SEM SCAN — REALIZE O BIOSCORE',
      colorClass: 'text-muted-foreground',
      badgeClass: 'bg-muted text-muted-foreground border-border',
    };
  }

  if (stress === 'high' || (isHrvDefined && hrv < 30)) {
    return {
      state: 'nogo',
      label: 'NO-GO',
      headline: 'FADIGA — NÃO APTO AO TURNO',
      colorClass: 'text-destructive',
      badgeClass: 'bg-destructive/15 text-destructive border-destructive/30',
    };
  }

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
