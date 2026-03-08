-- Fix ALL RLS policies: drop RESTRICTIVE ones and recreate as PERMISSIVE

-- ===================== profiles =====================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ===================== user_roles =====================
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ===================== stress_scans =====================
DROP POLICY IF EXISTS "Users can view own scans" ON public.stress_scans;
DROP POLICY IF EXISTS "Users can insert own scans" ON public.stress_scans;
DROP POLICY IF EXISTS "Managers can view all scans" ON public.stress_scans;

CREATE POLICY "Users can view own scans" ON public.stress_scans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scans" ON public.stress_scans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Managers can view all scans" ON public.stress_scans FOR SELECT TO authenticated USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- ===================== coach_conversations =====================
DROP POLICY IF EXISTS "Users can view own conversations" ON public.coach_conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON public.coach_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.coach_conversations;

CREATE POLICY "Users can view own conversations" ON public.coach_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON public.coach_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.coach_conversations FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ===================== user_progress =====================
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;

CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ===================== user_ear_baselines =====================
DROP POLICY IF EXISTS "Users can view own baseline" ON public.user_ear_baselines;
DROP POLICY IF EXISTS "Users can insert own baseline" ON public.user_ear_baselines;
DROP POLICY IF EXISTS "Users can update own baseline" ON public.user_ear_baselines;

CREATE POLICY "Users can view own baseline" ON public.user_ear_baselines FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own baseline" ON public.user_ear_baselines FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own baseline" ON public.user_ear_baselines FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ===================== feedback_responses =====================
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback_responses;
DROP POLICY IF EXISTS "Users can insert own feedback" ON public.feedback_responses;

CREATE POLICY "Users can view own feedback" ON public.feedback_responses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feedback" ON public.feedback_responses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ===================== email_logs =====================
DROP POLICY IF EXISTS "Users can view own email logs" ON public.email_logs;

CREATE POLICY "Users can view own email logs" ON public.email_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);