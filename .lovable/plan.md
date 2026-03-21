

# Versão 1 — 8 Tradições + Mural + Versículo do Dia

## Resumo

Expandir de 5 para 8 tradições em todo o app: **Católica, Evangélica, Espírita, Matriz Africana, Judaísmo, Hinduísmo, Mórmon, Agnóstico/Filosofia**. Atualizar landing page, garantir Mural e Versículo funcionando.

## Mudanças

### 1. Atualizar FAITH_OPTIONS em 3 arquivos

Adicionar jewish, hindu, mormon e agnostic às listas de seleção de tradição.

**Arquivos:**
- `src/components/ContextPanel.tsx` (linha 50-56) — adicionar 3 novas opções com ícones
- `src/pages/Verse.tsx` (linha 12-18) — adicionar 3 novas opções
- `src/pages/Prayers.tsx` (linha 15-21) — adicionar 3 novas opções

Nova lista (8 itens):
```
catholic → Católico
protestant → Evangélico  
spiritist → Espírita
candomble → Matriz Africana
jewish → Judaísmo
hindu → Hinduísmo
mormon → Mórmon
agnostic → Agnóstico / Filosofia
```

### 2. Atualizar Profile.tsx — lista de tradições (linha 11-17)

Adicionar jewish, hindu, mormon, agnostic à lista de tradições editáveis no perfil.

### 3. Atualizar TOPICS_BY_RELIGION no ContextPanel (linha 33-39)

Adicionar tópicos específicos para jewish, hindu, mormon e agnostic (já existe agnostic parcialmente).

### 4. Atualizar SPOTIFY_PLAYLISTS no ContextPanel (linha 18-29)

Adicionar playlists para jewish, hindu, mormon (podem usar a default por enquanto).

### 5. Atualizar ReligionIcon.tsx

Já tem ícones para jewish (Star), mormon (Cross), buddhist (Flower2), hindu (🕉️). Verificar se agnostic tem ícone.

### 6. Atualizar Landing Page — stats de "5" para "8"

**Arquivo:** `src/lib/i18n.ts`
- `peace_stat1`: "5" → "8" (pt, en, es)
- `peace_desc`: atualizar lista para incluir as 8 tradições (pt, en, es)
- `feat_chat_desc`: atualizar menção de tradições (pt, en, es)

### 7. Verificar sacredPlaces.ts

Já tem jewish, mormon, hindu, agnostic, spiritist, candomble, catholic, protestant no Mural. **Nenhuma mudança necessária** — o Mural já suporta todas as 8 tradições.

### 8. Backend — sacred-chat, generate-prayer, verse-of-day

Já têm SACRED_TEXTS para jewish, mormon, buddhist, hindu, agnostic. **Nenhuma mudança necessária** nas edge functions.

## Arquivos a editar

| Arquivo | Mudança |
|---------|---------|
| `src/components/ContextPanel.tsx` | FAITH_OPTIONS + TOPICS + SPOTIFY |
| `src/pages/Verse.tsx` | FAITH_OPTIONS |
| `src/pages/Prayers.tsx` | FAITH_OPTIONS |
| `src/pages/Profile.tsx` | traditions list |
| `src/lib/i18n.ts` | stats "5"→"8", peace_desc, feat_chat_desc |
| `src/components/ReligionIcon.tsx` | Adicionar agnostic icon |

Total: 6 arquivos editados, 0 migrações de banco.

