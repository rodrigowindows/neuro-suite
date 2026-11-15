import { StressResult, getStressLabel, getDiagnosticLabel, getPnlTip } from '@/services/stressCalculator';
import PostScanActionPlan from '@/components/PostScanActionPlan';
import { roundBlinkRate } from '@/lib/biometricDisplay';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Activity, AlertTriangle, type LucideIcon } from 'lucide-react';

interface ScanResultProps {
  result: StressResult;
  userName: string;
  lastHrvValue?: number;
}

const STRESS_CONFIG: Record<
  string,
  {
    icon: LucideIcon;
    badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
    colorClass: string;
    badgeText: string;
  }
> = {
  low: {
    icon: CheckCircle,
    badgeVariant: 'default',
    colorClass: 'text-emerald-500',
    badgeText: 'Estável',
  },
  moderate: {
    icon: Activity,
    badgeVariant: 'secondary',
    colorClass: 'text-amber-500',
    badgeText: 'Atenção',
  },
  high: {
    icon: AlertTriangle,
    badgeVariant: 'destructive',
    colorClass: 'text-rose-500',
    badgeText: 'Alerta',
  },
};

export default function ScanResult({ result, userName, lastHrvValue }: ScanResultProps) {
  const config = STRESS_CONFIG[result.stressLevel] || STRESS_CONFIG.low;
  const StatusIcon = config.icon;

  return (
    <div className="p-6 bg-gradient-card rounded-lg space-y-4 border border-primary/20">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="rounded-full bg-background/60 p-4 border border-border shadow-sm">
            <StatusIcon className={`h-12 w-12 ${config.colorClass}`} data-testid="scan-status-icon" />
          </div>
        </div>
        <div className="flex justify-center">
          <Badge
            variant={config.badgeVariant}
            className="text-xs uppercase tracking-wider"
            data-testid="scan-status-badge"
          >
            {config.badgeText}
          </Badge>
        </div>
        <h3 className="text-2xl font-bold">
          {userName && <span>{userName}, </span>}
          Nível {getStressLabel(result.stressLevel)}
        </h3>
        <p className="text-muted-foreground">{result.message}</p>
        <p className="text-xs font-mono text-muted-foreground mt-1.5" data-testid="ai-confidence">Confiança do Modelo de Visão: 94% (valor de demonstração)</p>
      </div>

      <div className={`grid ${result.hrvValue ? 'grid-cols-3' : 'grid-cols-2'} gap-4 pt-4 border-t`}>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Taxa de piscadas</p>
          <p className="text-2xl font-bold text-primary">{roundBlinkRate(result.blinkRate)} piscadas/min</p>
        </div>
        {result.hrvValue && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">HRV</p>
            <p className="text-2xl font-bold text-accent">{result.hrvValue}<span className="text-sm">ms</span></p>
          </div>
        )}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Diagnóstico</p>
          <p className="text-2xl font-bold text-secondary">
            {getDiagnosticLabel(result.stressLevel)}
          </p>
        </div>
      </div>

      <div className="p-4 bg-primary/5 rounded-lg">
        <p className="text-sm font-medium mb-2">Dica PNL:</p>
        <p className="text-sm text-muted-foreground">{getPnlTip(result.stressLevel)}</p>
      </div>

      <PostScanActionPlan
        stressLevel={result.stressLevel}
        blinkRate={result.blinkRate}
        hrvValue={result.hrvValue ?? lastHrvValue}
      />
    </div>
  );
}
