## Seção "Aprenda sobre Religiões e Filosofias"

### Resumo

Nova seção educacional onde usuários logados exploram religiões e filosofias como se estivessem em uma aula com um professor de história, filosofia e religião. Cada resposta da IA sugere 3 perguntas clicáveis, eliminando a necessidade de digitar, se usuarioo desejar, pois existe o chatbot. Tudo vai para o histórico de atividades. Na primeira seleção de religião no app, o sistema pergunta se o usuário deseja configurá-la como religião de fé padrão.

---

### Funcionalidades

1. **Nova página `/learn**` com grid de cards para todas as religiões e filosofias disponíveis
2. **Ao clicar em uma religião/filosofia**: abre uma tela com história breve + chatbot educacional
3. **Chatbot educacional**: persona de professor (não sacerdote), com respostas que incluem 3 sugestões de perguntas clicáveis
4. **Sugestões clicáveis**: após cada resposta da IA, 3 botões de perguntas aparecem; ao clicar, a pergunta é enviada automaticamente
5. **Histórico**: cada interação é salva na tabela `activity_history` com tipo `learn`
6. **Prompt de religião de fé**: na primeira vez que o usuário seleciona uma religião (em qualquer lugar do app), um dialog pergunta "Deseja configurar XXX como sua religião de fé?" e salva em `preferred_religion` no perfil

---

### Detalhes Técnicos

#### 1. Nova Edge Function: `learn-chat`

- Persona: professor de história, filosofia e religião (tom acadêmico mas acessível)
- Modelo: `google/gemini-2.5-flash` (mesmo do sacred-chat, para manter custo baixo)
- O prompt instrui a IA a sempre terminar a resposta com exatamente 3 sugestões de perguntas no formato JSON: `{"suggestions": ["pergunta1", "pergunta2", "pergunta3"]}`
- A resposta textual vem separada das sugestões, parseadas no frontend

#### 2. Nova página `src/pages/Learn.tsx`

- Grid responsivo com cards para cada religião e filosofia
- Cada card tem ícone, nome traduzido e breve descrição
- Ao clicar, navega para `/learn/:topic` (ex: `/learn/buddhist`)

#### 3. Nova página `src/pages/LearnTopic.tsx`

- Ao abrir, faz uma chamada automática pedindo "Conte-me uma breve história sobre [religião/filosofia]"
- Exibe respostas em bolhas de chat
- Após cada resposta, renderiza 3 botões de sugestão clicáveis
- Ao clicar em uma sugestão, envia como mensagem automaticamente (sem digitar)
- Campo de texto também disponível para perguntas livres
- Todas as interações são salvas em `activity_history` com tipo `learn`

#### 4. Prompt de religião de fé (AppContext)

- No `AppContext`, ao detectar que `preferred_religion` é null e o usuário seleciona uma religião pela primeira vez (em qualquer contexto: chat, learn, etc.), exibe um `AlertDialog`:
  - "Deseja configurar [Religião] como sua religião de fé?"
  - Sim: salva em `profiles.preferred_religion` e pré-seleciona sempre
  - Não agora: dismiss sem salvar, não pergunta novamente na sessão

#### 5. Navegação

- Adicionar item "Aprender" no `BottomNav` e `AppSidebar` com ícone `GraduationCap`
- Rota protegida (apenas logados)

#### 6. Traduções (i18n)

- Adicionar chaves para pt-BR, en, es:
  - `nav.learn`: "Aprender" / "Learn" / "Aprender"
  - `learn.title`: "Aprenda sobre Religiões e Filosofias"
  - `learn.intro_prompt`: textos para cada idioma
  - `learn.ask_faith`: "Deseja configurar {religion} como sua religião de fé?"
  - `learn.yes`: "Sim, é minha fé"
  - `learn.not_now`: "Não agora"

#### 7. Formato de resposta da IA

A edge function `learn-chat` instrui o modelo a retornar respostas no formato:

```text
[texto da resposta educacional]

---SUGGESTIONS---
["Qual a diferença entre...", "Como surgiu...", "O que significa..."]
```

O frontend faz split por `---SUGGESTIONS---`, renderiza o texto como mensagem e parseia o JSON das sugestões como botões.

---

### Arquivos a criar/modificar


| Arquivo                                  | Ação                                                   |
| ---------------------------------------- | ------------------------------------------------------ |
| `supabase/functions/learn-chat/index.ts` | Criar - edge function do chatbot educacional           |
| `src/pages/Learn.tsx`                    | Criar - grid de religiões/filosofias                   |
| `src/pages/LearnTopic.tsx`               | Criar - chat educacional com sugestões                 |
| `src/App.tsx`                            | Modificar - adicionar rotas `/learn` e `/learn/:topic` |
| `src/components/BottomNav.tsx`           | Modificar - adicionar item "Aprender"                  |
| `src/components/AppSidebar.tsx`          | Modificar - adicionar item "Aprender"                  |
| `src/lib/i18n.ts`                        | Modificar - adicionar traduções                        |
| `src/contexts/AppContext.tsx`            | Modificar - lógica do prompt de religião de fé         |
| `supabase/config.toml`                   | Nota: não editar, deploy automático                    |
