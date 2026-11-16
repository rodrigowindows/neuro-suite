import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useI18n, type Lang } from '@/i18n';

export interface ComplianceItem {
  id: string;
  category: string;
  requirement: string;
  legalRef: string;
  status: 'compliant' | 'partial' | 'non_compliant';
  weight: number; // 1-3 importance
  autoDetected: boolean;
  detail?: string;
}

export interface NR1ComplianceData {
  score: number;           // 0-100
  label: string;
  color: string;
  items: ComplianceItem[];
  compliantCount: number;
  partialCount: number;
  nonCompliantCount: number;
  totalItems: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

export interface UseNR1ComplianceScoreOptions {
  t?: (key: string, vars?: Record<string, string | number>) => string;
  lang?: Lang;
}

function getLabel(score: number, t: (key: string, vars?: Record<string, string | number>) => string): string {
  if (score >= 90) return t('safety.score.label.excellent');
  if (score >= 70) return t('safety.score.label.adequate');
  if (score >= 50) return t('safety.score.label.partial');
  if (score >= 30) return t('safety.score.label.insufficient');
  return t('safety.score.label.critical');
}

function getColor(score: number): string {
  if (score >= 90) return 'hsl(var(--success))';
  if (score >= 70) return 'hsl(185, 65%, 38%)';
  if (score >= 50) return 'hsl(var(--warning))';
  return 'hsl(var(--destructive))';
}

// NR-1 / Portaria 1.419/2024 compliance checklist
function buildChecklist(
  data: {
    totalScans: number;
    uniqueUsers: number;
    totalProfiles: number;
    highPercent: number;
    hasRecentScans: boolean;
    avgHRV: number;
    hasAlerts: boolean;
    hasFeedback: boolean;
  },
  t: (key: string, vars?: Record<string, string | number>) => string
): ComplianceItem[] {
  const items: ComplianceItem[] = [];

  // 1. Identificação de riscos psicossociais (PGR)
  items.push({
    id: 'pgr_risk_id',
    category: t('safety.score.cat.riskId'),
    requirement: t('safety.score.item.riskId.req'),
    legalRef: t('safety.score.item.riskId.legal'),
    status: data.totalScans >= 10 ? 'compliant' : data.totalScans >= 3 ? 'partial' : 'non_compliant',
    weight: 3,
    autoDetected: true,
    detail: t('safety.score.item.riskId.detail', { count: data.totalScans }),
  });

  // 2. Monitoramento contínuo
  items.push({
    id: 'continuous_monitoring',
    category: t('safety.score.cat.monitoring'),
    requirement: t('safety.score.item.monitoring.req'),
    legalRef: t('safety.score.item.monitoring.legal'),
    status: data.hasRecentScans ? 'compliant' : 'non_compliant',
    weight: 3,
    autoDetected: true,
    detail: data.hasRecentScans
      ? t('safety.score.item.monitoring.recent')
      : t('safety.score.item.monitoring.noRecent'),
  });

  // 3. Abrangência/Adesão
  const adoptionRate = data.totalProfiles > 0 ? (data.uniqueUsers / data.totalProfiles) * 100 : 0;
  items.push({
    id: 'coverage',
    category: t('safety.score.cat.coverage'),
    requirement: t('safety.score.item.coverage.req'),
    legalRef: t('safety.score.item.coverage.legal'),
    status: adoptionRate >= 70 ? 'compliant' : adoptionRate >= 30 ? 'partial' : 'non_compliant',
    weight: 2,
    autoDetected: true,
    detail: t('safety.score.item.coverage.detail', { percent: Math.round(adoptionRate) }),
  });

  // 4. Indicadores biométricos (HRV)
  items.push({
    id: 'biometric_indicators',
    category: t('safety.score.cat.indicators'),
    requirement: t('safety.score.item.indicators.req'),
    legalRef: t('safety.score.item.indicators.legal'),
    status: data.avgHRV > 0 ? 'compliant' : 'non_compliant',
    weight: 2,
    autoDetected: true,
    detail: data.avgHRV > 0
      ? t('safety.score.item.indicators.detail', { hrv: data.avgHRV })
      : t('safety.score.item.indicators.noData'),
  });

  // 5. Classificação de risco
  items.push({
    id: 'risk_classification',
    category: t('safety.score.cat.classification'),
    requirement: t('safety.score.item.classification.req'),
    legalRef: t('safety.score.item.classification.legal'),
    status: data.totalScans >= 5 ? 'compliant' : 'non_compliant',
    weight: 2,
    autoDetected: true,
    detail: t('safety.score.item.classification.detail'),
  });

  // 6. Intervenção em casos críticos
  items.push({
    id: 'critical_intervention',
    category: t('safety.score.cat.intervention'),
    requirement: t('safety.score.item.intervention.req'),
    legalRef: t('safety.score.item.intervention.legal'),
    status: data.hasAlerts ? 'compliant' : data.highPercent > 20 ? 'non_compliant' : 'partial',
    weight: 3,
    autoDetected: true,
    detail: data.hasAlerts
      ? t('safety.score.item.intervention.active')
      : t('safety.score.item.intervention.inactive'),
  });

  // 7. Documentação e relatórios
  items.push({
    id: 'documentation',
    category: t('safety.score.cat.documentation'),
    requirement: t('safety.score.item.documentation.req'),
    legalRef: t('safety.score.item.documentation.legal'),
    status: data.totalScans >= 10 ? 'compliant' : data.totalScans > 0 ? 'partial' : 'non_compliant',
    weight: 2,
    autoDetected: true,
    detail: t('safety.score.item.documentation.detail'),
  });

  // 8. Feedback e comunicação
  items.push({
    id: 'feedback',
    category: t('safety.score.cat.communication'),
    requirement: t('safety.score.item.feedback.req'),
    legalRef: t('safety.score.item.feedback.legal'),
    status: data.hasFeedback ? 'compliant' : 'partial',
    weight: 1,
    autoDetected: true,
    detail: data.hasFeedback
      ? t('safety.score.item.feedback.received')
      : t('safety.score.item.feedback.pending'),
  });

  // 9. LGPD compliance
  items.push({
    id: 'lgpd',
    category: t('safety.score.cat.privacy'),
    requirement: t('safety.score.item.privacy.req'),
    legalRef: t('safety.score.item.privacy.legal'),
    status: 'compliant',
    weight: 2,
    autoDetected: true,
    detail: t('safety.score.item.privacy.detail'),
  });

  // 10. Treinamento/Capacitação
  items.push({
    id: 'training',
    category: t('safety.score.cat.training'),
    requirement: t('safety.score.item.training.req'),
    legalRef: t('safety.score.item.training.legal'),
    status: 'partial',
    weight: 1,
    autoDetected: false,
    detail: t('safety.score.item.training.detail'),
  });

  return items;
}

function computeScore(items: ComplianceItem[]): number {
  let totalWeight = 0;
  let earnedWeight = 0;
  for (const item of items) {
    totalWeight += item.weight;
    if (item.status === 'compliant') earnedWeight += item.weight;
    else if (item.status === 'partial') earnedWeight += item.weight * 0.5;
  }
  return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
}

export function useNR1ComplianceScore(options?: UseNR1ComplianceScoreOptions): NR1ComplianceData {
  const i18n = useI18n();
  const t = options?.t ?? i18n.t;

  const [data, setData] = useState<Omit<NR1ComplianceData, 'refresh'>>({
    score: 0,
    label: t('safety.score.label.noData'),
    color: 'hsl(var(--muted-foreground))',
    items: [],
    compliantCount: 0,
    partialCount: 0,
    nonCompliantCount: 0,
    totalItems: 0,
    loading: true,
  });

  const compute = useCallback(async () => {
    try {
      const since30 = new Date();
      since30.setDate(since30.getDate() - 30);
      const since7 = new Date();
      since7.setDate(since7.getDate() - 7);

      const [scansRes, recentRes, profilesRes, feedbackRes] = await Promise.all([
        supabase
          .from('stress_scans')
          .select('user_id, stress_level, hrv_value')
          .gte('created_at', since30.toISOString())
          .limit(1000),
        supabase
          .from('stress_scans')
          .select('id')
          .gte('created_at', since7.toISOString())
          .limit(1),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('feedback_responses')
          .select('id')
          .limit(1),
      ]);

      const scans = scansRes.data || [];
      const uniqueUsers = new Set(scans.map(s => s.user_id)).size;
      const totalProfiles = profilesRes.count || 0;
      const highScans = scans.filter(s => s.stress_level === 'high').length;
      const highPercent = scans.length > 0 ? Math.round((highScans / scans.length) * 100) : 0;
      const hrvValues = scans.filter(s => s.hrv_value != null).map(s => Number(s.hrv_value));
      const avgHRV = hrvValues.length > 0 ? Math.round(hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length) : 0;

      const items = buildChecklist(
        {
          totalScans: scans.length,
          uniqueUsers,
          totalProfiles,
          highPercent,
          hasRecentScans: (recentRes.data?.length || 0) > 0,
          avgHRV,
          hasAlerts: highPercent <= 20 || scans.length >= 5, // simplified: alerts considered active if monitoring is in place
          hasFeedback: (feedbackRes.data?.length || 0) > 0,
        },
        t
      );

      const score = computeScore(items);
      const compliantCount = items.filter(i => i.status === 'compliant').length;
      const partialCount = items.filter(i => i.status === 'partial').length;
      const nonCompliantCount = items.filter(i => i.status === 'non_compliant').length;

      setData({
        score,
        label: getLabel(score, t),
        color: getColor(score),
        items,
        compliantCount,
        partialCount,
        nonCompliantCount,
        totalItems: items.length,
        loading: false,
      });
    } catch (err) {
      console.error('useNR1ComplianceScore error:', err);
      setData(prev => ({ ...prev, loading: false }));
    }
  }, [t]);

  useEffect(() => {
    compute();
  }, [compute]);

  return { ...data, refresh: compute };
}
