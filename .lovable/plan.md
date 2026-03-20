

# Alinhar Landing Page às Features Reais do MVP

## Problemas encontrados

1. **Descrição do Chat** menciona "12+ tradições religiosas e filosóficas" — o MVP tem 5
2. **Seção de Paz** lista "judeus, cristãos, muçulmanos, budistas, hindus" — religiões fora do MVP
3. **Mural - Templos Temáticos** menciona "Muro das Lamentações à Kaaba" — referências fora do MVP
4. **Versões en/es** também têm "12+ traditions" — precisam ser corrigidas

## Mudanças

### `src/lib/i18n.ts`

| Chave | Atual | Corrigido |
|-------|-------|-----------|
| `feat_chat_desc` (pt) | "...de 12+ tradições religiosas e filosóficas" | "...das principais tradições de fé brasileiras" |
| `feat_chat_desc` (en/es) | "...from 12+ religious..." | "...from the main faith traditions" |
| `peace_desc` (pt) | "...judeus, cristãos, muçulmanos, budistas, hindus, espíritas e livres pensadores..." | "...católicos, evangélicos, espíritas, praticantes de matriz africana e buscadores de sabedoria..." |
| `mural_feat1_desc` (pt) | "...do Muro das Lamentações à Kaaba" | "Cada tradição tem seu espaço sagrado para orar e refletir" |
| Mesmas chaves em en/es | Equivalentes | Alinhados ao MVP |

### `src/pages/Landing.tsx`
- Nenhuma mudança estrutural — apenas os textos via i18n serão atualizados

Total: **1 arquivo** editado (`i18n.ts`), ~8 strings corrigidas nas 3 línguas.

