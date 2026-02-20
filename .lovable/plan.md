
# Melhorias UX/UI: Filosofia vs Religiao, Cores, Logo e SignOut

## Resumo

1. **Escolha exclusiva** entre Afiliacao Religiosa OU Filosofia de Vida (nao ambas ao mesmo tempo) com orientacao clara ao usuario
2. **Cores diferenciadas** por grupo de chips no ContextPanel
3. **Logo e nome do app** na pagina de Sign In
4. **Botao de Sign Out** visivel na pagina logada (header e mobile)

---

## 1. Escolha exclusiva: Religiao OU Filosofia

**Arquivos:** `src/components/ContextPanel.tsx`, `src/pages/Practice.tsx`, `src/pages/Prayers.tsx`

Quando o usuario seleciona uma religiao, a filosofia e limpa automaticamente (e vice-versa). Adicionar uma mensagem de orientacao entre os dois grupos:

- No ContextPanel: ao clicar numa religiao, `philosophy` vira `''`. Ao clicar numa filosofia, `religion` vira `''`
- Texto orientativo: "Escolha uma afiliacao religiosa OU uma filosofia de vida para orientar suas respostas" (traduzido)
- Mesma logica em Practice.tsx e Prayers.tsx

## 2. Cores diferenciadas por grupo

**Arquivo:** `src/components/ContextPanel.tsx`

Cada grupo de chips tera uma cor propria no `CollapsibleChipGroup`:

- **Religiao**: `bg-amber-500` (dourado/ambar) quando selecionado
- **Filosofia**: `bg-violet-500` (violeta) quando selecionado
- **O que preciso**: `bg-emerald-500` (verde esmeralda) quando selecionado
- **Mood**: `bg-rose-400` (rosa) quando selecionado
- **Topicos**: `bg-sky-500` (azul celeste) quando selecionado

O `CollapsibleChipGroup` recebera uma prop `activeColor` para definir a cor do chip selecionado em vez de usar `bg-primary` sempre.

Aplicar as mesmas cores nos seletores de Practice.tsx e Prayers.tsx.

## 3. Logo e nome no Sign In

**Arquivo:** `src/pages/Auth.tsx`

Substituir o emoji solto por um header mais polido:
- Manter o emoji `🕉️` em tamanho grande
- Adicionar o nome "Templo Sagrado" abaixo do emoji com `font-display`
- Subtitulo: "Seu guia espiritual e filosofico" (traduzido)

## 4. Sign Out na pagina logada

**Arquivo:** `src/components/Header.tsx`

O botao de logout ja existe no desktop (`hidden md:flex`). Preciso:
- Garantir que o botao de logout apareca tambem no header mobile (dentro do menu hamburger, ja esta)
- Adicionar um avatar/iniciais do usuario ao lado do botao de logout no desktop para melhor UX

**Arquivo:** `src/components/BottomNav.tsx`

O BottomNav nao tem botao de logout. Nao e necessario adicionar la pois ja existe no header mobile (menu hamburger).

---

## Detalhes Tecnicos

### Prop `activeColor` no CollapsibleChipGroup

```typescript
function CollapsibleChipGroup({ 
  label, items, prefix, selected, onSelect, defaultOpen, 
  activeColor = "bg-primary text-primary-foreground border-primary"
}: {
  // ...existing props
  activeColor?: string;
}) {
  // No chip selecionado, usar activeColor em vez de "bg-primary..."
}
```

### Uso com cores:

```typescript
<CollapsibleChipGroup activeColor="bg-amber-500 text-white border-amber-500" ... /> // Religiao
<CollapsibleChipGroup activeColor="bg-emerald-500 text-white border-emerald-500" ... /> // Necessidade
<CollapsibleChipGroup activeColor="bg-rose-400 text-white border-rose-400" ... /> // Mood
<CollapsibleChipGroup activeColor="bg-sky-500 text-white border-sky-500" ... /> // Topicos
<CollapsibleChipGroup activeColor="bg-violet-500 text-white border-violet-500" ... /> // Filosofia
```

### Exclusividade religiao/filosofia

```typescript
// No ContextPanel
onSelect={(v) => setChatContext(prev => ({ ...prev, religion: v, topic: '', philosophy: '' }))}
// ...
onSelect={(v) => setChatContext(prev => ({ ...prev, philosophy: v, religion: '', topic: '' }))}
```

### Orientacao ao usuario

Texto entre os dois grupos:
```typescript
<p className="text-xs text-muted-foreground text-center py-2 italic">
  {t('panel.choose_one', language)}
</p>
```

Traducoes:
- pt-BR: "Escolha uma afiliacao religiosa ou uma filosofia de vida"
- en: "Choose a religious affiliation or a life philosophy"
- es: "Elige una afiliacion religiosa o una filosofia de vida"

### Auth.tsx - Logo melhorado

```typescript
<CardHeader className="text-center">
  <span className="text-5xl mb-2">🕉️</span>
  <CardTitle className="font-display text-2xl">{t('chat.title', language)}</CardTitle>
  <p className="text-sm text-muted-foreground">{t('auth.subtitle', language)}</p>
  <p className="text-xs text-muted-foreground mt-1">
    {isLogin ? t('auth.login', language) : t('auth.signup', language)}
  </p>
</CardHeader>
```

### Arquivos modificados

1. `src/components/ContextPanel.tsx` - Cores diferenciadas, exclusividade, texto orientativo
2. `src/pages/Auth.tsx` - Logo e nome do app
3. `src/pages/Practice.tsx` - Exclusividade religiao/filosofia, cores
4. `src/pages/Prayers.tsx` - Exclusividade religiao/filosofia, cores
5. `src/lib/i18n.ts` - Traducoes novas (panel.choose_one, auth.subtitle)
6. `supabase/functions/sacred-chat/index.ts` - Sem mudancas (ja suporta ambos)
