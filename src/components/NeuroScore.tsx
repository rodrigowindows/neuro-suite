import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Scan, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useConnectionMode } from '@/hooks/useConnectionMode';
import { useI18n } from '@/i18n';
import { enqueue } from '@/lib/offlineOutbox';
import WebcamCapture from './WebcamCapture';
import PostScanActionPlan from './PostScanActionPlan';
import StressTrendChart from './StressTrendChart';
import { roundBlinkRate } from '@/lib/biometricDisplay';
import {
  calculateStressLevel,
  getStressDisplay,
  getStressLabel,
  getDiagnosticLabel,
  getPnlTip,
} from '@/services/stressCalculator';

interface NeuroScoreProps {
  onScoreComplete: (stressLevel: string, hrvValue?: number) => void;
}

export default function NeuroScore({ onScoreComplete }: NeuroScoreProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastHrvValue, setLastHrvValue] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<{
    blinkRate: number;
    stressLevel: 'low' | 'moderate' | 'high';
    hrvValue?: number;
    message: string;
  } | null>(null);
  const [userName, setUserName] = useState<string>('');
  const { isAutonomous } = useConnectionMode();
  const { toast } = useToast();
  const { t } = useI18n();

  useEffect(() => {
    const loadUserDataAndScan = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('preferred_name, full_name')
            .eq('id', user.id)
            .maybeSingle();

          if (profile) {
            setUserName(profile.preferred_name || profile.full_name || '');
          }

          const { data } = await supabase
            .from('stress_scans')
            .select('blink_rate, stress_level, hrv_value')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (data) {
            const { message } = getStressDisplay(data.stress_level, t);
            setResult({
              blinkRate: data.blink_rate,
              stressLevel: data.stress_level as 'low' | 'moderate' | 'high',
              hrvValue: data.hrv_value ?? undefined,
              message,
            });
            if (data.hrv_value) setLastHrvValue(data.hrv_value);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadUserDataAndScan();
  }, [t]);

  const startScan = () => {
    setIsScanning(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / 60);
      });
    }, 1000);
  };

  const handleBlinkDetected = async (blinkRate: number, hrvValue?: number) => {
    const stressResult = calculateStressLevel(blinkRate, hrvValue, t);

    setResult({
      blinkRate: stressResult.blinkRate,
      stressLevel: stressResult.stressLevel,
      hrvValue,
      message: stressResult.message,
    });
    setLastHrvValue(hrvValue);

    // Salvar no banco
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (isAutonomous) {
          enqueue({
            table: 'stress_scans',
            op: 'insert',
            payload: {
              user_id: user.id,
              blink_rate: blinkRate,
              stress_level: stressResult.stressLevel,
              hrv_value: hrvValue || null,
              created_at: new Date().toISOString(),
            },
          });
        } else {
          await supabase.from('stress_scans').insert({
            user_id: user.id,
            blink_rate: blinkRate,
            stress_level: stressResult.stressLevel,
            hrv_value: hrvValue || null,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao salvar scan:', error);
    }

    onScoreComplete(stressResult.stressLevel, hrvValue);

    const hrvSuffix = hrvValue ? t('bioscore.toast.hrvSuffix', { hrv: hrvValue }) : '';
    const description = t('bioscore.toast.desc', {
      level: getStressLabel(stressResult.stressLevel, t),
      hrv: hrvSuffix,
    });

    if (isAutonomous) {
      toast({
        title: t('bioscore.toast.offlineTitle'),
        description,
      });
    } else {
      toast({
        title: t('bioscore.toast.onlineTitle'),
        description,
      });
    }
  };

  const handleScanComplete = () => {
    setIsScanning(false);
    setProgress(100);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {t('bioscore.title')}
          </CardTitle>
          <CardDescription>
            {t('bioscore.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <WebcamCapture
            onBlinkDetected={handleBlinkDetected}
            isScanning={isScanning}
            onScanComplete={handleScanComplete}
          />

          {isScanning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('bioscore.scan.progress')}</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {!isScanning && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={startScan} className="w-full h-12 sm:h-auto text-sm sm:text-base" size="lg">
                    <Scan className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    {result ? t('bioscore.btn.newScan') : t('bioscore.btn.startScan')}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('bioscore.tooltip.position')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {result && (
            <div className="p-6 bg-gradient-card rounded-lg space-y-4 border border-primary/20">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="rounded-full bg-background/60 p-4 border border-border shadow-sm">
                    {result.stressLevel === 'high' ? (
                      <AlertTriangle className="h-10 w-10 text-rose-500" />
                    ) : result.stressLevel === 'moderate' ? (
                      <Activity className="h-10 w-10 text-amber-500" />
                    ) : (
                      <CheckCircle className="h-10 w-10 text-emerald-500" />
                    )}
                  </div>
                </div>
                <div className="flex justify-center">
                  <Badge
                    variant={
                      result.stressLevel === 'high'
                        ? 'destructive'
                        : result.stressLevel === 'moderate'
                        ? 'secondary'
                        : 'default'
                    }
                    className="text-xs uppercase tracking-wider"
                  >
                    {result.stressLevel === 'high'
                      ? t('bioscore.badge.alert')
                      : result.stressLevel === 'moderate'
                      ? t('bioscore.badge.caution')
                      : t('bioscore.badge.stable')}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold">
                  {userName && <span>{userName}, </span>}
                  {t('bioscore.result.levelHeading', { level: getStressLabel(result.stressLevel, t) })}
                </h3>
                <p className="text-muted-foreground">{result.message}</p>
              </div>

              <div className={`grid ${result.hrvValue ? 'grid-cols-3' : 'grid-cols-2'} gap-4 pt-4 border-t`}>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('bioscore.metric.blinkRate')}</p>
                  <p className="text-2xl font-bold text-primary">
                    {t('bioscore.metric.blinkRateValue', { rate: roundBlinkRate(result.blinkRate) })}
                  </p>
                </div>
                {result.hrvValue && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{t('bioscore.metric.hrv')}</p>
                    <p className="text-2xl font-bold text-accent">
                      {result.hrvValue}
                      <span className="text-sm">{t('bioscore.metric.hrvUnit')}</span>
                    </p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('bioscore.metric.diagnostic')}</p>
                  <p className="text-2xl font-bold text-secondary">
                    {getDiagnosticLabel(result.stressLevel, t)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm font-medium mb-2">{t('bioscore.pnl.label')}</p>
                <p className="text-sm text-muted-foreground">{getPnlTip(result.stressLevel, t)}</p>
              </div>

              <PostScanActionPlan
                stressLevel={result.stressLevel}
                blinkRate={result.blinkRate}
                hrvValue={result.hrvValue ?? lastHrvValue}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <StressTrendChart />
    </div>
  );
}
