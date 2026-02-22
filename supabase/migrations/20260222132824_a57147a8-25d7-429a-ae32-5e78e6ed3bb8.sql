
-- Cache table for daily verses to avoid repeated AI calls
CREATE TABLE public.daily_verse_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_date date NOT NULL,
  religion text NOT NULL,
  language text NOT NULL DEFAULT 'pt-BR',
  verse_data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(cache_date, religion, language)
);

-- Enable RLS
ALTER TABLE public.daily_verse_cache ENABLE ROW LEVEL SECURITY;

-- Anyone can read cached verses (public content)
CREATE POLICY "Anyone can read cached verses"
ON public.daily_verse_cache
FOR SELECT
USING (true);

-- Only service role inserts (via edge function), no user insert policy needed
-- Create index for fast lookups
CREATE INDEX idx_daily_verse_cache_lookup ON public.daily_verse_cache (cache_date, religion, language);
