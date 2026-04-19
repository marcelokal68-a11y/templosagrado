// Shared CORS configuration for all Edge Functions.
//
// In production, restrict to known origins. During the transition we keep "*"
// as a fallback behind CORS_ALLOW_ALL=1 so we don't break in-flight clients.
// Once the client is guaranteed to send from an allowlisted origin only,
// flip CORS_ALLOW_ALL off in production and remove the fallback branch.

const ALLOWED_ORIGINS = new Set([
  "https://templosagrado.lovable.app",
  "https://templosagrado.com.br",
  "https://www.templosagrado.com.br",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://127.0.0.1:8080",
]);

const ALLOWED_HEADERS =
  "authorization, x-client-info, apikey, content-type, " +
  "x-supabase-client-platform, x-supabase-client-platform-version, " +
  "x-supabase-client-runtime, x-supabase-client-runtime-version, " +
  "idempotency-key";

export function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  const allowAll = Deno.env.get("CORS_ALLOW_ALL") === "1";
  const allowOrigin = ALLOWED_ORIGINS.has(origin)
    ? origin
    : allowAll
      ? "*"
      : "null";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function preflight(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;
  return new Response(null, { headers: corsHeadersFor(req) });
}

export function json<T>(
  body: T,
  req: Request,
  init: ResponseInit = {},
): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...corsHeadersFor(req),
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}
