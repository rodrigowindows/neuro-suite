import { useState, useEffect } from 'react';
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
  const { profile } = useUserProfile();
  const { toast } = useToast();

  // Load last conversation or create initial message
  useEffect(() => {
    const loadOrCreateConversation = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
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

      if (messages.length === 0) {
        setMessages([{ role: 'assistant', content: getInitialMessage(effectiveStressLevel) }]);
      }
    };

    if (effectiveStressLevel) {
      loadOrCreateConversation();
    }
  }, [effectiveStressLevel]);

  const sendMessage = async (text: string) => {
    const userMessage: CoachMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const context = buildContext(effectiveStressLevel, hrvValue);

      const { data, error } = await supabase.functions.invoke('neuro-coach', {
        body: {
          messages: [...messages, userMessage],
          stressLevel: effectiveStressLevel,
          context,
          userName: profile?.displayName || '',
          communicationTone,
        },
      });

      if (error) throw error;

      const assistantMessage: CoachMessage = { role: 'assistant', content: data.response };
      setMessages((prev) => [...prev, assistantMessage]);

      // Persist conversation
      const allMessages = [...messages, userMessage, assistantMessage];
      if (conversationId) {
        await supabase
          .from('coach_conversations')
          .update({ messages: allMessages as any, updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: newConv } = await supabase
            .from('coach_conversations')
            .insert([{ user_id: user.id, stress_level: effectiveStressLevel, messages: allMessages as any }])
            .select()
            .single();
          if (newConv) setConversationId(newConv.id);
        }
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
