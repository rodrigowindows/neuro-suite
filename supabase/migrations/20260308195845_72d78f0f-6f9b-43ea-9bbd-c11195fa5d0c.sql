
CREATE TABLE public.daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mood text NOT NULL,
  energy_level integer NOT NULL DEFAULT 3,
  note text,
  ai_response text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins" ON public.daily_checkins FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkins" ON public.daily_checkins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Managers can view all checkins" ON public.daily_checkins FOR SELECT TO authenticated USING (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'admin'));
