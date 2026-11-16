import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { useI18n } from '@/i18n';

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

function getMoodLabel(val: number, t: (k: string) => string): string {
  const rounded = Math.round(val);
  const labels: Record<number, string> = {
    1: t('command.weekly.mood.1'),
    2: t('command.weekly.mood.2'),
    3: t('command.weekly.mood.3'),
    4: t('command.weekly.mood.4'),
    5: t('command.weekly.mood.5'),
  };
  return labels[rounded] || `${val}`;
}

export default function WeeklyComparison() {
  const { t } = useI18n();
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
          {t('command.weekly.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Week cards side by side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Previous week */}
          <div className="rounded-lg border border-muted bg-muted/20 p-3 space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              {t('command.weekly.previousWeek')}
            </p>
            {previous.count > 0 ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">{t('command.weekly.readinessAvg')}</p>
                  <p className="text-lg font-bold">{getMoodLabel(previous.avgMood, t)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('command.weekly.energyAvg')}</p>
                  <p className="text-lg font-bold">{previous.avgEnergy}/5</p>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {t('command.weekly.checkinCount', { count: previous.count })}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">{t('command.weekly.noData')}</p>
            )}
          </div>

          {/* Current week */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
            <p className="text-[10px] font-medium text-primary uppercase tracking-wide">
              {t('command.weekly.currentWeek')}
            </p>
            {current.count > 0 ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">{t('command.weekly.readinessAvg')}</p>
                  <p className="text-lg font-bold">{getMoodLabel(current.avgMood, t)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('command.weekly.energyAvg')}</p>
                  <p className="text-lg font-bold">{current.avgEnergy}/5</p>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {t('command.weekly.checkinCount', { count: current.count })}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">{t('command.weekly.noData')}</p>
            )}
          </div>
        </div>

        {/* Diff badges */}
        {current.count > 0 && previous.count > 0 && (
          <div className="flex flex-wrap gap-4 justify-center p-2 bg-muted/20 rounded-lg">
            <DiffBadge
              current={current.avgMood}
              previous={previous.avgMood}
              label={t('command.weekly.diff.readiness')}
              unit={t('command.weekly.diff.pts')}
            />
            <DiffBadge
              current={current.avgEnergy}
              previous={previous.avgEnergy}
              label={t('command.weekly.diff.energy')}
              unit={t('command.weekly.diff.pts')}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
