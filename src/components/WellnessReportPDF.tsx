import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStressData } from '@/hooks/useStressData';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const MOOD_LABELS: Record<string, string> = {
  great: '🤩 Ótimo', good: '😊 Bem', okay: '😐 OK', low: '😔 Baixo', bad: '😩 Mal',
};
const MOOD_VALUES: Record<string, number> = {
  great: 5, good: 4, okay: 3, low: 2, bad: 1,
};

export default function WellnessReportPDF() {
  const { user } = useAuth();
  const { stats, trend, consecutiveHighDays } = useStressData({ days: 30, filterByUser: true });
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    if (!user) return;
    setGenerating(true);

    try {
      // Fetch check-ins (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [{ data: checkins }, { data: scans }, { data: profile }, { data: progress }] = await Promise.all([
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
        supabase.from('profiles').select('full_name, preferred_name, email').eq('id', user.id).single(),
        supabase.from('user_progress').select('*').eq('user_id', user.id).maybeSingle(),
      ]);

      const userName = profile?.preferred_name || profile?.full_name || user.email || 'Colaborador';
      const now = new Date().toLocaleDateString('pt-BR');

      // Compute check-in averages
      const avgMood = checkins && checkins.length > 0
        ? (checkins.reduce((s, c) => s + (MOOD_VALUES[c.mood] || 3), 0) / checkins.length).toFixed(1)
        : 'N/A';
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

      // Build check-in history table
      const checkinRows = (checkins || []).slice(0, 15).map(c => {
        const date = new Date(c.created_at!).toLocaleDateString('pt-BR');
        return `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;">${date}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;">${MOOD_LABELS[c.mood] || c.mood}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;">${c.energy_level}/5</td>
        </tr>`;
      }).join('');

      // Build stress bar chart (CSS-based)
      const stressBarChart = totalScans > 0 ? `
        <div style="display:flex;gap:16px;align-items:end;height:120px;margin:12px 0;">
          <div style="flex:1;text-align:center;">
            <div style="background:rgba(34,197,94,0.6);height:${Math.max((lowScans / totalScans) * 100, 2)}px;border-radius:4px 4px 0 0;"></div>
            <div style="font-size:10px;margin-top:4px;">Baixo<br><b>${Math.round((lowScans / totalScans) * 100)}%</b></div>
          </div>
          <div style="flex:1;text-align:center;">
            <div style="background:rgba(234,179,8,0.6);height:${Math.max((modScans / totalScans) * 100, 2)}px;border-radius:4px 4px 0 0;"></div>
            <div style="font-size:10px;margin-top:4px;">Moderado<br><b>${Math.round((modScans / totalScans) * 100)}%</b></div>
          </div>
          <div style="flex:1;text-align:center;">
            <div style="background:rgba(239,68,68,0.6);height:${Math.max((highScans / totalScans) * 100, 2)}px;border-radius:4px 4px 0 0;"></div>
            <div style="font-size:10px;margin-top:4px;">Alto<br><b>${Math.round((highScans / totalScans) * 100)}%</b></div>
          </div>
        </div>
      ` : '<p style="color:#999;">Sem dados de scans no período.</p>';

      // Risk assessment
      let riskLevel = '✅ Baixo';
      let riskColor = '#22c55e';
      if (consecutiveHighDays >= 5 || stats.highPercent > 60) {
        riskLevel = '🚨 Crítico';
        riskColor = '#ef4444';
      } else if (consecutiveHighDays >= 3 || stats.highPercent > 30) {
        riskLevel = '⚠️ Moderado';
        riskColor = '#eab308';
      }

      const trendText = trend
        ? trend.direction === 'improving' ? '📉 Melhorando' : trend.direction === 'worsening' ? '📈 Piorando' : '➡️ Estável'
        : 'Dados insuficientes';

      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Bem-Estar - ${userName}</title>
  <style>
    @media print { body { margin: 0; } @page { margin: 1.5cm; } .no-print { display: none; } }
    body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px; color: #222; font-size: 12px; line-height: 1.6; }
    h1 { margin: 0; font-size: 22px; color: #1a3a4a; }
    h2 { font-size: 14px; color: #1a3a4a; border-bottom: 2px solid #1a7a7a; padding-bottom: 4px; margin: 24px 0 12px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 16px 0; }
    .stat-card { text-align: center; padding: 12px; background: #f4f6f8; border-radius: 8px; }
    .stat-value { font-size: 20px; font-weight: 700; color: #1a7a7a; }
    .stat-label { font-size: 10px; color: #666; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #1a7a7a; color: white; padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
    .risk-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 13px; }
  </style>
</head>
<body>
  <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #1a7a7a;padding-bottom:12px;margin-bottom:20px;">
    <div>
      <h1>Relatório de Bem-Estar</h1>
      <p style="margin:4px 0 0;font-size:11px;color:#888;">${userName} · Gerado em ${now} · NeuroSuite v1.0</p>
    </div>
    <div style="font-size:28px;font-weight:800;color:#1a7a7a;">NS</div>
  </div>

  <div style="background:linear-gradient(135deg,#f0fdf4,#ecfeff);padding:16px;border-radius:10px;margin-bottom:20px;">
    <div style="display:flex;align-items:center;gap:12px;">
      <span class="risk-badge" style="background:${riskColor}20;color:${riskColor};">${riskLevel}</span>
      <span style="font-size:11px;color:#666;">Tendência: ${trendText}</span>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card"><div class="stat-value">${totalScans}</div><div class="stat-label">Scans (30d)</div></div>
    <div class="stat-card"><div class="stat-value">${avgHRV > 0 ? avgHRV + 'ms' : 'N/A'}</div><div class="stat-label">HRV Médio</div></div>
    <div class="stat-card"><div class="stat-value">${avgMood}</div><div class="stat-label">Humor Médio (1-5)</div></div>
    <div class="stat-card"><div class="stat-value">${avgEnergy}</div><div class="stat-label">Energia Média (1-5)</div></div>
  </div>

  <h2>📊 Distribuição de Estresse (30 dias)</h2>
  ${stressBarChart}

  <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);">
    <div class="stat-card" style="background:#dcfce720;"><div class="stat-value" style="color:#22c55e;">${stats.lowPercent}%</div><div class="stat-label">Baixo</div></div>
    <div class="stat-card" style="background:#fef9c320;"><div class="stat-value" style="color:#eab308;">${stats.moderatePercent}%</div><div class="stat-label">Moderado</div></div>
    <div class="stat-card" style="background:#fee2e220;"><div class="stat-value" style="color:#ef4444;">${stats.highPercent}%</div><div class="stat-label">Alto</div></div>
  </div>

  ${consecutiveHighDays > 0 ? `<p style="background:#fef2f2;padding:8px 12px;border-radius:6px;border-left:3px solid #ef4444;font-size:11px;">⚠️ <b>${consecutiveHighDays} dia(s) consecutivo(s)</b> com maioria de estresse alto.</p>` : ''}

  <h2>😊 Histórico de Check-ins (últimos 15)</h2>
  ${checkinRows ? `
    <table>
      <thead><tr><th>Data</th><th>Humor</th><th>Energia</th></tr></thead>
      <tbody>${checkinRows}</tbody>
    </table>
  ` : '<p style="color:#999;">Nenhum check-in registrado no período.</p>'}

  <h2>🏆 Gamificação</h2>
  <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);">
    <div class="stat-card"><div class="stat-value">${progress?.total_scans || 0}</div><div class="stat-label">Total Scans</div></div>
    <div class="stat-card"><div class="stat-value">${progress?.current_streak || 0}🔥</div><div class="stat-label">Streak Atual</div></div>
    <div class="stat-card"><div class="stat-value">${progress?.longest_streak || 0}</div><div class="stat-label">Maior Streak</div></div>
  </div>

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #ddd;font-size:10px;color:#999;text-align:center;">
    Relatório confidencial gerado automaticamente por NeuroSuite · Lincolnectd Neurobusiness · LGPD Compliance<br>
    Período: últimos 30 dias · Dados anonimizados conforme política de privacidade
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const w = window.open(url, '_blank');
      if (!w) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-bemestar-${new Date().toISOString().split('T')[0]}.html`;
        a.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast.success('Relatório gerado! Use Ctrl+P / Cmd+P para salvar como PDF.');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar relatório');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button onClick={generate} disabled={generating} variant="outline" size="sm" className="gap-1.5">
      {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
      {generating ? 'Gerando...' : 'Relatório PDF'}
    </Button>
  );
}
