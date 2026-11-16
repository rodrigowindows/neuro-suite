import { useEffect, useRef } from 'react';
import { useStressData } from '@/hooks/useStressData';
import { toast } from 'sonner';
import { useI18n } from '@/i18n';

interface UseStressNotificationsOptions {
  consecutiveDaysThreshold?: number;
  enabled?: boolean;
}

export function useStressNotifications(options: UseStressNotificationsOptions = {}) {
  const { consecutiveDaysThreshold = 3, enabled = true } = options;
  const { consecutiveHighDays, stats, loading } = useStressData({ days: 14, filterByUser: true });
  const { t } = useI18n();
  const notifiedRef = useRef(false);

  const isCritical = consecutiveHighDays >= consecutiveDaysThreshold;

  useEffect(() => {
    if (!enabled || loading || notifiedRef.current) return;
    if (!isCritical) return;

    notifiedRef.current = true;

    // In-app toast
    toast.warning(
      t('account.stressNotification.toast', { days: consecutiveHighDays }),
      { duration: 10000 },
    );

    // Browser notification (if permitted)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(t('account.stressNotification.notificationTitle'), {
        body: t('account.stressNotification.notificationBody', { days: consecutiveHighDays }),
        icon: '/favicon.ico',
      });
    } else if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isCritical, consecutiveHighDays, loading, enabled, t]);

  return {
    isCritical,
    consecutiveHighDays,
    avgHRV: stats.avgHRV,
    highPercent: stats.highPercent,
    loading,
  };
}
