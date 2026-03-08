import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate('/dashboard')}
      className="text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      <span className="hidden sm:inline">Voltar</span>
    </Button>
  );
}
