

## Objetivo

Na tela de seleção de tópicos do `/learn`, exibir apenas os glossários/comparativos da **tradição marcada como "sua tradição"** (`preferredReligion`). Hoje aparecem todos juntos (Sânscrito + Budista + Hindu + Islâmico + Hebraico + Judaico + Cristão + Candomblé), poluindo a tela como mostra o screenshot.

## Mapa Religião → Componentes Visuais

| `preferredReligion` | Componentes exibidos |
|---|---|
| `jewish` | `HebrewGlossary` + `JewishBranchesComparison` |
| `christian` / `catholic` / `protestant` / `mormon` | `ChristianBranchesComparison` |
| `islam` | `IslamBranchesComparison` |
| `hindu` | `SanskritGlossary` + `HinduDarshanasComparison` |
| `buddhist` | `BuddhistGlossary` + `BuddhistSchoolsComparison` |
| `candomble` / `umbanda` | `CandombleGlossary` |
| `spiritist` | (nenhum primer dedicado hoje — manter limpo) |
| `agnostic` / nenhum | Nenhum primer (tela limpa, só os botões de religiões + filosofias + recomendados) |

## Heurística UX (princípios aplicados)

- **Progressive disclosure**: mostra só o que é relevante ao contexto atual do usuário.
- **Reduce cognitive load**: ao marcar Judeu, o usuário vê apenas conteúdo judaico.
- **Affordance preservada**: os primers continuam acessíveis dentro da sessão de chat de cada tradição (linhas 636-680, já filtradas por `topic` — sem mudanças lá).
- **Fallback gracioso**: usuário sem `preferredReligion` definido vê tela limpa (sem primers) — incentiva escolher uma tradição primeiro.

## Mudança

### `src/pages/Learn.tsx` (única alteração)

Substituir o bloco fixo de seções (linhas 470-513) por um único bloco condicional baseado em `preferredReligion`:

```tsx
{/* Primers visuais — apenas da tradição preferida do usuário */}
{preferredReligion === 'jewish' && (
  <>
    <section className="mb-10"><HebrewGlossary /></section>
    <section className="mb-10"><JewishBranchesComparison /></section>
  </>
)}
{(preferredReligion === 'christian' || preferredReligion === 'catholic' 
  || preferredReligion === 'protestant' || preferredReligion === 'mormon') && (
  <section className="mb-10"><ChristianBranchesComparison /></section>
)}
{preferredReligion === 'islam' && (
  <section className="mb-10"><IslamBranchesComparison /></section>
)}
{preferredReligion === 'hindu' && (
  <>
    <section className="mb-10"><SanskritGlossary /></section>
    <section className="mb-10"><HinduDarshanasComparison /></section>
  </>
)}
{preferredReligion === 'buddhist' && (
  <>
    <section className="mb-10"><BuddhistGlossary /></section>
    <section className="mb-10"><BuddhistSchoolsComparison /></section>
  </>
)}
{(preferredReligion === 'candomble' || preferredReligion === 'umbanda') && (
  <section className="mb-10"><CandombleGlossary /></section>
)}
```

Resultado para o screenshot (usuário "Judeu"): some todo conteúdo de Sânscrito/Budista/Hindu/Islâmico/Cristão/Candomblé, restando só Hebraico + Ramos do Judaísmo abaixo do grid de religiões — tela enxuta.

## Fora de escopo

- Não mudar os primers dentro do chat (linhas 636-680) — eles já são filtrados por `topic`.
- Não criar primer novo para Espírita/Agnóstico nesta etapa.
- Não adicionar toggle "ver primers de outras tradições" — pode ser fase 2.

