import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, AlertOctagon, RotateCcw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PredictiveAlert from '@/components/PredictiveAlert';
import { roundBlinkRate } from '@/lib/biometricDisplay';
import { useGuestDemoReadiness } from '@/hooks/useReadiness';
import { useI18n } from '@/i18n';
import LanguageToggle from '@/components/LanguageToggle';
import { DemoEventLog } from '@/lib/demoScenario';
import {
  appendEvent,
  registerCountermeasureProtocol,
} from '@/lib/missionEvents';

function getLocalizedLog(
  log: DemoEventLog,
  t: (key: string, vars?: Record<string, string | number>) => string,
  readiness: { bioScore: number | null; hrvValue: number | null }
): { time: string; message: string } {
  if (log.id === 'demo-log-1') {
    const scoreMatch = log.message.match(/BioScore\s+(\d+)/);
    const score = scoreMatch ? Number(scoreMatch[1]) : 34;
    return {
      time: t('demo.log.1.time'),
      message: t('demo.log.1.message', { score }),
    };
  }
  if (log.id === 'demo-log-2') {
    return {
      time: t('demo.log.2.time'),
      message: t('demo.log.2.message'),
    };
  }
  if (log.id === 'demo-log-3') {
    const scoreMatch = log.message.match(/BioScore\s+(\d+)/);
    const hrvMatch = log.message.match(/HRV\s+(\d+)/);
    const score = scoreMatch ? Number(scoreMatch[1]) : (readiness.bioScore ?? 72);
    const hrv = hrvMatch ? Number(hrvMatch[1]) : (readiness.hrvValue ?? 62);
    return {
      time: t('demo.log.3.time'),
      message: t('demo.log.3.message', { score, hrv }),
    };
  }
  return {
    time: log.timeRelative,
    message: log.message,
  };
}

