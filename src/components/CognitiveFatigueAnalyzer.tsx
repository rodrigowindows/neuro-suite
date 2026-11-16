import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Brain, AlertTriangle, CheckCircle, Loader2, Eye, Zap, Database, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useConnectionMode } from '@/hooks/useConnectionMode';
import { useI18n } from '@/i18n';
import ResearchValidationModal from '@/components/ResearchValidationModal';

interface FatigueAnalysis {
  fatigueLevel: string;
  fatigueScore: number;
  indicators: string[];
  cognitiveAreas: {
    attention: number;
    memory: number;
    processing: number;
    emotional: number;
  };
  recommendation: string;
  alert: boolean;
  alertMessage?: string;
}

interface CognitiveFatigueAnalyzerProps {
  stressLevel?: string;
}

const levelConfig: Record<string, { color: string; icon: React.ComponentType<{ className?: string }>; labelKey: string }> = {
  low: { color: 'text-green-500', icon: CheckCircle, labelKey: 'wellness.fatigue.level.low' },
  moderate: { color: 'text-yellow-500', icon: Eye, labelKey: 'wellness.fatigue.level.moderate' },
  high: { color: 'text-orange-500', icon: AlertTriangle, labelKey: 'wellness.fatigue.level.high' },
  critical: { color: 'text-red-500', icon: AlertTriangle, labelKey: 'wellness.fatigue.level.critical' },
};

export default function CognitiveFatigueAnalyzer({ stressLevel }: CognitiveFatigueAnalyzerProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { isAutonomous } = useConnectionMode();
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FatigueAnalysis | null>(null);

  const analyzeText = async () => {
    if (text.trim().length < 20) {
      toast({
        title: t('wellness.fatigue.tooShortTitle'),
        description: t('wellness.fatigue.tooShortDesc'),
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      if (isAutonomous) {
        const localScore = stressLevel === 'high' ? 78 : stressLevel === 'moderate' ? 48 : 22;
        const localLevel = stressLevel === 'high' ? 'high' : stressLevel === 'moderate' ? 'moderate' : 'low';
        const localData: FatigueAnalysis = {
          fatigueLevel: localLevel,
          fatigueScore: localScore,
          indicators: [t('wellness.fatigue.local.indicator')],
          cognitiveAreas: {
            attention: stressLevel === 'high' ? 55 : 85,
            memory: stressLevel === 'high' ? 60 : 90,
            processing: stressLevel === 'high' ? 50 : 85,
            emotional: stressLevel === 'high' ? 50 : 80,
          },
          recommendation: t('wellness.fatigue.local.recommendation'),
          alert: stressLevel === 'high',
          alertMessage: stressLevel === 'high' ? t('wellness.fatigue.local.alertMessage') : undefined,
        };
        setAnalysis(localData);
        if (localData.alert) {
          toast({
            title: t('wellness.fatigue.alertToastTitle'),
            description: localData.alertMessage || t('wellness.fatigue.alertToastFallback'),
            variant: 'destructive',
          });
        }
        return;
      }

      const { data, error } = await supabase.functions.invoke('cognitive-fatigue', {
        body: { text, stressLevel },
      });

      if (error) throw error;
      setAnalysis(data);

      if (data.alert) {
        toast({
          title: t('wellness.fatigue.alertToastTitle'),
          description: data.alertMessage || t('wellness.fatigue.alertToastFallback'),
          variant: 'destructive',
        });
      }
    } catch (err: unknown) {
      console.error('Cognitive fatigue analysis error:', err);
      toast({
        title: t('wellness.fatigue.errorTitle'),
        description: t('wellness.fatigue.errorDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const config = analysis ? levelConfig[analysis.fatigueLevel] || levelConfig.low : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-display">
                <Brain className="h-5 w-5 text-primary" />
                {t('wellness.fatigue.title')}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                {t('wellness.fatigue.subtitle')}
              </CardDescription>
            </div>

            {/* Scientific Basis Modal Button */}
            <ResearchValidationModal />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">
              {t('wellness.fatigue.inputLabel')}
            </label>
            <Textarea
              placeholder={t('wellness.fatigue.inputPlaceholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('wellness.fatigue.charCount', { count: text.length })}
            </p>
          </div>

          <Button onClick={analyzeText} disabled={isAnalyzing || text.length < 20} className="w-full">
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t('wellness.fatigue.analyzing')}
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                {t('wellness.fatigue.analyzeButton')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && config && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <config.icon className={`h-5 w-5 ${config.color}`} />
              {t('wellness.fatigue.scoreTitle', {
                label: t(config.labelKey),
                score: analysis.fatigueScore,
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={analysis.fatigueScore} className="h-3" />

            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'attention', label: t('wellness.fatigue.area.attention'), icon: Eye, value: analysis.cognitiveAreas.attention },
                { key: 'memory', label: t('wellness.fatigue.area.memory'), icon: Database, value: analysis.cognitiveAreas.memory },
                { key: 'processing', label: t('wellness.fatigue.area.processing'), icon: Zap, value: analysis.cognitiveAreas.processing },
                { key: 'emotional', label: t('wellness.fatigue.area.emotional'), icon: Heart, value: analysis.cognitiveAreas.emotional },
              ].map((area) => (
                <div key={area.key} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <area.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{area.label}</span>
                  </div>
                  <Progress value={area.value} className="h-2" />
                  <span className="text-xs text-muted-foreground mt-1 block">{area.value}%</span>
                </div>
              ))}
            </div>

            {analysis.indicators.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">{t('wellness.fatigue.indicatorsTitle')}</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.indicators.map((ind, i) => (
                    <span key={i} className="px-2 py-1 text-xs bg-muted rounded-full">{ind}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="text-sm font-semibold mb-1">{t('wellness.fatigue.recommendationTitle')}</h4>
              <p className="text-sm">{analysis.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
