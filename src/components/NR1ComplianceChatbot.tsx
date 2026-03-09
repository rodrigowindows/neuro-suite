import { useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Send, Bot, User, Trash2, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { useEffect, useRef, useState } from 'react';

const INITIAL_MESSAGE = {
  role: 'assistant' as const,
  content: '👋 Olá! Sou o assistente especialista em **NR-1** e regulamentação brasileira de SST.\n\nPosso ajudar com:\n- 📋 Obrigações da NR-1 e Portaria 1.419/2024\n- ⚠️ Riscos psicossociais no GRO/PGR\n- 💰 Multas e penalidades\n- 📊 Ferramentas de avaliação aceitas\n- 🔗 Integração com eSocial\n\nComo posso ajudar?',
};

const SUGGESTIONS = [
  'Quais são as obrigações da NR-1 sobre riscos psicossociais?',
  'Como incluir riscos psicossociais no PGR?',
  'Quais as penalidades por descumprimento da NR-1?',
  'Como a Portaria 1.419/2024 impacta minha empresa?',
  'Quais ferramentas de avaliação são aceitas para riscos psicossociais?',
];

export default function NR1ComplianceChatbot() {
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nr1-chatbot`;

  const buildBody = useCallback((msgs: any[], userMsg: any) => ({
    messages: [...msgs, userMsg],
  }), []);

  const { messages, isLoading, sendMessage, cancelGeneration, resetMessages } = useStreamingChat({
    endpoint: CHAT_URL,
    buildBody,
    onError: (error) => toast({ title: 'Erro', description: error.message || 'Não foi possível obter resposta.', variant: 'destructive' }),
  });

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      resetMessages([INITIAL_MESSAGE]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setInput('');
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const clearChat = () => {
    resetMessages([INITIAL_MESSAGE]);
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
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, i) => (
                <Button key={i} variant="outline" size="sm" className="text-xs h-auto py-1.5 whitespace-normal text-left" onClick={() => handleSend(s)}>
                  {s}
                </Button>
              ))}
            </div>
          )}

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
              {isLoading && messages[messages.length - 1]?.content === '' && (
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
              <Button onClick={() => handleSend(input)} disabled={!input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
