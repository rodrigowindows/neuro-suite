ALTER TABLE public.profiles ADD COLUMN horas_sono numeric;
ALTER TABLE public.profiles ADD COLUMN treino_realizado text;
COMMENT ON COLUMN public.profiles.horas_sono IS 'Horas de sono registradas pelo astronauta no Diário de Bordo';
COMMENT ON COLUMN public.profiles.treino_realizado IS 'Exercício realizado no dia, registrado no Diário de Bordo';