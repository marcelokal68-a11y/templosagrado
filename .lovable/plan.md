

## Plano — Upgrade Devoto → Iluminado (com proração) e Downgrade sem reembolso

### Como funciona hoje
- `create-checkout` **bloqueia** com erro 409 se o usuário já tem assinatura ativa.
- Não há fluxo de troca de plano dentro do app — só "Gerenciar assinatura" que abre o portal Stripe.
- Resultado: usuário Devoto não consegue migrar para Iluminado pelo app.

### Como vai funcionar

**Upgrade (Devoto → Iluminado):**
- Stripe atualiza a assinatura existente trocando o item de preço.
- Usa `proration_behavior: 'always_invoice'` → o Stripe **calcula automaticamente a diferença proporcional** dos dias restantes do mês/ano atual e cobra **imediatamente** no cartão do cliente.
- A partir da próxima renovação, cobra o valor cheio do plano Iluminado.
- Acesso ao Iluminado é liberado na hora.

**Downgrade (Iluminado → Devoto):**
- Stripe agenda a troca para o **fim do período já pago** (`proration_behavior: 'none'` + agendamento via Subscription Schedule, ou troca imediata sem crédito).
- **Sem reembolso, sem cashback.** Usuário continua Iluminado até o fim do ciclo pago, depois vira Devoto.
- Aviso claro na UI antes de confirmar.

**Mudança de ciclo (Mensal ↔ Anual no mesmo plano):** mesma lógica — upgrade (mensal→anual) com proração imediata; downgrade (anual→mensal) só vale na renovação.

---

### Arquivos a criar / modificar

**1. Nova edge function `supabase/functions/change-subscription/index.ts`**
- Recebe `{ newPriceId, mode: 'upgrade' | 'downgrade' }`.
- Busca a assinatura ativa do usuário no Stripe.
- Calcula se é upgrade ou downgrade comparando o valor do preço atual vs o novo.
- **Upgrade**: chama `stripe.subscriptions.update()` com:
  ```ts
  items: [{ id: currentItemId, price: newPriceId }],
  proration_behavior: 'always_invoice'  // cobra a diferença na hora
  ```
- **Downgrade**: chama `stripe.subscriptions.update()` com:
  ```ts
  items: [{ id: currentItemId, price: newPriceId }],
  proration_behavior: 'none',  // sem crédito/cobrança
  billing_cycle_anchor: 'unchanged',
  // agenda para mudar só no próximo ciclo via Subscription Schedule
  ```
  Para garantir que o downgrade só vire ativo no fim do período, usa `stripe.subscriptionSchedules.create()` ancorado no `current_period_end`.
- Retorna `{ success, type: 'upgrade'|'downgrade', effective_date, prorated_amount }`.

**2. Atualizar `src/pages/Pricing.tsx`**
- Detectar quando o usuário **já é assinante** e está clicando em outro plano.
- Em vez de chamar `handleSubscribe` (checkout novo), chamar novo handler `handleChangePlan(planKey)`.
- Mostrar **AlertDialog de confirmação** diferente para cada caso:
  - **Upgrade** (Devoto→Iluminado, ou Mensal→Anual): "Você pagará a diferença proporcional dos dias restantes (~R$ X) agora. A partir de [data], será cobrado R$ Y/mês."
  - **Downgrade** (Iluminado→Devoto, ou Anual→Mensal): "Sua assinatura atual continua ativa até [data fim do ciclo]. Não há reembolso. Após essa data, você passa ao plano [novo] por R$ Y."
- Botões dos cards de planos passam a habilitar para troca quando já assinante (em vez do `disabled`).

**3. Pequeno ajuste em `create-checkout/index.ts`**
- Manter o bloqueio 409 (continua sendo a porta de "nova assinatura"), mas a UI agora roteia upgrades pelo `change-subscription` antes de cair aqui.

---

### Mensagens de UI (português)

**Upgrade:**
> "Você está fazendo upgrade para Iluminado. Cobraremos hoje apenas a diferença proporcional dos dias restantes do seu ciclo atual. A partir da próxima renovação, o valor será R$ 39,90/mês. Confirmar?"

**Downgrade:**
> "Sua assinatura Iluminado já paga continuará ativa até [DD/MM/AAAA]. Não há reembolso ou crédito pelo período não usado. Após essa data, sua conta passará automaticamente para o plano Devoto (R$ 19,90/mês). Confirmar?"

---

### Resumo técnico
- **1 nova edge function** (`change-subscription`)
- **1 página atualizada** (`Pricing.tsx`) com novo handler + dois diálogos de confirmação
- Stripe faz todo o trabalho pesado de cálculo proporcional via `proration_behavior`
- Banco de dados: nenhuma migration necessária — `check-subscription` já sincroniza o `product_id` correto após a troca

