

## Plano corrigido: Chat texto ilimitado para visitantes (recursos premium gated)

### Diferença vs. plano anterior
Visitantes deslogados têm chat de **texto ilimitado**, mas **TTS, STT, narração e perguntas sugeridas continuam exigindo login + assinatura/trial**.

### Comportamento por recurso (visitante deslogado)

| Recurso | Acesso |
|---|---|
| Enviar/receber mensagens de texto | ✅ Ilimitado |
| Áudio das respostas (TTS / botão Narrar) | 🔒 Login + trial/assinatura |
| Microfone / ditado (STT) | 🔒 Login + trial/assinatura |
| Perguntas sugeridas (parser `---SUGGESTIONS---`) | 🔒 Login + trial/assinatura |
| Mural, Versículo, Aprenda, Convidar | 🔒 Login → /pricing → recurso |
| Sidebar/drawer com todas as funcionalidades visíveis | ✅ Sempre visível (mas clica → /auth → /pricing) |

### Mudanças técnicas

**1. `src/components/ChatArea.tsx`**
- Remover limite de 12 mensagens para deslogados (apagar `getAnonCount`, `incrementAnonCount`, `anonUsed >= 12`).
- **Esconder os botões de áudio/microfone/sugestões para visitantes**:
  - Botão "Narrar" em cada resposta: só renderiza se `user` existe.
  - Botão de microfone (STT) no input: só renderiza se `user` existe; senão mostra um botão "🔒 Entrar para falar" que leva a `/auth?next=/pricing`.
  - Perguntas sugeridas (chips/botões abaixo das respostas): para visitantes, em vez de renderizar os chips clicáveis, mostrar um aviso discreto "🔒 Crie uma conta para receber perguntas sugeridas pelo mentor" → link para `/auth?next=/pricing`.
- Adicionar CTA persistente no topo: "💾 Salvar sua jornada e desbloquear áudio + Mural" → `/auth?next=/pricing`.
- Inserts em `chat_messages` / `activity_history` continuam só para logados.

**2. `src/components/AppSidebar.tsx`**
- Sidebar visível para visitantes (remover `if (!user) return null`).
- Itens: Chat, Aprenda, Versículo, Mural — todos clicáveis. Cliques em qualquer um exceto Chat acionam o gate via `ProtectedRoute`.

**3. `src/components/Header.tsx`**
- Drawer mobile mostra a mesma lista do logado (Aprenda, Versículo, Mural, Convidar, Pricing) + "Entrar" no topo.

**4. `src/components/ProtectedRoute.tsx`**
- Ao bloquear visitante: redirecionar para `/auth?next=/pricing&intent=<rota>` e salvar `sessionStorage.post_signup_intent = <rota>`.
- Continua liberando `/` (chat) para visitantes.

**5. `src/pages/Auth.tsx`**
- Após signup/login bem-sucedido: ler `?next=` ou `sessionStorage.post_signup_intent`. Se houver, ir para `/pricing?onboarding=1`; senão fluxo normal.

**6. `src/pages/Pricing.tsx`**
- Detectar `?onboarding=1` → mostrar copy: "Bem-vindo! Para acessar [funcionalidade], escolha um plano ou continue com seus 7 dias grátis."
- Botão "Continuar com 7 dias grátis" → lê `sessionStorage.post_signup_intent`, limpa o flag, navega para a rota intencionada.

### Resultado
```text
Visitante em /:
  ✅ Texto ilimitado
  🔒 Botão Narrar oculto / Microfone oculto / Sugestões bloqueadas
  💾 CTA suave: "Crie conta para áudio + Mural"
  📋 Sidebar mostra Aprenda, Versículo, Mural

Visitante clica em Mural (ou em qualquer botão 🔒):
  → /auth?next=/pricing  
  → /pricing?onboarding=1  
  → "Continuar com 7 dias grátis" → /mural ✓
```

### Notas
- Sem mudança de banco.
- Rate-limit de edge function (429) protege contra abuso no chat de texto.
- Tudo que custa API cara (TTS/STT/sugestões geradas pela IA) fica trancado atrás do login.

