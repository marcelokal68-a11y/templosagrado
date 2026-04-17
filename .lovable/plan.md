

## Plano: Trial de 7 dias + Painel Admin + Fluxo contínuo + Stripe pronto

### Diagnóstico atual

1. **Quem é admin hoje:** Hard-coded no edge function `admin/index.ts` — `marcelokal68@gmail.com` e `kalichsztein.marcelo@gmail.com`. No primeiro login, qualquer um desses recebe automaticamente role `admin` na tabela `user_roles`. O painel `/admin` já existe (`src/pages/Admin.tsx`) e funciona.

2. **Trial de 7 dias não funciona:** A coluna `trial_ends_at` existe mas:
   - Só é setada quando o usuário resgata um convite (`redeem-invite`)
   - Não é setada no signup normal
   - Nenhum lugar do app lê `trial_ends_at` para liberar acesso premium temporário
   - `check-subscription` reseta `questions_limit` para 12 quando o user não tem assinatura Stripe — sobrescreveria qualquer trial

3. **Fluxo após signup quebrado:** Em `Auth.tsx` no signup, mostra toast "verifique seu email" mas não navega. Como Lovable Cloud está com confirm email **off**, o user já está logado mas fica preso na tela de auth. No login normal vai pra `/`, mas não há onboarding/perfil obrigatório — o user cai direto no chat sem ter visto seu perfil/tradição.

4. **Sem botão "Salvar e entrar":** O `Profile.tsx` salva campo a campo mas não tem fluxo de onboarding "preencher perfil → entrar no app".

5. **Stripe:** Já configurado (`STRIPE_SECRET_KEY` presente, edge functions `create-checkout`/`check-subscription`/`customer-portal` existem, price IDs hard-coded em `Pricing.tsx`). Falta apenas integrar com a lógica de trial.

---

### Plano de implementação

#### 1. Trial de 7 dias automático no signup

**Migration** — atualizar `handle_new_user()` para usuários normais (não-whitelist):
```sql
-- usuários normais: 7 dias de acesso completo
INSERT INTO profiles (user_id, display_name, is_subscriber, questions_limit, trial_ends_at)
VALUES (NEW.id, ..., true, 60, now() + interval '7 days');
```
Whitelist (`free_access_emails`) continua com 100 anos. Admins serão tratados via lógica em `check-subscription`.

#### 2. Função utilitária de "tem acesso?"

Criar helper `src/lib/access.ts` com `hasActiveAccess(profile)`:
- Admin → sempre true
- `is_subscriber` Stripe ativo → true
- `trial_ends_at > now()` → true
- senão → false (mostrar paywall)

Expor `accessStatus` no `AppContext`: `'trial' | 'subscriber' | 'admin' | 'expired'` + `trialDaysLeft`.

#### 3. Atualizar `check-subscription` para respeitar trial

Não resetar `questions_limit` para 12 se `trial_ends_at > now()`. Só rebaixar quando trial expirou E não há assinatura.

#### 4. Banner de status no app

Componente `<TrialBanner />` no topo do chat:
- Trial ativo: "Você tem X dias grátis. [Assinar agora]"
- Trial expirado + não-assinante: bloqueia chat, redireciona pra `/pricing`
- Admin/assinante: nada

#### 5. Onboarding: signup → perfil → app

- `Auth.tsx` signup: após `signUp` bem-sucedido, navegar para `/profile?onboarding=true` (não para `/`).
- `Profile.tsx` em modo onboarding:
  - Mostra banner "Bem-vindo! Complete seu perfil para começar"
  - Botão fixo "Salvar e Entrar no Templo" no rodapé
  - Ao clicar: salva tudo e navega para `/`
- Login normal continua indo direto para `/`.

#### 6. Painel Admin já existe — pequenas melhorias

O `/admin` existente já tem: usuários, convites, promover admin, KPIs. Adicionar:
- **Aba "Acesso Livre"**: gerenciar `free_access_emails` (adicionar/remover emails que nunca pagam) — UI simples lista + input.
- **Indicador de trial** na tabela de usuários: nova coluna "Trial" mostrando dias restantes.
- Edge function `admin`: novas actions `list-free-access`, `add-free-access`, `remove-free-access`.

#### 7. Fluxo contínuo do paywall

- Quando trial expira: ao tentar mandar mensagem, banner "Seu trial acabou" + botão grande "Assinar" → `/pricing`.
- Em `/pricing`, após sucesso (`?success=true`), invocar `check-subscription` e voltar para `/` automaticamente.
- Stripe: tudo já está pronto; só atualizar `check-subscription` para preservar trial.

---

### Arquivos a tocar

| Arquivo | Ação |
|---|---|
| `supabase/migrations/...sql` | Atualizar `handle_new_user()` para setar trial 7 dias |
| `supabase/functions/check-subscription/index.ts` | Não rebaixar se em trial ativo |
| `supabase/functions/admin/index.ts` | Actions `list-free-access`, `add-free-access`, `remove-free-access` |
| `src/lib/access.ts` (novo) | Helper `hasActiveAccess` + `trialDaysLeft` |
| `src/contexts/AppContext.tsx` | Carregar `trial_ends_at`, expor `accessStatus`, `trialDaysLeft` |
| `src/components/TrialBanner.tsx` (novo) | Banner com CTA |
| `src/components/ChatArea.tsx` | Mostrar banner; bloquear envio se `expired` |
| `src/pages/Auth.tsx` | Signup → navegar para `/profile?onboarding=true` |
| `src/pages/Profile.tsx` | Modo onboarding com botão "Salvar e Entrar" |
| `src/pages/Admin.tsx` | Nova aba "Acesso Livre" + coluna trial na tabela |
| `src/pages/Pricing.tsx` | Após `?success=true`, redirecionar para `/` |

---

### Resumo do fluxo final

1. **Novo usuário** faz signup → cai em `/profile?onboarding=true` → preenche nome/tradição → clica "Salvar e Entrar" → vai para `/` com **7 dias de acesso completo**.
2. **Durante o trial:** banner discreto mostra "X dias restantes" + botão "Assinar".
3. **Trial expira:** chat bloqueado, usuário é levado para `/pricing` com Stripe pronto (mensal/anual, Devoto/Iluminado).
4. **Admins** (definidos por email no edge function ou via `/admin → Promover`): acesso ilimitado para sempre, sem nunca ver paywall.
5. **Whitelist** (`free_access_emails`, gerenciável em `/admin → Acesso Livre`): também ilimitado para sempre.
6. **Painel `/admin`** continua acessível só para admins, agora com gestão de acesso livre.

