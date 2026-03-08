import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signupSchema, loginSchema } from '@/lib/validations';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CheckCircle, Mail } from 'lucide-react';
import neuroSuiteLogo from '@/assets/neurosuite-logo.jpg';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPreferredName, setSignupPreferredName] = useState('');

  const handleForgotPassword = async () => {
    if (!loginEmail) {
      toast.error('Digite seu email primeiro');
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar email');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const validated = loginSchema.parse({ email: loginEmail, password: loginPassword });
      const { error } = await signIn(validated.email, validated.password);
      if (!error) navigate('/');
    } catch (error: any) {
      if (error.errors) toast.error(error.errors[0].message);
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const validated = signupSchema.parse({
        email: signupEmail,
        password: signupPassword,
        fullName: signupName,
        preferredName: signupPreferredName,
      });
      const { error } = await signUp(validated.email, validated.password, validated.fullName, validated.preferredName);
      if (!error) {
        setSignupSuccess(true);
        setSignupEmail('');
        setSignupPassword('');
        setSignupName('');
        setSignupPreferredName('');
      }
    } catch (error: any) {
      if (error.errors) toast.error(error.errors[0].message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="shadow-elegant border-border/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-3 pb-2">
            <div className="flex justify-center">
              <img
                src={neuroSuiteLogo}
                alt="NeuroSuite - Plataforma de Detecção de Estresse"
                className="h-24 sm:h-28 w-auto rounded-xl shadow-medium"
              />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">NeuroSuite</h1>
              <CardDescription className="text-xs mt-1">
                Detecção de estresse e coaching de alta performance
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup" onClick={() => setSignupSuccess(false)}>Cadastro</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-3">
                  <div className="space-y-1.5">
                    <label htmlFor="login-email" className="text-xs font-medium">Email</label>
                    <Input id="login-email" type="email" placeholder="seu@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="login-password" className="text-xs font-medium">Senha</label>
                    <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="w-full text-xs text-muted-foreground hover:text-primary transition-colors mt-2 text-center"
                  >
                    Esqueceu sua senha?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                {signupSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6 space-y-4"
                  >
                    <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-foreground">Cadastro realizado! 🎉</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Enviamos um email de confirmação para sua caixa de entrada.
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        Verifique também a pasta de spam
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSignupSuccess(false)}
                      className="mt-2"
                    >
                      Criar outra conta
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-3">
                    <div className="space-y-1.5">
                      <label htmlFor="signup-name" className="text-xs font-medium">Nome completo</label>
                      <Input id="signup-name" type="text" placeholder="Seu nome" value={signupName} onChange={(e) => setSignupName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="signup-preferred-name" className="text-xs font-medium">Como prefere ser chamado(a)?</label>
                      <Input id="signup-preferred-name" type="text" placeholder="Ex: João, Maria..." value={signupPreferredName} onChange={(e) => setSignupPreferredName(e.target.value)} />
                      <p className="text-[10px] text-muted-foreground">O NeuroCoach usará este nome</p>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="signup-email" className="text-xs font-medium">Email</label>
                      <Input id="signup-email" type="email" placeholder="seu@email.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="signup-password" className="text-xs font-medium">Senha</label>
                      <Input id="signup-password" type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                      <p className="text-[10px] text-muted-foreground">Mínimo 6 caracteres</p>
                    </div>
                    <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                      {isLoading ? 'Cadastrando...' : 'Criar conta'}
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
