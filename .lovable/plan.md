

## Diagnóstico (do screenshot)

O PDF saiu com **só o título + o bloco bruto `[SUGGESTIONS]...[/SUGGESTIONS]`** — o resumo real não aparece. Três causas:

1. **A LLM não recebe a conversa toda limpa.** Em `ChatArea.tsx:598`, `parseSuggestions` é aplicado para tirar o bloco — mas só na request. **Porém** a edge function `sacred-chat` recebe `messages` e injeta novamente a regra "adicione `[SUGGESTIONS]...` no final" (linha 506) **mesmo quando `generateSummary=true`**. Resultado: o modelo gera um resumo curto + um bloco `[SUGGESTIONS]` que vira o conteúdo do PDF.
2. **Resumo raso**: o prompt de resumo (linhas 522-528) usa `gemini-2.5-flash` e instrui formato com `**negrito**` e numeração — isso vira ruído visual no PDF (asteriscos, números soltos).
3. **PDF cru**: `downloadSummaryPdf` (linhas 644-653) só faz `splitTextToSize` sem cabeçalho, sem seções, sem espaçamento — daí "layout pobre".

## Mudanças

### 1. `supabase/functions/sacred-chat/index.ts` — resumo verdadeiramente analítico

Refatorar o branch `generateSummary` para ser **um caminho separado**:

- **Suprimir o bloco `[SUGGESTIONS]`** quando `generateSummary=true` (envolver linhas 506-513 em `${!generateSummary ? ... : ''}`).
- **Suprimir formatação Markdown** no prompt de resumo: pedir **texto corrido em prosa, sem `*`, sem `#`, sem `-`, sem números, sem emojis**, com seções separadas por linha em branco e títulos em **CAIXA ALTA** (ex: `JORNADA`, `O QUE VOCÊ TROUXE`, `CAMINHOS APONTADOS`, `BÊNÇÃO FINAL`).
- **Trocar modelo para `google/gemini-2.5-pro`** quando `generateSummary=true` — análise profunda merece o modelo Pro (já usado em `analyze-history`).
- **Reforçar análise integral**: "Analise TODA a conversa, da primeira à última mensagem. Não pule nada."
- Aumentar limite de tokens implícito enviando temperatura padrão e sem stream truncado.

### 2. `src/components/ChatArea.tsx` — PDF estruturado e bonito

Reescrever `downloadSummaryPdf`:

- Cabeçalho com nome do app, data formatada (pt-BR), tradição ativa (do `chatContext.religion`), e nome do usuário (do `user.email` ou metadata).
- Limpar resíduos: `summaryText.replace(/\[SUGGESTIONS\][\s\S]*?\[\/SUGGESTIONS\]/g, '').replace(/[*#`_~]/g, '').trim()` antes de renderizar — defesa em profundidade.
- Layout: margens 25mm, fonte serif (jsPDF `times`) p/ corpo, sans (`helvetica` bold) p/ títulos de seção, espaçamento entre parágrafos, rodapé "Templo Sagrado · {url}" em cinza.
- Quebra de página automática quando atingir base.
- Detectar títulos em CAIXA ALTA isolados em uma linha → renderizar como heading bold maior (14pt) com cor âmbar (#B8860B).
- Nome do arquivo: `templo-sagrado-${YYYY-MM-DD}.pdf`.

Também limpar o `summaryText` exibido no Dialog do mesmo jeito.

### 3. `src/components/ChatArea.tsx` — botão "Guardar na Minha Memória"

No Dialog do resumo (linhas 1235-1269), adicionar **3º botão** ao lado de Copiar/PDF:

```tsx
<Button variant="secondary" className="flex-1 gap-1.5" onClick={saveToMemory}>
  <Brain className="h-4 w-4" /> Guardar na Memória
</Button>
```

Função `saveToMemory`: insere em `activity_history`:
```ts
{ user_id, type: 'summary', title: `Resumo — ${new Date().toLocaleDateString('pt-BR')}`, content: cleanedSummary, metadata: { religion: chatContext.religion } }
```

Toast de confirmação "Guardado na sua jornada".

### 4. Nova rota `/journey` — "Minha Memória"

**Novo arquivo `src/pages/Journey.tsx`** — página dedicada que lista a jornada do usuário no Templo:

- Cabeçalho: "Minha Jornada no Templo" + subtítulo empático.
- Filtros (chips): Todos · Resumos · Conversas · Versículos · Orações · Práticas (reaproveitar `TYPE_FILTERS` de `ActivityHistory`).
- Lista cronológica reversa de `activity_history` agrupada por mês (ex: "Abril 2026").
- Cada item: card clean com ícone do tipo, data relativa ("há 2 dias"), título, preview de 2 linhas do `content`, botão expandir → mostra completo + ações: **Copiar**, **Baixar PDF** (se `type === 'summary'`), **Apagar**.
- Empty state: ilustração calma + "Sua jornada começa aqui. Cada conversa, oração e versículo aparece neste livro pessoal." + CTA "Conversar com o mentor".
- **Privacidade visível** no rodapé: "Apenas você vê esta página. Nem mesmo nossa equipe tem acesso."

**Adicionar rota** em `src/App.tsx`:
```tsx
import Journey from "./pages/Journey";
<Route path="/journey" element={<ProtectedRoute><Journey /></ProtectedRoute>} />
```

### 5. `src/components/Header.tsx` — novo item "Minha Memória" no menu

Inserir **abaixo de "Mural"** em ambos `loggedInItems` e `visitorItems`:

```tsx
{ label: 'Minha Memória', icon: Brain, action: () => navigate('/journey') },
```

Importar `Brain` do `lucide-react` (linha 6). Para visitantes, navegar para `/journey` mostrará o `ProtectedRoute` que redireciona para `/auth` — comportamento esperado.

### 6. `src/lib/i18n.ts` — chaves novas

| Chave | pt-BR | en | es |
|---|---|---|---|
| `nav.journey` | Minha Memória | My Journey | Mi Memoria |
| `journey.title` | Minha Jornada no Templo | My Journey in the Temple | Mi Camino en el Templo |
| `journey.empty` | Sua jornada começa aqui... | Your journey begins here... | Tu camino comienza aquí... |
| `chat.save_memory` | Guardar na Memória | Save to Memory | Guardar en Memoria |
| `chat.saved_memory` | Guardado na sua jornada | Saved to your journey | Guardado en tu camino |

Trocar literal `'Minha Memória'` por `t('nav.journey', language)` no Header.

## UX aplicado

- **Closure psicológica**: o resumo bem feito + ato de "Guardar na Memória" cria sensação de capítulo encerrado e transformação registrada.
- **Recognition over recall**: jornada visível em página própria; usuário não precisa lembrar quando conversou.
- **Estética do silêncio**: PDF sem `*` e `#` honra a sensibilidade do público sênior — texto fluido como uma carta.
- **Privacidade explícita**: reafirmar no rodapé da `/journey` reforça confiança (alinhado a `mem://architecture/security-privacy`).

## Fora de escopo

- Não criar nova tabela: `activity_history` já existe e cobre o caso (`type='summary'`).
- Não enviar o resumo por e-mail (pode ser fase 2).
- Não permitir editar o resumo (somente apagar).
- Não aplicar a mesma análise profunda em `learn-chat` (lá é estudo, não jornada pessoal).

