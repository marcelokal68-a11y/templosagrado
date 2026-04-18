

## Problema identificado

A pergunta "Quem foi Charles Spurgeon?" não está aparecendo do nada — ela vem de um sistema de **sugestões automáticas** que obriga a IA a adicionar 3 perguntas-resposta clicáveis ao final de cada mensagem. Visualmente, esses chips em cor primária parecem que a IA está perguntando por conta própria.

Existem **dois locais** com esse comportamento forçado:

1. **`supabase/functions/sacred-chat/index.ts`** (chat principal `/`): instrui o modelo com "SUGESTÕES OBRIGATÓRIAS: Ao final de CADA resposta, adicione `[SUGGESTIONS]q1|q2|q3[/SUGGESTIONS]`".
2. **`supabase/functions/learn-chat/index.ts`** (chat `/learn`): instrui com "After EVERY response, you MUST end with `---SUGGESTIONS---[...]`".

O frontend (`ChatArea.tsx` e `Learn.tsx`) renderiza esses blocos como botões grandes e visíveis, criando a impressão de que a IA pergunta espontaneamente sobre figuras como Charles Spurgeon (que aparece no contexto Protestante).

## Solução

**Remover completamente** as sugestões geradas pela IA em ambos os chats. O `/learn` continuará tendo os `StarterQuestionChips` curados (5 perguntas estáticas trilíngues por tradição) que aparecem **apenas antes da primeira pergunta do usuário** — esses são intencionais e curados, não espontâneos.

### Mudanças

**1. `supabase/functions/sacred-chat/index.ts`**
- Remover o bloco "SUGESTÕES OBRIGATÓRIAS" (instrução para gerar `[SUGGESTIONS]...[/SUGGESTIONS]`).
- Remover as menções correlatas no system prompt (linhas que dizem "As [SUGGESTIONS] abaixo já oferecem caminhos…", "NÃO inclua [SUGGESTIONS] quando…").

**2. `supabase/functions/learn-chat/index.ts`**
- Remover o bloco "SUGGESTION FORMAT" (instrução `---SUGGESTIONS---[...]`).

**3. `src/components/ChatArea.tsx`**
- Manter `parseSuggestions` apenas como guarda defensiva (caso o modelo escape e ainda emita o bloco, ele é removido do texto exibido), mas **não renderizar mais os botões de sugestão**.
- Remover o JSX dos chips de sugestão (`{!isUser && isLast && suggestions.length > 0 && …}`) e o "visitor locked suggestions hint".

**4. `src/pages/Learn.tsx`**
- Manter `parseSuggestions` como guarda defensiva (limpa o texto se o modelo emitir o bloco).
- Remover a renderização dos botões de sugestões da IA.
- Manter `StarterQuestionChips` (perguntas curadas iniciais) — esses são os bons.

### Resultado esperado

- A IA responde e **para**. Não anexa mais perguntas próprias.
- Em `/learn`, o usuário ainda vê 5 perguntas sugeridas curadas (do `starterQuestions.ts`) **antes** de fazer sua primeira pergunta — depois disso, conversa livre sem chips automáticos.
- Conversa fica controlada pelo usuário, sem a sensação de "chat fazendo perguntas sozinho".

