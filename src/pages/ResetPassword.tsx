import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CheckCircle, Lock } from 'lucide-react';
import neuroSuiteLogo from '@/assets/neurosuite-logo.jpg';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success('Senha atualizada com sucesso!');
      setTimeout(() => navigate('/'), 2000);
    }
    setIsLoading(false);
  };

  if (!isRecovery && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
        <Card className="w-full max-w-md shadow-elegant">
          <CardContent className="pt-6 text-center space-y-4">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Link de recuperação inválido ou expirado.</p>
            <Button variant="outline" onClick={() => navigate('/auth')}>Voltar ao Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-elegant border-border/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-3 pb-2">
            <div className="flex justify-center">
              <img src={neuroSuiteLogo} alt="NeuroSuite" className="h-20 w-auto rounded-xl shadow-medium" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">Redefinir Senha</h1>
              <CardDescription className="text-xs mt-1">Escolha uma nova senha segura</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {success ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <p className="font-display font-bold text-lg">Senha atualizada! ✅</p>
                <p className="text-sm text-muted-foreground">Redirecionando...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="new-password" className="text-xs font-medium">Nova senha</label>
                  <Input id="new-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="confirm-password" className="text-xs font-medium">Confirmar senha</label>
                  <Input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  <p className="text-[10px] text-muted-foreground">Mínimo 6 caracteres</p>
                </div>
                <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                  {isLoading ? 'Atualizando...' : 'Atualizar Senha'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
