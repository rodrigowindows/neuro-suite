import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PredictiveAlert from '@/components/PredictiveAlert';
import { roundBlinkRate } from '@/lib/biometricDisplay';
import { getReadinessStatus } from '@/lib/readiness';
import { useAuth } from '@/hooks/useAuth';
import { useWellnessScore } from '@/hooks/useWellnessScore';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

export interface BridgeConsoleProps {
  onNavigateTab?: (tab: string) => void;
  stressLevel?: string;
  hrvValue?: number;
  blinkRate?: number;
  bioScore?: number;
  isDemo?: boolean;
  onStartProtocol?: () => void;
}

export default function BridgeConsole({
  onNavigateTab,
  stressLevel: propStressLevel,
  hrvValue: propHrvValue,
  blinkRate: propBlinkRate,
  bioScore: propBioScore,
  isDemo: propIsDemo,
  onStartProtocol,
}: BridgeConsoleProps) {
  const { user } = useAuth();
  const { score: wellnessScore } = useWellnessScore();

  const [telemetry, setTelemetry] = useState<{
    stressLevel?: string;
    hrvValue?: number;
    blinkRate?: number;
    horasSono?: number | null;
  }>({});

  useEffect(() => {
    let isMounted = true;
    async function loadTelemetry() {
      try {
        const authData = await supabase?.auth?.getUser?.();
        const userId = user?.id || authData?.data?.user?.id;
        if (!userId || !isMounted) return;

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

        if (isMounted) {
          setTelemetry({
            stressLevel: scanRes?.data?.stress_level,
            hrvValue: scanRes?.data?.hrv_value != null ? Number(scanRes.data.hrv_value) : undefined,
            blinkRate: scanRes?.data?.blink_rate != null ? Number(scanRes.data.blink_rate) : undefined,
            horasSono: profileRes?.data?.horas_sono != null ? Number(profileRes.data.horas_sono) : null,
          });
        }
      } catch {
        // Ignora silenciosamente erros em testes ou ambientes desconectados
      }
    }

    loadTelemetry();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const isDemo = Boolean(
    propIsDemo ||
      (typeof window !== 'undefined' &&
        new URLSearchParams(window.location?.search || '').get('demo') === '1')
  );

  const hasRealTelemetry = Boolean(
    propStressLevel != null ||
      propHrvValue != null ||
      propBlinkRate != null ||
      propBioScore != null ||
      telemetry.stressLevel != null ||
      telemetry.hrvValue != null ||
      telemetry.blinkRate != null ||
      telemetry.horasSono != null ||
      wellnessScore != null
  );

  const demoState =
    isDemo && !hasRealTelemetry
      ? {
          bioScore: 34,
          blinkRate: 14,
          horasSono: 5.5,
          stressLevel: 'high',
          hrvValue: 28,
        }
      : null;

  const effectiveStressLevel =
    propStressLevel ?? telemetry.stressLevel ?? demoState?.stressLevel ?? null;
  const effectiveHrv =
    propHrvValue ?? telemetry.hrvValue ?? demoState?.hrvValue ?? null;
  const effectiveBlinkRate =
    propBlinkRate ?? telemetry.blinkRate ?? demoState?.blinkRate ?? null;
  const effectiveBioScore =
    propBioScore !== undefined && propBioScore !== null
      ? propBioScore
      : wellnessScore !== undefined && wellnessScore !== null
      ? wellnessScore
      : demoState?.bioScore ?? null;
  const effectiveHorasSono =
    telemetry.horasSono ?? demoState?.horasSono ?? null;

  const readiness =
    effectiveHrv == null && effectiveStressLevel == null
      ? {
          state: 'unknown' as const,
          label: 'SEM DADOS' as const,
          headline: 'SEM SCAN — REALIZE O BIOSCORE',
          colorClass: 'text-muted-foreground',
          badgeClass: 'border-muted-foreground/30 bg-muted/40 text-muted-foreground',
        }
      : getReadinessStatus(effectiveHrv, effectiveStressLevel);

  const readinessTitle =
    readiness.state === 'go'
      ? 'GO - APTO PARA O TURNO'
      : readiness.state === 'caution'
      ? 'ATENÇÃO - VIGILÂNCIA'
      : readiness.state === 'nogo'
      ? 'NO-GO - FADIGA (NÃO APTO)'
      : 'SEM SCAN — REALIZE O BIOSCORE';

  const bioScoreDisplay = effectiveBioScore != null ? effectiveBioScore : '—';
  const blinkRateDisplay =
    effectiveBlinkRate != null ? roundBlinkRate(effectiveBlinkRate) : '—';
  const sleepDisplay =
    effectiveHorasSono !== null && effectiveHorasSono !== undefined
      ? `${effectiveHorasSono}h`
      : '—';

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 py-2">
      {/* NÍVEL 1: Semáforo de Prontidão */}
      <section
        role="status"
        aria-live="polite"
        className={`w-full rounded-2xl border-2 p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4 shadow-lg transition-colors ${
          readiness.state === 'go'
            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : readiness.state === 'caution'
            ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400'
            : readiness.state === 'nogo'
            ? 'border-destructive/60 bg-destructive/15 text-destructive'
            : 'border-muted-foreground/30 bg-muted/40 text-muted-foreground'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          {readiness.state === 'go' && (
            <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 shrink-0" aria-hidden="true" />
          )}
          {readiness.state === 'caution' && (
            <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 shrink-0" aria-hidden="true" />
          )}
          {readiness.state === 'nogo' && (
            <AlertOctagon className="h-12 w-12 sm:h-16 sm:w-16 shrink-0" aria-hidden="true" />
          )}
          {readiness.state === 'unknown' && (
            <HelpCircle className="h-12 w-12 sm:h-16 sm:w-16 shrink-0" aria-hidden="true" />
          )}
          <div className="flex flex-col items-center justify-center">
            {readiness.state === 'unknown' && (
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">
                SEM DADOS
              </span>
            )}
            <span
              className={`font-black font-display tracking-tight uppercase ${
                readiness.state === 'unknown'
                  ? 'text-2xl sm:text-3xl md:text-4xl'
                  : 'text-4xl sm:text-5xl md:text-6xl'
              }`}
            >
              {readinessTitle}
            </span>
          </div>
        </div>
      </section>

      {/* Alerta preditivo posicionado logo abaixo do semáforo quando status !== 'go' e !== 'unknown' */}
      {readiness.state !== 'go' && readiness.state !== 'unknown' && (
        <PredictiveAlert bioScore={effectiveBioScore} />
      )}

      {/* NÍVEL 2: 3 Números Apenas */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {/* 1. BioScore */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            BioScore
          </span>
          <span className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-foreground">
            {bioScoreDisplay}
          </span>
        </div>

        {/* 2. Piscadas/min */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Piscadas/min
          </span>
          <span className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-foreground">
            {blinkRateDisplay}
          </span>
        </div>

        {/* 3. Sono */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Sono
          </span>
          <span className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-foreground">
            {sleepDisplay}
          </span>
        </div>
      </div>

      {/* NÍVEL 3: Ação Única Primária */}
      <div className="flex flex-col items-center justify-center gap-3 pt-2">
        {readiness.state === 'unknown' ? (
          <Button
            size="lg"
            className="w-full sm:w-auto min-w-[280px] h-14 text-base sm:text-lg font-bold shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onNavigateTab?.('neuroscore')}
          >
            Realizar BioScore
          </Button>
        ) : readiness.state === 'go' ? (
          <Button
            size="lg"
            className="w-full sm:w-auto min-w-[280px] h-14 text-base sm:text-lg font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => onNavigateTab?.('checkin')}
          >
            Iniciar Turno
          </Button>
        ) : (
          <Button
            size="lg"
            variant="destructive"
            className="w-full sm:w-auto min-w-[280px] h-14 text-base sm:text-lg font-bold shadow-md"
            onClick={() => (onStartProtocol ? onStartProtocol() : onNavigateTab?.('neurocoach'))}
          >
            Iniciar Protocolo 4-7-8
          </Button>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {readiness.state !== 'unknown' && (
            <Button
              variant="link"
              className="text-xs text-muted-foreground hover:text-foreground h-auto p-0 underline-offset-4"
              onClick={() => onNavigateTab?.('neuroscore')}
            >
              Atualizar scan
            </Button>
          )}
          {isDemo && (
            <Badge
              variant="outline"
              className="text-[10px] font-mono uppercase tracking-wider border-amber-500/40 text-amber-500"
            >
              DEMO
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
