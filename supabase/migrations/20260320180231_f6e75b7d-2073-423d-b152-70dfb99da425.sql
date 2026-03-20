
CREATE TABLE public.user_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fact TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  source_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memories"
  ON public.user_memory FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memories"
  ON public.user_memory FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
  ON public.user_memory FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all memories"
  ON public.user_memory FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_user_memory_user_id ON public.user_memory (user_id);
CREATE INDEX idx_user_memory_created_at ON public.user_memory (user_id, created_at DESC);
