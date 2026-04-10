
-- prayer_wall_posts: drop old conflicting policies and recreate
DROP POLICY IF EXISTS "Authenticated can view all posts" ON public.prayer_wall_posts;
DROP POLICY IF EXISTS "Public posts visible to everyone" ON public.prayer_wall_posts;
DROP POLICY IF EXISTS "Subscribers can create posts" ON public.prayer_wall_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.prayer_wall_posts;

CREATE POLICY "Public posts visible to everyone"
ON public.prayer_wall_posts FOR SELECT TO public
USING (is_public = true);

CREATE POLICY "Authenticated can create posts"
ON public.prayer_wall_posts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
ON public.prayer_wall_posts FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- prayer_reactions: drop old and recreate
DROP POLICY IF EXISTS "Authenticated can view reactions" ON public.prayer_reactions;
DROP POLICY IF EXISTS "Authenticated can add reactions" ON public.prayer_reactions;
DROP POLICY IF EXISTS "Users can remove own reactions" ON public.prayer_reactions;

CREATE POLICY "Authenticated can view reactions"
ON public.prayer_reactions FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated can add reactions"
ON public.prayer_reactions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions"
ON public.prayer_reactions FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- prayer_comments: drop old and recreate
DROP POLICY IF EXISTS "Authenticated can view comments" ON public.prayer_comments;
DROP POLICY IF EXISTS "Authenticated can insert comments" ON public.prayer_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.prayer_comments;

CREATE POLICY "Authenticated can view comments"
ON public.prayer_comments FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert comments"
ON public.prayer_comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON public.prayer_comments FOR DELETE TO authenticated
USING (auth.uid() = user_id);
