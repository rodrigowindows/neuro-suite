import { useState, useEffect } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useConnectionMode } from '@/hooks/useConnectionMode';
import { enqueue } from '@/lib/offlineOutbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Moon, Dumbbell, Save, BookOpen, Loader2, Activity, Info, Heart, Eye, Download, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  generateDownlinkPackageAndFiles,
  DOWNLINK_AUTONOMOUS_LABEL,
  DOWNLINK_ONLINE_LABEL,
} from '@/lib/downlink';
import {
  savePerceivedFatigue,
  getLatestPerceivedFatigue,
  getFatigueLabel,
  checkFatigueDivergence,
  FATIGUE_OPTIONS,
  FATIGUE_DIVERGENCE_MESSAGE,
  perceivedFatigueValueSchema,
} from '@/lib/perceivedFatigue';
import {
  SYMPTOM_OPTIONS,
  Symptom,
  saveDailySymptoms,
  getDailySymptoms,
  evaluateDecisionSupport,
  DECISION_SUPPORT_DISCLAIMER,
  DECISION_SUPPORT_RECOMMENDATION,
} from '@/lib/symptoms';
import { appendEvent } from '@/lib/missionEvents';
import {
  computeBaseline,
  delta,
  formatDelta,
  filterValidScans,
  roundBlinkRate,
  BaselineScanInput,
} from '@/lib/baseline';

const missionLogSchema = z.object({
  horas_sono: z
    .number({ invalid_type_error: 'Informe um número válido' })
    .min(0, 'Horas de sono não podem ser negativas')
    .max(24, 'Máximo de 24 horas'),
  treino_realizado: z
    .string()
    .trim()
    .max(500, 'Máximo de 500 caracteres')
    .optional()
    .or(z.literal('')),
  fadiga_percebida: perceivedFatigueValueSchema.optional(),
});

interface LastEntry {
  horas_sono: number | null;
  treino_realizado: string | null;
  fadiga_percebida?: number | null;
}

export interface MissionLogProps {
  cockpitVerdict?: 'GO' | 'NO-GO' | 'ATENÇÃO' | 'SEM DADOS' | string;
  stressLevel?: string;
  hrvValue?: number;
  initialFatigue?: number;
  initialScans?: BaselineScanInput[];
}

