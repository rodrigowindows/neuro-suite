import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { CoachMessage, getInitialMessage, buildContext, exportConversation } from '@/services/coachService';
import ToneSelector from './ToneSelector';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface NeuroCoachProps {
  stressLevel?: string;
}

export default function NeuroCoach({ stressLevel }: NeuroCoachProps) {
  const effectiveStressLevel = stressLevel || 'unknown';
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [hrvValue, setHrvValue] = useState('40');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [communicationTone, setCommunicationTone] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { toast } = useToast();

  // Load last conversation or create initial message
  useEffect(() => {
    const loadOrCreateConversation = async () => {
      try {
        if (user) {
          const { data } = await supabase
            .from('coach_conversations')
            .select('*')
            .eq('user_id', user.id)
            .eq('stress_level', effectiveStressLevel)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (data && data.messages && Array.isArray(data.messages)) {
            setMessages(data.messages as unknown as CoachMessage[]);
            setConversationId(data.id);
            return;
          }
        }
      } catch (error) {
        console.error('Erro ao carregar conversa:', error);
      }

      setMessages([{ role: 'assistant', content: getInitialMessage(effectiveStressLevel) }]);
    };

    if (effectiveStressLevel) {
      loadOrCreateConversation();
    }
  }, [effectiveStressLevel, user?.id]);

  const sendMessage = async (text: string) => {
    const userMessage: CoachMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    let assistantContent = '';
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const context = buildContext(effectiveStressLevel, hrvValue);
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/neuro-coach`;

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          stressLevel: effectiveStressLevel,
          context,
          userName: profile?.displayName || '',
          communicationTone,
        }),
        signal: controller.signal,
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

      // Adiciona mensagem vazia do assistente
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

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
              assistantContent += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg?.role === 'assistant') {
                  lastMsg.content = assistantContent;
                }
                return newMessages;
              });
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
              assistantContent += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg?.role === 'assistant') {
                  lastMsg.content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch {}
        }
      }

      // Persist conversation
      const allMessages = [...messages, userMessage, { role: 'assistant', content: assistantContent } as CoachMessage];
      if (conversationId) {
        await supabase
          .from('coach_conversations')
          .update({ messages: allMessages as any, updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      } else if (user) {
        const { data: newConv } = await supabase
          .from('coach_conversations')
          .insert([{ user_id: user.id, stress_level: effectiveStressLevel, messages: allMessages as any }])
          .select()
          .single();
        if (newConv) setConversationId(newConv.id);
      }
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast({ title: 'Erro', description: error.message || 'Não foi possível enviar a mensagem', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const blob = exportConversation(messages);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plano-neurosuite.txt';
    a.click();
    toast({ title: 'Plano exportado! 📄', description: 'Seu plano foi baixado com sucesso.' });
  };

  const resetTone = () => {
    setCommunicationTone('');
    setMessages([]);
    setConversationId(null);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-secondary" />
            NeuroCoach - Agente IA Personalizado
          </CardTitle>
          <CardDescription>
            Coaching com PNL baseado no seu NeuroScore para alta performance e compliance NR-1
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!communicationTone && (
            <ToneSelector value={communicationTone} onChange={setCommunicationTone} />
          )}

          {communicationTone && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="hrv" className="text-sm font-medium">
                    HRV da Pulseira (RMSSD em ms) - Opcional
                  </label>
                  <Button variant="ghost" size="sm" onClick={resetTone} className="text-xs">
                    Mudar Tom
                  </Button>
                </div>
                <Input
                  id="hrv"
                  type="number"
                  placeholder="40"
                  value={hrvValue}
                  onChange={(e) => setHrvValue(e.target.value)}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Valores &lt;30 validam estresse alto. Default: 40ms
                </p>
              </div>

              <ChatMessages messages={messages} isLoading={isLoading} />
              <ChatInput onSend={sendMessage} isLoading={isLoading} />

              {messages.length > 2 && (
                <Button onClick={handleExport} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Plano Semanal
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
