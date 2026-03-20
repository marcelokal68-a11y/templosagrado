

# "Começar Agora" → Chat Direto (Free Trial)

## Problema
O botão "Começar Agora" na landing page leva para `/auth` (login). O usuário deveria ir direto para o chat (`/`) e experimentar o free trial (10 mensagens grátis) antes de precisar criar conta.

## Mudança

### `src/pages/Landing.tsx`
- Trocar o `navigate('/auth')` do botão "Começar Agora" para `navigate('/')`
- O chat já permite acesso sem login (free trial via `ProtectedRoute` + `FREE_TRIAL_ROUTES`)

1 arquivo, 1 linha alterada.

