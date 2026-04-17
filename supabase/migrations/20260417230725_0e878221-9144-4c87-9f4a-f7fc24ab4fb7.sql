CREATE TABLE public.moderation_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.moderation_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own moderation flags"
ON public.moderation_flags
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view moderation flags"
ON public.moderation_flags
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete moderation flags"
ON public.moderation_flags
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_moderation_flags_user_id ON public.moderation_flags(user_id);
CREATE INDEX idx_moderation_flags_created_at ON public.moderation_flags(created_at DESC);