import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, MessageSquare, Zap, AlertTriangle } from 'lucide-react';

interface IntegrationMetricsProps {
  totalMeetingTime: number;
  totalMessages: number;
  connectedCount: number;
  overload: { level: string; percent: number };
}

export default function IntegrationMetrics({ totalMeetingTime, totalMessages, connectedCount, overload }: IntegrationMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Tempo em Calls</span>
          </div>
          <p className="text-2xl font-bold mt-1">{totalMeetingTime} min</p>
          <p className="text-xs text-muted-foreground">hoje</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-secondary" />
            <span className="text-sm text-muted-foreground">Mensagens</span>
          </div>
          <p className="text-2xl font-bold mt-1">{totalMessages}</p>
          <p className="text-xs text-muted-foreground">enviadas hoje</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            <span className="text-sm text-muted-foreground">Integrações</span>
          </div>
          <p className="text-2xl font-bold mt-1">{connectedCount}/4</p>
          <p className="text-xs text-muted-foreground">conectadas</p>
        </CardContent>
      </Card>

      <Card className={`bg-gradient-to-br ${overload.level === 'crítico' ? 'from-destructive/20 to-destructive/10' : overload.level === 'alto' ? 'from-yellow-500/20 to-yellow-500/10' : 'from-green-500/20 to-green-500/10'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${overload.level === 'crítico' ? 'text-destructive' : overload.level === 'alto' ? 'text-yellow-500' : 'text-green-500'}`} />
            <span className="text-sm text-muted-foreground">Sobrecarga</span>
          </div>
          <p className="text-2xl font-bold mt-1 capitalize">{overload.level}</p>
          <Progress value={overload.percent} className="h-1 mt-2" />
        </CardContent>
      </Card>
    </div>
  );
}
