import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useConnectionMode } from '@/hooks/useConnectionMode';
import { useI18n } from '@/i18n';
import { enqueue } from '@/lib/offlineOutbox';
import { appendEvent } from '@/lib/missionEvents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sun, Clock, AlertTriangle, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { toast } from 'sonner';

const MOODS = [
  {
    value: 'bad',
    level: 1,
    labelKey: 'checkin.mood.bad',
    color: 'border-border hover:border-destructive/60 hover:bg-destructive/10',
  },
  {
    value: 'low',
    level: 2,
    labelKey: 'checkin.mood.low',
    color: 'border-border hover:border-amber-500/60 hover:bg-amber-500/10',
  },
  {
    value: 'okay',
    level: 3,
    labelKey: 'checkin.mood.okay',
    color: 'border-border hover:border-muted-foreground/60 hover:bg-muted',
  },
  {
    value: 'good',
    level: 4,
    labelKey: 'checkin.mood.good',
    color: 'border-border hover:border-teal-500/60 hover:bg-teal-500/10',
  },
  {
    value: 'great',
    level: 5,
    labelKey: 'checkin.mood.great',
    color: 'border-border hover:border-emerald-500/60 hover:bg-emerald-500/10',
  },
];

const getMoodInfo = (value?: string) =>
  MOODS.find((m) => m.value === value || String(m.level) === String(value));

type Step = 'mood' | 'energy' | 'note' | 'done';

type SentimentAnalysis = {
  sentiment: number;
  wellbeingLevel: 'high' | 'medium' | 'low' | 'critical';
  concerns: string[];
  message: string;
  needsAttention: boolean;
};

interface TodayCheckinData {
  mood: string;
  energy_level: number;
  ai_response?: string | null;
  created_at: string;
}

