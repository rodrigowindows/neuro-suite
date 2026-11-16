import { CheckCircle2, AlertTriangle, HelpCircle, type LucideIcon } from 'lucide-react';
import type { ReadinessState } from '@/lib/readiness';
import { useI18n } from '@/i18n';

export interface MissionStatusWidgetProps {
  state: ReadinessState;
  label?: string;
  isDemo?: boolean;
  stageBadge?: string | null;
  className?: string;
}

interface StatusVisual {
  textKey: string;
  Icon: LucideIcon;
  indicatorClass: string;
  textClass: string;
}

const STATUS_BY_STATE: Record<ReadinessState, StatusVisual> = {
  go: {
    textKey: 'cockpit.missionStatus.go',
    Icon: CheckCircle2,
    indicatorClass: 'bg-emerald-500',
    textClass: 'text-emerald-500',
  },
  caution: {
    textKey: 'cockpit.missionStatus.caution',
    Icon: AlertTriangle,
    indicatorClass: 'bg-amber-500',
    textClass: 'text-amber-500',
  },
  nogo: {
    textKey: 'cockpit.missionStatus.nogo',
    Icon: AlertTriangle,
    indicatorClass: 'bg-destructive',
    textClass: 'text-destructive font-semibold',
  },
  unknown: {
    textKey: 'cockpit.missionStatus.unknown',
    Icon: HelpCircle,
    indicatorClass: 'bg-muted-foreground/60',
    textClass: 'text-muted-foreground',
  },
};

export default function MissionStatusWidget({
  state,
  label,
  isDemo = false,
  stageBadge = null,
  className = '',
}: MissionStatusWidgetProps) {
  const { t } = useI18n();
  const visual = STATUS_BY_STATE[state];
  const { Icon, indicatorClass, textClass, textKey } = visual;
  const text = t(textKey);

  return (
    <div
      role="status"
      aria-live="polite"
      title={label}
      data-testid="mission-status-widget"
      className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-full border border-border/40 bg-card/40 backdrop-blur-sm select-none shrink-0 ${className}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span
        data-testid="mission-status-indicator"
        className={`h-2 w-2 rounded-full ${indicatorClass} shrink-0`}
      />
      <span
        data-testid="mission-status-text"
        className={`text-xs font-mono truncate max-w-[150px] sm:max-w-none ${textClass}`}
      >
        {text}
      </span>
      {isDemo && stageBadge && (
        <span data-testid="mission-status-stage" className="text-[10px] font-mono text-muted-foreground shrink-0">
          {stageBadge}
        </span>
      )}
    </div>
  );
}
