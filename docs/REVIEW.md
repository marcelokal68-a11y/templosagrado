# Auditoria de Segurança e Qualidade — Templo Sagrado

**Versão:** 1.0 · **Data:** 2026-04-19 · **Revisor:** Claude (Opus 4.7)
**Escopo:** repositório completo na branch `main` (commit `1811a2e — Auditoria e aumento de tokens`)

---

## Sumário Executivo

Templo Sagrado é um PWA (Vite + React + TS) com backend Supabase (Postgres + 24 Edge Functions + Storage) e billing via Stripe. O produto está em produção (`templosagrado.lovable.app`) com **10k+ usuários** e planos Devoto (R$19,90/mês) e Iluminado (R$39,90/mês). A auditoria mapeou 33 migrations, 24 edge functions e ~18 páginas React.

**Veredicto geral:** 🔴 **Não apto para escalar comercialmente sem remediação imediata**.

A estrutura do produto (RLS ampla, camadas React Query, shadcn, PWA) está coerente e bem construída. Porém **o modelo de acesso da aplicação está vazando em produção** (bypass automático do paywall pelo hostname `lovable.app`) e **a maioria das edge functions que consomem IA paga não valida autenticação** — qualquer pessoa com curl pode drenar o orçamento de IA, enviar emails em massa pelo domínio ou ler dados privados de outros usuários.

**Distribuição de severidades:**

| Severidade | Qtd | Nomes |
|---|---|---|
| 🔴 P0 — Crítico | 8 | TS-001..TS-008 |
| 🟠 P1 — Alto | 12 | TS-101..TS-112 |
| 🟡 P2 — Médio | 10 | TS-201..TS-210 |
| 🟢 P3 — Baixo | 7 | TS-301..TS-307 |

**Ação imediata sugerida (48h):**

1. TS-001 — desativar bypass de paywall em produção (1 linha de código, alto impacto de receita).
2. TS-002 — adicionar verificação de JWT em `sacred-chat`, `generate-prayer`, `elevenlabs-tts`, `send-prayer-email`, `send-trial-reminders` (cost + spam bomb).
3. TS-003 — corrigir decode-sem-assinatura em `check-subscription`.
4. Rotacionar todos os secrets do Stripe/ElevenLabs/Resend/Lovable por precaução (o repo não vazou os secrets, só a anon key).

---

## Metodologia

- Leitura estática de 100% dos arquivos `.ts/.tsx` do `src/`, 100% das Edge Functions, amostra representativa das 33 migrations (todas que criam tabela + todas que criam policy).
- Grep sistemático para padrões perigosos: `service_role`, `any`, `console.log`, `TODO`, `@ts-ignore`, APIs externas, uso de secrets, auth patterns.
- Testes de hipótese via leitura cruzada (ex: `config.toml verify_jwt = false` + função não valida auth manual → rota pública).
- Não foram executados exploits reais. Provas de conceito são descritas apenas no nível conceitual.

---

## 🔴 Crítico (P0) — Bloqueadores de lançamento

### TS-001 · Paywall bypass automático em produção

| | |
|---|---|
| **Arquivo** | [src/lib/access.ts:16-26](../src/lib/access.ts) |
| **Aplicado em** | [src/contexts/AppContext.tsx:194,198-199,237-238](../src/contexts/AppContext.tsx) |
| **Impacto** | Receita direta. Todos os 10k+ usuários estão em "subscriber" automaticamente em produção. |
| **Esforço fix** | S (1 linha) |

`isPreviewEnvironment()` retorna `true` para qualquer host contendo `lovable.app`, `lovableproject.com`, `lovable.dev`, `localhost` ou `127.0.0.1`. A produção roda em `templosagrado.lovable.app` — **matching**. Em `AppContext.tsx:194`, `const inPreview = isPreviewEnvironment()` força `accessStatus = 'subscriber'` e `questionsRemaining = 999999` no cliente. Embora as edge functions `sacred-chat` e `check-subscription` façam verificação server-side independente, a UX mostra o badge PRO, libera a criação de post no mural, TTS, memória, histórico — tudo o que o plano pago promete. A única proteção é se um usuário tentar bater numa function que checa subscriber status no server (`sacred-chat` faz isso em linha 304 — mas só se `userId` for enviado; ver TS-002).

**PoC:** abra qualquer navegador na URL de produção → sem login, o cliente roda como subscriber. Com login, `profiles.is_subscriber = false` é ignorado no cliente.

**Remediação:**

