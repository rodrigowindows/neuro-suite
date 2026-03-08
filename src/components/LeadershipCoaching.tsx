import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Lock, Sparkles, Target, Users, RefreshCw, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: typeof Brain;
  sessions: string[];
  isPremium: boolean;
}

const modules: Module[] = [
  {
    id: 'auto-gerenciamento',
    title: 'Auto Gerenciamento',
    description: 'Técnicas de autorregulação emocional e cognitiva para alta performance individual.',
    icon: Target,
    isPremium: true,
    sessions: [
      'Mapeamento de gatilhos de estresse pessoais',
      'Técnica de reframe cognitivo (PNL)',
      'Protocolo de respiração 4-7-8 avançado',
      'Ancoragem de estados de alta performance',
      'Rotina matinal de neuroproteção',
    ],
  },
  {
    id: 'gestao-conflitos',
    title: 'Gestão de Conflitos',
    description: 'Neurociência aplicada à resolução de conflitos interpessoais no ambiente corporativo.',
    icon: Users,
    isPremium: true,
    sessions: [
      'Neurociência da empatia e espelhamento',
      'Comunicação não-violenta (CNV) com PNL',
      'Desescalada de conflitos em tempo real',
      'Feedback construtivo baseado em dados',
      'Mediação com técnicas de rapport',
    ],
  },
  {
    id: 'lideranca',
    title: 'Liderança Neurocientífica',
    description: 'Desenvolvimento de competências de liderança com base em neurociência e psicologia positiva.',
    icon: Sparkles,
    isPremium: true,
    sessions: [
      'Neuroliderança: como o cérebro decide',
      'Segurança psicológica na equipe',
      'Delegação inteligente e autonomia',
      'Gestão de energia (não de tempo)',
      'Presença executiva e influência',
    ],
  },
  {
    id: 'mudanca-carreira',
    title: 'Mudança de Carreira',
    description: 'Coaching de transição profissional com ferramentas de autoconhecimento e planejamento.',
    icon: RefreshCw,
    isPremium: true,
    sessions: [
      'Inventário de valores e propósito',
      'Análise SWOT pessoal com neurociência',
      'Superando medo de mudança (amígdala)',
      'Networking estratégico e marca pessoal',
      'Plano de transição 90 dias',
    ],
  },
];

interface LeadershipCoachingProps {
  stressLevel?: string;
}

export default function LeadershipCoaching({ stressLevel }: LeadershipCoachingProps) {
  const [selectedModule, setSelectedModule] = useState<string>(modules[0].id);
  const [activeSession, setActiveSession] = useState<number | null>(null);

  const currentModule = modules.find(m => m.id === selectedModule)!;

  return (
    <div className="space-y-6">
      {/* Module selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {modules.map((m) => (
          <button
            key={m.id}
            onClick={() => { setSelectedModule(m.id); setActiveSession(null); }}
            className={`p-3 rounded-lg border text-left transition-all ${
              selectedModule === m.id
                ? 'border-primary bg-primary/5 shadow-elegant'
                : 'border-border hover:border-primary/30 hover:bg-muted/50'
            }`}
          >
            <m.icon className={`h-5 w-5 mb-2 ${selectedModule === m.id ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-xs font-semibold leading-tight">{m.title}</p>
            {m.isPremium && (
              <Badge variant="outline" className="mt-1.5 text-[9px] gap-0.5">
                <Lock className="h-2.5 w-2.5" /> Pro
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Module content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <currentModule.icon className="h-5 w-5 text-primary" />
                {currentModule.title}
              </CardTitle>
              <CardDescription className="mt-1">{currentModule.description}</CardDescription>
            </div>
            <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
              {currentModule.sessions.length} sessões
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentModule.sessions.map((session, i) => (
              <button
                key={i}
                onClick={() => setActiveSession(activeSession === i ? null : i)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  activeSession === i
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/20 hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    activeSession === i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="text-sm font-medium">{session}</span>
                  {currentModule.isPremium && (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground ml-auto flex-shrink-0" />
                  )}
                </div>
                {activeSession === i && (
                  <div className="mt-3 ml-9 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Esta sessão usa IA para guiar você por exercícios práticos de {currentModule.title.toLowerCase()}, 
                      adaptados ao seu nível de estresse atual{stressLevel ? ` (${stressLevel})` : ''}.
                    </p>
                    <Button size="sm" className="gap-1.5" disabled={currentModule.isPremium}>
                      <MessageCircle className="h-3.5 w-3.5" />
                      {currentModule.isPremium ? 'Disponível no Plano Pro' : 'Iniciar Sessão'}
                    </Button>
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upsell */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="pt-6 text-center space-y-3">
          <Sparkles className="h-8 w-8 text-primary mx-auto" />
          <h3 className="font-display font-bold text-lg">Desbloqueie Coaching de Liderança</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            4 módulos premium com 20 sessões de coaching IA personalizado. 
            Auto Gerenciamento, Conflitos, Liderança e Carreira.
          </p>
          <Button className="gap-2">
            <Lock className="h-4 w-4" />
            Upgrade Pro — R$29/mês
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
