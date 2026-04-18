

## Diagnóstico

O usuário está em mobile (575px), abriu o menu lateral e vê: Meu Perfil, Aprender, Versículo do Dia, Mural, Convidar Amigos. **Falta um item "Chat" / "Conversar"** para voltar à tela principal de chat (rota `/`) quando está em outra seção (ex: navegou para `/learn` ou `/verse` e quer voltar ao mentor).

Hoje o único caminho é clicar no logo "Templo Sagrado" no header — affordance fraca e não óbvia para usuários 40-65 anos (público-alvo).

## Verificação rápida

Preciso confirmar o conteúdo atual do `AppSidebar.tsx` para entender exatamente onde inserir o novo item e qual ícone/label seguir o padrão visual existente.

## Mudança proposta

### `src/components/AppSidebar.tsx` — adicionar item "Conversar"

Adicionar como **primeiro item** da lista (antes de "Meu Perfil"), pois é a função central do app:

```tsx
{
  to: '/',
  icon: MessageCircle,  // lucide-react
  label: t('nav.chat', language) // "Conversar" / "Chat" / "Conversar"
}
```

**Por que primeiro item?**
- É a feature principal do produto (mentor espiritual).
- Segue heurística "most frequent action first".
- Estado ativo (`isActive`) automaticamente destacará quando o usuário estiver em `/`, dando feedback visual claro de "você está no chat".

### `src/lib/i18n.ts` — adicionar chave `nav.chat`

| Idioma | Texto |
|---|---|
| pt-BR | Conversar |
| en | Chat |
| es | Conversar |

Verbo "Conversar" é mais acolhedor que "Chat" em português para o público sênior — alinhado à persona do Mentor Espiritual.

## UX aplicado

- **Recognition over recall**: usuário vê "Conversar" no menu, não precisa lembrar que o logo leva ao chat.
- **Affordance clara**: ícone `MessageCircle` + label = duplo sinal.
- **Consistência**: segue o mesmo padrão visual dos outros itens (ícone âmbar + texto).
- **Feedback**: estado ativo destacado quando rota = `/`.

## Fora de escopo

- Não mexer no header/logo (continua funcionando como atalho secundário).
- Não reordenar os outros itens do menu.
- Não adicionar contador de mensagens não lidas (não há esse conceito no app).