```ts
// src/lib/access.ts
export function isPreviewEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  // Apenas localhost e sandboxes internas. Produção NUNCA matcha.
  return host === 'localhost' || host === '127.0.0.1';
}
```

**Validação pós-deploy:** abrir prod em aba anônima, tentar mandar 21ª mensagem → deve ver paywall. Usuários já pagantes não são afetados (o flag só protege o cliente; servidor continua autoridade). Conferir em `AppContext.tsx:198` que `questions_limit - questions_used` é o número real.

---

### TS-002 · Edge functions de IA sem autenticação (cost bomb / data leak)

| | |
|---|---|
| **Arquivos** | [supabase/config.toml:3-51](../supabase/config.toml) — `verify_jwt = false` em 16 funções, das quais muitas não fazem auth manual |
| **Críticas expostas** | `sacred-chat`, `generate-prayer`, `generate-post`, `elevenlabs-tts` (anon), `send-prayer-email`, `send-trial-reminders`, `verse-of-day` (by design, com cache) |
| **Impacto** | Custo: drenar orçamento LOVABLE_API_KEY / ElevenLabs. Dados: ler memory/history de qualquer userId. Abuso: open email relay. |
| **Esforço fix** | M (várias funções + config + migration de rate-limit) |

Das 24 edge functions, 16 têm `verify_jwt = false` no `config.toml`. Destas, apenas 7 implementam verificação manual via `supabase.auth.getUser(token)`. As outras 9 aceitam qualquer request.

**`sacred-chat`** ([supabase/functions/sacred-chat/index.ts:266-288](../supabase/functions/sacred-chat/index.ts)) — aceita `userId` do body sem validar. Atacante envia:

```bash
curl -X POST https://<ref>.supabase.co/functions/v1/sacred-chat \
  -H "apikey: <anon-key-publica>" \
  -d '{"messages":[...], "userId":"<victim-uuid>", "context":{...}}'
```

Resultado: (a) consome quota da vítima; (b) grava memórias arbitrárias via `extractAndSaveMemories` (linha 345); (c) puxa o histórico da vítima (`fetchUserHistory` linha 229) — **data leak**.

**`generate-prayer`** ([generate-prayer/index.ts:41-54](../supabase/functions/generate-prayer/index.ts)) — não faz nenhuma checagem de auth. Anyone = unlimited Gemini-2.5-Flash com max_tokens=1500. Em 10k req/hora vira conta de milhares de reais.

**`generate-post`** ([generate-post/index.ts:8-18](../supabase/functions/generate-post/index.ts)) — idem. Sem auth, sem rate limit.

**`elevenlabs-tts`** ([elevenlabs-tts/index.ts:57](../supabase/functions/elevenlabs-tts/index.ts)) — auth opcional. Linha 57: `if (userId)` → quota aplicada só para usuários logados. Anônimos passam direto. ElevenLabs cobra por caractere; um script pode drenar quota em minutos.

**`send-prayer-email`** ([send-prayer-email/index.ts](../supabase/functions/send-prayer-email/index.ts)) — **open email relay**. Envia email pelo domínio `onboarding@resend.dev` com body arbitrário do cliente (`prayer`, `intention`, `tradition`) para QUALQUER `to`. Risco: spam, phishing via branding "Templo Sagrado", reputação do domínio queimada.

**`send-trial-reminders`** ([send-trial-reminders/index.ts](../supabase/functions/send-trial-reminders/index.ts)) — sem auth e sem gate de admin. Qualquer chamada dispara emails em loop para todos os trials. Deveria ser apenas via `pg_cron` ou admin-gated.

**`verse-of-day`** ([verse-of-day/index.ts:423](../supabase/functions/verse-of-day/index.ts)) — público por design (landing/free), mas cache-first. Atacante pode burlar o cache variando `userDate` (linha 432) e forçar cache-miss → chama AI → custo. Low-medium risk.

**`check-subscription`** — ver TS-003, auth existe mas é quebrada.

**Remediação (para cada função):**

```ts
// Padrão de auth obrigatório no início de toda function que custa dinheiro
const authHeader = req.headers.get("Authorization");
if (!authHeader?.startsWith("Bearer ")) {
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
const token = authHeader.replace("Bearer ", "");
const sbUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { headers: { Authorization: `Bearer ${token}` } }
});
const { data: { user }, error } = await sbUser.auth.getUser(token);
if (error || !user) return unauthorized();
// A PARTIR DAQUI: user.id é confiável. Não aceitar userId do body.
```

Para `send-prayer-email` e `send-trial-reminders`: além de auth, adicionar gate explícito (admin ou cron secret).

