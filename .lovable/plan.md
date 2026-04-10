

## Security Fixes

Two warnings to resolve:

### 1. Enable Leaked Password Protection (HIBP)
Use the `configure_auth` tool to enable `password_hibp_enabled: true`. This checks new passwords against the Have I Been Pwned database during signup and password changes.

### 2. Fix Overly Permissive RLS Policy on `prayers` Table
The policy **"Anyone can insert prayers"** uses `WITH CHECK (true)`, allowing even unauthenticated users to insert rows. Since `prayers.user_id` is nullable, this is a real risk.

**Fix:** Replace with a scoped policy that requires authentication:

```sql
DROP POLICY "Anyone can insert prayers" ON public.prayers;
CREATE POLICY "Authenticated users can insert prayers"
  ON public.prayers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
```

This allows authenticated users to insert prayers (either tied to their account or anonymous with null user_id), while blocking unauthenticated access entirely.

**Note:** The `service_role` policy on `user_memory` with `USING (true)` is intentional — it only applies to the `service_role` role used by edge functions, not public users.

### Files/Tools
- `configure_auth` tool — enable HIBP
- Database migration — fix prayers RLS policy

