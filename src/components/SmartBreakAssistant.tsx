import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Coffee, Wind, Dumbbell, Eye, Users, Loader2, Clock, AlertTriangle, Timer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BreakSuggestion {
  name: string;
  duration: string;
  type: string;
  instructions: string[];
  science: string;
  expectedBenefit: string;
}

interface BreakResponse {
  urgency: string;
  suggestedBreaks: BreakSuggestion[];
  nextBreakIn: string;
  dailyBreakPlan: string;
  warning: string | null;
}

const typeIcons: Record<string, any> = {
  breathing: Wind,
  movement: Dumbbell,
  sensory: Eye,
  meditation: Coffee,
  social: Users,
};

const urgencyColors: Record<string, string> = {
  low: 'bg-green-500/10 text-green-600 border-green-500/30',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  critical: 'bg-red-500/10 text-red-600 border-red-500/30',
};

interface SmartBreakAssistantProps {
  stressLevel?: string;
  hrvValue?: number;
}

export default function SmartBreakAssistant({ stressLevel, hrvValue }: SmartBreakAssistantProps) {
  const { toast } = useToast();
  const [mood, setMood] = useState('');
  const [energy, setEnergy] = useState('');
  const [lastBreak, setLastBreak] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<BreakResponse | null>(null);
  const [activeBreak, setActiveBreak] = useState<number | null>(null);

  const now = new Date();
  const timeOfDay = now.getHours() < 12 ? 'manhã' : now.getHours() < 18 ? 'tarde' : 'noite';

  const getSuggestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-breaks', {
        body: {
          stressLevel,
          hrvValue,
          lastBreakMinutesAgo: lastBreak || null,
          meetingMinutesToday: 0,
          mood: mood || null,
          energyLevel: energy || null,
          timeOfDay,
        },
      });

      if (error) throw error;
      setResponse(data);
    } catch (err: any) {
      console.error('Erro pausas:', err);
      toast({ title: 'Erro', description: 'Não foi possível gerar sugestões.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-primary" />
            Assistente de Pausas Inteligentes
          </CardTitle>
          <CardDescription>
            Micro-pausas personalizadas baseadas em cronobiologia e seus dados biométricos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Humor atual</label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="otimo">😊 Ótimo</SelectItem>
                  <SelectItem value="bem">🙂 Bem</SelectItem>
                  <SelectItem value="neutro">😐 Neutro</SelectItem>
                  <SelectItem value="cansado">😴 Cansado</SelectItem>
                  <SelectItem value="estressado">😤 Estressado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Energia (1-5)</label>
              <Select value={energy} onValueChange={setEnergy}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <SelectItem key={v} value={String(v)}>{v} - {['Muito baixa', 'Baixa', 'Média', 'Alta', 'Muito alta'][v - 1]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Última pausa (min atrás)</label>
              <Select value={lastBreak} onValueChange={setLastBreak}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">~15 min</SelectItem>
                  <SelectItem value="30">~30 min</SelectItem>
                  <SelectItem value="60">~1 hora</SelectItem>
                  <SelectItem value="90">~1h30</SelectItem>
                  <SelectItem value="120">+2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Período: {timeOfDay} · Estresse: {stressLevel || 'N/A'} · HRV: {hrvValue || 'N/A'}ms</span>
          </div>

          <Button onClick={getSuggestions} disabled={isLoading} className="w-full">
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Gerando pausas personalizadas...</>
            ) : (
              <><Coffee className="h-4 w-4 mr-2" />Gerar Sugestões de Pausa</>
            )}
          </Button>
        </CardContent>
      </Card>

      {response && (
        <>
          {response.warning && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                <p className="text-sm font-medium">{response.warning}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-3">
            <Badge className={urgencyColors[response.urgency]}>
              Urgência: {response.urgency}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Timer className="h-3 w-3" />
              Próxima pausa em: {response.nextBreakIn}
            </Badge>
          </div>

          <div className="space-y-4">
            {response.suggestedBreaks.map((brk, i) => {
              const Icon = typeIcons[brk.type] || Coffee;
              const isActive = activeBreak === i;

              return (
                <Card key={i} className={isActive ? 'ring-2 ring-primary' : ''}>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">{brk.name}</h4>
                      </div>
                      <Badge variant="secondary">{brk.duration}</Badge>
                    </div>

                    <p className="text-xs text-muted-foreground italic">🔬 {brk.science}</p>

                    {isActive && (
                      <div className="space-y-2">
                        <ol className="list-decimal list-inside text-sm space-y-1">
                          {brk.instructions.map((step, j) => (
                            <li key={j}>{step}</li>
                          ))}
                        </ol>
                        <p className="text-sm text-primary font-medium">✅ {brk.expectedBenefit}</p>
                      </div>
                    )}

                    <Button
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveBreak(isActive ? null : i)}
                    >
                      {isActive ? 'Concluir' : 'Iniciar Pausa'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {response.dailyBreakPlan && (
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold text-sm mb-2">📋 Plano de Pausas para Hoje</h4>
                <p className="text-sm text-muted-foreground">{response.dailyBreakPlan}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
