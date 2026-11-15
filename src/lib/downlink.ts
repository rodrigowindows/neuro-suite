import { supabase } from '@/integrations/supabase/client';
import { roundBlinkRate } from '@/lib/biometricDisplay';
import { getReadinessStatus } from '@/lib/readiness';
import { APP_CONFIG } from '@/lib/constants';
import {
  getLatestPerceivedFatigue,
  getFatigueLabel,
  PERCEIVED_FATIGUE_PREFIX,
} from '@/lib/perceivedFatigue';
import { isAutonomousMode } from '@/hooks/useConnectionMode';
import { buildWellnessReportHtml, openOrDownloadHtmlReport } from '@/components/WellnessReportPDF';

export const DOWNLINK_PACKAGE_STATUS_KEY = 'mars_downlink_package_status';
export const DOWNLINK_PACKAGE_DATA_KEY = 'mars_downlink_package';
export const DOWNLINK_CLINICAL_DISCLAIMER =
  'Estimativas por webcam, apoio à decisão, não diagnóstico clínico';
export const DOWNLINK_AUTONOMOUS_LABEL =
  'Pacote salvo localmente (simulação de uplink — nenhum envio real)';
export const DOWNLINK_ONLINE_LABEL = 'Pacote gerado';

export interface DownlinkPackageHeader {
  data_hora: string;
  versao_app: string;
  aviso: string;
}

export interface DownlinkScanItem {
  id: string;
  created_at: string;
  stress_level: string;
  veredito: string;
  bioScore: number;
  hrv: number | null;
  hrv_value: number | null;
  piscadas: number;
  piscadas_exibicao: number;
  blink_rate: number;
  readiness_status: string;
}

export interface DownlinkPackageData {
  cabecalho: DownlinkPackageHeader;
  header: DownlinkPackageHeader;
  aviso: string;
  versao_app: string;
  data_hora: string;
  janela_horas: number;
  inicio_periodo: string;
  fim_periodo: string;
  scans: DownlinkScanItem[];
  resumo_scans: {
    total: number;
    distribuicao_estresse: {
      baixo: number;
      moderado: number;
      alto: number;
    };
    bioScore_medio: number | null;
    hrv_medio: number | null;
    piscadas_media: number | null;
    piscadas_media_exibicao: number | null;
  };
  sono: {
    horas: number | null;
    texto: string;
  };
  exercicios: {
    registro: string | null;
    texto: string;
  };
  avaliacoes_prontidao: Array<{
    timestamp: string;
    estado: string;
    rotulo: string;
    headline: string;
  }>;
  fadiga_percebida: {
    valor: number | null;
    rotulo: string;
    registros: Array<{ timestamp: string; valor: number; rotulo: string }>;
  };
  contramedidas_registradas: Array<{
    data: string;
    registrado_em: string;
    detalhes: any;
  }>;
  eventos_log: Array<{
    timestamp: string;
    tipo: string;
    descricao: string;
  }>;
  status: 'pendente de envio' | 'gerado';
  envio?: 'simulado';
}

export function calculateScanBioScore(stressLevel: string, hrv?: number | null): number {
  if (stressLevel === 'low') {
    return hrv && hrv >= 60 ? 95 : 90;
  }
  if (stressLevel === 'moderate') {
    return hrv && hrv >= 45 ? 70 : 65;
  }
  return hrv && hrv < 30 ? 30 : 35;
}

export function getScanVerdict(stressLevel: string): string {
  if (stressLevel === 'low') return 'Baixo';
  if (stressLevel === 'moderate') return 'Moderado';
  return 'Alto';
}

