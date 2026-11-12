import { useState, useEffect } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Moon, Dumbbell, Save, BookOpen, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const missionLogSchema = z.object({
  horas_sono: z
    .number({ invalid_type_error: 'Informe um número válido' })
    .min(0, 'Horas de sono não podem ser negativas')
    .max(24, 'Máximo de 24 horas'),
  treino_realizado: z
    .string()
    .trim()
    .max(500, 'Máximo de 500 caracteres')
    .optional()
    .or(z.literal('')),
});

interface LastEntry {
  horas_sono: number | null;
  treino_realizado: string | null;
}

export default function MissionLog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [horasSono, setHorasSono] = useState('');
  const [treino, setTreino] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(true);
  const [lastEntry, setLastEntry] = useState<LastEntry | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('horas_sono, treino_realizado')
        .eq('id', user.id)
        .maybeSingle();
      if (data && (data.horas_sono !== null || data.treino_realizado)) {
        setLastEntry({
          horas_sono: data.horas_sono !== null ? Number(data.horas_sono) : null,
          treino_realizado: data.treino_realizado,
        });
      }
      setLoadingEntry(false);
    };
    load();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user) return;

    const parsed = missionLogSchema.safeParse({
      horas_sono: horasSono === '' ? NaN : Number(horasSono),
      treino_realizado: treino,
    });

    if (!parsed.success) {
      toast({
        title: 'Verifique os campos',
        description: parsed.error.errors[0]?.message || 'Dados inválidos',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        horas_sono: parsed.data.horas_sono,
        treino_realizado: parsed.data.treino_realizado || null,
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o registro. Tente novamente.',
        variant: 'destructive',
      });
      return;
    }

    setLastEntry({
      horas_sono: parsed.data.horas_sono,
      treino_realizado: parsed.data.treino_realizado || null,
    });
    setHorasSono('');
    setTreino('');
    toast({
      title: 'Registro salvo ✅',
      description: 'Seu diário de bordo foi atualizado.',
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Diário de Bordo</CardTitle>
                <CardDescription>
                  Registre seu sono e exercícios diários — essenciais para mitigar os efeitos da microgravidade.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="horas-sono" className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-primary" />
                Horas de Sono
              </Label>
              <Input
                id="horas-sono"
                type="number"
                min={0}
                max={24}
                step={0.5}
                placeholder="Ex: 7.5"
                value={horasSono}
                onChange={(e) => setHorasSono(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treino" className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                Exercício Realizado Hoje
              </Label>
              <Textarea
                id="treino"
                placeholder="Ex: 45 min de esteira com arnês + 30 min de resistência (ARED)"
                value={treino}
                onChange={(e) => setTreino(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar Registro
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <Card className="border-border/50 bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Último Registro Salvo</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEntry ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : lastEntry ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Moon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sono</p>
                    <p className="font-semibold">
                      {lastEntry.horas_sono !== null ? `${lastEntry.horas_sono}h` : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Dumbbell className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Exercício</p>
                    <p className="font-semibold text-sm leading-snug">
                      {lastEntry.treino_realizado || '—'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum registro ainda. Salve seu primeiro registro acima. 🚀
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
