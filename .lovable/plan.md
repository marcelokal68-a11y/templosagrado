## Objetivo

Tornar a função de limpar chat mais clara e granular: permitir apagar **tudo**, apagar **só uma conversa específica**, ou apagar **só uma mensagem do chat atual**, em qualquer dispositivo (incluindo toque).

## Situação atual

- **ChatArea (chat ativo)**:
  - Ícone 🗑️ no topo "Limpar" hoje deleta TODAS as mensagens do banco sem confirmação — comportamento perigoso e confuso.
  - Item "Apagar tudo" no menu já existe e tem diálogo de confirmação ✅.
  - Não há como apagar uma única troca (pergunta+resposta) dentro do chat ativo.
- **ChatHistory (sheet de histórico)**:
  - Botão "Apagar tudo" funciona ✅.
  - Botão de excluir item individual existe mas está com `opacity-0 group-hover:opacity-100` → invisível no mobile/touch.
  - Sem confirmação ao apagar item individual.

## Mudanças

### 1. ChatArea — separar "limpar tela" de "apagar do banco"
- Renomear o ícone 🗑️ do topo para **"Limpar tela"** (`chat.clear_view`): apenas zera `messages` em memória, **não toca no banco**. Sem confirmação.
- Manter "Apagar tudo" (`chat.clear_all`) no menu com diálogo (já existente) que apaga do banco.
- Remover o item duplicado "Limpar" do dropdown (que hoje apaga tudo do banco silenciosamente).

### 2. ChatArea — apagar uma troca individual
- Ao passar mouse / tocar uma bolha de mensagem, mostrar botão ✕ pequeno que apaga aquele par (user + assistant).
- Atualiza `messages` localmente e remove os 2 IDs no banco (se usuário logado e não-confessional).

### 3. ChatHistory — exclusão por item sempre visível + confirmar
- Trocar `opacity-0 group-hover:opacity-100` por botão sempre visível (ícone 🗑️ pequeno no canto).
- Adicionar `AlertDialog` de confirmação tanto para item individual quanto para "Apagar tudo".
- Toast de feedback após remoção.

### 4. i18n
Adicionar chaves nos 3 idiomas (pt-BR / en / es):
- `chat.clear_view` → "Limpar tela" / "Clear view" / "Limpar pantalla"
- `chat.clear_view_desc` → "Apenas oculta a conversa atual. Nada é apagado do histórico."
- `chat.delete_one_title` / `chat.delete_one_desc` → confirmação de troca única
- `history.delete_one_title` / `history.delete_one_desc` → confirmação no histórico
- `chat.message_deleted` → toast

## Arquivos afetados
- `src/components/ChatArea.tsx` — separar handlers, adicionar botão ✕ por mensagem, AlertDialog para troca única
- `src/components/ChatHistory.tsx` — botão sempre visível, AlertDialog de confirmação
- `src/lib/i18n.ts` — novas chaves nos 3 idiomas

## Validação
- No chat ativo: clicar 🗑️ topo → some da tela mas reaparece se recarregar (porque continua no banco).
- "Apagar tudo" → confirma → apaga banco + tela.
- ✕ em uma bolha → confirma → some essa troca da tela e do banco.
- No histórico: ✕ em um item visível mesmo no mobile, com confirmação.
