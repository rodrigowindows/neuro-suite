import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MessageSquare, CheckCircle2, TrendingUp } from 'lucide-react';
import { useI18n } from '@/i18n';

interface ProductivityInsightsProps {
  connectedCount: number;
  totalMeetingTime: number;
  totalMessages: number;
  onGoToOverview: () => void;
}

export default function ProductivityInsights({ connectedCount, totalMeetingTime, totalMessages, onGoToOverview }: ProductivityInsightsProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {t('integrations.insights.title')}
        </CardTitle>
        <CardDescription>{t('integrations.insights.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {connectedCount === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{t('integrations.insights.noIntegrations')}</p>
            <Button variant="outline" onClick={onGoToOverview}>{t('integrations.insights.connectBtn')}</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {totalMeetingTime > 240 && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">
                      {t('integrations.insights.meetingOverloadTitle')}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('integrations.insights.meetingOverloadDesc', { time: totalMeetingTime })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {totalMessages > 40 && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                      {t('integrations.insights.messageVolumeTitle')}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('integrations.insights.messageVolumeDesc', { count: totalMessages })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {totalMeetingTime < 120 && connectedCount > 0 && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400">
                      {t('integrations.insights.goodBalanceTitle')}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('integrations.insights.goodBalanceDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">{t('integrations.insights.focusTimeEstimated')}</p>
                <p className="text-xl font-bold">{Math.max(0, 480 - totalMeetingTime)} {t('integrations.units.min')}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">{t('integrations.insights.interruptionsEstimated')}</p>
                <p className="text-xl font-bold">{Math.floor(totalMessages / 5)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
