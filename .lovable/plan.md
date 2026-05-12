## Problema

Na tela "Versículo do Dia" (mobile), o botão flutuante **Chat** (`BackToChatFab`) fica fixado no canto inferior direito (`fixed bottom-20`) e sobrepõe o final do texto. Como ele é `position: fixed`, mesmo rolando até o fim da página o texto que está atrás dele nunca aparece completamente.

O mesmo botão aparece em outras rotas (`/learn`, `/mural`, `/journey`, `/prayers`, `/practice`) e provavelmente sofre do mesmo problema.

## Causa

`BackToChatFab` ocupa cerca de 48px de altura + offset, mas as páginas onde ele aparece não reservam espaço inferior equivalente. No mobile a barra de navegação inferior já cria um gap, mas o FAB fica acima dela (`bottom-20`), então cobre o conteúdo final.

## Correção

Adicionar `padding-bottom` extra (≈ `pb-32` no mobile, `pb-24` no desktop) ao container scrollável de cada página onde o FAB é exibido, para que o usuário consiga rolar o texto para fora da área coberta pelo botão.

Páginas afetadas (mesma lista de `SHOW_ON` em `BackToChatFab.tsx`):
- `src/pages/Verse.tsx` (foco do bug relatado)
- `src/pages/Learn.tsx`
- `src/pages/Mural.tsx`
- `src/pages/Journey.tsx`
- `src/pages/Prayers.tsx`
- `src/pages/Practice.tsx`

## Passos

1. Em `Verse.tsx`, localizar o wrapper externo (provavelmente um `div` com `max-w-*` e padding) e adicionar `pb-32 md:pb-24`.
2. Repetir o ajuste nas demais 5 páginas listadas.
3. Verificar visualmente no preview mobile (402×700) que, ao rolar o conteúdo do versículo até o fim, o último parágrafo aparece acima do botão Chat.

## Alternativa considerada (não recomendada)

Mover o FAB para uma posição não-fixa ou escondê-lo ao rolar — quebraria o padrão de "voltar ao chat sempre acessível" definido em produto. Manter o FAB fixo e reservar espaço é mais simples e consistente.
