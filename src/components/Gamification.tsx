import { useEffect, useState } from 'react';
import { Trophy, Flame, Award, Star, Zap, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeUI } from '@/components/ui/badge';
import type { AchievementBadge } from '@/types/stress';

interface GamificationProps {
  stressLevel?: string;
  hrvValue?: number;
}

const BADGE_DEFINITIONS = [
  { id: 'first_scan', name: '🎯 Primeira Missão', description: 'Completou primeiro scan!', icon: '🎯', condition: (scans: number) => scans === 1 },
  { id: 'warrior', name: '⚡ Guerreiro da Performance', description: '10 scans completos!', icon: '⚡', condition: (scans: number) => scans >= 10 },
] as const;

function getStreakEmoji(streak: number): string {
  if (streak >= 30) return '🔥🔥🔥';
  if (streak >= 14) return '🔥🔥';
  if (streak >= 7) return '🔥';
  if (streak >= 3) return '⚡';
  return '✨';
}

export default function Gamification({ stressLevel, hrvValue }: GamificationProps) {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [badges, setBadges] = useState<AchievementBadge[]>([]);
  const [totalScans, setTotalScans] = useState(0);
  const [showNewBadge, setShowNewBadge] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    if (stressLevel) {
      updateProgress();
    }
  }, [stressLevel, hrvValue]);

  const loadProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar progresso:', error);
        return;
      }

      if (data) {
        setCurrentStreak(data.current_streak);
        setLongestStreak(data.longest_streak);
        setBadges((data.badges as unknown as AchievementBadge[]) || []);
        setTotalScans(data.total_scans);
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const updateProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: currentProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const today = new Date().toISOString().split('T')[0];
      const lastScanDate = currentProgress?.last_scan_date;

      let newStreak = currentProgress?.current_streak || 0;
      if (lastScanDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        newStreak = lastScanDate === yesterdayStr ? newStreak + 1 : 1;
      }

      const newTotalScans = (currentProgress?.total_scans || 0) + 1;
      const newLongestStreak = Math.max(newStreak, currentProgress?.longest_streak || 0);

      const currentBadges = (currentProgress?.badges as unknown as AchievementBadge[]) || [];
      const newBadges: AchievementBadge[] = [...currentBadges];
      let earnedNewBadge = false;

      const addBadge = (id: string, name: string, description: string, icon: string) => {
        if (!currentBadges.find(b => b.id === id)) {
          newBadges.push({ id, name, description, icon, earnedAt: new Date().toISOString() });
          earnedNewBadge = true;
        }
      };

      if (newStreak >= 7) addBadge('zen_master', '🧘 Zen Master', '7 dias consecutivos!', '🧘');
      if (hrvValue && hrvValue > 50) addBadge('hrv_hero', '💗 HRV Hero', 'HRV > 50ms', '💗');
      if (newTotalScans === 1) addBadge('first_scan', '🎯 Primeira Missão', 'Completou primeiro scan!', '🎯');
      if (newTotalScans >= 10) addBadge('warrior', '⚡ Guerreiro da Performance', '10 scans completos!', '⚡');

      if (stressLevel === 'low' && newTotalScans >= 3) {
        const recentScans = await supabase
          .from('stress_scans')
          .select('stress_level')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (recentScans.data?.every(s => s.stress_level === 'low')) {
          addBadge('low_stress_keeper', '😊 Guardião do Zen', '3 scans low consecutivos!', '😊');
        }
      }

      const { error } = await supabase
        .from('user_progress')
        .upsert({
          id: currentProgress?.id,
          user_id: user.id,
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_scan_date: today,
          badges: newBadges as unknown as Record<string, unknown>[],
          total_scans: newTotalScans,
        });

      if (!error) {
        setCurrentStreak(newStreak);
        setLongestStreak(newLongestStreak);
        setBadges(newBadges);
        setTotalScans(newTotalScans);

        if (earnedNewBadge) {
          setShowNewBadge(true);
          setTimeout(() => setShowNewBadge(false), 5000);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  return (
    <Card className="shadow-soft border-primary/20 bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Gamificação & Conquistas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Streaks */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Streak Atual</span>
            </div>
            <p className="text-3xl font-bold text-orange-500">
              {currentStreak} {getStreakEmoji(currentStreak)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentStreak > 0 ? 'Você tá ON FIRE! 🔥' : 'Comece sua jornada!'}
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">Recorde</span>
            </div>
            <p className="text-3xl font-bold text-yellow-500">{longestStreak}</p>
            <p className="text-xs text-muted-foreground mt-1">Melhor streak</p>
          </div>
        </div>

        {/* Total de scans */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Total de Scans</span>
          </div>
          <span className="text-2xl font-bold text-primary">{totalScans}</span>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" />
              Conquistas ({badges.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {badges.map((badge) => (
                <BadgeUI
                  key={badge.id}
                  variant="secondary"
                  className="p-2 sm:p-3 justify-start gap-1.5 sm:gap-2 text-xs"
                >
                  <span className="text-base sm:text-lg">{badge.icon}</span>
                  <div className="text-left">
                    <p className="font-semibold text-[10px] sm:text-xs leading-tight">{badge.name}</p>
                    <p className="text-[9px] sm:text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                </BadgeUI>
              ))}
            </div>
          </div>
        )}

        {/* Novo badge toast */}
        {showNewBadge && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
            <Card className="shadow-lg border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/80">
              <CardContent className="p-4 flex items-center gap-3">
                <Zap className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="font-bold text-yellow-900 dark:text-yellow-200">🎉 Nova Conquista!</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Confira seus badges!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Próximo objetivo */}
        <div className="p-3 bg-secondary/5 rounded-lg border border-secondary/20">
          <p className="text-xs font-semibold text-secondary mb-1">🎯 Próximo objetivo:</p>
          <p className="text-xs text-muted-foreground">
            {currentStreak < 7 && `Faça scan por mais ${7 - currentStreak} dias para 🧘 Zen Master`}
            {currentStreak >= 7 && currentStreak < 30 && 'Continue até 30 dias para Triple Fire! 🔥🔥🔥'}
            {currentStreak >= 30 && 'Você é uma lenda! Continue assim! 🏆'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
