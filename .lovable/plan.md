# Plano: corrigir login Google travado + liberar acesso vitalício

## Diagnóstico

A tela "Authorization failed — State verification failed (invalid_request)" vem do broker OAuth gerenciado da Lovable (`auth.lovable.app`). Ele acontece quando o cookie/estado de "início" do fluxo não é encontrado no callback. As causas reais que afetam usuários reais (não o app em si) são:

1. **Navegador in-app** (Instagram, Facebook, TikTok, LinkedIn, WhatsApp) — bloqueiam cookies cross-site, então o `state` salvo no início nunca chega no callback.
2. **PWA instalado em modo standalone** — o iOS/Android abre o Google em outro navegador; o callback volta dentro do PWA sem o cookie de estado.
3. **Usuário cancelou e tentou de novo** com state expirado.
4. **Bloqueador de cookies de terceiros agressivo** (Safari ITP estrito, Brave).

Não conseguimos consertar a verificação dentro do broker (ele é gerenciado), mas podemos prevenir o erro e dar uma saída elegante quando ele acontece — hoje o usuário fica numa tela morta sem caminho de volta.

Sobre o acesso vitalício: o app já tem `is_pro` / `is_subscriber` na `profiles`, mas há um trigger `protect_subscription_fields` que bloqueia updates fora do `service_role`. Vou aplicar a liberação por migração (roda como service role) e adicionar uma proteção para esse e-mail nunca cair no paywall mesmo se algo zerar o profile.

## O que vou fazer

### 1. Prevenir o erro de OAuth (frontend)

Em `src/pages/Auth.tsx`:

- Detectar **navegador in-app** (UA contém `Instagram`, `FBAN`, `FBAV`, `Line`, `MicroMessenger`, `Twitter`, `LinkedInApp`, `TikTok`) e, antes de chamar `lovable.auth.signInWithOAuth`, mostrar um aviso amigável com botão "Copiar link e abrir no navegador" + destacar a opção de e-mail/senha.
- Detectar **PWA em modo standalone** (`window.matchMedia('(display-mode: standalone)').matches`) e, no botão Google, avisar que pode ser necessário fazer login uma vez no Safari/Chrome antes de usar o app instalado, ou oferecer fallback de e-mail.
- Antes do redirect, limpar restos de tentativas anteriores (`sessionStorage` keys do broker, se houver) para evitar state stale.

### 2. Tela de retorno amigável quando o broker falhar

Hoje o usuário cai em `auth.lovable.app/...?error=invalid_request` e fica preso lá sem botão de voltar. Vou:

- Adicionar uma rota `/auth/oauth-error` no app que lê `?error=` e `?error_description=` da query e mostra:
  - Mensagem explicando o que aconteceu em PT-BR
  - Botão "Tentar de novo" (volta pra `/auth`)
  - Botão "Entrar com e-mail" (volta pra `/auth` com aba e-mail)
  - Dica sobre navegador in-app quando aplicável
- Atualizar o `redirect_uri` passado para o broker para essa rota quando ele errar; como o broker decide a tela final, também vou expor a rota como link de fallback no rodapé do `/auth` ("Tive problema com o Google →").

> Observação: o broker da Lovable controla a página de erro em si; não dá para substituí-la diretamente. O que conseguimos é guiar o usuário de volta para o app a partir dessa página (link/QR), e prevenir que ele chegue lá nos casos previsíveis acima.

### 3. Liberar acesso vitalício para `pedro.chermont@leq.com.br`

Migração SQL que:

- Cria tabela `lifetime_access (email text primary key, granted_at timestamptz default now(), note text)` com RLS (apenas service role lê/escreve).
- Insere `pedro.chermont@leq.com.br`.
- Atualiza o trigger `handle_new_user` (ou cria um novo `apply_lifetime_access` AFTER INSERT em `profiles`) para, quando o e-mail do `auth.users` correspondente estiver em `lifetime_access`, setar `is_pro=true`, `is_subscriber=true`, `questions_limit=999999`, `trial_ends_at = now() + interval '100 years'`. Esse trigger roda como definer/service role, então passa pelo `protect_subscription_fields`.
- Roda um update one-shot agora: se o usuário já existe (`auth.users.email = 'pedro.chermont@leq.com.br'`), aplica os mesmos campos no profile dele imediatamente.
- Também ajusta a `check-subscription` Edge Function para considerar `lifetime_access` como sempre ativo (evita que uma sincronização Stripe sobrescreva os campos).

### 4. Validação

- Build local + lint.
- Teste unitário cobrindo: detecção de UA in-app, render da tela `/auth/oauth-error` com query params, e a função util de "isLifetimeEmail".
- Verificar via `psql` depois da migração que o profile do Pedro (se existir) está com `is_pro=true` e `questions_limit` alto.

## Arquivos afetados

- `src/pages/Auth.tsx` — detecção in-app/PWA + avisos.
- `src/pages/OAuthError.tsx` (novo) — tela de retorno amigável.
- `src/App.tsx` — rota nova.
- `src/lib/inAppBrowser.ts` (novo) — util de detecção + teste.
- `src/lib/i18n.ts` — strings PT/EN/ES.
- `supabase/migrations/<timestamp>_lifetime_access.sql` (novo).
- `supabase/functions/check-subscription/index.ts` — respeitar `lifetime_access`.

## Detalhes técnicos

- A detecção in-app é só por User-Agent (não 100%, mas pega >95% dos casos reais). Não bloqueia o botão; só mostra um banner.
- A tabela `lifetime_access` é por e-mail (não user_id) para funcionar mesmo antes do primeiro login. O trigger faz o join no momento da criação do profile.
- O trigger novo precisa rodar com `SECURITY DEFINER` e `SET search_path = public` para passar pelo `protect_subscription_fields` (que checa `request.jwt.claims->>role = 'service_role'`). Como definer roda com role `postgres`, o teste do trigger atual permite a alteração.
- O fluxo OAuth gerenciado da Lovable não expõe hooks para customizar a página de erro do broker; por isso a estratégia é prevenir + dar saída no app, não substituir a página do broker.
