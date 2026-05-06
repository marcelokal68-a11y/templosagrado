// Shared streaming helper for the Lovable AI Gateway.
//
// Centralizes:
//  - POST to https://ai.gateway.lovable.dev/v1/chat/completions with stream=true
//  - 429 / 402 / generic error mapping to JSON Response with CORS
//  - Optional SSE prefix injecting `{"__sources": [...]}` so the front-end can
//    render citation chips before the first token arrives.
//
// Personas, prompts and quota logic stay in the calling function — this helper
// only owns the network + stream plumbing.

import { corsHeadersFor } from "./cors.ts";

export type ChatMessage = { role: string; content: string };

export interface StreamFromGatewayOptions {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  /** Optional citation sources injected as the first SSE event. */
  sources?: Array<{ id: string; title: string; author: string | null }>;
  maxTokens?: number;
  req: Request;
}

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

function jsonError(req: Request, status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeadersFor(req), "Content-Type": "application/json" },
  });
}

export async function streamFromGateway(opts: StreamFromGatewayOptions): Promise<Response> {
  const { apiKey, model, messages, sources = [], maxTokens, req } = opts;

  const upstream = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      ...(maxTokens ? { max_tokens: maxTokens } : {}),
    }),
  });

  if (!upstream.ok) {
    if (upstream.status === 429) return jsonError(req, 429, { error: "Rate limit exceeded" });
    if (upstream.status === 402) return jsonError(req, 402, { error: "Payment required" });
    const t = await upstream.text().catch(() => "");
    console.error("AI gateway error:", upstream.status, t);
    return jsonError(req, 500, { error: "AI gateway error" });
  }

  const corsHeaders = corsHeadersFor(req);

  // No sources to inject → pass the upstream body through unchanged.
  if (sources.length === 0) {
    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  }

  // Prepend a synthetic SSE event carrying the sources, then forward the rest.
  const encoder = new TextEncoder();
  const sourcesPayload = `data: ${JSON.stringify({ __sources: sources })}\n\n`;
  const upstreamBody = upstream.body!;

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(sourcesPayload));
      const reader = upstreamBody.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        controller.enqueue(value);
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}
