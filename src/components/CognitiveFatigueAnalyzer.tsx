import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Brain, AlertTriangle, CheckCircle, Loader2, Eye, Zap, Database, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const levelConfig: Record<string, { color: string; icon: any; label: string }> = {
  low: { color: 'text-green-500', icon: CheckCircle, label: 'Alerta' },
  moderate: { color: 'text-yellow-500', icon: Eye, label: 'Moderada' },
  high: { color: 'text-orange-500', icon: AlertTriangle, label: 'Alta' },
  critical: { color: 'text-red-500', icon: AlertTriangle, label: 'Crítica' },
};

export default function CognitiveFatigueAnalyzer({ stressLevel }: CognitiveFatigueAnalyzerProps) {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FatigueAnalysis | null>(null);

  const analyzeText = async () => {
    if (text.trim().length < 20) {
      toast({ title: 'Texto muito curto', description: 'Escreva pelo menos 20 caracteres para análise.', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('cognitive-fatigue', {
        body: { text, stressLevel },
      });

      if (error) throw error;
      setAnalysis(data);

      if (data.alert) {
        toast({ title: '⚠️ Alerta de Fadiga', description: data.alertMessage || 'Fadiga cognitiva detectada.', variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Erro análise:', err);
      toast({ title: 'Erro', description: 'Não foi possível analisar. Tente novamente.', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const config = analysis ? levelConfig[analysis.fatigueLevel] || levelConfig.low : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Análise de Fadiga Cognitiva
          </CardTitle>
          <CardDescription>
            A IA analisa padrões de escrita para detectar sinais de exaustão mental
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Escreva livremente sobre como está seu dia</label>
            <Textarea
              placeholder="Descreva como você está se sentindo, o que fez hoje, desafios que enfrentou... Quanto mais natural, melhor a análise."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">{text.length} caracteres · mínimo 20</p>
          </div>

          <Button onClick={analyzeText} disabled={isAnalyzing || text.length < 20} className="w-full">
            {isAnalyzing ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analisando padrões linguísticos...</>
            ) : (
              <><Brain className="h-4 w-4 mr-2" />Analisar Fadiga Cognitiva</>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && config && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <config.icon className={`h-5 w-5 ${config.color}`} />
              Fadiga {config.label}: {analysis.fatigueScore}/100
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={analysis.fatigueScore} className="h-3" />

            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'attention', label: 'Atenção', icon: Eye, value: analysis.cognitiveAreas.attention },
                { key: 'memory', label: 'Memória', icon: Database, value: analysis.cognitiveAreas.memory },
                { key: 'processing', label: 'Processamento', icon: Zap, value: analysis.cognitiveAreas.processing },
                { key: 'emotional', label: 'Regulação Emocional', icon: Heart, value: analysis.cognitiveAreas.emotional },
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
                <h4 className="text-sm font-semibold mb-2">Indicadores Detectados</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.indicators.map((ind, i) => (
                    <span key={i} className="px-2 py-1 text-xs bg-muted rounded-full">{ind}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="text-sm font-semibold mb-1">💡 Recomendação</h4>
              <p className="text-sm">{analysis.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
