import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Send, Bot, User, Trash2, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { useI18n } from '@/i18n';

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

export default function NR1ComplianceChatbot() {
  const { t } = useI18n();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nr1-chatbot`;

  const initialMessage = useMemo(() => ({
    role: 'assistant' as const,
    content: t('safety.chatbot.initialMessage'),
  }), [t]);

  const suggestions = useMemo(() => [
    t('safety.chatbot.suggestion1'),
    t('safety.chatbot.suggestion2'),
    t('safety.chatbot.suggestion3'),
    t('safety.chatbot.suggestion4'),
    t('safety.chatbot.suggestion5'),
  ], [t]);

  const buildBody = useCallback((msgs: ChatMessage[], userMsg: ChatMessage) => ({
    messages: [...msgs, userMsg],
  }), []);

  const { messages, isLoading, sendMessage, cancelGeneration, resetMessages } = useStreamingChat({
    endpoint: CHAT_URL,
    buildBody,
    onError: (error) =>
      toast({
        title: t('safety.chatbot.toast.errorTitle'),
        description: error.message || t('safety.chatbot.toast.errorDesc'),
        variant: 'destructive',
      }),
  });

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      resetMessages([initialMessage]);
    }
  }, [initialMessage, messages.length, resetMessages]);

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
    resetMessages([initialMessage]);
  };

  return (
    <div className="space-y-6">
      <Card className="flex flex-col" style={{ height: '70vh' }}>
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t('safety.chatbot.title')}
            </div>
            {messages.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                title={t('safety.chatbot.clear')}
                aria-label={t('safety.chatbot.clear')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            {t('safety.chatbot.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0 space-y-3">
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-1.5 whitespace-normal text-left"
                  onClick={() => handleSend(s)}
                >
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
                      <p className="text-sm text-muted-foreground">{t('safety.chatbot.consulting')}</p>
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
              placeholder={t('safety.chatbot.inputPlaceholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            {isLoading ? (
              <Button
                onClick={cancelGeneration}
                variant="destructive"
                size="icon"
                title={t('safety.chatbot.cancel')}
                aria-label={t('safety.chatbot.cancel')}
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => handleSend(input)}
                disabled={!input.trim()}
                size="icon"
                title={t('safety.chatbot.send')}
                aria-label={t('safety.chatbot.send')}
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            {t('safety.chatbot.supportDisclaimer')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
