

## Plano

### Parte 1 — Acesso total no preview (reforçar)

**Problema:** A detecção atual exige `lovable.app` **E** `preview` no host. O preview oficial (`id-preview--...lovable.app`) passa, mas qualquer subdomínio de staging novo pode falhar. Além disso, o bloqueio só é client-side — endpoints como `check-subscription` ainda podem reportar `expired`.

**Alterações em `src/lib/access.ts`:**
- Simplificar `isPreviewEnvironment()` para liberar **qualquer** host que contenha `lovable.app`, `lovableproject.com`, `localhost`, `127.0.0.1`, ou `lovable.dev`.
- Garantir retorno `subscriber` com `questions_limit: 999999` implícito.

**Alterações em `src/contexts/AppContext.tsx`:**
- Quando `isPreviewEnvironment()` for true, forçar `setQuestionsRemaining(999999)` e `setIsSubscriber(true)` no boot, ignorando o que a API retornar.

**Alterações em `src/components/ChatArea.tsx` e `TrialBanner.tsx`:**
- Esconder o `TrialBanner` e qualquer modal de upgrade quando `isPreviewEnvironment()` for true (mesmo que `accessStatus` venha como `expired` por algum motivo).

Resultado: no preview, **nunca** aparece tela de pagamento, banner de trial, ou bloqueio de mensagens.

---

### Parte 2 — Spotify autoplay por tradição

**Limitação técnica importante:** O iframe `open.spotify.com/embed` **não suporta autoplay sem clique** — é uma restrição do próprio Spotify e dos navegadores (política de autoplay). O parâmetro `autoplay=1` foi descontinuado para iframes não-premium.

**Solução prática (3 melhorias combinadas):**

1. **Curadoria por tradição** — substituir os IDs genéricos por playlists realmente alinhadas:
   ```
   christian   → Hinos Cristãos / Worship
   catholic    → Cantos Gregorianos / Missa
   protestant  → Louvor Evangélico / Hillsong
   jewish      → Salmos / Cantos Hebraicos / Niggunim
   islam       → Recitação do Alcorão / Nasheeds
   hindu       → Mantras / Bhajans / Kirtan
   buddhist    → Cantos Tibetanos / Zen
   spiritist   → Música Espírita / Vinha de Luz
   umbanda/candomble → Pontos cantados (já está)
   mormon      → Coro do Tabernáculo
   agnostic    → Música clássica / instrumental contemplativa
   ```
   Vou pesquisar IDs reais de playlists públicas para cada uma.

2. **Auto-troca instantânea** — quando o usuário muda de tradição, o iframe já recarrega (via `key={playlistId}`). Manter, mas adicionar uma transição suave.

3. **Botão "▶ Tocar agora"** discreto sobre o iframe — um clique só, que envia mensagem `postMessage` ao iframe Spotify para iniciar reprodução. Como autoplay puro é bloqueado, esse é o caminho mais próximo de "automático".

**Alterações em `src/components/ContextPanel.tsx`:**
- Atualizar o mapa `SPOTIFY_PLAYLISTS` com IDs curados por tradição.
- Adicionar botão "▶ Tocar música sacra" overlay no iframe que dispara o play via clique simulado.
- Adicionar `allow="autoplay; ..."` (já existe) e parâmetro `?autoplay=1` na URL (mesmo que limitado, ajuda em alguns casos).

---

### Arquivos modificados
- `src/lib/access.ts` — detecção de preview mais ampla
- `src/contexts/AppContext.tsx` — forçar acesso total no preview
- `src/components/TrialBanner.tsx` — esconder banner no preview
- `src/components/ChatArea.tsx` — esconder modal de upgrade no preview
- `src/components/ContextPanel.tsx` — playlists curadas + botão play

### Nota sobre autoplay
Vou ser transparente: **autoplay 100% automático em iframe Spotify não é tecnicamente possível** sem login Premium + SDK Web Playback (que exigiria autenticação OAuth do usuário com Spotify). A solução proposta é o **mais próximo possível**: playlists certas + um clique para tocar.