export default function Demo() {
  const { t } = useI18n();
  const readiness = useGuestDemoReadiness();
  const [noticeKey, setNoticeKey] = useState<'countermeasure' | 'shiftStarted' | null>(null);

  const handleStartProtocol = () => {
    appendEvent({
      type: 'protocol',
      label: 'Ação: Contramedida executada (Respiração 4-7-8)',
      title: 'Contramedida executada',
    });
    registerCountermeasureProtocol({ breathing: true });
    setNoticeKey('countermeasure');
  };

  const handleReset = () => {
    setNoticeKey(null);
    readiness.resetDemo();
  };

  const handleSimulateScan = () => {
    setNoticeKey(null);
    readiness.simulateScan();
  };

  const readinessTitle =
    readiness.state === 'go'
      ? t('demo.status.go')
      : readiness.state === 'caution'
      ? t('demo.status.caution')
      : readiness.state === 'nogo'
      ? t('demo.status.nogo')
      : t('demo.status.unknown');

  const bioScoreDisplay = readiness.bioScore != null ? readiness.bioScore : '—';
  const blinkRateDisplay =
    readiness.blinkRate != null ? roundBlinkRate(readiness.blinkRate) : '—';
  const sleepDisplay =
    readiness.horasSono != null
      ? t('demo.format.sleep', { hours: readiness.horasSono })
      : '—';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Barra Superior Fixa com Selo e Controles */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-card/80 backdrop-blur-md px-3 sm:px-6 py-2.5">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span
              data-testid="demo-fixed-seal"
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold tracking-wide uppercase border border-amber-500/60 bg-amber-500/15 text-amber-700 dark:text-amber-300"
            >
              {t('demo.seal')}
            </span>
            {readiness.stageBadge && (
              <Badge variant="outline" className="font-mono text-[11px] h-6">
                {readiness.stageBadge}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <LanguageToggle />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSimulateScan}
              className="min-h-[44px] text-xs font-medium"
            >
              <Play className="h-3.5 w-3.5 mr-1.5 shrink-0" aria-hidden="true" />
              {t('demo.btn.simulateScan')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="min-h-[44px] text-xs font-medium"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5 shrink-0" aria-hidden="true" />
              {t('demo.btn.reset')}
            </Button>
            <Link
              to="/auth"
              className="min-h-[44px] inline-flex items-center text-xs text-muted-foreground hover:text-foreground px-2 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('demo.link.signIn')}
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal do Cockpit */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Aviso de Contramedida Executada Localmente */}
        {noticeKey && (
          <div
            role="status"
            className="rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-4 py-3 text-xs sm:text-sm text-cyan-700 dark:text-cyan-300 flex items-center justify-between"
          >
            <span>{t(`demo.notice.${noticeKey}`)}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setNoticeKey(null)}
            >
              {t('demo.btn.close')}
            </Button>
          </div>
        )}

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
            <div className="flex flex-col items-center justify-center">
              <span className="font-black font-display tracking-tight uppercase text-3xl sm:text-5xl md:text-6xl">
                {readinessTitle}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {t('demo.verdictSubtitle')}
              </span>
            </div>
          </div>
        </section>

        {/* Alerta Preditivo posicionado abaixo do semáforo quando status !== 'go' */}
        {readiness.state !== 'go' && readiness.state !== 'unknown' && (
          <PredictiveAlert bioScore={readiness.bioScore ?? undefined} />
        )}

        {/* NÍVEL 2: 3 Números Principais */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {/* 1. BioScore */}
          <div className="rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {t('demo.metric.bioScore')}
            </span>
            <span className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-foreground">
              {bioScoreDisplay}
            </span>
          </div>

          {/* 2. Piscadas/min */}
          <div className="rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {t('demo.metric.blinkRate')}
            </span>
            <span className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-foreground">
              {blinkRateDisplay}
            </span>
          </div>

          {/* 3. Sono */}
          <div className="rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {t('demo.metric.sleep')}
            </span>
            <span className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-foreground">
              {sleepDisplay}
            </span>
          </div>
        </div>

        {/* NÍVEL 3: Ação Primária */}
        <div className="flex flex-col items-center justify-center gap-3 pt-2">
          {readiness.state === 'go' ? (
            <Button
              size="lg"
              className="w-full sm:w-auto min-w-[280px] h-14 min-h-[44px] text-base sm:text-lg font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                appendEvent({
                  type: 'assessment',
                  label: 'Turno iniciado com prontidão nominal',
                  title: 'Turno iniciado',
                });
                setNoticeKey('shiftStarted');
              }}
            >
              {t('demo.btn.startShift')}
            </Button>
          ) : readiness.state === 'caution' ? (
            <Button
              size="lg"
              className="w-full sm:w-auto min-w-[280px] h-14 min-h-[44px] text-base sm:text-lg font-bold shadow-md bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleSimulateScan}
            >
              {t('demo.btn.simulateScan')}
            </Button>
          ) : (
            <Button
              size="lg"
              variant="destructive"
              className="w-full sm:w-auto min-w-[280px] h-14 min-h-[44px] text-base sm:text-lg font-bold shadow-md"
              onClick={handleStartProtocol}
            >
              {t('demo.btn.startProtocol')}
            </Button>
          )}
        </div>

        {/* NÍVEL 4: Log de Eventos Recentes */}
        <div className="w-full bg-card/40 border border-border/60 rounded-xl p-4 font-mono text-xs space-y-1.5">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold font-mono tracking-wider text-muted-foreground uppercase">
              {t('demo.log.title')}
            </span>
            <Badge
              variant="outline"
              data-testid="demo-badge-log"
              className="text-[10px] font-mono border-amber-500/40 text-amber-700 dark:text-amber-300"
            >
              {t('demo.log.badge')}
            </Badge>
          </div>
          {readiness.logs.map((log) => {
            const item = getLocalizedLog(log, t, readiness);
            return (
              <p key={log.id} className={log.colorClass}>
                {item.time} — {item.message}
              </p>
            );
          })}
        </div>
      </main>
    </div>
  );
}
