import { Button } from '@/components/ui/button';

interface PredictiveAlertProps {
  onMitigate: () => void;
}

export default function PredictiveAlert({ onMitigate }: PredictiveAlertProps) {
  return (
    <section role="alert" aria-labelledby="predictive-alert-title" className="rounded-lg border-2 border-destructive/70 bg-destructive/10 p-4 sm:p-5 space-y-3">
      <p className="text-xs font-medium text-muted-foreground">Cenário demonstrativo — não é uma previsão clínica validada.</p>
      <h2 id="predictive-alert-title" className="font-display font-bold text-base text-foreground">⚠️ ALERTA DO MOTOR PREDITIVO (Predictive Engine)</h2>
      <p className="font-semibold text-foreground">Risco de fadiga crítica e erro operacional nas próximas 12h.</p>
      <p className="text-sm text-foreground">Fatores detectados: Baixa qualidade de sono no Biometric Log + Fadiga detectada no BioScore.</p>
      <p className="text-sm text-foreground">Ação recomendada: Iniciar AstroAssist.</p>
      <Button variant="destructive" onClick={onMitigate} className="h-auto min-h-10 whitespace-normal text-left">Iniciar Protocolo de Mitigação</Button>
    </section>
  );
}