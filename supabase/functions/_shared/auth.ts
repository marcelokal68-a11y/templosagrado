// Shared auth helpers for Edge Functions.
//
// IMPORTANT: most functions in config.toml have verify_jwt=false. That means
// Supabase does NOT reject unsigned requests — EACH function MUST call
// requireUser() before doing anything that costs money, exposes data, or
// mutates state. Do not decode JWTs manually; use this helper so the
// signature is always verified.

import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { json } from "./cors.ts";

export interface AuthedUser {
  id: string;
  email: string | null;
}

export async function requireUser(req: Request): Promise<
  | { user: AuthedUser; token: string }
  | { error: Response }
> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: json({ error: "unauthorized" }, req, { status: 401 }),
    };
  }
  const token = authHeader.slice("Bearer ".length);
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const sb = createClient(url, anonKey);
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user) {
    return {
      error: json({ error: "unauthorized" }, req, { status: 401 }),
    };
  }
  return {
    user: { id: data.user.id, email: data.user.email ?? null },
    token,
  };
}

export async function requireAdmin(
  req: Request,
): Promise<
  | { user: AuthedUser; token: string; service: ReturnType<typeof createClient> }
  | { error: Response }
> {
  const auth = await requireUser(req);
  if ("error" in auth) return auth;

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const service = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
  const { data: roles } = await service
    .from("user_roles")
    .select("role")
    .eq("user_id", auth.user.id)
    .eq("role", "admin");
  if (!roles || roles.length === 0) {
    return { error: json({ error: "forbidden" }, req, { status: 403 }) };
  }
  return { user: auth.user, token: auth.token, service };
}

/**
 * Server-to-server call gate (cron, webhooks, admin scripts).
 * Requires header x-cron-secret == env CRON_SECRET.
 * Configure CRON_SECRET in Supabase secrets before enabling cron schedule.
 */
export function requireCronSecret(req: Request): Response | null {
  const expected = Deno.env.get("CRON_SECRET");
  const got = req.headers.get("x-cron-secret");
  if (!expected) {
    return json(
      { error: "cron_secret_not_configured" },
      req,
      { status: 500 },
    );
  }
  if (got !== expected) {
    return json({ error: "forbidden" }, req, { status: 403 });
  }
  return null;
}
