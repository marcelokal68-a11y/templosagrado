-- Fase 0 + Fase 1: quota atômica e índices de hot path
--
-- TS-004: função atomic `try_consume_question` elimina a race condition
--         read-check-write do sacred-chat que permitia double-spend da quota free.
--
-- TS-206: função atomic `try_redeem_invite_link` para consumir invite sem
--         ultrapassar max_uses sob requests paralelas.
--
-- F1.17: índices em hot paths das tabelas que crescem com uso.
--
-- IMPORTANTE: todas as operações são idempotentes. Rollback via DROP
-- FUNCTION/INDEX no final do arquivo (comentado) se for preciso reverter.

-- =========================================================================
-- 1) Quota atômica por usuário (TS-004)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.try_consume_question(_user_id uuid)
RETURNS TABLE(allowed boolean, remaining int, quota_limit int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _lim int;
  _used int;
  _is_sub boolean;
  _is_pro boolean;
BEGIN
  -- Row-level lock prevents two concurrent callers from both passing the check.
  SELECT questions_limit, questions_used, is_subscriber, is_pro
    INTO _lim, _used, _is_sub, _is_pro
  FROM public.profiles
  WHERE user_id = _user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0;
    RETURN;
  END IF;

  -- Paid tiers bypass the counter.
  IF COALESCE(_is_sub, false) OR COALESCE(_is_pro, false) THEN
    RETURN QUERY SELECT true, 999999, 999999;
    RETURN;
  END IF;

  IF COALESCE(_used, 0) >= COALESCE(_lim, 0) THEN
    RETURN QUERY SELECT false, 0, _lim;
    RETURN;
  END IF;

  UPDATE public.profiles
  SET questions_used = COALESCE(questions_used, 0) + 1
  WHERE user_id = _user_id;

  RETURN QUERY SELECT true, _lim - (_used + 1), _lim;
END;
$$;

GRANT EXECUTE ON FUNCTION public.try_consume_question(uuid)
  TO authenticated, service_role;

COMMENT ON FUNCTION public.try_consume_question(uuid) IS
  'Atomic quota decrement. Use from edge functions that gate AI calls.
   Returns (allowed, remaining, quota_limit). Subscribers always allowed.';

-- =========================================================================
-- 2) Atomic invite redemption (TS-206)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.try_redeem_invite_link(_code text)
RETURNS TABLE(invite_id uuid, questions_limit int, ok boolean, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.invite_links%ROWTYPE;
BEGIN
  SELECT *
    INTO _row
  FROM public.invite_links
  WHERE code = _code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::uuid, 0, false, 'not_found';
    RETURN;
  END IF;

  IF NOT _row.is_active THEN
    RETURN QUERY SELECT _row.id, _row.questions_limit, false, 'inactive';
    RETURN;
  END IF;

  IF _row.expires_at IS NOT NULL AND _row.expires_at < now() THEN
    RETURN QUERY SELECT _row.id, _row.questions_limit, false, 'expired';
    RETURN;
  END IF;

  IF _row.max_uses IS NOT NULL AND _row.times_used >= _row.max_uses THEN
    RETURN QUERY SELECT _row.id, _row.questions_limit, false, 'maxed';
    RETURN;
  END IF;

  UPDATE public.invite_links
  SET times_used = COALESCE(times_used, 0) + 1
  WHERE id = _row.id;

  RETURN QUERY SELECT _row.id, _row.questions_limit, true, 'ok';
END;
$$;

GRANT EXECUTE ON FUNCTION public.try_redeem_invite_link(text)
  TO authenticated, service_role;

COMMENT ON FUNCTION public.try_redeem_invite_link(text) IS
  'Atomic consume of an invite_link.times_used. Prevents overshoot under
   concurrent redemptions.';

-- Rollback helper: used when a duplicate-redeem per-user is detected AFTER
-- the counter was bumped. Not exposed to the client directly.
CREATE OR REPLACE FUNCTION public.decrement_invite_usage(_invite_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.invite_links
  SET times_used = GREATEST(0, COALESCE(times_used, 0) - 1)
  WHERE id = _invite_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_invite_usage(uuid)
  TO service_role;

-- =========================================================================
-- 3) Hot-path indices (F1.17)
-- =========================================================================

-- chat_messages: most reads filter by user_id + order by created_at DESC.
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created
  ON public.chat_messages (user_id, created_at DESC);

-- Additional filter by religion/philosophy in sacred-chat fetchUserHistory.
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_religion
  ON public.chat_messages (user_id, religion, created_at DESC)
  WHERE religion IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_philosophy
  ON public.chat_messages (user_id, philosophy, created_at DESC)
  WHERE philosophy IS NOT NULL;

-- activity_history: user's timeline view.
CREATE INDEX IF NOT EXISTS idx_activity_history_user_created
  ON public.activity_history (user_id, created_at DESC);

-- user_memory: sacred-chat pulls last 4 facts per user.
CREATE INDEX IF NOT EXISTS idx_user_memory_user_created
  ON public.user_memory (user_id, created_at DESC);

-- prayer_wall_posts: public feed paginated by date.
CREATE INDEX IF NOT EXISTS idx_prayer_wall_posts_public_created
  ON public.prayer_wall_posts (is_public, created_at DESC)
  WHERE is_public = true;

-- tts_usage: per-user-per-month lookup.
CREATE INDEX IF NOT EXISTS idx_tts_usage_user_month
  ON public.tts_usage (user_id, month_key);

-- profiles: trial-ends scanning for reminder cron.
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends
  ON public.profiles (trial_ends_at)
  WHERE trial_ends_at IS NOT NULL AND NOT COALESCE(is_subscriber, false);

-- profiles: admin-scan of subscribers.
CREATE INDEX IF NOT EXISTS idx_profiles_is_subscriber
  ON public.profiles (is_subscriber)
  WHERE is_subscriber = true;

-- =========================================================================
-- ROLLBACK (uncomment to revert)
-- =========================================================================
-- DROP INDEX IF EXISTS public.idx_profiles_is_subscriber;
-- DROP INDEX IF EXISTS public.idx_profiles_trial_ends;
-- DROP INDEX IF EXISTS public.idx_tts_usage_user_month;
-- DROP INDEX IF EXISTS public.idx_prayer_wall_posts_public_created;
-- DROP INDEX IF EXISTS public.idx_user_memory_user_created;
-- DROP INDEX IF EXISTS public.idx_activity_history_user_created;
-- DROP INDEX IF EXISTS public.idx_chat_messages_user_philosophy;
-- DROP INDEX IF EXISTS public.idx_chat_messages_user_religion;
-- DROP INDEX IF EXISTS public.idx_chat_messages_user_created;
-- DROP FUNCTION IF EXISTS public.try_redeem_invite_link(text);
-- DROP FUNCTION IF EXISTS public.try_consume_question(uuid);
