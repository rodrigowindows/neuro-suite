import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Timer, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/i18n';

interface MiniMeditationProps {
  trigger: boolean; // Ativa quando HRV < 30
}

export default function MiniMeditation({ trigger }: MiniMeditationProps) {
  const { lang, t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutos
  const [ttsSupported, setTtsSupported] = useState(true);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  useEffect(() => {
    if (!synth) setTtsSupported(false);
  }, [synth]);

  const speak = useCallback((text: string) => {
    if (!synth) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'pt' ? 'pt-BR' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    synth.speak(utterance);
  }, [synth, lang]);

  useEffect(() => {
    if (trigger && !isPlaying) {
      speak(t('checkin.meditation.tts.trigger'));
    }
  }, [trigger, isPlaying, speak, t]);

  useEffect(() => {
    if (!isPlaying) return;

    const phaseTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trocar fase
          if (currentPhase === 'inhale') {
            speak(t('checkin.meditation.tts.hold'));
            setCurrentPhase('hold');
            return 4;
          } else if (currentPhase === 'hold') {
            speak(t('checkin.meditation.tts.exhale'));
            setCurrentPhase('exhale');
            return 6;
          } else {
            speak(t('checkin.meditation.tts.inhale'));
            setCurrentPhase('inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    const totalTimer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          speak(t('checkin.meditation.tts.done'));
          return 180;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(phaseTimer);
      clearInterval(totalTimer);
    };
  }, [isPlaying, currentPhase, speak, t]);

  const togglePlay = () => {
    if (!isPlaying) {
      speak(t('checkin.meditation.tts.start'));
      setCurrentPhase('inhale');
      setCountdown(4);
      setTimeRemaining(180);
    } else {
      synth?.cancel();
    }
    setIsPlaying(!isPlaying);
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale': return t('checkin.meditation.action.inhale');
      case 'hold': return t('checkin.meditation.action.hold');
      case 'exhale': return t('checkin.meditation.action.exhale');
    }
  };

  const getPhaseStep = () => {
    switch (currentPhase) {
      case 'inhale': return t('checkin.meditation.step.inhale');
      case 'hold': return t('checkin.meditation.step.hold');
      case 'exhale': return t('checkin.meditation.step.exhale');
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'hold': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'exhale': return 'from-green-500/20 to-teal-500/20 border-green-500/30';
    }
  };

  if (!trigger) return null;

  return (
    <Card className="shadow-soft border-orange-500/30 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
          <Wind className="h-5 w-5" />
          {t('checkin.meditation.title')}
        </CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          {t('checkin.meditation.desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPlaying ? (
          <div className={`p-6 rounded-lg bg-gradient-to-br ${getPhaseColor()} border-2 transition-all duration-1000`}>
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Timer className="h-3.5 w-3.5" />
                <span>{getPhaseStep()}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Wind className="h-5 w-5 text-primary" />
                <p className="text-xl font-bold">{getPhaseText()}</p>
              </div>
              <div className="text-6xl font-bold text-primary animate-pulse">
                {countdown}
              </div>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Timer className="h-3.5 w-3.5" />
                {t('checkin.meditation.time_remaining', {
                  time: `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`,
                })}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3 p-6">
            <p className="text-sm font-medium text-foreground">
              {t('checkin.meditation.technique')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('checkin.meditation.attribution')}
            </p>
          </div>
        )}

        <Button
          onClick={togglePlay}
          className="w-full"
          size="lg"
          variant={isPlaying ? 'secondary' : 'default'}
        >
          {isPlaying ? (
            <>
              <Pause className="mr-2 h-5 w-5" />
              {t('checkin.meditation.pause')}
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5" />
              {t('checkin.meditation.start')}
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          {ttsSupported 
            ? t('checkin.meditation.tts_supported') 
            : t('checkin.meditation.tts_unsupported')}
        </p>
      </CardContent>
    </Card>
  );
}
