

## Objetivo

Criar um sistema RAG (Retrieval-Augmented Generation) onde o admin pode alimentar a base de conhecimento com livros, artigos e textos sobre os temas do app (8 tradições religiosas/filosóficas). O conteúdo é processado em chunks com embeddings vetoriais e usado automaticamente pelos chats (`sacred-chat` e `learn-chat`) para enriquecer respostas com fontes confiáveis — transformando o app em uma enciclopédia mundial multi-religiosa.

## Arquitetura

```text
Admin Upload (PDF/TXT/URL) 
    ↓
[ingest-knowledge edge fn] → extrai texto → chunks ~800 tokens
    ↓
[Lovable AI Gateway] → gera embeddings (google/text-embedding-004)
    ↓
[knowledge_chunks table] ← pgvector
    ↓
Chat user envia mensagem
    ↓
[sacred-chat / learn-chat] → embed query → match_knowledge() top 5
    ↓
Injeta trechos no system prompt → IA responde com fontes citadas
```

## Mudanças

### 1. Banco de dados (migração)

- Habilitar extensão `vector` (pgvector).
- **`knowledge_sources`**: livros/artigos cadastrados (id, title, author, source_type, religion/topic, language, original_url, file_path, status, created_by, created_at).
- **`knowledge_chunks`**: pedaços indexados (id, source_id, chunk_index, content, embedding vector(768), token_count, metadata).
- Função `match_knowledge(query_embedding, match_count, filter_religion)` retorna top-N chunks por similaridade cosseno + filtro opcional por tradição.
- RLS: admins gerenciam tudo; usuários autenticados só leem (necessário para edge functions com user JWT, mas chats usarão service role).
- Bucket Storage `knowledge-files` (privado) para armazenar PDFs/TXT originais.

### 2. Edge Functions

- **`ingest-knowledge`** (nova, admin-only):
  - Recebe `source_id` + `file_path` (ou `text` direto, ou `url`).
  - Baixa arquivo do Storage → extrai texto (PDF via `pdf-parse` ou texto puro).
  - Quebra em chunks de ~800 tokens com overlap de 100.
  - Chama Lovable AI Gateway (`google/text-embedding-004`) em lotes.
  - Insere em `knowledge_chunks`. Atualiza `status` da fonte (`processing` → `ready`/`failed`).
- **`search-knowledge`** (nova, interna): embed query → chama `match_knowledge()` → retorna chunks + metadata.
- **`sacred-chat`** e **`learn-chat`** (modificadas):
  - Antes de chamar a IA, fazem busca semântica com a última mensagem do usuário (filtrada por `religion`/topic ativo).
  - Se houver chunks relevantes (similaridade > 0.7), injetam no system prompt como `### Fontes da biblioteca:\n[trecho 1 — Livro X, autor Y]\n...` com instrução para citar quando usar.

### 3. Frontend Admin

- **`src/pages/AdminKnowledge.tsx`** (nova rota `/admin/knowledge`):
  - Lista de fontes cadastradas com status (pending/processing/ready/failed) e contador de chunks.
  - Formulário "Adicionar fonte": título, autor, tipo (livro/artigo/escritura), tradição (dropdown 8 tradições + "geral"), idioma, e três modos de input:
    1. Upload de PDF/TXT.
    2. Colar URL (artigo web — futuro, fase 2).
    3. Colar texto direto.
  - Botão "Reprocessar" e "Excluir" por fonte.
  - Indicador de progresso durante ingestão.
- **`src/pages/Admin.tsx`**: adicionar card/link para `/admin/knowledge`.
- **`src/App.tsx`**: registrar rota `/admin/knowledge` protegida.

### 4. UX no chat (citações)

- Quando a resposta da IA usar conteúdo da biblioteca, ela inclui marcações tipo `[1]`, `[2]` no texto.
- Ao final da bolha do assistente, renderizar uma seção pequena "📚 Fontes" com título + autor dos livros referenciados (sem links externos).
- Detalhes técnicos: `sacred-chat` retorna `sources: [{id, title, author}]` no JSON; `ChatArea` armazena no `messages` e renderiza.

## Detalhes técnicos

- **Modelo de embedding**: `google/text-embedding-004` via Lovable AI Gateway (768 dims, gratuito durante promo).
- **Chunking**: divisão por parágrafo respeitando limite de tokens (estimativa: ~3 chars/token); overlap de 100 tokens evita perda de contexto entre chunks.
- **Limite por upload**: 10 MB / arquivo (config edge function); livros maiores devem ser divididos em volumes pelo admin.
- **PDF parsing**: usar `npm:pdfjs-dist` no Deno (compatível com edge functions) ou pedir ao admin para colar texto se PDF for digitalizado/imagem (fase 1 não inclui OCR).
- **Custo**: embeddings são baratos; cada livro de ~300 páginas gera ~600 chunks (uma única vez).
- **Idioma**: chunks armazenam o texto original; busca semântica funciona cross-language com `text-embedding-004`.
- **Privacidade**: bucket `knowledge-files` privado; apenas admin pode ler arquivos originais; chunks são lidos por edge functions via service role.

## Exemplo de fluxo (livro do exemplo)

1. Admin acessa `/admin/knowledge` → "Adicionar fonte".
2. Preenche: título "Antissemitismo Estrutural", autor "Gustavo Binenbojm", tipo "livro", tradição "judaism", idioma "pt-BR".
3. Faz upload do PDF → arquivo vai pro bucket → `ingest-knowledge` é disparada.
4. Status muda para `processing` → após ~30-60s vira `ready` com N chunks indexados.
5. Usuário no `/learn` em "Judaísmo" pergunta "o que é antissemitismo estrutural?" → `learn-chat` busca chunks → injeta trechos → IA responde citando o livro → bolha mostra "📚 Fontes: Antissemitismo Estrutural — Gustavo Binenbojm".

## Fora de escopo (fase 2, se quiser depois)

- OCR para PDFs escaneados.
- Crawl/ingestão de URLs de artigos web.
- Reranking com modelo dedicado.
- Painel de analytics de quais fontes mais aparecem nas respostas.
- Permitir que usuários sugiram fontes (com aprovação admin).

