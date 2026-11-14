import { describe, expect, it } from 'vitest';
import { getReadinessStatus } from './readiness';

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
        label: 'SEM DADOS',
        headline: 'SEM SCAN — REALIZE O BIOSCORE',
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
      expect(result.label).toBe('SEM DADOS');
      expect(result.headline).toBe('SEM SCAN — REALIZE O BIOSCORE');
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
      expect(result.label).toBe('SEM DADOS');
      expect(result.headline).toBe('SEM SCAN — REALIZE O BIOSCORE');
    });

    it('returns unknown when both arguments are null', () => {
      // Arrange
      const hrv = null;
      const stress = null;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('unknown');
      expect(result.label).toBe('SEM DADOS');
      expect(result.headline).toBe('SEM SCAN — REALIZE O BIOSCORE');
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
      expect(result.label).toBe('SEM DADOS');
    });

    it('returns unknown when hrv is undefined and stress is null', () => {
      // Arrange
      const hrv = undefined;
      const stress = null;

      // Act
      const result = getReadinessStatus(hrv, stress);

      // Assert
      expect(result.state).toBe('unknown');
      expect(result.label).toBe('SEM DADOS');
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
});
