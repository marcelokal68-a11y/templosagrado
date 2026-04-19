# Roadmap de Arquitetura — Templo Sagrado rumo a 500k

**Versão:** 1.0 · **Horizonte:** 4-8 semanas · **Volume atual:** ~10k+ MAU · **Meta:** 500k MAU

Este documento transforma os achados do [REVIEW.md](./REVIEW.md) em um plano faseado com tarefas, estimativas, rollback e métricas de sucesso. Cada fase tem critério de saída explícito. Não avance sem bater todos os critérios.

---

## Princípios-mestres (valem para as 3 fases)

1. **Retrocompatibilidade é inegociável.** 10k+ pagantes não podem ter sessão invalidada, quota zerada ou UX quebrada num deploy.
2. **Feature flags para mudanças comportamentais.** Correções que alteram o que o usuário vê (ex: TS-001) entram atrás de flag. Liga gradualmente: 1% → 10% → 100%.
3. **Rollback plan por PR.** Cada PR descreve como reverter. Migrations: `BEGIN; ... COMMIT;` com verificação, nunca `DROP` destrutivo.
4. **Observabilidade ANTES da correção.** Cada fix P0/P1 deve ter métrica no dashboard ANTES do deploy — pra saber se o fix resolveu ou piorou.
5. **1 PR = 1 risco.** Não misturar TS-001 com refactor. Facilita review, rollback, bisect.
6. **Secrets: zero confiança no git.** Rotacionar tudo que já esteve no .env. Usar Supabase Secrets / Vercel env / GH Actions secrets.
7. **Tests de smoke antes de expandir.** Cada fase finaliza com uma rodada mínima de Playwright ou Vitest simulando fluxo crítico.

---

## Estado atual

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENTE (PWA em templosagrado.lovable.app)                      │
│                                                                 │
│  React 18 + Vite + React Router (sem lazy)                      │
│  AppContext (user, access, chat state)                          │
│  @supabase/supabase-js  ──┐                                     │
│                           │ JWT                                  │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ SUPABASE (project ejiymtkresynljwckhug)                         │
│                                                                 │
│  Postgres                                                       │
│   ├─ 20 tabelas com RLS (coverage boa)                          │
│   ├─ profiles (user_id, questions_used/limit, is_subscriber…)   │
│   ├─ chat_messages, user_memory, prayer_wall_posts…             │
│   └─ knowledge_chunks (RAG vector store)                        │
│                                                                 │
│  Edge Functions (24, Deno)                                      │
│   ├─ AI: sacred-chat, learn-chat, generate-prayer, verse,…      │
│   │     └─ Lovable AI Gateway → Gemini 2.5 Flash/Pro            │
│   ├─ Payment: create-checkout, check-subscription, customer-    │
│   │     portal, cancel/change/reactivate — Stripe               │
│   ├─ Admin: admin (auth+role), ingest-knowledge, scrape         │
│   ├─ Media: elevenlabs-tts, elevenlabs-stt                      │
│   └─ Email: send-prayer-email, send-trial-reminders (Resend)    │
│                                                                 │
│  Storage: knowledge-files (admin), imagens sagradas             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TERCEIROS                                                       │
│   Stripe (billing)  ·  ElevenLabs (TTS/STT)  ·  Resend (email)  │
│   Firecrawl (scrape)  ·  Hebcal (calendário judaico)            │
│   Lovable AI Gateway (Gemini via proxy)                         │
└─────────────────────────────────────────────────────────────────┘
```

## Estado-alvo (500k)

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENTE                                                         │
│  + Code-split por rota (lazy)                                   │
│  + React Query com defaults ajustados                           │
│  + Error Boundary + Sentry browser                              │
│  + PWA com assets <50KB comprimidos, CDN                        │
│  + LGPD consent gate (geo + cookies + analytics)                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ EDGE / GATEWAY                                                  │
│  + Rate limit por IP + por user (ip_rate_limits table)          │
│  + Idempotency keys                                             │
│  + Allowlist de origin (CORS)                                   │
│  + Auth obrigatória + role check em funções sensíveis           │
│  + Validação de input (zod)                                     │
│  + Logs estruturados → Axiom/Logflare                           │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ DADOS                                                           │
│  + Índices hot path (chat_messages idx, profile_user_id, etc)   │
│  + Matviews para analytics (admin_stats refresh 5min)           │
│  + Função SQL atômica para quota (sem race)                     │
│  + Webhook Stripe como fonte de verdade (evento-driven)         │
│  + Pgvector tuned para RAG                                      │
│  + Connection pooling via Supavisor                             │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ OBSERVABILIDADE                                                 │
│  + Sentry (browser + edge)                                      │
│  + Axiom (logs edge functions)                                  │
│  + Dashboards: latência, erro %, custo IA / usuário,            │
│    MRR, churn, funnel trial→paid, signups/dia                  │
│  + Alertas: budget IA, erro >1%, p95 >3s                        │
└─────────────────────────────────────────────────────────────────┘
```

