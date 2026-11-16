import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useConnectionMode } from '@/hooks/useConnectionMode';
import { enqueue } from '@/lib/offlineOutbox';
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
import WellnessScoreCard from '@/components/WellnessScoreCard';
import GamificationScoreCard from '@/components/GamificationScoreCard';
import { useI18n } from '@/i18n';
import { getProfileSchema, getPasswordSchema } from '@/lib/validations';

export default function Profile() {
  const { user, loading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { isAutonomous } = useConnectionMode();
  const navigate = useNavigate();
  const { t } = useI18n();

  const profileSchema = useMemo(() => getProfileSchema(t), [t]);
  const passwordSchema = useMemo(() => getPasswordSchema(t), [t]);

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

      if (isAutonomous) {
        enqueue({
          table: 'profiles',
          op: 'update',
          filter: { column: 'id', value: user!.id },
          payload: {
            full_name: validated.fullName || null,
            preferred_name: validated.preferredName || null,
          },
        });
        toast.success(t('account.profile.toastOfflineSaved'));
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: validated.fullName || null,
          preferred_name: validated.preferredName || null,
        })
        .eq('id', user!.id);

      if (error) throw error;
      toast.success(t('account.profile.toastProfileUpdated'));
    } catch (err: any) {
      if (err.errors) {
        toast.error(err.errors[0].message);
      } else {
        toast.error(err.message || t('account.profile.toastProfileError'));
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
      toast.success(t('account.profile.toastPasswordUpdated'));
    } catch (err: any) {
      if (err.errors) {
        toast.error(err.errors[0].message);
      } else {
        toast.error(err.message || t('account.profile.toastPasswordError'));
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
            <h1 className="font-display font-bold text-xl text-foreground">{t('account.profile.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('account.profile.subtitle')}</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Wellness Score */}
          <WellnessScoreCard compact />

          {/* Gamification Score */}
          <GamificationScoreCard compact />

          {/* Profile Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-primary" />
                <CardTitle className="text-base">{t('account.profile.personalInfoTitle')}</CardTitle>
              </div>
              <CardDescription className="text-xs">
                {t('account.profile.personalInfoDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {t('account.profile.emailLabel')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || user?.email || ''}
                  disabled
                  className="bg-muted/50 text-muted-foreground"
                />
                <p className="text-[10px] text-muted-foreground">{t('account.profile.emailHint')}</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="full-name" className="text-xs font-medium">{t('account.profile.fullNameLabel')}</Label>
                <Input
                  id="full-name"
                  type="text"
                  placeholder={t('account.profile.fullNamePlaceholder')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="preferred-name" className="text-xs font-medium">{t('account.profile.preferredNameLabel')}</Label>
                <Input
                  id="preferred-name"
                  type="text"
                  placeholder={t('account.profile.preferredNamePlaceholder')}
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  maxLength={50}
                />
                <p className="text-[10px] text-muted-foreground">{t('account.profile.preferredNameHint')}</p>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? t('account.profile.saving') : t('account.profile.saveChanges')}
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-primary" />
                <CardTitle className="text-base">{t('account.profile.securityTitle')}</CardTitle>
              </div>
              <CardDescription className="text-xs">
                {t('account.profile.securityDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-xs font-medium">{t('account.profile.newPasswordLabel')}</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-new-password" className="text-xs font-medium">{t('account.profile.confirmNewPasswordLabel')}</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">{t('account.profile.passwordHint')}</p>
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !newPassword}
                variant="outline"
                className="w-full gap-2"
              >
                <Shield className="h-4 w-4" />
                {isChangingPassword ? t('account.profile.updatingPassword') : t('account.profile.changePassword')}
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
            {t('account.profile.logout')}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
