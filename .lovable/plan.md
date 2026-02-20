
# Tornar Historico e Gerador de Midia Social Visiveis

## Resumo

O botao de Historico so aparece apos o usuario enviar uma mensagem no chat, e o Gerador de Midia Social (Posts) nao tem mais link de acesso visivel em nenhum lugar da interface. Vamos corrigir ambos.

---

## Mudancas

### 1. Historico sempre visivel no ChatArea

**Arquivo:** `src/components/ChatArea.tsx`

Mover o botao `ChatHistory` para fora do bloco condicional `messages.length > 0`. Ele sera exibido na area de sugestoes (quando nao ha mensagens) e tambem na barra superior (quando ha mensagens), garantindo que o usuario logado sempre tenha acesso.

- Quando nao ha mensagens: renderizar o botao de Historico acima das perguntas sugeridas
- Quando ha mensagens: manter como esta (na barra superior com speed control e limpar)

### 2. Adicionar link para Gerador de Posts na navegacao

**Arquivo:** `src/components/BottomNav.tsx`

Adicionar um item de navegacao para `/posts` com icone `Feather` e label "Posts" na barra inferior mobile.

**Arquivo:** `src/components/Header.tsx`

Adicionar o item `/posts` (Posts) na lista `navItems` do menu desktop.

### 3. Restaurar rota /posts no App

**Arquivo:** `src/App.tsx`

Re-adicionar a rota `<Route path="/posts" element={<Posts />} />` e o import correspondente.

### 4. Traducoes

**Arquivo:** `src/lib/i18n.ts`

Adicionar chave `nav.posts` nos 3 idiomas:
- pt-BR: "Posts"
- en: "Posts"  
- es: "Posts"

---

## Detalhes Tecnicos

### BottomNav - novo item

Adicionar entre Pricing e Prayers:
```text
{ to: '/posts', icon: Feather, labelKey: 'nav.posts' }
```

### ChatArea - Historico sempre acessivel

Na area de mensagens vazias (bloco `messages.length === 0`), adicionar o botao `ChatHistory` no topo, visivel apenas para usuarios logados:

```text
{messages.length === 0 && user && (
  <div className="flex justify-end p-2">
    <ChatHistory />
  </div>
)}
```

### App.tsx - restaurar rota

```text
import Posts from "./pages/Posts";
// na lista de Routes:
<Route path="/posts" element={<Posts />} />
```
