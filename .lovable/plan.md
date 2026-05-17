## Problema

**1) Trocar tradição não muda o chat nem avisa**

Quando o usuário tem uma `preferred_religion` salva (ex: budista) e seleciona outra opção no painel (ex: judeu), o app abre um diálogo de 3 opções ("Sim, mudar minha fé" / "Só explorar" / "Cancelar"). Esse diálogo:

- Não fica claro que o chat será limpo e que a fé será trocada.
- Se o usuário clica "Só explorar", navega para `/learn` sem mudar nada — fácil interpretar como "não funcionou".
- O caminho de troca real exige clicar no botão certo, e o título reaproveita o texto genérico de switch, sem mencionar "de Budista → Judaísmo".

Resultado: o Pedro clica em "Judaísmo", o diálogo aparece, ele fecha/escolhe errado, o chat continua budista — sem aviso, sem limpeza, sem feedback de "nada mudou".

**2) Versículo do dia raso**

O prompt pede "5-8 linhas". O fluxo chama `gemini-2.5-flash` primeiro e só usa o `gemini-2.5-pro` (mais profundo) como fallback de erro/truncamento. Quando o flash devolve algo válido mas raso, o conteúdo profundo nunca é exibido.

## Plano

### A. Fluxo vital: trocar tradição limpa e avisa de verdade

`src/components/ContextPanel.tsx`

1. **Simplificar o diálogo de troca.** Substituir o `AlertDialog` de 3 botões por um `AlertDialog` direto de confirmação com:
   - Título dinâmico: "Trocar de {Atual} para {Nova}?"
   - Descrição explícita: "Sua conversa atual ({Atual}) será encerrada e a janela do chat será limpa. Você pode desfazer por 15 segundos."
   - Dois botões: "Cancelar" / "Sim, trocar e limpar chat".
   - Um link discreto separado: "Só quero conhecer essa tradição (sem trocar)" → navega para `/learn?topic={key}&kind={mode}`.

2. **Unificar o caminho.** Hoje há dois fluxos (com/sem `preferredReligion`). Unificar para que toda troca passe pela mesma confirmação, sempre executando: `applyOption` → toast "Chat limpo, fé atualizada" com ação "Desfazer".

3. **Garantir limpeza visível.** Em `applyOption`:
   - Chamar `setMessages([])` imediatamente (já feito).
   - Forçar `prevAffiliationRef.current = ''` em `ChatArea` para que o efeito de carregar mensagens não restaure conteúdo antigo (passar via uma chave ou usar o próprio `chatContext` — já está ok, mas validar).
   - Manter o `clearAffiliationHistory` no DB após 15s (já feito).

4. **Aviso visual no chat.** Quando a troca acontece, além do toast, exibir um banner suave no topo do `ChatArea`: "Tradição alterada para {Nova}. Conversa anterior foi encerrada." que some em 8s.

`src/components/ChatArea.tsx`

5. Adicionar o banner descrito acima, controlado por um efeito que detecta mudança em `chatContext.religion`/`philosophy`.

### B. Versículo do dia mais profundo

`supabase/functions/verse-of-day/index.ts`

1. **Subir o modelo padrão para `google/gemini-2.5-pro`** (manter flash apenas como fallback rápido se Pro falhar).

2. **Aprofundar o prompt** para todas as tradições:
   - "explanation" passa a exigir **10-14 linhas** (não 5-8), com: contexto histórico, exegese/comentário tradicional citado, conexão doutrinária e aplicação espiritual.
   - "reflection" passa a 3-5 linhas.
   - Reforçar: "Seja erudito e profundo, evite respostas genéricas. Cite fontes reais."

3. **Invalidar cache raso existente.** Adicionar checagem ao ler o cache: se `explanation.length < 400`, descartar e regerar. Assim caches antigos rasos somem automaticamente.

4. Manter `practical_use` como está.

### Detalhes técnicos

- Nenhuma migração de DB necessária.
- `clearAffiliationHistory` e `scheduleAffiliationClear` continuam servindo.
- Edge function `verse-of-day` é redeployada automaticamente.
- O banner usa tokens existentes (`bg-primary/10`, `border-primary/30`).

### Arquivos alterados

- `src/components/ContextPanel.tsx` — unificar fluxo de troca, simplificar diálogo.
- `src/components/ChatArea.tsx` — banner de troca de tradição.
- `supabase/functions/verse-of-day/index.ts` — Pro como padrão, prompts mais profundos, invalidação de cache raso.