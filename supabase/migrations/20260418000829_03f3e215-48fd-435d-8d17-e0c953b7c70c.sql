-- 1) Adicionar coluna para controlar o ciclo rolling de 30 dias do free
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS questions_period_start timestamp with time zone NOT NULL DEFAULT now();

-- 2) Atualizar função handle_new_user: novos cadastros recebem 20 perguntas/mês,
--    SEM trial premium de 7 dias (exceto e-mails free e admins, que mantêm acesso especial).
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
      questions_limit, questions_used, trial_ends_at, questions_period_start
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
      true, true, 999999, 0,
      (now() + interval '100 years'),
      now()
    );
  ELSE
    -- Free tier: 20 perguntas/mês com reset rolling a cada 30 dias. Sem trial.
    INSERT INTO public.profiles (
      user_id, display_name, is_subscriber,
      questions_limit, questions_used, trial_ends_at, questions_period_start
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
      false, 20, 0,
      NULL,
      now()
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- 3) Garantir trigger na criação de novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4) Função de reset rolling: zera questions_used após 30 dias do period_start
--    (será chamada pelo backend quando o usuário consumir uma pergunta).
CREATE OR REPLACE FUNCTION public.reset_questions_if_period_elapsed(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles
  SET questions_used = 0,
      questions_period_start = now()
  WHERE user_id = _user_id
    AND is_subscriber = false
    AND is_pro = false
    AND questions_period_start < (now() - interval '30 days');
END;
$function$;

-- 5) Atualizar perfis existentes que estavam no esquema antigo (12 perguntas / trial 7d)
--    para o novo padrão de 20 perguntas/mês — preservando assinantes e free_access.
UPDATE public.profiles
SET questions_limit = 20,
    trial_ends_at = NULL,
    questions_period_start = COALESCE(questions_period_start, now())
WHERE is_subscriber = false
  AND is_pro = false
  AND questions_limit < 999999;