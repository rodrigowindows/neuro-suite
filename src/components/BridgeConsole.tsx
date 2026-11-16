import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PredictiveAlert from '@/components/PredictiveAlert';
import { roundBlinkRate } from '@/lib/biometricDisplay';
import { useReadiness } from '@/hooks/useReadiness';
import { useI18n } from '@/i18n';
import {
  getRecentEvents,
  formatEventDate,
  MissionEvent,
  MissionEventType,
  MISSION_EVENT_ADDED_EVENT,
} from '@/lib/missionEvents';
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
  const { lang, t } = useI18n();
  const readiness = useReadiness({
    stressLevel: propStressLevel,
    hrvValue: propHrvValue,
    blinkRate: propBlinkRate,
    bioScore: propBioScore,
    isDemo: propIsDemo,
  });

  const [recentEvents, setRecentEvents] = useState<MissionEvent[]>(() =>
    typeof window !== 'undefined' ? getRecentEvents(3) : []
  );

  useEffect(() => {
    const syncEvents = () => {
      setRecentEvents(getRecentEvents(3));
    };
    syncEvents();
    if (typeof window === 'undefined') return;

    window.addEventListener(MISSION_EVENT_ADDED_EVENT, syncEvents);
    window.addEventListener('storage', syncEvents);
    return () => {
      window.removeEventListener(MISSION_EVENT_ADDED_EVENT, syncEvents);
      window.removeEventListener('storage', syncEvents);
    };
  }, []);

  const getEventColorClass = (type: MissionEventType) => {
    switch (type) {
      case 'scan':
        return 'text-amber-600 dark:text-amber-400';
      case 'protocol':
        return 'text-cyan-600 dark:text-cyan-400';
      case 'assessment':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'perceived_fatigue':
        return 'text-violet-600 dark:text-violet-400';
      default:
        return 'text-foreground/90';
    }
  };

  const formatEventTime = (at?: string | number | Date) => {
    if (lang === 'pt') {
      return formatEventDate(at);
    }
    if (!at) return t('cockpit.log.today');
    const d = new Date(at);
    if (isNaN(d.getTime())) return String(at);
    const now = new Date();
    const startOfDay = (date: Date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const dayDiff = Math.round((startOfDay(now) - startOfDay(d)) / (24 * 60 * 60 * 1000));
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    if (dayDiff === 0) return `${t('cockpit.log.today')}, ${timeStr}`;
    if (dayDiff === 1) return `${t('cockpit.log.yesterday')}, ${timeStr}`;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${month}/${day}, ${timeStr}`;
  };

  const readinessTitle =
    readiness.state === 'go'
      ? t('cockpit.readiness.go')
      : readiness.state === 'caution'
      ? t('cockpit.readiness.caution')
      : readiness.state === 'nogo'
      ? readiness.hasProtocolToday && !readiness.isDemo
        ? t('cockpit.readiness.nogoProtocol')
        : t('cockpit.readiness.nogo')
      : t('cockpit.readiness.unknown');

  const bioScoreDisplay = readiness.bioScore != null ? readiness.bioScore : '—';
  const blinkRateDisplay =
    readiness.blinkRate != null ? roundBlinkRate(readiness.blinkRate) : '—';
  const sleepDisplay =
    readiness.horasSono !== null && readiness.horasSono !== undefined
      ? t('cockpit.format.sleep', { hours: readiness.horasSono })
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
            : 'border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-300'
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
            <span
              className={`font-black font-display tracking-tight uppercase ${
                readiness.state === 'unknown'
                  ? 'text-2xl sm:text-3xl md:text-4xl'
                  : 'text-4xl sm:text-5xl md:text-6xl'
              }`}
            >
              {readinessTitle}
            </span>
            {readiness.state === 'unknown' && (
              <span className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
                {t('cockpit.headline.unknown')}
              </span>
            )}
            {readiness.state !== 'unknown' && (
              <span className="text-[11px] text-muted-foreground mt-1">
                {t('cockpit.verdictSubtitle')}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Alerta preditivo posicionado logo abaixo do semáforo quando status !== 'go' e !== 'unknown' */}
      {readiness.state !== 'go' && readiness.state !== 'unknown' && (
        <PredictiveAlert bioScore={readiness.bioScore} />
      )}

      {/* NÍVEL 2: 3 Números Apenas */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {/* 1. BioScore */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {t('cockpit.metric.bioScore')}
          </span>
          <span className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-foreground">
            {bioScoreDisplay}
          </span>
        </div>

        {/* 2. Piscadas/min */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {t('cockpit.metric.blinkRate')}
          </span>
          <span className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-foreground">
            {blinkRateDisplay}
          </span>
        </div>

        {/* 3. Sono */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {t('cockpit.metric.sleep')}
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
            {t('cockpit.action.startScan')}
          </Button>
        ) : readiness.state === 'go' ? (
          <Button
            size="lg"
            className="w-full sm:w-auto min-w-[280px] h-14 text-base sm:text-lg font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => onNavigateTab?.('checkin')}
          >
            {t('cockpit.action.startShift')}
          </Button>
        ) : readiness.state === 'nogo' && readiness.hasProtocolToday && !readiness.isDemo ? (
          <Button
            size="lg"
            className="w-full sm:w-auto min-w-[280px] h-14 text-base sm:text-lg font-bold shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onNavigateTab?.('neuroscore')}
          >
            {t('cockpit.action.reevaluate')}
          </Button>
        ) : (
          <Button
            size="lg"
            variant="destructive"
            className="w-full sm:w-auto min-w-[280px] h-14 text-base sm:text-lg font-bold shadow-md"
            onClick={() => (onStartProtocol ? onStartProtocol() : onNavigateTab?.('neurocoach'))}
          >
            {t('cockpit.action.startProtocol')}
          </Button>
        )}
      </div>

      {/* Log de Eventos Recentes */}
      {(recentEvents.length > 0 || readiness.isDemo) && (
        <div className="w-full bg-card/40 border border-border/60 rounded-xl p-4 font-mono text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono tracking-wider text-muted-foreground uppercase">
              {t('cockpit.log.title')}
            </span>
            {recentEvents.length === 0 && readiness.isDemo && (
              <Badge
                variant="outline"
                data-testid="demo-badge-log"
                className="text-[10px] font-mono border-amber-500/40 text-amber-700 dark:text-amber-300"
              >
                {t('cockpit.log.badge')}
              </Badge>
            )}
          </div>
          {recentEvents.length > 0 ? (
            recentEvents.map((evt) => (
              <p key={evt.id} className={getEventColorClass(evt.type)}>
                [{formatEventTime(evt.at)}] — {evt.label}
              </p>
            ))
          ) : (
            <>
              <p className="text-amber-600 dark:text-amber-400">
                {t('cockpit.log.demo1.time')} — {t('cockpit.log.demo1.msg')}
              </p>
              <p className="text-cyan-600 dark:text-cyan-400">
                {t('cockpit.log.demo2.time')} — {t('cockpit.log.demo2.msg')}
              </p>
              <p className="text-emerald-600 dark:text-emerald-400">
                {t('cockpit.log.demo3.time')} — {t('cockpit.log.demo3.msg')}
              </p>
            </>
          )}
        </div>
      )}

      {/* Rodapé */}
      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
        {readiness.state !== 'unknown' && (
          <Button
            variant="link"
            className="text-xs text-muted-foreground hover:text-foreground h-auto p-0 underline-offset-4 min-h-[44px] px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => onNavigateTab?.('neuroscore')}
          >
            {t('cockpit.action.updateScan')}
          </Button>
        )}
        {readiness.isDemo && (
          <>
            {readiness.demoStage === 2 && (
              <Button
                variant="outline"
                className="text-xs min-h-[44px]"
                onClick={() => readiness.simulateScan()}
              >
                {t('cockpit.action.simulateScan')}
              </Button>
            )}
            <Badge
              variant="outline"
              className="text-[10px] font-mono uppercase tracking-wider border-amber-500/40 text-amber-700 dark:text-amber-300"
            >
              {t('cockpit.log.badge')}
            </Badge>
          </>
        )}
      </div>
    </div>
  );
}
