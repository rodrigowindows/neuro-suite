import { AlertTriangle, X, HeartPulse } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';

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
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const isSevere = consecutiveHighDays >= 5;

  const consecutiveDaysText =
    consecutiveHighDays === 1
      ? t('cockpit.stressBanner.consecutiveDays_one', { count: consecutiveHighDays })
      : t('cockpit.stressBanner.consecutiveDays_other', { count: consecutiveHighDays });

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
              {isSevere
                ? t('cockpit.stressBanner.severeTitle')
                : t('cockpit.stressBanner.prolongedTitle')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('cockpit.stressBanner.lead')}
              <span className="font-bold">{consecutiveDaysText}</span>.
              {highPercent > 0 &&
                t('cockpit.stressBanner.scansPercent', { percent: highPercent })}
              {avgHRV > 0 && avgHRV < 35 && (
                <span className="flex items-center gap-1 mt-1">
                  <HeartPulse className="h-3 w-3" />{' '}
                  {t('cockpit.stressBanner.hrvWarning', { hrv: avgHRV })}
                </span>
              )}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-block text-[10px] px-2 py-1 rounded-full bg-background/50 border border-border">
                {t('cockpit.stressBanner.chipBreak')}
              </span>
              <span className="inline-block text-[10px] px-2 py-1 rounded-full bg-background/50 border border-border">
                {t('cockpit.stressBanner.chipMeditation')}
              </span>
              <span className="inline-block text-[10px] px-2 py-1 rounded-full bg-background/50 border border-border">
                {t('cockpit.stressBanner.chipCoach')}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={handleDismiss}
            aria-label={t('cockpit.stressBanner.dismiss')}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
