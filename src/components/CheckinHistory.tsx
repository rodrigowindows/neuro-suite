import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const MOOD_MAP: Record<string, { emoji: string; label: string; value: number; color: string }> = {
  great: { emoji: '🤩', label: 'Ótimo', value: 5, color: 'hsl(160, 84%, 39%)' },
  good:  { emoji: '😊', label: 'Bem', value: 4, color: 'hsl(168, 76%, 42%)' },
  okay:  { emoji: '😐', label: 'OK', value: 3, color: 'hsl(38, 92%, 50%)' },
  low:   { emoji: '😔', label: 'Baixo', value: 2, color: 'hsl(25, 95%, 53%)' },
  bad:   { emoji: '😩', label: 'Mal', value: 1, color: 'hsl(0, 84%, 60%)' },
};

interface CheckinDay {
  date: string;
  dayLabel: string;
  mood: string;
  moodValue: number;
  moodEmoji: string;
  moodColor: string;
  energy: number;
}

export default function CheckinHistory() {
  const { user } = useAuth();
  const [data, setData] = useState<CheckinDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const startDate = sevenDaysAgo.toISOString().split('T')[0];

      const { data: checkins } = await supabase
        .from('daily_checkins')
        .select('mood, energy_level, created_at')
        .eq('user_id', user.id)
        .gte('created_at', `${startDate}T00:00:00`)
        .order('created_at', { ascending: true });

      // Group by date, keep latest per day
      const byDate = new Map<string, { mood: string; energy: number }>();
      (checkins || []).forEach((c) => {
        const date = c.created_at?.split('T')[0] || '';
        byDate.set(date, { mood: c.mood, energy: c.energy_level });
      });

      // Build 7-day array
      const days: CheckinDay[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - 6 + i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
        const entry = byDate.get(dateStr);
        const moodInfo = entry ? MOOD_MAP[entry.mood] : null;

        days.push({
          date: dateStr,
          dayLabel: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1),
          mood: entry?.mood || '',
          moodValue: moodInfo?.value || 0,
          moodEmoji: moodInfo?.emoji || '',
          moodColor: moodInfo?.color || 'hsl(var(--muted))',
          energy: entry?.energy || 0,
        });
      }
      setData(days);
      setLoading(false);
    };
    fetchHistory();
  }, [user]);

  if (loading) return null;

  const hasData = data.some((d) => d.moodValue > 0);
  if (!hasData) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload as CheckinDay;
    if (!d.mood) return null;
    return (
      <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-xs">
        <p className="font-medium">{d.dayLabel} — {d.date}</p>
        <p>{d.moodEmoji} {MOOD_MAP[d.mood]?.label} • ⚡ {d.energy}/5</p>
      </div>
    );
  };

  return (
    <Card className="shadow-soft border-primary/20 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-accent via-primary to-accent" />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-5 w-5 text-primary" />
          Histórico — 7 dias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Mood emoji row */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {data.map((d) => (
            <div key={d.date} className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] text-muted-foreground">{d.dayLabel}</span>
              <span className="text-lg">{d.moodEmoji || '—'}</span>
            </div>
          ))}
        </div>

        {/* Energy bar chart */}
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="20%">
              <XAxis
                dataKey="dayLabel"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis domain={[0, 5]} hide />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="energy" radius={[4, 4, 0, 0]} maxBarSize={28}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.moodColor} opacity={d.energy > 0 ? 0.7 : 0.15} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Barras = energia • Emoji = humor do dia
        </p>
      </CardContent>
    </Card>
  );
}