---

# Fase 0 — Parar o sangramento (Semana 1)

**Objetivo:** eliminar receita vazando e vetores de abuso críticos. Nada de refactor; só fixes cirúrgicos.

**Sinais de sucesso ao final da semana:**

- Paywall funcional em produção (conversão de trial mensurável aumenta).
- Nenhuma edge function de IA aceita request anônimo.
- `check-subscription` valida assinatura JWT.
- Secrets auditados / rotacionados se necessário.
- Dashboard mínimo de custo de IA no ar.

| # | Task | Evidência | Esforço | Rollback |
|---|---|---|---|---|
| F0.1 | TS-001 — Restringir `isPreviewEnvironment` a `localhost/127.0.0.1` | [src/lib/access.ts:16-26](../src/lib/access.ts) | S | Git revert do commit |
| F0.2 | TS-002a — Auth obrigatória em `sacred-chat` | [sacred-chat/index.ts:266-288](../supabase/functions/sacred-chat/index.ts) | S | Deploy anterior da function |
| F0.3 | TS-002b — Auth + quota em `generate-prayer` | [generate-prayer/index.ts:41](../supabase/functions/generate-prayer/index.ts) | S | idem |
| F0.4 | TS-002c — Auth + quota em `generate-post` | [generate-post/index.ts:8](../supabase/functions/generate-post/index.ts) | S | idem |
| F0.5 | TS-002d — Auth obrigatória em `elevenlabs-tts` (tirar opcional) | [elevenlabs-tts/index.ts:57](../supabase/functions/elevenlabs-tts/index.ts) | S | idem |
| F0.6 | TS-002e — Auth + admin gate em `send-prayer-email` | [send-prayer-email/index.ts](../supabase/functions/send-prayer-email/index.ts) | S | idem |
| F0.7 | TS-002f — Cron-only + shared secret em `send-trial-reminders` | [send-trial-reminders/index.ts](../supabase/functions/send-trial-reminders/index.ts) | S | idem |
| F0.8 | TS-003 — Trocar `atob(token)` por `auth.getUser(token)` em `check-subscription` | [check-subscription/index.ts:30](../supabase/functions/check-subscription/index.ts) | S | idem |
| F0.9 | TS-004 — Criar `increment_questions_atomic` SQL + usar em `sacred-chat` | [sacred-chat/index.ts:304-321](../supabase/functions/sacred-chat/index.ts) | M | Drop function, voltar ao read-then-write |
| F0.10 | TS-006 — `.gitignore` ignora `.env*`, `git rm --cached .env`, criar `.env.example` | [.gitignore](../.gitignore) | S | n/a |
| F0.11 | TS-007 — `AdminRoute` checando role em `/admin*` | [App.tsx:55-57](../src/App.tsx) | S | Reverter import |
| F0.12 | TS-008 — Allowlist server-side de `priceId` | [create-checkout/index.ts:27](../supabase/functions/create-checkout/index.ts), [change-subscription/index.ts:37](../supabase/functions/change-subscription/index.ts) | S | idem |
| F0.13 | Observabilidade mínima — adicionar Sentry (browser + edge) | n/a | M | Remover import |
| F0.14 | Dashboard de custo IA — query em `admin/index.ts get-analytics` contando invocações por função × token estimado | n/a | M | — |
| F0.15 | Rotação de secrets (se auditoria apontar vazamento) | — | S | — |

