import { describe, it, expect, beforeEach } from 'vitest';
import {
  savePerceivedFatigue,
  getPerceivedFatigue,
  getLatestPerceivedFatigue,
  getFatigueStorageKey,
  checkFatigueDivergence,
  perceivedFatigueValueSchema,
  perceivedFatigueEntrySchema,
  FATIGUE_DIVERGENCE_MESSAGE,
  FATIGUE_DIVERGENCE_MESSAGE_EN,
  getFatigueLabel,
  getFatigueOptions,
  getFatigueDivergenceMessage,
} from './perceivedFatigue';

describe('perceivedFatigue module (AAA Pattern)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Salva e recupera em localStorage', () => {
    it('grava com chave no padrão crewvitals_perceived_fatigue_YYYY-MM-DD, valor 1-5 e timestamp', () => {
      // Arrange
      const dateStr = '2026-11-15';
      const value = 3;

      // Act
      const saved = savePerceivedFatigue(value, dateStr);
      const retrieved = getPerceivedFatigue(dateStr);

      // Assert
      expect(saved.value).toBe(3);
      expect(saved.timestamp).toBeDefined();
      expect(retrieved).not.toBeNull();
      expect(retrieved?.value).toBe(3);
      expect(retrieved?.timestamp).toBe(saved.timestamp);

      const rawStorage = localStorage.getItem(`crewvitals_perceived_fatigue_${dateStr}`);
      expect(rawStorage).not.toBeNull();
      const parsedRaw = JSON.parse(rawStorage!);
      expect(parsedRaw.value).toBe(3);
      expect(parsedRaw.timestamp).toBe(saved.timestamp);
    });

    it('getLatestPerceivedFatigue busca a entrada mais recente no localStorage', () => {
      // Arrange
      savePerceivedFatigue(2, '2026-11-10');
      savePerceivedFatigue(4, '2026-11-14');

      // Act
      const latest = getLatestPerceivedFatigue();

      // Assert
      expect(latest).not.toBeNull();
      expect(latest?.value).toBe(4);
    });
  });

  describe('2. Validação Zod: rejeita 0 e 6', () => {
    it('rejeita valor 0 no schema de valor', () => {
      // Arrange
      const invalidZero = 0;

      // Act
      const result = perceivedFatigueValueSchema.safeParse(invalidZero);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('entre 1 e 5');
      }
    });

    it('rejeita valor 6 no schema de valor', () => {
      // Arrange
      const invalidSix = 6;

      // Act
      const result = perceivedFatigueValueSchema.safeParse(invalidSix);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('entre 1 e 5');
      }
    });

    it('aceita valores de 1 a 5', () => {
      // Arrange & Act & Assert
      for (let i = 1; i <= 5; i++) {
        const result = perceivedFatigueValueSchema.safeParse(i);
        expect(result.success).toBe(true);
      }
    });

    it('savePerceivedFatigue lança erro Zod ao receber 0 ou 6', () => {
      // Arrange & Act & Assert
      expect(() => savePerceivedFatigue(0)).toThrow();
      expect(() => savePerceivedFatigue(6)).toThrow();
      expect(() => savePerceivedFatigue(-1)).toThrow();
    });
  });

  describe('3. Divergência nos dois sentidos', () => {
    it('Sentido 1: fadiga >= 4 e veredito GO detecta divergência', () => {
      // Arrange
      const highFatigue4 = 4;
      const highFatigue5 = 5;
      const verdict = 'GO';

      // Act
      const div4 = checkFatigueDivergence(highFatigue4, verdict);
      const div5 = checkFatigueDivergence(highFatigue5, verdict);

      // Assert
      expect(div4).toBe(true);
      expect(div5).toBe(true);
    });

    it('Sentido 2: fadiga <= 2 e veredito NO-GO detecta divergência', () => {
      // Arrange
      const lowFatigue1 = 1;
      const lowFatigue2 = 2;
      const verdict = 'NO-GO';

      // Act
      const div1 = checkFatigueDivergence(lowFatigue1, verdict);
      const div2 = checkFatigueDivergence(lowFatigue2, verdict);

      // Assert
      expect(div1).toBe(true);
      expect(div2).toBe(true);
    });

    it('Cenários alinhados não apresentam divergência', () => {
      // Arrange & Act & Assert
      // Nível 3 é intermediário neutro
      expect(checkFatigueDivergence(3, 'GO')).toBe(false);
      expect(checkFatigueDivergence(3, 'NO-GO')).toBe(false);

      // Fadiga baixa com GO é alinhado
      expect(checkFatigueDivergence(1, 'GO')).toBe(false);
      expect(checkFatigueDivergence(2, 'GO')).toBe(false);

      // Fadiga alta com NO-GO é alinhado
      expect(checkFatigueDivergence(4, 'NO-GO')).toBe(false);
      expect(checkFatigueDivergence(5, 'NO-GO')).toBe(false);

      // Vereditos não extremos (ATENÇÃO ou SEM DADOS)
      expect(checkFatigueDivergence(5, 'ATENÇÃO')).toBe(false);
      expect(checkFatigueDivergence(1, 'SEM DADOS')).toBe(false);
      expect(checkFatigueDivergence(null, 'GO')).toBe(false);
    });
  });

  describe('4. Internacionalização (EN e PT) de rótulos e opções de fadiga', () => {
    it('retorna rótulos de fadiga 1 a 5 em EN e PT com retrocompatibilidade', () => {
      // Arrange & Act & Assert
      expect(getFatigueLabel(1, 'en')).toBe('1 - No fatigue');
      expect(getFatigueLabel(2, 'en')).toBe('2 - Mild fatigue');
      expect(getFatigueLabel(3, 'en')).toBe('3 - Moderate fatigue');
      expect(getFatigueLabel(4, 'en')).toBe('4 - High fatigue');
      expect(getFatigueLabel(5, 'en')).toBe('5 - Exhaustion');

      // PT default
      expect(getFatigueLabel(1)).toBe('1 - Sem fadiga');
      expect(getFatigueLabel(1, 'pt')).toBe('1 - Sem fadiga');
      expect(getFatigueLabel(5, 'pt')).toBe('5 - Exaustão');

      // Valor desconhecido retorna a string do valor
      expect(getFatigueLabel(99, 'en')).toBe('99');
    });

    it('retorna lista de opções de fadiga em EN e PT', () => {
      // Arrange & Act & Assert
      const ptOpts = getFatigueOptions('pt');
      const enOpts = getFatigueOptions('en');

      expect(ptOpts.length).toBe(5);
      expect(enOpts.length).toBe(5);
      expect(ptOpts[0].label).toBe('1 - Sem fadiga');
      expect(enOpts[0].label).toBe('1 - No fatigue');
    });

    it('retorna mensagem de divergência em EN e PT', () => {
      // Arrange & Act & Assert
      expect(getFatigueDivergenceMessage('pt')).toBe(FATIGUE_DIVERGENCE_MESSAGE);
      expect(getFatigueDivergenceMessage('en')).toBe(FATIGUE_DIVERGENCE_MESSAGE_EN);
    });
  });
});