Para `verse-of-day`: manter público, mas adicionar rate limit por IP via `ip_rate_limits` table (TS-101).

**Plano de rollback:** cada função muda isoladamente. Se quebrar, reverter aquele deploy. Apps legados que ainda chamem sem header devem atualizar — mas como os clientes já enviam Authorization em tudo (ver `src/pages/Pricing.tsx:141`), impacto é baixo.

---

### TS-003 · `check-subscription` decodifica JWT sem verificar assinatura

| | |
|---|---|
| **Arquivo** | [supabase/functions/check-subscription/index.ts:30](../supabase/functions/check-subscription/index.ts) |
| **Impacto** | Impersonificação: ler subscription e sobrescrever profile de qualquer user conhecido. |
| **Esforço fix** | S |

```ts
const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(
  JSON.parse(atob(token.split('.')[1])).sub
);
```

O código pega o `sub` do payload JWT **sem verificar a assinatura** e busca o user. Atacante gera um JWT não assinado com `sub: <uuid-vítima>` (ex: `eyJhbGciOiJub25lIn0.eyJzdWIiOiI8VUlEPiJ9.`) e consegue:

1. Ler subscription info (trial status, plan) da vítima.
2. **Escrever** no profile dela (linhas 81-99): `is_subscriber`, `subscription_id`, `questions_limit`. Pode zerar assinatura ou inflar limite.

**Remediação:** substituir por `supabaseClient.auth.getUser(token)` — que valida a assinatura JWT contra o JWT secret do Supabase. É inclusive o padrão já usado em outras funções do próprio projeto ([cancel-subscription:105](../supabase/functions/cancel-subscription/index.ts), [create-checkout:23](../supabase/functions/create-checkout/index.ts)).

---

### TS-004 · Race condition na cobrança de quota (double-spend)

| | |
|---|---|
| **Arquivo** | [supabase/functions/sacred-chat/index.ts:294-321](../supabase/functions/sacred-chat/index.ts) |
| **Impacto** | Usuário free pode ultrapassar limite se enviar requests em paralelo. Baixo financeiro, mas mina política de planos. |
| **Esforço fix** | S |

```ts
const { data: quotaProfile } = await sb.from('profiles')
  .select('is_subscriber, is_pro, questions_limit, questions_used')
  .eq('user_id', userId).maybeSingle();
if (used >= limit) return quotaExceeded();
await sb.from('profiles').update({ questions_used: used + 1 }).eq('user_id', userId);
```

Read → check → write em 3 passos. Duas requests simultâneas leem `used=19`, ambas passam o check e gravam `used=20`. Na prática: usuário free gera 40 respostas com 2 conexões.

**Remediação:** função SQL atômica:

```sql
CREATE FUNCTION increment_questions_atomic(_user_id uuid)
RETURNS TABLE(allowed boolean, remaining int) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  UPDATE profiles
  SET questions_used = questions_used + 1
  WHERE user_id = _user_id
    AND questions_used < questions_limit
    AND NOT is_subscriber
    AND NOT is_pro
  RETURNING true, questions_limit - questions_used;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0;
  END IF;
END; $$;
```

Edge function chama `sb.rpc('increment_questions_atomic', ...)` e respeita o `allowed`. Mesma ideia para TTS (`tts_usage`).

**Idempotência bonus:** aceitar `Idempotency-Key` header, armazenar em `idempotency_keys` com TTL 24h — protege contra retry do cliente.

---

### TS-005 · `isPreviewEnvironment` libera `999999` perguntas

| | |
|---|---|
| **Arquivo** | [src/contexts/AppContext.tsx:198](../src/contexts/AppContext.tsx), [src/lib/access.ts:33-34](../src/lib/access.ts) |
| **Impacto** | Decorre de TS-001, mas vale listar isolado: afeta contador visível e decisões de UI mesmo se TS-001 for corrigido parcialmente. |
| **Esforço fix** | XS (junto com TS-001) |

Se sobrar qualquer caminho de preview sendo `true` em produção, este ponto sobrescreve `questionsRemaining = 999999`. Ao corrigir TS-001 confirmar que este também se auto-resolve.

---

### TS-006 · `.env` commitado e `.gitignore` não ignora `.env`

| | |
|---|---|
| **Arquivos** | [.env](../.env), [.gitignore](../.gitignore) |
| **Impacto** | Hoje baixo (apenas anon key, que é pública), mas padrão perigoso: qualquer secret adicionado vaza no próximo commit. Repo também ficou privado → público → privado → público, aumentando exposição. |
| **Esforço fix** | S |

