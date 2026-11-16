import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signupSchema, loginSchema } from '@/lib/validations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CheckCircle, Mail } from 'lucide-react';
import neuroSuiteLogo from '@/assets/neurosuite-logo.jpg';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { t } = useI18n();
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
      toast.error(t('auth.forgotPassword.enterEmail'));
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success(t('auth.forgotPassword.success'));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('auth.forgotPassword.error');
      toast.error(message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const validated = loginSchema.parse({ email: loginEmail, password: loginPassword });
      const { error } = await signIn(validated.email, validated.password);
      if (!error) navigate('/dashboard');
    } catch (error: unknown) {
      if (error instanceof z.ZodError) toast.error(error.errors[0]?.message);
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
    } catch (error: unknown) {
      if (error instanceof z.ZodError) toast.error(error.errors[0]?.message);
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
          <div className="flex justify-end pt-3 px-4 sm:px-6">
            <LanguageToggle />
          </div>
          <CardHeader className="text-center space-y-3 pb-2 pt-2">
            <div className="flex justify-center">
              <img
                src={neuroSuiteLogo}
                alt={t('auth.logoAlt')}
                className="h-24 sm:h-28 w-auto rounded-xl shadow-medium"
              />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">CrewVitals</h1>
              <CardDescription className="text-xs mt-1">
                {t('auth.subtitle')}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">{t('auth.tabs.login')}</TabsTrigger>
                <TabsTrigger value="signup" onClick={() => setSignupSuccess(false)}>
                  {t('auth.tabs.signup')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-3">
                  <div className="space-y-1.5">
                    <label htmlFor="login-email" className="text-xs font-medium">
                      {t('auth.login.emailLabel')}
                    </label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={t('auth.login.emailPlaceholder')}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="login-password" className="text-xs font-medium">
                      {t('auth.login.passwordLabel')}
                    </label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder={t('auth.login.passwordPlaceholder')}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                    {isLoading ? t('auth.login.submitting') : t('auth.login.submit')}
                  </Button>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="w-full text-xs text-muted-foreground hover:text-primary transition-colors mt-2 text-center"
                  >
                    {t('auth.login.forgotPassword')}
                  </button>
                </form>

                <div className="mt-4 pt-3 border-t border-border/50 text-center space-y-1">
                  <Link
                    to="/demo"
                    className="inline-flex items-center justify-center min-h-[44px] px-3 py-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                  >
                    {t('auth.login.demoLink')}
                  </Link>
                  <p className="text-[11px] text-muted-foreground">
                    {t('auth.login.demoHint')}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="signup">
                {signupSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6 space-y-4"
                  >
                    <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-success" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-foreground">
                        {t('auth.signup.successTitle')}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('auth.signup.successMessage')}
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {t('auth.signup.spamHint')}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSignupSuccess(false)}
                      className="mt-2"
                    >
                      {t('auth.signup.createAnother')}
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-3">
                    <div className="space-y-1.5">
                      <label htmlFor="signup-name" className="text-xs font-medium">
                        {t('auth.signup.nameLabel')}
                      </label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder={t('auth.signup.namePlaceholder')}
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="signup-preferred-name" className="text-xs font-medium">
                        {t('auth.signup.preferredNameLabel')}
                      </label>
                      <Input
                        id="signup-preferred-name"
                        type="text"
                        placeholder={t('auth.signup.preferredNamePlaceholder')}
                        value={signupPreferredName}
                        onChange={(e) => setSignupPreferredName(e.target.value)}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        {t('auth.signup.preferredNameHint')}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="signup-email" className="text-xs font-medium">
                        {t('auth.signup.emailLabel')}
                      </label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder={t('auth.signup.emailPlaceholder')}
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="signup-password" className="text-xs font-medium">
                        {t('auth.signup.passwordLabel')}
                      </label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder={t('auth.signup.passwordPlaceholder')}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                      <p className="text-[10px] text-muted-foreground">
                        {t('auth.signup.passwordHint')}
                      </p>
                    </div>
                    <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                      {isLoading ? t('auth.signup.submitting') : t('auth.signup.submit')}
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
