import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWellnessScore } from '@/hooks/useWellnessScore';
import { supabase } from '@/integrations/supabase/client';
import {
  getReadinessStatus,
  computePhysioVerdictScore,
  MAX_STRESS_POINTS,
  ReadinessLabel,
  ReadinessStatus,
} from '@/lib/readiness';
import { computeStressScore, computeHrvScore } from '@/lib/wellnessScoring';
import {
  hasCountermeasureProtocolToday,
  COUNTERMEASURE_REGISTERED_EVENT,
} from '@/lib/missionEvents';
import {
  DemoStage,
  DemoEventLog,
  getStoredDemoStage,
  setStoredDemoStage,
  hasStoredDemoStage,
  resetDemoStage,
  simulateDemoScan,
  isDemoMode,
  isDemoReset,
  getDemoScenarioData,
  DEMO_STAGE_CHANGED_EVENT,
} from '@/lib/demoScenario';

export interface UseReadinessOptions {
  stressLevel?: string | null;
  hrvValue?: number | null;
  blinkRate?: number | null;
  horasSono?: number | null;
  bioScore?: number | null;
  isDemo?: boolean;
  locationSearch?: string;
}

export interface UseReadinessReturn extends ReadinessStatus {
  hasData: boolean;
  hasRealTelemetry: boolean;
  isDemo: boolean;
  demoStage: DemoStage | null;
  demoStageLabel: string | null;
  stage: DemoStage | null;
  stageBadge: string | null;
  stressLevel: string | null;
  hrvValue: number | null;
  blinkRate: number | null;
  horasSono: number | null;
  bioScore: number | null;
  hasProtocolToday: boolean;
  logs: DemoEventLog[];
  isAlert: boolean;
  isCaution: boolean;
  isUnknown: boolean;
  simulateScan: () => void;
  resetDemo: () => void;
  setStage: (stage: DemoStage) => void;
  refresh: () => Promise<void>;
}

/** Rótulo do veredito de um scan recém-concluído, sem estado de hook. */
export function getScanVerdictLabel(
  hrv: number | null | undefined,
  stress: string | null | undefined
): ReadinessLabel {
  return getReadinessStatus(hrv, stress).label;
}

