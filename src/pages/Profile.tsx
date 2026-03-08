import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import BackButton from '@/components/BackButton';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { User, Mail, Save, Shield, LogOut } from 'lucide-react';
import { z } from 'zod';

const profileSchema = z.object({
  fullName: z.string().trim().max(100, 'Nome muito longo').optional(),
  preferredName: z.string().trim().max(50, 'Apelido muito longo').optional(),
});

const passwordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(100, 'Senha muito longa'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export default function Profile() {
  const { user, loading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setPreferredName(profile.preferredName);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      const validated = profileSchema.parse({ fullName, preferredName });
      setIsSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: validated.fullName || null,
          preferred_name: validated.preferredName || null,
        })
        .eq('id', user!.id);

      if (error) throw error;
      toast.success('Perfil atualizado com sucesso! ✅');
    } catch (err: any) {
      if (err.errors) {
        toast.error(err.errors[0].message);
      } else {
        toast.error(err.message || 'Erro ao salvar perfil');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const validated = passwordSchema.parse({ password: newPassword, confirmPassword });
      setIsChangingPassword(true);

      const { error } = await supabase.auth.updateUser({
        password: validated.password,
      });

      if (error) throw error;

      setNewPassword('');
      setConfirmPassword('');
      toast.success('Senha atualizada com sucesso! 🔒');
    } catch (err: any) {
      if (err.errors) {
        toast.error(err.errors[0].message);
      } else {
        toast.error(err.message || 'Erro ao alterar senha');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-10 w-10 border-[3px] border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">Meu Perfil</h1>
            <p className="text-xs text-muted-foreground">Gerencie suas informações pessoais</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Profile Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-primary" />
                <CardTitle className="text-base">Informações Pessoais</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Atualize seu nome e como deseja ser chamado pelo NeuroCoach
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || user?.email || ''}
                  disabled
                  className="bg-muted/50 text-muted-foreground"
                />
                <p className="text-[10px] text-muted-foreground">O email não pode ser alterado</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="full-name" className="text-xs font-medium">Nome completo</Label>
                <Input
                  id="full-name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="preferred-name" className="text-xs font-medium">Como prefere ser chamado(a)?</Label>
                <Input
                  id="preferred-name"
                  type="text"
                  placeholder="Ex: João, Maria..."
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  maxLength={50}
                />
                <p className="text-[10px] text-muted-foreground">O NeuroCoach usará este nome nas conversas</p>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-primary" />
                <CardTitle className="text-base">Segurança</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Altere sua senha de acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-xs font-medium">Nova senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-new-password" className="text-xs font-medium">Confirmar nova senha</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">Mínimo 6 caracteres</p>
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !newPassword}
                variant="outline"
                className="w-full gap-2"
              >
                <Shield className="h-4 w-4" />
                {isChangingPassword ? 'Atualizando...' : 'Alterar Senha'}
              </Button>
            </CardContent>
          </Card>

          {/* Logout */}
          <Separator />
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
