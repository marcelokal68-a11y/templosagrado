REVOKE EXECUTE ON FUNCTION public.try_consume_guest_question(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.try_consume_guest_question(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.try_consume_guest_question(text) FROM authenticated;