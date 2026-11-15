import { describe, it, expect, beforeEach } from 'vitest';
import {
  isDemoMode,
  isDemoReset,
  getStoredDemoStage,
  setStoredDemoStage,
  hasStoredDemoStage,
  resetDemoStage,
  simulateDemoScan,
  getDemoScenarioData,
  getDemoEventLogs,
  hasDemoRequested,
  markDemoRequested,
  replaceDemoResetUrl,
  DEMO_STORAGE_KEY,
  DEMO_REQUESTED_KEY,
  DEMO_STAGE_CHANGED_EVENT,
} from './demoScenario';
import {
  registerCountermeasureProtocol,
  hasCountermeasureProtocolToday,
} from '@/lib/missionEvents';

describe('demoScenario - Cenário de Demonstração Interativo de 3 Etapas', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('Detecção de flags de URL', () => {
    it('ativa demo apenas quando ?demo=1 estiver presente', () => {
      // Arrange & Act & Assert
      expect(isDemoMode('?demo=1')).toBe(true);
      expect(isDemoMode('?other=abc&demo=1')).toBe(true);
      expect(isDemoMode('')).toBe(false);
      expect(isDemoMode('?demo=0')).toBe(false);
      expect(isDemoMode('?demo=true')).toBe(false);
    });

    it('ativa demo também para ?demo=reset, pois o reset já inicia a demo', () => {
      // Arrange & Act & Assert
      expect(isDemoMode('?demo=reset')).toBe(true);
    });

    it('identifica comando de reset quando ?demo=reset ou ?reset estiver presente', () => {
      // Arrange & Act & Assert
      expect(isDemoReset('?demo=reset')).toBe(true);
      expect(isDemoReset('?demo=1&reset=1')).toBe(true);
      expect(isDemoReset('?demo=1')).toBe(false);
      expect(isDemoReset('')).toBe(false);
    });
  });

  describe('Persistência da solicitação de demo na sessão', () => {
    it('sem a chave gravada, nenhuma solicitação de demo existe', () => {
      // Arrange & Act & Assert
      expect(hasDemoRequested()).toBe(false);
    });

    it('markDemoRequested grava crewvitals_demo_requested = 1 no sessionStorage', () => {
      // Arrange & Act
      markDemoRequested();

      // Assert
      expect(sessionStorage.getItem(DEMO_REQUESTED_KEY)).toBe('1');
      expect(hasDemoRequested()).toBe(true);
    });

    it('replaceDemoResetUrl troca a query para ?demo=1 mantendo o pathname', () => {
      // Arrange
      window.history.pushState({}, '', '/dashboard?demo=reset&reset=1');

      // Act
      replaceDemoResetUrl();

      // Assert
      expect(window.location.pathname).toBe('/dashboard');
      expect(window.location.search).toBe('?demo=1');
    });
  });

  describe('Etapas e Telemetria do Cenário Demo', () => {
    it('Etapa 1: NO-GO com BioScore 34, 14 piscadas, 5.5h sono, HRV 28 e selo DEMO 1/3', () => {
      // Arrange & Act
      const stage1 = getDemoScenarioData(1);

      // Assert
      expect(stage1.stage).toBe(1);
      expect(stage1.stageBadge).toBe('DEMO 1/3');
      expect(stage1.bioScore).toBe(34);
      expect(stage1.blinkRate).toBe(14);
      expect(stage1.horasSono).toBe(5.5);
      expect(stage1.hrvValue).toBe(28);
      expect(stage1.stressLevel).toBe('high');
      expect(stage1.readiness.state).toBe('nogo');
      expect(stage1.readiness.label).toBe('NO-GO');
      expect(stage1.logs).toHaveLength(1);
      expect(stage1.logs[0].timeRelative).toBe('[há 10 min]');
      expect(stage1.logs[0].message).toContain('Alerta Preditivo: Fadiga Elevada (BioScore 34)');
    });

    it('Etapa 2: ATENÇÃO após registro de protocolo com selo DEMO 2/3 e 2 logs', () => {
      // Arrange & Act
      const stage2 = getDemoScenarioData(2);

      // Assert
      expect(stage2.stage).toBe(2);
      expect(stage2.stageBadge).toBe('DEMO 2/3');
      expect(stage2.bioScore).toBe(52);
      expect(stage2.blinkRate).toBe(14);
      expect(stage2.horasSono).toBe(5.5);
      expect(stage2.hrvValue).toBe(45);
      expect(stage2.stressLevel).toBe('moderate');
      expect(stage2.readiness.state).toBe('caution');
      expect(stage2.readiness.label).toBe('ATENÇÃO');
      expect(stage2.logs).toHaveLength(2);
      expect(stage2.logs[1].timeRelative).toBe('[há 2 min]');
      expect(stage2.logs[1].message).toContain('Ação: Contramedida executada (Respiração 4-7-8)');
    });

    it('Etapa 3: GO após scan simulado gerando BioScore 72, HRV 62 e selo DEMO 3/3', () => {
      // Arrange & Act
      const stage3 = getDemoScenarioData(3);

      // Assert
      expect(stage3.stage).toBe(3);
      expect(stage3.stageBadge).toBe('DEMO 3/3');
      expect(stage3.bioScore).toBe(72);
      expect(stage3.blinkRate).toBe(18);
      expect(stage3.horasSono).toBe(5.5);
      expect(stage3.hrvValue).toBe(62);
      expect(stage3.stressLevel).toBe('low');
      expect(stage3.readiness.state).toBe('go');
      expect(stage3.readiness.label).toBe('GO');
      expect(stage3.logs).toHaveLength(3);
      expect(stage3.logs[2].timeRelative).toBe('[agora]');
      expect(stage3.logs[2].message).toContain('Status atualizado: Estável (BioScore 72, HRV 62)');
    });
  });

  describe('Transições e Persistência de Estado', () => {
    it('inicia na etapa 1 por padrão quando não há armazenamento', () => {
      // Arrange & Act & Assert
      expect(getStoredDemoStage()).toBe(1);
    });

    it('persiste a etapa no sessionStorage e emite evento customizado', () => {
      // Arrange
      let eventPayload: number | null = null;
      const handler = (e: Event) => {
        eventPayload = (e as CustomEvent).detail.stage;
      };
      window.addEventListener(DEMO_STAGE_CHANGED_EVENT, handler);

      // Act
      setStoredDemoStage(2);

      // Assert
      expect(sessionStorage.getItem(DEMO_STORAGE_KEY)).toBe('2');
      expect(getStoredDemoStage()).toBe(2);
      expect(eventPayload).toBe(2);

      window.removeEventListener(DEMO_STAGE_CHANGED_EVENT, handler);
    });

    it('simulateDemoScan avança diretamente para a etapa 3 (GO)', () => {
      // Arrange
      setStoredDemoStage(1);

      // Act
      simulateDemoScan();

      // Assert
      expect(getStoredDemoStage()).toBe(3);
    });

    it('resetDemoStage reinicia para etapa 1 e remove o valor de sessão', () => {
      // Arrange
      setStoredDemoStage(3);

      // Act
      resetDemoStage();

      // Assert
      expect(sessionStorage.getItem(DEMO_STORAGE_KEY)).toBeNull();
      expect(getStoredDemoStage()).toBe(1);
    });

    it('resetDemoStage também limpa o protocolo de contramedida registrado hoje', () => {
      // Arrange
      registerCountermeasureProtocol({ breathing: true });

      // Act
      resetDemoStage();

      // Assert
      expect(hasCountermeasureProtocolToday()).toBe(false);
    });

    it('hasStoredDemoStage é falso sem estado salvo e verdadeiro após gravar uma etapa', () => {
      // Arrange
      const antes = hasStoredDemoStage();

      // Act
      setStoredDemoStage(2);

      // Assert
      expect(antes).toBe(false);
      expect(hasStoredDemoStage()).toBe(true);
    });
  });

  describe('Logs de Eventos Relativos', () => {
    it('garante que todos os logs registram tempos relativos a agora sem emojis', () => {
      // Arrange & Act
      const logs = getDemoEventLogs(3);

      // Assert
      expect(logs).toHaveLength(3);
      for (const log of logs) {
        expect(log.timeRelative).toMatch(/^\[há \d+ min\]|\[agora\]$/);
        // Sem emojis em conformidade estrita com as diretrizes
        expect(log.message).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
      }
    });
  });
});