O `.gitignore` atual ignora `node_modules`, `dist`, editores, logs — mas **não `.env*`**. Como o Lovable auto-commita a cada alteração, um secret jogado ali vai instantaneamente pro GitHub.

Secrets atualmente expostos: apenas `VITE_SUPABASE_PUBLISHABLE_KEY` (anon) + `VITE_SUPABASE_URL` — ambos públicos por design.

**Remediação:**

```
# .gitignore — adicionar no topo:
.env
.env.*
!.env.example
```

Criar `.env.example` com as variáveis públicas e um placeholder em `README.md`. `git rm --cached .env` (o arquivo permanece local), commit.

Auditar histórico: `git log --all --full-history -- .env` — se existir algum secret privado lá, **rotacionar**: `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY`, `ELEVENLABS_API_KEY`, `RESEND_API_KEY`, `FIRECRAWL_API_KEY`.

---

### TS-007 · Rotas `/admin*` protegidas apenas por login (não por role)

| | |
|---|---|
| **Arquivos** | [src/App.tsx:55-57](../src/App.tsx), [src/components/ProtectedRoute.tsx:1-35](../src/components/ProtectedRoute.tsx) |
| **Impacto** | Usuário comum logado acessa `/admin`, `/admin/analytics`, `/admin/knowledge` e vê UI administrativa. Actions reais são protegidas pela function `admin` (bom), mas vazam schema/UX/estrutura interna. |
| **Esforço fix** | S |

`ProtectedRoute` só verifica `user !== null`. Qualquer logado entra na rota. A função `admin` (`functions/admin/index.ts:55-61`) rejeita ações sem role `admin` (ótimo), mas a UI pode carregar listagens, gráficos vazios, e revelar endpoints.

**Remediação:**

```tsx
// components/ProtectedRoute.tsx — adicionar variant AdminRoute
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useApp();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// App.tsx
<Route path="/admin" element={<AdminRoute><Admin/></AdminRoute>} />
```

---

### TS-008 · `priceId` vem do cliente sem allowlist server-side

| | |
|---|---|
| **Arquivo** | [supabase/functions/create-checkout/index.ts:27](../supabase/functions/create-checkout/index.ts), [supabase/functions/change-subscription/index.ts:37](../supabase/functions/change-subscription/index.ts) |
| **Impacto** | Atacante chama `create-checkout` com um `priceId` antigo/teste do mesmo Stripe account e compra plano "Iluminado" pelo preço de uma fixture de R$0,50 se ainda existir. Ou price deprecado com valor errado. |
| **Esforço fix** | S |

Nenhum código valida se o `priceId` recebido pertence aos 4 planos oficiais declarados em `Pricing.tsx:22-39`.

**Remediação:**

```ts
// supabase/functions/_shared/plans.ts  (novo)
export const VALID_PRICE_IDS = new Set([
  'price_1T3dRaCkGJ1CW5bG9N43LMuq',  // monthly
  'price_1T3dZcCkGJ1CW5bGZvBy9ibE',  // annual
  'price_1T3ddNCkGJ1CW5bGQUj9TNmC',  // topMonthly
  'price_1T3ddZCkGJ1CW5bGatX1GaLX',  // topAnnual
]);

// create-checkout/index.ts
if (!VALID_PRICE_IDS.has(priceId)) throw new Error("invalid priceId");
```

---

## 🟠 Alto (P1) — Riscos de escala

### TS-101 · Sem rate limiting em nenhuma edge function

| | |
|---|---|
| **Evidência** | `grep rate.?limit supabase/functions/` — só aparece em respostas 429 passadas do AI gateway. Nenhum rate limit próprio. |
| **Impacto** | Um usuário ou bot consegue atacar o AI gateway até esgotar créditos ou disparar rate-limit upstream, derrubando o serviço para todos. |
| **Esforço fix** | M |

**Remediação:** tabela `ip_rate_limits(ip text, window_start timestamptz, count int)` + helper `checkRateLimit(ip, limit, window_sec)` no `_shared/`. Alternativa: Upstash Redis (CF Worker) ou `pg_rate_limit` extension.

### TS-102 · Sem code-splitting — todas as 18 páginas no bundle inicial

| | |
|---|---|
| **Arquivo** | [src/App.tsx:10-26](../src/App.tsx) |
| **Impacto** | Bundle cliente inclui recharts (AdminAnalytics), jspdf (Journey), TODA admin UI, todos os Radix components. Primeiro paint demora no 3G BR. |
| **Esforço fix** | S |

**Remediação:**

