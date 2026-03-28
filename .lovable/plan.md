

# Perguntas Sugeridas + Resumo + Encerramento Empático

## 3 Features

### 1. Sugestões Dinâmicas de Perguntas (após cada resposta da IA)

**Onde**: System prompt do `sacred-chat` + parsing no `ChatArea.tsx`

**Como funciona**:
- Adicionar instrução no system prompt para que a IA, além da resposta normal, inclua um bloco especial `[SUGGESTIONS]` ao final com 3 perguntas separadas por `|`
- As perguntas devem ser progressivas: a 1a aprofunda o tema, a 2a toca na emoção, a 3a provoca reflexão profunda
- No frontend, o `ChatArea.tsx` faz parse da resposta, separa o texto visível das sugestões, e renderiza 3 botões clicáveis abaixo da bolha do assistente
- Ao clicar numa sugestão, ela é enviada como mensagem do usuário

**Formato na resposta da IA**:
```
[texto normal da resposta]
[SUGGESTIONS]Pergunta 1|Pergunta 2|Pergunta 3[/SUGGESTIONS]
```

O bloco `[SUGGESTIONS]...[/SUGGESTIONS]` é removido do texto visível e renderizado como botões.

### 2. Resumo da Conversa (copiar ou baixar PDF)

**Onde**: `ChatArea.tsx` — novo botão no menu ⋮

**Como funciona**:
- Opção "Gerar resumo" no dropdown menu, visível quando há mensagens
- Ao clicar, chama a edge function `sacred-chat` com uma mensagem especial que pede um resumo empático da conversa
- O resumo é exibido num Dialog com duas ações: "Copiar" e "Baixar PDF"
- O PDF é gerado client-side usando uma lib leve (jspdf) ou simplesmente `window.print()` com CSS adequado
- O resumo inclui: tema principal, sentimentos identificados, orientações dadas, e uma bênção final

### 3. Encerramento Automático após 6 Interações do Usuário

**Onde**: System prompt do `sacred-chat` + contador no `ChatArea.tsx`

**Como funciona**:
- O frontend conta quantas mensagens do usuário existem na sessão atual (mensagens com `role: 'user'`)
- Quando enviar a 6a mensagem, adiciona flag `isClosing: true` no body do request
- No system prompt, quando `isClosing` é true, instrui a IA a encerrar com uma mensagem empática de despedida como sumo sacerdote, sem fazer pergunta no final
- Após a resposta de encerramento, exibe automaticamente o botão "Gerar resumo" e desabilita o input com mensagem "Sessão encerrada — gere seu resumo ou inicie uma nova conversa"
- O usuário pode iniciar nova conversa limpando o chat

## Arquivos a editar

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/sacred-chat/index.ts` | Adicionar instrução de `[SUGGESTIONS]` no system prompt + lógica de encerramento quando `isClosing` |
| `src/components/ChatArea.tsx` | Parse de sugestões, botões clicáveis, contador de mensagens do usuário (6 max), UI de resumo (Dialog com copiar/PDF), estado de sessão encerrada |

Total: **2 arquivos** editados.

## Detalhes Técnicos

### System prompt — bloco adicional:
```
SUGESTÕES OBRIGATÓRIAS:
Ao final de CADA resposta, adicione um bloco com exatamente 3 perguntas sugeridas no formato:
[SUGGESTIONS]Pergunta curta 1|Pergunta mais emocional 2|Pergunta profunda 3[/SUGGESTIONS]
As perguntas devem:
- Ter relação direta com o tema da conversa
- Progredir em profundidade emocional
- A terceira deve tocar numa questão que ative emoção genuína
NÃO inclua o bloco [SUGGESTIONS] quando estiver encerrando a sessão.

ENCERRAMENTO (quando isClosing=true):
Esta é a última mensagem da sessão. Encerre como o sumo sacerdote da tradição escolhida:
- Faça um breve resumo do que foi conversado
- Ofereça uma bênção final profunda e personalizada
- NÃO faça perguntas
- NÃO inclua [SUGGESTIONS]
```

### Frontend — parse:
```typescript
const parts = content.split('[SUGGESTIONS]');
const visibleText = parts[0].trim();
const suggestions = parts[1]?.replace('[/SUGGESTIONS]', '').split('|') || [];
```

### Resumo — geração:
- Envia todas as mensagens da sessão para `sacred-chat` com flag `generateSummary: true`
- System prompt especial para resumo: "Gere um resumo empático desta conversa espiritual em formato estruturado"
- PDF gerado com `jspdf` (já está disponível ou será adicionado como dependência)

