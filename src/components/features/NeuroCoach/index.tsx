import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getInitialMessage, buildContext, exportConversation } from '@/services/coachService';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import ToneSelector from './ToneSelector';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface NeuroCoachProps {
  stressLevel?: string;
}

export default function NeuroCoach({ stressLevel }: NeuroCoachProps) {
  const effectiveStressLevel = stressLevel || 'unknown';
  const [hrvValue, setHrvValue] = useState('40');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [communicationTone, setCommunicationTone] = useState('');
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/neuro-coach`;

  const buildBody = useCallback((msgs: any[], userMsg: any) => ({
    messages: [...msgs, userMsg],
    stressLevel: effectiveStressLevel,
    context: buildContext(effectiveStressLevel, hrvValue),
    userName: profile?.displayName || '',
    communicationTone,
  }), [effectiveStressLevel, hrvValue, profile?.displayName, communicationTone]);

  const { messages, setMessages, isLoading, sendMessage: streamSend, cancelGeneration, resetMessages } = useStreamingChat({
    endpoint: CHAT_URL,
    buildBody,
    onError: (error) => toast({ title: 'Erro', description: error.message || 'Não foi possível enviar a mensagem', variant: 'destructive' }),
  });

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
            setMessages(data.messages as any);
            setConversationId(data.id);
            return;
          }
        }
      } catch (error) {
        console.error('Erro ao carregar conversa:', error);
      }

      resetMessages([{ role: 'assistant', content: getInitialMessage(effectiveStressLevel) }]);
    };

    if (effectiveStressLevel) loadOrCreateConversation();
  }, [effectiveStressLevel, user?.id]);

  const handleSend = async (text: string) => {
    const allMessages = await streamSend(text);
    if (!allMessages) return;

    // Persist conversation
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
    resetMessages([]);
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
              <ChatInput onSend={handleSend} onCancel={cancelGeneration} isLoading={isLoading} />

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
