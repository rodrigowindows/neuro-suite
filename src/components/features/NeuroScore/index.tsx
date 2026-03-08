import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Scan, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { calculateStressLevel, getStressDisplay, getStressLabel } from '@/services/stressCalculator';
import type { StressResult } from '@/services/stressCalculator';
import WebcamCapture from '@/components/WebcamCapture';
import StressTrendChart from '@/components/StressTrendChart';
import ScanResult from './ScanResult';
import ScanProgress from './ScanProgress';

interface NeuroScoreProps {
  onScoreComplete: (stressLevel: string, hrvValue?: number) => void;
}

export default function NeuroScore({ onScoreComplete }: NeuroScoreProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastHrvValue, setLastHrvValue] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<StressResult | null>(null);
  const { profile } = useUserProfile();
  const { toast } = useToast();

  // Load last scan on mount
  useEffect(() => {
    const loadLastScan = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('stress_scans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          const { emoji, message } = getStressDisplay(data.stress_level);
          setResult({
            blinkRate: data.blink_rate,
            stressLevel: data.stress_level as StressResult['stressLevel'],
            hrvValue: data.hrv_value ?? undefined,
            message,
            emoji,
          });
          if (data.hrv_value) setLastHrvValue(data.hrv_value);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadLastScan();
  }, []);

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
    const stressResult = calculateStressLevel(blinkRate, hrvValue);
    setResult(stressResult);
    setLastHrvValue(hrvValue);

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('stress_scans').insert({
          user_id: user.id,
          blink_rate: blinkRate,
          stress_level: stressResult.stressLevel,
          hrv_value: hrvValue || null,
        });
      }
    } catch (error) {
      console.error('Erro ao salvar scan:', error);
    }

    onScoreComplete(stressResult.stressLevel, hrvValue);

    toast({
      title: 'Scan completo! 🎯',
      description: `Nível de estresse: ${getStressLabel(stressResult.stressLevel)}${hrvValue ? ` • HRV: ${hrvValue}ms` : ''}`,
    });
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
            NeuroScore — Detecção de Estresse
          </CardTitle>
          <CardDescription>
            Análise de taxa de piscadas + HRV via webcam para estimar estresse (baseado em neurociência)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <WebcamCapture
            onBlinkDetected={handleBlinkDetected}
            isScanning={isScanning}
            onScanComplete={handleScanComplete}
          />

          {isScanning && <ScanProgress progress={progress} />}

          {!isScanning && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={startScan} className="w-full h-12 sm:h-auto text-sm sm:text-base" size="lg">
                    <Scan className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    {result ? 'Realizar novo scan' : 'Iniciar Scan (60s)'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Posicione seu rosto na webcam e fique natural por 60 segundos.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {result && (
            <ScanResult
              result={result}
              userName={profile?.displayName || ''}
              lastHrvValue={lastHrvValue}
            />
          )}
        </CardContent>
      </Card>

      <StressTrendChart />
    </div>
  );
}
