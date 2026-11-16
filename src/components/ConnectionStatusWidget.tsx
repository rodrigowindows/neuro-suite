/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Satellite, SatelliteDish } from 'lucide-react';
import { toast } from 'sonner';
import { useConnectionMode } from '@/hooks/useConnectionMode';
import { getOutboxCount, flush, OUTBOX_SYNC_EVENT } from '@/lib/offlineOutbox';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/i18n';

export { STORAGE_KEY, SYNC_EVENT } from '@/hooks/useConnectionMode';

export interface ConnectionStatusWidgetProps {
  className?: string;
  showSubtext?: boolean;
}

export default function ConnectionStatusWidget({
  className = '',
  showSubtext = true,
}: ConnectionStatusWidgetProps) {
  const { isAutonomous, toggleConnection: rawToggle } = useConnectionMode();
  const { t } = useI18n();
  const [queueCount, setQueueCount] = useState<number>(() => getOutboxCount());

  useEffect(() => {
    const handleOutboxSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ count: number }>;
      if (customEvent.detail && typeof customEvent.detail.count === 'number') {
        setQueueCount(customEvent.detail.count);
      } else {
        setQueueCount(getOutboxCount());
      }
    };

    window.addEventListener(OUTBOX_SYNC_EVENT, handleOutboxSync);
    return () => {
      window.removeEventListener(OUTBOX_SYNC_EVENT, handleOutboxSync);
    };
  }, []);

  const toggleConnection = useCallback(() => {
    const next = rawToggle();

    if (next) {
      toast.info(t('cockpit.connection.toastLost'));
    } else {
      const pendingCount = getOutboxCount();
      if (pendingCount === 0) {
        toast.success(t('cockpit.connection.toastRestored'));
      } else {
        flush(supabase).then((res) => {
          if (res.flushed > 0) {
            toast.success(
              res.flushed === 1
                ? t('cockpit.connection.toastFlushed_one', { count: res.flushed })
                : t('cockpit.connection.toastFlushed_other', { count: res.flushed })
            );
          } else {
            toast.success(t('cockpit.connection.toastRestored'));
          }
        }).catch((err) => {
          console.error('Erro ao sincronizar outbox:', err);
          toast.success(t('cockpit.connection.toastRestored'));
        });
      }
    }
  }, [rawToggle, t]);

  const queueText =
    queueCount === 1
      ? t('cockpit.connection.queue_one', { count: queueCount })
      : t('cockpit.connection.queue_other', { count: queueCount });

  const subtextContent = isAutonomous
    ? t('cockpit.connection.autonomousSubtext')
    : t('cockpit.connection.onlineSubtext');

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={`flex items-center gap-2 sm:gap-3 ${className}`}
        data-testid="mars-connection-widget"
      >
        <div className="flex flex-col items-end text-right min-w-0">
          {/* Badge de Status e Chip de Fila */}
          {isAutonomous ? (
            <div className="flex items-center gap-1.5 justify-end flex-wrap">
              <Badge
                variant="outline"
                data-testid="connection-status-badge"
                aria-live="polite"
                className="border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-sky-500/15 text-amber-700 dark:text-amber-300 font-mono text-[11px] sm:text-xs font-semibold px-2 py-0.5 gap-1.5 shadow-sm transition-all"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span className="truncate max-w-[140px] sm:max-w-none">
                  {t('cockpit.connection.autonomousBadge')}
                </span>
              </Badge>
              <Badge
                variant="outline"
                data-testid="offline-outbox-chip"
                className="font-mono text-[10px] px-1.5 py-0.5 border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/15 shrink-0"
              >
                {queueText}
              </Badge>
            </div>
          ) : (
            <Badge
              variant="outline"
              data-testid="connection-status-badge"
              aria-live="polite"
              className="border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] sm:text-xs font-semibold px-2 py-0.5 gap-1.5 shadow-sm transition-all"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="truncate max-w-[140px] sm:max-w-none">
                {t('cockpit.connection.onlineBadge')}
              </span>
            </Badge>
          )}

          {/* Subtexto Informativo legível no mobile */}
          {showSubtext && (
            <span
              data-testid="connection-status-subtext"
              className={`text-[10px] block max-w-[160px] sm:max-w-[360px] truncate leading-tight mt-0.5 transition-colors ${
                isAutonomous
                  ? 'text-amber-700/90 dark:text-amber-400/90 font-medium'
                  : 'text-muted-foreground'
              }`}
              title={subtextContent}
            >
              {subtextContent}
            </span>
          )}
        </div>

        {/* Botão de Alternância (Toggle) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleConnection}
              data-testid="connection-status-toggle"
              aria-label={
                isAutonomous
                  ? t('cockpit.connection.ariaReconnect')
                  : t('cockpit.connection.ariaSimulate')
              }
              className={`min-h-[44px] min-w-[44px] h-11 px-2.5 sm:px-3 gap-1.5 border transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isAutonomous
                  ? 'border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  : 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isAutonomous ? (
                <>
                  <SatelliteDish className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                  <span className="text-[11px] font-mono font-medium hidden sm:inline">
                    {t('cockpit.connection.reconnectBtn')}
                  </span>
                </>
              ) : (
                <>
                  <Satellite className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] font-mono font-medium hidden sm:inline">
                    {t('cockpit.connection.simulateDropBtn')}
                  </span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end" className="text-xs">
            {isAutonomous ? (
              <p>{t('cockpit.connection.tooltipReconnect')}</p>
            ) : (
              <p>{t('cockpit.connection.tooltipSimulate')}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
