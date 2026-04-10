CREATE POLICY "Public posts visible to everyone"
ON public.prayer_wall_posts
FOR SELECT
TO public
USING (is_public = true);