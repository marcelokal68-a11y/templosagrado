

## Diagnóstico

Dois problemas relacionados, ambos confirmados ao ler o código:

### 1. Texto do Versículo do Dia gera incompleto (raiz do bug do áudio)

Em `supabase/functions/verse-of-day/index.ts` (linhas 548-561), a chamada à IA **não define `max_tokens`**. O prompt pede 5-8 linhas de explicação + Patrística/Talmud/Tafsir + reflexão + fontes + nota acadêmica + parágrafo `practical_use` (4-6 linhas). Para tradições eruditas (Judaísmo, Católico com Patrística, Islã com tafsir), isso ultrapassa fácil 1500-2000 tokens. Sem `max_tokens` explícito, o gateway aplica um default baixo, **a resposta é cortada no meio do JSON**, o `JSON.parse` falha e cai no fallback que joga o texto cru no campo `explanation` (sem `practical_use`, sem `reference`, etc.), ou o JSON parcial perde campos.

Pior: **o JSON truncado é cacheado** no `daily_verse_cache` (linha 588), então o texto incompleto fica gravado o dia inteiro para todos os usuários daquela tradição/idioma. Isso explica por que parece "travar" em alguns dispositivos — quem caiu no cache truncado vê texto curto e o áudio depende desse texto curto/quebrado (e em alguns casos `content.explanation` vira o JSON cru não-parseado, causando narração estranha ou falha).

Não há checagem de `finish_reason` para detectar a truncagem.

### 2. PWA/tela pequena: layout do cabeçalho do card "trava"

Em `src/pages/Verse.tsx` linhas 178-194, o `CardHeader` coloca título + 3 botões (Ouvir, Atualizar, Publicar no Mural) na **mesma linha** com `flex items-center justify-between`. Em viewport 402px (PWA mobile), o título `Sparkles + nome da parashá/leitura` empurra os botões e eles quebram de forma ruim, podendo ficar cortados/sobrepostos. Não é o áudio que trava — é o layout que esmaga os controles.

---

## Correção

### A. Backend — `supabase/functions/verse-of-day/index.ts`

1. **Adicionar `max_tokens: 2000`** na chamada do gateway (suficiente para JSON completo das tradições mais densas).
2. **Detectar truncagem**: ler `finish_reason` da resposta. Se for `length`, logar warning e **NÃO cachear** (assim o próximo request gera de novo em vez de servir resposta quebrada para todos).
3. **Validar JSON parseado antes de cachear**: só cachear se `parsed.title` E `parsed.explanation` existirem como strings não vazias. Se o parse caiu no fallback (texto cru), pular o cache.
4. **Fallback de modelo**: se a primeira tentativa truncar (`finish_reason === 'length'`), repetir uma vez com `google/gemini-2.5-pro` (mais robusto para JSON longo) antes de devolver.

### B. Limpeza imediata do cache poluído

Migration SQL para deletar entradas de hoje que foram salvas truncadas (sem `practical_use` ou com `explanation` excessivamente longa contendo `{`):
```sql
DELETE FROM daily_verse_cache 
WHERE cache_date = CURRENT_DATE 
  AND (verse_data->>'practical_use' IS NULL 
       OR verse_data->>'practical_use' = ''
       OR verse_data->>'explanation' LIKE '%{%"title"%');
```

### C. Frontend — `src/pages/Verse.tsx`

5. **Arrumar layout do header do card no mobile** (linhas 178-198): empilhar título numa linha e botões numa segunda linha em telas pequenas. Trocar o `flex items-center justify-between` por uma estrutura `flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`, e fazer a barra de botões `flex-wrap` para nunca cortar.
6. **Esconder texto dos botões em telas muito estreitas** (já é assim para Refresh; aplicar a Listen também — manter só ícone < 360px).
7. **Validação extra no cliente**: antes de chamar `playTTS`, verificar se `content.explanation` tem ≥ 30 caracteres e não começa com `{` (heurística anti-JSON-cru). Se falhar, mostrar toast "Conteúdo incompleto, recarregando…" e chamar `fetchVerse()` automaticamente uma vez.

### Arquivos a editar

- `supabase/functions/verse-of-day/index.ts` — adicionar `max_tokens`, checar `finish_reason`, validar antes de cachear, retry em Pro.
- `src/pages/Verse.tsx` — header responsivo + guard anti-conteúdo-quebrado antes da narração.
- Nova migração SQL — limpar cache poluído de hoje.

### Fora de escopo

- Não vou mexer em `elevenlabs-tts` nem em `ttsPlayer.ts` — eles funcionam; o problema é o texto que chega neles.
- Não vou aumentar `max_tokens` de outras funções (chat, prayers) neste passo — só `verse-of-day`, que é o caso reportado. Posso fazer auditoria similar nas outras numa próxima rodada se quiser.

