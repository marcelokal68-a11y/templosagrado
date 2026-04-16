-- Lista de emails com acesso livre permanente (nunca cobrar)
CREATE TABLE IF NOT EXISTS public.free_access_emails (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT
);

ALTER TABLE public.free_access_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage free access emails" ON public.free_access_emails;
CREATE POLICY "Admins can manage free access emails"
ON public.free_access_emails
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Inserir o email solicitado
INSERT INTO public.free_access_emails (email, note)
VALUES ('rabinogoldman@gmail.com', 'Acesso livre permanente — autorizado pelo admin')
ON CONFLICT (email) DO NOTHING;

-- Atualizar a função handle_new_user para aplicar acesso livre automaticamente
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
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  END IF;

  RETURN NEW;
END;
$function$;

-- Garantir que o trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para promover usuários já existentes que estão na lista free
CREATE OR REPLACE FUNCTION public.sync_free_access_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles p
  SET is_subscriber = true,
      is_pro = true,
      questions_limit = 999999,
      trial_ends_at = (now() + interval '100 years')
  FROM auth.users u, public.free_access_emails f
  WHERE p.user_id = u.id
    AND lower(u.email) = lower(f.email);
END;
$$;

-- Sincronizar agora (caso o usuário já exista)
SELECT public.sync_free_access_profiles();