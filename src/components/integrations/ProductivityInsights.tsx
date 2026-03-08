import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MessageSquare, CheckCircle2, TrendingUp } from 'lucide-react';

interface ProductivityInsightsProps {
  connectedCount: number;
  totalMeetingTime: number;
  totalMessages: number;
  onGoToOverview: () => void;
}

export default function ProductivityInsights({ connectedCount, totalMeetingTime, totalMessages, onGoToOverview }: ProductivityInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Insights de Produtividade
        </CardTitle>
        <CardDescription>Análise baseada nos dados das integrações</CardDescription>
      </CardHeader>
      <CardContent>
        {connectedCount === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Conecte pelo menos uma integração para ver insights</p>
            <Button variant="outline" onClick={onGoToOverview}>Conectar Integrações</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {totalMeetingTime > 240 && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">Alerta: Excesso de reuniões</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Você já está em {totalMeetingTime} minutos de calls hoje. Considere bloquear tempo para trabalho focado.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {totalMessages > 40 && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400">Alto volume de comunicação</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {totalMessages} mensagens hoje. Considere agrupar respostas em horários específicos.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {totalMeetingTime < 120 && connectedCount > 0 && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400">Bom equilíbrio hoje!</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tempo em reuniões saudável. Continue assim para manter produtividade e bem-estar.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Tempo focado estimado</p>
                <p className="text-xl font-bold">{Math.max(0, 480 - totalMeetingTime)} min</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Interrupções estimadas</p>
                <p className="text-xl font-bold">{Math.floor(totalMessages / 5)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
