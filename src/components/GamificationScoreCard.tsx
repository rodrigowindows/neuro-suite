import { motion } from 'framer-motion';
import { Trophy, Sparkles, Target, Activity, Zap, Shield, Award, Flame, Compass, Radio, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGamificationScore } from '@/hooks/useGamificationScore';

interface GamificationScoreCardProps {
  compact?: boolean;
}

const LEVEL_ICONS: Record<number, React.ComponentType<{ className?: string }>> = {
  1: Target,
  2: Activity,
  3: Zap,
  4: Shield,
  5: Award,
  6: Flame,
  7: Compass,
  8: Radio,
  9: Trophy,
  10: Crown,
};

export default function GamificationScoreCard({ compact = false }: GamificationScoreCardProps) {
  const { xp, level, nextLevel, progressToNext, badges, streak, totalScans, loading } = useGamificationScore();

  if (loading) {
    return (
      <Card className="shadow-soft border-accent/20">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-[3px] border-accent border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (totalScans === 0) {
    return (
      <Card className="shadow-soft border-accent/20 bg-gradient-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5 text-accent" />
            Disciplina de Missão
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground text-sm">Complete sua primeira avaliação para iniciar os ciclos de missão.</p>
        </CardContent>
      </Card>
    );
  }

  const LevelIcon = LEVEL_ICONS[level.level] || Target;

  return (
    <Card className="shadow-soft border-accent/20 bg-gradient-card overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5 text-accent" />
            Disciplina de Missão
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-bold text-accent">{totalScans} Ciclos Concluídos</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={compact ? 'flex items-center gap-4' : 'space-y-4'}>
          {/* Level display */}
          <div className={compact ? 'flex items-center gap-3' : 'flex items-center gap-4'}>
            <motion.div
              className="flex-shrink-0 flex items-center justify-center rounded-xl bg-accent/10 border border-accent/20"
              style={{ width: compact ? 52 : 64, height: compact ? 52 : 64 }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <LevelIcon className={compact ? 'h-6 w-6 text-accent' : 'h-8 w-8 text-accent'} />
            </motion.div>
            <div className={compact ? '' : 'flex-1'}>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-display font-bold text-lg text-foreground">
                  Etapa {level.level}
                </span>
                <span className="text-xs text-muted-foreground">— Disciplina de Missão</span>
              </div>
              {/* XP Progress bar */}
              <div className="mt-1.5 space-y-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden w-full min-w-[120px]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-[hsl(var(--warning))]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {nextLevel
                    ? `Progresso de missão: ${Math.round(progressToNext)}% para etapa ${nextLevel.level}`
                    : 'Todas as etapas concluídas!'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          {!compact && (
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2.5 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold text-foreground">{totalScans}</p>
                <p className="text-[10px] text-muted-foreground">Ciclos Concluídos</p>
              </div>
              <div className="text-center p-2.5 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                  <span>{streak}</span>
                  <Flame className="h-4 w-4 text-orange-500 inline" />
                </p>
                <p className="text-[10px] text-muted-foreground">Sequência de Monitoramento</p>
              </div>
              <div className="text-center p-2.5 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold text-foreground">{badges.length}</p>
                <p className="text-[10px] text-muted-foreground">Protocolos em Dia</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
