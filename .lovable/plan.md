

## Diagnóstico

A tela atual tem dois problemas:

1. **Não aparecem perguntas de continuidade (follow-ups)** após cada resposta do mentor. O parser `parseSuggestions` (linha 46-52 de `ChatArea.tsx`) existe e até captura o bloco `[SUGGESTIONS]...[/SUGGESTIONS]`, **mas**:
   - A edge function `sacred-chat/index.ts` linha 506 instrui explicitamente o modelo a **NUNCA** gerar esse bloco.
   - E mesmo que gerasse, o componente `MessageBubble` **não renderiza** os chips de sugestão (variável `suggestions` é descartada).

2. **Botão "Palavra do Sumo Sacerdote" (consolidar + PDF + copiar) está escondido** dentro do menu `MoreVertical` (⋮), pouco descobrível. O usuário pede que fique sempre visível.

## Mudanças

### 1. `supabase/functions/sacred-chat/index.ts` — habilitar follow-ups

Substituir a regra atual (linha 506) por instrução **oposta**:

```ts
IMPORTANTE: Ao final de CADA resposta (exceto na bênção de despedida), 
adicione um bloco com 3 perguntas curtas de continuidade que aprofundem 
a conversa, no formato exato:
[SUGGESTIONS]Pergunta 1?|Pergunta 2?|Pergunta 3?[/SUGGESTIONS]
As perguntas devem ser na primeira pessoa (como se o usuário as fizesse), 
naturais ao contexto da tradição/tema atual, e curtas (máx 8 palavras cada).
Exemplo: [SUGGESTIONS]Como aplico isso no dia a dia?|O que a Torá diz sobre isso?|Pode me dar um exemplo prático?[/SUGGESTIONS]
Não anuncie as sugestões no texto — apenas adicione o bloco no fim.
```

### 2. `src/components/ChatArea.tsx` — renderizar chips de follow-up

No `MessageBubble` (após o bloco de Fontes 📚, dentro da bolha do assistente), adicionar:

```tsx
{!isUser && suggestions.length > 0 && isLast && (
  <div className="mt-3 flex flex-col gap-1.5 animate-fade-in">
    <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
      Continue a conversa
    </p>
    {suggestions.map((s, i) => (
      <button
        key={i}
        onClick={() => onSuggestionClick?.(s)}
        className="text-left text-xs px-3 py-2 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all text-foreground/85"
      >
        ✨ {s}
      </button>
    ))}
  </div>
)}
```

Mostradas **apenas na última mensagem** (`isLast`) para não poluir histórico antigo. Ao clicar, dispara `doSendMessage(s)` (já existe via `onSuggestionClick`).

### 3. `src/components/ChatArea.tsx` — botão "Consolidar / PDF" sempre visível

Adicionar uma **barra de ações persistente** logo acima do input (dentro do bloco `<>...</>` linhas 1043-1130), visível sempre que `messages.length > 0`:

```tsx
{messages.length > 0 && !sessionClosed && (
  <div className="flex items-center gap-2 px-3 pt-1.5 pb-1 border-t border-border/30 bg-muted/20">
    <Button
      onClick={generateSummary}
      disabled={isGeneratingSummary}
      variant="ghost"
      size="sm"
      className="h-8 text-xs gap-1.5 text-foreground/75 hover:text-primary"
    >
      <FileText className="h-3.5 w-3.5" />
      {isGeneratingSummary ? 'Consolidando...' : 'Consolidar conversa'}
    </Button>
    <span className="text-[10px] text-muted-foreground ml-auto">
      Gera resumo + PDF + copiar
    </span>
  </div>
)}
```

O modal de resumo (`showSummaryDialog`, linhas 1199-1233) já tem os dois botões "Copiar" e "PDF" — não precisa mudar nada lá.

### 4. Manter o item duplicado no menu `⋮` (linhas 960-969)

Deixar o item no dropdown também — afinal usuários avançados podem preferir o menu. Custo zero, redundância benigna.

## UX aplicado

- **Affordance descoberta**: chips visíveis = usuário não precisa pensar "o que perguntar agora?".
- **Recognition over recall**: barra "Consolidar conversa" sempre visível elimina caça ao menu ⋮.
- **Progressive disclosure preservada**: chips só na última msg (não polui histórico); barra só quando há mensagens.
- **Mobile-friendly**: chips empilhados verticalmente, alvos toque ≥40px.

## Fora de escopo

- Aplicar follow-ups também em `learn-chat`/`Learn.tsx` (pode ser fase 2 — é estrutura idêntica).
- Persistir as sugestões no banco (são efêmeras; se o usuário recarregar, somem — comportamento aceitável).
- Botão "Baixar transcrição completa" sem resumo (foco mantido no resumo curador do mentor).

