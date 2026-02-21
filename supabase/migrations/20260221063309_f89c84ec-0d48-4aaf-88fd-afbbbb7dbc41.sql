
-- Prayer wall posts table
CREATE TABLE public.prayer_wall_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  content text NOT NULL,
  religion text,
  philosophy text,
  is_anonymous boolean NOT NULL DEFAULT false,
  is_public boolean NOT NULL DEFAULT false,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.prayer_wall_posts ENABLE ROW LEVEL SECURITY;

-- Users can see their own posts OR public posts
CREATE POLICY "Users can view own or public posts"
ON public.prayer_wall_posts FOR SELECT
USING (auth.uid() = user_id OR is_public = true);

-- Only subscribers can insert posts (using security definer function)
CREATE OR REPLACE FUNCTION public.is_subscriber(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND is_subscriber = true
  )
$$;

CREATE POLICY "Subscribers can create posts"
ON public.prayer_wall_posts FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.is_subscriber(auth.uid()));

CREATE POLICY "Users can delete own posts"
ON public.prayer_wall_posts FOR DELETE
USING (auth.uid() = user_id);

-- Prayer reactions table
CREATE TABLE public.prayer_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.prayer_wall_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('pray', 'heart')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, reaction_type)
);

ALTER TABLE public.prayer_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view reactions"
ON public.prayer_reactions FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can add reactions"
ON public.prayer_reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions"
ON public.prayer_reactions FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for prayer wall posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.prayer_wall_posts;
