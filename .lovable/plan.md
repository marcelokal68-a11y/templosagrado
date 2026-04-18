

## Objetivo

Duas mudanças complementares ao sistema de conhecimento (RAG):

### 1. Povoar RAG com artigos da web (admin)

Permitir que o admin cole **uma URL** (ou várias) na página `/admin/knowledge` e o sistema:
- Extrai o conteúdo principal do artigo (texto limpo, sem nav/ads/comentários) via **Firecrawl** (formato markdown).
- Cria automaticamente uma `knowledge_source` com `source_type = 'article'`, `original_url` preenchida, título extraído da página.
- Manda direto para `ingest-knowledge` (já existe — passa o texto via `inline_text`), que faz chunk + embedding + indexação.

Por que Firecrawl: já está documentado como connector recomendado, lida com JavaScript-rendered, anti-bot e devolve markdown limpo (ideal para chunking semântico). Vamos pedir ao usuário para conectar Firecrawl via Connectors antes de usar.

### 2. Educação (`/learn`) — RAG filtrado pelo tópico ativo

Hoje o `learn-chat` já passa `topic` como `filter_religion` para a busca, mas o `match_knowledge` aceita também fontes marcadas como `'general'`. **Mudar comportamento na área educacional** para mostrar **apenas** trechos cujo `religion` bate exatamente com o tópico selecionado — sem fallback para "general". O Mentor Espiritual (`/`) continua incluindo "general" (porque conversas espirituais cruzam tradições).

Implementação: adicionar parâmetro `strict_match BOOLEAN DEFAULT false` em `match_knowledge`. Quando `true`, remove a cláusula `OR ks.religion = 'general'`. O `learn-chat` chama com `strict = true`; `sacred-chat` mantém `strict = false`.

## Mudanças

### A. Frontend — `src/pages/AdminKnowledge.tsx`

- Novo modo no Tabs: **"URL (artigo web)"** ao lado de "Upload" e "Colar texto".
- Campo único de URL + botão "Buscar e processar".
- Suporte a **múltiplas URLs** (uma por linha) → cria N fontes em sequência.
- O título e o autor vêm pré-preenchidos do `metadata` retornado pelo Firecrawl, mas o admin pode editar antes de salvar.
- Validação: URL válida, http/https.
- UI: um botão "Pré-visualizar" busca o markdown e mostra os primeiros 500 chars + título detectado, antes de criar a fonte.

### B. Edge function nova — `scrape-article`

- Admin-only (mesmo padrão de `ingest-knowledge`).
- Body: `{ url: string }`.
- Chama `https://api.firecrawl.dev/v2/scrape` com `formats: ['markdown']`, `onlyMainContent: true`.
- Retorna `{ title, markdown, sourceURL, language }` para o frontend usar antes de criar a fonte.
- Erros: 402 (sem créditos) → mensagem específica; 401 → pedir reconectar Firecrawl.

### C. Edge function modificada — `ingest-knowledge`

- Já aceita `inline_text`. Sem mudança estrutural.
- Apenas: aumentar limite de `inline_text` (hoje implícito) — confirmar que aceita ~300KB de markdown sem problema (sim, payload JSON é fine).

### D. Banco — alterar `match_knowledge`

```sql
-- Recriar com novo parâmetro
CREATE OR REPLACE FUNCTION public.match_knowledge(
  query_embedding vector(768),
  match_count INT DEFAULT 5,
  filter_religion TEXT DEFAULT NULL,
  similarity_threshold FLOAT DEFAULT 0.65,
  strict_match BOOLEAN DEFAULT false
) ...
WHERE ks.status = 'ready'
  AND (
    filter_religion IS NULL
    OR ks.religion = filter_religion
    OR (NOT strict_match AND ks.religion = 'general')
  )
  ...
```

### E. Edge function — `learn-chat`

- Mudar a chamada para `retrieveRagContext(..., { strict: true })`.
- O helper `_shared/rag.ts` ganha parâmetro opcional `strict`.

### F. `_shared/rag.ts`

- Adicionar parâmetro `strict?: boolean` na função e propagar para o RPC.

## Connector / Setup

- Firecrawl precisa estar conectado (Connectors → Firecrawl). Se não estiver, mostrar instrução clara no painel admin com link "Conectar Firecrawl" e mensagem de erro amigável quando o secret não existir.
- Sem Firecrawl conectado, a aba URL fica desabilitada com tooltip "Conecte Firecrawl em Conectores".

## Fora de escopo (fase 2)

- Crawl recursivo (pegar todas as páginas de um domínio).
- Atualização periódica automática de artigos já ingeridos.
- Detecção de duplicados (mesmo URL).

