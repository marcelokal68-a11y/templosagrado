CREATE TABLE public.parasha_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL UNIQUE,
  name_en TEXT,
  name_he TEXT,
  torah_ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.parasha_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read parasha cache"
  ON public.parasha_cache
  FOR SELECT
  USING (true);

CREATE INDEX idx_parasha_cache_week_start ON public.parasha_cache(week_start);