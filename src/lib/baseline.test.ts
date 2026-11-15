import { describe, it, expect } from 'vitest';
import {
  computeMedian,
  delta,
  calculateDelta,
  computeBaseline,
  formatDelta,
  filterValidScans,
} from './baseline';

describe('baseline pure functions (AAA Pattern)', () => {
  describe('computeMedian', () => {
    it('calcula mediana para quantidade impar de elementos', () => {
      // Arrange
      const oddValues = [50, 20, 80];

      // Act
      const result = computeMedian(oddValues);

      // Assert
      expect(result).toBe(50);
    });

    it('calcula mediana para quantidade par de elementos', () => {
      // Arrange
      const evenValues = [10, 20, 30, 40];

      // Act
      const result = computeMedian(evenValues);

      // Assert
      expect(result).toBe(25);
    });

    it('retorna 0 para array vazio', () => {
      // Arrange
      const emptyValues: number[] = [];

      // Act
      const result = computeMedian(emptyValues);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('delta', () => {
    it('calcula delta percentual correto quando valor diminui', () => {
      // Arrange
      const current = 82;
      const base = 100;

      // Act
      const result = delta(current, base);

      // Assert
      expect(result).toBe(-18);
    });

    it('calcula delta percentual correto quando valor aumenta', () => {
      // Arrange
      const current = 110;
      const base = 100;

      // Act
      const result = delta(current, base);

      // Assert
      expect(result).toBe(10);
    });

    it('trata baseline 0 sem divisao por zero retornando 0', () => {
      // Arrange
      const current = 50;
      const base = 0;

      // Act
      const result = delta(current, base);

      // Assert
      expect(result).toBe(0);
      expect(Number.isFinite(result)).toBe(true);
    });

    it('trata baseline invalido ou NaN retornando 0', () => {
      // Arrange
      const current = 50;
      const base = NaN;

      // Act
      const result = delta(current, base);

      // Assert
      expect(result).toBe(0);
    });

    it('funciona identicamente com o alias calculateDelta', () => {
      // Arrange
      const current = 75;
      const base = 100;

      // Act
      const result = calculateDelta(current, base);

      // Assert
      expect(result).toBe(-25);
    });
  });

  describe('computeBaseline', () => {
    it('retorna null quando houver menos de 3 scans (< 3 scans)', () => {
      // Arrange
      const twoScans = [
        { hrv_value: 60, blink_rate: 18.5 },
        { hrv_value: 65, blink_rate: 19.2 },
      ];

      // Act
      const result = computeBaseline(twoScans);

      // Assert
      expect(result).toBeNull();
    });

    it('retorna null para lista vazia ou nula', () => {
      // Arrange & Act & Assert
      expect(computeBaseline([])).toBeNull();
      expect(computeBaseline(null)).toBeNull();
      expect(computeBaseline(undefined)).toBeNull();
    });

    it('desconsidera scans invalidos com hrv_value ou blink_rate nulos', () => {
      // Arrange
      const mixedScans = [
        { hrv_value: 50, blink_rate: 18 },
        { hrv_value: null, blink_rate: 20 },
        { hrv_value: 60, blink_rate: null },
        { hrv_value: 70, blink_rate: 22 },
      ];

      // Act
      const result = computeBaseline(mixedScans);

      // Assert: apenas 2 scans validos restam, logo < 3
      expect(result).toBeNull();
    });

    it('calcula mediana impar com 3 scans validos', () => {
      // Arrange
      const scans = [
        { hrv_value: 50, blink_rate: 16.5 },
        { hrv_value: 60, blink_rate: 20.25 },
        { hrv_value: 70, blink_rate: 24.1 },
      ];

      // Act
      const result = computeBaseline(scans);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.hrv).toBe(60);
      expect(result?.blinkRate).toBe(20.25);
      expect(result?.count).toBe(3);
    });

    it('calcula mediana par com 4 scans validos mantendo precisao total de blink_rate', () => {
      // Arrange
      const scans = [
        { hrv_value: 40, blink_rate: 15.25 },
        { hrv_value: 50, blink_rate: 17.5 },
        { hrv_value: 60, blink_rate: 19.5 },
        { hrv_value: 70, blink_rate: 21.0 },
      ];

      // Act
      const result = computeBaseline(scans);

      // Assert
      expect(result).not.toBeNull();
      // Mediana HRV: (50 + 60) / 2 = 55
      expect(result?.hrv).toBe(55);
      // Mediana Blink: (17.5 + 19.5) / 2 = 18.5 (preserva decimal sem arredondamento aqui)
      expect(result?.blinkRate).toBe(18.5);
      expect(result?.count).toBe(4);
    });

    it('usa os ultimos N scans (N=7 por padrao) ordenados por data decrescente', () => {
      // Arrange: 8 scans com datas
      const scans = [
        { hrv_value: 10, blink_rate: 10, created_at: '2026-11-01T10:00:00Z' }, // Mais antigo (deve ser ignorado)
        { hrv_value: 50, blink_rate: 20, created_at: '2026-11-02T10:00:00Z' },
        { hrv_value: 52, blink_rate: 21, created_at: '2026-11-03T10:00:00Z' },
        { hrv_value: 54, blink_rate: 22, created_at: '2026-11-04T10:00:00Z' },
        { hrv_value: 56, blink_rate: 23, created_at: '2026-11-05T10:00:00Z' },
        { hrv_value: 58, blink_rate: 24, created_at: '2026-11-06T10:00:00Z' },
        { hrv_value: 60, blink_rate: 25, created_at: '2026-11-07T10:00:00Z' },
        { hrv_value: 62, blink_rate: 26, created_at: '2026-11-08T10:00:00Z' }, // Mais recente
      ];

      // Act
      const result = computeBaseline(scans, undefined, 7);

      // Assert: considera os 7 mais recentes (50, 52, 54, 56, 58, 60, 62)
      // Mediana = 56
      expect(result).not.toBeNull();
      expect(result?.count).toBe(7);
      expect(result?.hrv).toBe(56);
      expect(result?.blinkRate).toBe(23);
    });

    it('exclui o scan atual do conjunto da mediana', () => {
      // Arrange: scan atual (hrv 82) recebido separado; anteriores 100, 110, 120
      const current = { hrv_value: 82, blink_rate: 18, created_at: '2026-11-15T10:00:00Z' };
      const history = [
        current,
        { hrv_value: 100, blink_rate: 20, created_at: '2026-11-14T10:00:00Z' },
        { hrv_value: 110, blink_rate: 22, created_at: '2026-11-13T10:00:00Z' },
        { hrv_value: 120, blink_rate: 24, created_at: '2026-11-12T10:00:00Z' },
      ];

      // Act
      const result = computeBaseline(history, current);

      // Assert: mediana somente dos anteriores (100, 110, 120) = 110
      expect(result?.count).toBe(3);
      expect(result?.hrv).toBe(110);
      expect(result?.blinkRate).toBe(22);
    });

    it('usa somente os N scans anteriores ao atual', () => {
      // Arrange: atual + 8 anteriores; N=7 descarta o mais antigo (10)
      const current = { hrv_value: 999, blink_rate: 99, created_at: '2026-11-15T10:00:00Z' };
      const previous = [
        { hrv_value: 10, blink_rate: 10, created_at: '2026-11-01T10:00:00Z' },
        { hrv_value: 50, blink_rate: 20, created_at: '2026-11-02T10:00:00Z' },
        { hrv_value: 52, blink_rate: 21, created_at: '2026-11-03T10:00:00Z' },
        { hrv_value: 54, blink_rate: 22, created_at: '2026-11-04T10:00:00Z' },
        { hrv_value: 56, blink_rate: 23, created_at: '2026-11-05T10:00:00Z' },
        { hrv_value: 58, blink_rate: 24, created_at: '2026-11-06T10:00:00Z' },
        { hrv_value: 60, blink_rate: 25, created_at: '2026-11-07T10:00:00Z' },
        { hrv_value: 62, blink_rate: 26, created_at: '2026-11-08T10:00:00Z' },
      ];

      // Act
      const result = computeBaseline([current, ...previous], current, 7);

      // Assert: anteriores mais recentes 50..62, mediana 56; scan atual (999) nao entra
      expect(result?.count).toBe(7);
      expect(result?.hrv).toBe(56);
    });

    it('retorna null quando atual somado aos anteriores validos for menor que 3', () => {
      // Arrange: atual + apenas 1 anterior = 2 scans validos
      const current = { hrv_value: 60, blink_rate: 18, created_at: '2026-11-15T10:00:00Z' };
      const history = [
        current,
        { hrv_value: 70, blink_rate: 19, created_at: '2026-11-14T10:00:00Z' },
      ];

      // Act
      const result = computeBaseline(history, current);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('formatDelta', () => {
    it('formata delta negativo com caractere de subtracao e sufixo', () => {
      // Arrange
      const val = -18;

      // Act
      const formatted = formatDelta(val);

      // Assert
      expect(formatted).toBe('−18% vs. sua linha de base');
    });

    it('formata delta positivo com sinal de mais', () => {
      // Arrange
      const val = 12.4;

      // Act
      const formatted = formatDelta(val);

      // Assert
      expect(formatted).toBe('+12% vs. sua linha de base');
    });

    it('formata delta zero', () => {
      // Arrange
      const val = 0;

      // Act
      const formatted = formatDelta(val);

      // Assert
      expect(formatted).toBe('0% vs. sua linha de base');
    });
  });

  describe('filterValidScans', () => {
    it('rejeita objetos sem propriedades necessarias', () => {
      // Arrange
      const raw = [
        { hrv_value: 50 },
        { blink_rate: 20 },
        { hrv_value: 50, blink_rate: 20 },
      ];

      // Act
      const result = filterValidScans(raw as any);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ hrv_value: 50, blink_rate: 20 });
    });
  });
});