export function getPerceivedFatigueHistory(
  hours: number = 72,
  now: Date = new Date()
): Array<{ timestamp: string; valor: number; rotulo: string }> {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  const cutoff = now.getTime() - hours * 60 * 60 * 1000;
  const entries: Array<{ timestamp: string; valor: number; rotulo: string }> = [];

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(PERCEIVED_FATIGUE_PREFIX)) {
      try {
        const item = JSON.parse(window.localStorage.getItem(key) || '{}');
        if (item && item.value !== undefined) {
          const entryTime = item.timestamp ? new Date(item.timestamp).getTime() : 0;
          if (entryTime >= cutoff) {
            entries.push({
              timestamp: item.timestamp,
              valor: Number(item.value),
              rotulo: getFatigueLabel(Number(item.value)),
            });
          }
        }
      } catch {
        // ignore
      }
    }
  }

  const latest = getLatestPerceivedFatigue();
  if (latest && !entries.some((e) => e.timestamp === latest.timestamp)) {
    const latestTime = new Date(latest.timestamp).getTime();
    if (latestTime >= cutoff) {
      entries.push({
        timestamp: latest.timestamp,
        valor: latest.value,
        rotulo: getFatigueLabel(latest.value),
      });
    }
  }

  return entries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getRegisteredCountermeasures(
  hours: number = 72,
  now: Date = new Date()
): Array<{ data: string; registrado_em: string; detalhes: any }> {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  const cutoff = now.getTime() - hours * 60 * 60 * 1000;
  const results: Array<{ data: string; registrado_em: string; detalhes: any }> = [];

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith('crewvitals_countermeasures_registered_')) {
      const dateStr = key.replace('crewvitals_countermeasures_registered_', '');
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          const time = parsed.registeredAt
            ? new Date(parsed.registeredAt).getTime()
            : new Date(dateStr).getTime();
          if (time >= cutoff) {
            results.push({
              data: dateStr,
              registrado_em: parsed.registeredAt || new Date(dateStr).toISOString(),
              detalhes: parsed.countermeasures || {},
            });
          }
        }
      } catch {
        // ignore
      }
    }
  }

  return results.sort(
    (a, b) => new Date(b.registrado_em).getTime() - new Date(a.registrado_em).getTime()
  );
}