```tsx
const Admin = React.lazy(() => import('./pages/Admin'));
const AdminAnalytics = React.lazy(() => import('./pages/AdminAnalytics'));
// ...etc
<Suspense fallback={<PageSkeleton/>}>
  <Routes>...</Routes>
</Suspense>
```

Configurar `manualChunks` em `vite.config.ts` para separar `vendor-react`, `vendor-radix`, `vendor-charts`.

### TS-103 · `QueryClient` sem configuração

| | |
|---|---|
| **Arquivo** | [src/App.tsx:31](../src/App.tsx) |
| **Impacto** | Defaults do React Query disparam refetch em `window focus`, sem `staleTime`. Em app PWA, alternar abas dispara cascata de queries por todos os Contexts e páginas ativas. Em 500k MAU = carga desnecessária gigante no Supabase. |
| **Esforço fix** | XS |

**Remediação:**

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### TS-104 · PWA icon de 1,5 MB

| | |
|---|---|
| **Arquivo** | [public/pwa-192x192.png](../public/pwa-192x192.png) (1.553.608 bytes) |
| **Impacto** | Cacheado pelo service worker para 100% dos usuários PWA. 500k × 1,5 MB = 750 GB de egress só desse asset. |
| **Esforço fix** | XS |

**Remediação:** re-gerar com `sharp` ou ImageOptim. Target: <20 KB para 192×192 PNG. Considerar adicionar `192x192.webp` no manifest.

### TS-105 · TypeScript strict desligado

| | |
|---|---|
| **Arquivos** | [tsconfig.json:12-14](../tsconfig.json), [tsconfig.app.json:15-25](../tsconfig.app.json) |
| **Impacto** | 26 usos de `: any` (grep). Null/undefined silenciosos. Bugs de runtime escapam do compilador. |
| **Esforço fix** | L (passar 26 anys gera cascata de null checks) |

Habilitar progressivamente:

```json
// tsconfig.app.json
"strict": true,
"noUncheckedIndexedAccess": false,  // comece sem; ligue depois
"strictNullChecks": true,
"noImplicitAny": true
```

Estratégia: habilitar `strict` num PR separado por área (ex: só `src/lib/` primeiro, depois `src/hooks/`, depois `src/components/`, por último `src/pages/`).

### TS-106 · Admin com paginação hardcoded a 1000 usuários

| | |
|---|---|
| **Arquivo** | [supabase/functions/admin/index.ts:64,111,140](../supabase/functions/admin/index.ts) |
| **Impacto** | `listUsers({ perPage: 1000 })` — em 10k+ já está vendo parcial; em 500k vê 0,2%. Analytics e listagem se tornam mentira. |
| **Esforço fix** | M |

Refatorar para paginação cursor-based ou agregação via SQL. Para analytics, usar views materializadas:

```sql
CREATE MATERIALIZED VIEW admin_stats AS
SELECT
  count(*) FILTER (WHERE is_subscriber) AS subscribers,
  count(*) FILTER (WHERE trial_ends_at > now() AND NOT is_subscriber) AS trialing,
  count(*) AS total_profiles
FROM profiles;
-- refresh via pg_cron cada 5 min
```

### TS-107 · `check-subscription` é polling, não webhook

| | |
|---|---|
| **Arquivo** | [supabase/functions/check-subscription/index.ts](../supabase/functions/check-subscription/index.ts), chamada em [src/pages/Pricing.tsx:124-133](../src/pages/Pricing.tsx) |
| **Impacto** | Toda `Pricing` page load chama Stripe API → 1 API call externo + update no profile por usuário. Em picos (ex: campanha), rate-limit do Stripe e carga no DB. Usuário que nunca abre Pricing tem estado desatualizado. |
| **Esforço fix** | M |

**Remediação:** implementar webhook Stripe (`invoice.paid`, `customer.subscription.updated/deleted`, `invoice.payment_failed`). Mantém `profiles.is_subscriber` sempre em sincronia sem depender de polling. Manter `check-subscription` apenas como fallback manual.

### TS-108 · `sacred-chat` recria cliente Supabase a cada helper

| | |
|---|---|
| **Arquivo** | [supabase/functions/sacred-chat/index.ts:106-110](../supabase/functions/sacred-chat/index.ts) |
| **Impacto** | `getSupabaseClient()` chamado em `fetchUserMemories`, `extractAndSaveMemories`, `fetchUserHistory`, RAG helper. Cada invocação constrói e abre conexão nova. Aumenta latência por request e ocupa pool PG. |
| **Esforço fix** | S |

Refatorar para cliente singleton por invocação (criar no topo de `serve` e passar por parâmetro).

