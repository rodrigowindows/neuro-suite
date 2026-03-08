
-- ============================================
-- FIX: Convert ALL RESTRICTIVE policies to PERMISSIVE
-- This is critical: RESTRICTIVE-only = zero data access
-- ============================================

-- PROFILES TABLE
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- USER_ROLES TABLE
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- STRESS_SCANS TABLE
DROP POLICY IF EXISTS "Users can view own scans" ON public.stress_scans;
DROP POLICY IF EXISTS "Users can insert own scans" ON public.stress_scans;
DROP POLICY IF EXISTS "Managers can view all scans" ON public.stress_scans;

CREATE POLICY "Users can view own scans" ON public.stress_scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scans" ON public.stress_scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Managers can view all scans" ON public.stress_scans FOR SELECT USING (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));

-- COACH_CONVERSATIONS TABLE
DROP POLICY IF EXISTS "Users can view own conversations" ON public.coach_conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON public.coach_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.coach_conversations;

CREATE POLICY "Users can view own conversations" ON public.coach_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON public.coach_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.coach_conversations FOR UPDATE USING (auth.uid() = user_id);

-- USER_PROGRESS TABLE
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;

CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- USER_EAR_BASELINES TABLE
DROP POLICY IF EXISTS "Users can view own baseline" ON public.user_ear_baselines;
DROP POLICY IF EXISTS "Users can insert own baseline" ON public.user_ear_baselines;
DROP POLICY IF EXISTS "Users can update own baseline" ON public.user_ear_baselines;

CREATE POLICY "Users can view own baseline" ON public.user_ear_baselines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own baseline" ON public.user_ear_baselines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own baseline" ON public.user_ear_baselines FOR UPDATE USING (auth.uid() = user_id);

-- FEEDBACK_RESPONSES TABLE
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback_responses;
DROP POLICY IF EXISTS "Users can insert own feedback" ON public.feedback_responses;

CREATE POLICY "Users can view own feedback" ON public.feedback_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feedback" ON public.feedback_responses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DAILY_CHECKINS TABLE
DROP POLICY IF EXISTS "Users can view own checkins" ON public.daily_checkins;
DROP POLICY IF EXISTS "Users can insert own checkins" ON public.daily_checkins;
DROP POLICY IF EXISTS "Managers can view all checkins" ON public.daily_checkins;

CREATE POLICY "Users can view own checkins" ON public.daily_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkins" ON public.daily_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Managers can view all checkins" ON public.daily_checkins FOR SELECT USING (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));

-- EMAIL_LOGS TABLE
DROP POLICY IF EXISTS "Users can view own email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Managers can insert email logs" ON public.email_logs;

CREATE POLICY "Users can view own email logs" ON public.email_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Managers can insert email logs" ON public.email_logs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));
