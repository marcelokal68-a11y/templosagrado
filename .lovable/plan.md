

## Problemas

### 1. Versículo do dia desatualizado (Parashá errada no Judaísmo)

**Causa raiz**: `verse-of-day/index.ts` linha 431 usa `new Date().toISOString().slice(0, 10)` — isso retorna a data em **UTC**. No Brasil (UTC-3), até às 21h da noite a data UTC ainda é "ontem". Por isso a parashá aparece atrasada em 1 dia.

Além disso, mesmo com a data correta, depender da IA para "saber" qual é a Parashá da semana atual é frágil — modelos de IA não têm conhecimento confiável do calendário judaico. A fonte autoritativa é o calendário Hebcal.

**Solução**:
- **(a)** Calcular a data no fuso do usuário. O frontend (`Verse.tsx`) já tem acesso ao timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`). Passar `userDate` (YYYY-MM-DD local) e `timezone` para a edge function.
- **(b)** Para `jewish`, buscar a Parashá real da semana via API pública gratuita do Hebcal (`https://www.hebcal.com/shabbat?cfg=json&geonameid=3448439&...` ou `/leyning`) e injetar o nome correto + referência no prompt. Assim a IA explica a parashá real, sem inventar.
- **(c)** Cache: incluir `cache_date` calculada no fuso do usuário (já é por dia; só precisa estar correto).

### 2. Respostas do chat muito superficiais

**Causa raiz**: `sacred-chat/index.ts` linhas 400-408 forçam:
- "MÁXIMO de 3 a 4 frases"
- "NUNCA escreva parágrafos longos"  
- "Seja cirúrgico"
- "NÃO use listas"
- "1 citação por resposta"

Isso resulta em respostas curtas e superficiais.

**Solução**: Reescrever as regras de tom para permitir respostas com **profundidade emocional e exemplos do dia a dia**, mantendo a estrutura conversacional (validação emocional + pergunta no final). Novo padrão:

- **6 a 10 frases** (≈ dobro do tamanho atual), organizadas em **2-3 parágrafos curtos**.
- **Estrutura sugerida**:
  1. Validação emocional curta (1-2 frases)
  2. Reflexão central com **um exemplo concreto do dia a dia** (ex: "Imagine quando você está preso no trânsito e sente aquela raiva subir...", "Sabe quando seu filho te decepciona e você não sabe se abraça ou repreende?")
  3. Sabedoria sagrada integrada (1 citação orgânica) + aplicação prática
  4. Pergunta final que mexe com a alma
- Manter: linguagem brasileira natural, validação emocional primeiro, citação orgânica (sem referências técnicas), sem listas/bullets, [SUGGESTIONS] no final.
- Acrescentar: "Use um exemplo concreto e cotidiano que o leitor reconheça da própria vida (família, trabalho, trânsito, redes sociais, relacionamentos, saúde, finanças). O exemplo deve ser específico, não genérico."

## Arquivos alterados

1. **`supabase/functions/verse-of-day/index.ts`**:
   - Aceitar `userDate` e `timezone` no body; usar `userDate` como `date` e como `cache_date`.
   - Para `religion === 'jewish'`, buscar Parashá real via Hebcal API antes de chamar a IA, e injetar `parashaName` + `torahReference` no prompt do sistema (substituindo "Retorne a Parashá da semana CORRETA" por "A Parashá desta semana é X — explique-a").
   - Fallback gracioso se Hebcal falhar.

2. **`src/pages/Verse.tsx`**:
   - Calcular `userDate` (YYYY-MM-DD no fuso local) e `timezone` e enviar no body do invoke.

3. **`supabase/functions/sacred-chat/index.ts`** (linhas 399-410):
   - Substituir bloco "TOM DE VOZ — REGRAS ABSOLUTAS" pelo novo padrão de 6-10 frases com exemplo do dia a dia.

## Detalhes técnicos

- Hebcal endpoint: `https://www.hebcal.com/leyning?cfg=json&start=YYYY-MM-DD&end=YYYY-MM-DD` retorna `items[].name.en` (ex: "Shemini") e `items[].leyning.torah` (ex: "Leviticus 9:1-11:47"). Sem chave de API, gratuito.
- Cache do versículo já é por (`cache_date`, `religion`, `language`) — vai funcionar normalmente com a data corrigida; entradas antigas em UTC permanecem (não causam problema, simplesmente não são mais lidas).
- Streaming do chat continua igual; só o prompt muda.