### TS-109 · Geolocalização auto-gravada sem consentimento (LGPD)

| | |
|---|---|
| **Arquivo** | [src/contexts/AppContext.tsx:214-224](../src/contexts/AppContext.tsx) |
| **Impacto** | Navegador pede permissão implicitamente em `navigator.geolocation.getCurrentPosition`, e se concedido, grava `latitude/longitude` no `profiles`. Sem base legal explícita (consentimento informado) viola LGPD Art. 7º. |
| **Esforço fix** | S |

**Remediação:** mover coleta para opt-in explícito ("Permitir orientação por localização?"), associar consentimento a um campo `profile.location_consent` (`timestamp` + `version`).

### TS-110 · Lista duplicada de `SACRED_TEXTS` em 3 funções

| | |
|---|---|
| **Arquivos** | [sacred-chat/index.ts:10-23](../supabase/functions/sacred-chat/index.ts), [generate-prayer/index.ts:8-20](../supabase/functions/generate-prayer/index.ts), [verse-of-day/index.ts](../supabase/functions/verse-of-day/index.ts) |
| **Impacto** | Dívida — mudar uma definição e as outras divergirem silencia diferenças nas respostas AI. Já diverge: sacred-chat tem listas longas, generate-prayer tem resumos. |
| **Esforço fix** | M |

Mover para `supabase/functions/_shared/traditions.ts` e importar nas três.

### TS-111 · Admin emails hardcoded no código

| | |
|---|---|
| **Arquivo** | [supabase/functions/admin/index.ts:9-13](../supabase/functions/admin/index.ts) |
| **Impacto** | 3 emails de admin auto-promovidos no login. Não-revogável sem deploy, source-controlled em repo público. Risco se uma conta for comprometida. |
| **Esforço fix** | S |

Migrar para tabela `admin_bootstrap_emails` ou Supabase secret `ADMIN_BOOTSTRAP_EMAILS`. Alternativa: deletar a auto-promoção e fazer bootstrap manual via SQL uma vez.

### TS-112 · `cancel-subscription` bloqueia resposta no email de winback

| | |
|---|---|
| **Arquivo** | [supabase/functions/cancel-subscription/index.ts:141](../supabase/functions/cancel-subscription/index.ts) |
| **Impacto** | `await sendWinbackEmail(...)` dentro do request — se Resend estiver lento, usuário espera. UX ruim; timeout possível. |
| **Esforço fix** | XS |

Trocar `await` por fire-and-forget ou enfileirar via queue (Supabase Queues / pg_boss).

---

## 🟡 Médio (P2) — Dívida técnica

### TS-201 · CORS `Access-Control-Allow-Origin: "*"` em todas as functions

Todas as 24 functions. Não há necessidade — o PWA chama de um domínio conhecido. Amplifica CSRF em combinação com functions quebradas.

**Fix:** allowlist `['https://templosagrado.lovable.app', 'https://templosagrado.com.br']`.

### TS-202 · Zero cobertura de testes efetiva

Um único arquivo: [src/test/example.test.ts](../src/test/example.test.ts).

**Fix:** adicionar smoke tests das 5 rotas críticas (`Index`, `Auth`, `Pricing`, `Mural`, `Learn`), unitários de `src/lib/access.ts`, `src/lib/profanityFilter.ts`, `src/lib/sanitizeDisplayName.ts`. Tests de auth das edge functions via Vitest + Supabase CLI.

### TS-203 · Nenhuma observabilidade (Sentry/Logflare/Axiom)

`console.error` em 50+ lugares. Sem agregação, sem alerta, sem trace. Incidente em prod → escaneamento manual de `supabase functions logs`.

**Fix:** integrar Sentry (browser + edge functions). Exportar logs Supabase para Axiom/Logflare.

### TS-204 · `free_access_emails` sem validação server-side

[admin/index.ts:408-429](../supabase/functions/admin/index.ts): upsert sem validar formato de email, sem limite de tamanho. Também ilike em TS-301.

### TS-205 · `moderate-post` falha aberta

[moderate-post/index.ts:111](../supabase/functions/moderate-post/index.ts): se AI falha, permite post. Melhor: fail-closed com override admin.

### TS-206 · `redeem-invite` não atualiza `times_used` atomicamente

[redeem-invite/index.ts:78-82](../supabase/functions/redeem-invite/index.ts): read `invite.times_used` → update. Race entre convites com `max_uses=N` pode passar do limite.

**Fix:** `UPDATE invite_links SET times_used = times_used + 1 WHERE id=$1 AND (max_uses IS NULL OR times_used < max_uses) RETURNING *`.

