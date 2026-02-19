
# Icones Religiosos no Avatar do Chat + Melhorias Mobile UX/UI

## O que muda

### 1. Avatar do Sacerdote por Religiao
Em vez do icone generico de IA (Sparkles), o avatar do assistente mostrara um simbolo especifico da religiao selecionada:

| Religiao | Simbolo |
|----------|---------|
| christian | Cruz (Cross) |
| catholic | Cruz (Cross) |
| protestant | Cruz (Cross) |
| jewish | Estrela de Davi (Star) |
| islam | Lua crescente (Moon) |
| hindu | Om (🕉️ emoji ou icone) |
| buddhist | Flor de lotus (Flower2) |
| mormon | Cruz (Cross) |
| spiritist | Estrela (Star) |
| umbanda | Estrela (Star) |
| candomble | Estrela (Star) |
| agnostic / default | Sparkles (atual) |

Sera criado um helper `getReligionIcon` que retorna o icone Lucide correto baseado no `chatContext.religion`.

### 2. Melhorias Mobile UX/UI

**Barra de navegacao inferior (bottom tab bar):**
- Criar uma barra fixa na parte inferior da tela em mobile com os links principais (Chat, Precos, Oracoes, Versiculo)
- Esconder a nav do header em mobile (manter so logo + menu hamburger para login/logout)
- O botao flutuante do painel de contexto sera reposicionado acima da bottom bar

**Input de chat:**
- Garantir que o input fica visivel e acessivel acima da bottom bar
- Melhorar espacamento para nao sobrepor elementos

### Detalhes Tecnicos

**Arquivos modificados:**

1. **`src/components/ChatArea.tsx`**
   - Importar icones Lucide: `Cross`, `Moon`, `Star`, `Flower2`
   - Criar funcao `getReligionIcon(religion: string)` que retorna o componente de icone correto
   - Substituir `<Sparkles>` no `MessageBubble` e no indicador de "typing" pelo icone dinamico
   - Receber `religion` do `chatContext` via props ou contexto

2. **`src/components/BottomNav.tsx`** (novo arquivo)
   - Componente de navegacao inferior fixo, visivel apenas em mobile (`md:hidden`)
   - 4 tabs: Chat, Precos, Oracoes, Versiculo
   - Icones + labels pequenos, estilo tab bar nativa
   - Destaque visual no item ativo usando `useLocation()`

3. **`src/App.tsx`**
   - Adicionar `<BottomNav />` dentro do layout, abaixo das `Routes`

4. **`src/components/Header.tsx`**
   - Esconder os links de navegacao em mobile (ja esta `hidden md:flex`)
   - Simplificar menu hamburger para conter apenas login/logout e idioma

5. **`src/pages/Index.tsx`**
   - Ajustar posicao do botao flutuante do painel de contexto para `bottom-28` (acima da bottom bar)
   - Adicionar `pb-16` no container do chat para nao ficar atras da bottom bar