**Plano detalhado de cada fix P0:**

### F0.1 — Paywall bypass (TS-001)

```ts
// src/lib/access.ts
export function isPreviewEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}
```

**Rollback:** este é retroativo para novos users — pagantes ativos têm `is_subscriber=true` no DB, não são afetados. Users em trial verão corretamente o contador 20-questions. Monitorar: alerta se `questions_used >= questions_limit` dispara subitamente em dezenas de milhares (se acontecer, pausar fix).

**Flag opcional:** `VITE_ENABLE_PREVIEW_BYPASS=true` num env só do sandbox, para desenvolvedores não perderem a facilidade local.

### F0.9 — Quota atômica

```sql
-- supabase/migrations/<timestamp>_atomic_quota.sql
CREATE OR REPLACE FUNCTION public.try_consume_question(_user_id uuid)
RETURNS TABLE(allowed boolean, remaining int, questions_limit int) 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _lim int; _used int; _is_sub boolean; _is_pro boolean;
BEGIN
  -- Pega estado
  SELECT questions_limit, questions_used, is_subscriber, is_pro
    INTO _lim, _used, _is_sub, _is_pro
  FROM profiles WHERE user_id = _user_id FOR UPDATE;

  IF _is_sub OR _is_pro THEN
    RETURN QUERY SELECT true, 999999, 999999;
    RETURN;
  END IF;

  IF _used >= _lim THEN
    RETURN QUERY SELECT false, 0, _lim;
    RETURN;
  END IF;

  UPDATE profiles SET questions_used = questions_used + 1
    WHERE user_id = _user_id;

  RETURN QUERY SELECT true, _lim - (_used + 1), _lim;
END; $$;

GRANT EXECUTE ON FUNCTION public.try_consume_question(uuid) TO authenticated, service_role;
```

No edge function substitui o bloco linhas 294-321 por:

```ts
const { data: q } = await sb.rpc('try_consume_question', { _user_id: user.id });
if (!q?.[0]?.allowed) {
  return new Response(JSON.stringify({
    error: 'quota_exceeded',
    message: 'Você atingiu o limite mensal...',
    remaining: 0,
  }), { status: 402, headers: { ...corsHeaders } });
}
```

**Rollback:** `DROP FUNCTION try_consume_question`; edge function volta à versão anterior. Zero impacto em dados.

### F0.13 — Sentry

- `@sentry/react` + `@sentry/tracing` no client (wrap em `main.tsx`).
- `sentry-deno` nas edge functions via import map.
- Budget: 5k eventos grátis/mês no plano free. 10k usuários ativos provavelmente exige plano team ($26/mês).

### F0.14 — Dashboard de custo IA

Adicionar action em `admin`:

```ts
if (action === "get-ai-cost") {
  // Últimos 7 dias: invocações por function + estimativa de tokens
  const { data } = await supabase.rpc('ai_usage_last_7d');
  return new Response(JSON.stringify(data), { ... });
}
```

Criar migration com tabela `ai_usage(function_name, user_id, tokens_in, tokens_out, model, created_at)` + insert em cada function AI ao final. Refresh view.

**Critério de saída Fase 0:**

- [ ] Nenhuma edge function de IA responde 200 sem header Authorization válido.
- [ ] Paywall de 20 questions aparece para novo user em trial em `templosagrado.lovable.app`.
- [ ] Teste manual: gerar JWT forjado com sub arbitrário e bater em `check-subscription` → 401.
- [ ] Dashboard admin mostra: nº de requests por function nas últimas 24h + custo estimado.
- [ ] `.env` fora do git; `.env.example` commitado.
- [ ] Smoke test Playwright: signup → chat → paywall → checkout (modo Stripe test).
- [ ] Conversão trial → pago medida antes e depois do F0.1 (métrica-chave).

