
-- 1. Update protect_subscription_fields to also cover questions_limit, questions_used, trial_ends_at
CREATE OR REPLACE FUNCTION public.protect_subscription_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF current_setting('request.jwt.claims', true)::jsonb ->> 'role' != 'service_role' THEN
    NEW.is_pro := OLD.is_pro;
    NEW.mp_subscription_id := OLD.mp_subscription_id;
    NEW.is_subscriber := OLD.is_subscriber;
    NEW.subscription_id := OLD.subscription_id;
    NEW.questions_limit := OLD.questions_limit;
    NEW.questions_used := OLD.questions_used;
    NEW.trial_ends_at := OLD.trial_ends_at;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Create the trigger (drop first in case it exists)
DROP TRIGGER IF EXISTS protect_subscription_fields_trigger ON public.profiles;
CREATE TRIGGER protect_subscription_fields_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_subscription_fields();

-- 3. Remove permissive invite_links INSERT policy for regular users
DROP POLICY IF EXISTS "Users can create own invite links" ON public.invite_links;