export default function MissionLog({
  cockpitVerdict: propVerdict,
  initialFatigue,
  initialScans,
}: MissionLogProps = {}) {
  const { user } = useAuth();
  const { isAutonomous } = useConnectionMode();
  const { toast } = useToast();
  const [horasSono, setHorasSono] = useState('');
  const [treino, setTreino] = useState('');
  const [fadiga, setFadiga] = useState<string>(
    initialFatigue !== undefined && initialFatigue !== null ? String(initialFatigue) : ''
  );
  const [saving, setSaving] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(true);
  const [lastEntry, setLastEntry] = useState<LastEntry | null>(null);
  const [loadingScans, setLoadingScans] = useState(!initialScans);
  const [scans, setScans] = useState<BaselineScanInput[]>(initialScans ?? []);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>(() => {
    return getDailySymptoms();
  });
  const [downlinkButtonLabel, setDownlinkButtonLabel] = useState<string>('Gerar Pacote de Downlink');
  const [downlinkStatus, setDownlinkStatus] = useState<string | null>(null);
  const [generatingDownlink, setGeneratingDownlink] = useState<boolean>(false);

  const handleToggleSymptom = (symptom: Symptom) => {
    setSelectedSymptoms((prev) => {
      const next = prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom];
      saveDailySymptoms(next);
      return next;
    });
  };

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('horas_sono, treino_realizado')
        .eq('id', user.id)
        .maybeSingle();

      const storedFatigue = getLatestPerceivedFatigue();

      if ((data && (data.horas_sono !== null || data.treino_realizado)) || storedFatigue) {
        setLastEntry({
          horas_sono: data?.horas_sono !== null && data?.horas_sono !== undefined ? Number(data.horas_sono) : null,
          treino_realizado: data?.treino_realizado || null,
          fadiga_percebida: storedFatigue ? storedFatigue.value : null,
        });
      }
      setLoadingEntry(false);
    };
    load();
  }, [user?.id]);

  useEffect(() => {
    if (initialScans) {
      setScans(initialScans);
      setLoadingScans(false);
      return;
    }
    if (!user) {
      setLoadingScans(false);
      return;
    }
    let active = true;
    const loadScans = async () => {
      try {
        const { data } = await supabase
          .from('stress_scans')
          .select('hrv_value, blink_rate, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30);
        if (active) setScans(data ?? []);
      } catch {
        if (active) setScans([]);
      } finally {
        if (active) setLoadingScans(false);
      }
    };
    loadScans();
    return () => {
      active = false;
    };
  }, [initialScans, user?.id]);

  const validScans = filterValidScans(scans);
  const currentScan = validScans.length > 0 ? validScans[0] : null;
  const baseline = computeBaseline(validScans, currentScan, 7);

  const hrvDelta =
    currentScan && baseline ? delta(currentScan.hrv_value, baseline.hrv) : null;
  const blinkDelta =
    currentScan && baseline ? delta(currentScan.blink_rate, baseline.blinkRate) : null;

  const activeCockpitVerdict = propVerdict;

  const currentFatigueValue =
    fadiga !== '' ? Number(fadiga) : (lastEntry?.fadiga_percebida ?? null);

  const hasDivergence = checkFatigueDivergence(currentFatigueValue, activeCockpitVerdict);
  const decisionSupport = evaluateDecisionSupport(selectedSymptoms, activeCockpitVerdict);

  const handleSave = async () => {
    if (!user) return;

    const parsed = missionLogSchema.safeParse({
      horas_sono: horasSono === '' ? NaN : Number(horasSono),
      treino_realizado: treino,
      fadiga_percebida: fadiga !== '' ? Number(fadiga) : undefined,
    });

    if (!parsed.success) {
      toast({
        title: 'Verifique os campos',
        description: parsed.error.errors[0]?.message || 'Dados inválidos',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    // Persiste os sintomas no localStorage e registra evento em missionEvents
    saveDailySymptoms(selectedSymptoms);
    const symptomsLabel =
      selectedSymptoms.length > 0
        ? `Sintomas reportados: ${selectedSymptoms.join(', ')}`
        : 'Sem sintomas reportados';

    appendEvent({
      type: 'symptoms_logged',
      label: symptomsLabel,
      title: 'Registro de Sintomas',
      description: symptomsLabel,
      metadata: {
        horasSono: parsed.data.horas_sono,
        treino: parsed.data.treino_realizado || null,
        fadiga: parsed.data.fadiga_percebida ?? null,
        symptoms: selectedSymptoms,
        verdict: activeCockpitVerdict ?? null,
        decisionSupportTriggered: decisionSupport.triggered,
      },
    });

    const fatigueLabel =
      parsed.data.fadiga_percebida !== undefined
        ? `Fadiga percebida: ${getFatigueLabel(parsed.data.fadiga_percebida)}`
        : `Sono registrado: ${parsed.data.horas_sono}h`;

    appendEvent({
      type: 'perceived_fatigue',
      label: fatigueLabel,
    });

    if (isAutonomous) {
      enqueue({
        table: 'profiles',
        op: 'update',
        filter: { column: 'id', value: user.id },
        payload: {
          horas_sono: parsed.data.horas_sono,
          treino_realizado: parsed.data.treino_realizado || null,
        },
      });

      setSaving(false);

      let savedFatigue: number | null = lastEntry?.fadiga_percebida ?? null;
      if (parsed.data.fadiga_percebida !== undefined) {
        savePerceivedFatigue(parsed.data.fadiga_percebida);
        savedFatigue = parsed.data.fadiga_percebida;
      }

      setLastEntry({
        horas_sono: parsed.data.horas_sono,
        treino_realizado: parsed.data.treino_realizado || null,
        fadiga_percebida: savedFatigue,
      });
      setHorasSono('');
      setTreino('');
      setFadiga('');
      toast({
        title: 'Registro salvo localmente — será enviado ao restabelecer o uplink',
      });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        horas_sono: parsed.data.horas_sono,
        treino_realizado: parsed.data.treino_realizado || null,
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o registro. Tente novamente.',
        variant: 'destructive',
      });
      return;
    }

    let savedFatigue: number | null = lastEntry?.fadiga_percebida ?? null;
    if (parsed.data.fadiga_percebida !== undefined) {
      savePerceivedFatigue(parsed.data.fadiga_percebida);
      savedFatigue = parsed.data.fadiga_percebida;
    }

    setLastEntry({
      horas_sono: parsed.data.horas_sono,
      treino_realizado: parsed.data.treino_realizado || null,
      fadiga_percebida: savedFatigue,
    });
    setHorasSono('');
    setTreino('');
    setFadiga('');
    toast({
      title: 'Registro salvo',
      description: 'Seu Biometric Log foi atualizado.',
    });
  };

  const handleGenerateDownlink = async () => {
    setGeneratingDownlink(true);
    try {
      const modeFromStorage =
        typeof window !== 'undefined'
          ? localStorage.getItem('mars_mission_connection_mode')
          : null;
      const isAuto = isAutonomous || modeFromStorage === 'autonomous';

      const res = await generateDownlinkPackageAndFiles({
        userId: user?.id,
        hours: 72,
        isAutonomous: isAuto,
      });

      const message = isAuto ? DOWNLINK_AUTONOMOUS_LABEL : DOWNLINK_ONLINE_LABEL;

      setDownlinkButtonLabel(message);
      setDownlinkStatus(message);

      if (isAuto) {
        toast({
          title: message,
        });
      } else {
        toast({
          title: message,
          description: 'Download do arquivo JSON e relatório consolidado concluídos.',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erro ao gerar pacote',
        description: 'Não foi possível compilar o pacote de telemetria.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingDownlink(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Biometric Log</CardTitle>
                <CardDescription>
                  Registre seu sono e exercícios diários — essenciais para mitigar os efeitos da microgravidade.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="horas-sono" className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-primary" />
                Horas de Sono
              </Label>
              <Input
                id="horas-sono"
                type="number"
                min={0}
                max={24}
                step={0.5}
                placeholder="Ex: 7.5"
                value={horasSono}
                onChange={(e) => setHorasSono(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treino" className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                Exercício Realizado Hoje
              </Label>
              <Textarea
                id="treino"
                placeholder="Ex: 45 min de esteira com arnês + 30 min de resistência (ARED)"
                value={treino}
                onChange={(e) => setTreino(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fadiga-percebida" className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Nível de Fadiga Percebida (1-5)
              </Label>
              <Select value={fadiga} onValueChange={setFadiga}>
                <SelectTrigger id="fadiga-percebida" aria-label="Nível de Fadiga Percebida (1-5)">
                  <SelectValue placeholder="Selecione o nível de fadiga" />
                </SelectTrigger>
                <SelectContent>
                  {FATIGUE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasDivergence && (
              <div
                role="status"
                className="p-3 rounded-lg border border-border/60 bg-muted/30 text-xs sm:text-sm text-muted-foreground flex items-center gap-2"
              >
                <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{FATIGUE_DIVERGENCE_MESSAGE}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Sintomas hoje
                </Label>
                <p className="text-xs text-muted-foreground">
                  Selecione quaisquer sintomas observados durante o período de serviço.
                </p>
              </div>

              <div className="flex flex-wrap gap-2" role="group" aria-label="Sintomas hoje">
                {SYMPTOM_OPTIONS.map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => handleToggleSymptom(symptom)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors border ${
                        isSelected
                          ? 'bg-primary/15 text-primary border-primary/40 font-medium'
                          : 'bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted/70 hover:text-foreground'
                      }`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>

              <div
                className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1 text-xs"
                data-testid="decision-support-container"
              >
                {decisionSupport.triggered && (
                  <p className="text-sm text-foreground/90 font-medium leading-relaxed">
                    {DECISION_SUPPORT_RECOMMENDATION}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {DECISION_SUPPORT_DISCLAIMER}
                </p>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar Registro
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="border-border/50 bg-muted/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Linha de Base Pessoal</CardTitle>
            </div>
            <CardDescription>
              Comparativo biométrico entre os valores atuais e a mediana dos seus últimos scans válidos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingScans ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : validScans.length < 3 || !baseline || !currentScan ? (
              <p className="text-sm text-muted-foreground">
                Linha de base em construção ({validScans.length}/3 scans)
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border border-border/40 bg-background/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">HRV Atual</span>
                    <Heart className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">{Math.round(currentScan.hrv_value)} ms</span>
                    <span className="text-xs text-muted-foreground">
                      Base: {Math.round(baseline.hrv)} ms
                    </span>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {formatDelta(hrvDelta ?? 0)}
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border/40 bg-background/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Piscadas/min Atual</span>
                    <Eye className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">{roundBlinkRate(currentScan.blink_rate)}/min</span>
                    <span className="text-xs text-muted-foreground">
                      Base: {roundBlinkRate(baseline.blinkRate)}/min
                    </span>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {formatDelta(blinkDelta ?? 0)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <Card className="border-border/50 bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Último Registro Salvo</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEntry ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : lastEntry ? (
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Moon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sono</p>
                    <p className="font-semibold">
                      {lastEntry.horas_sono !== null ? `${lastEntry.horas_sono}h` : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Dumbbell className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Exercício</p>
                    <p className="font-semibold text-sm leading-snug">
                      {lastEntry.treino_realizado || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fadiga Percebida</p>
                    <p className="font-semibold text-sm leading-snug">
                      {lastEntry.fadiga_percebida !== null && lastEntry.fadiga_percebida !== undefined
                        ? getFatigueLabel(lastEntry.fadiga_percebida)
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum registro ainda. Salve seu primeiro registro acima.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <Radio className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Pacote de Downlink</CardTitle>
                <CardDescription>
                  Resumo das últimas 72 horas de telemetria para transmissão ao Controle de Missão.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                onClick={handleGenerateDownlink}
                disabled={generatingDownlink}
                className="gap-2 w-full sm:w-auto"
                aria-label={downlinkButtonLabel}
                data-testid="downlink-package-btn"
              >
                {generatingDownlink ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {downlinkButtonLabel}
              </Button>
            </div>
            {downlinkStatus && (
              <p className="text-xs font-mono text-muted-foreground" role="status">
                {downlinkStatus}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