---

# Fase 1 — Fundação para escala (Semanas 2-4)

**Objetivo:** preparar o produto para crescer 10x sem incidentes. Não precisa atingir 500k — precisa aguentar 100k com head room.

| # | Task | Esforço | Métrica de sucesso |
|---|---|---|---|
| F1.1 | TS-101 — Rate limiting por IP + por user em todas as functions (`_shared/rateLimit.ts`) | M | Bot com 1k req/min é bloqueado em 10s |
| F1.2 | TS-102 — Code-splitting de todas as páginas com `React.lazy` + `manualChunks` vendor | S | Initial bundle < 200KB gzipped |
| F1.3 | TS-103 — `QueryClient` com `staleTime/gcTime/retry` configurados | XS | Requests Supabase ao mudar foco de aba: 0 (vs N atual) |
| F1.4 | TS-104 — Comprimir `pwa-192x192.png` para <20KB, adicionar webp | XS | Tamanho -98% |
| F1.5 | TS-107 — Webhook Stripe como fonte de verdade; `check-subscription` vira fallback | L | Fila `profiles.is_subscriber` sync < 5s após cobrança |
| F1.6 | TS-109 — Consent gate LGPD para geolocalização + consent UI básica | M | % de users com consentimento explícito registrado |
| F1.7 | TS-111 — Remover emails hardcoded de admin, mover pra `admin_bootstrap` | S | — |
| F1.8 | TS-112 — `cancel-subscription` fire-and-forget no email | XS | p95 latência de cancel cai |
| F1.9 | TS-201 — CORS allowlist por função | S | Bloqueio confirmado para origin diferente |
| F1.10 | TS-110 — `_shared/traditions.ts` — centralizar SACRED_TEXTS/PHILOSOPHY_TEXTS | M | 3 functions diff-livre |
| F1.11 | Instrumentação completa — Axiom/Logflare + correlation IDs | M | 100% dos request com trace_id |
| F1.12 | ErrorBoundary global + fallback UI amigável | S | Zero crash branco mostrado a user |
| F1.13 | CI: lint + typecheck + vitest + build no GitHub Actions | M | PR que quebrar é bloqueado |
| F1.14 | Smoke tests Playwright das 8 rotas principais | M | Cobertura dos fluxos golden path |
| F1.15 | TS-105 — Ativar TypeScript strict progressivamente (primeiro `src/lib/`) | M | src/lib passa `tsc --noEmit --strict` |
| F1.16 | TS-206 — `redeem-invite` atomic update em `times_used` | XS | Race test (10 paralelas) respeita max_uses |
| F1.17 | Índices hot path — `chat_messages(user_id, created_at DESC)`, `activity_history(user_id, created_at DESC)`, `user_memory(user_id, created_at DESC)`, `prayer_wall_posts(is_public, created_at DESC)` | S | EXPLAIN mostra index-scan em queries do app |
| F1.18 | Migration: adicionar `profiles.stripe_customer_id` + usar como fonte (substituir `customers.list({email})`) | M | Lookups Stripe caem ~80% |
| F1.19 | TS-208 — Usar `stripe_customer_id` em todas as functions de payment | S | — |
| F1.20 | TS-205 — `moderate-post` fail-closed em erro de IA + review queue | S | Nenhum post inapropriado vaza por erro de moderação |

**Marcos de decisão (gate semana 3):**

- Se incidentes P0 surgirem na fase 0 → pausar Fase 1, foco em estabilização.
- Se métrica de receita **não** subir após F0.1 → investigar (talvez o fluxo de checkout tenha outro bug — ver TS-008 + Stripe webhook + o fluxo de trial).
- Se custo de IA **não** cair após F0.2 → investigar se há clientes legítimos usando endpoints antigos; manter compatibilidade de transição.

