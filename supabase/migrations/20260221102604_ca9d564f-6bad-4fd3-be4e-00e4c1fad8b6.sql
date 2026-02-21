
-- 1. Update RLS on prayer_wall_posts: allow all authenticated users to view all posts
DROP POLICY IF EXISTS "Users can view own or public posts" ON public.prayer_wall_posts;

CREATE POLICY "Authenticated can view all posts"
ON public.prayer_wall_posts
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 2. Create prayer_reports table for abuse reporting
CREATE TABLE public.prayer_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.prayer_wall_posts(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.prayer_reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Authenticated can create reports"
ON public.prayer_reports
FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

-- Admins can view reports
CREATE POLICY "Admins can view reports"
ON public.prayer_reports
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete reports
CREATE POLICY "Admins can delete reports"
ON public.prayer_reports
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
ON public.prayer_reports
FOR SELECT
USING (auth.uid() = reporter_id);
