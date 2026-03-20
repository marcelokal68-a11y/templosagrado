

# Ajustes Mobile: Header Fixo, Ícones Maiores, Sidebar Revisada

## Problemas identificados

1. **Header não está fixo no mobile** — ao rolar, o header sobe junto com o conteúdo, perdendo acesso ao menu hambúrguer
2. **Ícone do menu hambúrguer muito pequeno** — público brasileiro mais velho precisa de alvos maiores
3. **"Post" na sidebar não faz sentido** — o item "Post" (nav.posts) é confuso; precisa renomear para algo mais claro como "Publicações" ou "Criar Post"
4. **Mural não aparece na sidebar mobile (drawer)** — está apenas na sidebar desktop; falta no drawer do Header

## Mudanças

### 1. Fixar Header no mobile (`src/components/Header.tsx`)
- O header já tem `sticky top-0 z-50`, que deveria funcionar. O problema é que o container pai (`div.flex.flex-col.h-screen.overflow-hidden` no App.tsx) usa `overflow-hidden`, o que impede `sticky` de funcionar corretamente dentro de contextos flex
- Trocar de `sticky top-0` para `fixed top-0 left-0 right-0` no header
- Adicionar padding-top correspondente ao container abaixo do header (`pt-14`) para compensar

### 2. Aumentar ícones do menu hambúrguer e botões do Header (`src/components/Header.tsx`)
- Menu hambúrguer: `h-5 w-5` → `h-6 w-6`, botão: `h-9 w-9` → `h-10 w-10`
- Ícone de perfil: mesmo aumento
- Itens dentro do drawer: ícones de `h-5 w-5` → `h-6 w-6`, texto de `text-sm` → `text-base`, padding de `py-3.5` → `py-4`

### 3. Adicionar Mural ao drawer mobile (`src/components/Header.tsx`)
- Adicionar item `{ label: 'Mural', icon: ScrollText, action: () => navigate('/mural') }` na lista `drawerItems`

### 4. Renomear "Post" para "Publicações" (`src/lib/i18n.ts` + `src/components/Header.tsx`)
- Na i18n: `'nav.posts': 'Post'` → `'nav.posts': 'Publicações'`
- Adicionar "Publicações" ao drawer se ainda não estiver lá
- Na sidebar desktop, o label já puxará da i18n automaticamente

### 5. Compensar header fixo (`src/App.tsx`)
- Adicionar `pt-14` ao container que vem logo abaixo do Header para que o conteúdo não fique escondido atrás dele

## Arquivos a editar

- `src/components/Header.tsx` — header fixo, ícones maiores, adicionar Mural e Publicações ao drawer
- `src/App.tsx` — padding-top para compensar header fixo
- `src/lib/i18n.ts` — renomear "Post" → "Publicações" (pt-BR), "Publications" (en), "Publicaciones" (es)

