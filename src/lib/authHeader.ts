import { supabase } from '@/integrations/supabase/client';

const FALLBACK_PUBLISHABLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqaXltdGtyZXN5bmxqd2NraHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MzEzMDMsImV4cCI6MjA4NzEwNzMwM30.fKGUmOUK5XU1TnuFzSRPNIJQypxBzayekcsMXZhqVMw';
const PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) || FALLBACK_PUBLISHABLE_KEY;

/**
 * Returns headers suitable for calling a Supabase Edge Function.
 *
 * Rules:
 *  - If we have a real, non-expired user session, send the user's access token
 *    so the function can identify the user.
 *  - Otherwise (guest, signed-out, or expired/invalid session), send the
 *    publishable (anon) key. This guarantees the gateway sees a valid token
 *    and the function can treat the request as a guest instead of returning
 *    "invalid claim: missing sub claim" 403s.
 *
 * The `apikey` header is always the publishable key — never a user JWT — to
 * avoid PostgREST treating the key as the project anon key.
 */
export async function getEdgeAuthHeaders(
  extra: Record<string, string> = {}
): Promise<Record<string, string>> {
  let token = PUBLISHABLE_KEY;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const stillValid = expiresAt === 0 || expiresAt - Date.now() > 5_000;
      if (stillValid) token = session.access_token;
    }
  } catch {
    // fall through with publishable key
  }
  return {
    'Content-Type': 'application/json',
    apikey: PUBLISHABLE_KEY,
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

/** True when there is a logged-in, non-expired session. */
export async function hasLiveSession(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return false;
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    return expiresAt === 0 || expiresAt - Date.now() > 5_000;
  } catch {
    return false;
  }
}
