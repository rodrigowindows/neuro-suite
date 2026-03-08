import { useEffect, useRef } from 'react';
import { useStressData } from '@/hooks/useStressData';
import { toast } from 'sonner';

interface UseStressNotificationsOptions {
  consecutiveDaysThreshold?: number;
  enabled?: boolean;
}

export function useStressNotifications(options: UseStressNotificationsOptions = {}) {
  const { consecutiveDaysThreshold = 3, enabled = true } = options;
  const { consecutiveHighDays, stats, loading } = useStressData({ days: 14, filterByUser: true });
  const notifiedRef = useRef(false);

  const isCritical = consecutiveHighDays >= consecutiveDaysThreshold;

  useEffect(() => {
    if (!enabled || loading || notifiedRef.current) return;
    if (!isCritical) return;

    notifiedRef.current = true;

    // In-app toast
    toast.warning(
      `⚠️ Estresse crítico detectado: ${consecutiveHighDays} dias consecutivos com estresse alto. Considere fazer uma pausa ou falar com seu gestor.`,
      { duration: 10000 },
    );

    // Browser notification (if permitted)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('NeuroSuite — Alerta de Estresse', {
        body: `Você está com estresse alto há ${consecutiveHighDays} dias consecutivos. Cuide-se!`,
        icon: '/favicon.ico',
      });
    } else if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isCritical, consecutiveHighDays, loading, enabled]);

  return {
    isCritical,
    consecutiveHighDays,
    avgHRV: stats.avgHRV,
    highPercent: stats.highPercent,
    loading,
  };
}
