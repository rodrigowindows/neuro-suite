import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Video, MessageSquare, Users, Calendar, ExternalLink,
  CheckCircle2, XCircle, Clock, Loader2, RefreshCw
} from 'lucide-react';

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

interface PlatformCardsProps {
  integrations: Record<string, IntegrationStatus>;
  loadingPlatform: string | null;
  onConnect: (platform: string) => void;
  onSync: (platform: string) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'online': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'away': return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'busy': return <XCircle className="h-4 w-4 text-red-500" />;
    default: return <XCircle className="h-4 w-4 text-muted-foreground" />;
  }
};

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'meet': return <Video className="h-5 w-5 text-green-600" />;
    case 'zoom': return <Video className="h-5 w-5 text-blue-500" />;
    case 'slack': return <MessageSquare className="h-5 w-5" />;
    case 'teams': return <Users className="h-5 w-5" />;
    default: return null;
  }
};

const getPlatformDisplayName = (platform: string) => {
  switch (platform) {
    case 'meet': return 'Google Meet';
    case 'zoom': return 'Zoom';
    case 'slack': return 'Slack';
    case 'teams': return 'Teams';
    default: return platform;
  }
};

export default function PlatformCards({ integrations, loadingPlatform, onConnect, onSync }: PlatformCardsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(integrations).map(([platform, data]) => (
          <Card key={platform} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getPlatformIcon(platform)}
                  {getPlatformDisplayName(platform)}
                </CardTitle>
                {data.connected && getStatusIcon(data.status)}
              </div>
            </CardHeader>
            <CardContent>
              {data.connected ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <div className="flex items-center gap-2">
                      {data.isReal ? (
                        <Badge variant="default" className="text-xs bg-green-600">Real</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Demo</Badge>
                      )}
                      <Badge variant="outline" className="capitalize">{data.status}</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tempo em call</span>
                    <span className="font-medium">{data.meetingTime} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mensagens</span>
                    <span className="font-medium">{data.messagesCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Última sync</span>
                    <span className="text-xs">{data.lastSync}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => platform === 'meet' && data.accessToken ? onSync(platform) : onConnect(platform)}
                    disabled={loadingPlatform === platform}
                  >
                    {loadingPlatform === platform ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    Sincronizar
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    {platform === 'meet' ? 'Conecte com OAuth real' : 'Em breve (demo disponível)'}
                  </p>
                  <Button
                    onClick={() => onConnect(platform)}
                    disabled={loadingPlatform === platform}
                    className="w-full"
                  >
                    {loadingPlatform === platform ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Conectar {getPlatformDisplayName(platform)}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Próximas Reuniões - Google Meet */}
      {integrations.meet.connected && integrations.meet.upcomingMeetings && integrations.meet.upcomingMeetings.length > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximas Reuniões
            </CardTitle>
            <CardDescription>Clique para entrar direto no Google Meet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {integrations.meet.upcomingMeetings.map((meeting) => {
                const startDate = new Date(meeting.start);
                const endDate = new Date(meeting.end);
                const isToday = startDate.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{meeting.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {isToday ? 'Hoje' : startDate.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })} • {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {meeting.attendees > 0 && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Users className="h-3 w-3" /> {meeting.attendees} participantes
                        </p>
                      )}
                    </div>
                    {meeting.meetLink && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => window.open(meeting.meetLink, '_blank')}
                        className="gap-2"
                      >
                        <Video className="h-4 w-4" />
                        Entrar
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
