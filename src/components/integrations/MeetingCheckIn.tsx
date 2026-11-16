import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Target, TrendingUp, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/i18n';

interface MeetingCheckInProps {
  overloadLevel: string;
  connectedCount: number;
  totalMeetingTime: number;
}

export default function MeetingCheckIn({ overloadLevel, connectedCount, totalMeetingTime }: MeetingCheckInProps) {
  const { toast } = useToast();
  const { t, lang } = useI18n();
  const [checkInType, setCheckInType] = useState<'pre' | 'post'>('pre');
  const [purpose, setPurpose] = useState('');
  const [objectives, setObjectives] = useState('');
  const [expectations, setExpectations] = useState('');
  const [feedback, setFeedback] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAICheckIn = async () => {
    if (!purpose && checkInType === 'pre') {
      toast({
        title: t('integrations.toast.requiredField'),
        description: t('integrations.toast.purposeRequired'),
        variant: 'destructive',
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: t('integrations.toast.sessionExpired'),
        description: t('integrations.toast.sessionExpiredDesc'),
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setAiResponse('');

    let streamedContent = '';

    try {
      const prompt = lang === 'en'
        ? (checkInType === 'pre'
            ? `You are an operational readiness coach using NLP. The user is about to enter a meeting with:
Purpose: ${purpose}
Objectives: ${objectives}
Expectations: ${expectations}

Ask 3 powerful questions (NLP) to align mindset before the meeting. Be concise and motivating.`
            : `You are an operational readiness coach using NLP. The user just finished a meeting:
Original purpose: ${purpose}
Feedback: ${feedback || 'Not provided'}

Provide constructive feedback based on NLP: what went well, what to improve, and positive anchoring. Maximum 3 paragraphs.`)
        : (checkInType === 'pre'
            ? `Você é um coach de prontidão operacional com PNL. O usuário vai entrar em uma reunião com:
Propósito: ${purpose}
Objetivos: ${objectives}
Expectativas: ${expectations}

Faça 3 perguntas poderosas (PNL) para alinhar mindset antes da reunião. Seja conciso e motivador.`
            : `Você é um coach de prontidão operacional com PNL. O usuário acabou uma reunião:
Propósito original: ${purpose}
Feedback: ${feedback || 'Não informado'}

Dê um feedback construtivo baseado em PNL: o que foi bem, o que melhorar, e uma ancoragem positiva. Máximo 3 parágrafos.`);

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/neuro-coach`;

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          stressLevel: overloadLevel,
          context: lang === 'en'
            ? `Integrations: ${connectedCount} connected. Meeting time today: ${totalMeetingTime}min.`
            : `Integrations: ${connectedCount} conectadas. Tempo em reunião hoje: ${totalMeetingTime}min.`,
          userName: '',
          communicationTone: 'casual',
        }),
      });

      if (!response.ok || !response.body) {
        if (response.status === 429) {
          throw new Error(t('integrations.checkin.rateLimitError'));
        }
        if (response.status === 402) {
          throw new Error(t('integrations.checkin.unavailableError'));
        }
        throw new Error(t('integrations.checkin.connectError'));
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
      toast({
        title: t('integrations.toast.error'),
        description: error.message || t('integrations.toast.feedbackError'),
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          {t('integrations.checkin.title')}
        </CardTitle>
        <CardDescription>{t('integrations.checkin.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={checkInType === 'pre' ? 'default' : 'outline'}
            onClick={() => { setCheckInType('pre'); setAiResponse(''); }}
            className="flex-1"
          >
            <Target className="h-4 w-4 mr-2" />
            {t('integrations.checkin.preMeeting')}
          </Button>
          <Button
            variant={checkInType === 'post' ? 'default' : 'outline'}
            onClick={() => { setCheckInType('post'); setAiResponse(''); }}
            className="flex-1"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {t('integrations.checkin.postMeeting')}
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">{t('integrations.checkin.purposeLabel')}</label>
            <Textarea
              placeholder={t('integrations.checkin.purposePlaceholder')}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="mt-1"
            />
          </div>

          {checkInType === 'pre' ? (
            <>
              <div>
                <label className="text-sm font-medium">{t('integrations.checkin.objectivesLabel')}</label>
                <Textarea
                  placeholder={t('integrations.checkin.objectivesPlaceholder')}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t('integrations.checkin.expectationsLabel')}</label>
                <Textarea
                  placeholder={t('integrations.checkin.expectationsPlaceholder')}
                  value={expectations}
                  onChange={(e) => setExpectations(e.target.value)}
                  className="mt-1"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-sm font-medium">{t('integrations.checkin.postFeedbackLabel')}</label>
              <Textarea
                placeholder={t('integrations.checkin.postFeedbackPlaceholder')}
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
                {t('integrations.checkin.generating')}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {checkInType === 'pre' ? t('integrations.checkin.prepareMindset') : t('integrations.checkin.getFeedback')}
              </>
            )}
          </Button>

          {aiResponse && (
            <div className="p-4 bg-muted/50 rounded-lg border mt-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                {t('integrations.checkin.assistantSays')}
              </h4>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{aiResponse}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
