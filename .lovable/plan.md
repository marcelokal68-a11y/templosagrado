
# Relatório — arquitetura, duplicidades e conflitos

## 1. Causa raiz da tela em branco (já corrigida na turn anterior)

`src/integrations/supabase/client.ts` chamava `createClient(SUPABASE_URL, KEY)` no top-level. No bundle de produção `import.meta.env.VITE_SUPABASE_URL` veio `undefined` → `Error: supabaseUrl is required` → árvore React não monta → tela 100% branca em `templosagrado.lovable.app`. Adicionei fallback hardcoded (chaves anon — públicas) em `client.ts` e `lib/authHeader.ts`. **Requer Publish/Update para corrigir produção.**

## 2. Duplicidades e conflitos encontrados

### A. Edge functions de chat sobrepostas
- `sacred-chat` — chat principal do Mentor (usado por `ChatArea` e `PublishToMural`)
- `learn-chat` — chat de Estudo (usado por `Learn`)

Ambas: importam `_shared/rag.ts`, definem `corsHeaders` inline (duplicado), repetem listas TOPIC_NAMES e SACRED_TEXTS, repetem prompt-engineering. **NÃO é redundância pura** (têm prompts/personas diferentes), mas ~60% do código é repetido.

### B. CORS duplicado em 22/23 edge functions
Existe `supabase/functions/_shared/cors.ts` com `corsHeadersFor`/`preflight`/`json`, mas só **1** função o usa. As outras 22 redefinem `corsHeaders` inline com `Access-Control-Allow-Origin: *` — inconsistente com o shared e com a política de allowlist do projeto.

### C. Quota de convidados (guest_chat_usage)
- Tabela criada com RLS `ALL → false` (correto: só `service_role` acessa via RPC).
- Função `try_consume_guest_question` está com `SECURITY DEFINER` mas **3 migrations consecutivas** ajustaram permissões (revoke/grant). Hoje só `service_role` executa — ok.
- Edge function `sacred-chat` chama via `supabase.rpc(...)` com service-role client — ok.
- Sem problema funcional, apenas histórico ruidoso de migrations.

### D. Acoplamento entre tabelas chat_messages × chat_sessions × activity_history
- `chat_messages` armazena cada mensagem do chat principal.
- `chat_sessions` agrupa por afiliação (foi adicionada para "continuidade IA").
- `activity_history` recebe entradas duplicadas de chat (vide `ChatArea.tsx:651`, `776`) **além** de Verse, Practice, Prayers.
  - Isso significa que conversas aparecem **duas vezes** em queries de histórico se alguém juntar as fontes.
- Ao "limpar tudo" (`ChatArea.tsx:1356-1358`) deleta de 3 tabelas distintas — manter a redundância dobra trabalho e aumenta superfície de inconsistência.

### E. Componentes muito grandes (alto risco de regressão)
- `ChatArea.tsx`: **1420 linhas** — concentra: chat, streaming SSE, LGPD gate, TTS, STT, sumário, exclusão, modais de upgrade, banner de exploração, sugestões, modo confessional, persistência. Já causou os warnings de `forwardRef` recentes e o bug de stream parser.
- `ContextPanel.tsx`: **595 linhas** — playlists Spotify, lista de tradições, mapeamento de tópicos, dialogs de troca de fé. **Ainda emite warning de forwardRef** (`ContextPanel` não é forwardRef, mas Index passa um `ref` para `ChatArea` via Index, e algum filho intermediário recebe ref indevida).

### F. AI model mismatch
- Memória do projeto diz: chat = Gemini 2.5 Flash, análise = Gemini 2.5 Pro.
- `sacred-chat` hoje usa modelo conforme env/header — não validei se está coerente. Vou conferir e alinhar se divergir.

### G. Tipos Supabase tocados manualmente (`types.ts`)
Foi editado direto por um turn anterior — esse arquivo é auto-gerado e qualquer migration nova vai sobrescrever as edições. Risco baixo agora (não trava build), mas precisa ser revertido para regeneração natural.

### H. `index.html` ainda tem `theme_color #c68a2e` e PWA `background_color #0c0a09` (escuro), mas o design atual é "Clean Light". O fundo escuro do PWA splash conflita com o tema.

## 3. Plano de correções críticas (ordem)

### Passo 1 — Garantir que produção volte a renderizar
Já feito na turn anterior (fallbacks no client). Você precisa apenas clicar **Publish → Update** para ir ao ar.

### Passo 2 — Eliminar warnings de ref e estabilizar UI
- Auditar `ContextPanel.tsx` — encontrar onde um filho recebe `ref` sem `forwardRef` e converter (ou remover o ref).
- Confirmar que `ChatArea`, `MessageBubble` e `DivineIcon` (já em forwardRef) estão consistentes.

### Passo 3 — Consolidar CORS nas edge functions
- Migrar todas as 22 funções inline para `corsHeadersFor(req)` / `preflight(req)` / `json()` do `_shared/cors.ts`.
- Remove ~22 blocos duplicados de CORS, alinha com a allowlist de origens.
- Sem mudanças de comportamento para o usuário.

### Passo 4 — Parar de duplicar conversas em activity_history
- `ChatArea` deixa de inserir em `activity_history` quando o conteúdo já vai para `chat_messages`. Histórico do chat é lido de `chat_messages` (já é).
- `activity_history` continua para Verse, Practice, Prayers, Journey (entradas que NÃO ficam em outras tabelas).
- "Limpar tudo" deleta apenas `chat_messages` + `user_memory` + entradas de `activity_history` que NÃO sejam type='chat'.

### Passo 5 — Reverter edição manual em `types.ts`
Restaurar o arquivo no estado pré-edição (será regenerado pelo Supabase).

### Passo 6 — Pequenos ajustes
- Alinhar `manifest.background_color` para a paleta clara (ou manter escuro intencionalmente — confirmar).
- Confirmar modelo Gemini de `sacred-chat` bate com a regra do projeto.

### Fora do escopo desta rodada (proposta para depois)
- Refatorar `ChatArea` em sub-componentes (LgpdGate, ChatStream, ChatComposer, ChatActions). Reduz de 1420 para ~400 + 4 arquivos de ~200.
- Extrair lógica comum de `sacred-chat` e `learn-chat` em `_shared/promptBuilder.ts` + `_shared/sacredTexts.ts`.

## 4. O que vou EVITAR fazer agora
- Não vou deletar tabelas, edge functions ou alterar RLS de tabelas com dados.
- Não vou tocar em fluxo de pagamento/Stripe/auth.
- Não vou refatorar `ChatArea`/`ContextPanel` em larga escala — apenas corrigir o ref warning específico.

## 5. Riscos
- **Passo 4** muda histórico exibido: usuários que esperavam ver chat em `/journey` (activity_history) podem perceber se a página agregava as duas fontes. Vou verificar `Journey.tsx` antes de mudar.
- **Passo 3** muda CORS: se algum domínio não-listado consumia as funções, vai começar a receber bloqueio. A allowlist atual cobre os domínios de produção e localhost.

Aprove para eu executar do Passo 2 ao 6 (o Passo 1 já está commitado, falta só o seu Update).
