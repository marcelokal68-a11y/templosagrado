
## Plano de correção: scroll independente no chat web + input sempre visível

### Diagnóstico rápido
Hoje o scroll da página está “acoplado” ao painel da direita. Quando o painel cresce, a página inteira cresce junto e o campo de envio do chat vai para baixo.  
Objetivo: no desktop, **cada coluna ter seu próprio scroll** e o input ficar fixo no rodapé do chat (sem precisar rolar a página).

### O que vou implementar

1. **Travar a altura da área principal no viewport (desktop)**
   - Ajustar os containers pai para usar `min-h-0` + `overflow-hidden` (cadeia completa de flex).
   - Arquivo: `src/App.tsx`
   - Resultado esperado: o `body` não vira a área de scroll do chat.

2. **Refatorar o layout da Home para colunas realmente independentes**
   - Trocar a lógica de altura baseada em `calc(100vh - header)` por altura herdada do pai (`h-full`/`min-h-0`) para evitar “estouro”.
   - Garantir `min-h-0` nos wrappers do chat e do painel direito.
   - Arquivo: `src/pages/Index.tsx`

3. **Fixar o compositor de mensagem no rodapé do chat**
   - Garantir que o `ChatArea` possa encolher corretamente com `min-h-0`.
   - Deixar só a área de mensagens com `overflow-y-auto` e manter a barra de input como `shrink-0`.
   - Arquivo: `src/components/ChatArea.tsx`

4. **Mostrar barra de rolagem clara no painel direito (desktop)**
   - Configurar o `ScrollArea` do painel de opções com rolagem explícita (ex.: `type="always"` no desktop) para deixar claro que ali é uma coluna rolável separada.
   - Arquivo: `src/pages/Index.tsx` (uso do `ScrollArea`)

### Detalhes técnicos
- Classes-chave que vou padronizar na cadeia: `flex`, `flex-1`, `h-full`, `min-h-0`, `overflow-hidden`.
- O princípio será:
  - **Página**: sem scroll global para o chat.
  - **Chat**: scroll interno na lista de mensagens.
  - **Painel direito**: scroll interno próprio.
- Isso elimina o efeito de “o input foi parar lá embaixo”.

### Critérios de aceite (web)
- Ao abrir `/`, o campo “Pergunte…” já aparece no rodapé do chat sem rolar a página.
- Rolar o chat **não** move o painel da direita.
- Rolar o painel da direita **não** move o chat.
- A página não ganha scroll vertical por causa do conteúdo da direita.
