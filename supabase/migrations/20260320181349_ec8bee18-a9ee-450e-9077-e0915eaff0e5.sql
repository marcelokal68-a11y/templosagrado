-- Add Mercado Pago subscription columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_pro boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mp_subscription_id text;

-- Create a trigger function to protect subscription fields from client-side updates
CREATE OR REPLACE FUNCTION public.protect_subscription_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If the caller is NOT service_role, revert subscription fields to old values
  IF current_setting('request.jwt.claims', true)::jsonb ->> 'role' != 'service_role' THEN
    NEW.is_pro := OLD.is_pro;
    NEW.mp_subscription_id := OLD.mp_subscription_id;
    NEW.is_subscriber := OLD.is_subscriber;
    NEW.subscription_id := OLD.subscription_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_subscription_fields_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_subscription_fields();