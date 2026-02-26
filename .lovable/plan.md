

## Plan: Botão de Reset Total + Separação de Contexto Religião/Filosofia

### Problema Atual
1. O botão "Limpar conversa" apaga **todos** os `chat_messages` do usuário, mas não apaga `activity_history` nem reseta memórias
2. A função `sacred-chat` (backend) busca histórico de **outras** afiliações para dar contexto cruzado — ao mudar de religião para filosofia, dados da religião vazam para a filosofia e vice-versa

### Mudanças

**1. Botão "Limpar Tudo" no ChatArea.tsx**
- Adicionar botão que apaga: `chat_messages` + `activity_history` + limpa mensagens locais
- Confirmar com AlertDialog antes de executar
- Posicionar junto ao botão existente de "Limpar conversa"

**2. Separar histórico no backend (sacred-chat/index.ts)**
- Alterar `fetchUserHistory` para **não** buscar histórico de outras afiliações
- Quando contexto é filosofia: buscar apenas mensagens de filosofia (ignorar religião)
- Quando contexto é religião: buscar apenas mensagens de religião (ignorar filosofia)
- Remover o cruzamento de dados entre modos

**3. Adicionar i18n**
- Chaves para "Limpar tudo", "Confirmar exclusão de todo histórico"

### Detalhes Técnicos

`fetchUserHistory` atualmente usa `.or(philosophy.neq.X)` para buscar de OUTRAS afiliações. Será alterado para buscar apenas da mesma afiliação atual, ou retornar vazio se não houver afiliação selecionada.

O botão de reset executa duas queries DELETE em paralelo (`chat_messages` e `activity_history`) filtradas por `user_id`.

