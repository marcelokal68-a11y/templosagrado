## Problema

No PWA (mobile) está confuso/quebrado mudar de fé. Investigando o código encontrei 3 causas concretas:

1. **No mobile o `ContextPanel` (onde fica "Escolha seu caminho") não é renderizado.** Em `src/pages/Index.tsx` ele só aparece em `md:` para cima. No celular o usuário não tem como trocar a tradição direto do chat.
2. **A lista do Perfil está incompleta.** `src/pages/Profile.tsx` lista só 8 tradições (catholic, protestant, spiritist, candomble, jewish, hindu, mormon, agnostic) — faltam **christian, islam, buddhist, umbanda** que existem no ContextPanel e no resto do app. Quem é Evangélico, Muçulmano, Budista ou Umbandista não consegue salvar no Perfil.
3. **Salvar tradição no Perfil não atualiza o AppContext.** `saveReligion` só faz `setProfile` local — `chatContext.religion` e `preferredReligion` continuam com o valor antigo até recarregar o app, e o `AlertDialog` "ask_faith" pode disparar de novo. Resultado: parece que "não funciona".

Bônus: o `AlertDialog` em `AppContext.tsx` usa a mesma chave `learn.ask_faith` para título e descrição (texto duplicado).

## Correções

### 1. Sincronizar Perfil com AppContext
`src/pages/Profile.tsx`
- Em `saveReligion`, após o update no Supabase chamar `refreshProfile()` do `useApp()` (já existe) para repropagar `preferred_religion` → `chatContext.religion` e `preferredReligion`.
- Limpar `chatContext.religion` quando salvar `null` ("Limpar minha fé").

### 2. Lista completa no Perfil
`src/pages/Profile.tsx`
- Substituir o array `traditions` pelos mesmos 11 itens do `ContextPanel.FAITH_OPTIONS` (christian, catholic, protestant, mormon, jewish, islam, hindu, buddhist, spiritist, umbanda, candomble) + manter "agnostic" como fallback ou na opção "Prefiro não especificar".
- Manter destaque "★ sua tradição" no item salvo.

### 3. Acesso ao seletor de fé no mobile
`src/pages/Index.tsx` + `src/components/ChatArea.tsx`
- Adicionar um botão discreto no header do chat mobile ("Tradição: ★ Cristão ▾") que abre um `Sheet`/`Drawer` com o `ContextPanel` (reusando o componente existente — sem duplicar lógica).
- O `Sheet` fecha ao escolher/confirmar (já existe `onClose` no ContextPanel).
- Assim, no PWA o usuário troca a fé pelo mesmo fluxo que no desktop, com o diálogo "Mudar minha fé / Só explorar / Cancelar" já implementado.

### 4. Corrigir diálogo duplicado
`src/contexts/AppContext.tsx`
- Usar texto distinto para `AlertDialogDescription` (algo como "Quer salvar essa tradição como sua fé principal? Você pode mudar a qualquer momento no Perfil.") em vez de repetir o título.

## Resultado
- No PWA, mudar a fé funciona pelo Perfil **e** pelo chat (botão no header → Sheet com ContextPanel).
- Trocar no Perfil reflete imediatamente no chat (sem F5).
- Todas as 11 tradições disponíveis nos dois lugares.
- Diálogo de confirmação sem texto duplicado.

Não mexe em backend, RLS, edge functions ou esquema — só UI/estado no frontend.
