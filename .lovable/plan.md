

## Contexto de Localizacao e Data/Hora no Chat + Deteccao de Religiao

### Problema

1. **Sem data/hora**: O system prompt da IA nao recebe a data/hora atual nem o fuso horario do usuario. A IA pode "alucinar" sobre o momento do dia ou data.
2. **Sem localizacao**: O app nao sabe onde o usuario esta. Respostas nao podem referenciar contexto local (feriados religiosos locais, horarios de oracao, etc).
3. **Religiao ignorada na mensagem**: Quando o usuario escreve "sou judeu" mas nao selecionou religiao no painel de contexto, o sistema usa o fallback "christian" (linha 134 do edge function: `const rel = religion || "christian"`), resultando em citacoes da Biblia crista ao inves da Torah/Talmud.

### Solucao

#### 1. Capturar data/hora e localizacao no frontend

**Arquivo**: `src/components/ChatArea.tsx`

- Ao montar o componente, capturar:
  - `new Date().toISOString()` para data/hora atual
  - `Intl.DateTimeFormat().resolvedOptions().timeZone` para fuso horario
  - `navigator.geolocation.getCurrentPosition()` para latitude/longitude (com fallback gracioso se negado)
- Usar API de geocodificacao reversa (ou simplesmente enviar timezone que ja contem a regiao) para determinar cidade/pais
- Armazenar em estado local e enviar junto ao body da requisicao para o edge function

**Dados enviados ao edge function**:
```text
{
  ...campos existentes,
  datetime: "2026-02-21T14:30:00-03:00",
  timezone: "America/Sao_Paulo",
  location: { city: "Sao Paulo", country: "Brazil" }  // opcional, via timezone
}
```

#### 2. Adicionar contexto temporal e geografico ao system prompt

**Arquivo**: `supabase/functions/sacred-chat/index.ts`

- Receber os novos campos `datetime`, `timezone`, `location` do body
- Construir uma secao `TEMPORAL & GEOGRAPHIC CONTEXT` no system prompt:

```text
TEMPORAL & GEOGRAPHIC CONTEXT:
Current date and time for the faithful: Saturday, February 21, 2026, 2:30 PM (America/Sao_Paulo timezone, Brazil).
Use this information to:
- Reference the correct time of day (morning/afternoon/evening/night)
- Be aware of religious holidays and observances happening today or this week
- Never hallucinate about the date or time — use ONLY the provided information
- Adapt greetings and blessings to the time of day
```

- Mapear o timezone para cidade/pais usando um mapa simples de timezones comuns (ex: "America/Sao_Paulo" -> "Brazil", "America/New_York" -> "United States")

#### 3. Corrigir fallback de religiao quando usuario declara na mensagem

**Arquivo**: `supabase/functions/sacred-chat/index.ts`

- Quando `context.religion` esta vazio, NAO usar fallback "christian"
- Em vez disso, adicionar instrucao no system prompt para a IA detectar a religiao a partir da mensagem do usuario:

```text
RELIGION DETECTION:
No specific religion was selected by the user in the settings. If the user mentions their religion
in the message (e.g., "sou judeu", "I'm Buddhist", "soy musulman"), detect it and respond
EXCLUSIVELY from that tradition's sacred texts. Do NOT default to Christianity.
If no religion can be detected, respond with universal spiritual wisdom without favoring any tradition.
```

- Mudar a linha 134 de `const rel = religion || "christian"` para `const rel = religion || ""`
- Quando `rel` esta vazio, usar um prompt generico multi-tradicao em vez de forcar "christian"

### Resumo de alteracoes

| Arquivo | Mudanca |
|---------|---------|
| `src/components/ChatArea.tsx` | Capturar datetime, timezone; enviar no body da requisicao ao edge function |
| `supabase/functions/sacred-chat/index.ts` | Receber datetime/timezone; adicionar secao de contexto temporal ao prompt; remover fallback "christian"; adicionar instrucao de deteccao de religiao por mensagem |

### Detalhes tecnicos

**Captura de timezone (frontend)**:
- `Intl.DateTimeFormat().resolvedOptions().timeZone` — funciona em todos os browsers modernos, nao precisa de permissao
- A data/hora formatada sera gerada no momento do envio da mensagem (nao no mount)

**Geolocalizacao (frontend)**:
- Usar `navigator.geolocation.getCurrentPosition()` com timeout de 5s
- Se o usuario negar permissao, usar apenas o timezone para inferir regiao aproximada
- Armazenar em ref para nao pedir permissao repetidamente

**Mapa de timezone para regiao (edge function)**:
- Mapa simples hardcoded com os timezones mais comuns (America/Sao_Paulo -> Brasil, Europe/London -> UK, etc.)
- Fallback: extrair continente/cidade do proprio nome do timezone

**Fallback de religiao (edge function)**:
- Quando nenhuma religiao selecionada E nenhuma detectada na mensagem, o prompt sera: "You are a wise spiritual guide drawing from universal wisdom across all traditions. Do not favor any single religion."
