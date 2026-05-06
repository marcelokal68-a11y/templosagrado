// Admin-only endpoint to ingest a knowledge source.
// Flow: receive { source_id }. Fetch source row. Get text from
// either file_path (storage) or `text` field passed inline. Chunk it,
// embed each chunk via Lovable AI Gateway, insert into knowledge_chunks.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeadersFor } from "../_shared/cors.ts";

const EMBED_MODEL = "google/text-embedding-004";
const CHUNK_CHAR_TARGET = 2400; // ~800 tokens
const CHUNK_CHAR_OVERLAP = 300;

function chunkText(text: string): string[] {
  const clean = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (clean.length <= CHUNK_CHAR_TARGET) return clean ? [clean] : [];

  const paragraphs = clean.split(/\n\n+/);
  const chunks: string[] = [];
  let buf = "";

  for (const p of paragraphs) {
    if ((buf + "\n\n" + p).length <= CHUNK_CHAR_TARGET) {
      buf = buf ? buf + "\n\n" + p : p;
    } else {
      if (buf) chunks.push(buf);
      // If single paragraph is larger than target, hard-split it.
      if (p.length > CHUNK_CHAR_TARGET) {
        let i = 0;
        while (i < p.length) {
          chunks.push(p.slice(i, i + CHUNK_CHAR_TARGET));
          i += CHUNK_CHAR_TARGET - CHUNK_CHAR_OVERLAP;
        }
        buf = "";
      } else {
        buf = p;
      }
    }
  }
  if (buf) chunks.push(buf);

  // Add overlap between sequential chunks
  const withOverlap: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    if (i === 0) withOverlap.push(chunks[i]);
    else {
      const prevTail = chunks[i - 1].slice(-CHUNK_CHAR_OVERLAP);
      withOverlap.push(prevTail + "\n\n" + chunks[i]);
    }
  }
  return withOverlap;
}

async function embedBatch(texts: string[], apiKey: string): Promise<number[][]> {
  // Lovable AI Gateway embeddings — one call per text (gateway currently single-input safest)
  const results: number[][] = [];
  for (const text of texts) {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: EMBED_MODEL, input: text.slice(0, 8000) }),
    });
    if (!resp.ok) {
      const errTxt = await resp.text().catch(() => "");
      throw new Error(`Embedding failed ${resp.status}: ${errTxt.slice(0, 200)}`);
    }
    const json = await resp.json();
    const emb = json.data?.[0]?.embedding;
    if (!emb) throw new Error("Embedding response missing data");
    results.push(emb);
  }
  return results;
}

async function extractTextFromFile(buffer: ArrayBuffer, fileName: string): Promise<string> {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".txt") || lower.endsWith(".md")) {
    return new TextDecoder("utf-8").decode(buffer);
  }
  if (lower.endsWith(".pdf")) {
    // Use unpdf — pure ESM, works in Deno Edge runtime, no native deps.
    const { extractText, getDocumentProxy } = await import("https://esm.sh/unpdf@0.12.1");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return Array.isArray(text) ? text.join("\n\n") : String(text);
  }
  throw new Error(`Unsupported file type: ${fileName}`);
}

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Validate caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userResp } = await userClient.auth.getUser();
    const user = userResp?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sb = createClient(supabaseUrl, serviceKey);
    const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", user.id);
    const isAdmin = roles?.some((r: any) => r.role === "admin") ?? false;
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { source_id, inline_text } = body || {};
    if (!source_id) {
      return new Response(JSON.stringify({ error: "source_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark as processing
    await sb.from("knowledge_sources").update({
      status: "processing",
      error_message: null,
    }).eq("id", source_id);

    // Wipe old chunks for re-ingest
    await sb.from("knowledge_chunks").delete().eq("source_id", source_id);

    try {
      const { data: source } = await sb
        .from("knowledge_sources")
        .select("id, title, file_path")
        .eq("id", source_id)
        .maybeSingle();
      if (!source) throw new Error("source not found");

      let rawText = "";
      if (inline_text && typeof inline_text === "string" && inline_text.trim().length > 50) {
        rawText = inline_text;
      } else if (source.file_path) {
        const { data: file, error: dlErr } = await sb.storage
          .from("knowledge-files")
          .download(source.file_path);
        if (dlErr || !file) throw new Error(`download failed: ${dlErr?.message}`);
        const buf = await file.arrayBuffer();
        rawText = await extractTextFromFile(buf, source.file_path);
      } else {
        throw new Error("no source content (file_path or inline_text required)");
      }

      const chunks = chunkText(rawText);
      if (chunks.length === 0) throw new Error("no chunks produced (empty text)");
      console.log(`Ingesting ${chunks.length} chunks for source ${source_id}`);

      // Embed in batches of 10 to limit memory
      const BATCH = 10;
      let inserted = 0;
      for (let i = 0; i < chunks.length; i += BATCH) {
        const batch = chunks.slice(i, i + BATCH);
        const embeddings = await embedBatch(batch, LOVABLE_API_KEY);
        const rows = batch.map((content, idx) => ({
          source_id,
          chunk_index: i + idx,
          content,
          embedding: embeddings[idx] as unknown as string,
          token_count: Math.ceil(content.length / 3),
          metadata: {},
        }));
        const { error: insErr } = await sb.from("knowledge_chunks").insert(rows);
        if (insErr) throw new Error(`insert chunks: ${insErr.message}`);
        inserted += rows.length;
      }

      await sb.from("knowledge_sources").update({
        status: "ready",
        chunk_count: inserted,
      }).eq("id", source_id);

      return new Response(JSON.stringify({ ok: true, chunks: inserted }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (procErr) {
      const msg = procErr instanceof Error ? procErr.message : "unknown error";
      console.error("Processing error:", msg);
      await sb.from("knowledge_sources").update({
        status: "failed",
        error_message: msg.slice(0, 500),
      }).eq("id", source_id);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("ingest-knowledge top error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
