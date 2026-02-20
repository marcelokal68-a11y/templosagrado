
# Persistencia de Login + Memoria Prolongada + Entrada por Voz + Deteccao de Idioma

## 1. Persistencia de Login (nunca deslogar automaticamente)

A autenticacao ja usa `persistSession: true` e `autoRefreshToken: true` no cliente. O Supabase ja persiste a sessao no localStorage. Nao ha nenhum codigo que faca logout automatico. O unico ponto de logout e o botao "Sair" no Header -- isso ja funciona corretamente.

**Nenhuma mudanca necessaria.** A sessao ja persiste entre recarregamentos e fechamento de aba. O usuario so perde a sessao ao clicar "Sair".

---

## 2. Memoria Prolongada do Usuario

Atualmente, o chat envia todas as mensagens da sessao atual como contexto para a IA, mas nao carrega conversas anteriores como "memoria". Para que o sacerdote lembre de interacoes passadas:

### 2a. Carregar ultimas mensagens do banco ao iniciar o chat

**Arquivo:** `src/components/ChatArea.tsx`

- No useEffect que carrega mensagens do banco (linha ~103), ja carrega as mensagens existentes. Isso ja funciona.
- Garantir que ao enviar para a IA, as ultimas N mensagens salvas sejam incluidas como contexto.

### 2b. Enviar historico resumido para a IA

**Arquivo:** `supabase/functions/sacred-chat/index.ts`

- Adicionar ao system prompt uma instrucao para a IA tratar as mensagens recebidas como um historico continuo e lembrar do que o usuario ja perguntou.
- Adicionar instrucao: "You have memory of previous conversations with this faithful. Reference past topics naturally when relevant. Never repeat the same answer -- always offer fresh perspectives."

### 2c. Limitar contexto enviado

**Arquivo:** `src/components/ChatArea.tsx`

- Ao enviar mensagens para a IA, incluir ate as ultimas 40 mensagens (20 pares user/assistant) para manter contexto sem estourar o limite de tokens.

---

## 3. Entrada por Voz (Speech-to-Text) com ElevenLabs

O conector ElevenLabs ja esta configurado com a secret `ELEVENLABS_API_KEY`.

### 3a. Nova Edge Function para STT

**Arquivo:** `supabase/functions/elevenlabs-stt/index.ts`

- Criar edge function que recebe audio via FormData
- Chama a API `https://api.elevenlabs.io/v1/speech-to-text` com model `scribe_v2`
- Passa `language_code` baseado no idioma selecionado (por/eng/spa)
- Retorna o texto transcrito

### 3b. Botao de microfone no ChatArea

**Arquivo:** `src/components/ChatArea.tsx`

- Adicionar botao de microfone (icone `Mic`) ao lado do botao de enviar
- Ao clicar, usa `navigator.mediaDevices.getUserMedia({ audio: true })` com MediaRecorder
- Grava ate o usuario clicar novamente (toggle) ou ate 60 segundos
- Envia o audio para a edge function `elevenlabs-stt`
- O texto transcrito e inserido no campo de input

### 3c. Configuracao

**Arquivo:** `supabase/config.toml`

- Adicionar `[functions.elevenlabs-stt]` com `verify_jwt = false`

---

## 4. Deteccao Automatica de Idioma e Troca de Output

### 4a. Deteccao no sacred-chat

**Arquivo:** `supabase/functions/sacred-chat/index.ts`

- Adicionar instrucao ao system prompt: "IMPORTANT: If the user writes or speaks in a language different from the configured language ({responseLang}), immediately detect their language and respond in THAT language instead. Always match the language the user is actually using."

### 4b. Deteccao no cliente (opcional, para mudar a UI)

**Arquivo:** `src/components/ChatArea.tsx`

- Apos receber a resposta da IA, nao mudar o idioma da UI automaticamente (isso seria confuso). A IA simplesmente responde no idioma que o usuario usou.

---

## Resumo das Mudancas

| Arquivo | Mudanca |
|---------|---------|
| `src/components/ChatArea.tsx` | Botao de microfone, limitar contexto a 40 msgs |
| `supabase/functions/sacred-chat/index.ts` | Instrucoes de memoria e deteccao de idioma no prompt |
| `supabase/functions/elevenlabs-stt/index.ts` | Nova edge function para speech-to-text |
| `supabase/config.toml` | Registro da nova function |

## Detalhes Tecnicos

### Edge Function STT

```text
- Recebe: FormData com campo "audio" (Blob) e campo "language" (string)
- Mapeamento de idioma: pt-BR -> por, en -> eng, es -> spa
- Chama ElevenLabs API /v1/speech-to-text com model_id "scribe_v2"
- Retorna JSON { text: string }
```

### Botao Microfone no ChatArea

```text
- Estado: isRecording (boolean)
- Icone: Mic (parado) / MicOff com animacao pulsante (gravando)
- MediaRecorder com mimeType "audio/webm" (ou fallback)
- Ao parar, cria Blob, envia via FormData para elevenlabs-stt
- Texto retornado e adicionado ao chatInput
- Cor vermelha pulsante durante gravacao
```

### Prompt de Memoria

```text
Adicionar ao systemPrompt:
"You have continuous memory of this conversation. The messages include previous interactions. 
Reference past topics naturally when relevant — for example, 'As you mentioned earlier about...' 
or 'Building on our previous discussion about...'. 
NEVER repeat the same answer verbatim. Always offer fresh, unique perspectives."
```

### Prompt de Deteccao de Idioma

```text
Adicionar ao systemPrompt:
"LANGUAGE DETECTION: If the user writes in a language different from ${responseLang}, 
immediately detect their language and respond in THAT language instead. 
Always match the language the user is actually using, regardless of the configured setting."
```
