DROP POLICY "Anyone can insert prayers" ON public.prayers;
CREATE POLICY "Authenticated users can insert prayers"
  ON public.prayers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);