**Critério de saída Fase 1:**

- [ ] Playwright suite cobre signup, login, chat (10 msgs), paywall, checkout, TTS, post no mural, cancel — 100% green em CI.
- [ ] Lighthouse PWA >= 90 (atualmente estimado < 60 por causa do icon + bundle).
- [ ] Axiom mostra p95 latência por função, e alertas configurados para > 3s.
- [ ] Sentry mostra error rate < 0.5% no browser por 7 dias consecutivos.
- [ ] `templosagrado.com.br` (ou domínio próprio) configurado com DKIM/SPF → Resend pode mandar do domínio oficial (eliminar `onboarding@resend.dev`).
- [ ] Todas as páginas lazy-carregadas. Verificar no devtools Network que `/admin` não é baixado no landing.

---

# Fase 2 — Escala 500k (Semanas 5-8)

**Objetivo:** remover os tetos técnicos restantes para comportar 500k MAU. Aqui o trabalho vira mais de engenharia de dados e operação.

### 2.A — Banco de dados (semana 5)

| Task | Detalhe |
|---|---|
| Conectar via Supavisor (transaction mode) nas edge functions | Edge runtime abre conexão curta; usar pooler evita esgotar max_connections |
| Identificar e particionar tabelas grandes | `chat_messages` cresce com uso; particionar por `created_at` mensal quando > 50M linhas |
| Matviews para analytics | `admin_stats`, `funnel_daily` — refresh via `pg_cron` cada 5 min |
| Migration de `profiles`: split de cold vs hot | Campos usados toda request (is_subscriber, questions_*) numa tabela enxuta; geo/preferences numa tabela secundária. Ou adicionar índice parcial |
| Backups point-in-time + runbook de restauração | — |
| Read replica para dashboards / relatórios | Eleva o plano Supabase; justifica se admin queries impactam prod |

### 2.B — IA e custo (semana 6)

| Task | Detalhe |
|---|---|
| Cache de prompts fixos | SACRED_TEXTS / PHILOSOPHY_TEXTS em LOVABLE AI Gateway via `prompt_caching` (se disponível) |
| Cache de embeddings do RAG | LRU in-function + `knowledge_chunks` com `pgvector HNSW index` |
| Budget per-user | Tabela `ai_usage(user_id, month, cents_used)` — hard-cap mensal em planos; soft-cap em trial |
| Kill-switch global | Flag `ai_enabled` em `app_config` table. Se for zerada, todas as functions retornam 503. Operador liga via SQL em incidente |
| Downgrade automático | Se gateway upstream retornar 402/429 X vezes/min, fallback para modelo mais barato |
| Tokens estimados e armazenados | Cada request AI → linha em `ai_usage` com `tokens_in`, `tokens_out`, `model`, `duration_ms` |
| **Projeção de custo 500k:** | Ver seção "Custos projetados" abaixo |

### 2.C — Cliente e PWA (semana 7)

| Task | Detalhe |
|---|---|
| Skeleton screens em todas rotas | UX melhor durante lazy-load |
| Virtualização de listas | `ChatHistory`, `Mural` podem ter > 100 itens; usar `@tanstack/react-virtual` |
| Imagens do mural / sagradas via CDN | `public/images/sacred/*.jpg` cresce; mover para Supabase Storage público com transformação on-fly ou Cloudinary |
| Service worker strategy revisão | `vite-plugin-pwa` com `CacheFirst` para assets, `NetworkFirst` com timeout 3s para API, `StaleWhileRevalidate` para rotas conteúdo |
| Offline-first para chat | Queue de mensagens pending + sync quando voltar online |
| Bundle analyzer no CI | Alerta quando tamanho inicial aumenta > 10% |
| Fonts subseted | Se usa Georgia/Inter, substituir por woff2 subseted |

### 2.D — Segurança e compliance (semana 8)

