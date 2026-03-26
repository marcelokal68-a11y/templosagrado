

# Tornar "Apagar Conversa" Mais Visível

## Problema

O botão de apagar conversa existe — está no menu ⋮ (três pontinhos) ao lado do contador de mensagens. Porém:

1. **O menu ⋮ só aparece quando há mensagens na tela** (`messages.length > 0`) — se o usuário recarregou a página, as mensagens locais somem e o botão desaparece
2. O ícone ⋮ é discreto e fácil de não perceber

## Mudança

### `src/components/ChatArea.tsx`

1. **Mostrar o menu ⋮ sempre** (remover a condição `messages.length > 0`) — o menu terá pelo menos o toggle de memória para usuários logados
2. **Adicionar um botão visual de lixeira** diretamente na barra do chat (ao lado do ⋮), visível quando há mensagens, para tornar a ação de limpar mais óbvia
3. Manter as duas opções no dropdown:
   - "Limpar conversa" (apaga só o chat atual)
   - "Limpar Tudo" (wipe total: chat + histórico + memórias)

Total: **1 arquivo** editado, ~5 linhas alteradas.

