
## Plano: Destacar fé escolhida e esmaecer outras tradições

### Comportamento desejado
Quando o usuário já tem `preferred_religion` salva no perfil:
1. **No painel de contexto do Chat** (`ContextPanel.tsx`) — a fé escolhida fica destacada normalmente; as outras 7 tradições e os blocos "Em breve" ficam **transparentes (opacity-40)**. Clicar em uma esmaecida abre diálogo: "Deseja mudar sua fé para X?" com três opções:
   - **Sim, mudar minha fé** → salva em `profiles.preferred_religion`, limpa chat (já existe `clearChatWithUndo`), e ativa a nova tradição.
   - **Só explorar / tirar dúvidas** → abre /learn com aquela tradição pré-selecionada (não muda a fé).
   - **Cancelar**.

2. **Na página Aprenda** (`Learn.tsx`) — mesmo visual: card da fé do usuário fica em destaque (ring/glow sutil "Sua tradição"), outras religiões e filosofias ficam com opacity reduzida mas clicáveis livremente (aprendizado é exploratório, não muda fé). Mantém o prompt já existente de "Deseja configurar como sua fé?" ao final da primeira resposta.

3. **Se `preferred_religion` não está definida** — tudo aparece normal, sem esmaecer (comportamento atual).

### Mudanças técnicas

**`src/components/ContextPanel.tsx`**
- Ler `preferred_religion` via `useApp` (vou expor um valor novo no contexto, ou ler direto do profile — mais simples: carregar uma vez via `supabase` no mount, ou adicionar `preferredReligion` ao `AppContext`). Vou adicionar `preferredReligion: string | null` ao `AppContextType` (já é carregado em `loadProfile`, basta expor).
- Em `FAITH_OPTIONS.map` e `COMING_SOON_OPTIONS.map`: se `preferredReligion` existe e o card não é a fé escolhida → aplicar classes `opacity-40 hover:opacity-70`.
- Novo estado `exploreIntent: { option, mode: 'switch' | 'learn' } | null` e novo `AlertDialog` com 3 botões (Mudar fé / Explorar / Cancelar). "Explorar" chama `navigate('/learn?topic=<key>')`.
- O diálogo de confirmação atual (`showConfirm`) é substituído por este novo fluxo, mais rico.

**`src/pages/Learn.tsx`**
- Ler `preferredReligion` de `useApp`.
- Aceitar query param `?topic=<key>` via `useSearchParams` para abrir direto em um tópico (usado ao clicar "Explorar" no Chat).
- Nos grids de religiões e filosofias: se `preferredReligion` existe, destacar card correspondente (ring primary, badge "⭐ Sua tradição") e esmaecer outros com `opacity-50 hover:opacity-100`. Nada bloqueia o clique — segue exploratório.

**`src/contexts/AppContext.tsx`**
- Adicionar `preferredReligion: string | null` no type e no provider (já é lido em `loadProfile`, só precisa de state + expor).
- Atualizar quando `handleFaithConfirm` roda e quando o Learn/Profile/Chat salva uma nova fé. `refreshProfile()` já recarrega tudo.

### Resultado visual
```text
  ChatContext panel (usuário=judaico):
  ┌─────────────────────────────┐
  │ ○ Católico         (40%)    │ ← clique abre diálogo
  │ ○ Evangélico       (40%)    │
  │ ● JUDAÍSMO ✓       (100%)   │ ← destacado
  │ ○ Hinduísmo        (40%)    │
  │ ...                         │
  └─────────────────────────────┘

  Diálogo ao clicar esmaecido:
  ┌─────────────────────────────┐
  │ Mudar para Hinduísmo?       │
  │ [Mudar minha fé]            │
  │ [Só explorar (Aprenda)]     │
  │ [Cancelar]                  │
  └─────────────────────────────┘
```

### Notas
- Sem mudança de banco; só UI + contexto.
- Mantém `preferred_religion = null` como "sem fé definida" (tudo normal).
- "Prefiro não especificar" no Profile continua limpando a fé, o que reverte o esmaecimento.
