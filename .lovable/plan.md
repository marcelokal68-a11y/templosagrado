

## Goal
Bring back the **Ecumenical Wall** as the main mural — a global feed for all religions, focused on world peace — with **AI moderation** that blocks aggressive/prejudiced/racist content **before publication** and notifies the admin about offenders.

## Changes

### 1. Mural page — replace simple feed with Ecumenical Wall
- `src/pages/Mural.tsx`: rewrite to host the **Ecumenical Wall** (all-religions feed) with a visible composition area at the top.
- Header: "Mural Ecumênico — Pela Paz no Mundo" + subtitle.
- Filters by religion (12 traditions, same as chat/Learn) — clicking filters the feed.
- Reuse the existing `EcumenicalWall.tsx` component (already implemented and working) and add the new composer above it.
- Posts created from this page automatically use `is_public = true` and tag the user's `preferred_religion` (from profile) so they show up in religion filters.

### 2. New AI moderation edge function — `moderate-post`
- **Public function** (`verify_jwt = false` — auth handled in code via Authorization header).
- Input: `{ content: string }`.
- Calls **Lovable AI Gateway** (`google/gemini-3-flash-preview`) with **tool calling** to return strict structured output:
  ```json
  { "allowed": boolean, "category": "ok"|"hate"|"racism"|"violence"|"prejudice"|"profanity"|"other", "reason": "short PT explanation" }
  ```
- System prompt: instruct the model to flag aggressive, prejudiced, racist, hateful, violent, or discriminatory content against any religion, race, gender, or group. Allow respectful prayers from any tradition.
- Returns JSON to client. Handles 429/402 errors gracefully.

### 3. New table — `moderation_flags` (migration)
- Stores blocked attempts so admin can review offenders.
- Columns: `id`, `user_id`, `content` (the blocked text), `category`, `reason`, `created_at`.
- RLS: only admins can SELECT/DELETE; users can INSERT their own (`auth.uid() = user_id`).

### 4. Composer flow (in Mural and `PublishToMural.tsx`)
1. User writes prayer → clicks Publish.
2. Local `containsProfanity()` check first (cheap fast block).
3. Call `moderate-post` edge function.
4. If `allowed=false`:
   - Show toast: "Conteúdo bloqueado: [reason]. O administrador foi notificado."
   - Insert row in `moderation_flags`.
   - Do **NOT** publish.
5. If `allowed=true`: insert into `prayer_wall_posts` as before.

### 5. Admin page — add "Moderação" tab
- `src/pages/Admin.tsx`: add a new tab listing rows from `moderation_flags` (most recent first) with: user email, blocked content, category badge, reason, timestamp, and a "Apagar" button.
- Helps the admin track repeat offenders manually.

### 6. Sidebar/labels
- No route change (still `/mural`).
- Update i18n keys: `mural.title` → "Mural Ecumênico — Pela Paz no Mundo".

## Technical notes
- Reuse existing `prayer_wall_posts` table — no schema change there.
- AI moderation via existing `LOVABLE_API_KEY` (already configured); no user-facing key request.
- The 12 religions list matches the one already synced into chat/Learn.
- Realtime subscription on `prayer_wall_posts` already in `EcumenicalWall.tsx`, so new posts appear instantly.

