

## Plano: Recolocar a aba "Aprenda" (Modo Professor)

### O que existe hoje (e funciona)
- **Edge function `learn-chat`**: já implementada, com streaming, persona de professor universitário (acadêmico, NÃO sacerdotal), suporta as 11 religiões + 19 filosofias, retorna 3 perguntas sugeridas no final em formato `---SUGGESTIONS---`, fala em PT/EN/ES.
- **Traduções**: chaves `learn.title`, `learn.subtitle`, `learn.professor_mode`, `learn.ask_placeholder`, `learn.ask_faith`, `learn.yes`, `learn.not_now` já existem nos 3 idiomas.

### O que está faltando (foi removido)
- A página `/learn` (componente React)
- A rota em `App.tsx`
- O item "Aprenda" no `AppSidebar` e no drawer mobile do `Header`

### O que vou criar

**1. `src/pages/Learn.tsx` — nova página**
- **Topo**: título "Aprenda sobre Religiões e Filosofias" + subtítulo.
- **Seleção de tópico** (se nada selecionado): dois grupos lado a lado/empilhados:
  - **Religiões** (11 cards com ícone via `ReligionIcon`): Cristianismo, Catolicismo, Protestantismo, Mormonismo, Judaísmo, Islã, Hinduísmo, Budismo, Espiritismo, Umbanda, Candomblé, Agnosticismo.
  - **Filosofias de vida** (19 cards): Estoicismo, Logosofia, Humanismo, Epicurismo, Transumanismo, Panteísmo, Existencialismo, Objetivismo, Transcendentalismo, Altruísmo, Racionalismo, Niilismo Otimista, Absurdismo, Utilitarismo, Pragmatismo, Xamanismo, Taoísmo, Antroposofia, Cosmismo, Ubuntu.
- **Após escolher um tópico**: abre interface de chat (estilo `ChatArea` simplificado):
  - Header com nome do tópico + botão "← Trocar tópico".
  - Mensagem inicial automática do professor (introdução ao tema) + 3 perguntas sugeridas como botões.
  - Input de pergunta livre + botão enviar.
  - Streaming de resposta usando `fetch` do `learn-chat` (mesmo padrão do `ChatArea`).
  - Parse do bloco `---SUGGESTIONS---` para renderizar 3 botões de "perguntas sugeridas" abaixo de cada resposta.
  - **Se o tópico for uma religião**: ao receber a primeira resposta, mostra prompt opcional "Deseja configurar X como sua religião de fé?" com botões `learn.yes` / `learn.not_now`. Se "Sim", atualiza `chatContext.religion` (via `useApp`) e/ou salva em `profiles.religion`.

**2. `src/App.tsx`** — adicionar rota `<Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />`.

**3. `src/components/AppSidebar.tsx`** — adicionar item "Aprenda" (ícone `GraduationCap` do lucide) entre Chat e Versículo. Adicionar chave `nav.learn` nas 3 línguas.

**4. `src/components/Header.tsx`** — adicionar "Aprenda" no `loggedInItems` do drawer mobile, com ícone `GraduationCap`.

**5. `src/lib/i18n.ts`** — adicionar `'nav.learn': 'Aprenda'` / `'Learn'` / `'Aprende'` nas 3 línguas.

### Considerações técnicas
- **Acesso**: protegido por `ProtectedRoute` (login obrigatório). Conta como "uso do app" no trial — não vou impor limite extra de perguntas (igual chat, segue regra de trial/assinatura existente).
- **Persistência**: Não vou criar tabela nova — a conversa de aprendizado é efêmera por sessão (já que é educacional, não pastoral). Se quiser histórico depois, é fácil adicionar.
- **Streaming**: usar `EventSource`-style parsing igual ao `ChatArea` faz com `sacred-chat`.
- **Tom**: fica claro pelo system prompt do `learn-chat` que é professor acadêmico, NÃO mentor espiritual — bem diferente da aba Chat.

### Resultado para o usuário
Nova aba "Aprenda" no menu (sidebar desktop + drawer mobile). Ao clicar, vê grade de religiões e filosofias. Escolhe uma → conversa com um "professor universitário" sobre história, princípios, figuras-chave, contexto cultural — com perguntas sugeridas que aprofundam o assunto. Para religiões, oferece converter em "fé pessoal" com 1 clique.

