// Shared RAG helpers used by sacred-chat and learn-chat.
// Embeds the user's last query via Lovable AI Gateway and pulls top-N
// matching knowledge chunks from the public.match_knowledge() function.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export type RagChunk = {
  chunk_id: string;
  source_id: string;
  content: string;
  similarity: number;
  source_title: string;
  source_author: string | null;
  source_religion: string | null;
};

export type RagResult = {
  chunks: RagChunk[];
  sources: Array<{ id: string; title: string; author: string | null }>;
  promptSection: string;
};

const EMBED_MODEL = "google/text-embedding-004";

export async function embedQuery(query: string, apiKey: string): Promise<number[] | null> {
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: EMBED_MODEL,
        input: query.slice(0, 4000),
      }),
    });
    if (!resp.ok) {
      console.error("Embedding error", resp.status, await resp.text().catch(() => ""));
      return null;
    }
    const json = await resp.json();
    return json.data?.[0]?.embedding ?? null;
  } catch (e) {
    console.error("Embedding exception", e);
    return null;
  }
}

export async function retrieveRagContext(
  userQuery: string,
  filterReligion: string | null,
  apiKey: string,
  matchCount = 5,
  options: { strict?: boolean } = {},
): Promise<RagResult> {
  const empty: RagResult = { chunks: [], sources: [], promptSection: "" };
  if (!userQuery || userQuery.trim().length < 4) return empty;

  const embedding = await embedQuery(userQuery, apiKey);
  if (!embedding) return empty;

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(url, key);

    const { data, error } = await sb.rpc("match_knowledge", {
      query_embedding: embedding as unknown as string,
      match_count: matchCount,
      filter_religion: filterReligion || null,
      similarity_threshold: 0.65,
      strict_match: options.strict === true,
    });

    if (error) {
      console.error("match_knowledge error", error);
      return empty;
    }
    const chunks = (data as RagChunk[]) || [];
    if (chunks.length === 0) return empty;

    const seen = new Set<string>();
    const sources: RagResult["sources"] = [];
    chunks.forEach((c) => {
      if (!seen.has(c.source_id)) {
        seen.add(c.source_id);
        sources.push({ id: c.source_id, title: c.source_title, author: c.source_author });
      }
    });

    const numbered = chunks
      .map((c, i) => {
        const ref = `[${i + 1}] ${c.source_title}${c.source_author ? ` — ${c.source_author}` : ""}`;
        return `${ref}\n"${c.content.trim().slice(0, 900)}"`;
      })
      .join("\n\n");

    const promptSection = `\n### FONTES DA BIBLIOTECA (use APENAS quando relevante; cite com [n] no texto):
${numbered}

REGRA DE CITAÇÃO: Se você usar informação dos trechos acima, cite naturalmente com [1], [2] etc. logo após a frase. Se nenhum trecho for útil, ignore esta seção e responda normalmente sem inventar citações.\n`;

    return { chunks, sources, promptSection };
  } catch (e) {
    console.error("retrieveRagContext exception", e);
    return empty;
  }
}
