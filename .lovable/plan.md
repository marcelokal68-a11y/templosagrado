

# Corrigir Layout do Chat Desktop + Aumentar Logo

## Problema

Na versão web (desktop), o `ChatArea` e o `ContextPanel` estão dentro de um layout flexível, mas o `ChatArea` usa `h-full` internamente com `flex-1 overflow-y-auto` para a area de mensagens. O problema é que no mobile, tudo está dentro de um `ScrollArea` único — o chat, o welcome state e o ContextPanel — forçando o usuario a rolar a pagina inteira para encontrar o campo de input. No desktop está OK pois o chat tem seu proprio scroll, mas no mobile o `ScrollArea` engloba tudo.

Analisando mais a fundo: no desktop (`md:flex`), o `ChatArea` está em `flex-1 flex flex-col min-w-0` e o `ContextPanel` em um painel lateral fixo com `ScrollArea h-full`. O `ChatArea` internamente é `flex flex-col h-full` com scroll proprio. Isso deveria funcionar no desktop.

O problema real: o container pai tem `h-[calc(100vh-3.5rem)]`, e no desktop o `ChatArea` deve preencher todo o espaço com o input fixo na parte inferior. Vou verificar se `h-full` está propagando corretamente.

O `ChatArea` retorna `div className="flex flex-col h-full"` — a area de mensagens tem `flex-1 overflow-y-auto` e o input fica fixo embaixo. No desktop, o container pai é `flex-1 flex flex-col min-w-0` sem altura explícita. O `h-full` do ChatArea precisa de um container com altura definida.

## Solução

### 1. Corrigir propagação de altura no desktop (Index.tsx)

O container do ChatArea no desktop (`div.flex-1.flex.flex-col.min-w-0`) precisa ter `h-full` para que o `h-full` do ChatArea funcione. Sem isso, o ChatArea não sabe qual é "100% da altura" e expande todo o conteúdo.

Mudança em `src/pages/Index.tsx`:
- Desktop: adicionar `h-full` ao container do ChatArea
- Mobile: reestruturar para que o ChatArea tenha altura fixa com input sempre visível, e o ContextPanel fique acessível via scroll separado ou dentro da sidebar

### 2. Mobile — input sempre visível

No mobile, atualmente `ChatArea` + `ContextPanel` estão dentro de um `ScrollArea` único. Isso faz o input do chat desaparecer ao rolar. Solução:
- Remover o `ScrollArea` wrapper no mobile
- Dar ao `ChatArea` altura fixa (`flex-1`) para que ele ocupe a tela com seu proprio scroll interno
- Mover o `ContextPanel` para a sidebar (drawer) no mobile, já que o fluxo principal é o chat

### 3. Aumentar logo (Header.tsx)

- Aumentar o logo de `h-7 md:h-8` para `h-9 md:h-10`

## Arquivos a editar

### `src/pages/Index.tsx`
- **Mobile**: remover `ScrollArea`, dar ao ChatArea o espaço completo com `flex-1 min-h-0`. Remover ContextPanel do fluxo mobile (já está na sidebar ou pode ser adicionado como um botão de configurações)
- **Desktop**: adicionar `h-full` ao container do ChatArea para propagação correta de altura

### `src/components/Header.tsx`
- Logo: `h-7 md:h-8` → `h-9 md:h-10`

