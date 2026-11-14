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
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'mars_mission_connection_mode';
const SYNC_EVENT = 'mars-connection-sync';

export interface ConnectionStatusWidgetProps {
  className?: string;
  showSubtext?: boolean;
}

export default function ConnectionStatusWidget({
  className = '',
  showSubtext = true,
}: ConnectionStatusWidgetProps) {
  const { toast: uiToast } = useToast();
  const [isAutonomous, setIsAutonomous] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) === 'autonomous';
    }
    return false;
  });

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ isAutonomous: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.isAutonomous === 'boolean') {
        setIsAutonomous(customEvent.detail.isAutonomous);
      }
    };

    window.addEventListener(SYNC_EVENT, handleSync);
    return () => {
      window.removeEventListener(SYNC_EVENT, handleSync);
    };
  }, []);

  const toggleConnection = useCallback(() => {
    setIsAutonomous((prev) => {
      const nextState = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, nextState ? 'autonomous' : 'online');
        window.dispatchEvent(
          new CustomEvent(SYNC_EVENT, { detail: { isAutonomous: nextState } })
        );
      }

      if (nextState) {
        // Estado 2: Simulação de Queda / Espaço Profundo
        const msg =
          'Comunicação com a Terra interrompida. Sistema alternou para processamento autônomo local.';
        try {
          toast.info(msg);
        } catch {
          // fallback
        }
        try {
          uiToast({ description: msg });
        } catch {
          // fallback
        }
      } else {
        // Estado 1: Online restabelecido
        const msg = 'Uplink com a Terra restabelecido. Sincronização em nuvem operacional.';
        try {
          toast.success(msg);
        } catch {
          // fallback
        }
        try {
          uiToast({ description: msg });
        } catch {
          // fallback
        }
      }

      return nextState;
    });
  }, [uiToast]);

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={`flex items-center gap-2 sm:gap-3 ${className}`}
        data-testid="mars-connection-widget"
      >
        <div className="flex flex-col items-end text-right min-w-0">
          {/* Badge de Status */}
          {isAutonomous ? (
            <Badge
              variant="outline"
              data-testid="connection-status-badge"
              className="border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-sky-500/15 text-amber-500 dark:text-amber-300 font-mono text-[11px] sm:text-xs font-semibold px-2 py-0.5 gap-1.5 shadow-sm transition-all"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="truncate">Modo Autônomo Ativado (Edge Computing)</span>
            </Badge>
          ) : (
            <Badge
              variant="outline"
              data-testid="connection-status-badge"
              className="border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] sm:text-xs font-semibold px-2 py-0.5 gap-1.5 shadow-sm transition-all"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="truncate">Uplink da Terra: Ativo (Latência: 1.2s)</span>
            </Badge>
          )}

          {/* Subtexto Informativo */}
          {showSubtext && (
            <span
              data-testid="connection-status-subtext"
              className={`text-[10px] hidden md:block max-w-[360px] truncate leading-tight mt-0.5 transition-colors ${
                isAutonomous
                  ? 'text-amber-600/90 dark:text-amber-400/90 font-medium'
                  : 'text-muted-foreground'
              }`}
              title={
                isAutonomous
                  ? 'Processamento 100% Local na Nave · Zero-Trust Fallback (Latência Terra: 20 min).'
                  : 'Sincronização em nuvem operacional.'
              }
            >
              {isAutonomous
                ? 'Processamento 100% Local na Nave · Zero-Trust Fallback (Latência Terra: 20 min).'
                : 'Sincronização em nuvem operacional.'}
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
                  ? 'Reconectar uplink com a Terra'
                  : 'Simular interrupção de comunicação (Modo Autônomo)'
              }
              className={`h-8 px-2 sm:px-2.5 gap-1.5 border transition-all shrink-0 ${
                isAutonomous
                  ? 'border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 dark:text-amber-300'
                  : 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isAutonomous ? (
                <>
                  <SatelliteDish className="h-3.5 w-3.5 animate-pulse text-amber-500 dark:text-amber-300" />
                  <span className="text-[11px] font-mono font-medium hidden sm:inline">
                    Simulação Ativa
                  </span>
                </>
              ) : (
                <>
                  <Satellite className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] font-mono font-medium hidden sm:inline">
                    Simular Queda
                  </span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end" className="text-xs">
            {isAutonomous ? (
              <p>Clique para reconectar Uplink com a Terra</p>
            ) : (
              <p>Clique para simular queda de comunicação (Modo Autônomo / Edge)</p>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
