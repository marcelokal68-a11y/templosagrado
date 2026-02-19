
# Botao de Narracao com ElevenLabs TTS

## Resumo
Adicionar um botao de narracao (icone de alto-falante) em cada mensagem do assistente no chat. Ao clicar, o texto da resposta sera convertido em audio usando a API do ElevenLabs com a voz ID `HOfBIVLhom4mc9WvXfyH`.

## Etapas

### 1. Conectar ElevenLabs ao projeto
- Usar o conector ElevenLabs ja existente no workspace para vincular a API key ao projeto
- O secret `ELEVENLABS_API_KEY` ficara disponivel nas edge functions

### 2. Criar Edge Function `elevenlabs-tts`
- Arquivo: `supabase/functions/elevenlabs-tts/index.ts`
- Recebe `{ text }` no body
- Usa voz fixa `HOfBIVLhom4mc9WvXfyH` e modelo `eleven_multilingual_v2`
- Retorna audio MP3 binario
- CORS configurado
- `verify_jwt = false` no config.toml

### 3. Atualizar `ChatArea.tsx`
- Importar icone `Volume2` e `VolumeX` do lucide-react
- Adicionar estado `playingIndex` para rastrear qual mensagem esta sendo narrada
- Criar funcao `playNarration(text, index)` que:
  - Chama a edge function via fetch
  - Converte resposta em blob de audio
  - Reproduz com `new Audio()`
  - Controla estado de play/stop
- Adicionar botao de narrar abaixo de cada mensagem do assistente (apenas quando nao esta em loading/streaming)

### 4. Traducoes em `i18n.ts`
- Adicionar chaves `chat.narrate` e `chat.narrate_stop` nos 3 idiomas

## Detalhes Tecnicos

- **Voice ID**: `HOfBIVLhom4mc9WvXfyH`
- **Modelo**: `eleven_multilingual_v2` (suporte multilingual para PT-BR, EN, ES)
- **Formato**: `mp3_44100_128`
- **Playback**: Usar `fetch()` direto (nao `supabase.functions.invoke()`) para preservar dados binarios
- **UX**: Icone muda entre Volume2 (narrar) e VolumeX (parar) com animacao de loading enquanto carrega o audio
