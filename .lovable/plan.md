

# Refatoração: Layout Vertical + Sidebar Mobile + Limpeza do Header

## Resumo

O usuário quer 4 mudanças:
1. **Remover slider horizontal** do ContextPanel — as seções (religião, filosofia, necessidade, humor, tópicos, música) devem aparecer em scroll vertical, sem precisar clicar para expandir
2. **Aumentar a barra lateral esquerda (hamburger drawer) no mobile** — torná-la maior/mais larga
3. **Remover o seletor de idiomas** (PT/EN/ES) do Header
4. **Mover o ícone de Gem (upgrade/plano)** do Header para dentro da barra lateral (drawer), como item "Plano"

## Mudanças por Arquivo

### 1. `src/components/ContextPanel.tsx`
- Remover os `Collapsible` wrappers de todas as seções — cada grupo de chips fica sempre visível
- Manter as seções empilhadas verticalmente (scroll natural)
- O componente `CollapsibleChipGroup` vira um simples grupo com label + chips sempre abertos
- Manter o mode selector (Religião/Filosofia) no topo

### 2. `src/components/Header.tsx`
- **Remover** o `Select` de idiomas (linhas 129-138)
- **Remover** o botão `Gem` pulsante (linhas 140-146)
- **Aumentar largura do drawer** de `w-72` para `w-80` (320px)
- **Adicionar item "Plano"** no `drawerItems` com ícone `Gem`, navegando para `/pricing` — visível apenas se `!isSubscriber`

### 3. `src/pages/Index.tsx`
- No mobile, remover o botão flutuante de `SlidersHorizontal` e o `Drawer` — as seções do ContextPanel ficam abaixo do chat como scroll vertical
- No desktop, manter o painel lateral direito como está

