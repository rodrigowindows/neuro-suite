import { useState, useEffect, useCallback, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/i18n';
import IntegrationMetrics from './integrations/IntegrationMetrics';
import PlatformCards from './integrations/PlatformCards';
import MeetingCheckIn from './integrations/MeetingCheckIn';
import ProductivityInsights from './integrations/ProductivityInsights';

interface UpcomingMeeting {
  id: string;
  title: string;
  start: string;
  end: string;
  meetLink?: string;
  attendees: number;
}

interface IntegrationStatus {
  connected: boolean;
  status: 'online' | 'away' | 'busy' | 'offline';
  meetingTime: number;
  messagesCount: number;
  lastSync: string;
  accessToken?: string;
  upcomingMeetings?: UpcomingMeeting[];
  isReal?: boolean;
}

export default function IntegrationsDashboard() {
  const { toast } = useToast();
  const { t, lang } = useI18n();
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const pendingOAuthStateRef = useRef<string | null>(null);

  const [integrations, setIntegrations] = useState<Record<string, IntegrationStatus>>({
    meet: { connected: false, status: 'offline', meetingTime: 0, messagesCount: 0, lastSync: '-', isReal: false },
    zoom: { connected: false, status: 'offline', meetingTime: 0, messagesCount: 0, lastSync: '-', isReal: false },
    slack: { connected: false, status: 'offline', meetingTime: 0, messagesCount: 0, lastSync: '-', isReal: false },
    teams: { connected: false, status: 'offline', meetingTime: 0, messagesCount: 0, lastSync: '-', isReal: false },
  });

  const totalMeetingTime = Object.values(integrations).reduce((acc, i) => acc + i.meetingTime, 0);
  const totalMessages = Object.values(integrations).reduce((acc, i) => acc + i.messagesCount, 0);
  const connectedCount = Object.values(integrations).filter(i => i.connected).length;

  const getOverloadLevel = () => {
    if (totalMeetingTime > 360) return { level: 'crítico', percent: 100 };
    if (totalMeetingTime > 240) return { level: 'alto', percent: 80 };
    if (totalMeetingTime > 120) return { level: 'moderado', percent: 50 };
    return { level: 'saudável', percent: 30 };
  };
  const overload = getOverloadLevel();

  const fetchGoogleCalendarData = useCallback(async (accessToken: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar?action=events`,
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
    );
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return result;
  }, []);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const allowedOrigin = new URL(import.meta.env.VITE_SUPABASE_URL).origin;
      if (event.origin !== allowedOrigin) return;

      const expectedState = pendingOAuthStateRef.current;
      if (!expectedState || event.data?.state !== expectedState) return;
      pendingOAuthStateRef.current = null;

      if (event.data?.success && event.data?.access_token) {
        setLoadingPlatform('meet');
        try {
          const calendarData = await fetchGoogleCalendarData(event.data.access_token);
          setIntegrations(prev => ({
            ...prev,
            meet: {
              connected: true, status: 'online',
              meetingTime: calendarData.totalMinutes || 0,
              messagesCount: calendarData.totalMeetings || 0,
              lastSync: new Date().toLocaleTimeString(lang === 'pt' ? 'pt-BR' : 'en-US'),
              accessToken: event.data.access_token,
              upcomingMeetings: calendarData.upcomingMeetings || [],
              isReal: true,
            },
          }));
          toast({
            title: t('integrations.toast.meetConnected'),
            description: t('integrations.toast.meetingsFound', { count: calendarData.totalMeetings }),
          });
        } catch (error: any) {
          toast({
            title: t('integrations.toast.fetchError'),
            description: error.message,
            variant: 'destructive',
          });
        } finally {
          setLoadingPlatform(null);
        }
      } else if (event.data?.error) {
        toast({
          title: t('integrations.toast.authError'),
          description: event.data.error,
          variant: 'destructive',
        });
        setLoadingPlatform(null);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [fetchGoogleCalendarData, toast, t, lang]);

  const connectGoogleMeet = async () => {
    setLoadingPlatform('meet');
    try {
      const origin = encodeURIComponent(window.location.origin);
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar?action=auth&origin=${origin}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      pendingOAuthStateRef.current = data.state ?? null;
      const width = 500, height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      window.open(data.authUrl, 'Google OAuth', `width=${width},height=${height},left=${left},top=${top}`);
    } catch (error: any) {
      pendingOAuthStateRef.current = null;
      toast({
        title: t('integrations.toast.oauthInitError'),
        description: error.message,
        variant: 'destructive',
      });
      setLoadingPlatform(null);
    }
  };

  const syncGoogleMeet = async () => {
    const accessToken = integrations.meet.accessToken;
    if (!accessToken) return;
    setLoadingPlatform('meet');
    try {
      const calendarData = await fetchGoogleCalendarData(accessToken);
      setIntegrations(prev => ({
        ...prev,
        meet: {
          ...prev.meet,
          meetingTime: calendarData.totalMinutes || 0,
          messagesCount: calendarData.totalMeetings || 0,
          lastSync: new Date().toLocaleTimeString(lang === 'pt' ? 'pt-BR' : 'en-US'),
          upcomingMeetings: calendarData.upcomingMeetings || [],
        },
      }));
      toast({
        title: t('integrations.toast.synced'),
        description: t('integrations.toast.calendarUpdated'),
      });
    } catch {
      toast({
        title: t('integrations.toast.syncError'),
        description: t('integrations.toast.tokenExpired'),
        variant: 'destructive',
      });
      setIntegrations(prev => ({ ...prev, meet: { ...prev.meet, connected: false, accessToken: undefined, isReal: false } }));
    } finally {
      setLoadingPlatform(null);
    }
  };

  const connectMockIntegration = (platform: string) => {
    setLoadingPlatform(platform);
    toast({
      title: t('integrations.toast.connecting'),
      description: t('integrations.toast.demoMode'),
    });
    setTimeout(() => {
      setIntegrations(prev => ({
        ...prev,
        [platform]: {
          connected: true, status: 'online',
          meetingTime: Math.floor(Math.random() * 180) + 30,
          messagesCount: Math.floor(Math.random() * 50) + 10,
          lastSync: new Date().toLocaleTimeString(lang === 'pt' ? 'pt-BR' : 'en-US'),
          isReal: false,
        },
      }));
      setLoadingPlatform(null);
    }, 1500);
  };

  const connectIntegration = (platform: string) => {
    if (platform === 'meet') connectGoogleMeet();
    else connectMockIntegration(platform);
  };

  const handleSync = (platform: string) => {
    if (platform === 'meet') syncGoogleMeet();
  };

  return (
    <div className="space-y-6">
      <IntegrationMetrics
        totalMeetingTime={totalMeetingTime}
        totalMessages={totalMessages}
        connectedCount={connectedCount}
        overload={overload}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{t('integrations.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="checkin">{t('integrations.tabs.checkin')}</TabsTrigger>
          <TabsTrigger value="insights">{t('integrations.tabs.insights')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <PlatformCards
            integrations={integrations}
            loadingPlatform={loadingPlatform}
            onConnect={connectIntegration}
            onSync={handleSync}
          />
        </TabsContent>

        <TabsContent value="checkin" className="mt-4">
          <MeetingCheckIn
            overloadLevel={overload.level}
            connectedCount={connectedCount}
            totalMeetingTime={totalMeetingTime}
          />
        </TabsContent>

        <TabsContent value="insights" className="mt-4">
          <ProductivityInsights
            connectedCount={connectedCount}
            totalMeetingTime={totalMeetingTime}
            totalMessages={totalMessages}
            onGoToOverview={() => setActiveTab('overview')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
