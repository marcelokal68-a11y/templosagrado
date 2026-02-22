
-- Add geolocation columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude double precision;

-- Create activity_history table
CREATE TABLE public.activity_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own activity" ON public.activity_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity" ON public.activity_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity" ON public.activity_history
  FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_activity_history_user_id ON public.activity_history(user_id);
CREATE INDEX idx_activity_history_type ON public.activity_history(type);
