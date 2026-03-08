import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Target, TrendingUp, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MeetingCheckInProps {
  overloadLevel: string;
  connectedCount: number;
  totalMeetingTime: number;
}

export default function MeetingCheckIn({ overloadLevel, connectedCount, totalMeetingTime }: MeetingCheckInProps) {
  const { toast } = useToast();
  const [checkInType, setCheckInType] = useState<'pre' | 'post'>('pre');
  const [purpose, setPurpose] = useState('');
  const [objectives, setObjectives] = useState('');
  const [expectations, setExpectations] = useState('');
  const [feedback, setFeedback] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAICheckIn = async () => {
    if (!purpose && checkInType === 'pre') {
      toast({ title: 'Campo obrigatório', description: 'Informe o propósito da reunião', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setAiResponse('');

    try {
      const prompt = checkInType === 'pre'
        ? `Você é um coach de alta performance com PNL. O usuário vai entrar em uma reunião com:
Propósito: ${purpose}
Objetivos: ${objectives}
Expectativas: ${expectations}

Faça 3 perguntas poderosas (PNL) para alinhar mindset antes da reunião. Seja conciso e motivador.`
        : `Você é um coach de alta performance com PNL. O usuário acabou uma reunião:
Propósito original: ${purpose}
Feedback: ${feedback || 'Não informado'}

Dê um feedback construtivo baseado em PNL: o que foi bem, o que melhorar, e uma ancoragem positiva. Máximo 3 parágrafos.`;

      const { data, error } = await supabase.functions.invoke('neuro-coach', {
        body: {
          messages: [{ role: 'user', content: prompt }],
          stressLevel: overloadLevel,
          context: `Integrations: ${connectedCount} conectadas. Tempo em reunião hoje: ${totalMeetingTime}min.`,
          userName: '',
          communicationTone: 'casual',
        },
      });

      if (error) throw error;
      setAiResponse(data.response);
    } catch (error: any) {
      console.error('Erro IA:', error);
      toast({ title: 'Erro', description: 'Não foi possível gerar feedback. Tente novamente.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Check-in de Reunião com IA
        </CardTitle>
        <CardDescription>Feedback baseado em PNL antes e depois das reuniões</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={checkInType === 'pre' ? 'default' : 'outline'}
            onClick={() => { setCheckInType('pre'); setAiResponse(''); }}
            className="flex-1"
          >
            <Target className="h-4 w-4 mr-2" />
            Pré-Reunião
          </Button>
          <Button
            variant={checkInType === 'post' ? 'default' : 'outline'}
            onClick={() => { setCheckInType('post'); setAiResponse(''); }}
            className="flex-1"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Pós-Reunião
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Propósito da reunião</label>
            <Textarea
              placeholder="Ex: Alinhamento de projeto, feedback trimestral..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="mt-1"
            />
          </div>

          {checkInType === 'pre' ? (
            <>
              <div>
                <label className="text-sm font-medium">Seus objetivos</label>
                <Textarea
                  placeholder="O que você quer alcançar nessa reunião?"
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Expectativas</label>
                <Textarea
                  placeholder="Qual resultado ideal?"
                  value={expectations}
                  onChange={(e) => setExpectations(e.target.value)}
                  className="mt-1"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-sm font-medium">Como foi a reunião?</label>
              <Textarea
                placeholder="Descreva brevemente o que aconteceu, sentimentos, resultados..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
          )}

          <Button onClick={generateAICheckIn} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Gerando feedback...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {checkInType === 'pre' ? 'Preparar Mindset' : 'Obter Feedback'}
              </>
            )}
          </Button>

          {aiResponse && (
            <div className="p-4 bg-muted/50 rounded-lg border mt-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                NeuroCoach diz:
              </h4>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{aiResponse}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
