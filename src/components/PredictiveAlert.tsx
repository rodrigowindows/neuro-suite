import { Badge } from '@/components/ui/badge';

export interface PredictiveAlertProps {
  onMitigate?: () => void;
  bioScore?: number;
}

export default function PredictiveAlert({
  onMitigate,
  bioScore,
}: PredictiveAlertProps) {
  return (
    <div
      role="alert"
      onClick={onMitigate}
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs ${
        onMitigate ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''
      }`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="outline"
          className="text-[10px] font-mono uppercase tracking-wider py-0 px-1.5 h-4 text-muted-foreground border-border/80"
        >
          Demonstração
        </Badge>
        <span className="font-medium text-foreground">
          {typeof bioScore === 'number' ? `BioScore ${bioScore} — ` : ''}
          Risco de erro em tarefas de precisão nas próximas 4 h — suspender acoplagem/EVA.
        </span>
      </div>
      <span className="text-[11px] text-muted-foreground/80 shrink-0">
        Cenário demonstrativo — não é uma previsão clínica validada.
      </span>
    </div>
  );
}
