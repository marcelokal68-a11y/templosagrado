

# Ajustes Mobile: Input, Login, Filtros e Compactação

## Problemas identificados

1. **Input muito perto da barra inferior do iOS** — a barra de input fica colada na BottomNav, e no iOS o toque pode acionar a barra de endereços
2. **Botão de login muito pequeno** — texto de 11px difícil de clicar
3. **Filtros (Católico, Evangélico etc.) não aparecem no mobile** — o ContextPanel só é renderizado no desktop (painel lateral direito). No mobile, não há como acessá-lo
4. **Placeholder "Digite sua pergunta..." muito longo** — corta no mobile
5. **Chat precisa ser mais compacto no mobile** — welcome state ocupa muito espaço vertical

## Mudanças

### 1. Afastar input da BottomNav (`ChatArea.tsx`)
- Adicionar `mb-16` (64px) ou `pb-16` ao container do input no mobile para compensar a altura da BottomNav (56px + safe area)
- Alternativa: usar `calc` com a altura da bottom nav

### 2. Aumentar botão de login (`ChatArea.tsx`)
- Banner de "Fazer login" e "Limite atingido": aumentar de `text-[11px]` para `text-sm`, e o `Button size="sm"` para `size="default"` com padding maior
- Tornar o link de login mais clicável (min-height 44px)

### 3. Mostrar filtros no mobile (`Index.tsx`)
- Adicionar o `ContextPanel` abaixo do `ChatArea` no layout mobile, dentro de um container com scroll
- Ficará acessível ao rolar para baixo, abaixo do chat
- Estrutura: `ChatArea (flex-1 com scroll)` + `ContextPanel (auto height, scrollável)`
- O ContextPanel no mobile será mais compacto (menos padding)

### 4. Encurtar placeholder (`ChatArea.tsx`)
- Trocar o placeholder longo por algo curto: "Envie sua mensagem..." ou "Sua mensagem..."
- Adicionar chave i18n `chat.placeholder_short` ou alterar a existente

### 5. Compactar welcome state no mobile (`ChatArea.tsx`)
- Reduzir padding do empty state: `py-8` → `py-4`
- Reduzir tamanho do ícone e margens
- Reduzir espaçamento entre perguntas sugeridas

## Arquivos a editar

- `src/components/ChatArea.tsx` — input spacing, login size, placeholder, welcome compactação
- `src/pages/Index.tsx` — adicionar ContextPanel no mobile abaixo do chat
- `src/lib/i18n.ts` — atualizar placeholder se necessário

