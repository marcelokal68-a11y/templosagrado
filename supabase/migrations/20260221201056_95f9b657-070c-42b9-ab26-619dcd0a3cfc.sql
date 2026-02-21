
-- Add trial expiration to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone DEFAULT NULL;

-- Allow authenticated users to create their own invite links
CREATE POLICY "Users can create own invite links"
ON public.invite_links
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Allow users to view their own invite links
CREATE POLICY "Users can view own invite links"
ON public.invite_links
FOR SELECT
USING (auth.uid() = created_by);
