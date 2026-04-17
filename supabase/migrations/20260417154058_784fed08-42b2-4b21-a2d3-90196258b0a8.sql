CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_free_user BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.free_access_emails
    WHERE lower(email) = lower(NEW.email)
  ) INTO is_free_user;

  IF is_free_user THEN
    INSERT INTO public.profiles (
      user_id, display_name, is_subscriber, is_pro,
      questions_limit, questions_used, trial_ends_at
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
      true, true, 999999, 0,
      (now() + interval '100 years')
    );
  ELSE
    -- Trial automático de 7 dias para novos usuários
    INSERT INTO public.profiles (
      user_id, display_name, is_subscriber,
      questions_limit, questions_used, trial_ends_at
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
      false, 60, 0,
      (now() + interval '7 days')
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Garante que o trigger existe (caso tenha sido perdido)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();