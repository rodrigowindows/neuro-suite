import { useState, useRef, useCallback } from 'react';

export interface StreamMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface UseStreamingChatOptions {
  endpoint: string;
  buildBody: (messages: StreamMessage[], userMessage: StreamMessage) => Record<string, unknown>;
  onError?: (error: Error) => void;
}

export function useStreamingChat({ endpoint, buildBody, onError }: UseStreamingChatOptions) {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: StreamMessage = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    let assistantContent = '';
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const body = buildBody(messages, userMessage);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        if (response.status === 429) throw new Error('Muitas requisições. Aguarde um momento.');
        if (response.status === 402) throw new Error('Serviço temporariamente indisponível.');
        throw new Error('Erro ao conectar ao serviço');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      const processChunk = (content: string) => {
        assistantContent += content;
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg?.role === 'assistant') {
            lastMsg.content = assistantContent;
          }
          return newMessages;
        });
      };

      const parseLine = (line: string): boolean => {
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') return false;
        if (!line.startsWith('data: ')) return false;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') return true;

        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) processChunk(content);
        return false;
      };

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          const line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          try {
            if (parseLine(line)) { streamDone = true; break; }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (textBuffer.trim()) {
        for (const raw of textBuffer.split('\n')) {
          try { parseLine(raw); } catch { /* ignore */ }
        }
      }

      return [...messages, userMessage, { role: 'assistant' as const, content: assistantContent }];
    } catch (error: any) {
      if (error.name === 'AbortError') return undefined;
      onError?.(error);
      return undefined;
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, [messages, endpoint, buildBody, onError]);

  const cancelGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
  }, []);

  const resetMessages = useCallback((initial?: StreamMessage[]) => {
    setMessages(initial || []);
  }, []);

  return { messages, setMessages, isLoading, sendMessage, cancelGeneration, resetMessages };
}