export async function assembleDownlinkPackage(options?: {
  userId?: string;
  hours?: number;
  now?: Date;
  isAutonomous?: boolean;
}): Promise<DownlinkPackageData> {
  const hours = options?.hours ?? 72;
  const now = options?.now ?? new Date();
  const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);

  const authUser = options?.userId
    ? { id: options.userId }
    : (await supabase?.auth?.getUser?.())?.data?.user;
  const userId = authUser?.id;

  let scansData: any[] = [];
  let checkinsData: any[] = [];
  let coachData: any[] = [];
  let profileData: any = null;

  if (userId) {
    try {
      const scansPromise = (async () => {
        try {
          return await supabase
            .from('stress_scans')
            .select('id, stress_level, hrv_value, blink_rate, created_at')
            .eq('user_id', userId)
            .gte('created_at', cutoff.toISOString())
            .order('created_at', { ascending: false });
        } catch {
          return { data: [] };
        }
      })();

      const checkinsPromise = (async () => {
        try {
          return await supabase
            .from('daily_checkins')
            .select('id, mood, energy_level, note, created_at, ai_response')
            .eq('user_id', userId)
            .gte('created_at', cutoff.toISOString())
            .order('created_at', { ascending: false });
        } catch {
          return { data: [] };
        }
      })();

      const coachPromise = (async () => {
        try {
          return await supabase
            .from('coach_conversations')
            .select('id, stress_level, action_plan, messages, created_at')
            .eq('user_id', userId)
            .gte('created_at', cutoff.toISOString())
            .order('created_at', { ascending: false });
        } catch {
          return { data: [] };
        }
      })();

      const profilePromise = (async () => {
        try {
          const query = supabase
            .from('profiles')
            .select('full_name, preferred_name, email, horas_sono, treino_realizado')
            .eq('id', userId);
          return typeof (query as any).maybeSingle === 'function'
            ? await (query as any).maybeSingle()
            : await (query as any).single?.();
        } catch {
          return { data: null };
        }
      })();

      const [scansRes, checkinsRes, coachRes, profileRes] = await Promise.all([
        scansPromise,
        checkinsPromise,
        coachPromise,
        profilePromise,
      ]);

      scansData = scansRes?.data || [];
      checkinsData = checkinsRes?.data || [];
      coachData = coachRes?.data || [];
      profileData = profileRes?.data || null;
    } catch {
      // offline / mock fallback
    }
  }

  // Filter client-side as well to strictly guarantee 72h window
  const filteredScans = (scansData || []).filter((s) => {
    if (!s.created_at) return true;
    return new Date(s.created_at).getTime() >= cutoff.getTime();
  });

  const filteredCheckins = (checkinsData || []).filter((c) => {
    if (!c.created_at) return true;
    return new Date(c.created_at).getTime() >= cutoff.getTime();
  });

  const filteredCoach = (coachData || []).filter((co) => {
    if (!co.created_at) return true;
    return new Date(co.created_at).getTime() >= cutoff.getTime();
  });

  const scans: DownlinkScanItem[] = filteredScans.map((s, idx) => {
    const rawBlink = Number(s.blink_rate ?? 0);
    const hrvNum = s.hrv_value != null ? Number(s.hrv_value) : null;
    const readiness = getReadinessStatus(hrvNum, s.stress_level);
    const bioScore = calculateScanBioScore(s.stress_level, hrvNum);
    return {
      id: s.id || `scan-${idx}`,
      created_at: s.created_at || now.toISOString(),
      stress_level: s.stress_level,
      veredito: getScanVerdict(s.stress_level),
      bioScore,
      hrv: hrvNum,
      hrv_value: hrvNum,
      piscadas: rawBlink,
      piscadas_exibicao: roundBlinkRate(rawBlink),
      blink_rate: rawBlink,
      readiness_status: readiness.label,
    };
  });

  const totalScans = scans.length;
  const lowCount = scans.filter((s) => s.stress_level === 'low').length;
  const modCount = scans.filter((s) => s.stress_level === 'moderate').length;
  const highCount = scans.filter((s) => s.stress_level === 'high').length;
  const hrvValues = scans.filter((s) => s.hrv !== null).map((s) => s.hrv as number);
  const avgHrv =
    hrvValues.length > 0
      ? Math.round(hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length)
      : null;
  const bioScores = scans.map((s) => s.bioScore);
  const avgBioScore =
    bioScores.length > 0
      ? Math.round(bioScores.reduce((a, b) => a + b, 0) / bioScores.length)
      : null;
  const blinkValues = scans.map((s) => s.piscadas);
  const avgBlink =
    blinkValues.length > 0
      ? blinkValues.reduce((a, b) => a + b, 0) / blinkValues.length
      : null;
  const avgBlinkDisplay = avgBlink !== null ? roundBlinkRate(avgBlink) : null;

  const sleepHours =
    profileData?.horas_sono != null ? Number(profileData.horas_sono) : null;
  const sleepText = sleepHours != null ? `${sleepHours}h` : 'Não informado';

  const workoutText = profileData?.treino_realizado || null;
  const workoutDisplay = workoutText || 'Não registrado';

  const avaliacoes_prontidao = scans.map((s) => {
    const status = getReadinessStatus(s.hrv, s.stress_level);
    return {
      timestamp: s.created_at,
      estado: status.state,
      rotulo: status.label,
      headline: status.headline,
    };
  });

  filteredCheckins.forEach((c) => {
    avaliacoes_prontidao.push({
      timestamp: c.created_at || now.toISOString(),
      estado: c.energy_level >= 4 ? 'go' : c.energy_level >= 3 ? 'caution' : 'nogo',
      rotulo: c.energy_level >= 4 ? 'GO' : c.energy_level >= 3 ? 'ATENÇÃO' : 'NO-GO',
      headline: `Prontidão diária: ${c.energy_level}/5 (${c.mood || 'estável'})`,
    });
  });

  const perceivedHistory = getPerceivedFatigueHistory(hours, now);
  const latestFatigue = getLatestPerceivedFatigue();
  const currentFatigueValue = latestFatigue ? latestFatigue.value : null;
  const currentFatigueLabel = currentFatigueValue
    ? getFatigueLabel(currentFatigueValue)
    : 'Não informado';

  const countermeasureEntries = getRegisteredCountermeasures(hours, now);
  filteredCoach.forEach((co) => {
    countermeasureEntries.push({
      data: co.created_at ? co.created_at.split('T')[0] : now.toISOString().split('T')[0],
      registrado_em: co.created_at || now.toISOString(),
      detalhes: {
        tipo: 'neurocoach',
        stress_level: co.stress_level,
        action_plan: co.action_plan,
      },
    });
  });

  const eventos_log: Array<{ timestamp: string; tipo: string; descricao: string }> = [];

  scans.forEach((s) => {
    eventos_log.push({
      timestamp: s.created_at,
      tipo: 'scan_bioscore',
      descricao: `Scan BioScore realizado — Veredito: ${s.veredito}, BioScore: ${s.bioScore}, HRV: ${s.hrv != null ? `${s.hrv}ms` : 'N/A'}, Piscadas: ${s.piscadas_exibicao}/min`,
    });
  });

  filteredCheckins.forEach((c) => {
    eventos_log.push({
      timestamp: c.created_at || now.toISOString(),
      tipo: 'checkin',
      descricao: `Check-in diário registrado — Energia: ${c.energy_level}/5, Carga: ${c.mood}`,
    });
  });

  countermeasureEntries.forEach((cm) => {
    eventos_log.push({
      timestamp: cm.registrado_em,
      tipo: 'contramedida',
      descricao: 'Protocolo de contramedida registrado',
    });
  });

  perceivedHistory.forEach((f) => {
    eventos_log.push({
      timestamp: f.timestamp,
      tipo: 'fadiga_percebida',
      descricao: `Fadiga percebida informada: ${f.rotulo}`,
    });
  });

  if (profileData && (profileData.horas_sono != null || profileData.treino_realizado)) {
    eventos_log.push({
      timestamp: now.toISOString(),
      tipo: 'biometric_log',
      descricao: `Biometric Log — Sono: ${sleepText}, Exercício: ${workoutDisplay}`,
    });
  }

  eventos_log.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const autonomousActive =
    options?.isAutonomous ??
    (isAutonomousMode() ||
      (typeof window !== 'undefined' &&
        localStorage.getItem('mars_mission_connection_mode') === 'autonomous'));

  const status: 'pendente de envio' | 'gerado' = autonomousActive
    ? 'pendente de envio'
    : 'gerado';

  const cabecalho: DownlinkPackageHeader = {
    data_hora: now.toISOString(),
    versao_app: APP_CONFIG.version,
    aviso: DOWNLINK_CLINICAL_DISCLAIMER,
  };

  const downlinkPackage: DownlinkPackageData = {
    cabecalho,
    header: cabecalho,
    aviso: DOWNLINK_CLINICAL_DISCLAIMER,
    versao_app: APP_CONFIG.version,
    data_hora: cabecalho.data_hora,
    janela_horas: hours,
    inicio_periodo: cutoff.toISOString(),
    fim_periodo: now.toISOString(),
    scans,
    resumo_scans: {
      total: totalScans,
      distribuicao_estresse: {
        baixo: lowCount,
        moderado: modCount,
        alto: highCount,
      },
      bioScore_medio: avgBioScore,
      hrv_medio: avgHrv,
      piscadas_media: avgBlink,
      piscadas_media_exibicao: avgBlinkDisplay,
    },
    sono: {
      horas: sleepHours,
      texto: sleepText,
    },
    exercicios: {
      registro: workoutText,
      texto: workoutDisplay,
    },
    avaliacoes_prontidao,
    fadiga_percebida: {
      valor: currentFatigueValue,
      rotulo: currentFatigueLabel,
      registros: perceivedHistory,
    },
    contramedidas_registradas: countermeasureEntries,
    eventos_log,
    status,
    ...(autonomousActive ? { envio: 'simulado' as const } : {}),
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(DOWNLINK_PACKAGE_STATUS_KEY, status);
    localStorage.setItem('downlink_package_status', status);
    localStorage.setItem(
      DOWNLINK_PACKAGE_DATA_KEY,
      JSON.stringify(downlinkPackage)
    );
  }

  return downlinkPackage;
}

