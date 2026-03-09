import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Send, Bot, User, Trash2, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'Quais são as obrigações da NR-1 sobre riscos psicossociais?',
  'Como incluir riscos psicossociais no PGR?',
  'Quais as penalidades por descumprimento da NR-1?',
  'Como a Portaria 1.419/2024 impacta minha empresa?',
  'Quais ferramentas de avaliação são aceitas para riscos psicossociais?',
];

export default function NR1ComplianceChatbot() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Olá! Sou o assistente especialista em **NR-1** e regulamentação brasileira de SST.\n\nPosso ajudar com:\n- 📋 Obrigações da NR-1 e Portaria 1.419/2024\n- ⚠️ Riscos psicossociais no GRO/PGR\n- 💰 Multas e penalidades\n- 📊 Ferramentas de avaliação aceitas\n- 🔗 Integração com eSocial\n\nComo posso ajudar?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nr1-chatbot`;

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
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
        throw new Error('Erro ao conectar ao chatbot');
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
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Erro chatbot NR-1:', err);
      toast({ title: 'Erro', description: err.message || 'Não foi possível obter resposta.', variant: 'destructive' });
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const cancelGeneration = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([messages[0]]);
  };

  return (
    <div className="space-y-6">
      <Card className="flex flex-col" style={{ height: '70vh' }}>
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Chatbot NR-1 Compliance
            </div>
            {messages.length > 1 && (
              <Button variant="ghost" size="sm" onClick={clearChat}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Tire dúvidas sobre NR-1, Portaria 1.419/2024, PGR, riscos psicossociais e eSocial
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0 space-y-3">
          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, i) => (
                <Button key={i} variant="outline" size="sm" className="text-xs h-auto py-1.5 whitespace-normal text-left" onClick={() => sendMessage(s)}>
                  {s}
                </Button>
              ))}
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="space-y-4 pr-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-lg p-3 text-sm whitespace-pre-wrap leading-relaxed transition-all duration-300 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 border'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="h-7 w-7 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-secondary" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted/50 border rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">Consultando NR-1</p>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary rounded-full animate-[pulse_1.4s_ease-in-out_0s_infinite]" />
                        <span className="w-2 h-2 bg-primary rounded-full animate-[pulse_1.4s_ease-in-out_0.2s_infinite]" />
                        <span className="w-2 h-2 bg-primary rounded-full animate-[pulse_1.4s_ease-in-out_0.4s_infinite]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex gap-2 flex-shrink-0">
            <Input
              placeholder="Pergunte sobre NR-1, PGR, riscos psicossociais..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            {isLoading ? (
              <Button onClick={cancelGeneration} variant="destructive" size="icon" title="Cancelar geração">
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => sendMessage(input)} disabled={!input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