### TS-207 · `generate-post` e `moderate-post` usam modelo `gemini-3-flash-preview`

Preview model. Instável, pode mudar contract. Preferir versões GA.

### TS-208 · Stripe: procura customer por email com `limit: 1`

Padrão presente em 6 functions. Se um email tiver >1 customer (mudança de plano antigo), opera no errado. Ligar email ao profile via `stripe_customer_id` na tabela e usar esse como fonte de verdade.

### TS-209 · `send-trial-reminders` busca perfis sem paginar

[send-trial-reminders/index.ts:25-29](../supabase/functions/send-trial-reminders/index.ts): `select` sem limit em `profiles` filtrado por `is_subscriber=false AND trial_ends_at NOT NULL`. Em 500k usuários com muitos trials abandonados, a query escaneia muitos registros + faz N chamadas ao `auth.admin.getUserById` em loop síncrono.

**Fix:** query com `trial_ends_at BETWEEN now()-interval '24h' AND now()+interval '60h'` + join com `auth.users` via VIEW, processar em lote, paralelizar envios com limite.

### TS-210 · `verse-of-day` cache não vincula `timezone`

[verse-of-day/index.ts:504-510](../supabase/functions/verse-of-day/index.ts): cache por `(cache_date, religion, language)`. Dois usuários em fuso diferente podem ver o mesmo verso mesmo quando "hoje" é dia diferente. Para parashá judaica há validação extra, mas para outras tradições não.

---

## 🟢 Baixo (P3) — Polimento

- **TS-301** · `ilike('email', userInfo.user.email)` em elevenlabs-tts:71 — evitar `ilike` sem escape para não virar tokenizer injetável.
- **TS-302** · Duplicação de `Access-Control-Allow-Headers` longos em 20 arquivos — extrair para `_shared/cors.ts`.
- **TS-303** · `bun.lockb` e `bun.lock` ambos commitados — escolher um.
- **TS-304** · `README.md` com placeholder `REPLACE_WITH_PROJECT_ID` — limpar.
- **TS-305** · Cupom de winback `VOLTAR30` hardcoded em [cancel-subscription:10](../supabase/functions/cancel-subscription/index.ts) — mover para env.
- **TS-306** · Emails enviados de `onboarding@resend.dev` em `send-prayer-email` e `send-trial-reminders` — domínio temporário; configurar DKIM/SPF em `templosagrado.com.br`.
- **TS-307** · `scrape-article` retorna erro com cupom promocional ("LOVABLE50 = 50% off"), não apropriado para produção.

---

## Matriz RLS por tabela (amostragem)

Analisadas 14 das ~20 tabelas nas migrations. Todas que encontrei têm RLS habilitado. Padrão geral: ✅.

| Tabela | RLS | Select própria | Insert própria | Update própria | Delete própria | Observação |
|---|---|---|---|---|---|---|
| `profiles` | ✅ | `auth.uid() = user_id` | ✅ | ✅ | — | Falta policy de DELETE |
| `chat_messages` | ✅ | ✅ | ✅ | — | ✅ | OK |
| `chat_sessions` | ✅ | ✅ | ✅ | ✅ | — | Falta DELETE |
| `prayers` | ✅ | `Anyone can insert` (**CHECK true**) | ✅ | — | — | ⚠️ Insert público sem auth check |
| `user_memory` | ✅ | ✅ | ✅ | — | ✅ | OK |
| `prayer_wall_posts` | ✅ | `Public visible` / `Subscribers can create` | ✅ | — | ✅ | OK |
| `prayer_reactions` | ✅ | ✅ | ✅ | — | ✅ | OK |
| `prayer_comments` | ✅ | ✅ | ✅ | — | ✅ | OK |
| `prayer_reports` | ✅ | Próprio/admin | ✅ | — | Admin | OK |
| `moderation_flags` | ✅ | Admin | ✅ | — | Admin | OK |
| `activity_history` | ✅ | ✅ | ✅ | — | ✅ | OK |
| `invite_links` | ✅ | Admin manage + próprias | ✅ | ✅ | — | Mix do admin-only e user-create — revisar |
| `invite_redemptions` | ✅ | Admin + próprias | ✅ | — | — | OK |
| `user_roles` | ✅ | Próprias + admin | Admin | — | Admin | OK |
| `tts_usage` | ✅ | Próprias | Service role | — | — | OK |
| `knowledge_sources` | ✅ | Auth read ready / Admin manage | Admin | Admin | Admin | OK |
| `knowledge_chunks` | ✅ | Auth read / Admin manage | Admin | Admin | Admin | OK |
| `daily_verse_cache` | ✅ | Anyone read | — | — | — | OK |
| `parasha_cache` | ✅ | Anyone read | — | — | — | OK |
| `free_access_emails` | ✅ | Admin | Admin | Admin | Admin | OK |

