import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, AlertOctagon, RotateCcw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PredictiveAlert from '@/components/PredictiveAlert';
import { roundBlinkRate } from '@/lib/biometricDisplay';
import { useReadiness } from '@/hooks/useReadiness';
import {
  appendEvent,
  registerCountermeasureProtocol,
} from '@/lib/missionEvents';

export default function Demo() {
  const readiness = useReadiness({ guestDemo: true });
  const [protocolNotice, setProtocolNotice] = useState<string | null>(null);

  const handleStartProtocol = () => {
    appendEvent({
      type: 'protocol',
      label: 'Ação: Contramedida executada (Respiração 4-7-8)',
      title: 'Contramedida executada',
    });
    registerCountermeasureProtocol({ breathing: true });
    setProtocolNotice('Contramedida local executada: 3 ciclos de respiração 4-7-8 concluídos.');
  };

  const handleReset = () => {
    setProtocolNotice(null);
    readiness.resetDemo();
  };

  const handleSimulateScan = () => {
    setProtocolNotice(null);
    readiness.simulateScan();
  };

  const readinessTitle =
    readiness.state === 'go'
      ? 'GO - APTO PARA O TURNO'
      : readiness.state === 'caution'
      ? 'ATENÇÃO - VIGILÂNCIA'
      : readiness.state === 'nogo'
      ? 'NO-GO - FADIGA (NÃO APTO)'
      : 'AGUARDANDO SCAN';

  const bioScoreDisplay = readiness.bioScore != null ? readiness.bioScore : '—';
  const blinkRateDisplay =
    readiness.blinkRate != null ? roundBlinkRate(readiness.blinkRate) : '—';
  const sleepDisplay =
    readiness.horasSono != null ? `${readiness.horasSono}h` : '—';

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
              DEMO: dados simulados
            </span>
            {readiness.stageBadge && (
              <Badge variant="outline" className="font-mono text-[11px] h-6">
                {readiness.stageBadge}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSimulateScan}
              className="min-h-[44px] text-xs font-medium"
            >
              <Play className="h-3.5 w-3.5 mr-1.5 shrink-0" aria-hidden="true" />
              Simular novo scan
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="min-h-[44px] text-xs font-medium"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5 shrink-0" aria-hidden="true" />
              Reiniciar demonstração
            </Button>
            <Link
              to="/auth"
              className="min-h-[44px] inline-flex items-center text-xs text-muted-foreground hover:text-foreground px-2 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal do Cockpit */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Aviso de Contramedida Executada Localmente */}
        {protocolNotice && (
          <div
            role="status"
            className="rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-4 py-3 text-xs sm:text-sm text-cyan-700 dark:text-cyan-300 flex items-center justify-between"
          >
            <span>{protocolNotice}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setProtocolNotice(null)}
            >
              Fechar
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
                veredito baseado em estresse e HRV
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
                setProtocolNotice('Turno operacional iniciado com sucesso.');
              }}
            >
              Iniciar Turno
            </Button>
          ) : readiness.state === 'caution' ? (
            <Button
              size="lg"
              className="w-full sm:w-auto min-w-[280px] h-14 min-h-[44px] text-base sm:text-lg font-bold shadow-md bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleSimulateScan}
            >
              Simular novo scan
            </Button>
          ) : (
            <Button
              size="lg"
              variant="destructive"
              className="w-full sm:w-auto min-w-[280px] h-14 min-h-[44px] text-base sm:text-lg font-bold shadow-md"
              onClick={handleStartProtocol}
            >
              Iniciar Protocolo 4-7-8
            </Button>
          )}
        </div>

        {/* NÍVEL 4: Log de Eventos Recentes */}
        <div className="w-full bg-card/40 border border-border/60 rounded-xl p-4 font-mono text-xs space-y-1.5">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold font-mono tracking-wider text-muted-foreground uppercase">
              LOG DE EVENTOS RECENTES
            </span>
            <Badge
              variant="outline"
              data-testid="demo-badge-log"
              className="text-[10px] font-mono border-amber-500/40 text-amber-700 dark:text-amber-300"
            >
              DEMO
            </Badge>
          </div>
          {readiness.logs.map((log) => (
            <p key={log.id} className={log.colorClass}>
              {log.timeRelative} — {log.message}
            </p>
          ))}
        </div>
      </main>
    </div>
  );
}
