

## Plano: Acelerar geração de áudio (TTS)

### Diagnóstico

A função `elevenlabs-tts` usa o modelo `eleven_multilingual_v2`, que é o mais lento da ElevenLabs (latência típica 2-5s para textos médios). Para o caso do Versículo do Dia, onde o texto pode ter 200-400 palavras, isso vira facilmente 5-10s de espera antes do áudio começar a tocar.

Além disso, hoje o frontend espera o áudio inteiro chegar (`response.blob()`) antes de tocar — não há streaming.

### Sobre Gemini TTS

Pesquisei: **Gemini 3.1 Flash TTS não está disponível no Lovable AI Gateway**. Os modelos disponíveis no gateway são apenas chat e geração/edição de imagem (Gemini 2.5/3.x Flash, Pro, Image). Não há endpoint TTS exposto. Portanto, manter ElevenLabs e otimizar é o caminho viável agora.

### Otimizações propostas (3 mudanças combinadas)

**1. Trocar modelo para `eleven_flash_v2_5`** (principal ganho)
- Latência ~75% menor que o `multilingual_v2` (de ~3s para ~400ms até o primeiro byte)
- Suporta 32 idiomas incluindo PT-BR
- Qualidade ligeiramente inferior em entonação, mas excelente para narração devocional

**2. Ativar streaming HTTP no endpoint da ElevenLabs**
- Mudar de `/v1/text-to-speech/{id}` para `/v1/text-to-speech/{id}/stream`
- Devolver o stream direto pro cliente (sem `arrayBuffer()`)
- Cliente passa a tocar via `MediaSource` ou `audio.src = streamUrl` para começar a reprodução enquanto o áudio ainda chega

**3. Reduzir bitrate de saída**
- De `mp3_44100_128` para `mp3_44100_64` — corta o tamanho do payload pela metade, sem perda audível para voz falada

### Mudanças nos arquivos

**`supabase/functions/elevenlabs-tts/index.ts`**
- Trocar `model_id` para `eleven_flash_v2_5`
- Trocar URL para o endpoint `/stream`
- Trocar `output_format` para `mp3_44100_64`
- Devolver `response.body` direto (stream), não `arrayBuffer()`
- Adicionar header `Cache-Control: public, max-age=3600` para o navegador cachear áudios repetidos

**`src/pages/Verse.tsx`** (e qualquer outro componente que consome TTS)
- Trocar o padrão `blob() → URL.createObjectURL` por reprodução direta do stream:
  - Criar `Audio()` apontando pra Response.url ou usar `MediaSource` com chunks
  - Tocar assim que o primeiro chunk chega (`audio.play()` no `loadeddata`)
- Manter fallback pra blob se o stream falhar

### Resultado esperado

- Tempo até começar a tocar: de **~5-8s** para **~600ms-1.2s**
- Tamanho do download: ~50% menor
- Sem mudança de UX visível além da velocidade

### Detalhes técnicos

- ElevenLabs `flash_v2_5`: latência ~400ms, suporta `voice_settings` igual ao multilingual
- Voice ID atual (`HOfBIVLhom4mc9WvXfyH`) é compatível com qualquer modelo da ElevenLabs
- Streaming via `Response(response.body, {headers: ...})` funciona em Edge Functions Deno sem buffering
- No frontend, `new Audio(url)` com `url` apontando pra response streaming já toca progressivamente — basta não esperar `blob()`
- Não precisa migration nem mudança no DB