export function triggerJsonDownload(filename: string, data: object): void {
  if (typeof window === 'undefined') return;
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.addEventListener('click', (e) => {
    // Prevent unhandled jsdom navigation in tests
    if (typeof window !== 'undefined' && !(window as any).navigation) {
      e.stopPropagation();
    }
  });
  document.body.appendChild(link);
  try {
    link.click();
  } catch {
    // ignore
  }
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export async function generateDownlinkPackageAndFiles(options?: {
  userId?: string;
  hours?: number;
  now?: Date;
  isAutonomous?: boolean;
}): Promise<{
  packageData: DownlinkPackageData;
  feedbackMessage: string;
  buttonLabel: string;
}> {
  const packageData = await assembleDownlinkPackage(options);
  const dateStr = packageData.fim_periodo.split('T')[0];
  const filename = `pacote-downlink-72h-${dateStr}.json`;

  triggerJsonDownload(filename, packageData);

  // Reaproveita WellnessReportPDF gerando relatório HTML/PDF consolidado
  try {
    const reportHtml = buildWellnessReportHtml({
      userName: 'Tripulante',
      now: new Date().toLocaleDateString('pt-BR'),
      scans: packageData.scans,
      checkins: [],
      profile: {
        horas_sono: packageData.sono.horas,
        treino_realizado: packageData.exercicios.registro,
      },
      periodLabel: '72 horas',
    });
    openOrDownloadHtmlReport(reportHtml, `relatorio-downlink-72h-${dateStr}.html`);
  } catch {
    // fallback caso window/DOM não permita
  }

  const isAuto = packageData.status === 'pendente de envio';
  const label = isAuto ? DOWNLINK_AUTONOMOUS_LABEL : DOWNLINK_ONLINE_LABEL;

  return {
    packageData,
    feedbackMessage: label,
    buttonLabel: label,
  };
}
