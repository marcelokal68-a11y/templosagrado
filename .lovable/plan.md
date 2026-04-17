

## Goal
Add **Protestantismo** as a fully visible tradition in both Chat (ContextPanel) and Estudo de Religiões (Learn), with the AI Mentor and Professor having deep knowledge of its sacred books, pastors, and prophets.

## Findings
- `Learn.tsx` already lists `protestant` in `RELIGIONS` array — appears in Estudo. ✓
- `ContextPanel.tsx` (after last sync) lists `protestant` as a faith option. ✓
- Both render `t('religion.protestant', language)` — need to verify this i18n key exists and shows "Protestante / Protestant / Protestante".
- `ReligionIcon.tsx` already maps `protestant: Cross`. ✓
- **Real gap**: the AI prompts (`learn-chat`, `sacred-chat`) likely don't have specific guidance about Protestant content (Reformed canon, key reformers, modern pastors/prophets).
- Need to check i18n translations and AI system prompts.

## Changes

### 1. i18n labels (`src/lib/i18n.ts`)
- Confirm/add `religion.protestant` and `philosophy.protestant` keys in PT/EN/ES.
- Add specific topic labels for Protestant study: `reformation`, `reformers`, `sola_scriptura`, `pastors_prophets`, `protestant_bible`.

### 2. ContextPanel topics (`src/components/ContextPanel.tsx`)
- Add a `protestant`-specific topic list including: Reforma, Sola Scriptura, Pastores e Profetas modernos, Bíblia (66 livros), Avivamento, Pentecostes — alongside the universal topics.

### 3. AI Mentor prompt (`supabase/functions/sacred-chat/index.ts`)
- Add a Protestant-specific section in the system prompt: when religion = `protestant`, the mentor speaks as an evangelical/reformed pastor, references the **66-book Protestant Bible** (39 OT + 27 NT, no apocrypha), cites figures like **Lutero, Calvino, Wesley, Spurgeon, Billy Graham, Martyn Lloyd-Jones, John Piper, R.C. Sproul, Tim Keller**, and prophets honored by Protestants (the biblical prophets: Isaías, Jeremias, Ezequiel, Daniel, etc.).

### 4. AI Professor prompt (`supabase/functions/learn-chat/index.ts`)
- When topic = `protestant`, provide rich, structured content covering:
  - **Sacred books**: 66-book Protestant Bible; key denominational confessions (Confissão de Fé de Westminster, Confissão de Augsburgo, 39 Artigos Anglicanos, Confissão Batista de 1689).
  - **Reformers (séc. XVI)**: Martinho Lutero, João Calvino, Ulrico Zuínglio, John Knox, William Tyndale.
  - **Great pastors/preachers**: John Wesley, George Whitefield, Jonathan Edwards, Charles Spurgeon, D.L. Moody, Billy Graham, Martyn Lloyd-Jones, John Stott, John Piper, Tim Keller, R.C. Sproul.
  - **Prophets** (recognized within Protestant tradition): the OT prophets canonized in the 66-book Bible.
  - The 5 Solas (Sola Scriptura, Sola Fide, Sola Gratia, Solus Christus, Soli Deo Gloria).

### 5. Estudo grid visibility (`src/pages/Learn.tsx`)
- `protestant` is already in `RELIGIONS`. Confirm icon + label render correctly. No layout change needed unless i18n key is missing.

## Files touched
- `src/lib/i18n.ts` (add/verify keys)
- `src/components/ContextPanel.tsx` (Protestant topics)
- `supabase/functions/sacred-chat/index.ts` (prompt enrichment)
- `supabase/functions/learn-chat/index.ts` (prompt enrichment)
- `src/pages/Learn.tsx` (only if label/icon adjustment needed)

## Notes
- No DB changes required.
- No new dependencies.
- Catholic tradition keeps the 73-book canon; Protestant explicitly uses 66 books — the prompts will make this distinction clear so the AI doesn't mix them up.

