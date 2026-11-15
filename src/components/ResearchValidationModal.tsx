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
import { cn } from '@/lib/utils';

export interface MissionRiskCoverage {
  indicator: string;
  classification: 'Medido' | 'Autorrelatado' | 'Parcial' | 'Não coberto';
  source: string;
}

export const MISSION_RISK_COVERAGE: MissionRiskCoverage[] = [
  {
    indicator: 'Fadiga cognitiva e sono',
    classification: 'Parcial',
    source: 'piscadas/min estimadas por webcam; horas de sono autorrelatadas.',
  },
  {
    indicator: 'Cardiovascular',
    classification: 'Parcial',
    source: 'HRV estimada por webcam (não validada clinicamente); sem pressão arterial nem ECG.',
  },
  {
    indicator: 'Saúde mental, isolamento e confinamento',
    classification: 'Autorrelatado',
    source: 'avaliação de prontidão (humor/energia) e fadiga percebida.',
  },
  {
    indicator: 'Perda óssea e muscular',
    classification: 'Parcial',
    source: 'exercício autorrelatado; sem densitometria.',
  },
  {
    indicator: 'Radiação espacial',
    classification: 'Não coberto',
    source: 'sem dosímetro; previsto integração com dosímetros de bordo.',
  },
  {
    indicator: 'Imunológico',
    classification: 'Autorrelatado',
    source: 'sintomas',
  },
];

const getClassificationBadgeClass = (classification: MissionRiskCoverage['classification']) => {
  switch (classification) {
    case 'Medido':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'Parcial':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'Autorrelatado':
      return 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400';
    case 'Não coberto':
    default:
      return 'border-border bg-muted/60 text-muted-foreground';
  }
};

interface ResearchValidationModalProps {
  triggerText?: string;
  triggerClassName?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ResearchValidationModal({
  triggerText = 'Research & Validation (NASA / Harvard)',
  triggerClassName,
  defaultOpen,
  open,
  onOpenChange,
}: ResearchValidationModalProps) {
  return (
    <Dialog defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
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

          {/* Seção Cobertura dos Riscos de Missão */}
          <div className="space-y-2 pt-2 border-t">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
              Cobertura dos Riscos de Missão
            </h3>
            <div
              tabIndex={0}
              role="region"
              aria-label="Tabela de Cobertura dos Riscos de Missão"
              className="overflow-x-auto rounded-lg border bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <table className="w-full min-w-[340px] text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50 text-muted-foreground">
                    <th scope="col" className="p-2 text-left font-medium">Indicador</th>
                    <th scope="col" className="p-2 text-left font-medium">Classificação</th>
                    <th scope="col" className="p-2 text-left font-medium">Fonte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MISSION_RISK_COVERAGE.map((item) => (
                    <tr key={item.indicator} className="hover:bg-muted/30">
                      <td className="p-2 font-medium text-foreground align-top">
                        {item.indicator}
                      </td>
                      <td className="p-2 align-top whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-block px-1.5 py-0.5 rounded text-[11px] font-medium border',
                            getClassificationBadgeClass(item.classification)
                          )}
                        >
                          {item.classification}
                        </span>
                      </td>
                      <td className="p-2 text-muted-foreground leading-relaxed align-top">
                        {item.source}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Apoio à decisão do tripulante; não substitui avaliação médica
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t">
            <h3 className="font-semibold text-foreground text-sm">Composição do BioScore</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O BioScore (0-100) soma estresse (0-40), consistência de uso (0-30) e HRV (0-30). O veredito de prontidão GO / ATENÇÃO / NO-GO usa apenas estresse e HRV, sem depender de engajamento do usuário.
            </p>
          </div>

          {/* Ethical Disclaimer */}
          <div className="border-t pt-3 mt-2">
            <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 leading-relaxed">
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
