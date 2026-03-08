import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';

const MOOD_VALUES: Record<string, number> = {
  great: 5, good: 4, okay: 3, low: 2, bad: 1,
};

interface WeekSummary {
  avgMood: number;
  avgEnergy: number;
  count: number;
}

function getWeekRange(weeksAgo: number): { start: string; end: string } {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() - weeksAgo * 7);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

function computeAvg(checkins: { mood: string; energy_level: number }[]): WeekSummary {
  if (checkins.length === 0) return { avgMood: 0, avgEnergy: 0, count: 0 };
  const totalMood = checkins.reduce((s, c) => s + (MOOD_VALUES[c.mood] || 3), 0);
  const totalEnergy = checkins.reduce((s, c) => s + c.energy_level, 0);
  return {
    avgMood: Math.round((totalMood / checkins.length) * 10) / 10,
    avgEnergy: Math.round((totalEnergy / checkins.length) * 10) / 10,
    count: checkins.length,
  };
}

function DiffBadge({ current, previous, label, unit }: { current: number; previous: number; label: string; unit: string }) {
  if (previous === 0) return null;
  const diff = Math.round((current - previous) * 10) / 10;
  const isUp = diff > 0;
  const isDown = diff < 0;

  return (
    <div className="flex items-center gap-1.5">
      {isUp ? (
        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
      ) : isDown ? (
        <TrendingDown className="h-3.5 w-3.5 text-red-400" />
      ) : (
        <Minus className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      <span className={`text-xs font-semibold ${isUp ? 'text-emerald-500' : isDown ? 'text-red-400' : 'text-muted-foreground'}`}>
        {isUp ? '+' : ''}{diff} {unit}
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

const MOOD_LABELS: Record<number, string> = {
  1: '😩 Mal', 2: '😔 Baixo', 3: '😐 OK', 4: '😊 Bem', 5: '🤩 Ótimo',
};

function moodLabel(val: number): string {
  const rounded = Math.round(val);
  return MOOD_LABELS[rounded] || `${val}`;
}

export default function WeeklyComparison() {
  const { user } = useAuth();
  const [current, setCurrent] = useState<WeekSummary>({ avgMood: 0, avgEnergy: 0, count: 0 });
  const [previous, setPrevious] = useState<WeekSummary>({ avgMood: 0, avgEnergy: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const thisWeek = getWeekRange(0);
      const lastWeek = getWeekRange(1);

      const [{ data: currentData }, { data: previousData }] = await Promise.all([
        supabase
          .from('daily_checkins')
          .select('mood, energy_level')
          .eq('user_id', user.id)
          .gte('created_at', `${thisWeek.start}T00:00:00`)
          .lte('created_at', `${thisWeek.end}T23:59:59`),
        supabase
          .from('daily_checkins')
          .select('mood, energy_level')
          .eq('user_id', user.id)
          .gte('created_at', `${lastWeek.start}T00:00:00`)
          .lte('created_at', `${lastWeek.end}T23:59:59`),
      ]);

      setCurrent(computeAvg(currentData || []));
      setPrevious(computeAvg(previousData || []));
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) return null;
  if (current.count === 0 && previous.count === 0) return null;

  return (
    <Card className="shadow-soft border-primary/20 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowRight className="h-5 w-5 text-primary" />
          Comparativo Semanal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Week cards side by side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Previous week */}
          <div className="rounded-lg border border-muted bg-muted/20 p-3 space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Semana Anterior</p>
            {previous.count > 0 ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Humor médio</p>
                  <p className="text-lg font-bold">{moodLabel(previous.avgMood)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Energia média</p>
                  <p className="text-lg font-bold">⚡ {previous.avgEnergy}/5</p>
                </div>
                <p className="text-[10px] text-muted-foreground">{previous.count} check-in(s)</p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">Sem dados</p>
            )}
          </div>

          {/* Current week */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
            <p className="text-[10px] font-medium text-primary uppercase tracking-wide">Semana Atual</p>
            {current.count > 0 ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Humor médio</p>
                  <p className="text-lg font-bold">{moodLabel(current.avgMood)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Energia média</p>
                  <p className="text-lg font-bold">⚡ {current.avgEnergy}/5</p>
                </div>
                <p className="text-[10px] text-muted-foreground">{current.count} check-in(s)</p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">Sem dados</p>
            )}
          </div>
        </div>

        {/* Diff badges */}
        {current.count > 0 && previous.count > 0 && (
          <div className="flex flex-wrap gap-4 justify-center p-2 bg-muted/20 rounded-lg">
            <DiffBadge current={current.avgMood} previous={previous.avgMood} label="humor" unit="pts" />
            <DiffBadge current={current.avgEnergy} previous={previous.avgEnergy} label="energia" unit="pts" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
