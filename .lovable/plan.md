

# Renomear Planos e Descrições — Stripe + Frontend

## Situação Atual

Os 4 produtos no Stripe estão com nomes genéricos ("Divine Connection"), e a página de preços tem descrições básicas. Preciso alinhar tudo à marca Templo Sagrado.

## Proposta de Nomes e Descrições

| Plano | Nome Stripe | Descrição Stripe | Subtítulo na Pricing |
|-------|-------------|------------------|---------------------|
| Pro Mensal | Templo Sagrado — Devoto | Plano mensal com 60 mensagens/dia, versículo exclusivo, mural sagrado e áudio | "Sua jornada espiritual diária" |
| Pro Anual | Templo Sagrado — Devoto Anual | Plano anual com 60 mensagens/dia, versículo exclusivo, mural sagrado e áudio | "Sua jornada espiritual diária" |
| TOP Mensal | Templo Sagrado — Iluminado | Plano mensal ilimitado com acesso antecipado e suporte prioritário | "Para quem busca o máximo" |
| TOP Anual | Templo Sagrado — Iluminado Anual | Plano anual ilimitado com acesso antecipado e suporte prioritário | "Para quem busca o máximo" |

### Features atualizadas na Pricing Page

**Gratuito** — "Para experimentar o Templo"
- ✅ 10 mensagens por dia
- ✅ Chat com mentor espiritual
- ✅ Versículo do dia básico
- ❌ Sem publicar no mural
- ❌ Sem áudio das respostas
- ❌ Sem memória personalizada

**Devoto (Pro)** — "Sua jornada espiritual diária"
- ✅ 60 mensagens por dia
- ✅ Versículo do Dia exclusivo com áudio
- ✅ Publicar no Mural Sagrado
- ✅ Áudio em todas as respostas
- ✅ Memória personalizada (o mentor lembra de você)
- ✅ Histórico completo

**Iluminado (TOP)** — "Para quem busca o máximo"
- ✅ Tudo do Devoto +
- ✅ Mensagens ilimitadas
- ✅ Acesso antecipado a novidades
- ✅ Suporte prioritário

## Mudanças

### 1. Stripe — Atualizar 4 produtos (via Stripe tools)
Renomear nomes e descrições dos 4 produtos existentes.

### 2. `src/pages/Pricing.tsx`
- Renomear "Pro" → "Devoto", "Ilimitado" → "Iluminado"
- Atualizar subtítulos e listas de features conforme tabela acima
- Atualizar textos dos botões: "Assinar Devoto", "Assinar Iluminado"
- Atualizar badge de "⭐ Mais popular" para "⭐ Mais escolhido"

Total: 4 atualizações Stripe + 1 arquivo editado.