export default function DailyCheckin() {
  const { user } = useAuth();
  const { isAutonomous } = useConnectionMode();
  const { lang, t } = useI18n();
  const [step, setStep] = useState<Step>('mood');
  const [mood, setMood] = useState('');
  const [energy, setEnergy] = useState([3]);
  const [note, setNote] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [todayCheckin, setTodayCheckin] = useState<TodayCheckinData | null>(null);
  const [checkingToday, setCheckingToday] = useState(true);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<SentimentAnalysis | null>(null);
  const [analyzingSentiment, setAnalyzingSentiment] = useState(false);

  useEffect(() => {
    if (!user) return;
    const checkToday = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_checkins')
        .select('mood, energy_level, ai_response, created_at')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        setTodayCheckin(data[0]);
      }
      setCheckingToday(false);
    };
    checkToday();
  }, [user]);

  // Debounced sentiment analysis
  const analyzeSentiment = useCallback(async (text: string) => {
    if (text.trim().length < 10) {
      setSentimentAnalysis(null);
      return;
    }

    setAnalyzingSentiment(true);
    try {
      if (isAutonomous) {
        const localSentiment: SentimentAnalysis = {
          sentiment: energy[0] >= 4 ? 0.7 : energy[0] === 3 ? 0.1 : -0.5,
          wellbeingLevel: energy[0] >= 4 ? 'high' : energy[0] === 3 ? 'medium' : energy[0] === 2 ? 'low' : 'critical',
          concerns: energy[0] <= 2 ? [t('checkin.autonomous.fatigue_concern')] : [],
          message: t('checkin.autonomous.local_sentiment'),
          needsAttention: energy[0] <= 2,
        };
        setSentimentAnalysis(localSentiment);
        return;
      }

      const { data, error } = await supabase.functions.invoke('sentiment-analysis', {
        body: { note: text, mood, energyLevel: energy[0] },
      });

      if (error) throw error;
      if (data && data.sentiment !== null) {
        setSentimentAnalysis(data);
      }
    } catch (err) {
      console.error('Sentiment analysis error:', err);
    } finally {
      setAnalyzingSentiment(false);
    }
  }, [mood, energy, isAutonomous, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (note.trim().length >= 10) {
        analyzeSentiment(note);
      }
    }, 800); // Debounce 800ms

    return () => clearTimeout(timer);
  }, [note, analyzeSentiment]);

  const handleMoodSelect = (value: string) => {
    setMood(value);
    setStep('energy');
  };

  const handleEnergyNext = () => {
    setStep('note');
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    if (isAutonomous) {
      const localAiMsg = t('checkin.autonomous.local_msg');
      enqueue({
        table: 'daily_checkins',
        op: 'insert',
        payload: {
          user_id: user.id,
          mood,
          energy_level: energy[0],
          note: note.trim() || null,
          ai_response: localAiMsg,
          created_at: new Date().toISOString(),
        },
      });
      setAiResponse(localAiMsg);
      setStep('done');
      setLoading(false);
      appendEvent({
        type: 'assessment',
        label: t('checkin.autonomous.assessment_event', { energy: energy[0] }),
      });
      toast.success(t('checkin.autonomous.saved_local'));
      return;
    }

    try {
      // Call AI for micro-response
      const { data: fnData, error: fnError } = await supabase.functions.invoke('daily-checkin', {
        body: { mood, energyLevel: energy[0], note: note.trim() || null },
      });

      const aiMsg = fnError ? null : fnData?.message;

      // Save to DB
      const { error } = await supabase.from('daily_checkins').insert({
        user_id: user.id,
        mood,
        energy_level: energy[0],
        note: note.trim() || null,
        ai_response: aiMsg,
      });

      if (error) throw error;

      setAiResponse(aiMsg || t('checkin.default_response'));
      setStep('done');
      appendEvent({
        type: 'assessment',
        label: t('checkin.autonomous.assessment_event', { energy: energy[0] }),
      });
      toast.success(t('checkin.done.title'));
    } catch (err: unknown) {
      console.error(err);
      // Save without AI response
      await supabase.from('daily_checkins').insert({
        user_id: user.id,
        mood,
        energy_level: energy[0],
        note: note.trim() || null,
      });
      setAiResponse(t('checkin.default_response'));
      setStep('done');
      appendEvent({
        type: 'assessment',
        label: t('checkin.autonomous.assessment_event', { energy: energy[0] }),
      });
      toast.success(t('checkin.done.title'));
    } finally {
      setLoading(false);
    }
  };

  const handleNewCheckin = () => {
    setTodayCheckin(null);
    setStep('mood');
    setMood('');
    setEnergy([3]);
    setNote('');
    setAiResponse('');
  };

  if (checkingToday) {
    return (
      <Card className="shadow-soft border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </CardContent>
      </Card>
    );
  }

  // Already checked in today
  if (todayCheckin && step !== 'done') {
    const moodInfo = getMoodInfo(todayCheckin.mood);
    const dateFormatted = new Date(todayCheckin.created_at).toLocaleTimeString(
      lang === 'pt' ? 'pt-BR' : 'en-US',
      { hour: '2-digit', minute: '2-digit' }
    );
    return (
      <Card className="shadow-soft border-primary/20 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            {t('checkin.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
            <span className="text-xl font-bold font-mono px-2.5 py-1 rounded bg-background border text-foreground">
              {moodInfo?.level ?? '—'}
            </span>
            <div>
              <p className="font-medium text-sm">{moodInfo ? t(moodInfo.labelKey) : todayCheckin.mood}</p>
              <p className="text-xs text-muted-foreground">{t('checkin.done.energy', { energy: todayCheckin.energy_level })} • {dateFormatted}</p>
            </div>
          </div>
          {todayCheckin.ai_response && (
            <div className="p-3 bg-muted/40 rounded-lg border border-border">
              <p className="text-sm text-foreground/80">{todayCheckin.ai_response}</p>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleNewCheckin} className="w-full">
            {t('checkin.done.new_checkin')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const selectedMood = getMoodInfo(mood);

  return (
    <Card className="shadow-soft border-primary/20 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sun className="h-5 w-5 text-amber-500" />
              {t('checkin.title')}
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              <Clock className="inline h-3 w-3 mr-1" />
              {t('checkin.subtitle')}
            </CardDescription>
          </div>
          {step !== 'mood' && step !== 'done' && (
            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {step === 'energy' ? t('checkin.step.energy_step') : t('checkin.step.note_step')}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {/* Step 1: Mood */}
          {step === 'mood' && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <p className="text-sm font-medium text-foreground/80">{t('checkin.mood.question')}</p>
              <div className="grid grid-cols-5 gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => handleMoodSelect(m.value)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border bg-card transition-all duration-200 ${m.color} active:scale-95`}
                  >
                    <span className="text-xl font-bold font-mono text-foreground">{m.level}</span>
                    <span className="text-[11px] font-medium text-muted-foreground mt-1">{t(m.labelKey)}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Energy */}
          {step === 'energy' && (
            <motion.div
              key="energy"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded border bg-muted font-mono text-foreground">
                  {selectedMood?.level} · {selectedMood ? t(selectedMood.labelKey) : ''}
                </span>
                <p className="text-sm font-medium text-foreground/80">{t('checkin.energy.question')}</p>
              </div>
              <div className="space-y-2 px-1">
                <Slider
                  value={energy}
                  onValueChange={setEnergy}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{t('checkin.energy.min')}</span>
                  <span className="font-bold text-sm font-mono text-foreground px-2 py-0.5 bg-muted rounded">
                    {energy[0]} / 5
                  </span>
                  <span>{t('checkin.energy.max')}</span>
                </div>
              </div>
              <Button onClick={handleEnergyNext} className="w-full" size="sm">
                {t('checkin.energy.continue')}
              </Button>
            </motion.div>
          )}

          {/* Step 3: Note (optional) */}
          {step === 'note' && (
            <motion.div
              key="note"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <p className="text-sm font-medium text-foreground/80">
                {t('checkin.note.title')} <span className="text-muted-foreground font-normal">{t('checkin.note.optional')}</span>
              </p>
              <div className="relative">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('checkin.note.placeholder')}
                  className="resize-none text-sm"
                  rows={3}
                  maxLength={200}
                />
                {analyzingSentiment && (
                  <div className="absolute top-2 right-2">
                    <Activity className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                )}
              </div>

              {/* Real-time Sentiment Feedback */}
              <AnimatePresence mode="wait">
                {sentimentAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-3 rounded-lg border text-sm ${
                      sentimentAnalysis.needsAttention
                        ? 'bg-red-500/10 border-red-500/30'
                        : sentimentAnalysis.wellbeingLevel === 'high'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-amber-500/10 border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {sentimentAnalysis.needsAttention ? (
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      ) : sentimentAnalysis.wellbeingLevel === 'high' ? (
                        <TrendingUp className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      ) : sentimentAnalysis.wellbeingLevel === 'low' ? (
                        <TrendingDown className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Minus className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 space-y-2">
                        <p className="font-medium">{sentimentAnalysis.message}</p>
                        {sentimentAnalysis.concerns && sentimentAnalysis.concerns.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {sentimentAnalysis.concerns.map((concern, idx) => (
                              <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0">
                                {concern}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                  size="sm"
                >
                  {t('checkin.note.skip')}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                  size="sm"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-primary-foreground border-t-transparent rounded-full inline-block" />
                      {t('checkin.note.analyzing')}
                    </span>
                  ) : (
                    t('checkin.note.submit')
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Done */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3 text-center py-2"
            >
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-sm">
                  {t('checkin.done.title')}
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {selectedMood ? `${selectedMood.level}: ${t(selectedMood.labelKey)}` : ''}
                  </span>
                  <span>•</span>
                  <span className="font-mono">{t('checkin.done.energy', { energy: energy[0] })}</span>
                </div>
              </div>
              {aiResponse && (
                <div className="p-3 bg-muted/40 rounded-lg border border-border text-left">
                  <p className="text-xs font-semibold text-foreground mb-1">
                    {t('checkin.done.ai_label')}
                  </p>
                  <p className="text-sm text-foreground/80">{aiResponse}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
