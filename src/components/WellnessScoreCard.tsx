import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Activity, Brain, Flame, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWellnessScore } from '@/hooks/useWellnessScore';

interface WellnessScoreCardProps {
  compact?: boolean;
}

function RadialGauge({ score, color, size = 140 }: { score: number; color: string; size?: number }) {
  const strokeWidth = size >= 120 ? 10 : 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-display font-bold text-foreground"
          style={{ fontSize: size >= 120 ? '2rem' : '1.5rem' }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
          de 100
        </span>
      </div>
    </div>
  );
}

function BreakdownBar({ label, value, max, icon: Icon, color }: {
  label: string;
  value: number;
  max: number;
  icon: React.ElementType;
  color: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="h-3 w-3" style={{ color }} />
          {label}
        </span>
        <span className="font-semibold text-foreground">{value}/{max}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  );
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-[hsl(var(--success))]" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-[hsl(var(--destructive))]" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

const trendLabel: Record<string, string> = {
  up: 'Melhorando',
  down: 'Piorando',
  stable: 'Estável',
};

export default function WellnessScoreCard({ compact = false }: WellnessScoreCardProps) {
  const { score, breakdown, label, color, trend, totalScans, loading } = useWellnessScore();

  if (loading) {
    return (
      <Card className="shadow-soft border-primary/20">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-[3px] border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (totalScans === 0) {
    return (
      <Card className="shadow-soft border-primary/20 bg-gradient-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-primary" />
            Score de Bem-Estar
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground text-sm">Complete seu primeiro NeuroScore para gerar seu indicador de bem-estar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft border-primary/20 bg-gradient-card overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-primary" />
            Score de Bem-Estar
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendIcon trend={trend} />
            <span>{trendLabel[trend]}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={compact ? 'flex items-center gap-4' : 'flex flex-col sm:flex-row items-center gap-6'}>
          {/* Gauge */}
          <div className="flex-shrink-0">
            <RadialGauge score={score} color={color} size={compact ? 100 : 140} />
          </div>

          {/* Details */}
          <div className="flex-1 w-full space-y-3">
            <div className="text-center sm:text-left">
              <span
                className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {label}
              </span>
            </div>

            {!compact && (
              <div className="space-y-2.5">
                <BreakdownBar
                  label="Nível de Estresse"
                  value={breakdown.stressScore}
                  max={40}
                  icon={Brain}
                  color="hsl(185, 65%, 38%)"
                />
                <BreakdownBar
                  label="Consistência"
                  value={breakdown.consistencyScore}
                  max={30}
                  icon={Flame}
                  color="hsl(var(--accent))"
                />
                <BreakdownBar
                  label="Variabilidade Cardíaca"
                  value={breakdown.hrvScore}
                  max={30}
                  icon={Heart}
                  color="hsl(var(--destructive))"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
