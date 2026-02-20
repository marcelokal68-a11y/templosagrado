
# Plano de Melhorias do Templo Sagrado

## Resumo das Mudancas

Este plano cobre 7 melhorias solicitadas para tornar o app mais inteligente, contextual e facil de usar.

---

## 1. Topicos dinamicos por religiao

Atualmente os topicos de discussao sao os mesmos para todas as religioes (ex: "Jesus" aparece para Judaismo). Isso sera corrigido criando um mapa de topicos por religiao.

**Arquivo:** `src/components/ContextPanel.tsx`

- Criar um objeto `TOPICS_BY_RELIGION` que mapeia cada religiao a seus topicos relevantes
- Topicos universais (familia, saude, carreira, financas, relacionamento, futuro) ficam em todas
- Topicos especificos: "Jesus" so para cristao/catolico/protestante/mormon; "Orixas" para umbanda/candomble; "Karma/Nirvana" para budista; "Tora/Shabat" para judeu; "Alcorão/Ramadã" para isla, etc.
- O `CollapsibleChipGroup` de topicos recebera a lista filtrada com base na religiao selecionada
- Adicionar traducoes dos novos topicos no `i18n.ts`

## 2. Versiculo do Dia com selecao de religiao

A pagina de Versiculo do Dia usara a religiao do contexto mas tambem permitira selecionar diretamente na pagina.

**Arquivo:** `src/pages/Verse.tsx`

- Adicionar um seletor de religiao (chips ou dropdown) acima do versiculo
- Ao mudar a religiao, buscar automaticamente um novo versiculo
- Usar `chatContext.religion` como valor inicial

## 3. Botao "Gerar Resposta" apos selecionar contexto

Apos o usuario selecionar religiao, necessidade, mood e topico, um botao "Gerar Resposta" envia automaticamente uma mensagem contextual sem precisar digitar nada.

**Arquivo:** `src/components/ContextPanel.tsx` e `src/pages/Index.tsx`

- Adicionar um botao "Gerar Resposta" no final do ContextPanel
- Ao clicar, compor uma mensagem automatica baseada no contexto selecionado (ex: "Sou [religiao], estou me sentindo [mood], preciso de [need] sobre [topico]") e enviar ao chat
- O ChatArea expora uma funcao `sendAutoMessage` via callback prop ou ref

## 4. Despedida "Estou satisfeito" / "Va com o Senhor"

Detectar quando o usuario diz "estou satisfeito" (ou variacoes) e o sacerdote responder com uma bencao de despedida conforme a religiao.

**Arquivo:** `supabase/functions/sacred-chat/index.ts`

- Adicionar ao system prompt: "Quando o fiel disser que esta satisfeito, encerre com uma bencao de despedida propria da tradicao [religiao]. Exemplos: cristao='Va com Deus', judeu='Shalom', isla='As-salamu alaykum', budista='Que a paz do Dharma o acompanhe', etc."

## 5. Posts integrados ao Historico (remover aba separada)

A funcionalidade de criar posts sera integrada dentro do Historico, tornando-a mais acessivel. Cada conversa no historico tera um botao para gerar posts.

**Arquivos:** `src/components/ChatHistory.tsx`, `src/components/BottomNav.tsx`, `src/App.tsx`

- Remover a rota `/posts` e a aba "Post" do BottomNav
- No ChatHistory, agrupar mensagens por sessao/conversa
- Adicionar botao "Criar Post" em cada conversa do historico
- Ao clicar, abrir um mini-formulario inline (escolher redes, gerar) usando a mesma logica do `generate-post`
- Mover a logica de geracao de posts para dentro do ChatHistory

## 6. Historico com limite de 20 conversas

O historico mantara as ultimas 20 conversas (pares user+assistant) na memoria.

**Arquivo:** `src/components/ChatHistory.tsx`

- Limitar a query a `.limit(40)` (20 pares de mensagens)
- Agrupar mensagens por sessao (pares consecutivos user+assistant)
- Permitir deletar conversas individuais ou em lote
- Cada "conversa" mostra preview do conteudo

## 7. Tornar funcionalidades mais visiveis

Melhorar a visibilidade geral das funcionalidades no app.

**Arquivos:** `src/components/ChatArea.tsx`, `src/components/ChatHistory.tsx`

- O botao de Historico ficara mais destacado (icone maior, label visivel)
- O botao "Criar Post" dentro do historico tera destaque visual (cor primaria, icone)

---

## Detalhes Tecnicos

### Novos topicos por religiao (ContextPanel.tsx)

```text
TOPICS_BY_RELIGION = {
  christian/catholic/protestant/mormon: [jesus, heaven, hell, salvation, prayer, sacrifices, ...]
  jewish: [torah, shabbat, tikkun_olam, prophets, covenant, ...]
  islam: [quran, ramadan, pilgrimage, prophets, charity, ...]
  buddhist: [nirvana, karma, dharma, meditation, suffering, ...]
  hindu: [dharma, karma, moksha, vedas, yoga, ...]
  spiritist: [spirits, reincarnation, charity, mediumship, ...]
  umbanda/candomble: [orishas, rituals, ancestors, offerings, ...]
  agnostic: [ethics, philosophy, meaning, nature, ...]
  (todos): [future, deceased, animals, career, health, finances, relationship, family, politics, other]
}
```

### Fluxo do botao "Gerar Resposta"

```text
Usuario seleciona contexto -> Clica "Gerar Resposta"
-> Compoe mensagem: "Me de orientacao como [religiao] sobre [topico], estou [mood] e preciso de [need]"
-> Envia ao chat automaticamente (sem digitar)
-> Chat processa normalmente com streaming
```

### Integracao Posts no Historico

```text
Historico (Sheet lateral)
  |-- Conversa 1 (preview + data)
  |     |-- [Criar Post] -> Abre selecao de redes inline
  |     |-- [Deletar]
  |-- Conversa 2
  |     |-- [Criar Post]
  |     |-- [Deletar]
  |-- [Apagar tudo]
```

### Arquivos modificados

1. `src/components/ContextPanel.tsx` - Topicos dinamicos + botao Gerar Resposta
2. `src/pages/Verse.tsx` - Seletor de religiao
3. `src/components/ChatHistory.tsx` - Limite 20 conversas + Posts integrados
4. `src/components/ChatArea.tsx` - Callback para mensagem automatica
5. `src/pages/Index.tsx` - Passar callback do chat ao ContextPanel
6. `src/components/BottomNav.tsx` - Remover aba Posts
7. `src/App.tsx` - Remover rota /posts
8. `src/lib/i18n.ts` - Novas traducoes (topicos por religiao, botao gerar)
9. `supabase/functions/sacred-chat/index.ts` - Instrucao de despedida no prompt
