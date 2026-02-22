

## Tres Novas Features: Geolocalizacao Persistente, Historico Universal e Analise Profunda

---

### 1. Geolocalizacao Persistente

**Problema atual:** A cada carregamento do chat, o app pede permissao de localizacao via `navigator.geolocation`. Isso pode ser intrusivo.

**Solucao:** Salvar latitude/longitude no perfil do usuario na primeira vez. Nas proximas sessoes, carregar do banco sem perguntar novamente.

**Mudancas no banco:**
- Adicionar colunas `latitude` e `longitude` (tipo `double precision`, nullable) na tabela `profiles`

**Mudancas no codigo:**
- `src/contexts/AppContext.tsx`: Expor `geo` no contexto global. No carregamento do perfil, verificar se `latitude`/`longitude` ja existem. Se sim, usar direto. Se nao, pedir via `navigator.geolocation` uma unica vez, salvar no `profiles` e armazenar no estado.
- `src/components/ChatArea.tsx`: Remover o `useEffect` de geolocation local e usar `geo` do contexto global ao enviar mensagens.

---

### 2. Historico Universal com Geracao de Posts

**Problema atual:** O historico (`ChatHistory.tsx`) so mostra mensagens do chat. Versiculos, oracoes e praticas nao aparecem.

**Solucao:** Criar uma tabela `activity_history` que registra todas as acoes do usuario. Cada item pode gerar posts.

**Nova tabela `activity_history`:**

```text
id          uuid PK default gen_random_uuid()
user_id     uuid NOT NULL
type        text NOT NULL  -- 'chat', 'verse', 'prayer', 'practice'
title       text NOT NULL  -- resumo curto (ex: "Versiculo: Salmo 23")
content     text NOT NULL  -- conteudo principal para exibicao e geracao de post
metadata    jsonb          -- dados extras (religion, philosophy, etc)
created_at  timestamptz default now()
```

**RLS:** Usuarios so veem/inserem/deletam seus proprios registros.

**Onde inserir registros:**
- `src/components/ChatArea.tsx`: Apos receber resposta do assistente, inserir tipo `chat` com pergunta + resposta
- `src/pages/Verse.tsx`: Apos carregar versiculo, inserir tipo `verse` com titulo + explicacao + practical_use
- `src/pages/Prayers.tsx`: Apos gerar oracao, inserir tipo `prayer` com intencao + oracao gerada
- `src/pages/Practice.tsx`: Ao completar todos os itens do checklist, inserir tipo `practice`

**Redesign do ChatHistory.tsx:**
- Renomear para `ActivityHistory.tsx`
- Buscar da tabela `activity_history` em vez de `chat_messages`
- Exibir icones diferentes por tipo (MessageCircle, BookOpen, Heart, CheckSquare)
- Cada item tera botao "Criar Post" (ja existente, reutilizar a logica)
- Filtros por tipo no topo (Todos, Chat, Versiculos, Oracoes, Pratica)

---

### 3. Botao "Analisando Sua Historia no Templo Sagrado"

**Feature principal:** Um botao especial no historico que consolida todas as atividades e gera uma analise psicologica/espiritual profunda.

**Fluxo:**
1. Usuario clica no botao "Analisando sua Historia no Templo Sagrado"
2. Abre um Dialog/Sheet mostrando os itens do historico com checkboxes
3. Todos vem selecionados por padrao; usuario pode desmarcar itens que nao quer incluir
4. Clica em "Iniciar Analise"
5. Edge function recebe os itens selecionados e gera a analise via IA
6. Output aparece em um card estilizado com opcoes de copiar e gerar post

**Nova edge function `analyze-history/index.ts`:**
- Recebe: array de itens do historico (type, title, content, created_at)
- System prompt: "Voce e um sacerdote-psicologo com conhecimento profundo de Freud, Lacan, TCC, Jung, e outros mestres da psicologia. Analise o historico espiritual do usuario..."
- Instrucoes para: identificar padroes emocionais, temas recorrentes, evolucao espiritual, e sugerir proximos passos praticos
- Resposta em formato estruturado: analise geral, padroes identificados, sugestoes para proximas etapas
- Usa Lovable AI Gateway (gemini-2.5-pro para analise profunda)

**Frontend (dentro de ActivityHistory.tsx):**
- Botao dourado com icone Brain no topo do historico
- Dialog de selecao de itens com checkboxes
- Tela de resultado com card glass sacred-border, botao copiar e botao gerar post

---

### Detalhes Tecnicos

**Arquivos modificados:**

| Arquivo | Mudancas |
|---------|----------|
| Migration SQL | Nova tabela `activity_history` + colunas `latitude`/`longitude` em `profiles` |
| `src/contexts/AppContext.tsx` | Geo persistente: carregar do perfil ou pedir uma vez e salvar |
| `src/components/ChatArea.tsx` | Remover geolocation local, usar do contexto; inserir na `activity_history` |
| `src/pages/Verse.tsx` | Inserir versiculo na `activity_history` |
| `src/pages/Prayers.tsx` | Inserir oracao na `activity_history` |
| `src/pages/Practice.tsx` | Inserir pratica completa na `activity_history` |
| `src/components/ChatHistory.tsx` | Reescrever como `ActivityHistory.tsx` com historico universal, filtros, e botao de analise |
| `supabase/functions/analyze-history/index.ts` | Nova edge function para analise profunda |
| `supabase/config.toml` | Registrar `analyze-history` com `verify_jwt = false` |
| `src/lib/i18n.ts` | Novas chaves de traducao para historico universal e analise |

**Dependencias:** Nenhuma nova. Usa Lovable AI Gateway (LOVABLE_API_KEY ja configurado).

**Modelo de IA:** `google/gemini-2.5-pro` para a analise profunda (requer raciocinio complexo e contexto grande).

