

## Tooltips na Sidebar Colapsada

Quando a sidebar estiver no modo colapsado (apenas icones), cada item de navegacao exibira um tooltip ao passar o mouse, mostrando o nome da aba correspondente.

### O que muda

- Envolver cada item da sidebar com um componente Tooltip (ja disponivel em `src/components/ui/tooltip.tsx`)
- O tooltip so aparece quando `collapsed === true`
- Quando expandida, o texto ja esta visivel, entao nenhum tooltip e exibido

### Detalhes Tecnicos

**Arquivo:** `src/components/AppSidebar.tsx`

1. Importar `Tooltip, TooltipTrigger, TooltipContent, TooltipProvider` de `@/components/ui/tooltip`
2. Envolver o `SidebarMenu` com `TooltipProvider`
3. Para cada `SidebarMenuItem`, quando `collapsed` for true:
   - Envolver o `Link` com `Tooltip` + `TooltipTrigger` (asChild) + `TooltipContent` (side="right") exibindo o label
   - Quando nao colapsada, renderizar o `Link` normalmente sem tooltip
4. O tooltip aparecera do lado direito do icone com o nome da aba

Nenhuma dependencia nova necessaria - o componente Tooltip ja existe no projeto.
