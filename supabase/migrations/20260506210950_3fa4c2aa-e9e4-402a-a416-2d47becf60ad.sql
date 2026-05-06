
DROP VIEW IF EXISTS public.prayer_reactions_public;

CREATE OR REPLACE FUNCTION public.get_prayer_reactions(_post_ids uuid[])
RETURNS TABLE(
  post_id uuid,
  pray_count bigint,
  heart_count bigint,
  user_pray boolean,
  user_heart boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id AS post_id,
    COUNT(*) FILTER (WHERE r.reaction_type = 'pray') AS pray_count,
    COUNT(*) FILTER (WHERE r.reaction_type = 'heart') AS heart_count,
    BOOL_OR(r.reaction_type = 'pray'  AND r.user_id = auth.uid()) AS user_pray,
    BOOL_OR(r.reaction_type = 'heart' AND r.user_id = auth.uid()) AS user_heart
  FROM public.prayer_wall_posts p
  LEFT JOIN public.prayer_reactions r ON r.post_id = p.id
  WHERE p.id = ANY(_post_ids)
    AND p.is_public = true
  GROUP BY p.id;
$$;

REVOKE ALL ON FUNCTION public.get_prayer_reactions(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_prayer_reactions(uuid[]) TO authenticated;

-- prayer_wall_posts_public view: drop and recreate without security_invoker keyword if it was set as definer
-- (security_invoker = true was already specified, that's fine; no action needed)