export function useReadiness(options: UseReadinessOptions = {}): UseReadinessReturn {
  const { user } = useAuth();
  const { score: wellnessScore } = useWellnessScore();
  const [dbTelemetry, setDbTelemetry] = useState<{
    stressLevel?: string | null;
    hrvValue?: number | null;
    blinkRate?: number | null;
    horasSono?: number | null;
  }>({});

  const isDemoUrl = isDemoMode(options.locationSearch);
  const isResetUrl = isDemoReset(options.locationSearch);
  const isDemo = Boolean(options.isDemo || isDemoUrl);
  // Demo sem estado salvo na sessão começa limpa: ignora protocolo gravado antes.
  const isFreshDemo = isDemo && !isResetUrl && !hasStoredDemoStage();

  const [hasProtocol, setHasProtocol] = useState<boolean>(
    () => !isResetUrl && !isFreshDemo && hasCountermeasureProtocolToday()
  );

  const [demoStage, setLocalDemoStage] = useState<DemoStage>(() =>
    isResetUrl ? 1 : getStoredDemoStage()
  );

  const loadTelemetryFromDb = useCallback(async () => {
    try {
      const userId = user?.id ?? (await supabase?.auth?.getUser?.())?.data?.user?.id;
      if (!userId) return;

      const [scanRes, profileRes] = await Promise.all([
        supabase
          .from('stress_scans')
          .select('stress_level, hrv_value, blink_rate')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('horas_sono')
          .eq('id', userId)
          .maybeSingle(),
      ]);

      setDbTelemetry({
        stressLevel: scanRes?.data?.stress_level ?? null,
        hrvValue:
          scanRes?.data?.hrv_value != null ? Number(scanRes.data.hrv_value) : null,
        blinkRate:
          scanRes?.data?.blink_rate != null ? Number(scanRes.data.blink_rate) : null,
        horasSono:
          profileRes?.data?.horas_sono != null
            ? Number(profileRes.data.horas_sono)
            : null,
      });
    } catch {
      // safe fallback
    }
  }, [user?.id]);

  useEffect(() => {
    loadTelemetryFromDb();
  }, [loadTelemetryFromDb]);

  useEffect(() => {
    if (isResetUrl) {
      resetDemoStage();
      setLocalDemoStage(1);
      setHasProtocol(false);
    }
  }, [isResetUrl]);

  useEffect(() => {
    const handleCountermeasure = () => {
      setHasProtocol(true);
      if (isDemo) {
        setStoredDemoStage(2);
        setLocalDemoStage(2);
      }
    };

    const handleStageChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ stage: DemoStage }>;
      if (customEvent.detail?.stage) {
        setLocalDemoStage(customEvent.detail.stage);
      } else {
        setLocalDemoStage(getStoredDemoStage());
      }
    };

    window.addEventListener(COUNTERMEASURE_REGISTERED_EVENT, handleCountermeasure);
    window.addEventListener(DEMO_STAGE_CHANGED_EVENT, handleStageChanged);

    return () => {
      window.removeEventListener(COUNTERMEASURE_REGISTERED_EVENT, handleCountermeasure);
      window.removeEventListener(DEMO_STAGE_CHANGED_EVENT, handleStageChanged);
    };
  }, [isDemo]);

  const simulateScan = useCallback(() => {
    simulateDemoScan();
    setLocalDemoStage(3);
  }, []);

  const resetDemo = useCallback(() => {
    resetDemoStage();
    setLocalDemoStage(1);
    setHasProtocol(false);
  }, []);

  const setStage = useCallback((stage: DemoStage) => {
    setStoredDemoStage(stage);
    setLocalDemoStage(stage);
  }, []);

  // Check if props are explicitly the demo fallback values
  const isDemoFallbackTelemetry = Boolean(
    isDemo &&
      (options.stressLevel === 'high' || !options.stressLevel) &&
      (options.hrvValue === 28 || options.hrvValue == null) &&
      (options.bioScore === 34 || options.bioScore == null) &&
      (options.blinkRate === 14 || options.blinkRate == null) &&
      (options.horasSono === 5.5 || options.horasSono == null)
  );

  const hasExplicitRealProps = Boolean(
    (options.stressLevel != null && options.stressLevel !== '' && options.stressLevel !== 'high') ||
      (options.hrvValue != null && options.hrvValue !== 28) ||
      (options.blinkRate != null && options.blinkRate !== 14) ||
      (options.bioScore != null && options.bioScore !== 34) ||
      (options.horasSono != null && options.horasSono !== 5.5)
  );

  const hasManualPropTelemetry = !isDemoFallbackTelemetry && Boolean(
    (options.stressLevel != null && options.stressLevel !== '') ||
      options.hrvValue != null ||
      options.blinkRate != null ||
      options.horasSono != null ||
      options.bioScore != null
  );

  const hasDbTelemetry = Boolean(
    dbTelemetry.stressLevel != null ||
      dbTelemetry.hrvValue != null ||
      dbTelemetry.blinkRate != null ||
      dbTelemetry.horasSono != null
  );

  const hasRealTelemetry = hasExplicitRealProps || (!isDemo && hasManualPropTelemetry) || hasDbTelemetry;

  // Demo mode active when requested AND no explicit real telemetry provided
  if (isDemo && !hasExplicitRealProps && !hasDbTelemetry) {
    const demoData = getDemoScenarioData(demoStage);
    return {
      state: demoData.readiness.state,
      label: demoData.readiness.label,
      headline: demoData.readiness.headline,
      colorClass: demoData.readiness.colorClass,
      badgeClass: demoData.readiness.badgeClass,
      hasData: true,
      hasRealTelemetry: false,
      isDemo: true,
      demoStage,
      demoStageLabel: demoData.stageBadge,
      stage: demoStage,
      stageBadge: demoData.stageBadge,
      stressLevel: demoData.stressLevel,
      hrvValue: demoData.hrvValue,
      blinkRate: demoData.blinkRate,
      horasSono: demoData.horasSono,
      bioScore: demoData.bioScore,
      hasProtocolToday: hasProtocol,
      logs: demoData.logs,
      isAlert: demoData.readiness.state === 'nogo',
      isCaution: demoData.readiness.state === 'caution',
      isUnknown: demoData.readiness.state === 'unknown',
      simulateScan,
      resetDemo,
      setStage,
      refresh: loadTelemetryFromDb,
    };
  }

  // Non-demo or preserving manual real telemetry
  const effectiveStress =
    options.stressLevel !== undefined && options.stressLevel !== ''
      ? options.stressLevel
      : dbTelemetry.stressLevel ?? null;

  const effectiveHrv =
    options.hrvValue !== undefined
      ? options.hrvValue
      : dbTelemetry.hrvValue ?? null;

  const effectiveBlinkRate =
    options.blinkRate !== undefined
      ? options.blinkRate
      : dbTelemetry.blinkRate ?? null;

  const effectiveHorasSono =
    options.horasSono !== undefined
      ? options.horasSono
      : dbTelemetry.horasSono ?? null;

  const effectiveBioScore =
    options.bioScore !== undefined
      ? options.bioScore
      : wellnessScore ?? null;

  // Veredito usa só telemetria fisiológica (estresse + HRV) da leitura efetiva,
  // nunca engajamento. O BioScore exibido (effectiveBioScore) permanece inalterado.
  // Estresse ausente não penaliza (máximo); HRV ausente usa o neutro de computeHrvScore.
  const hasPhysioTelemetry = Boolean(effectiveStress) || effectiveHrv != null;
  const verdictBioScore =
    options.bioScore !== undefined
      ? options.bioScore
      : hasPhysioTelemetry
        ? computePhysioVerdictScore(
            effectiveStress ? computeStressScore([{ stress_level: effectiveStress }]) : MAX_STRESS_POINTS,
            computeHrvScore([{ hrv_value: effectiveHrv }])
          )
        : null;

  const readiness = getReadinessStatus(
    effectiveHrv,
    effectiveStress,
    verdictBioScore
  );

  return {
    state: readiness.state,
    label: readiness.label,
    headline: readiness.headline,
    colorClass: readiness.colorClass,
    badgeClass: readiness.badgeClass,
    hasData: hasRealTelemetry,
    hasRealTelemetry,
    isDemo,
    demoStage: isDemo ? demoStage : null,
    demoStageLabel: isDemo ? `DEMO ${demoStage}/3` : null,
    stage: isDemo ? demoStage : null,
    stageBadge: isDemo ? `DEMO ${demoStage}/3` : null,
    stressLevel: effectiveStress,
    hrvValue: effectiveHrv,
    blinkRate: effectiveBlinkRate,
    horasSono: effectiveHorasSono,
    bioScore: effectiveBioScore,
    hasProtocolToday: hasProtocol,
    logs: [],
    isAlert: readiness.state === 'nogo',
    isCaution: readiness.state === 'caution',
    isUnknown: readiness.state === 'unknown',
    simulateScan,
    resetDemo,
    setStage,
    refresh: loadTelemetryFromDb,
  };
}