| Task | Detalhe |
|---|---|
| Webhook Stripe assinado + idempotent | Verificar `Stripe-Signature` header, armazenar `event.id` em `stripe_webhook_events` para dedupe |
| LGPD: endpoint `GET /api/me/export` | Dump JSON de profiles, chat_messages, user_memory, activity_history, prayer_wall_posts do próprio user |
| LGPD: endpoint `DELETE /api/me` | Cascade delete com log em `account_deletions` (email hash, motivo, data) |
| DPA com subprocessors | Stripe, ElevenLabs, Resend, Firecrawl, Lovable, Supabase — listar em `docs/PRIVACY.md` |
| Atualizar `/privacy` com inventário de PII | nome, email, data_nascimento, latitude/longitude, preferred_religion, memórias de conversa |
| CSP headers no deploy (se controlável) | `default-src 'self'; script-src 'self' ...` |
| Security headers | HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff |
| Pen-test leve (Burp/OWASP ZAP) | Antes do lançamento pago em larga escala |
| Revisar RLS com `pg_graphql` / `pg_audit` | Cobertura 100% em queries em produção |
| Roles distintas: `app_user`, `app_admin` | Hoje só `admin` em `user_roles` — OK, mas formalizar estratégia |

### 2.E — Operação (semana 8)

| Task | Detalhe |
|---|---|
| Runbook de incidentes (SEV1/SEV2/SEV3) | Em `docs/RUNBOOK.md` |
| Alertas: budget AI, erro > 1%, p95 > 3s, queue Stripe webhook atrasada | PagerDuty ou email/Slack |
| Testes de carga com k6 | Script em `loadtest/chat.js` simulando 1000 concurrent users |
| Playbook de rollback | Cada componente — client deploy, edge function, migration — com passo-a-passo |
| Status page pública | status.templosagrado.com.br (Instatus, Statuspage) |
| On-call rotation | Min. 1 pessoa acordável 24/7 nos primeiros meses da escala |

---

## Custos projetados para 500k MAU

Estimativa ballpark — ajustar com métricas reais após Fase 1.

| Item | Premissas | Custo/mês BRL |
|---|---|---|
| Supabase Team plan | 100GB DB + 500k auth users + 100GB egress | R$ 1.500 |
| Supabase Branching / Pitr | compute addon | R$ 700 |
| Stripe fees | 4% + R$0,50 em R$19,90 plano = ~R$1,30/user; com 3% convertendo = 15k pagantes | R$ 295k de fees (em R$ 298k de GMV) |
| Lovable AI Gateway (Gemini 2.5 Flash) | 500k users × 20 msgs/mês free-tier → apenas converted paying = ~15k × 60 msgs × 2k tokens × $0,10/Mtok | R$ 9k |
| ElevenLabs | 300 narrações/user/mês × 15k pagantes × 500 chars × $0,10/1k chars | R$ 11k |
| Resend | 500k emails transacionais/mês | R$ 500 |
| Sentry Team | — | R$ 150 |
| Axiom / Logflare | 100GB logs/mês | R$ 250 |
| Cloudflare Pro ou CDN | imagens + cache | R$ 100 |
| Firecrawl | admin-only, uso esporádico | R$ 100 |
| **Total custo infra** | | **~R$ 23.300** |

MRR projetado 500k MAU (3% convertendo a R$19,90 médio): **R$ 298.500/mês**
Lucro bruto operacional estimado (antes de fees Stripe): **R$ 275k/mês** ⇒ margem ~92%
Depois dos fees Stripe: **R$ ~3k/mês** de lucro apenas com conversão de 3% (sensível!)

**Alavancas críticas para melhorar margem:**

1. Subir conversão trial→paid (hoje desconhecida — DADO que o paywall estava quebrado, provavelmente < 1%; pós-fix: meta 5%).
2. Aumentar ticket médio via plano Iluminado (R$39,90).
3. Annual pricing: reduz fees Stripe por retenção.
4. Segmentar mercados: PT-BR é core, mas US/ES abrem ARPU maior.

