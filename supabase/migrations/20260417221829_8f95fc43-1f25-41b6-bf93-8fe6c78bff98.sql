-- Tabela para contar uso mensal de narrações TTS por usuário
CREATE TABLE public.tts_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month_key TEXT NOT NULL, -- formato 'YYYY-MM'
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, month_key)
);

CREATE INDEX idx_tts_usage_user_month ON public.tts_usage(user_id, month_key);

ALTER TABLE public.tts_usage ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seu próprio uso
CREATE POLICY "Users can view their own tts usage"
ON public.tts_usage
FOR SELECT
USING (auth.uid() = user_id);

-- Service role gerencia inserts/updates (edge function usa service role)
CREATE POLICY "Service role manages tts usage"
ON public.tts_usage
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_tts_usage_updated_at
BEFORE UPDATE ON public.tts_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();