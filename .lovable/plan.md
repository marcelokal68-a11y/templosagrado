## Objetivo

Quando o usuário trocar sua fé/religião (ou filosofia), **avisar claramente** que o histórico de conversa daquela jornada será apagado e, ao confirmar, **apagar de fato** as mensagens antigas no banco. Após a troca, o mentor e as sugestões já passam a refletir a nova fé (comportamento que já existe via `chatContext`).

## Situação atual

- **`src/components/ContextPanel.tsx`** já tem dois diálogos ao trocar de fé:
  - Diálogo "Mudar de caminho?" — texto genérico, sem mencionar apagamento e sem deletar nada do banco.
  - Diálogo "Mudar para X?" (3 opções) — também não menciona apagamento.
  - Ambos chamam `applyOption()` → `clearChatWithUndo()` (apenas limpa a tela, com undo de 20s).
- **`src/pages/Profile.tsx`** → `saveReligion()` troca a religião **silenciosamente**, sem aviso e sem limpar histórico.
- **`src/components/ChatArea.tsx`** já filtra mensagens por `religion`/`philosophy`, então conversas antigas ficam guardadas no banco mesmo quando ocultas.

## Mudanças

### 1. Função utilitária compartilhada
Criar `clearAffiliationHistory(userId, prevReligion, prevPhilosophy)` em `src/lib/clearAffiliationHistory.ts`:
- `DELETE FROM chat_messages WHERE user_id=? AND (religion=prevReligion OR philosophy=prevPhilosophy)`.
- `DELETE FROM activity_history WHERE user_id=? AND type='chat' AND (metadata->>religion = prevReligion OR metadata->>philosophy = prevPhilosophy)`.
- **Não toca em** `user_memory`, versículos, orações, atividades de prática.

### 2. ContextPanel.tsx — texto + ação real
- Substituir o texto dos dois diálogos para deixar claro:
  > "Ao trocar de fé, **todo o histórico de conversa da jornada anterior será apagado permanentemente**. As próximas perguntas e respostas serão guiadas pela nova tradição."
- Em `applyOption(option)` (e em `handleChangeFaith`), antes do `clearChatWithUndo()`:
  - Capturar `prev = { religion: chatContext.religion, philosophy: chatContext.philosophy }`.
  - Chamar `clearAffiliationHistory(user.id, prev.religion, prev.philosophy)`.
  - Como o histórico foi de fato apagado, **remover o `clearChatWithUndo` (com undo)** e usar um simples `setMessages([])` — não faz sentido oferecer "Desfazer" se o banco já foi apagado. Mostrar toast de confirmação.

### 3. Profile.tsx — adicionar aviso antes de salvar
- Em `saveReligion(value)`: se `profile.preferred_religion && profile.preferred_religion !== value`, abrir um `AlertDialog` de confirmação com o mesmo texto do ContextPanel. Só ao confirmar:
  - Capturar religião anterior, executar `clearAffiliationHistory`, depois fazer o `update` em `profiles` e atualizar contexto.
- Toast: "Tradição atualizada. Histórico anterior apagado."

### 4. i18n
Adicionar nas 3 línguas (pt-BR / en / es):
- `faith.switch_title` → "Mudar de fé?" / "Change faith?" / "¿Cambiar de fe?"
- `faith.switch_desc` → "Ao trocar, todo o histórico de conversa da jornada anterior será apagado permanentemente. As próximas perguntas serão guiadas pela nova tradição."
- `faith.switch_confirm` → "Trocar e apagar histórico"
- `faith.switch_done` → "Tradição atualizada. Histórico anterior apagado."

Atualizar `ContextPanel.tsx` e `Profile.tsx` para usar essas chaves no lugar dos textos hardcoded.

### 5. Permissões
Já cobertas pelas RLS existentes:
- `chat_messages` — DELETE permitido para o próprio user (`auth.uid() = user_id`).
- `activity_history` — DELETE permitido para o próprio user.

## Arquivos afetados
- `src/lib/clearAffiliationHistory.ts` (novo)
- `src/components/ContextPanel.tsx`
- `src/pages/Profile.tsx`
- `src/lib/i18n.ts`

## Validação
1. Iniciar conversa com Cristianismo → ver mensagens.
2. Pelo ContextPanel, escolher Budismo → diálogo aparece com texto explícito → confirmar → tela limpa, toast confirma, recarregar página: nada do Cristianismo aparece em `chat_messages` (verificar).
3. Pelo Profile, mudar tradição salva → diálogo idêntico → confirmar → mesmo efeito.
4. Cancelar o diálogo em qualquer tela → nada muda, histórico permanece.
5. Após troca, novas perguntas/respostas vêm guiadas pela nova fé (comportamento já existente).
