import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Brain, AlertTriangle, CheckCircle, Loader2, Eye, Zap, Database, Heart, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
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
  low: { color: 'text-green-500', icon: CheckCircle, label: 'Nominal' },
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-display">
                <Brain className="h-5 w-5 text-primary" />
                Métricas de Fadiga Cognitiva
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Monitoramento de carga de trabalho e fadiga operacional (apoio operacional)
              </CardDescription>
            </div>

            {/* Scientific Basis Modal Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  Base Científica
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg font-display">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Base Científica e Evidências Operacionais
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Fundamentos técnicos e protocolos aeroespaciais aplicados no CrewVitals.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2 text-sm text-foreground/90">
                  {/* Item 1 */}
                  <div className="p-3.5 rounded-lg border bg-muted/40 space-y-1.5">
                    <h4 className="font-semibold text-primary flex items-center gap-1.5 text-sm">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">1</span>
                      NASA Human Research Program — Cognitive Fatigue
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      O Human Research Program (HRP) da NASA, no elemento Behavioral Health & Performance (BHP), estuda a fadiga cognitiva gerada por confinamento prolongado, perturbações do ritmo circadiano e alta densidade de tarefas. A detecção precoce de lapsos de atenção protege a tripulação antes que erros operacionais críticos ocorram.
                    </p>
                  </div>

                  {/* Item 2 */}
                  <div className="p-3.5 rounded-lg border bg-muted/40 space-y-1.5">
                    <h4 className="font-semibold text-primary flex items-center gap-1.5 text-sm">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">2</span>
                      Estudos sobre Blink Rate (Taxa de Piscadas) e Carga Cognitiva (NASA Technical Reports)
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Relatórios técnicos e publicações da NASA (como NASA/TM—2020 e estudos no Ames Research Center) documentam que a frequência de piscadas espontâneas (esp. acima de 25 piscadas/minuto ou padrões erráticos) correlaciona-se fortemente com privação de sono, sobrecarga de trabalho mental e degradação da prontidão psicomotora.
                    </p>
                  </div>

                  {/* Item 3 */}
                  <div className="p-3.5 rounded-lg border bg-muted/40 space-y-1.5">
                    <h4 className="font-semibold text-primary flex items-center gap-1.5 text-sm">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">3</span>
                      Protocolo de Respiração 4-7-8 (Harvard Medical School)
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Baseado na regulação do nervo vago e ativação imediata do sistema nervoso parassimpático: 4 segundos de inalação nasal, 7 segundos de retenção pulmonar e 8 segundos de exalação oral suave. Esse ciclo atenua a descarga simpática e estabiliza a Variabilidade da Frequência Cardíaca (HRV) em períodos curtos de descanso.
                    </p>
                  </div>

                  <p className="text-[11px] text-muted-foreground italic border-t pt-2">
                    * Nota ética: O CrewVitals atua como ferramenta de apoio à decisão operacional da tripulação e não substitui diagnósticos ou condutas médicas profissionais.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">
              Registre observações do turno para análise de carga cognitiva (não substitui avaliação médica).
            </label>
            <Textarea
              placeholder="Registre observações do turno para análise de carga cognitiva (não substitui avaliação médica)..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">{text.length} caracteres · mínimo 20</p>
          </div>

          <Button onClick={analyzeText} disabled={isAnalyzing || text.length < 20} className="w-full">
            {isAnalyzing ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analisando padrões linguísticos e carga cognitiva...</>
            ) : (
              <><Brain className="h-4 w-4 mr-2" />Analisar Carga Cognitiva</>
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
              <h4 className="text-sm font-semibold mb-1">💡 Recomendação Operacional</h4>
              <p className="text-sm">{analysis.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
