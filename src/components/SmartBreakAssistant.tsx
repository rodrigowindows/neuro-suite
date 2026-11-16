import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Coffee, Wind, Dumbbell, Eye, Users, Loader2, Clock, AlertTriangle, Timer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useConnectionMode } from '@/hooks/useConnectionMode';
import { useI18n } from '@/i18n';

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

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  breathing: Wind,
  movement: Dumbbell,
  physical: Dumbbell,
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
  const { t } = useI18n();
  const { toast } = useToast();
  const { isAutonomous } = useConnectionMode();
  const [mood, setMood] = useState('');
  const [energy, setEnergy] = useState('');
  const [lastBreak, setLastBreak] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<BreakResponse | null>(null);
  const [activeBreak, setActiveBreak] = useState<number | null>(null);

  const now = new Date();
  const periodKey = now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening';
  const periodLabel = t(`wellness.breaks.period.${periodKey}`);
  const timeOfDay = now.getHours() < 12 ? 'manhã' : now.getHours() < 18 ? 'tarde' : 'noite';

  const getSuggestions = async () => {
    setIsLoading(true);
    try {
      if (isAutonomous) {
        const localResponse: BreakResponse = {
          urgency: stressLevel === 'high' ? 'high' : stressLevel === 'moderate' ? 'medium' : 'low',
          nextBreakIn: '~45 min',
          dailyBreakPlan: t('wellness.breaks.local.dailyPlan'),
          warning: null,
          suggestedBreaks: [
            {
              name: t('wellness.breaks.local.b1.name'),
              duration: t('wellness.breaks.local.b1.duration'),
              type: 'breathing',
              instructions: [
                t('wellness.breaks.local.b1.step1'),
                t('wellness.breaks.local.b1.step2'),
                t('wellness.breaks.local.b1.step3'),
              ],
              science: t('wellness.breaks.local.b1.science'),
              expectedBenefit: t('wellness.breaks.local.b1.benefit'),
            },
            {
              name: t('wellness.breaks.local.b2.name'),
              duration: t('wellness.breaks.local.b2.duration'),
              type: 'movement',
              instructions: [
                t('wellness.breaks.local.b2.step1'),
                t('wellness.breaks.local.b2.step2'),
              ],
              science: t('wellness.breaks.local.b2.science'),
              expectedBenefit: t('wellness.breaks.local.b2.benefit'),
            },
          ],
        };
        setResponse(localResponse);
        return;
      }

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
    } catch (err: unknown) {
      console.error('Erro pausas:', err);
      toast({
        title: t('wellness.breaks.errorTitle'),
        description: t('wellness.breaks.errorDesc'),
        variant: 'destructive',
      });
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
            {t('wellness.breaks.title')}
          </CardTitle>
          <CardDescription>
            {t('wellness.breaks.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">{t('wellness.breaks.cognitiveLoadLabel')}</label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('wellness.breaks.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="otimo">{t('wellness.breaks.mood.otimo')}</SelectItem>
                  <SelectItem value="bem">{t('wellness.breaks.mood.bem')}</SelectItem>
                  <SelectItem value="neutro">{t('wellness.breaks.mood.neutro')}</SelectItem>
                  <SelectItem value="cansado">{t('wellness.breaks.mood.cansado')}</SelectItem>
                  <SelectItem value="estressado">{t('wellness.breaks.mood.estressado')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{t('wellness.breaks.energyLabel')}</label>
              <Select value={energy} onValueChange={setEnergy}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('wellness.breaks.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <SelectItem key={v} value={String(v)}>
                      {t(`wellness.breaks.energy.${v}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{t('wellness.breaks.lastBreakLabel')}</label>
              <Select value={lastBreak} onValueChange={setLastBreak}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('wellness.breaks.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">{t('wellness.breaks.lastBreak.15')}</SelectItem>
                  <SelectItem value="30">{t('wellness.breaks.lastBreak.30')}</SelectItem>
                  <SelectItem value="60">{t('wellness.breaks.lastBreak.60')}</SelectItem>
                  <SelectItem value="90">{t('wellness.breaks.lastBreak.90')}</SelectItem>
                  <SelectItem value="120">{t('wellness.breaks.lastBreak.120')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {t('wellness.breaks.statusLine', {
                period: periodLabel,
                stress: stressLevel || 'N/A',
                hrv: hrvValue || 'N/A',
              })}
            </span>
          </div>

          <Button onClick={getSuggestions} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t('wellness.breaks.generating')}
              </>
            ) : (
              <>
                <Coffee className="h-4 w-4 mr-2" />
                {t('wellness.breaks.generateButton')}
              </>
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
              {t('wellness.breaks.urgencyBadge', {
                urgency: t(`wellness.breaks.urgency.${response.urgency}`) || response.urgency,
              })}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Timer className="h-3 w-3" />
              {t('wellness.breaks.nextBreakBadge', { time: response.nextBreakIn })}
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

                    <p className="text-xs text-muted-foreground italic">
                      {t('wellness.breaks.evidenceLabel', { science: brk.science })}
                    </p>

                    {isActive && (
                      <div className="space-y-2">
                        <ol className="list-decimal list-inside text-sm space-y-1">
                          {brk.instructions.map((step, j) => (
                            <li key={j}>{step}</li>
                          ))}
                        </ol>
                        <p className="text-sm text-primary font-medium">
                          {t('wellness.breaks.expectedBenefitLabel', { benefit: brk.expectedBenefit })}
                        </p>
                      </div>
                    )}

                    <Button
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveBreak(isActive ? null : i)}
                    >
                      {isActive ? t('wellness.breaks.completeButton') : t('wellness.breaks.startButton')}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {response.dailyBreakPlan && (
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold text-sm mb-2">{t('wellness.breaks.dailyPlanTitle')}</h4>
                <p className="text-sm text-muted-foreground">{response.dailyBreakPlan}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
