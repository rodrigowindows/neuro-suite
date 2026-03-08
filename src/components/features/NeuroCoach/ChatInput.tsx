import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="flex gap-2">
      <Textarea
        placeholder="Descreva como se sente ou o que quer melhorar..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        className="min-h-[50px] sm:min-h-[60px] text-xs sm:text-sm"
      />
      <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon" className="h-10 w-10 sm:h-12 sm:w-12">
        <Send className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
}
