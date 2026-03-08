import { AlertTriangle, X, HeartPulse } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface StressAlertBannerProps {
  consecutiveHighDays: number;
  highPercent: number;
  avgHRV: number;
  onDismiss?: () => void;
}

export default function StressAlertBanner({
  consecutiveHighDays,
  highPercent,
  avgHRV,
  onDismiss,
}: StressAlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const isSevere = consecutiveHighDays >= 5;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className={`rounded-lg border p-3 sm:p-4 ${
          isSevere
            ? 'bg-destructive/10 border-destructive/30'
            : 'bg-orange-500/10 border-orange-500/30'
        }`}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className={`h-5 w-5 shrink-0 mt-0.5 ${
              isSevere ? 'text-destructive' : 'text-orange-500'
            }`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">
              {isSevere ? '🚨 Alerta Crítico de Estresse' : '⚠️ Atenção: Estresse Prolongado'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Você está com estresse alto há{' '}
              <span className="font-bold">{consecutiveHighDays} dias consecutivos</span>.
              {highPercent > 0 && ` (${highPercent}% dos scans em nível alto)`}
              {avgHRV > 0 && avgHRV < 35 && (
                <span className="flex items-center gap-1 mt-1">
                  <HeartPulse className="h-3 w-3" /> HRV médio: {avgHRV}ms — abaixo do ideal
                </span>
              )}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-block text-[10px] px-2 py-1 rounded-full bg-background/50 border border-border">
                💆 Faça uma pausa de 5 min
              </span>
              <span className="inline-block text-[10px] px-2 py-1 rounded-full bg-background/50 border border-border">
                🧘 Tente a Mini Meditação
              </span>
              <span className="inline-block text-[10px] px-2 py-1 rounded-full bg-background/50 border border-border">
                💬 Converse com o NeuroCoach
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleDismiss}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
