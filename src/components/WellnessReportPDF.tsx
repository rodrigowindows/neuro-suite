/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStressData } from '@/hooks/useStressData';
import { useI18n, translate, type Lang } from '@/i18n';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const COGNITIVE_LOAD_LABELS: Record<string, string> = {
  great: translate('pt', 'checkin.report.load.great'),
  good: translate('pt', 'checkin.report.load.good'),
  okay: translate('pt', 'checkin.report.load.okay'),
  low: translate('pt', 'checkin.report.load.low'),
  bad: translate('pt', 'checkin.report.load.bad'),
};

export const COGNITIVE_LOAD_LABELS_EN: Record<string, string> = {
  great: translate('en', 'checkin.report.load.great'),
  good: translate('en', 'checkin.report.load.good'),
  okay: translate('en', 'checkin.report.load.okay'),
  low: translate('en', 'checkin.report.load.low'),
  bad: translate('en', 'checkin.report.load.bad'),
};

export const COGNITIVE_LOAD_VALUES: Record<string, number> = {
  great: 5, good: 4, okay: 3, low: 2, bad: 1,
};

export interface BuildWellnessReportParams {
  userName: string;
  now: string;
  scans: Array<{ stress_level: string; hrv_value?: number | null; blink_rate?: number; created_at?: string | null }>;
  checkins: Array<{ mood: string; energy_level: number; created_at?: string | null; ai_response?: string | null }>;
  profile: { full_name?: string | null; preferred_name?: string | null; email?: string | null; horas_sono?: number | null; treino_realizado?: string | null } | null;
  stats?: { lowPercent: number; moderatePercent: number; highPercent: number };
  trend?: { direction: string } | null;
  consecutiveHighDays?: number;
  periodLabel?: string;
  lang?: Lang;
}

