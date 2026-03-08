import { motion } from 'framer-motion';
import { Building2, Users, TrendingUp, TrendingDown, Minus, Activity, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCompanyScore } from '@/hooks/useCompanyScore';

function RadialGauge({ score, color, size = 120 }: { score: number; color: string; size?: number }) {
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
          strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-display font-bold text-2xl text-foreground"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] text-muted-foreground font-medium">EMPRESA</span>
      </div>
    </div>
  );
}

function DistributionBar({ distribution, total }: {
  distribution: { excellent: number; good: number; moderate: number; attention: number };
  total: number;
}) {
  if (total === 0) return null;
  const segments = [
    { key: 'excellent', count: distribution.excellent, color: 'hsl(var(--success))', label: 'Excelente' },
    { key: 'good', count: distribution.good, color: 'hsl(185, 65%, 38%)', label: 'Bom' },
    { key: 'moderate', count: distribution.moderate, color: 'hsl(var(--warning))', label: 'Moderado' },
    { key: 'attention', count: distribution.attention, color: 'hsl(var(--destructive))', label: 'Atenção' },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">Distribuição dos Colaboradores</p>
      <div className="h-3 rounded-full overflow-hidden flex bg-muted">
        {segments.map((seg) => {
          const pct = (seg.count / total) * 100;
          if (pct === 0) return null;
          return (
            <motion.div
              key={seg.key}
              className="h-full"
              style={{ backgroundColor: seg.color }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-muted-foreground">{seg.label}: <strong className="text-foreground">{seg.count}</strong></span>
          </div>
        ))}
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
  up: 'Melhorando vs mês anterior',
  down: 'Piorando vs mês anterior',
  stable: 'Estável vs mês anterior',
};

export default function CompanyScoreCard() {
  const {
    overallScore, label, color, totalEmployees, activeEmployees,
    adoptionRate, avgHrvScore, distribution, trend, loading,
  } = useCompanyScore();

  if (loading) {
    return (
      <Card className="shadow-soft border-primary/20">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-[3px] border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (activeEmployees === 0) {
    return (
      <Card className="shadow-soft border-primary/20 bg-gradient-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5 text-primary" />
            Score da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground text-sm">Nenhum colaborador realizou scans nos últimos 30 dias</p>
          <p className="text-xs text-muted-foreground mt-1">{totalEmployees} colaboradores registrados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft border-primary/20 bg-gradient-card overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-primary" />
              Score da Empresa
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Indicador agregado de bem-estar organizacional (30 dias)
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendIcon trend={trend} />
            <span className="hidden sm:inline">{trendLabel[trend]}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Gauge */}
          <RadialGauge score={overallScore} color={color} />

          {/* KPIs */}
          <div className="flex-1 w-full grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-muted/50 rounded-lg text-center">
              <Users className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold text-foreground">{totalEmployees}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </div>
            <div className="p-2.5 bg-muted/50 rounded-lg text-center">
              <UserCheck className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold text-foreground">{activeEmployees}</p>
              <p className="text-[10px] text-muted-foreground">Ativos</p>
            </div>
            <div className="p-2.5 bg-muted/50 rounded-lg text-center">
              <Activity className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold text-foreground">{adoptionRate}%</p>
              <p className="text-[10px] text-muted-foreground">Adesão</p>
            </div>
            <div className="p-2.5 bg-muted/50 rounded-lg text-center">
              <span className="text-sm">💗</span>
              <p className="text-lg font-bold text-foreground">{avgHrvScore}<span className="text-xs">ms</span></p>
              <p className="text-[10px] text-muted-foreground">HRV Médio</p>
            </div>
          </div>
        </div>

        {/* Label badge */}
        <div className="text-center">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: `${color}20`, color }}
          >
            Saúde Organizacional: {label}
          </span>
        </div>

        {/* Distribution */}
        <DistributionBar distribution={distribution} total={activeEmployees} />
      </CardContent>
    </Card>
  );
}
