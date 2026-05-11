## Objetivo

Garantir que o nome de cada item da sidebar seja sempre legível: se o texto for cortado pela largura disponível, mostrar um **tooltip** ao passar o mouse com o nome completo. No modo recolhido o tooltip continua aparecendo (já existe).

## Situação atual

`src/components/AppSidebar.tsx`:
- Tooltip só é renderizado quando `collapsed === true`.
- No modo expandido, o `<span>` tem `whitespace-nowrap` — se o label for maior que a área disponível, fica cortado sem feedback.

## Mudança

Em `AppSidebar.tsx`:

1. Criar um pequeno componente interno `NavItemLabel` (ou usar `useRef` + `useLayoutEffect` por item) que mede o `<span>` do label:
   - `isTruncated = el.scrollWidth > el.clientWidth + 1`
   - Recalcular em `resize` e quando `label`/`collapsed` mudam.
2. Envolver o link com `<Tooltip>` quando **`collapsed`** OU **`isTruncated`** for verdadeiro. Conteúdo do tooltip = `label` (+ badge "Pro" se aplicável, em texto).
3. Manter `whitespace-nowrap` + `overflow-hidden text-ellipsis` no `<span>` para que o truncamento seja visível e mensurável.
4. Tooltip aparece em `side="right"` em ambos os casos para consistência.

## Arquivo afetado
- `src/components/AppSidebar.tsx`

## Validação
- Sidebar expandida com label curto ("Chat") → sem tooltip.
- Sidebar expandida com label longo o suficiente para ser cortado (ex.: redimensionar `--sidebar-width` ou label traduzido maior em EN/ES) → tooltip aparece com nome completo.
- Sidebar recolhida → tooltip continua aparecendo (comportamento atual preservado).
- Item Journey mantém o badge "Pro" visível inline; tooltip mostra apenas o texto.