export function buildWellnessReportHtml({
  userName,
  now,
  scans = [],
  checkins = [],
  profile,
  stats: propStats,
  trend,
  consecutiveHighDays = 0,
  periodLabel = '30 dias',
  lang = 'pt',
}: BuildWellnessReportParams): string {
  const isEn = lang === 'en';
  const t = (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars);

  const effectivePeriodLabel = isEn
    ? periodLabel === '30 dias'
      ? t('checkin.report.default_period')
      : periodLabel
    : periodLabel || t('checkin.report.default_period');

  // Compute averages
  const avgEnergy = checkins && checkins.length > 0
    ? (checkins.reduce((s, c) => s + c.energy_level, 0) / checkins.length).toFixed(1)
    : 'N/A';

  // Stress distribution from scans
  const totalScans = scans?.length || 0;
  const highScans = scans?.filter(s => s.stress_level === 'high').length || 0;
  const modScans = scans?.filter(s => s.stress_level === 'moderate').length || 0;
  const lowScans = scans?.filter(s => s.stress_level === 'low').length || 0;
  const hrvValues = scans?.filter(s => s.hrv_value).map(s => Number(s.hrv_value)) || [];
  const avgHRV = hrvValues.length > 0 ? Math.round(hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length) : 0;

  const lowPercent = totalScans > 0 ? Math.round((lowScans / totalScans) * 100) : (propStats?.lowPercent ?? 0);
  const modPercent = totalScans > 0 ? Math.round((modScans / totalScans) * 100) : (propStats?.moderatePercent ?? 0);
  const highPercent = totalScans > 0 ? Math.round((highScans / totalScans) * 100) : (propStats?.highPercent ?? 0);

  const sleepHoursText = profile?.horas_sono !== null && profile?.horas_sono !== undefined
    ? `${profile.horas_sono}h`
    : t('checkin.report.not_reported');

  const exerciseLogText = profile?.treino_realizado
    ? profile.treino_realizado
    : t('checkin.report.not_recorded');

  // Build check-in history table
  const labelMap = isEn ? COGNITIVE_LOAD_LABELS_EN : COGNITIVE_LOAD_LABELS;
  const checkinRows = (checkins || []).slice(0, 15).map(c => {
    const date = new Date(c.created_at!).toLocaleDateString(isEn ? 'en-US' : 'pt-BR');
    return `<tr>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;">${date}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;">${labelMap[c.mood] || c.mood}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;">${c.energy_level}/5</td>
    </tr>`;
  }).join('');

  // Build stress bar chart (CSS-based)
  const lowLabel = t('checkin.report.dist.nominal');
  const modLabel = t('checkin.report.dist.moderate');
  const highLabel = t('checkin.report.dist.elevated');
  const emptyScansText = t('checkin.report.dist.no_scans');

  const stressBarChart = totalScans > 0 ? `
    <div style="display:flex;gap:16px;align-items:end;height:120px;margin:12px 0;">
      <div style="flex:1;text-align:center;">
        <div style="background:rgba(34,197,94,0.6);height:${Math.max((lowScans / totalScans) * 100, 2)}px;border-radius:4px 4px 0 0;"></div>
        <div style="font-size:10px;margin-top:4px;">${lowLabel}<br><b>${lowPercent}%</b></div>
      </div>
      <div style="flex:1;text-align:center;">
        <div style="background:rgba(234,179,8,0.6);height:${Math.max((modScans / totalScans) * 100, 2)}px;border-radius:4px 4px 0 0;"></div>
        <div style="font-size:10px;margin-top:4px;">${modLabel}<br><b>${modPercent}%</b></div>
      </div>
      <div style="flex:1;text-align:center;">
        <div style="background:rgba(239,68,68,0.6);height:${Math.max((highScans / totalScans) * 100, 2)}px;border-radius:4px 4px 0 0;"></div>
        <div style="font-size:10px;margin-top:4px;">${highLabel}<br><b>${highPercent}%</b></div>
      </div>
    </div>
  ` : `<p style="color:#999;">${emptyScansText}</p>`;

  // Risk assessment
  let riskLevel = t('checkin.report.risk.nominal');
  let riskColor = '#22c55e';
  if (consecutiveHighDays >= 5 || highPercent > 60) {
    riskLevel = t('checkin.report.risk.critical');
    riskColor = '#ef4444';
  } else if (consecutiveHighDays >= 3 || highPercent > 30) {
    riskLevel = t('checkin.report.risk.moderate');
    riskColor = '#eab308';
  }

  const trendText = trend
    ? trend.direction === 'improving'
      ? t('checkin.report.trend.improving')
      : trend.direction === 'worsening'
      ? t('checkin.report.trend.worsening')
      : t('checkin.report.trend.stable')
    : t('checkin.report.trend.insufficient');

  const docTitle = `${t('checkin.report.doc_title')} - ${userName}`;
  const headerH1 = t('checkin.report.doc_title');
  const subtitle = t('checkin.report.generated_on', { userName, date: now });
  const trendPrefix = t('checkin.report.trend_prefix');
  const sectionMetrics = t('checkin.report.section.metrics', { period: effectivePeriodLabel });

  const scansMetricLabel = t('checkin.report.metrics.scans');
  const hrvMetricLabel = t('checkin.report.metrics.avg_hrv');
  const sleepMetricLabel = t('checkin.report.metrics.sleep');
  const readinessMetricLabel = t('checkin.report.metrics.readiness');

  const exerciseBox = `<b>${t('checkin.report.exercise_log')}</b> ${exerciseLogText}`;
  const sectionDist = t('checkin.report.section.distribution', { period: effectivePeriodLabel });

  const cardNominal = t('checkin.report.dist.nominal_card');
  const cardModerate = t('checkin.report.dist.moderate_card');
  const cardFatigue = t('checkin.report.dist.fatigue_card');

  const alertText = consecutiveHighDays > 0
    ? `<p style="background:#fef2f2;padding:8px 12px;border-radius:6px;border-left:3px solid #ef4444;font-size:11px;"><b>${t('checkin.report.operational_alert')}</b> ${t('checkin.report.consecutive_alert', { days: consecutiveHighDays })}</p>`
    : '';

  const sectionHistory = t('checkin.report.section.history');
  const thDate = t('checkin.report.th.date');
  const thCogLoad = t('checkin.report.th.cognitive_load');
  const thReadiness = t('checkin.report.th.readiness');
  const emptyHistory = `<p style="color:#999;">${t('checkin.report.no_history')}</p>`;

  const disclaimerLine1 = t('checkin.report.disclaimer_line1');
  const disclaimerLine2 = t('checkin.report.disclaimer_line2', { period: effectivePeriodLabel });

  return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'pt-BR'}">
