
-- 1) prayers: require user_id = auth.uid() on INSERT
DROP POLICY IF EXISTS "Authenticated users can insert prayers" ON public.prayers;
CREATE POLICY "Authenticated users can insert prayers"
ON public.prayers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2) prayer_wall_posts: mask user_id for anonymous posts via view
CREATE OR REPLACE VIEW public.prayer_wall_posts_public
WITH (security_invoker = true) AS
SELECT
  id,
  CASE
    WHEN is_anonymous = true AND user_id <> auth.uid() THEN NULL
    ELSE user_id
  END AS user_id,
  content,
  religion,
  philosophy,
  is_anonymous,
  is_public,
  CASE
    WHEN is_anonymous = true AND user_id <> auth.uid() THEN NULL
    ELSE display_name
  END AS display_name,
  created_at
FROM public.prayer_wall_posts;

GRANT SELECT ON public.prayer_wall_posts_public TO anon, authenticated;

-- 3) prayer_reactions: restrict SELECT to own rows; expose aggregates via view
DROP POLICY IF EXISTS "Authenticated can view reactions" ON public.prayer_reactions;
CREATE POLICY "Users can view their own reactions"
ON public.prayer_reactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE VIEW public.prayer_reactions_public
WITH (security_invoker = false) AS
SELECT
  pr.id,
  pr.post_id,
  pr.reaction_type,
  CASE WHEN pr.user_id = auth.uid() THEN pr.user_id ELSE NULL END AS user_id,
  pr.created_at
FROM public.prayer_reactions pr
JOIN public.prayer_wall_posts p ON p.id = pr.post_id
WHERE p.is_public = true;

GRANT SELECT ON public.prayer_reactions_public TO anon, authenticated;
