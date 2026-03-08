import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface TrendData {
  date: string;
  label: string;
  stressScore: number;
  hrvAvg: number | null;
  scansCount: number;
}

export default function StressTrendChart() {
  const [data, setData] = useState<TrendData[]>([]);
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrends();
  }, [period]);

  const loadTrends = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(period));

      const { data: scans, error } = await supabase
        .from('stress_scans')
        .select('stress_level, hrv_value, created_at')
        .eq('user_id', user.id)
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const grouped = new Map<string, { levels: string[]; hrvs: number[] }>();
      scans?.forEach((scan) => {
        const date = new Date(scan.created_at!).toISOString().split('T')[0];
        if (!grouped.has(date)) grouped.set(date, { levels: [], hrvs: [] });
        const g = grouped.get(date)!;
        g.levels.push(scan.stress_level);
        if (scan.hrv_value) g.hrvs.push(scan.hrv_value);
      });

      const stressToScore = (level: string) => {
        if (level === 'high') return 3;
        if (level === 'moderate') return 2;
        return 1;
      };

      const trends: TrendData[] = [];
      grouped.forEach((val, date) => {
        const avgScore = val.levels.reduce((sum, l) => sum + stressToScore(l), 0) / val.levels.length;
        const avgHrv = val.hrvs.length > 0 ? val.hrvs.reduce((a, b) => a + b, 0) / val.hrvs.length : null;
        const d = new Date(date);
        trends.push({
          date,
          label: `${d.getDate()}/${d.getMonth() + 1}`,
          stressScore: Math.round(avgScore * 100) / 100,
          hrvAvg: avgHrv ? Math.round(avgHrv) : null,
          scansCount: val.levels.length,
        });
      });

      setData(trends);
    } catch (err) {
      console.error('Error loading trends:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTrend = () => {
    if (data.length < 2) return { icon: Minus, text: 'Dados insuficientes', color: 'text-muted-foreground' };
    const first = data.slice(0, Math.ceil(data.length / 2));
    const second = data.slice(Math.ceil(data.length / 2));
    const avgFirst = first.reduce((s, d) => s + d.stressScore, 0) / first.length;
    const avgSecond = second.reduce((s, d) => s + d.stressScore, 0) / second.length;
    if (avgSecond < avgFirst - 0.2) return { icon: TrendingDown, text: 'Estresse diminuindo ✅', color: 'text-success' };
    if (avgSecond > avgFirst + 0.2) return { icon: TrendingUp, text: 'Estresse aumentando ⚠️', color: 'text-destructive' };
    return { icon: Minus, text: 'Estável', color: 'text-muted-foreground' };
  };

  const trend = getTrend();
  const totalScans = data.reduce((s, d) => s + d.scansCount, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-primary" />
              Evolução do Estresse
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {totalScans} scans no período
            </CardDescription>
          </div>
          <Select value={period} onValueChange={(v) => setPeriod(v as '7' | '30' | '90')}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium ${trend.color}`}>
          <trend.icon className="h-3.5 w-3.5" />
          {trend.text}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <p>Nenhum scan encontrado neste período.</p>
            <p className="text-xs mt-1">Faça scans regularmente para acompanhar sua evolução.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stress Score Chart */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Nível de Estresse (1=Baixo, 3=Alto)</p>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0.5, 3.5]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: number) => [val <= 1.5 ? '😊 Baixo' : val <= 2.3 ? '😐 Moderado' : '😟 Alto', 'Estresse']}
                  />
                  <Area type="monotone" dataKey="stressScore" stroke="hsl(var(--primary))" fill="url(#stressGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* HRV Chart */}
            {data.some(d => d.hrvAvg !== null) && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">HRV Médio (ms) — maior = melhor</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={data.filter(d => d.hrvAvg !== null)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val: number) => [`${val}ms`, 'HRV']}
                    />
                    <Line type="monotone" dataKey="hrvAvg" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: 'hsl(var(--accent))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
