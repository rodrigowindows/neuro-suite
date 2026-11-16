import { StressResult, getStressLabel, getDiagnosticLabel, getPnlTip } from '@/services/stressCalculator';
import PostScanActionPlan from '@/components/PostScanActionPlan';
import { roundBlinkRate } from '@/lib/biometricDisplay';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Activity, AlertTriangle, type LucideIcon } from 'lucide-react';
import { useI18n } from '@/i18n';

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
    badgeKey: string;
  }
> = {
  low: {
    icon: CheckCircle,
    badgeVariant: 'default',
    colorClass: 'text-emerald-500',
    badgeKey: 'bioscore.badge.stable',
  },
  moderate: {
    icon: Activity,
    badgeVariant: 'secondary',
    colorClass: 'text-amber-500',
    badgeKey: 'bioscore.badge.caution',
  },
  high: {
    icon: AlertTriangle,
    badgeVariant: 'destructive',
    colorClass: 'text-rose-500',
    badgeKey: 'bioscore.badge.alert',
  },
};

export default function ScanResult({ result, userName, lastHrvValue }: ScanResultProps) {
  const { t } = useI18n();
  const config = STRESS_CONFIG[result.stressLevel] || STRESS_CONFIG.low;
  const StatusIcon = config.icon;

  const displayMessage = (() => {
    if (result.message === 'Foco otimizado, produtividade alta') return t('bioscore.msg.low');
    if (result.message === 'Atenção normal, sugira pausas para evitar burnout') return t('bioscore.msg.moderate');
    if (result.message === 'Fadiga detectada. Risco de erro operacional') return t('bioscore.msg.high');
    if (result.message === 'Alerta estresse: HRV baixo + piscadas altas (validação cruzada)') return t('bioscore.msg.crossValidation');
    return result.message;
  })();

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
            {t(config.badgeKey)}
          </Badge>
        </div>
        <h3 className="text-2xl font-bold">
          {userName && <span>{userName}, </span>}
          {t('bioscore.result.levelHeading', { level: getStressLabel(result.stressLevel, t) })}
        </h3>
        <p className="text-muted-foreground">{displayMessage}</p>
        <p className="text-xs font-mono text-muted-foreground mt-1.5" data-testid="ai-confidence">
          {t('bioscore.result.confidence')}
        </p>
      </div>

      <div className={`grid ${result.hrvValue ? 'grid-cols-3' : 'grid-cols-2'} gap-4 pt-4 border-t`}>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{t('bioscore.metric.blinkRate')}</p>
          <p className="text-2xl font-bold text-primary">
            {t('bioscore.metric.blinkRateValue', { rate: roundBlinkRate(result.blinkRate) })}
          </p>
        </div>
        {result.hrvValue && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t('bioscore.metric.hrv')}</p>
            <p className="text-2xl font-bold text-accent">
              {result.hrvValue}
              <span className="text-sm">{t('bioscore.metric.hrvUnit')}</span>
            </p>
          </div>
        )}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{t('bioscore.metric.diagnostic')}</p>
          <p className="text-2xl font-bold text-secondary">
            {getDiagnosticLabel(result.stressLevel, t)}
          </p>
        </div>
      </div>

      <div className="p-4 bg-primary/5 rounded-lg">
        <p className="text-sm font-medium mb-2">{t('bioscore.pnl.label')}</p>
        <p className="text-sm text-muted-foreground">{getPnlTip(result.stressLevel, t)}</p>
      </div>

      <PostScanActionPlan
        stressLevel={result.stressLevel}
        blinkRate={result.blinkRate}
        hrvValue={result.hrvValue ?? lastHrvValue}
      />
    </div>
  );
}
