import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Video, MessageSquare, Users, Clock, AlertTriangle, 
  TrendingUp, Brain, Target, Zap, RefreshCw, Send,
  CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IntegrationStatus {
  connected: boolean;
  status: 'online' | 'away' | 'busy' | 'offline';
  meetingTime: number; // minutes today
  messagesCount: number;
  lastSync: string;
}

interface MeetingCheckIn {
  type: 'pre' | 'post';
  purpose: string;
  objectives: string;
  expectations: string;
  feedback?: string;
}

export default function IntegrationsDashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [checkInType, setCheckInType] = useState<'pre' | 'post'>('pre');
  const [checkInData, setCheckInData] = useState<MeetingCheckIn>({
    type: 'pre',
    purpose: '',
    objectives: '',
    expectations: '',
  });
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock integration data - em produção virá das APIs reais
  const [integrations, setIntegrations] = useState<Record<string, IntegrationStatus>>({
    meet: {
      connected: false,
      status: 'offline',
      meetingTime: 0,
      messagesCount: 0,
      lastSync: '-',
    },
    zoom: {
      connected: false,
      status: 'offline',
      meetingTime: 0,
      messagesCount: 0,
      lastSync: '-',
    },
    slack: {
      connected: false,
      status: 'offline',
      meetingTime: 0,
      messagesCount: 0,
      lastSync: '-',
    },
    teams: {
      connected: false,
      status: 'offline',
      meetingTime: 0,
      messagesCount: 0,
      lastSync: '-',
    },
  });

  // Métricas agregadas
  const totalMeetingTime = Object.values(integrations).reduce((acc, i) => acc + i.meetingTime, 0);
  const totalMessages = Object.values(integrations).reduce((acc, i) => acc + i.messagesCount, 0);
  const connectedCount = Object.values(integrations).filter(i => i.connected).length;

  // Calcular nível de sobrecarga
  const getOverloadLevel = () => {
    if (totalMeetingTime > 360) return { level: 'crítico', color: 'destructive', percent: 100 };
    if (totalMeetingTime > 240) return { level: 'alto', color: 'warning', percent: 80 };
    if (totalMeetingTime > 120) return { level: 'moderado', color: 'secondary', percent: 50 };
    return { level: 'saudável', color: 'default', percent: 30 };
  };

  const overload = getOverloadLevel();

  // Simular conexão com integração
  const connectIntegration = async (platform: string) => {
    setIsLoading(true);
    
    // Em produção: OAuth flow para cada plataforma
    toast({
      title: `Conectando ${platform}...`,
      description: 'Redirecionando para autorização OAuth',
    });

    // Simular conexão bem-sucedida para demo
    setTimeout(() => {
      setIntegrations(prev => ({
        ...prev,
        [platform]: {
          connected: true,
          status: 'online',
          meetingTime: Math.floor(Math.random() * 180) + 30,
          messagesCount: Math.floor(Math.random() * 50) + 10,
          lastSync: new Date().toLocaleTimeString('pt-BR'),
        },
      }));
      setIsLoading(false);
      toast({
        title: `${platform} conectado!`,
        description: 'Dados sincronizados com sucesso.',
      });
    }, 1500);
  };

  // Check-in IA pré/pós reunião
  const generateAICheckIn = async () => {
    if (!checkInData.purpose && checkInType === 'pre') {
      toast({
        title: 'Campo obrigatório',
        description: 'Informe o propósito da reunião',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setAiResponse('');

    try {
      const prompt = checkInType === 'pre' 
        ? `Você é um coach de alta performance com PNL. O usuário vai entrar em uma reunião com:
Propósito: ${checkInData.purpose}
Objetivos: ${checkInData.objectives}
Expectativas: ${checkInData.expectations}

Faça 3 perguntas poderosas (PNL) para alinhar mindset antes da reunião. Seja conciso e motivador.`
        : `Você é um coach de alta performance com PNL. O usuário acabou uma reunião:
Propósito original: ${checkInData.purpose}
Feedback: ${checkInData.feedback || 'Não informado'}

Dê um feedback construtivo baseado em PNL: o que foi bem, o que melhorar, e uma ancoragem positiva. Máximo 3 parágrafos.`;

      const { data, error } = await supabase.functions.invoke('neuro-coach', {
        body: {
          messages: [{ role: 'user', content: prompt }],
          stressLevel: overload.level,
          context: `Integrations: ${connectedCount} conectadas. Tempo em reunião hoje: ${totalMeetingTime}min.`,
          userName: '',
          communicationTone: 'casual',
        },
      });

      if (error) throw error;
      setAiResponse(data.response);
    } catch (error: any) {
      console.error('Erro IA:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar feedback. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header com métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Tempo em Calls</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalMeetingTime} min</p>
            <p className="text-xs text-muted-foreground">hoje</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-secondary" />
              <span className="text-sm text-muted-foreground">Mensagens</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalMessages}</p>
            <p className="text-xs text-muted-foreground">enviadas hoje</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              <span className="text-sm text-muted-foreground">Integrações</span>
            </div>
            <p className="text-2xl font-bold mt-1">{connectedCount}/4</p>
            <p className="text-xs text-muted-foreground">conectadas</p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${overload.level === 'crítico' ? 'from-destructive/20 to-destructive/10' : overload.level === 'alto' ? 'from-yellow-500/20 to-yellow-500/10' : 'from-green-500/20 to-green-500/10'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${overload.level === 'crítico' ? 'text-destructive' : overload.level === 'alto' ? 'text-yellow-500' : 'text-green-500'}`} />
              <span className="text-sm text-muted-foreground">Sobrecarga</span>
            </div>
            <p className="text-2xl font-bold mt-1 capitalize">{overload.level}</p>
            <Progress value={overload.percent} className="h-1 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Integrações</TabsTrigger>
          <TabsTrigger value="checkin">Check-in IA</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
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
                        <Badge variant="outline" className="capitalize">{data.status}</Badge>
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
                        onClick={() => connectIntegration(platform)}
                        disabled={isLoading}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Sincronizar
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Conecte para monitorar produtividade
                      </p>
                      <Button 
                        onClick={() => connectIntegration(platform)}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
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
        </TabsContent>

        <TabsContent value="checkin" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Check-in de Reunião com IA
              </CardTitle>
              <CardDescription>
                Feedback baseado em PNL antes e depois das reuniões
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={checkInType === 'pre' ? 'default' : 'outline'}
                  onClick={() => {
                    setCheckInType('pre');
                    setAiResponse('');
                  }}
                  className="flex-1"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Pré-Reunião
                </Button>
                <Button
                  variant={checkInType === 'post' ? 'default' : 'outline'}
                  onClick={() => {
                    setCheckInType('post');
                    setAiResponse('');
                  }}
                  className="flex-1"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Pós-Reunião
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Propósito da reunião</label>
                  <Textarea
                    placeholder="Ex: Alinhamento de projeto, feedback trimestral..."
                    value={checkInData.purpose}
                    onChange={(e) => setCheckInData(prev => ({ ...prev, purpose: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                {checkInType === 'pre' ? (
                  <>
                    <div>
                      <label className="text-sm font-medium">Seus objetivos</label>
                      <Textarea
                        placeholder="O que você quer alcançar nessa reunião?"
                        value={checkInData.objectives}
                        onChange={(e) => setCheckInData(prev => ({ ...prev, objectives: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Expectativas</label>
                      <Textarea
                        placeholder="Qual resultado ideal?"
                        value={checkInData.expectations}
                        onChange={(e) => setCheckInData(prev => ({ ...prev, expectations: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-sm font-medium">Como foi a reunião?</label>
                    <Textarea
                      placeholder="Descreva brevemente o que aconteceu, sentimentos, resultados..."
                      value={checkInData.feedback || ''}
                      onChange={(e) => setCheckInData(prev => ({ ...prev, feedback: e.target.value }))}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                )}

                <Button 
                  onClick={generateAICheckIn} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Gerando feedback...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {checkInType === 'pre' ? 'Preparar Mindset' : 'Obter Feedback'}
                    </>
                  )}
                </Button>

                {aiResponse && (
                  <div className="p-4 bg-muted/50 rounded-lg border mt-4">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      NeuroCoach diz:
                    </h4>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{aiResponse}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Insights de Produtividade
              </CardTitle>
              <CardDescription>
                Análise baseada nos dados das integrações
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectedCount === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Conecte pelo menos uma integração para ver insights
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab('overview')}>
                    Conectar Integrações
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Alertas preventivos */}
                  {totalMeetingTime > 240 && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">
                            Alerta: Excesso de reuniões
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Você já está em {totalMeetingTime} minutos de calls hoje. 
                            Considere bloquear tempo para trabalho focado.
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
                            Alto volume de comunicação
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {totalMessages} mensagens hoje. Considere agrupar respostas 
                            em horários específicos para maior produtividade.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Métricas positivas */}
                  {totalMeetingTime < 120 && connectedCount > 0 && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-green-700 dark:text-green-400">
                            Bom equilíbrio hoje!
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Tempo em reuniões saudável. Continue assim para manter 
                            produtividade e bem-estar.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resumo de indicadores */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Tempo focado estimado</p>
                      <p className="text-xl font-bold">{Math.max(0, 480 - totalMeetingTime)} min</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Interrupções estimadas</p>
                      <p className="text-xl font-bold">{Math.floor(totalMessages / 5)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
