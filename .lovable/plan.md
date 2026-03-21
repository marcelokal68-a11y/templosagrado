

# Corrigir Landing Page (8 tradições) + Verificar Versículo do Dia

## Problemas encontrados

1. **Landing.tsx linha 59**: Stats hardcoded como `5` em vez de usar a i18n key `peace_stat1` que já diz "8"
2. **Landing.tsx linha 60**: Label hardcoded "Tradições" em vez de usar `peace_stat1_label`
3. **Landing.tsx linha 81**: Tutorial step 1 lista apenas "Católico, Evangélico, Espírita, Matriz Africana ou Filosofia" — faltam Judaísmo, Hinduísmo e Mórmon
4. **Versículo do Dia**: Já está implementado e acessível via drawer ("Versículo do Dia") e rota `/verse`. Funciona com as 8 tradições (FAITH_OPTIONS já atualizado). Não precisa re-implementar

## Mudanças

### `src/pages/Landing.tsx`

**1. Stats Banner (linhas 57-70)** — trocar valores hardcoded por i18n keys:
- `5` → `{t('landing.peace_stat1', language)}` (que retorna "8")
- `Tradições` → `{t('landing.peace_stat1_label', language)}`
- `Orações pela Paz` → `{t('landing.peace_stat2_label', language)}`

**2. Tutorial Step 1 (linha 81)** — atualizar descrição:
- De: "Católico, Evangélico, Espírita, Matriz Africana ou Filosofia."
- Para: "Católico, Evangélico, Espírita, Matriz Africana, Judaísmo, Hinduísmo, Mórmon ou Filosofia."

Total: **1 arquivo** editado, ~5 linhas alteradas.

