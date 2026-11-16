import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Wind, Droplets, Moon, CheckCircle2, RotateCcw, ShieldCheck, Clock, Download, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { registerCountermeasureProtocol, appendEvent } from '@/lib/missionEvents';
import { useConnectionMode } from '@/hooks/useConnectionMode';
import { useI18n } from '@/i18n';

interface NeuroCoachProps {
  stressLevel?: string;
  onNavigateTab?: (tab: string) => void;
  autoStartBreathing?: boolean;
}

interface CountermeasureState {
  breathing: boolean;
  hydration: boolean;
  rest: boolean;
}

export default function NeuroCoach({
  stressLevel: _stressLevel,
  onNavigateTab: _onNavigateTab,
  autoStartBreathing = false,
}: NeuroCoachProps) {
  const { isAutonomous } = useConnectionMode();
  const { lang, t } = useI18n();
  const todayKey = `crewvitals_countermeasures_${new Date().toISOString().split('T')[0]}`;

  const [countermeasures, setCountermeasures] = useState<CountermeasureState>(() => {
    try {
      const saved = localStorage.getItem(todayKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { breathing: false, hydration: false, rest: false };
  });

  const [timerActive, setTimerActive] = useState(autoStartBreathing);
  const [secondsRemaining, setSecondsRemaining] = useState(180); // 3 minutes
  const [isOverlayOpen, setIsOverlayOpen] = useState(autoStartBreathing);

  useEffect(() => {
    if (autoStartBreathing) {
      setIsOverlayOpen(true);
      setTimerActive(true);
    }
  }, [autoStartBreathing]);

  useEffect(() => {
    try {
      localStorage.setItem(todayKey, JSON.stringify(countermeasures));
    } catch {
      // ignore
    }
  }, [countermeasures, todayKey]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOverlayOpen) {
        setIsOverlayOpen(false);
        setTimerActive(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOverlayOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && timerActive) {
      setTimerActive(false);
      setIsOverlayOpen(false);
      setCountermeasures((prev) => ({ ...prev, breathing: true }));
      toast.success(t('coach.toast.breathingComplete'));
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, secondsRemaining, t]);

  const toggleItem = (key: keyof CountermeasureState) => {
    setCountermeasures((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      return updated;
    });
  };

  const handleStartBreathing = () => {
    if (secondsRemaining === 0) {
      setSecondsRemaining(180);
    }
    setTimerActive(true);
    setIsOverlayOpen(true);
  };

  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
    setTimerActive(false);
  };

  const completedCount = Number(countermeasures.breathing) + Number(countermeasures.hydration) + Number(countermeasures.rest);
  const progressPercent = Math.round((completedCount / 3) * 100);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const elapsed = 180 - secondsRemaining;
  const cycleTime = elapsed % 19;
  const cycleNumber = Math.min(Math.floor(elapsed / 19) + 1, 10);

  let phase = 1;
  let phaseText = t('coach.breathing.phase1.title');
  let phaseDescription = t('coach.breathing.phase1.desc');
  let phaseSecondsLeft = 4 - cycleTime;

  if (cycleTime < 4) {
    phase = 1;
    phaseText = t('coach.breathing.phase1.title');
    phaseDescription = t('coach.breathing.phase1.desc');
    phaseSecondsLeft = 4 - cycleTime;
  } else if (cycleTime < 11) {
    phase = 2;
    phaseText = t('coach.breathing.phase2.title');
    phaseDescription = t('coach.breathing.phase2.desc');
    phaseSecondsLeft = 11 - cycleTime;
  } else {
    phase = 3;
    phaseText = t('coach.breathing.phase3.title');
    phaseDescription = t('coach.breathing.phase3.desc');
    phaseSecondsLeft = 19 - cycleTime;
  }

  const handleRegister = () => {
    if (completedCount === 0) {
      toast.error(t('coach.toast.selectAtLeastOne'));
      return;
    }
    registerCountermeasureProtocol(countermeasures);

    const activeItems: string[] = [];
    if (countermeasures.breathing) activeItems.push('Respiração 4-7-8');
    if (countermeasures.hydration) activeItems.push('Hidratação');
    if (countermeasures.rest) activeItems.push('Descanso');
    const detail = activeItems.length > 0 ? activeItems.join(', ') : 'Protocolo 4-7-8';

    appendEvent({
      type: 'protocol',
      label: `Contramedida registrada (${detail})`,
    });

    toast.success(t('coach.toast.protocolRegistered'));
  };

  const handleReset = () => {
    setCountermeasures({ breathing: false, hydration: false, rest: false });
    setTimerActive(false);
    setSecondsRemaining(180);
    setIsOverlayOpen(false);
    toast.info(t('coach.toast.checklistReset'));
  };

  const handleExport = () => {
    const dateFormatted = new Date().toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US');
    const checked1 = countermeasures.breathing ? 'X' : ' ';
    const checked2 = countermeasures.hydration ? 'X' : ' ';
    const checked3 = countermeasures.rest ? 'X' : ' ';

    const content = `${t('coach.export.title')}
${t('coach.export.date', { date: dateFormatted })}

${t('coach.export.status')}
${t('coach.export.guidelines')}

${t('coach.export.prescriptionsHeader')}
${t('coach.export.action1', { checked: checked1 })}
${t('coach.export.action2', { checked: checked2 })}
${t('coach.export.action3', { checked: checked3 })}

${t('coach.export.progress', { percent: progressPercent, completed: completedCount, total: 3 })}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = t('coach.export.filename');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('coach.toast.planDownloaded'));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & DSS Title */}
      <Card className="border-primary/20 shadow-soft">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-display flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                {t('coach.title')}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                {t('coach.dssSubtitle')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs px-2.5 py-1">
                {t('coach.badge.nasaHrp')}
              </Badge>
              {isAutonomous && (
                <Badge variant="secondary" className="text-xs px-2.5 py-1 text-amber-600 dark:text-amber-300 border-amber-500/30">
                  {t('coach.badge.autonomous')}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Alert Banner */}
          <div role="alert" className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 dark:bg-red-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-500/20 text-red-500 flex-shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-500 text-base sm:text-lg">
                    {t('coach.status.fatigueDetected')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('coach.status.fatigueDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleStartBreathing}
                className="font-semibold text-xs whitespace-nowrap shadow-sm"
              >
                {t('coach.btn.executeMitigation')}
              </Button>
              <Badge className="bg-red-500 hover:bg-red-600 text-white font-semibold whitespace-nowrap hidden sm:inline-flex">
                {t('coach.badge.highPriority')}
              </Badge>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">
                {t('coach.progress.label', { completed: completedCount, total: 3 })}
              </span>
              <span className="font-bold text-primary">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2.5" />
          </div>
        </CardContent>
      </Card>

      {/* Prescription Checklist */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground px-1">
          {t('coach.section.prescriptions')}
        </h3>

        {/* Action 1: Respiration */}
        <Card className={`transition-all duration-200 ${countermeasures.breathing ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border/60 hover:border-primary/40'}`}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <Checkbox
                id="action-breathing"
                checked={countermeasures.breathing}
                onCheckedChange={() => toggleItem('breathing')}
                className="mt-1 h-5 w-5"
              />
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="action-breathing" className="font-semibold text-sm sm:text-base cursor-pointer">
                    {t('coach.action1.title')}
                  </label>
                  <Badge variant="secondary" className="text-[11px] gap-1">
                    <Wind className="h-3 w-3 text-primary" />
                    {t('coach.action1.badge')}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('coach.action1.desc')}
                </p>

                {/* Respiration Mini Timer */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Button
                    size="sm"
                    variant={timerActive ? 'destructive' : 'outline'}
                    onClick={() => {
                      if (timerActive) {
                        setTimerActive(false);
                      } else {
                        handleStartBreathing();
                      }
                    }}
                    className="text-xs gap-1.5"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {timerActive ? t('coach.timer.pause') : secondsRemaining < 180 ? t('coach.timer.resume') : t('coach.timer.start')}
                  </Button>
                  <span
                    className="text-xs font-mono font-bold px-2.5 py-1 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                    data-testid="timer-display"
                    onClick={handleStartBreathing}
                    role="button"
                    aria-label={t('coach.timer.openAria')}
                  >
                    {formatTimer(secondsRemaining)}
                  </span>
                  {secondsRemaining < 180 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setTimerActive(false);
                        setSecondsRemaining(180);
                      }}
                      className="text-xs text-muted-foreground h-8 px-2"
                    >
                      {t('coach.timer.reset')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action 2: Hydration */}
        <Card className={`transition-all duration-200 ${countermeasures.hydration ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border/60 hover:border-primary/40'}`}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <Checkbox
                id="action-hydration"
                checked={countermeasures.hydration}
                onCheckedChange={() => toggleItem('hydration')}
                className="mt-1 h-5 w-5"
              />
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="action-hydration" className="font-semibold text-sm sm:text-base cursor-pointer">
                    {t('coach.action2.title')}
                  </label>
                  <Badge variant="secondary" className="text-[11px] gap-1">
                    <Droplets className="h-3 w-3 text-sky-500" />
                    {t('coach.action2.badge')}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('coach.action2.desc')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action 3: Rest */}
        <Card className={`transition-all duration-200 ${countermeasures.rest ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border/60 hover:border-primary/40'}`}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <Checkbox
                id="action-rest"
                checked={countermeasures.rest}
                onCheckedChange={() => toggleItem('rest')}
                className="mt-1 h-5 w-5"
              />
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="action-rest" className="font-semibold text-sm sm:text-base cursor-pointer">
                    {t('coach.action3.title')}
                  </label>
                  <Badge variant="secondary" className="text-[11px] gap-1">
                    <Moon className="h-3 w-3 text-indigo-400" />
                    {t('coach.action3.badge')}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('coach.action3.desc')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs text-muted-foreground">
          <RotateCcw className="h-3.5 w-3.5" />
          {t('coach.btn.resetChecklist')}
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            {t('coach.btn.exportPlan')}
          </Button>
          <Button onClick={handleRegister} className="gap-2 shadow-medium">
            <CheckCircle2 className="h-4 w-4" />
            {t('coach.btn.registerExecution')}
          </Button>
        </div>
      </div>

      {/* Immersive 4-7-8 Breathing Overlay (Night Space Cockpit Style) */}
      {isOverlayOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl text-slate-100 flex flex-col justify-between p-4 sm:p-8 md:p-10 select-none overflow-y-auto animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
          aria-label={t('coach.overlay.ariaLabel')}
          data-testid="breathing-overlay"
        >
          {/* Background HUD Cockpit Grid / Accent Lines */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950 to-black opacity-80" />
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Space Cockpit HUD Header */}
          <div className="relative z-10 w-full max-w-4xl mx-auto flex items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-mono text-[10px] tracking-wider uppercase">
                  {t('coach.overlay.cockpitBadge')}
                </Badge>
                <span className="text-[10px] font-mono text-slate-400">
                  CREWVITALS HUD // SYS.RESP.478
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
                {t('coach.overlay.title')}
              </h1>
              <p className="text-xs text-slate-400">
                {t('coach.overlay.guidelines')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseOverlay}
              className="text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-full h-9 w-9 flex-shrink-0"
              aria-label={t('coach.overlay.closeAria')}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Central Animated Breathing Area */}
          <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center justify-center my-auto py-6 sm:py-8 space-y-6 sm:space-y-8">
            {/* Pulsating & Transitioning Breathing Circle */}
            <div className="relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80">
              {/* Ambient glow background ring */}
              <div
                className={`absolute inset-4 rounded-full blur-3xl transition-all duration-1000 ${
                  phase === 1
                    ? 'bg-cyan-500/25'
                    : phase === 2
                    ? 'bg-indigo-500/30'
                    : 'bg-emerald-500/25'
                }`}
              />

              {/* Outer orbital telemetry guides */}
              <div className="absolute inset-0 rounded-full border border-dashed border-slate-700/60 pointer-events-none" />
              <div className="absolute inset-4 rounded-full border border-slate-800 pointer-events-none" />

              {/* Main Breathing Circle */}
              <motion.div
                data-testid="breathing-circle"
                className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center text-center p-6 border-2 transition-colors duration-700 ${
                  phase === 1
                    ? 'border-cyan-400/80 bg-cyan-950/40 shadow-[0_0_60px_rgba(34,211,238,0.35)]'
                    : phase === 2
                    ? 'border-indigo-400/80 bg-indigo-950/40 shadow-[0_0_70px_rgba(129,140,248,0.45)]'
                    : 'border-emerald-400/80 bg-emerald-950/40 shadow-[0_0_60px_rgba(52,211,153,0.35)]'
                }`}
                animate={{
                  scale:
                    phase === 1
                      ? 1.35
                      : phase === 2
                      ? [1.35, 1.39, 1.34, 1.38, 1.35]
                      : 0.95,
                }}
                transition={{
                  scale:
                    phase === 1
                      ? { duration: 4, ease: 'easeInOut' }
                      : phase === 2
                      ? { duration: 7, ease: 'easeInOut', repeat: Infinity }
                      : { duration: 8, ease: 'easeInOut' },
                }}
              >
                <Wind
                  className={`h-8 w-8 mb-1.5 transition-colors duration-500 ${
                    phase === 1
                      ? 'text-cyan-300'
                      : phase === 2
                      ? 'text-indigo-300'
                      : 'text-emerald-300'
                  }`}
                />
                <span className="font-mono text-4xl font-extrabold tracking-tight text-white drop-shadow">
                  {phaseSecondsLeft}s
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-300 mt-1">
                  {t('coach.overlay.phaseIndicator', { phase })}
                </span>
              </motion.div>
            </div>

            {/* Phase Guidance Text */}
            <div className="text-center space-y-2 max-w-md px-4">
              <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white drop-shadow-sm">
                {phaseText}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed min-h-[40px] flex items-center justify-center">
                {phaseDescription}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <Badge variant="outline" className="border-slate-800 bg-slate-900/70 text-slate-300 font-mono text-[11px]">
                  {t('coach.overlay.cycleBadge', { cycle: cycleNumber })}
                </Badge>
                <Badge variant="outline" className="border-slate-800 bg-slate-900/70 text-slate-300 font-mono text-[11px]">
                  {t('coach.overlay.rhythmBadge')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Space Cockpit HUD Footer with 3-minute Countdown & Cancel/Close button */}
          <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/85 border border-slate-800/80 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Clock className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] tracking-wider uppercase text-slate-400 font-mono">
                  {t('coach.overlay.countdownLabel')}
                </div>
                <div
                  className="font-mono text-2xl font-bold text-white tracking-wider"
                  data-testid="overlay-countdown"
                >
                  {formatTimer(secondsRemaining)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                onClick={handleCloseOverlay}
                className="border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold w-full sm:w-auto"
              >
                {t('coach.overlay.cancelClose')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
