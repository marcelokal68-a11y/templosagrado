## Auto-limpeza do Chat ao Trocar Afiliacao + Desfazer + Historico para IA

### Comportamento Desejado

1. Ao trocar religiao ou filosofia no painel de contexto, o chat limpa automaticamente
2. Um toast com botao "Desfazer" aparece por ~20 segundos, permitindo restaurar as mensagens apagadas
3. Cada sessao de chat fica vinculada a afiliacao (religiao ou filosofia) selecionada
4. A IA recebe um resumo do historico anterior do usuario para manter continuidade entre sessoes. ter memoria persistente.  buffer

### Mudancas no Banco de Dados

**Tabela `chat_messages**`: Adicionar coluna `philosophy` (text, nullable) para registrar a filosofia ativa quando a mensagem foi enviada (a coluna `religion` ja existe).

**Tabela `chat_sessions**` (nova): Para agrupar mensagens por sessao/afiliacao.


| Coluna            | Tipo        | Descricao                                          |
| ----------------- | ----------- | -------------------------------------------------- |
| id                | uuid PK     | Identificador da sessao                            |
| user_id           | uuid        | Referencia ao usuario                              |
| affiliation_type  | text        | 'religion' ou 'philosophy'                         |
| affiliation_value | text        | Ex: 'christian', 'stoicism'                        |
| started_at        | timestamptz | Inicio da sessao                                   |
| ended_at          | timestamptz | Quando a sessao foi encerrada (troca de afiliacao) |


### Mudancas nos Arquivos

**1. `src/contexts/AppContext.tsx**`

- Adicionar estado `previousMessages` (Msg[]) para guardar mensagens antes da limpeza (undo buffer)
- Adicionar estado `undoTimeout` para controlar o timer do desfazer
- Expor funcao `clearChatWithUndo()` que salva mensagens atuais, limpa o chat, e inicia timer de undo
- Expor funcao `undoClear()` que restaura mensagens do buffer

**2. `src/components/ContextPanel.tsx**`

- No `onSelect` de religiao e filosofia, ao trocar para um valor diferente (nao desmarcar), chamar `clearChatWithUndo()`
- No `confirmSwitch` (troca entre modo religiao/filosofia), tambem chamar `clearChatWithUndo()`

**3. `src/components/ChatArea.tsx**`

- Ao carregar mensagens do banco (useEffect com user), filtrar por afiliacao ativa (`religion` ou `philosophy` do chatContext)
- Ao salvar mensagens, incluir tambem o campo `philosophy` do contexto
- Adicionar logica de toast com botao "Desfazer" quando `clearChatWithUndo` e chamado

**4. `supabase/functions/sacred-chat/index.ts**`

- Antes das mensagens da sessao atual, buscar um resumo das ultimas conversas anteriores do usuario (historico cross-session)
- Adicionar ao system prompt uma secao "HISTORICO DO FIEL" com resumo das ultimas interacoes passadas, para que a IA considere o timeline completo

### Fluxo de Desfazer

```text
Usuario troca afiliacao
        |
        v
  Salva mensagens atuais em buffer
        |
        v
  Limpa chat (UI e estado)
        |
        v
  Exibe toast "Chat limpo. [Desfazer]"
        |
    /        \
Clica        Timer
Desfazer     expira (8s)
    |            |
Restaura     Descarta
mensagens    buffer
```

### Fluxo do Historico para IA

```text
Usuario envia mensagem
        |
        v
  Frontend envia ultimas 40 msgs da sessao atual
        |
        v
  Edge function sacred-chat recebe request
        |
        v
  Busca ultimas 10 msgs de sessoes anteriores (via Supabase)
        |
        v
  Injeta resumo no system prompt:
  "HISTORICO: O fiel ja conversou sobre X, Y, Z..."
        |
        v
  IA responde com contexto historico
```

### Detalhes Tecnicos

**AppContext - novos estados e funcoes:**

- `previousMessages: Msg[]` - buffer para undo
- `clearChatWithUndo(newContext)` - salva msgs atuais, limpa chat, mostra toast com undo
- `undoClearChat()` - restaura do buffer

**ContextPanel - mudanca no onSelect:**

- Detectar se o valor mudou (nao apenas toggle off)
- Chamar `clearChatWithUndo` passando o novo contexto

**ChatArea - filtro por afiliacao:**

- Query ao banco filtra por `religion = chatContext.religion` ou `philosophy = chatContext.philosophy`
- Insert inclui `philosophy` no contexto salvo

**sacred-chat - historico cross-session:**

- Receber `userId` no request (ja recebe)
- Fazer query ao Supabase buscando ultimas mensagens de sessoes anteriores
- Construir resumo e adicionar ao system prompt na secao MEMORY