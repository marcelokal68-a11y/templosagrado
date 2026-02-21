

## Trocar voz do ElevenLabs TTS

Alterar o Voice ID no arquivo `supabase/functions/elevenlabs-tts/index.ts` de `onwK4e9ZLuTAKqWW03F9` (Daniel) para `WgE8iWzGVoJYLb5V7l2d` (voz de narração escolhida pelo usuário).

### Detalhes Tecnicos

**Arquivo:** `supabase/functions/elevenlabs-tts/index.ts` (linha 28)

- De: `const voiceId = 'onwK4e9ZLuTAKqWW03F9'; // Daniel - built-in voice`
- Para: `const voiceId = 'WgE8iWzGVoJYLb5V7l2d';`

A edge function sera reimplantada automaticamente apos a alteracao.

