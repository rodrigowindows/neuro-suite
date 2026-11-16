import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/i18n';

export interface PredictiveAlertProps {
  onMitigate?: () => void;
  bioScore?: number;
}

export default function PredictiveAlert({
  onMitigate,
  bioScore,
}: PredictiveAlertProps) {
  const { t } = useI18n();

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
          {t('predictive.badge')}
        </Badge>
        <span className="font-medium text-foreground">
          {typeof bioScore === 'number'
            ? t('predictive.bioscorePrefix', { score: bioScore })
            : ''}
          {t('predictive.message')}
        </span>
      </div>
      <span className="text-[11px] text-muted-foreground/80 shrink-0">
        {t('predictive.disclaimer')}
      </span>
    </div>
  );
}
