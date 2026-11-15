export interface MissionStatusWidgetProps {
  isAlert?: boolean;
  isUnknown?: boolean;
  className?: string;
}

export default function MissionStatusWidget({
  isAlert = false,
  isUnknown = false,
  className = '',
}: MissionStatusWidgetProps) {
  let indicatorColor = 'bg-emerald-500';
  let textClass = 'text-xs font-mono text-emerald-500';
  let label = 'Status da Missão: Nominal';

  if (isUnknown) {
    indicatorColor = 'bg-muted-foreground/60';
    textClass = 'text-xs font-mono text-muted-foreground';
    label = 'Status da Missão: Sem dados';
  } else if (isAlert) {
    indicatorColor = 'bg-destructive';
    textClass = 'text-xs font-mono text-destructive font-semibold';
    label = 'Atenção: Fadiga Detectada';
  }

  return (
    <div
      role="status"
      data-testid="mission-status-widget"
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border/40 bg-card/40 backdrop-blur-sm select-none ${className}`}
    >
      <span
        data-testid="mission-status-indicator"
        className={`h-2 w-2 rounded-full ${indicatorColor}`}
      />
      <span
        data-testid="mission-status-text"
        className={textClass}
      >
        {label}
      </span>
    </div>
  );
}
