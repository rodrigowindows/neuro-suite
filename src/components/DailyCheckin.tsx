import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, CheckCircle2, Sparkles, Sun, Clock, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';

const MOODS = [
  { value: 'great', emoji: '🤩', label: 'Ótimo', color: 'bg-emerald-500/20 border-emerald-500/40 hover:bg-emerald-500/30' },
  { value: 'good', emoji: '😊', label: 'Bem', color: 'bg-teal-500/20 border-teal-500/40 hover:bg-teal-500/30' },
  { value: 'okay', emoji: '😐', label: 'OK', color: 'bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/30' },
  { value: 'low', emoji: '😔', label: 'Baixo', color: 'bg-orange-500/20 border-orange-500/40 hover:bg-orange-500/30' },
  { value: 'bad', emoji: '😩', label: 'Mal', color: 'bg-red-500/20 border-red-500/40 hover:bg-red-500/30' },
];

type Step = 'mood' | 'energy' | 'note' | 'done';

type SentimentAnalysis = {
  sentiment: number;
  wellbeingLevel: 'high' | 'medium' | 'low' | 'critical';
  concerns: string[];
  message: string;
  needsAttention: boolean;
};

export default function DailyCheckin() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('mood');
  const [mood, setMood] = useState('');
  const [energy, setEnergy] = useState([3]);
  const [note, setNote] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [todayCheckin, setTodayCheckin] = useState<any>(null);
  const [checkingToday, setCheckingToday] = useState(true);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<SentimentAnalysis | null>(null);
  const [analyzingSentiment, setAnalyzingSentiment] = useState(false);

  useEffect(() => {
    if (!user) return;
    const checkToday = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_checkins')
        .select('*')
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
  }, [mood, energy]);

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

      setAiResponse(aiMsg || '✨ Check-in registrado! Continue cuidando de você.');
      setStep('done');
      toast.success('Check-in do dia registrado!');
    } catch (err: any) {
      console.error(err);
      // Save without AI response
      await supabase.from('daily_checkins').insert({
        user_id: user.id,
        mood,
        energy_level: energy[0],
        note: note.trim() || null,
      });
      setAiResponse('✨ Check-in registrado! Continue cuidando de você.');
      setStep('done');
      toast.success('Check-in registrado!');
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
    const moodInfo = MOODS.find(m => m.value === todayCheckin.mood);
    return (
      <Card className="shadow-soft border-primary/20 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Check-in de Hoje Completo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
            <span className="text-3xl">{moodInfo?.emoji || '😊'}</span>
            <div>
              <p className="font-medium text-sm">{moodInfo?.label || todayCheckin.mood}</p>
              <p className="text-xs text-muted-foreground">Energia: {todayCheckin.energy_level}/5 • {new Date(todayCheckin.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          {todayCheckin.ai_response && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm text-foreground/80">{todayCheckin.ai_response}</p>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleNewCheckin} className="w-full">
            Fazer novo check-in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft border-primary/20 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sun className="h-5 w-5 text-amber-500" />
              Check-in Diário
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              <Clock className="inline h-3 w-3 mr-1" />
              ~30 segundos • Como você está agora?
            </CardDescription>
          </div>
          {step !== 'mood' && step !== 'done' && (
            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {step === 'energy' ? '2/3' : '3/3'}
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
              <p className="text-sm font-medium text-foreground/80">Como você se sente agora?</p>
              <div className="grid grid-cols-5 gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => handleMoodSelect(m.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 ${m.color} active:scale-95`}
                  >
                    <span className="text-2xl sm:text-3xl">{m.emoji}</span>
                    <span className="text-[10px] font-medium">{m.label}</span>
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
                <span className="text-2xl">{MOODS.find(m => m.value === mood)?.emoji}</span>
                <p className="text-sm font-medium text-foreground/80">Nível de energia?</p>
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
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>🔋 Esgotado</span>
                  <span className="font-bold text-sm text-foreground">{energy[0]}/5</span>
                  <span>⚡ Energizado</span>
                </div>
              </div>
              <Button onClick={handleEnergyNext} className="w-full" size="sm">
                Continuar
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
                Quer compartilhar algo? <span className="text-muted-foreground font-normal">(opcional)</span>
              </p>
              <div className="relative">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex: Reunião pesada de manhã, mas café ajudou..."
                  className="resize-none text-sm"
                  rows={3}
                  maxLength={200}
                />
                {analyzingSentiment && (
                  <div className="absolute top-2 right-2">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
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
                  Pular
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                  size="sm"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      Analisando...
                    </span>
                  ) : (
                    'Enviar'
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
              <div className="text-4xl">
                {MOODS.find(m => m.value === mood)?.emoji || '✨'}
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-sm flex items-center justify-center gap-1">
                  <Heart className="h-4 w-4 text-red-400" />
                  Check-in registrado!
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span>{MOODS.find(m => m.value === mood)?.label}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5"><Zap className="h-3 w-3" />{energy[0]}/5</span>
                </div>
              </div>
              {aiResponse && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-left">
                  <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> NeuroCoach diz:
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
