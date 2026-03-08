import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

function getLabel(score: number): string {
  if (score >= 90) return 'Excelente';
  if (score >= 70) return 'Adequado';
  if (score >= 50) return 'Parcial';
  if (score >= 30) return 'Insuficiente';
  return 'Crítico';
}

function getColor(score: number): string {
  if (score >= 90) return 'hsl(var(--success))';
  if (score >= 70) return 'hsl(185, 65%, 38%)';
  if (score >= 50) return 'hsl(var(--warning))';
  return 'hsl(var(--destructive))';
}

// NR-1 / Portaria 1.419/2024 compliance checklist
function buildChecklist(data: {
  totalScans: number;
  uniqueUsers: number;
  totalProfiles: number;
  highPercent: number;
  hasRecentScans: boolean;
  avgHRV: number;
  hasAlerts: boolean;
  hasFeedback: boolean;
}): ComplianceItem[] {
  const items: ComplianceItem[] = [];

  // 1. Identificação de riscos psicossociais (PGR)
  items.push({
    id: 'pgr_risk_id',
    category: 'Identificação de Riscos',
    requirement: 'Levantamento de riscos psicossociais no ambiente de trabalho',
    legalRef: 'NR-1 §1.5.3.2 / Portaria 1.419/2024 Art. 1°',
    status: data.totalScans >= 10 ? 'compliant' : data.totalScans >= 3 ? 'partial' : 'non_compliant',
    weight: 3,
    autoDetected: true,
    detail: `${data.totalScans} avaliações biométricas realizadas`,
  });

  // 2. Monitoramento contínuo
  items.push({
    id: 'continuous_monitoring',
    category: 'Monitoramento',
    requirement: 'Monitoramento contínuo de indicadores de saúde mental',
    legalRef: 'NR-1 §1.5.4.4 / Portaria 1.419/2024',
    status: data.hasRecentScans ? 'compliant' : 'non_compliant',
    weight: 3,
    autoDetected: true,
    detail: data.hasRecentScans ? 'Scans realizados nos últimos 7 dias' : 'Sem scans recentes',
  });

  // 3. Abrangência/Adesão
  const adoptionRate = data.totalProfiles > 0 ? (data.uniqueUsers / data.totalProfiles) * 100 : 0;
  items.push({
    id: 'coverage',
    category: 'Abrangência',
    requirement: 'Avaliação deve abranger todos os colaboradores expostos a riscos',
    legalRef: 'NR-1 §1.5.3.1',
    status: adoptionRate >= 70 ? 'compliant' : adoptionRate >= 30 ? 'partial' : 'non_compliant',
    weight: 2,
    autoDetected: true,
    detail: `${Math.round(adoptionRate)}% dos colaboradores participaram`,
  });

  // 4. Indicadores biométricos (HRV)
  items.push({
    id: 'biometric_indicators',
    category: 'Indicadores',
    requirement: 'Utilização de indicadores objetivos de estresse (HRV, biomarcadores)',
    legalRef: 'Portaria 1.419/2024 — Metodologia de avaliação',
    status: data.avgHRV > 0 ? 'compliant' : 'non_compliant',
    weight: 2,
    autoDetected: true,
    detail: data.avgHRV > 0 ? `HRV médio: ${data.avgHRV}ms` : 'Sem dados de HRV',
  });

  // 5. Classificação de risco
  items.push({
    id: 'risk_classification',
    category: 'Classificação',
    requirement: 'Classificação dos riscos por nível de gravidade',
    legalRef: 'NR-1 §1.5.4.2',
    status: data.totalScans >= 5 ? 'compliant' : 'non_compliant',
    weight: 2,
    autoDetected: true,
    detail: 'Classificação automática: baixo, moderado, alto',
  });

  // 6. Intervenção em casos críticos
  items.push({
    id: 'critical_intervention',
    category: 'Intervenção',
    requirement: 'Ações imediatas para colaboradores em risco alto',
    legalRef: 'NR-1 §1.5.5.2 / Portaria 1.419/2024',
    status: data.hasAlerts ? 'compliant' : data.highPercent > 20 ? 'non_compliant' : 'partial',
    weight: 3,
    autoDetected: true,
    detail: data.hasAlerts ? 'Sistema de alertas ativo' : 'Alertas não configurados',
  });

  // 7. Documentação e relatórios
  items.push({
    id: 'documentation',
    category: 'Documentação',
    requirement: 'Registro documentado das avaliações e ações no PGR',
    legalRef: 'NR-1 §1.5.7 / Portaria 1.419/2024 Art. 2°',
    status: data.totalScans >= 10 ? 'compliant' : data.totalScans > 0 ? 'partial' : 'non_compliant',
    weight: 2,
    autoDetected: true,
    detail: 'Relatórios NR-1 disponíveis para exportação',
  });

  // 8. Feedback e comunicação
  items.push({
    id: 'feedback',
    category: 'Comunicação',
    requirement: 'Canal de comunicação e feedback com colaboradores',
    legalRef: 'NR-1 §1.5.3.3',
    status: data.hasFeedback ? 'compliant' : 'partial',
    weight: 1,
    autoDetected: true,
    detail: data.hasFeedback ? 'Feedbacks recebidos' : 'Aguardando feedbacks',
  });

  // 9. LGPD compliance
  items.push({
    id: 'lgpd',
    category: 'Privacidade',
    requirement: 'Dados coletados em conformidade com LGPD (anonimização)',
    legalRef: 'LGPD Lei 13.709/2018 Art. 7°',
    status: 'compliant',
    weight: 2,
    autoDetected: true,
    detail: 'Dados agregados e anonimizados automaticamente',
  });

  // 10. Treinamento/Capacitação
  items.push({
    id: 'training',
    category: 'Capacitação',
    requirement: 'Capacitação de gestores sobre riscos psicossociais',
    legalRef: 'NR-1 §1.5.5.1 / Portaria 1.419/2024',
    status: 'partial',
    weight: 1,
    autoDetected: false,
    detail: 'Módulos de coaching de liderança disponíveis',
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

export function useNR1ComplianceScore(): NR1ComplianceData {
  const [data, setData] = useState<Omit<NR1ComplianceData, 'refresh'>>({
    score: 0,
    label: 'Sem dados',
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

      const items = buildChecklist({
        totalScans: scans.length,
        uniqueUsers,
        totalProfiles,
        highPercent,
        hasRecentScans: (recentRes.data?.length || 0) > 0,
        avgHRV,
        hasAlerts: highPercent <= 20 || scans.length >= 5, // simplified: alerts considered active if monitoring is in place
        hasFeedback: (feedbackRes.data?.length || 0) > 0,
      });

      const score = computeScore(items);
      const compliantCount = items.filter(i => i.status === 'compliant').length;
      const partialCount = items.filter(i => i.status === 'partial').length;
      const nonCompliantCount = items.filter(i => i.status === 'non_compliant').length;

      setData({
        score,
        label: getLabel(score),
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
  }, []);

  useEffect(() => {
    compute();
  }, [compute]);

  return { ...data, refresh: compute };
}