**Achados adicionais:**

- `prayers` tem `CREATE POLICY "Anyone can insert prayers" FOR INSERT WITH CHECK (true)` — ver [20260219203440:49](../supabase/migrations/20260219203440_569b1e13-9111-42cd-9bd8-48649f0b40e1.sql). Anônimos podem injetar dados nessa tabela. Provavelmente design para trial (pre-login), mas vale auditar se ainda é usado e adicionar rate limit.
- Várias tabelas não têm DELETE policy para o próprio user (profile, chat_sessions) — LGPD exige "direito ao apagamento". Precisa endpoint de deleção de conta que cascateie.
- Não vi `ON DELETE CASCADE` em várias FKs implícitas (não pude inspecionar todas as migrations a fundo). Risco: deletar user sobra sujeira. Migration de alinhamento recomendada.

---

## Matriz de auth por Edge Function

| Função | verify_jwt | Auth manual | Role check | Severidade |
|---|---|---|---|---|
| sacred-chat | ❌ false | **❌ nenhum** | — | 🔴 TS-002 |
| learn-chat | ✅ default | ✅ (getUser) | — | 🟢 |
| generate-prayer | ❌ false | **❌ nenhum** | — | 🔴 TS-002 |
| generate-post | ❌ false | **❌ nenhum** | — | 🔴 TS-002 |
| verse-of-day | ❌ false | — (público) | — | 🟠 TS-101 |
| daily-practice | ❌ false | ? (não lido em detalhe) | — | 🟠 revisar |
| analyze-history | ✅ default | ❌ (mas JWT verificado pelo Supabase) | — | 🟠 sem quota |
| elevenlabs-tts | ❌ false | ⚠️ opcional | — | 🔴 TS-002 |
| elevenlabs-stt | ✅ default | ❌ | — | 🟠 sem quota |
| send-prayer-email | ❌ false | **❌ nenhum** | — | 🔴 TS-002 |
| send-trial-reminders | ❌ false | **❌ nenhum** | — | 🔴 TS-002 |
| moderate-post | ✅ default | ✅ | — | 🟢 mas fail-open |
| redeem-invite | ❌ false | ✅ | — | 🟡 race |
| scrape-article | ❌ false | ✅ | ✅ admin | 🟢 |
| ingest-knowledge | ❌ false | ✅ | ✅ admin | 🟢 |
| create-checkout | ❌ false | ✅ | — | 🟡 TS-008 |
| check-subscription | ❌ false | ⚠️ JWT decode s/ verify | — | 🔴 TS-003 |
| customer-portal | ❌ false | ✅ | — | 🟢 |
| cancel-subscription | ❌ false | ✅ | — | 🟡 TS-112 |
| change-subscription | ✅ default | ✅ | — | 🟢 |
| reactivate-subscription | ✅ default | ✅ | — | 🟢 |
| admin | ❌ false | ✅ getClaims | ✅ | 🟢 auth; 🟠 `perPage:1000` |

Legenda: ✅ = presente, ❌ = ausente, ⚠️ = quebrado.

---

## Dívidas de teste, observabilidade e CI/CD

- **Testes:** 1 arquivo ([src/test/example.test.ts](../src/test/example.test.ts)). Scripts `test`, `test:watch` configurados mas vazios de cobertura. Sem testes de edge functions.
- **CI:** não há `.github/workflows/`, sem pipeline de lint/test/build/deploy. Deploy é manual via Lovable.
- **Observabilidade:** nenhum Sentry/Logflare/Axiom. Logs apenas em `supabase functions logs`.
- **Métrica:** nenhuma métrica de produto/infra custodiada. MRR/churn dependem de chamar `admin get-analytics` na hora.
- **Erro boundaries:** não vi nenhum `ErrorBoundary` no `src/`. Uma exceção não tratada quebra toda a árvore React.
- **PII registry:** não existe inventário documentado. Para LGPD, mínimo: tabela `data_exports_log` + endpoint `GET /api/me/export` + endpoint `DELETE /api/me`.

---

## Próximos passos

A continuação deste documento é o roadmap em [docs/ARCHITECTURE.md](./ARCHITECTURE.md), que transforma cada achado em tarefas faseadas com estimativa, plano de rollback e métrica de validação.
