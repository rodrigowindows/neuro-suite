import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, BookOpen } from 'lucide-react';

interface ResearchValidationModalProps {
  triggerText?: string;
  triggerClassName?: string;
}

export function ResearchValidationModal({
  triggerText = 'Research & Validation (NASA / Harvard)',
  triggerClassName,
}: ResearchValidationModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="link"
          size="sm"
          aria-label="Base Científica — Research & Validation (NASA / Harvard)"
          className={
            triggerClassName ||
            'gap-1.5 text-xs text-primary underline-offset-4 hover:underline p-0 h-auto font-medium inline-flex items-center'
          }
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>{triggerText}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-display">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Base Científica e Evidências Operacionais (Research & Validation)
          </DialogTitle>
          <DialogDescription className="text-xs">
            Fundamentos técnicos, evidências científicas e protocolos aeroespaciais integrados ao CrewVitals.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-sm text-foreground/90">
          {/* Item 1 */}
          <div className="p-3.5 rounded-lg border bg-muted/40 space-y-1.5">
            <h4 className="font-semibold text-primary flex items-center gap-1.5 text-sm">
              <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">1</span>
              NASA Human Research Program — Behavioral Health & Performance: Cognitive Fatigue in Extreme Environments.
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O elemento Behavioral Health & Performance (BHP) do NASA Human Research Program investiga o impacto do isolamento, perturbações do ritmo circadiano e alta densidade de tarefas sobre a prontidão cognitiva. A detecção precoce de lapsos de atenção protege a tripulação contra erros em operações críticas.
            </p>
          </div>

          {/* Item 2 */}
          <div className="p-3.5 rounded-lg border bg-muted/40 space-y-1.5">
            <h4 className="font-semibold text-primary flex items-center gap-1.5 text-sm">
              <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">2</span>
              Blink Rate as a Physiological Measure of Fatigue — NASA Technical Reports & FAA Flight Standards.
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Publicações técnicas da NASA (Ames Research Center) e padrões de segurança da FAA documentam que a frequência de piscadas espontâneas (notadamente acima de 25 piscadas/minuto ou com padrões erráticos) serve como biomarcador direto de sonolência, sobrecarga mental e degradação da prontidão psicomotora.
            </p>
          </div>

          {/* Item 3 */}
          <div className="p-3.5 rounded-lg border bg-muted/40 space-y-1.5">
            <h4 className="font-semibold text-primary flex items-center gap-1.5 text-sm">
              <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">3</span>
              Protocolo Parassimpático 4-7-8 — Harvard Medical School / Integrative Medicine.
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Baseado na ativação do nervo vago e modulação autonômica parassimpática: 4 segundos de inalação, 7 segundos de retenção pulmonar e 8 segundos de exalação suave. Estudos de medicina integrativa vinculados à Harvard Medical School demonstram aumento agudo do tônus vagal e estabilização da Variabilidade da Frequência Cardíaca (HRV).
            </p>
          </div>

          {/* Ethical Disclaimer */}
          <div className="border-t pt-3 mt-2">
            <div className="text-xs text-amber-500/90 dark:text-amber-400/90 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 leading-relaxed">
              <span className="font-semibold block mb-0.5">Aviso Ético & Operacional:</span>
              O CrewVitals atua como Sistema de Suporte à Decisão (DSS) operacional e não substitui diagnóstico médico.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ResearchValidationModal;
