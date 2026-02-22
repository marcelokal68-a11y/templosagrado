

## Redesign Mobile UX: Bottom Nav Lean + Upgrade Diamond + Mural Integration

### Overview
Redesign the mobile experience to eliminate tab overlap, remove Pricing from navigation, add an upgrade diamond icon, and integrate "Publish to Mural" directly into Chat, Prayers, Verse, and Posts.

---

### 1. Bottom Nav -- Reduce to 4 tabs

Current: 9 items causing overlap.
New layout (mobile only):

| Tab | Icon | Route |
|-----|-------|-------|
| Chat | MessageCircle | / |
| Oracoes | Heart | /prayers |
| Versiculo | BookOpen | /verse |
| Aprender | GraduationCap | /learn |

Removed from bottom nav: Pricing, Mural, Post, Practice, Invite.
- **Post** stays accessible via sidebar (desktop) and via a button inside Chat (since posts are generated from chat messages).
- **Practice** and **Invite** stay in sidebar only.

**File**: `src/components/BottomNav.tsx`

---

### 2. Upgrade Diamond in Header

Add a `Gem` icon (lucide) in the Header, visible only to logged-in users who are NOT premium subscribers (`is_subscriber === false`). Clicking navigates to `/pricing`.

- Subtle golden pulse animation via Tailwind (`animate-pulse`)
- Positioned between the language selector and user info
- Uses profile data already available in AppContext (need to check if `is_subscriber` is exposed)

**File**: `src/components/Header.tsx`
**File**: `src/contexts/AppContext.tsx` (expose `isSubscriber` from profile if not already)

---

### 3. Publish to Mural -- New Reusable Component

Create `src/components/mural/PublishToMural.tsx`:

- Receives `originalContent: string` as prop
- Shows a button (ScrollText icon) labeled "Publicar no Mural"
- On click, opens a Dialog/Drawer with:
  - AI-generated summary (calls existing `sacred-chat` edge function with a summarization prompt)
  - Editable textarea for user to adjust
  - Toggle: "Meu Templo" (user's religion) vs "Ecumenico"
  - "Confirmar e Publicar" button
- Inserts into `prayer_wall_posts` table on confirm
- Includes profanity filter check

**New file**: `src/components/mural/PublishToMural.tsx`

---

### 4. Integrate PublishToMural into Features

Add the PublishToMural button in:

- **ChatArea.tsx**: Inside `MessageBubble`, next to the "Ouvir" button for assistant messages
- **Prayers.tsx**: In the generated prayer result card, alongside Copy/Regenerate buttons
- **Verse.tsx**: In the verse card actions area
- **Posts.tsx**: In each generated post card, alongside the Copy button

**Files modified**:
- `src/components/ChatArea.tsx`
- `src/pages/Prayers.tsx`
- `src/pages/Verse.tsx`
- `src/pages/Posts.tsx`

---

### 5. AppContext -- Expose Subscriber Status

Check if `isSubscriber` is already available. If not, add it by reading `profiles.is_subscriber` when user loads.

**File**: `src/contexts/AppContext.tsx`

---

### Technical Details

**PublishToMural component flow:**

```text
User clicks "Publicar no Mural"
       |
       v
Dialog opens with loading spinner
       |
       v
Call sacred-chat with prompt:
  "Resuma este conteudo em ate 500 caracteres
   para publicacao em um mural sagrado: [content]"
       |
       v
Show editable summary + religion/ecumenical toggle
       |
       v
User confirms --> Insert into prayer_wall_posts
       |
       v
Toast success, close dialog
```

**Database**: No schema changes needed. The existing `prayer_wall_posts` table already supports `content`, `religion`, `is_public` (ecumenical), `is_anonymous`, `display_name`, `user_id`.

**RLS**: Already has INSERT policy for subscribers. Non-subscribers will get a graceful error prompting upgrade.

**Files changed (summary):**
- `src/components/BottomNav.tsx` -- reduce to 4 items
- `src/components/Header.tsx` -- add Gem upgrade icon
- `src/contexts/AppContext.tsx` -- expose isSubscriber
- `src/components/mural/PublishToMural.tsx` -- NEW component
- `src/components/ChatArea.tsx` -- add publish button to assistant messages
- `src/pages/Prayers.tsx` -- add publish button to generated prayer
- `src/pages/Verse.tsx` -- add publish button to verse card
- `src/pages/Posts.tsx` -- add publish button to generated posts