<head>
  <meta charset="UTF-8">
  <title>${docTitle}</title>
  <style>
    @media print { body { margin: 0; } @page { margin: 1.5cm; } .no-print { display: none; } }
    body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px; color: #222; font-size: 12px; line-height: 1.6; }
    h1 { margin: 0; font-size: 20px; color: #1a3a4a; }
    h2 { font-size: 13px; color: #1a3a4a; border-bottom: 2px solid #1a7a7a; padding-bottom: 4px; margin: 22px 0 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 16px 0; }
    .stat-card { text-align: center; padding: 12px; background: #f4f6f8; border-radius: 8px; }
    .stat-value { font-size: 18px; font-weight: 700; color: #1a7a7a; }
    .stat-label { font-size: 10px; color: #666; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #1a7a7a; color: white; padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
    .risk-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 12px; }
    .info-box { background: #f8fafc; border-left: 3px solid #1a7a7a; padding: 10px 14px; border-radius: 4px; margin: 10px 0; font-size: 11px; }
    .disclaimer-footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 10px; color: #666; text-align: center; line-height: 1.5; }
  </style>
</head>
<body>
  <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #1a7a7a;padding-bottom:12px;margin-bottom:18px;">
    <div>
      <h1>${headerH1}</h1>
      <p style="margin:4px 0 0;font-size:11px;color:#888;">${subtitle}</p>
    </div>
    <div style="font-size:24px;font-weight:800;color:#1a7a7a;letter-spacing:1px;">CREWVITALS</div>
  </div>

  <div style="background:linear-gradient(135deg,#f0fdf4,#ecfeff);padding:14px;border-radius:8px;margin-bottom:18px;">
    <div style="display:flex;align-items:center;gap:12px;">
      <span class="risk-badge" style="background:${riskColor}20;color:${riskColor};">${riskLevel}</span>
      <span style="font-size:11px;color:#555;">${trendPrefix} <b>${trendText}</b></span>
    </div>
  </div>

  <h2>${sectionMetrics}</h2>
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-value">${totalScans}</div><div class="stat-label">${scansMetricLabel}</div></div>
    <div class="stat-card"><div class="stat-value">${avgHRV > 0 ? avgHRV + 'ms' : 'N/A'}</div><div class="stat-label">${hrvMetricLabel}</div></div>
    <div class="stat-card"><div class="stat-value">${sleepHoursText}</div><div class="stat-label">${sleepMetricLabel}</div></div>
    <div class="stat-card"><div class="stat-value">${avgEnergy}/5</div><div class="stat-label">${readinessMetricLabel}</div></div>
  </div>

  <div class="info-box">
    ${exerciseBox}
  </div>

  <h2>${sectionDist}</h2>
  ${stressBarChart}

  <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);">
    <div class="stat-card" style="background:#dcfce720;"><div class="stat-value" style="color:#22c55e;">${lowPercent}%</div><div class="stat-label">${cardNominal}</div></div>
    <div class="stat-card" style="background:#fef9c320;"><div class="stat-value" style="color:#eab308;">${modPercent}%</div><div class="stat-label">${cardModerate}</div></div>
    <div class="stat-card" style="background:#fee2e220;"><div class="stat-value" style="color:#ef4444;">${highPercent}%</div><div class="stat-label">${cardFatigue}</div></div>
  </div>

  ${alertText}

  <h2>${sectionHistory}</h2>
  ${checkinRows ? `
    <table>
      <thead><tr><th>${thDate}</th><th>${thCogLoad}</th><th>${thReadiness}</th></tr></thead>
      <tbody>${checkinRows}</tbody>
    </table>
  ` : emptyHistory}

  <div class="disclaimer-footer">
    <b>${disclaimerLine1}</b><br>
    ${disclaimerLine2}
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;
}

export function openOrDownloadHtmlReport(html: string, filename?: string, lang: Lang = 'pt'): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  let w: Window | null = null;
  try {
    w = window.open(url, '_blank');
  } catch {
    w = null;
  }
  if (!w) {
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    const defaultName = lang === 'en'
      ? `crew-health-telemetry-report-${dateStr}.html`
      : `relatorio-telemetria-tripulacao-${dateStr}.html`;
    a.download = filename || defaultName;
    try {
      a.click();
    } catch {
      // ignore
    }
  }
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export default function WellnessReportPDF() {
  const { user } = useAuth();
  const { lang, t } = useI18n();
  const { stats, trend, consecutiveHighDays } = useStressData({ days: 30, filterByUser: true });
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    if (!user) return;
    setGenerating(true);

    try {
      // Fetch check-ins (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [{ data: checkins }, { data: scans }, { data: profile }] = await Promise.all([
        supabase
          .from('daily_checkins')
          .select('mood, energy_level, created_at, ai_response')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false }),
        supabase
          .from('stress_scans')
          .select('stress_level, hrv_value, blink_rate, created_at')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('full_name, preferred_name, email, horas_sono, treino_realizado')
          .eq('id', user.id)
          .single(),
      ]);

      const defaultUser = lang === 'en' ? 'Crew Member' : 'Tripulante';
      const userName = profile?.preferred_name || profile?.full_name || user.email || defaultUser;
      const now = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'pt-BR');

      const html = buildWellnessReportHtml({
        userName,
        now,
        scans: scans || [],
        checkins: checkins || [],
        profile: profile || null,
        stats,
        trend,
        consecutiveHighDays,
        periodLabel: lang === 'en' ? '30 days' : '30 dias',
        lang,
      });

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = lang === 'en'
        ? `crew-health-telemetry-report-${dateStr}.html`
        : `relatorio-telemetria-tripulacao-${dateStr}.html`;

      openOrDownloadHtmlReport(html, filename, lang);
      toast.success(t('checkin.report.success'));
    } catch (err) {
      console.error(err);
      toast.error(t('checkin.report.error'));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button onClick={generate} disabled={generating} variant="outline" size="sm" className="gap-1.5">
      {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
      {generating ? t('checkin.report.generating') : t('checkin.report.button')}
    </Button>
  );
}
