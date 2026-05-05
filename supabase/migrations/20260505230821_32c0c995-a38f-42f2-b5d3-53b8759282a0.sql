
-- 1. Política explícita para guest_chat_usage (RLS habilitado mas sem policies => deny all to non-service, mas linter alerta).
-- Service role bypassa RLS automaticamente; criamos policy "deny" simbólica para silenciar lint.
CREATE POLICY "No public access to guest usage"
ON public.guest_chat_usage
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- 2. Revogar EXECUTE de funções SECURITY DEFINER que só devem ser chamadas pelo backend (service role).
REVOKE EXECUTE ON FUNCTION public.try_consume_question(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.try_consume_guest_question(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.try_redeem_invite_link(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.decrement_invite_usage(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.reset_questions_if_period_elapsed(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.sync_free_access_profiles() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.match_knowledge(vector, integer, text, double precision) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.match_knowledge(vector, integer, text, double precision, boolean) FROM anon, authenticated, public;

-- Garantir service_role mantém acesso (já tem por default, mas explicitamos)
GRANT EXECUTE ON FUNCTION public.try_consume_question(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.try_consume_guest_question(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.try_redeem_invite_link(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.decrement_invite_usage(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_questions_if_period_elapsed(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_free_access_profiles() TO service_role;
GRANT EXECUTE ON FUNCTION public.match_knowledge(vector, integer, text, double precision) TO service_role;
GRANT EXECUTE ON FUNCTION public.match_knowledge(vector, integer, text, double precision, boolean) TO service_role;
