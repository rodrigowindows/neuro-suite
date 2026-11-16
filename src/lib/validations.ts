import { z } from 'zod';
import { translate } from '@/i18n';

type TFunction = (key: string, vars?: Record<string, string | number>) => string;

const defaultT: TFunction = (key, vars) => translate('pt', key, vars);

export function getSignupSchema(t: TFunction = defaultT) {
  return z.object({
    email: z.string().email(t('account.validation.emailInvalid')).max(255, t('account.validation.emailTooLong')),
    password: z.string().min(6, t('account.validation.passwordMin6')).max(100, t('account.validation.passwordTooLong')),
    fullName: z.string().trim().max(100, t('account.validation.nameTooLong')).optional(),
    preferredName: z.string().trim().max(50, t('account.validation.preferredNameTooLong')).optional(),
  });
}

export function getLoginSchema(t: TFunction = defaultT) {
  return z.object({
    email: z.string().email(t('account.validation.emailInvalid')).max(255, t('account.validation.emailTooLong')),
    password: z.string().min(1, t('account.validation.passwordRequired')).max(100, t('account.validation.passwordTooLong')),
  });
}

export function getProfileSchema(t: TFunction = defaultT) {
  return z.object({
    fullName: z.string().trim().max(100, t('account.validation.nameTooLong')).optional(),
    preferredName: z.string().trim().max(50, t('account.validation.preferredNameTooLong')).optional(),
  });
}

export function getPasswordSchema(t: TFunction = defaultT) {
  return z.object({
    password: z.string().min(6, t('account.validation.passwordMin6')).max(100, t('account.validation.passwordTooLong')),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: t('account.validation.passwordMismatch'),
    path: ['confirmPassword'],
  });
}

export function getCoachMessageSchema(t: TFunction = defaultT) {
  return z.object({
    messages: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().trim().min(1, t('account.validation.messageEmpty')).max(2000, t('account.validation.messageTooLong')),
    })).min(1, t('account.validation.messageAtLeastOne')),
    stressLevel: z.enum(['low', 'moderate', 'high']),
    context: z.string().max(1000).optional(),
    userName: z.string().max(100).optional(),
    hrvValue: z.number().min(0).max(200).optional(),
  });
}

// Authentication validation schemas (default PT fallback)
export const signupSchema = getSignupSchema();
export const loginSchema = getLoginSchema();
export const profileSchema = getProfileSchema();
export const passwordSchema = getPasswordSchema();
export const coachMessageSchema = getCoachMessageSchema();

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
export type CoachMessageInput = z.infer<typeof coachMessageSchema>;
