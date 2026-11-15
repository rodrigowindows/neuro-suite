import { ReadinessStatus, getReadinessStatus } from '@/lib/readiness';
import { clearCountermeasureProtocolToday } from '@/lib/missionEvents';

export type DemoStage = 1 | 2 | 3;

export interface DemoEventLog {
  id: string;
  timeRelative: string;
  message: string;
  colorClass: string;
}

export interface DemoScenarioData {
  stage: DemoStage;
  stageBadge: string;
  bioScore: number;
  blinkRate: number;
  horasSono: number;
  hrvValue: number;
  stressLevel: string;
  readiness: ReadinessStatus;
  logs: DemoEventLog[];
}

export const DEMO_STORAGE_KEY = 'crewvitals_demo_stage';
export const DEMO_STAGE_CHANGED_EVENT = 'crewvitals:demo-stage-changed';

export function isDemoMode(search?: string): boolean {
  if (typeof window === 'undefined') return false;
  const query = search !== undefined ? search : window.location.search || '';
  const params = new URLSearchParams(query);
  return params.get('demo') === '1';
}

export function isDemoReset(search?: string): boolean {
  if (typeof window === 'undefined') return false;
  const query = search !== undefined ? search : window.location.search || '';
  const params = new URLSearchParams(query);
  return params.get('demo') === 'reset' || params.has('reset');
}

export function getStoredDemoStage(): DemoStage {
  if (typeof window === 'undefined') return 1;
  try {
    const value = sessionStorage.getItem(DEMO_STORAGE_KEY);
    if (value === '2') return 2;
    if (value === '3') return 3;
    return 1;
  } catch {
    return 1;
  }
}

export function setStoredDemoStage(stage: DemoStage): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(DEMO_STORAGE_KEY, String(stage));
  } catch {
    // sandbox / quota safe
  }
  window.dispatchEvent(
    new CustomEvent(DEMO_STAGE_CHANGED_EVENT, { detail: { stage } })
  );
}

export function hasStoredDemoStage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(DEMO_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function resetDemoStage(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(DEMO_STORAGE_KEY);
  } catch {
    // sandbox / quota safe
  }
  clearCountermeasureProtocolToday();
  window.dispatchEvent(
    new CustomEvent(DEMO_STAGE_CHANGED_EVENT, { detail: { stage: 1 } })
  );
}

export function simulateDemoScan(): void {
  setStoredDemoStage(3);
}

export function getDemoEventLogs(stage: DemoStage): DemoEventLog[] {
  const log1: DemoEventLog = {
    id: 'demo-log-1',
    timeRelative: '[há 10 min]',
    message: 'Alerta Preditivo: Fadiga Elevada (BioScore 34)',
    colorClass: 'text-amber-600 dark:text-amber-400',
  };

  const log2: DemoEventLog = {
    id: 'demo-log-2',
    timeRelative: '[há 2 min]',
    message: 'Ação: Contramedida executada (Respiração 4-7-8)',
    colorClass: 'text-cyan-600 dark:text-cyan-400',
  };

  const log3: DemoEventLog = {
    id: 'demo-log-3',
    timeRelative: '[agora]',
    message: 'Status atualizado: Estável (BioScore 72, HRV 62)',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
  };

  if (stage === 1) {
    return [log1];
  }
  if (stage === 2) {
    return [log1, log2];
  }
  return [log1, log2, log3];
}

export function getDemoScenarioData(stage: DemoStage): DemoScenarioData {
  if (stage === 1) {
    return {
      stage: 1,
      stageBadge: 'DEMO 1/3',
      bioScore: 34,
      blinkRate: 14,
      horasSono: 5.5,
      hrvValue: 28,
      stressLevel: 'high',
      readiness: getReadinessStatus(28, 'high'),
      logs: getDemoEventLogs(1),
    };
  }

  if (stage === 2) {
    return {
      stage: 2,
      stageBadge: 'DEMO 2/3',
      bioScore: 52,
      blinkRate: 14,
      horasSono: 5.5,
      hrvValue: 45,
      stressLevel: 'moderate',
      readiness: getReadinessStatus(45, 'moderate'),
      logs: getDemoEventLogs(2),
    };
  }

  return {
    stage: 3,
    stageBadge: 'DEMO 3/3',
    bioScore: 72,
    blinkRate: 18,
    horasSono: 5.5,
    hrvValue: 62,
    stressLevel: 'low',
    readiness: getReadinessStatus(62, 'low'),
    logs: getDemoEventLogs(3),
  };
}
