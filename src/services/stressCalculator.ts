export interface StressResult {
  blinkRate: number;
  stressLevel: 'low' | 'moderate' | 'high';
  hrvValue?: number;
  message: string;
  emoji: string;
}

export function getStressDisplay(level: string): { emoji: string; message: string } {
  if (level === 'moderate') return { emoji: '😐', message: 'Atenção normal, sugira pausas para evitar burnout' };
  if (level === 'high') return { emoji: '😟', message: 'Alerta estresse, priorize reequilíbrio (NR-1)' };
  return { emoji: '😊', message: 'Foco otimizado, produtividade alta' };
}

export function calculateStressLevel(blinkRate: number, hrvValue?: number): StressResult {
  let stressLevel: 'low' | 'moderate' | 'high' = 'low';
  let { emoji, message } = getStressDisplay('low');

  if (blinkRate >= 15 && blinkRate <= 25) {
    stressLevel = 'moderate';
    ({ emoji, message } = getStressDisplay('moderate'));
  } else if (blinkRate > 25) {
    stressLevel = 'high';
    ({ emoji, message } = getStressDisplay('high'));
  }

  // Cross-validation: HRV<30ms + blinks>25/min = high alert
  if (hrvValue && hrvValue < 30 && blinkRate > 25) {
    stressLevel = 'high';
    message = 'Alerta estresse: HRV baixo + piscadas altas (validação cruzada)';
    emoji = '🚨';
  }

  return {
    blinkRate: Math.round(blinkRate * 10) / 10,
    stressLevel,
    hrvValue,
    message,
    emoji,
  };
}

export function getStressLabel(level: string): string {
  if (level === 'low') return 'Baixo';
  if (level === 'moderate') return 'Moderado';
  return 'Alto';
}

export function getDiagnosticLabel(level: string): string {
  if (level === 'low') return 'Ótimo';
  if (level === 'moderate') return 'Normal';
  return 'Alerta';
}

export function getPnlTip(level: string): string {
  if (level === 'low') return 'Ancore uma memória de sucesso para manter alta performance.';
  if (level === 'moderate') return 'Pratique respiração 4-7-8 para reequilíbrio rápido.';
  return 'Pause agora: 2min de respiração profunda + reframe mental (PNL).';
}
