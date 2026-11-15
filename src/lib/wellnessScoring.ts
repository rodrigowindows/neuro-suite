// Pontuação de bem-estar pura (sem dependências de hook/supabase).
// Reexportada por useWellnessScore para manter os imports existentes.

export function computeStressScore(scans: { stress_level: string }[]): number {
  if (scans.length === 0) return 0;
  const recent = scans.slice(0, 10); // last 10 scans
  const points = recent.map(s => {
    if (s.stress_level === 'low') return 40;
    if (s.stress_level === 'moderate') return 24;
    return 8; // high
  });
  return Math.round(points.reduce((a, b) => a + b, 0) / points.length);
}

export function computeConsistencyScore(streak: number, totalScans: number): number {
  // Streak contributes up to 20 points (max at 14 days)
  const streakPart = Math.min(streak / 14, 1) * 20;
  // Total scans contribute up to 10 points (max at 30 scans)
  const scansPart = Math.min(totalScans / 30, 1) * 10;
  return Math.round(streakPart + scansPart);
}

export function computeHrvScore(scans: { hrv_value: number | null }[]): number {
  const withHrv = scans.filter(s => s.hrv_value != null);
  if (withHrv.length === 0) return 15; // neutral default
  const avgHrv = withHrv.reduce((sum, s) => sum + (s.hrv_value ?? 0), 0) / withHrv.length;
  // HRV 20-80ms range mapped to 0-30 points
  return Math.round(Math.min(Math.max((avgHrv - 20) / 60, 0), 1) * 30);
}
