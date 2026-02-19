
# Correcoes no Chat + Nova Aba "Post" para Redes Sociais

## 1. Corrigir "Limpar Conversa" (Clear Chat)

**Problema atual:** Ao clicar em "Limpar conversa", as mensagens sao deletadas do banco mas continuam visiveis na tela ate recarregar.

**Correcao:** Garantir que o `setMessages([])` limpa a UI imediatamente e que o historico no banco tambem e apagado. Atualmente o codigo ja faz isso (linhas 337-344 do ChatArea), mas vamos adicionar uma RLS policy para permitir DELETE na tabela `chat_messages` (atualmente falta essa policy, o que impede a delecao real do banco).

**Acoes:**
- Adicionar RLS policy de DELETE na tabela `chat_messages` para `auth.uid() = user_id`
- Manter o comportamento atual de limpar a UI localmente

## 2. Historico de Mensagens com Delecao Individual e Total

**Nova funcionalidade:** Permitir que o usuario veja seu historico de conversas salvas e delete mensagens individualmente ou todas de uma vez.

**Acoes:**
- Adicionar botao "Historico" discreto no header do chat (icone `History`)
- Criar um dialog/sheet que mostra todas as mensagens salvas no banco
- Cada par pergunta/resposta tera um botao de deletar individual (icone `X` pequeno)
- Botao "Apagar tudo" no topo do historico
- Ao deletar, remove do banco e atualiza a lista

## 3. Nova Aba "Post" para Redes Sociais

**Nova pagina `/posts`** onde o usuario pode transformar respostas do chat em posts formatados para redes sociais.

**Fluxo:**
1. Usuario acessa a aba "Post" (icone discreto - `Share2` ou `FileText`)
2. Ve uma lista das suas conversas recentes (carregadas do banco)
3. Seleciona qual resposta do assistente quer transformar em post
4. Escolhe uma ou mais redes: X (Twitter), Instagram, TikTok, Facebook
5. Uma edge function gera o texto formatado para cada rede selecionada
6. Usuario ve os posts gerados e pode copiar cada um com um botao "Copiar"

**Design discreto:** O icone na barra inferior sera `FileText` ou `Feather` (pena de escrever), mantendo a sobriedade do site religioso. O label sera "Compartilhar" ou "Post".

## Detalhes Tecnicos

### Migracao de Banco de Dados
- Adicionar RLS policy DELETE em `chat_messages` para `auth.uid() = user_id`

### Arquivos Novos
1. **`src/pages/Posts.tsx`** - Pagina principal da aba Post
   - Lista de conversas do usuario (query `chat_messages` onde `role = 'assistant'`)
   - Selecao de mensagem + checkboxes de redes sociais
   - Botao "Gerar Post"
   - Area de resultado com botao "Copiar" por rede
   
2. **`supabase/functions/generate-post/index.ts`** - Edge function que recebe o texto e as redes selecionadas, usa Lovable AI (openai/gpt-5-mini) para gerar posts formatados para cada rede com limites de caracteres, hashtags e emojis apropriados

### Arquivos Modificados
1. **`src/components/ChatArea.tsx`**
   - Adicionar botao "Historico" ao lado de "Limpar conversa"
   - Criar componente de dialog para historico com delecao individual/total

2. **`src/components/BottomNav.tsx`**
   - Adicionar item para a aba Post (icone `Feather`, label "Post")

3. **`src/App.tsx`**
   - Adicionar rota `/posts`

4. **`src/lib/i18n.ts`**
   - Adicionar traducoes para: `nav.posts`, `posts.title`, `posts.select`, `posts.generate`, `posts.copy`, `posts.copied`, `posts.networks`, `history.title`, `history.delete_all`, `history.empty`

### Edge Function `generate-post`
- Recebe: `{ text: string, networks: string[] }`
- Para cada rede, gera um post com formato adequado:
  - **X (Twitter):** max 280 caracteres, hashtags relevantes
  - **Instagram:** texto mais longo, emojis, 5-10 hashtags
  - **TikTok:** texto curto e impactante, hashtags virais
  - **Facebook:** texto medio, tom conversacional
- Usa Lovable AI (openai/gpt-5-mini) para gerar
- Retorna: `{ posts: { network: string, content: string }[] }`
