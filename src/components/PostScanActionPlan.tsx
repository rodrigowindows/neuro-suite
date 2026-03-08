import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ActionTask {
  time: string;
  action: string;
  duration: string;
  science: string;
}

interface ActionPlan {
  title: string;
  urgency: string;
  tasks: ActionTask[];
  avoidList: string[];
  mantra: string;
}

interface PostScanActionPlanProps {
  stressLevel: string;
  blinkRate: number;
  hrvValue?: number;
}

export default function PostScanActionPlan({ stressLevel, blinkRate, hrvValue }: PostScanActionPlanProps) {
  const [plan, setPlan] = useState<ActionPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    try {
      // Get recent history
      const { data: { user } } = await supabase.auth.getUser();
      let recentHistory = 'primeiro scan';
      if (user) {
        const { data: recentScans } = await supabase
          .from('stress_scans')
          .select('stress_level')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentScans && recentScans.length > 1) {
          const levels = recentScans.map(s => s.stress_level).join(', ');
          recentHistory = `Últimos scans: ${levels}`;
        }
      }

      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          type: 'action_plan',
          data: { stressLevel, blinkRate, hrvValue, recentHistory },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPlan(data.result);
    } catch (e: any) {
      console.error('Erro ao gerar plano:', e);
    } finally {
      setLoading(false);
    }
  };

  const urgencyColors = {
    low: 'bg-green-500/10 border-green-500/20',
    medium: 'bg-yellow-500/10 border-yellow-500/20',
    high: 'bg-red-500/10 border-red-500/20',
  };

  return (
    <div className="space-y-3">
      {!plan && (
        <Button
          onClick={generatePlan}
          disabled={loading}
          variant="outline"
          className="w-full gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 text-accent" />
          )}
          {loading ? 'Gerando plano personalizado...' : '✨ Gerar Plano de Ação 24h com IA'}
        </Button>
      )}

      {plan && (
        <Card className={`border ${urgencyColors[plan.urgency as keyof typeof urgencyColors] || urgencyColors.medium}`}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                {plan.title}
              </p>
              <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={() => setPlan(null)}>
                Refazer
              </Button>
            </div>

            {plan.tasks?.map((task, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-background/50 rounded-lg">
                <div className="shrink-0 w-16 text-[10px] font-semibold text-primary uppercase">{task.time}</div>
                <div className="flex-1">
                  <p className="text-xs font-medium">{task.action}</p>
                  <p className="text-[10px] text-muted-foreground">⏱️ {task.duration} • 🔬 {task.science}</p>
                </div>
              </div>
            ))}

            {plan.avoidList?.length > 0 && (
              <div className="text-[10px] text-muted-foreground">
                <span className="font-semibold">🚫 Evite: </span>
                {plan.avoidList.join(' • ')}
              </div>
            )}

            <div className="p-2 bg-accent/10 rounded-lg text-center">
              <p className="text-xs font-medium italic text-accent">"{plan.mantra}"</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
