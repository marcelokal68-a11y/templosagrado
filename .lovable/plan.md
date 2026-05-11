## Objetivo
Garantir que **todo o app** (UI, toasts, modais, glossários, página de planos, política, etc.) tenha versões completas em **Inglês (en)** e **Espanhol (es)** além de Português-BR. Hoje muitos componentes ainda têm strings em português "no código", mesmo quando o resto do app usa o sistema `t()` de `src/lib/i18n.ts`.

## Diagnóstico

- `src/lib/i18n.ts` já tem **613 chaves cobertas nas 3 línguas** (pt-BR / en / es) — está consistente.
- Porém, **45 arquivos** ainda contêm strings em português hardcoded (toasts, descrições, labels de seções, conteúdo institucional). Áreas mais afetadas:
  - **Páginas:** `Pricing.tsx` (planos, features, mensagens), `Privacy.tsx` (texto institucional), `Profile.tsx`, `Journey.tsx`, `Auth.tsx`, `Landing.tsx`, `Mural.tsx`, `Verse.tsx`, `Practice.tsx`, `Prayers.tsx`, `Invite.tsx`, `InviteRedeem.tsx`, `Install.tsx`, `Admin*.tsx`.
  - **Componentes:** `ContextPanel.tsx`, `ChatArea.tsx`, `ChatHistory.tsx`, `ActivityHistory.tsx`, `TrialBanner.tsx`.
  - **Mural:** `NoteForm.tsx`, `EcumenicalWall.tsx`, `SacredPlace.tsx`, `TempleGallery.tsx`, `ReportDialog.tsx`, `ReligionPicker.tsx`, `PrayerNote.tsx`, `PublishToMural.tsx`.
  - **Learn (glossários e comparações):** `SanskritGlossary.tsx`, `BuddhistGlossary.tsx`, `HebrewGlossary.tsx`, `SpiritistGlossary.tsx`, `CandombleGlossary.tsx`, `ChristianBranchesComparison.tsx`, `IslamBranchesComparison.tsx`, `JewishBranchesComparison.tsx`, `BuddhistSchoolsComparison.tsx`, `HinduDarshanasComparison.tsx`, `PodcastControls.tsx`, `ListenButton.tsx`.
  - **Outros:** `ttsPlayer.ts` (mensagens de erro).
- Os glossários (`SanskritGlossary`, `BuddhistGlossary`, etc.) já têm conteúdo em pt/en/es no próprio arquivo via objetos por idioma — mas alguns labels auxiliares ainda estão em PT.
- O backend (edge functions de chat/verso/análise) já recebe o `language` do usuário e responde no idioma certo; **não precisa mudar**.

## Estratégia (apenas frontend / apresentação)

1. **Centralizar no `t()`** — para textos curtos e reutilizáveis (toasts, botões, labels), adicionar novas chaves em `src/lib/i18n.ts` nos 3 idiomas e substituir os literais por `t('chave', language)`.
2. **Padrão `labels = { 'pt-BR': {...}, en: {...}, es: {...} }`** — para blocos longos e específicos da página (ex.: Pricing, Privacy, Install já usa esse padrão), manter o objeto local com as 3 versões e selecionar via `language`.
3. **Glossários e comparações** — completar `pt/en/es` em cada termo / branch / school onde faltar, e traduzir os labels de cabeçalho (já presentes em alguns).
4. **Toasts e alerts** — todo `toast({...})` com texto em PT vira `t('chave', language)`.

## Plano de execução por lotes

Para manter cada lote revisável e o `i18n.ts` organizado, dividir em 6 etapas. Cada etapa adiciona as chaves novas no `i18n.ts` (em pt-BR, en, es) e troca os literais nos arquivos correspondentes.

**Lote 1 — Páginas principais de conversão**
- `Pricing.tsx` (planos, features, mensagens de cancelamento, banner gratuito, rodapé Stripe/PIX)
- `Auth.tsx` (formulário de login/signup, mensagens de erro)
- `Landing.tsx` (hero, CTAs, trust badges restantes)

**Lote 2 — Páginas de conta e jornada**
- `Profile.tsx` (toasts de salvar, labels de seção, religião)
- `Journey.tsx` (cabeçalhos, mensagens vazias, botões)
- `Invite.tsx` + `InviteRedeem.tsx` (fluxo de convites)
- `Install.tsx` (já tem padrão labels — só revisar)
- `Privacy.tsx` (já tem padrão labels — completar EN/ES se faltar)

**Lote 3 — Chat e contexto**
- `ChatArea.tsx`, `ChatHistory.tsx`, `ActivityHistory.tsx` (toasts, placeholders, ações)
- `ContextPanel.tsx` (seletor de fé / mood / necessidade — labels e descrições)
- `TrialBanner.tsx` (CTA do trial)
- `ttsPlayer.ts` (mensagens de erro de áudio)

**Lote 4 — Mural Sagrado**
- `NoteForm.tsx`, `PublishToMural.tsx`, `PrayerNote.tsx`, `ReligionPicker.tsx`
- `EcumenicalWall.tsx`, `SacredPlace.tsx`, `TempleGallery.tsx`, `ReportDialog.tsx`

**Lote 5 — Aprender (glossários e comparações)**
- Completar pt/en/es em todos os glossários e comparações listados.
- Traduzir labels de cabeçalho ("Termos sânscritos essenciais", etc.) — alguns já estão multilíngues.
- `PodcastControls.tsx`, `ListenButton.tsx`.

**Lote 6 — Páginas restantes e admin**
- `Verse.tsx`, `Practice.tsx`, `Prayers.tsx`, `Mural.tsx`
- `Admin.tsx`, `AdminAnalytics.tsx`, `AdminKnowledge.tsx` (admin pode ficar só em PT se preferir; ver pergunta abaixo)

## Validação ao final de cada lote

- `rg "[áàâãéêíóôõúç]" <arquivos do lote>` deve retornar **somente** strings dentro de blocos `'pt-BR'` de objetos labels ou comentários.
- Trocar idioma no app (PT→EN→ES) e abrir as telas alteradas para conferir que nada ficou em PT.
- Build automático do harness valida tipos.

## Fora do escopo
- Não mexer em backend / edge functions (já são multi-idioma via prompt).
- Não criar novos componentes nem mudar lógica de negócio.
- Não traduzir conteúdo dinâmico vindo do banco (orações enviadas, posts do mural — são do usuário).

## Pergunta para confirmar antes de começar
- **Páginas de Admin** (`/admin`, `/admin/analytics`, `/admin/knowledge`): traduzir também ou manter só em PT-BR (já que só você acessa)? Vou seguir traduzindo tudo, a menos que prefira pular o admin.
