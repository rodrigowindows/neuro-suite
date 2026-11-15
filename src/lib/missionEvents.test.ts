import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  appendEvent,
  getRecentEvents,
  clearMissionEvents,
  formatEventDate,
  formatMissionEvent,
  MISSION_EVENTS_STORAGE_KEY,
  MISSION_EVENT_ADDED_EVENT,
  MAX_MISSION_EVENTS,
  MissionEvent,
} from './missionEvents';

describe('clearMissionEvents (AAA Pattern)', () => {
  it('apaga o log gravado e dispara MISSION_EVENT_ADDED_EVENT', () => {
    // Arrange
    localStorage.clear();
    appendEvent({ type: 'scan', label: 'BioScore: GO (BioScore 85)' });
    const listener = vi.fn();
    window.addEventListener(MISSION_EVENT_ADDED_EVENT, listener);

    // Act
    clearMissionEvents();
    window.removeEventListener(MISSION_EVENT_ADDED_EVENT, listener);

    // Assert
    expect(localStorage.getItem(MISSION_EVENTS_STORAGE_KEY)).toBeNull();
    expect(getRecentEvents()).toHaveLength(0);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('missionEvents module (AAA Pattern)', () => {
  beforeEach(() => {
    localStorage.clear();
    clearMissionEvents();
  });

  describe('1. Ordem dos eventos: mais recentes primeiro', () => {
    it('retorna os eventos em ordem decrescente de insercao', () => {
      // Arrange
      const event1 = { type: 'scan' as const, label: 'BioScore: GO (BioScore 85)', at: '2026-11-15T08:00:00Z' };
      const event2 = { type: 'protocol' as const, label: 'Contramedida registrada (Respiracao 4-7-8)', at: '2026-11-15T09:00:00Z' };
      const event3 = { type: 'assessment' as const, label: 'Avaliacao de Prontidao concluida (Energia: 4/5)', at: '2026-11-15T10:00:00Z' };

      // Act
      appendEvent(event1);
      appendEvent(event2);
      appendEvent(event3);

      const recent = getRecentEvents(3);

      // Assert
      expect(recent).toHaveLength(3);
      expect(recent[0].label).toBe('Avaliacao de Prontidao concluida (Energia: 4/5)');
      expect(recent[1].label).toBe('Contramedida registrada (Respiracao 4-7-8)');
      expect(recent[2].label).toBe('BioScore: GO (BioScore 85)');
    });
  });

  describe('2. Limite maximo de 50 eventos', () => {
    it('descarta eventos excedentes mantendo estritamente no maximo 50 itens', () => {
      // Arrange
      const totalToInsert = 55;

      // Act
      for (let i = 1; i <= totalToInsert; i++) {
        appendEvent({
          type: 'perceived_fatigue',
          label: `Registro de teste ${i}`,
          at: new Date(Date.now() + i * 1000),
        });
      }

      const storedRaw = localStorage.getItem(MISSION_EVENTS_STORAGE_KEY);
      const parsed: MissionEvent[] = storedRaw ? JSON.parse(storedRaw) : [];
      const retrieved = getRecentEvents(100);

      // Assert
      expect(parsed).toHaveLength(MAX_MISSION_EVENTS);
      expect(retrieved).toHaveLength(MAX_MISSION_EVENTS);
      expect(retrieved[0].label).toBe('Registro de teste 55');
      expect(retrieved[MAX_MISSION_EVENTS - 1].label).toBe('Registro de teste 6');
    });
  });

  describe('3. Formatacao de Hoje, Ontem e outras datas', () => {
    it('formata como "Hoje, HH:mm" quando a data coincide com o dia de referencia', () => {
      // Arrange
      const ref = new Date('2026-11-15T15:00:00Z');
      const eventDate = new Date('2026-11-15T10:30:00Z');

      // Act
      const formatted = formatEventDate(eventDate, ref);

      // Assert
      expect(formatted).toMatch(/^Hoje, \d{2}:\d{2}$/);
    });

    it('formata como "Ontem, HH:mm" quando a data for do dia anterior', () => {
      // Arrange
      const ref = new Date('2026-11-15T15:00:00Z');
      const yesterdayDate = new Date('2026-11-14T22:15:00Z');

      // Act
      const formatted = formatEventDate(yesterdayDate, ref);

      // Assert
      expect(formatted).toMatch(/^Ontem, \d{2}:\d{2}$/);
    });

    it('formata como "DD/MM, HH:mm" quando a data for anterior a ontem', () => {
      // Arrange
      const ref = new Date('2026-11-15T15:00:00Z');
      const olderDate = new Date('2026-11-10T08:45:00Z');

      // Act
      const formatted = formatEventDate(olderDate, ref);

      // Assert
      expect(formatted).toMatch(/^\d{2}\/\d{2}, \d{2}:\d{2}$/);
    });

    it('formata a linha completa com travessao "[Hoje, HH:mm] — descricao"', () => {
      // Arrange
      const ref = new Date('2026-11-15T12:00:00Z');
      const event: MissionEvent = {
        id: 'evt-test-1',
        type: 'scan',
        label: 'BioScore: GO (BioScore 88)',
        at: '2026-11-15T10:30:00Z',
      };

      // Act
      const line = formatMissionEvent(event, ref);

      // Assert
      expect(line).toMatch(/^\[Hoje, \d{2}:\d{2}\] — BioScore: GO \(BioScore 88\)$/);
    });
  });

  describe('4. Tipos e valores reais (sem invencao de numeros)', () => {
    it('suporta os 4 tipos obrigatorios: scan, protocol, assessment e perceived_fatigue', () => {
      // Arrange
      const scanEvent = { type: 'scan' as const, label: 'BioScore: NO-GO (BioScore 35)' };
      const protocolEvent = { type: 'protocol' as const, label: 'Contramedida registrada (Respiracao 4-7-8)' };
      const assessmentEvent = { type: 'assessment' as const, label: 'Avaliacao de Prontidao concluida (Energia: 2/5)' };
      const fatigueEvent = { type: 'perceived_fatigue' as const, label: 'Fadiga percebida: nivel 4/5' };

      // Act
      appendEvent(scanEvent);
      appendEvent(protocolEvent);
      appendEvent(assessmentEvent);
      appendEvent(fatigueEvent);

      const events = getRecentEvents(4);

      // Assert
      const types = events.map((e) => e.type);
      expect(types).toEqual(['perceived_fatigue', 'assessment', 'protocol', 'scan']);
      expect(events[0].label).toBe('Fadiga percebida: nivel 4/5');
      expect(events[3].label).toBe('BioScore: NO-GO (BioScore 35)');
    });
  });
});
