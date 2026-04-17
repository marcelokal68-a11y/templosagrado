INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
WHERE lower(u.email) = 'gustavonobre5387@gmail.com'
ON CONFLICT DO NOTHING;