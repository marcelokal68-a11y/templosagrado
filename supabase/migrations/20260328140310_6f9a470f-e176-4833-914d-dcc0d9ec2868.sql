ALTER TABLE public.profiles ALTER COLUMN questions_limit SET DEFAULT 12;
UPDATE public.profiles SET questions_limit = 12 WHERE questions_limit = 10 AND is_subscriber = false;