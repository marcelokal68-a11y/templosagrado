-- Comments table for prayer wall posts
CREATE TABLE public.prayer_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.prayer_wall_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prayer_comments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated can view comments"
  ON public.prayer_comments FOR SELECT
  TO public
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert comments"
  ON public.prayer_comments FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.prayer_comments FOR DELETE
  TO public
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.prayer_comments;