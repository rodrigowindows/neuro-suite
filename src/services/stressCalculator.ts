export interface StressResult {
  blinkRate: number;
  stressLevel: 'low' | 'moderate' | 'high';
  hrvValue?: number;
  message: string;
  emoji: string;
}

export function getStressDisplay(
  level: string,
  t?: (key: string, vars?: Record<string, string | number>) => string
): { emoji: string; message: string } {
  if (t) {
    if (level === 'moderate') {
      return { emoji: t('bioscore.badge.caution'), message: t('bioscore.msg.moderate') };
    }
    if (level === 'high') {
      return { emoji: t('bioscore.badge.alert'), message: t('bioscore.msg.high') };
    }
    return { emoji: t('bioscore.badge.ok'), message: t('bioscore.msg.low') };
  }

  if (level === 'moderate') return { emoji: 'Atenção', message: 'Atenção normal, sugira pausas para evitar burnout' };
  if (level === 'high') return { emoji: 'Alerta', message: 'Fadiga detectada. Risco de erro operacional' };
  return { emoji: 'OK', message: 'Foco otimizado, produtividade alta' };
}

export function calculateStressLevel(
  blinkRate: number,
  hrvValue?: number,
  t?: (key: string, vars?: Record<string, string | number>) => string
): StressResult {
  let stressLevel: 'low' | 'moderate' | 'high' = 'low';
  let { emoji, message } = getStressDisplay('low', t);

  if (blinkRate >= 15 && blinkRate <= 25) {
    stressLevel = 'moderate';
    ({ emoji, message } = getStressDisplay('moderate', t));
  } else if (blinkRate > 25) {
    stressLevel = 'high';
    ({ emoji, message } = getStressDisplay('high', t));
  }

  // Cross-validation: HRV<30ms + blinks>25/min = high alert
  if (hrvValue && hrvValue < 30 && blinkRate > 25) {
    stressLevel = 'high';
    message = t ? t('bioscore.msg.crossValidation') : 'Alerta estresse: HRV baixo + piscadas altas (validação cruzada)';
    emoji = t ? t('bioscore.badge.critical') : 'Crítico';
  }

  return {
    blinkRate: Math.round(blinkRate * 10) / 10,
    stressLevel,
    hrvValue,
    message,
    emoji,
  };
}

export function getStressLabel(level: string, t?: (key: string) => string): string {
  if (t) {
    if (level === 'low') return t('bioscore.stress.low');
    if (level === 'moderate') return t('bioscore.stress.moderate');
    if (level === 'high') return t('bioscore.stress.high');
    return t('bioscore.stress.unknown');
  }
  if (level === 'low') return 'Baixo';
  if (level === 'moderate') return 'Moderado';
  return 'Alto';
}

export function getDiagnosticLabel(level: string, t?: (key: string) => string): string {
  if (t) {
    if (level === 'low') return t('bioscore.diagnostic.optimal');
    if (level === 'moderate') return t('bioscore.diagnostic.normal');
    return t('bioscore.diagnostic.alert');
  }
  if (level === 'low') return 'Ótimo';
  if (level === 'moderate') return 'Normal';
  return 'Alerta';
}

export function getPnlTip(level: string, t?: (key: string) => string): string {
  if (t) {
    if (level === 'low') return t('bioscore.pnl.low');
    if (level === 'moderate') return t('bioscore.pnl.moderate');
    return t('bioscore.pnl.high');
  }
  if (level === 'low') return 'Ancore uma memória de sucesso para manter prontidão operacional.';
  if (level === 'moderate') return 'Pratique respiração 4-7-8 para reequilíbrio rápido.';
  return 'Pause agora: 2min de respiração profunda + reframe mental (PNL).';
}
