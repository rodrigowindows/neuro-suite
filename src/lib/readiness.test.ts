import { describe, expect, it } from 'vitest';
import { getReadinessStatus, computePhysioVerdictScore } from './readiness';

describe('computePhysioVerdictScore', () => {
  it('reescala stressScore (0-40) + hrvScore (0-30) para 0-100', () => {
    // Arrange
    const stressScore = 40;
    const hrvScore = 30;

    // Act
    const result = computePhysioVerdictScore(stressScore, hrvScore);

    // Assert
    expect(result).toBe(100);
  });

  it('limita o resultado entre 0 e 100', () => {
    // Arrange / Act / Assert
    expect(computePhysioVerdictScore(0, 0)).toBe(0);
    expect(computePhysioVerdictScore(60, 60)).toBe(100);
  });

  it('tripulante novo (estresse moderate=24, HRV 60=20) gera pontuação >= 50 e não NO-GO', () => {
    // Arrange
    const physio = computePhysioVerdictScore(24, 20);

    // Act
    const result = getReadinessStatus(60, 'moderate', physio);

    // Assert
    expect(physio).toBe(63);
    expect(result.state).toBe('caution');
    expect(result.label).toBe('ATENÇÃO');
  });
});

describe('getReadinessStatus', () => {
  describe('Core states', () => {
    it('returns nogo state with destructive tokens when stress is high', () => {
      // Arrange
      const hrv = 60;
      const stress = 'high';

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('nogo');
      expect(result.label).toBe('NO-GO');
      expect(result.headline).toBe('FADIGA — NÃO APTO AO TURNO');
      expect(result.colorClass).toContain('destructive');
      expect(result.badgeClass).toContain('destructive');
    });

    it('returns caution state with amber tokens when stress is moderate', () => {
      // Arrange
      const hrv = 60;
      const stress = 'moderate';

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('caution');
      expect(result.label).toBe('ATENÇÃO');
      expect(result.headline).toBe('VIGILÂNCIA OPERACIONAL RECOMENDADA');
      expect(result.colorClass).toContain('amber');
      expect(result.badgeClass).toContain('amber');
    });

    it('returns go state with emerald tokens when stress is low and hrv is normal', () => {
      // Arrange
      const hrv = 65;
      const stress = 'low';

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('go');
      expect(result.label).toBe('GO');
      expect(result.headline).toBe('APTO PARA O TURNO');
      expect(result.colorClass).toContain('emerald');
      expect(result.badgeClass).toContain('emerald');
    });

    it('returns unknown state with muted tokens when both metrics are missing', () => {
      // Arrange
      const hrv = null;
      const stress = null;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result).toEqual({
        state: 'unknown',
        label: 'AGUARDANDO SCAN',
        headline: 'Inicie o BioScore para avaliar a prontidão',
        colorClass: 'text-muted-foreground',
        badgeClass: 'bg-muted text-muted-foreground border-border',
      });
    });
  });

  describe('HRV boundary limits (29, 30, 54, 55)', () => {
    it('returns nogo when hrv is 29 (just below 30 threshold) with low stress', () => {
      // Arrange
      const hrv = 29;
      const stress = 'low';

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('nogo');
      expect(result.label).toBe('NO-GO');
    });

    it('returns caution when hrv is 30 (exact lower boundary of caution) with low stress', () => {
      // Arrange
      const hrv = 30;
      const stress = 'low';

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('caution');
      expect(result.label).toBe('ATENÇÃO');
    });

    it('returns caution when hrv is 54 (just below 55 threshold) with low stress', () => {
      // Arrange
      const hrv = 54;
      const stress = 'low';

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('caution');
      expect(result.label).toBe('ATENÇÃO');
    });

    it('returns go when hrv is 55 (exact boundary for go) with low stress', () => {
      // Arrange
      const hrv = 55;
      const stress = 'low';

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('go');
      expect(result.label).toBe('GO');
    });

    it('returns nogo when hrv is 29 and stress is null', () => {
      // Arrange
      const hrv = 29;
      const stress = null;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('nogo');
      expect(result.label).toBe('NO-GO');
    });

    it('returns caution when hrv is 30 and stress is null', () => {
      // Arrange
      const hrv = 30;
      const stress = null;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('caution');
      expect(result.label).toBe('ATENÇÃO');
    });

    it('returns caution when hrv is 54 and stress is null', () => {
      // Arrange
      const hrv = 54;
      const stress = null;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('caution');
      expect(result.label).toBe('ATENÇÃO');
    });

    it('returns go when hrv is 55 and stress is null', () => {
      // Arrange
      const hrv = 55;
      const stress = null;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('go');
      expect(result.label).toBe('GO');
    });

    it('returns nogo when hrv is 29 and stress is undefined', () => {
      // Arrange
      const hrv = 29;
      const stress = undefined;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('nogo');
      expect(result.label).toBe('NO-GO');
    });

    it('returns caution when hrv is 30 and stress is undefined', () => {
      // Arrange
      const hrv = 30;
      const stress = undefined;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('caution');
      expect(result.label).toBe('ATENÇÃO');
    });

    it('returns caution when hrv is 54 and stress is undefined', () => {
      // Arrange
      const hrv = 54;
      const stress = undefined;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('caution');
      expect(result.label).toBe('ATENÇÃO');
    });

    it('returns go when hrv is 55 and stress is undefined', () => {
      // Arrange
      const hrv = 55;
      const stress = undefined;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('go');
      expect(result.label).toBe('GO');
    });
  });

  describe('Absence of both metrics (stress == null && hrv == null)', () => {
    it('returns unknown when both arguments are undefined (empty invocation)', () => {
      // Arrange / Act
      const result = getReadinessStatus();

      // Assert
      expect(result.state).toBe('unknown');
      expect(result.label).toBe('AGUARDANDO SCAN');
      expect(result.headline).toBe('Inicie o BioScore para avaliar a prontidão');
      expect(result.colorClass).toBe('text-muted-foreground');
      expect(result.badgeClass).toBe('bg-muted text-muted-foreground border-border');
    });

    it('returns unknown when both arguments are explicitly undefined', () => {
      // Arrange
      const hrv = undefined;
      const stress = undefined;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('unknown');
      expect(result.label).toBe('AGUARDANDO SCAN');
      expect(result.headline).toBe('Inicie o BioScore para avaliar a prontidão');
    });

    it('returns unknown when both arguments are null', () => {
      // Arrange
      const hrv = null;
      const stress = null;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('unknown');
      expect(result.label).toBe('AGUARDANDO SCAN');
      expect(result.headline).toBe('Inicie o BioScore para avaliar a prontidão');
      expect(result.colorClass).toBe('text-muted-foreground');
      expect(result.badgeClass).toBe('bg-muted text-muted-foreground border-border');
    });

    it('returns unknown when hrv is null and stress is undefined', () => {
      // Arrange
      const hrv = null;
      const stress = undefined;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('unknown');
      expect(result.label).toBe('AGUARDANDO SCAN');
    });

    it('returns unknown when hrv is undefined and stress is null', () => {
      // Arrange
      const hrv = undefined;
      const stress = null;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('unknown');
      expect(result.label).toBe('AGUARDANDO SCAN');
    });
  });

  describe('One null/undefined and other valid metric', () => {
    it('returns caution when hrv is null but stress is moderate', () => {
      // Arrange
      const hrv = null;
      const stress = 'moderate';

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('caution');
      expect(result.label).toBe('ATENÇÃO');
    });

    it('returns caution when hrv is undefined but stress is moderate', () => {
      // Arrange
      const hrv = undefined;
      const stress = 'moderate';

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('caution');
      expect(result.label).toBe('ATENÇÃO');
    });

    it('returns nogo when hrv is null but stress is high', () => {
      // Arrange
      const hrv = null;
      const stress = 'high';

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('nogo');
      expect(result.label).toBe('NO-GO');
    });

    it('returns nogo when hrv is undefined but stress is high', () => {
      // Arrange
      const hrv = undefined;
      const stress = 'high';

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('nogo');
      expect(result.label).toBe('NO-GO');
    });

    it('returns go when hrv is null but stress is low', () => {
      // Arrange
      const hrv = null;
      const stress = 'low';

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('go');
      expect(result.label).toBe('GO');
    });

    it('returns go when hrv is undefined but stress is low', () => {
      // Arrange
      const hrv = undefined;
      const stress = 'low';

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('go');
      expect(result.label).toBe('GO');
    });

    it('returns nogo when stress is null but hrv is below 30', () => {
      // Arrange
      const hrv = 25;
      const stress = null;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('nogo');
      expect(result.label).toBe('NO-GO');
    });

    it('returns nogo when stress is undefined but hrv is below 30', () => {
      // Arrange
      const hrv = 25;
      const stress = undefined;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('nogo');
      expect(result.label).toBe('NO-GO');
    });

    it('returns caution when stress is null but hrv is between 30 and 54', () => {
      // Arrange
      const hrv = 40;
      const stress = null;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('caution');
      expect(result.label).toBe('ATENÇÃO');
    });

    it('returns caution when stress is undefined but hrv is between 30 and 54', () => {
      // Arrange
      const hrv = 40;
      const stress = undefined;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('caution');
      expect(result.label).toBe('ATENÇÃO');
    });

    it('returns go when stress is null and hrv is >= 55', () => {
      // Arrange
      const hrv = 60;
      const stress = null;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('go');
      expect(result.label).toBe('GO');
    });

    it('returns go when stress is undefined and hrv is >= 55', () => {
      // Arrange
      const hrv = 60;
      const stress = undefined;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('go');
      expect(result.label).toBe('GO');
    });
  });

  describe('bioScore parameter and boundary tests (0, 49, 50, null)', () => {
    it('trata bioScore === 0 como unknown (sem scan válido)', () => {
      // Arrange
      const hrv = null;
      const stress = null;
      const bioScore = 0;

      // Act
      const result = getReadinessStatus(hrv, stress, bioScore);

      // Assert
      expect(result.state).toBe('unknown');
      expect(result.label).toBe('AGUARDANDO SCAN');
      expect(result.headline).toBe('Inicie o BioScore para avaliar a prontidão');
    });

    it('ignora bioScore === 0 quando hrv e stress estão presentes e usa o veredito fisiológico', () => {
      // Arrange
      const hrv = 65;
      const stress = 'low';
      const bioScore = 0;

      // Act
      const result = getReadinessStatus(hrv, stress, bioScore);

      // Assert
      expect(result.state).toBe('go');
      expect(result.label).toBe('GO');
    });

    it('bioScore === 0 com hrv presente e estresse ausente usa o veredito de HRV', () => {
      // Arrange
      const hrv = 40;
      const stress = null;
      const bioScore = 0;

      // Act
      const result = getReadinessStatus(hrv, stress, bioScore);

      // Assert
      expect(result.state).toBe('caution');
    });

    it('retorna nogo quando bioScore é 49 (limite superior abaixo de 50)', () => {
      // Arrange
      const hrv = null;
      const stress = null;
      const bioScore = 49;

      // Act
      const result = getReadinessStatus(hrv, stress, bioScore);

      // Assert
      expect(result.state).toBe('nogo');
      expect(result.label).toBe('NO-GO');
      expect(result.headline).toBe('FADIGA — NÃO APTO AO TURNO');
    });

    it('retorna nogo quando bioScore é 1 (limite inferior maior que 0)', () => {
      // Arrange
      const hrv = null;
      const stress = null;
      const bioScore = 1;

      // Act
      const result = getReadinessStatus(hrv, stress, bioScore);

      // Assert
      expect(result.state).toBe('nogo');
      expect(result.label).toBe('NO-GO');
    });

    it('retorna go quando bioScore é 50 (limite exato para prontidão) sem métricas adversas', () => {
      // Arrange
      const hrv = null;
      const stress = null;
      const bioScore = 50;

      // Act
      const result = getReadinessStatus(hrv, stress, bioScore);

      // Assert
      expect(result.state).toBe('go');
      expect(result.label).toBe('GO');
      expect(result.headline).toBe('APTO PARA O TURNO');
    });

    it('retorna go quando bioScore é 85 sem métricas adversas', () => {
      // Arrange
      const hrv = 60;
      const stress = 'low';
      const bioScore = 85;

      // Act
      const result = getReadinessStatus(hrv, stress, bioScore);

      // Assert
      expect(result.state).toBe('go');
      expect(result.label).toBe('GO');
    });

    it('preserva comportamento original quando bioScore é null', () => {
      // Arrange & Act & Assert
      expect(getReadinessStatus(60, 'low', null).state).toBe('go');
      expect(getReadinessStatus(45, 'moderate', null).state).toBe('caution');
      expect(getReadinessStatus(25, 'low', null).state).toBe('nogo');
      expect(getReadinessStatus(null, null, null).state).toBe('unknown');
    });

    it('preserva precedência de limites adversos mesmo com bioScore alto', () => {
      // Arrange & Act & Assert: HRV crítico (< 30) gera nogo mesmo com bioScore 95
      expect(getReadinessStatus(25, 'low', 95).state).toBe('nogo');
      // Estresse alto gera nogo mesmo com bioScore 95
      expect(getReadinessStatus(60, 'high', 95).state).toBe('nogo');
      // HRV moderado (< 55) gera caution mesmo com bioScore 95
      expect(getReadinessStatus(40, 'low', 95).state).toBe('caution');
      // Estresse moderado gera caution mesmo com bioScore 95
      expect(getReadinessStatus(60, 'moderate', 95).state).toBe('caution');
    });
  });

  describe('Garantia de ausência de GO falso sem scan', () => {
    it('nunca retorna "GO" quando não há scan (todos nulos ou indefinidos)', () => {
      // Arrange & Act
      const emptyCall = getReadinessStatus();
      const nullHrvStress = getReadinessStatus(null, null);
      const undefinedHrvStress = getReadinessStatus(undefined, undefined);
      const allNull = getReadinessStatus(null, null, null);
      const allUndefined = getReadinessStatus(undefined, undefined, undefined);
      const zeroBioScore = getReadinessStatus(null, null, 0);

      // Assert: Nenhum deles deve ser 'go'
      expect(emptyCall.state).toBe('unknown');
      expect(emptyCall.state).not.toBe('go');

      expect(nullHrvStress.state).toBe('unknown');
      expect(nullHrvStress.state).not.toBe('go');

      expect(undefinedHrvStress.state).toBe('unknown');
      expect(undefinedHrvStress.state).not.toBe('go');

      expect(allNull.state).toBe('unknown');
      expect(allNull.state).not.toBe('go');

      expect(allUndefined.state).toBe('unknown');
      expect(allUndefined.state).not.toBe('go');

      expect(zeroBioScore.state).toBe('unknown');
      expect(zeroBioScore.state).not.toBe('go');
    });
  });
});
