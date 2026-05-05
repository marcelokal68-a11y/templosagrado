CREATE TABLE IF NOT EXISTS public.guest_chat_usage (
  anon_id text PRIMARY KEY,
  questions_used integer NOT NULL DEFAULT 0,
  questions_limit integer NOT NULL DEFAULT 5,
  period_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guest_chat_usage ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.try_consume_guest_question(_anon_id text)
RETURNS TABLE(allowed boolean, remaining integer, quota_limit integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.guest_chat_usage%ROWTYPE;
  _clean_id text;
BEGIN
  _clean_id := left(regexp_replace(coalesce(_anon_id, ''), '[^a-zA-Z0-9_-]', '', 'g'), 80);

  IF length(_clean_id) < 12 THEN
    RETURN QUERY SELECT false, 0, 0;
    RETURN;
  END IF;

  INSERT INTO public.guest_chat_usage (anon_id)
  VALUES (_clean_id)
  ON CONFLICT (anon_id) DO NOTHING;

  SELECT * INTO _row
  FROM public.guest_chat_usage
  WHERE anon_id = _clean_id
  FOR UPDATE;

  IF _row.period_start < (now() - interval '30 days') THEN
    UPDATE public.guest_chat_usage
    SET questions_used = 0,
        period_start = now(),
        updated_at = now()
    WHERE anon_id = _clean_id;
    _row.questions_used := 0;
  END IF;

  IF COALESCE(_row.questions_used, 0) >= COALESCE(_row.questions_limit, 0) THEN
    RETURN QUERY SELECT false, 0, _row.questions_limit;
    RETURN;
  END IF;

  UPDATE public.guest_chat_usage
  SET questions_used = questions_used + 1,
      updated_at = now()
  WHERE anon_id = _clean_id;

  RETURN QUERY SELECT true, _row.questions_limit - (_row.questions_used + 1), _row.questions_limit;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_guest_chat_usage_period_start ON public.guest_chat_usage (period_start);