---

## Testes de carga recomendados

```js
// loadtest/chat.js — k6
import http from 'k6/http';
import { sleep } from 'k6';
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // ramp to 100 VUs
    { duration: '5m', target: 500 },   // stay at 500
    { duration: '2m', target: 1000 },  // spike
    { duration: '3m', target: 0 },     // ramp-down
  ],
  thresholds: { http_req_duration: ['p(95)<3000'], http_req_failed: ['rate<0.01'] },
};
export default function() {
  const payload = JSON.stringify({
    messages: [{ role: 'user', content: 'Como lidar com ansiedade?' }],
    context: { religion: 'catholic', mood: 'anxious' },
    language: 'pt-BR',
    userId: __ENV.USER_ID,  // JWT por-VU
  });
  http.post(`${__ENV.BASE}/functions/v1/sacred-chat`, payload, {
    headers: { 'Authorization': `Bearer ${__ENV.JWT}`, 'Content-Type': 'application/json' },
  });
  sleep(3);
}
```

Executar **após F0** para ter baseline. Metas:
- p95 `/sacred-chat` < 3s com 500 VUs
- p95 `/verse-of-day` (cache hit) < 300ms com 1000 VUs
- Error rate < 1%
- Sem 5xx em picos

---

## Runbook de incidentes (esqueleto)

Arquivo completo em `docs/RUNBOOK.md` (próximo PR). Template:

### SEV1 — Paywall/receita quebrada
**Sinal:** MRR cai > 5% em 1h, ou conversão trial→paid cai > 50%.
**First action:** checar `isPreviewEnvironment` e `profiles.is_subscriber` distribuição. Rollback do último deploy do client.

### SEV1 — Custo IA explodindo
**Sinal:** dashboard de custo > 200% da média em 10min.
**First action:** acionar kill-switch `ai_enabled=false` via SQL. Investigar IP rate limits (bot?) antes de religar.

### SEV1 — Supabase indisponível
**Sinal:** 5xx > 10% por > 2min.
**First action:** page Supabase support, exibir banner de status no app, aumentar retry no cliente, verificar Supabase status page.

### SEV2 — Email failing
**Sinal:** Resend retornando bounce > 5%.
**First action:** verificar reputação do domínio DKIM/SPF, reverter a `onboarding@resend.dev` como fallback.

---

## Checklist LGPD

- [ ] Política de Privacidade pública e datada em `/privacy` — hoje existe [src/pages/Privacy.tsx](../src/pages/Privacy.tsx), revisar conteúdo.
- [ ] Inventário de dados pessoais documentado (ver seção 2.D).
- [ ] Base legal declarada por categoria (consentimento para geo/memória; execução de contrato para billing; legítimo interesse para logs de segurança).
- [ ] DPO (Data Protection Officer) nomeado — mesmo se for o fundador. Email público.
- [ ] Consent UI: banner de cookies (se usa analytics); toggle explícito para geolocalização; toggle para "memória personalizada" (já existe em profile — garantir gravado corretamente).
- [ ] Direito de acesso: endpoint de export.
- [ ] Direito de retificação: UI para editar profile (tem parcial em Profile.tsx).
- [ ] Direito de exclusão: endpoint de delete + log anonimizado.
- [ ] Direito de portabilidade: export em JSON standard.
- [ ] DPIA (Avaliação de Impacto) — feita uma vez; atualizar se tratamento mudar significativamente.
- [ ] Contratos com operadores (Stripe, Lovable AI, ElevenLabs, Resend, Firecrawl, Supabase) — arquivar DPAs.
- [ ] Notificação de incidente — ANPD em até 72h em caso de vazamento.

---

## Resumo das 3 fases em 1 página

