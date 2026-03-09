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

    let streamedContent = '';

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

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/neuro-coach`;

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          stressLevel: overloadLevel,
          context: `Integrations: ${connectedCount} conectadas. Tempo em reunião hoje: ${totalMeetingTime}min.`,
          userName: '',
          communicationTone: 'casual',
        }),
      });

      if (!response.ok || !response.body) {
        if (response.status === 429) {
          throw new Error('Muitas requisições. Aguarde um momento.');
        }
        if (response.status === 402) {
          throw new Error('Serviço temporariamente indisponível.');
        }
        throw new Error('Erro ao conectar ao NeuroCoach');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              streamedContent += content;
              setAiResponse(streamedContent);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Flush final
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw || raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              streamedContent += content;
              setAiResponse(streamedContent);
            }
          } catch {}
        }
      }
    } catch (error: any) {
      console.error('Erro IA:', error);
      toast({ title: 'Erro', description: error.message || 'Não foi possível gerar feedback. Tente novamente.', variant: 'destructive' });
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
