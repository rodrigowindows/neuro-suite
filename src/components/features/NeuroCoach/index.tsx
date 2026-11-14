import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Wind, Droplets, Moon, CheckCircle2, RotateCcw, ShieldCheck, Clock, Download } from 'lucide-react';
import { toast } from 'sonner';

interface NeuroCoachProps {
  stressLevel?: string;
  onNavigateTab?: (tab: string) => void;
}

interface CountermeasureState {
  breathing: boolean;
  hydration: boolean;
  rest: boolean;
}

export default function NeuroCoach({ stressLevel }: NeuroCoachProps) {
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

  const [timerActive, setTimerActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(180); // 3 minutes

  useEffect(() => {
    try {
      localStorage.setItem(todayKey, JSON.stringify(countermeasures));
    } catch {
      // ignore
    }
  }, [countermeasures, todayKey]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && timerActive) {
      setTimerActive(false);
      setCountermeasures((prev) => ({ ...prev, breathing: true }));
      toast.success('Ciclo de respiração 4-7-8 concluído! Ação 1 marcada.');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, secondsRemaining]);

  const toggleItem = (key: keyof CountermeasureState) => {
    setCountermeasures((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      return updated;
    });
  };

  const completedCount = Number(countermeasures.breathing) + Number(countermeasures.hydration) + Number(countermeasures.rest);
  const progressPercent = Math.round((completedCount / 3) * 100);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleRegister = () => {
    toast.success('Contramedidas registradas com sucesso no diário de bordo!');
  };

  const handleReset = () => {
    setCountermeasures({ breathing: false, hydration: false, rest: false });
    setTimerActive(false);
    setSecondsRemaining(180);
    toast.info('Checklist reiniciado para este turno.');
  };

  const handleExport = () => {
    const content = `PLANO OPERACIONAL DE CONTRAMEDIDAS - CREWVITALS
Data: ${new Date().toLocaleDateString('pt-BR')}

Status: Fadiga Detectada
Diretrizes: NASA HRP / Harvard Medical School

Contramedidas Prescritas:
1. [${countermeasures.breathing ? 'X' : ' '}] Respiração: Ciclo 4-7-8 por 3 minutos.
2. [${countermeasures.hydration ? 'X' : ' '}] Hidratação: Ingestão de 500ml de água.
3. [${countermeasures.rest ? 'X' : ' '}] Descanso: Ciclo de sono de 90 min (REM/NREM).

Progresso: ${progressPercent}% (${completedCount} de 3 contramedidas executadas).
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plano-crewvitals.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Plano operacional baixado com sucesso!');
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
                AstroAssist — Prescrição de Contramedidas
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Sistema de Suporte à Decisão (DSS) para Mitigação de Carga e Fadiga Operacional
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs px-2.5 py-1">
              Diretrizes NASA HRP
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Alert Banner */}
          <div role="alert" className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 dark:bg-red-950/20 flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-500/20 text-red-500 flex-shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-500 text-base sm:text-lg">Status: Fadiga Detectada.</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Risco de lapso atencional e degradação de prontidão. Execute as contramedidas prescritas abaixo.
                </p>
              </div>
            </div>
            <Badge className="bg-red-500 hover:bg-red-600 text-white font-semibold whitespace-nowrap">
              Prioridade Alta
            </Badge>
          </div>

          {/* Progress Tracker */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">
                Progresso das Contramedidas: {completedCount} de 3 executadas
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
          Prescrições Operacionais Obrigatórias
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
                    Ação 1 (Respiração): Executar ciclo 4-7-8 por 3 minutos.
                  </label>
                  <Badge variant="secondary" className="text-[11px] gap-1">
                    <Wind className="h-3 w-3 text-primary" />
                    Respiração 4-7-8
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Inspire pelo nariz por 4s, retenha o ar por 7s e expire pela boca por 8s. Reduz o tônus simpático e restabelece a estabilidade de HRV (Harvard Medical School).
                </p>

                {/* Respiration Mini Timer */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Button
                    size="sm"
                    variant={timerActive ? 'destructive' : 'outline'}
                    onClick={() => setTimerActive(!timerActive)}
                    className="text-xs gap-1.5"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {timerActive ? 'Pausar Timer' : secondsRemaining < 180 ? 'Retomar Timer' : 'Timer Guiado (3 min)'}
                  </Button>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-muted rounded-md" data-testid="timer-display">
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
                      Zerar / Reiniciar
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
                    Ação 2 (Hidratação): Ingestão de 500ml de água.
                  </label>
                  <Badge variant="secondary" className="text-[11px] gap-1">
                    <Droplets className="h-3 w-3 text-sky-500" />
                    500ml H₂O
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Combate o decréscimo de volume plasmático em microgravidade e previne a lentidão motora e cefaleia decorrentes de desidratação subclínica.
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
                    Ação 3 (Descanso): Agendar ciclo de sono de 90 min no Biometric Log.
                  </label>
                  <Badge variant="secondary" className="text-[11px] gap-1">
                    <Moon className="h-3 w-3 text-indigo-400" />
                    Ciclo 90 min (REM/NREM)
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Permite a passagem por todos os estágios do sono, restaurando o índice de vigilância e a memória operacional sem induzir inércia de sono prolongada. Registre as horas de sono na aba Biometric Log.
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
          Limpar Checklist
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            Exportar Plano
          </Button>
          <Button onClick={handleRegister} className="gap-2 shadow-medium">
            <CheckCircle2 className="h-4 w-4" />
            Registrar Execução de Contramedidas
          </Button>
        </div>
      </div>
    </div>
  );
}
