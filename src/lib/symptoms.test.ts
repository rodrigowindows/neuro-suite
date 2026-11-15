import { describe, it, expect, beforeEach } from 'vitest';
import {
  SYMPTOM_OPTIONS,
  symptomSchema,
  saveDailySymptoms,
  getDailySymptoms,
  getDailySymptomsEntry,
  evaluateDecisionSupport,
  getSymptomsStorageKey,
  DECISION_SUPPORT_DISCLAIMER,
  DECISION_SUPPORT_RECOMMENDATION,
  Symptom,
} from './symptoms';

describe('symptoms module (AAA Pattern)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Regra de apoio à decisão - Limites Exatos e Combinação com NO-GO (AAA)', () => {
    it('com 0 sintomas: não aciona recomendação independente do veredito e exibe disclaimer', () => {
      // Arrange
      const symptoms: Symptom[] = [];
      const verdicts = ['GO', 'NO-GO', 'ATENÇÃO', 'SEM DADOS', undefined, null];

      verdicts.forEach((verdict) => {
        // Act
        const result = evaluateDecisionSupport(symptoms, verdict);

        // Assert
        expect(result.triggered).toBe(false);
        expect(result.recommendation).toBeNull();
        expect(result.disclaimer).toBe(DECISION_SUPPORT_DISCLAIMER);
      });
    });

    it('limite de 1 sintoma: não aciona recomendação mesmo com veredito NO-GO', () => {
      // Arrange: 1 sintoma isolado
      const singleSymptom: Symptom[] = ['dor de cabeça'];

      // Act
      const resultNoGo = evaluateDecisionSupport(singleSymptom, 'NO-GO');
      const resultGo = evaluateDecisionSupport(singleSymptom, 'GO');
      const resultNumeric = evaluateDecisionSupport(1, 'NO-GO');

      // Assert
      expect(resultNoGo.triggered).toBe(false);
      expect(resultNoGo.recommendation).toBeNull();
      expect(resultNoGo.disclaimer).toBe(DECISION_SUPPORT_DISCLAIMER);

      expect(resultGo.triggered).toBe(false);
      expect(resultGo.recommendation).toBeNull();

      expect(resultNumeric.triggered).toBe(false);
    });

    it('limite exato de 2 sintomas: aciona recomendação APENAS com veredito NO-GO', () => {
      // Arrange: Exatamente 2 sintomas
      const twoSymptoms: Symptom[] = ['febre ou calafrios', 'náusea'];

      // Act & Assert para NO-GO (deve acionar)
      const resultNoGo = evaluateDecisionSupport(twoSymptoms, 'NO-GO');
      expect(resultNoGo.triggered).toBe(true);
      expect(resultNoGo.recommendation).toBe(DECISION_SUPPORT_RECOMMENDATION);
      expect(resultNoGo.disclaimer).toBe(DECISION_SUPPORT_DISCLAIMER);

      // Act & Assert para variantes de casing/hífen de NO-GO (deve acionar)
      expect(evaluateDecisionSupport(twoSymptoms, 'nogo').triggered).toBe(true);
      expect(evaluateDecisionSupport(twoSymptoms, 'no-go').triggered).toBe(true);
      expect(evaluateDecisionSupport(2, 'NO-GO').triggered).toBe(true);

      // Act & Assert para outros vereditos (NÃO deve acionar com 2 sintomas)
      const resultGo = evaluateDecisionSupport(twoSymptoms, 'GO');
      expect(resultGo.triggered).toBe(false);
      expect(resultGo.recommendation).toBeNull();
      expect(resultGo.disclaimer).toBe(DECISION_SUPPORT_DISCLAIMER);

      const resultAtencao = evaluateDecisionSupport(twoSymptoms, 'ATENÇÃO');
      expect(resultAtencao.triggered).toBe(false);
      expect(resultAtencao.recommendation).toBeNull();

      const resultSemDados = evaluateDecisionSupport(twoSymptoms, 'SEM DADOS');
      expect(resultSemDados.triggered).toBe(false);
      expect(resultSemDados.recommendation).toBeNull();

      const resultNull = evaluateDecisionSupport(twoSymptoms, null);
      expect(resultNull.triggered).toBe(false);
      expect(resultNull.recommendation).toBeNull();
    });

    it('limite de 3 ou mais sintomas: aciona recomendação em QUALQUER veredito', () => {
      // Arrange: Exatamente 3 sintomas
      const threeSymptoms: Symptom[] = [
        'febre ou calafrios',
        'dor de cabeça',
        'náusea',
      ];
      const verdicts = ['GO', 'ATENÇÃO', 'SEM DADOS', 'NO-GO', 'desconhecido', ''];

      verdicts.forEach((verdict) => {
        // Act
        const result = evaluateDecisionSupport(threeSymptoms, verdict);

        // Assert: Sempre aciona com >= 3
        expect(result.triggered).toBe(true);
        expect(result.recommendation).toBe(DECISION_SUPPORT_RECOMMENDATION);
        expect(result.disclaimer).toBe(DECISION_SUPPORT_DISCLAIMER);
      });

      // Assert com mais de 3 sintomas (ex: 5 sintomas)
      const fiveSymptoms: Symptom[] = [
        'febre ou calafrios',
        'dor de cabeça',
        'náusea',
        'tontura',
        'humor rebaixado',
      ];
      const resultFive = evaluateDecisionSupport(fiveSymptoms, 'GO');
      expect(resultFive.triggered).toBe(true);
      expect(resultFive.recommendation).toBe(DECISION_SUPPORT_RECOMMENDATION);
      expect(resultFive.disclaimer).toBe(DECISION_SUPPORT_DISCLAIMER);

      // Assert numérico puro
      expect(evaluateDecisionSupport(3, 'GO').triggered).toBe(true);
      expect(evaluateDecisionSupport(4, null).triggered).toBe(true);
    });

    it('exibe sempre o disclaimer "Apoio à decisão, não diagnóstico" em qualquer cenário', () => {
      // Arrange & Act
      const cases = [
        evaluateDecisionSupport(0, 'GO'),
        evaluateDecisionSupport(1, 'NO-GO'),
        evaluateDecisionSupport(2, 'GO'),
        evaluateDecisionSupport(2, 'NO-GO'),
        evaluateDecisionSupport(3, 'GO'),
        evaluateDecisionSupport(5, 'NO-GO'),
      ];

      // Assert
      cases.forEach((res) => {
        expect(res.disclaimer).toBe('Apoio à decisão, não diagnóstico');
      });
    });
  });

  describe('2. Persistência em localStorage por Data e Validação Zod (AAA)', () => {
    it('salva e recupera sintomas para a data especificada no formato ISO YYYY-MM-DD', () => {
      // Arrange
      const dateStr = '2026-11-15';
      const symptomsToSave: Symptom[] = ['dor de cabeça', 'sono fragmentado'];

      // Act
      const entry = saveDailySymptoms(symptomsToSave, dateStr);
      const retrieved = getDailySymptoms(dateStr);
      const retrievedEntry = getDailySymptomsEntry(dateStr);

      // Assert
      expect(entry.date).toBe(dateStr);
      expect(entry.symptoms).toEqual(symptomsToSave);
      expect(retrieved).toEqual(symptomsToSave);
      expect(retrievedEntry?.symptoms).toEqual(symptomsToSave);
      expect(retrievedEntry?.date).toBe(dateStr);

      const raw = localStorage.getItem(getSymptomsStorageKey(dateStr));
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw || '{}').symptoms).toEqual(symptomsToSave);
    });

    it('mantém isolamento estrito entre datas diferentes no localStorage', () => {
      // Arrange
      const day1 = '2026-11-14';
      const day2 = '2026-11-15';
      const symptomsDay1: Symptom[] = ['febre ou calafrios', 'tontura'];
      const symptomsDay2: Symptom[] = ['desconforto ocular'];

      // Act
      saveDailySymptoms(symptomsDay1, day1);
      saveDailySymptoms(symptomsDay2, day2);

      // Assert
      expect(getDailySymptoms(day1)).toEqual(symptomsDay1);
      expect(getDailySymptoms(day2)).toEqual(symptomsDay2);
    });

    it('valida estritamente as opções com Zod e rejeita sintomas inexistentes', () => {
      // Arrange
      const invalidSymptoms = ['sintoma_inexistente', 'tosse'];

      // Act & Assert
      expect(() => {
        saveDailySymptoms(invalidSymptoms as unknown as Symptom[]);
      }).toThrow();

      expect(symptomSchema.safeParse('febre ou calafrios').success).toBe(true);
      expect(symptomSchema.safeParse('sintoma_falso').success).toBe(false);
    });

    it('recupera array vazio de forma resiliente caso o localStorage esteja corrompido ou vazio', () => {
      // Arrange
      const dateStr = '2026-11-20';
      const key = getSymptomsStorageKey(dateStr);
      localStorage.setItem(key, 'invalid-json-content{');

      // Act
      const result = getDailySymptoms(dateStr);
      const entry = getDailySymptomsEntry(dateStr);

      // Assert
      expect(result).toEqual([]);
      expect(entry).toBeNull();
    });

    it('garante que todas as 8 opções do requisito estão registradas e tipadas', () => {
      // Assert
      expect(SYMPTOM_OPTIONS).toEqual([
        'febre ou calafrios',
        'dor de cabeça',
        'náusea',
        'tontura',
        'dor musculoesquelética',
        'humor rebaixado',
        'sono fragmentado',
        'desconforto ocular',
      ]);
      expect(SYMPTOM_OPTIONS.length).toBe(8);
    });
  });
});
