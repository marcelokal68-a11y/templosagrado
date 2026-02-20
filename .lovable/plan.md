

# Ajustar Estilo de Citacoes no Chat do Sacerdote

## Resumo

Alterar o prompt do sistema na edge function `sacred-chat` para que as respostas da IA sejam mais diretas, com menos citacoes (maximo 2 por resposta), sempre contextualizadas com frases introdutorias como "de acordo com...", "como nos ensina...", e nunca entre parentesis.

---

## Arquivo a Modificar

### `supabase/functions/sacred-chat/index.ts`

Alterar as regras de citacao no `systemPrompt`. Substituir a regra atual:

```text
ATUAL:
- When citing scripture or philosophical works, use: "text" -- Source Book Chapter:Verse (when applicable).

NOVO:
- Use NO MORE than 2 citations per response. Less is more.
- NEVER use parentheses for citations. Instead, weave them naturally into your prose with introductory phrases like "de acordo com...", "como nos ensina...", "conforme escrito em...", "nas palavras de...", "according to...", "as taught in...".
- Example: Instead of '"Be still" (Psalm 46:10)', write 'Como nos ensina o Salmo 46:10, "Aquietai-vos"'.
- Be MORE DIRECT and concise. Speak from the heart, not from a bibliography.
```

Tambem reforcar no prompt geral:
- Remover a regra `Do NOT use bullet points or lists` (ja existe) e adicionar enfase em ser direto e poetico sem excesso academico.

---

## Detalhes Tecnicos

A mudanca e apenas no bloco `systemPrompt` dentro da funcao `sacred-chat/index.ts`, nas linhas das CRITICAL RULES. Nenhum outro arquivo precisa ser alterado. A edge function sera reimplantada automaticamente apos a edicao.

### Regras atualizadas no systemPrompt:

```text
CRITICAL RULES:
- Your responses must have AT MOST 12 lines. Be direct, profound, and impactful.
- Every word must carry weight. Be poetic, empathetic, and deeply moving.
- Use AT MOST 2 citations per response. Fewer is better.
- NEVER place citations in parentheses. Weave them naturally into your prose using introductory phrases such as "de acordo com", "como nos ensina", "conforme escrito em", "nas palavras de".
- Example: Instead of '"Be still" (Psalm 46:10)', write 'Como nos ensina o Salmo 46:10, "Aquietai-vos e sabei que eu sou Deus"'.
- Be DIRECT and heartfelt. Speak as a wise elder sharing from lived experience, not as an academic listing references.
- [sourceInstruction mantido]
- Never judge or condemn...
- [demais regras mantidas]
```

