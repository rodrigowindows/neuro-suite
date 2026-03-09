import { useRef, useEffect } from 'react';
import type { CoachMessage } from '@/services/coachService';

interface ChatMessagesProps {
  messages: CoachMessage[];
  isLoading: boolean;
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-[60vh] max-h-[400px] overflow-y-auto space-y-3 sm:space-y-4 p-3 sm:p-4 bg-muted/30 rounded-lg border">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border shadow-soft'
            }`}
          >
            <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-[80%] p-3 rounded-lg bg-card border shadow-soft">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">NeuroCoach está digitando</p>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-[pulse_1.4s_ease-in-out_0s_infinite]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-[pulse_1.4s_ease-in-out_0.2s_infinite]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-[pulse_1.4s_ease-in-out_0.4s_infinite]" />
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
