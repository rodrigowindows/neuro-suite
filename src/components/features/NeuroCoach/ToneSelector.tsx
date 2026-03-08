import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ToneSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ToneSelector({ value, onChange }: ToneSelectorProps) {
  return (
    <div className="p-4 bg-accent/10 rounded-lg border-2 border-accent/30 space-y-3">
      <h3 className="font-semibold text-accent">🎯 Escolha teu tom de comunicação:</h3>
      <p className="text-sm text-muted-foreground">
        Selecione como prefere que o NeuroCoach se comunique com você
      </p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um tom..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="technical">
            🔬 Técnico/Acadêmico - Formal, científico com referências
          </SelectItem>
          <SelectItem value="casual">
            😎 Descolado Dia-a-Dia - Papo amigo, casual e motivador
          </SelectItem>
          <SelectItem value="spiritual">
            🧘 Toque Mestre Espiritual Pragmático - Inspiracional e guia interior
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
