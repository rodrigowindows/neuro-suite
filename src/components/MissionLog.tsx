/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useConnectionMode } from '@/hooks/useConnectionMode';
import { useI18n, Lang } from '@/i18n';
import { enqueue } from '@/lib/offlineOutbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Moon,
  Dumbbell,
  Save,
  BookOpen,
  Loader2,
  Activity,
  Info,
  Heart,
  Eye,
  Download,
  Radio,
  Clock,
  Filter,
} from 'lucide-react';
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
import {
  appendEvent,
  getRecentEvents,
  MissionEvent,
  MISSION_EVENT_ADDED_EVENT,
} from '@/lib/missionEvents';
import {
  computeBaseline,
  delta,
  formatDelta,
  filterValidScans,
  roundBlinkRate,
  BaselineScanInput,
} from '@/lib/baseline';

const createMissionLogSchema = (t: (key: string) => string) =>
  z.object({
    horas_sono: z
      .number({ invalid_type_error: t('missionlog.zod.validNumber') })
      .min(0, t('missionlog.zod.negativeSleep'))
      .max(24, t('missionlog.zod.maxSleep')),
    treino_realizado: z
      .string()
      .trim()
      .max(500, t('missionlog.zod.maxExercise'))
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

const SYMPTOM_KEY_MAP: Record<Symptom, string> = {
  'febre ou calafrios': 'missionlog.symptom.fever',
  'dor de cabeça': 'missionlog.symptom.headache',
  'náusea': 'missionlog.symptom.nausea',
  'tontura': 'missionlog.symptom.dizziness',
  'dor musculoesquelética': 'missionlog.symptom.musculoskeletal',
  'humor rebaixado': 'missionlog.symptom.lowMood',
  'sono fragmentado': 'missionlog.symptom.sleep',
  'desconforto ocular': 'missionlog.symptom.eyeDiscomfort',
};

export function formatCockpitVerdict(
  verdict?: string | null,
  lang: Lang = 'pt',
  t?: (key: string) => string
): string {
  if (!verdict) return '';
  const clean = verdict.trim().toUpperCase();
  if (clean === 'GO' || clean.startsWith('GO -')) {
    if (lang === 'en') return t ? t('missionlog.verdict.go') : 'GO - FIT FOR SHIFT';
    return verdict;
  }
  if (
    clean === 'ATENÇÃO' ||
    clean === 'ATENCAO' ||
    clean.startsWith('ATENÇÃO -') ||
    clean.startsWith('ATENCAO -') ||
    clean.startsWith('CAUTION')
  ) {
    if (lang === 'en') return t ? t('missionlog.verdict.caution') : 'CAUTION - WATCH';
    return verdict;
  }
  if (clean === 'NO-GO' || clean === 'NOGO' || clean.startsWith('NO-GO -') || clean.startsWith('NOGO -')) {
    if (lang === 'en') return t ? t('missionlog.verdict.nogo') : 'NO-GO - FATIGUE (NOT FIT)';
    return verdict;
  }
  if (clean.includes('AGUARDANDO') || clean.includes('AWAITING')) {
    if (lang === 'en') return t ? t('missionlog.verdict.awaiting') : 'AWAITING SCAN';
    return verdict;
  }
  if (clean.includes('SEM DADOS') || clean.includes('NO DATA')) {
    if (lang === 'en') return t ? t('missionlog.verdict.noData') : 'NO DATA';
    return verdict;
  }
  return verdict;
}

export function formatLocalizedEventDate(
  at?: string | number | Date,
  lang: Lang = 'pt',
  referenceDate: Date = new Date()
): string {
  if (!at) return lang === 'pt' ? 'Hoje' : 'Today';
  const d = new Date(at);
  if (isNaN(d.getTime())) return String(at);

  const ref = new Date(referenceDate);

  const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  const dStart = startOfDay(d);
  const refStart = startOfDay(ref);

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const dayDiff = Math.round((refStart - dStart) / ONE_DAY_MS);

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (dayDiff === 0) {
    return lang === 'pt' ? `Hoje, ${timeStr}` : `Today, ${timeStr}`;
  }
  if (dayDiff === 1) {
    return lang === 'pt' ? `Ontem, ${timeStr}` : `Yesterday, ${timeStr}`;
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return lang === 'pt' ? `${day}/${month}, ${timeStr}` : `${month}/${day}, ${timeStr}`;
}

export function formatEventText(
  event: MissionEvent,
  lang: Lang,
  t: (key: string, vars?: Record<string, string | number>) => string
): string {
  if (lang === 'pt') {
    return event.label || event.description || event.title || '';
  }

  const meta = event.metadata || {};

  switch (event.type) {
    case 'scan': {
      const score = meta.score ?? meta.bioScore;
      const hrv = meta.hrv ?? meta.hrvValue;
      if (score !== undefined && hrv !== undefined) {
        return t('missionlog.event.scanCompleted', { score: Number(score), hrv: Number(hrv) });
      }
      if (meta.verdict) {
        const vText = formatCockpitVerdict(String(meta.verdict), lang, t);
        return t('missionlog.event.statusUpdated', { verdict: vText });
      }
      if (score !== undefined) {
        return t('missionlog.event.scanBioScore', { score: Number(score) });
      }
      if (event.label?.includes('Alerta Preditivo: Fadiga Elevada')) {
        return t('missionlog.event.predictiveAlert', { score: Number(score ?? 34) });
      }
      if (event.label?.includes('Status atualizado: Estável')) {
        return t('missionlog.event.statusStable');
      }
      return event.label || event.description || event.title || '';
    }
    case 'protocol': {
      if (event.label?.includes('3 ciclos de respiração 4-7-8')) {
        return t('missionlog.event.countermeasureLocal');
      }
      if (event.label?.includes('Respiração 4-7-8') || event.label?.includes('4-7-8')) {
        return t('missionlog.event.countermeasureAction');
      }
      if (meta.protocol) {
        return t('missionlog.event.countermeasureProtocol', { name: String(meta.protocol) });
      }
      return event.label || event.description || event.title || '';
    }
    case 'assessment': {
      if (event.label?.includes('Turno operacional iniciado')) {
        return t('missionlog.event.shiftStarted');
      }
      if (meta.verdict) {
        const vText = formatCockpitVerdict(String(meta.verdict), lang, t);
        return t('missionlog.event.assessmentVerdict', { verdict: vText });
      }
      return event.label || event.description || event.title || '';
    }
    case 'perceived_fatigue': {
      if (meta.fadiga !== undefined && meta.fadiga !== null) {
        const fatigueKey = `missionlog.fatigue.${meta.fadiga}`;
        return t('missionlog.event.fatigueLogged', { level: t(fatigueKey) });
      }
      if (meta.horasSono !== undefined && meta.horasSono !== null) {
        return t('missionlog.event.sleepLogged', { hours: Number(meta.horasSono) });
      }
      if (event.label?.startsWith('Fadiga percebida: ')) {
        const match = event.label.match(/Fadiga percebida:\s*([1-5])/);
        if (match) {
          return t('missionlog.event.fatigueLogged', { level: t(`missionlog.fatigue.${match[1]}`) });
        }
      }
      if (event.label?.startsWith('Sono registrado: ')) {
        const match = event.label.match(/Sono registrado:\s*([0-9.]+)/);
        if (match) {
          return t('missionlog.event.sleepLogged', { hours: match[1] });
        }
      }
      return event.label || event.description || event.title || '';
    }
    case 'symptoms_logged': {
      if (Array.isArray(meta.symptoms)) {
        if (meta.symptoms.length === 0) {
          return t('missionlog.event.noSymptoms');
        }
        const translated = meta.symptoms.map((s: string) =>
          SYMPTOM_KEY_MAP[s as Symptom] ? t(SYMPTOM_KEY_MAP[s as Symptom]) : s
        );
        return t('missionlog.event.symptomsReported', { list: translated.join(', ') });
      }
      if (event.label === 'Sem sintomas reportados') {
        return t('missionlog.event.noSymptoms');
      }
      return event.label || event.description || event.title || '';
    }
    default:
      return event.label || event.description || event.title || '';
  }
}

export default function MissionLog({
  cockpitVerdict: propVerdict,
  initialFatigue,
  initialScans,
}: MissionLogProps = {}) {
  const { lang, t } = useI18n();
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
  const [downlinkButtonLabel, setDownlinkButtonLabel] = useState<string>(() =>
    lang === 'pt' ? 'Gerar Pacote de Downlink' : t('missionlog.downlink.btnDefault')
  );
  const [downlinkStatus, setDownlinkStatus] = useState<string | null>(null);
  const [generatingDownlink, setGeneratingDownlink] = useState<boolean>(false);

  // Timeline state
  const [events, setEvents] = useState<MissionEvent[]>(() =>
    typeof window !== 'undefined' ? getRecentEvents(50) : []
  );
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    const syncEvents = () => {
      setEvents(getRecentEvents(50));
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

  const formatLocalizedDelta = (deltaPercent: number): string => {
    if (lang === 'pt') return formatDelta(deltaPercent);
    if (!Number.isFinite(deltaPercent)) {
      return t('missionlog.baseline.delta', { delta: '0%' });
    }
    const rounded = Math.round(deltaPercent);
    const sign = rounded > 0 ? `+${rounded}%` : rounded < 0 ? `\u2212${Math.abs(rounded)}%` : '0%';
    return t('missionlog.baseline.delta', { delta: sign });
  };

  const handleSave = async () => {
    if (!user) return;

    const missionLogSchema = createMissionLogSchema(t);
    const parsed = missionLogSchema.safeParse({
      horas_sono: horasSono === '' ? NaN : Number(horasSono),
      treino_realizado: treino,
      fadiga_percebida: fadiga !== '' ? Number(fadiga) : undefined,
    });

    if (!parsed.success) {
      toast({
        title: t('missionlog.toast.validationTitle'),
        description: parsed.error.errors[0]?.message || t('missionlog.toast.invalidData'),
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
        title: t('missionlog.toast.saveLocalTitle'),
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
        title: t('missionlog.toast.saveErrorTitle'),
        description: t('missionlog.toast.saveErrorDesc'),
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
      title: t('missionlog.toast.saveSuccessTitle'),
      description: t('missionlog.toast.saveSuccessDesc'),
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

      await generateDownlinkPackageAndFiles({
        userId: user?.id,
        hours: 72,
        isAutonomous: isAuto,
      });

      const message = isAuto
        ? lang === 'pt'
          ? DOWNLINK_AUTONOMOUS_LABEL
          : t('missionlog.downlink.btnAutonomous')
        : lang === 'pt'
        ? DOWNLINK_ONLINE_LABEL
        : t('missionlog.downlink.btnGenerated');

      setDownlinkButtonLabel(message);
      setDownlinkStatus(message);

      if (isAuto) {
        toast({
          title: message,
        });
      } else {
        toast({
          title: message,
          description: t('missionlog.toast.downlinkSuccessDesc'),
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: t('missionlog.toast.downlinkErrorTitle'),
        description: t('missionlog.toast.downlinkErrorDesc'),
        variant: 'destructive',
      });
    } finally {
      setGeneratingDownlink(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    if (selectedFilter === 'all') return true;
    return e.type === selectedFilter;
  });

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
                <CardTitle>{t('missionlog.biometric.title')}</CardTitle>
                <CardDescription>
                  {t('missionlog.biometric.desc')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="horas-sono" className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-primary" />
                {t('missionlog.biometric.sleepLabel')}
              </Label>
              <Input
                id="horas-sono"
                type="number"
                min={0}
                max={24}
                step={0.5}
                placeholder={t('missionlog.biometric.sleepPlaceholder')}
                value={horasSono}
                onChange={(e) => setHorasSono(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treino" className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                {t('missionlog.biometric.exerciseLabel')}
              </Label>
              <Textarea
                id="treino"
                placeholder={t('missionlog.biometric.exercisePlaceholder')}
                value={treino}
                onChange={(e) => setTreino(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fadiga-percebida" className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                {t('missionlog.biometric.fatigueLabel')}
              </Label>
              <Select value={fadiga} onValueChange={setFadiga}>
                <SelectTrigger id="fadiga-percebida" aria-label={t('missionlog.biometric.fatigueLabel')}>
                  <SelectValue placeholder={t('missionlog.biometric.fatiguePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {FATIGUE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {lang === 'pt' ? opt.label : t(`missionlog.fatigue.${opt.value}`)}
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
                <span>{lang === 'pt' ? FATIGUE_DIVERGENCE_MESSAGE : t('missionlog.biometric.divergence')}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  {t('missionlog.biometric.symptomsLabel')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('missionlog.biometric.symptomsDesc')}
                </p>
              </div>

              <div className="flex flex-wrap gap-2" role="group" aria-label={t('missionlog.biometric.symptomsLabel')}>
                {SYMPTOM_OPTIONS.map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom);
                  const labelText = lang === 'pt' ? symptom : t(SYMPTOM_KEY_MAP[symptom]);
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
                      {labelText}
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
                    {lang === 'pt' ? DECISION_SUPPORT_RECOMMENDATION : t('missionlog.decisionSupport.recommendation')}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {lang === 'pt' ? DECISION_SUPPORT_DISCLAIMER : t('missionlog.decisionSupport.disclaimer')}
                </p>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t('missionlog.biometric.saveBtn')}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="border-border/50 bg-muted/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">{t('missionlog.baseline.title')}</CardTitle>
            </div>
            <CardDescription>
              {t('missionlog.baseline.desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingScans ? (
              <p className="text-sm text-muted-foreground">{t('missionlog.baseline.loading')}</p>
            ) : validScans.length < 3 || !baseline || !currentScan ? (
              <p className="text-sm text-muted-foreground">
                {t('missionlog.baseline.building', { count: validScans.length })}
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border border-border/40 bg-background/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t('missionlog.baseline.hrvCurrent')}</span>
                    <Heart className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">{Math.round(currentScan.hrv_value)} ms</span>
                    <span className="text-xs text-muted-foreground">
                      {t('missionlog.baseline.hrvBase', { value: Math.round(baseline.hrv) })}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {formatLocalizedDelta(hrvDelta ?? 0)}
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border/40 bg-background/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t('missionlog.baseline.blinkCurrent')}</span>
                    <Eye className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">{roundBlinkRate(currentScan.blink_rate)}/min</span>
                    <span className="text-xs text-muted-foreground">
                      {t('missionlog.baseline.blinkBase', { value: roundBlinkRate(baseline.blinkRate) })}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {formatLocalizedDelta(blinkDelta ?? 0)}
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
            <CardTitle className="text-base">{t('missionlog.lastEntry.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEntry ? (
              <p className="text-sm text-muted-foreground">{t('missionlog.lastEntry.loading')}</p>
            ) : lastEntry ? (
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Moon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('missionlog.lastEntry.sleep')}</p>
                    <p className="font-semibold">
                      {lastEntry.horas_sono !== null
                        ? t('missionlog.lastEntry.sleepHoursFormat', { hours: lastEntry.horas_sono })
                        : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Dumbbell className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('missionlog.lastEntry.exercise')}</p>
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
                    <p className="text-xs text-muted-foreground">{t('missionlog.lastEntry.fatigue')}</p>
                    <p className="font-semibold text-sm leading-snug">
                      {lastEntry.fadiga_percebida !== null && lastEntry.fadiga_percebida !== undefined
                        ? (lang === 'pt'
                            ? getFatigueLabel(lastEntry.fadiga_percebida)
                            : t(`missionlog.fatigue.${lastEntry.fadiga_percebida}`))
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('missionlog.lastEntry.empty')}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Linha do Tempo de Eventos / Mission Event Timeline */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.18 }}>
        <Card className="border-border/50 bg-muted/20">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">{t('missionlog.timeline.title')}</CardTitle>
              </div>
              {activeCockpitVerdict && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{t('missionlog.timeline.verdictLabel')}:</span>
                  <Badge variant="outline" data-testid="cockpit-verdict-badge" className="font-mono text-[11px]">
                    {formatCockpitVerdict(activeCockpitVerdict, lang, t)}
                  </Badge>
                </div>
              )}
            </div>
            <CardDescription>
              {t('missionlog.timeline.desc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
              {[
                { key: 'all', labelKey: 'missionlog.timeline.filterAll' },
                { key: 'scan', labelKey: 'missionlog.timeline.filterScan' },
                { key: 'protocol', labelKey: 'missionlog.timeline.filterProtocol' },
                { key: 'perceived_fatigue', labelKey: 'missionlog.timeline.filterFatigue' },
                { key: 'symptoms_logged', labelKey: 'missionlog.timeline.filterSymptoms' },
              ].map((f) => {
                const isActive = selectedFilter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setSelectedFilter(f.key)}
                    className={`px-2.5 py-1 rounded-md text-xs transition-colors border ${
                      isActive
                        ? 'bg-primary/20 text-primary border-primary/40 font-medium'
                        : 'bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted/70 hover:text-foreground'
                    }`}
                  >
                    {t(f.labelKey)}
                  </button>
                );
              })}
            </div>

            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                {t('missionlog.timeline.empty')}
              </p>
            ) : filteredEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                {t('missionlog.timeline.noFilterMatches')}
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredEvents.map((evt) => {
                  const dateStr = formatLocalizedEventDate(evt.at || evt.timestamp, lang);
                  const text = formatEventText(evt, lang, t);
                  return (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-lg border border-border/40 bg-background/60 text-xs flex items-baseline justify-between gap-2"
                    >
                      <span className="font-mono text-muted-foreground shrink-0">
                        [{dateStr}]
                      </span>
                      <span className="text-foreground/90 font-medium flex-1 text-left">
                        {text}
                      </span>
                    </div>
                  );
                })}
              </div>
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
                <CardTitle>{t('missionlog.downlink.title')}</CardTitle>
                <CardDescription>
                  {t('missionlog.downlink.desc')}
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
