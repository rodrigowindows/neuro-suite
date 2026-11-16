import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Lock, Sparkles, Target, Users, RefreshCw, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/i18n';

interface ModuleDef {
  id: string;
  titleKey: string;
  descKey: string;
  icon: typeof Brain;
  sessionKeys: string[];
  isPremium: boolean;
}

const MODULE_DEFS: ModuleDef[] = [
  {
    id: 'auto-gerenciamento',
    titleKey: 'wellness.leadership.mod.auto.title',
    descKey: 'wellness.leadership.mod.auto.desc',
    icon: Target,
    isPremium: true,
    sessionKeys: [
      'wellness.leadership.mod.auto.s1',
      'wellness.leadership.mod.auto.s2',
      'wellness.leadership.mod.auto.s3',
      'wellness.leadership.mod.auto.s4',
      'wellness.leadership.mod.auto.s5',
    ],
  },
  {
    id: 'gestao-conflitos',
    titleKey: 'wellness.leadership.mod.conflict.title',
    descKey: 'wellness.leadership.mod.conflict.desc',
    icon: Users,
    isPremium: true,
    sessionKeys: [
      'wellness.leadership.mod.conflict.s1',
      'wellness.leadership.mod.conflict.s2',
      'wellness.leadership.mod.conflict.s3',
      'wellness.leadership.mod.conflict.s4',
      'wellness.leadership.mod.conflict.s5',
    ],
  },
  {
    id: 'lideranca',
    titleKey: 'wellness.leadership.mod.leadership.title',
    descKey: 'wellness.leadership.mod.leadership.desc',
    icon: Sparkles,
    isPremium: true,
    sessionKeys: [
      'wellness.leadership.mod.leadership.s1',
      'wellness.leadership.mod.leadership.s2',
      'wellness.leadership.mod.leadership.s3',
      'wellness.leadership.mod.leadership.s4',
      'wellness.leadership.mod.leadership.s5',
    ],
  },
  {
    id: 'mudanca-carreira',
    titleKey: 'wellness.leadership.mod.career.title',
    descKey: 'wellness.leadership.mod.career.desc',
    icon: RefreshCw,
    isPremium: true,
    sessionKeys: [
      'wellness.leadership.mod.career.s1',
      'wellness.leadership.mod.career.s2',
      'wellness.leadership.mod.career.s3',
      'wellness.leadership.mod.career.s4',
      'wellness.leadership.mod.career.s5',
    ],
  },
];

interface LeadershipCoachingProps {
  stressLevel?: string;
}

export default function LeadershipCoaching({ stressLevel }: LeadershipCoachingProps) {
  const { t } = useI18n();
  const [selectedModule, setSelectedModule] = useState<string>(MODULE_DEFS[0].id);
  const [activeSession, setActiveSession] = useState<number | null>(null);

  const currentModule = MODULE_DEFS.find((m) => m.id === selectedModule)!;

  return (
    <div className="space-y-6">
      {/* Module selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {MODULE_DEFS.map((m) => (
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
            <p className="text-xs font-semibold leading-tight">{t(m.titleKey)}</p>
            {m.isPremium && (
              <Badge variant="outline" className="mt-1.5 text-[9px] gap-0.5">
                <Lock className="h-2.5 w-2.5" /> {t('wellness.leadership.proBadge')}
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
                {t(currentModule.titleKey)}
              </CardTitle>
              <CardDescription className="mt-1">{t(currentModule.descKey)}</CardDescription>
            </div>
            <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
              {t('wellness.leadership.sessionsCount', { count: currentModule.sessionKeys.length })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentModule.sessionKeys.map((sessionKey, i) => (
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
                  <span className="text-sm font-medium">{t(sessionKey)}</span>
                  {currentModule.isPremium && (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground ml-auto flex-shrink-0" />
                  )}
                </div>
                {activeSession === i && (
                  <div className="mt-3 ml-9 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      {t('wellness.leadership.sessionDesc', {
                        module: t(currentModule.titleKey).toLowerCase(),
                        stressInfo: stressLevel ? ` (${stressLevel})` : '',
                      })}
                    </p>
                    <Button size="sm" className="gap-1.5" disabled={currentModule.isPremium}>
                      <MessageCircle className="h-3.5 w-3.5" />
                      {currentModule.isPremium ? t('wellness.leadership.availableInPro') : t('wellness.leadership.startSession')}
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
          <h3 className="font-display font-bold text-lg">{t('wellness.leadership.upsellTitle')}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t('wellness.leadership.upsellDesc')}
          </p>
          <Button className="gap-2">
            <Lock className="h-4 w-4" />
            {t('wellness.leadership.upsellButton')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