```
                         ┌──────── FASE 0 ─────────┐   ┌─── FASE 1 ────┐   ┌──── FASE 2 ────┐
                         │    Parar sangramento    │   │  Fundação 10x │   │  Escala 500k   │
                         │      (semana 1)         │   │  (sem 2–4)    │   │  (sem 5–8)     │
                         └─────────────────────────┘   └───────────────┘   └────────────────┘

Paywall & billing        ✅ TS-001 fix                  ✅ Webhook Stripe   ✅ Idempotent
                         ✅ TS-008 allowlist priceId                        ✅ Pricing A/B

Segurança edge fns       ✅ TS-002 auth em todas         ✅ TS-201 CORS      ✅ Pen-test
                         ✅ TS-003 JWT verify            ✅ TS-101 rate lim  ✅ CSP headers
                         ✅ TS-007 AdminRoute            ✅ TS-205 moderação

Quota & abuse            ✅ TS-004 atomic SQL            ✅ TS-206 invite   ✅ Budget/user
                                                        ✅ Idempotency     ✅ Kill-switch IA

Escala cliente           —                               ✅ TS-102 lazy     ✅ Virtualização
                                                         ✅ TS-103 RQ       ✅ Offline-first
                                                         ✅ TS-104 PWA icon ✅ CDN imagens

Banco de dados           —                               ✅ Índices hot     ✅ Matviews
                                                         ✅ stripe_cust_id  ✅ Partitioning
                                                                            ✅ Read replica

Observabilidade          ✅ Sentry básico                ✅ Axiom + trace   ✅ Dashboards
                         ✅ Dashboard custo IA           ✅ Alertas         ✅ Status page

Qualidade                ✅ .env fora do git             ✅ CI GH Actions   ✅ Loadtest k6
                                                         ✅ Smoke Playwright ✅ Runbook
                                                         ✅ TS-strict /lib

Compliance               —                               ✅ LGPD consent    ✅ Export/Delete
                                                         ✅ DKIM/SPF        ✅ DPA/DPIA
```

---

## Como operar este plano

1. **Time:** esta carga de trabalho (4-8 semanas) assume 1 dev full-time sênior, ou 2 mid-level com pair. Fase 2 especialmente se beneficia de alguém com experiência em Postgres/operações.
2. **PRs pequenos.** Cada linha da tabela = 1 PR. Nunca misturar fases.
3. **Deploy diário na Fase 0.** Urgência receita. Observar por 24h antes de avançar.
4. **Retros semanais.** Fim de cada semana, revisar métricas contra os critérios de saída. Só avança se bater.
5. **Congelar features novas** durante Fases 0 e 1 (exceto bugs de produção P0). Produto cresce mais com estabilidade do que com features na situação atual.
6. **Comunicação transparente com usuários pagantes** caso algo precise de downtime: email + banner no app com 48h de antecedência. 10k+ pagantes exigem respeito.

---

## Apêndice: commits sugeridos para Fase 0 (ordem)

```
1.  fix: restringe isPreviewEnvironment a localhost (TS-001)
2.  chore: gitignore .env + cria .env.example (TS-006)
3.  feat(edge): auth obrigatória em sacred-chat (TS-002a)
4.  feat(edge): auth obrigatória em generate-prayer (TS-002b)
5.  feat(edge): auth obrigatória em generate-post (TS-002c)
6.  feat(edge): auth obrigatória em elevenlabs-tts (TS-002d)
7.  feat(edge): auth + admin gate em send-prayer-email (TS-002e)
8.  feat(edge): cron secret em send-trial-reminders (TS-002f)
9.  fix(edge): check-subscription usa auth.getUser (TS-003)
10. feat(sql): function atomic try_consume_question (TS-004)
11. refactor(edge): sacred-chat usa try_consume_question (TS-004)
12. feat(client): AdminRoute com role check (TS-007)
13. feat(edge): allowlist de priceId em create-checkout (TS-008)
14. feat(edge): allowlist de priceId em change-subscription (TS-008)
15. chore: Sentry browser + edge
16. feat(admin): dashboard de custo AI
17. chore: rotação de secrets (se necessário)
```

Cada commit independente, revertível. Começa e termina com build verde.
