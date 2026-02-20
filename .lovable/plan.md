
# Correcoes e Melhorias na Aba "Praticando a Religiao"

## Problemas Identificados

1. **Traducoes nao aparecem** - Na screenshot, vemos textos como "practice.gender", "practice.item.tefilin" em vez dos textos traduzidos. As traducoes existem no i18n.ts mas nao estao sendo resolvidas corretamente.
2. **Conteudo gerado em ingles** apesar do idioma selecionado ser portugues - o `religionPrompts` esta em portugues fixo mas o prompt de sistema para cada idioma nao esta alinhado.
3. **Conteudo judaico superficial** - precisa incluir interpretacoes do Talmud, Mishna e Guemara.
4. **Falta narracao ElevenLabs** no conteudo sagrado do dia.
5. **Demais religioes precisam de conteudo mais profundo** (fontes primarias, interpretacoes tradicionais).

---

## 1. Corrigir traducoes que nao aparecem

**Arquivo:** `src/lib/i18n.ts`

O problema e que a funcao `t()` retorna a chave quando nao encontra a traducao. Vou verificar se a funcao `t` esta correta e se as chaves batem. Pelo screenshot, parece que o componente esta renderizando as chaves brutas - possivelmente a funcao `t()` nao esta encontrando as chaves. Preciso verificar a implementacao da funcao `t()`.

## 2. Refinar prompts da edge function `daily-practice`

**Arquivo:** `supabase/functions/daily-practice/index.ts`

Mudancas principais:
- Os `religionPrompts` serao escritos no idioma correto de cada bloco (en/es/pt-BR) em vez de fixos em portugues
- Para **Judaismo**: o prompt pedira a Parasha correta da semana com interpretacao do Talmud (Bavli), Mishna e Guemara, citando tratados especificos, sem inventar
- Para **Catolicismo**: pedir leitura liturgica do dia conforme o lecionario, com interpretacao dos Padres da Igreja
- Para **Isla**: pedir Sura com tafsir (interpretacao classica), citando Ibn Kathir ou Al-Tabari
- Para **Budismo**: pedir sutra com comentario de mestres tradicionais
- Para **Hinduismo**: pedir verso do Gita com comentario de Shankaracharya ou Ramanuja
- Para **Espiritismo**: pedir capitulo especifico do Evangelho Segundo o Espiritismo com comentario de Kardec
- Para **Umbanda/Candomble**: pedir ensinamento com referencia a tradicao oral dos terreiros
- Para **Protestantismo**: pedir devocional com exegese biblica
- Para **Mormon**: pedir passagem com comentario da Doutrina e Convenios
- Para **Agnostico**: pedir reflexao filosofica com citacao de filosofo real

O formato JSON sera expandido para incluir um campo `sources` (fontes consultadas) e `scholarly_note` (nota academica/teologica).

## 3. Adicionar narracao ElevenLabs ao conteudo do dia

**Arquivo:** `src/pages/Practice.tsx`

- Adicionar botao "Ouvir" ao lado do titulo do conteudo sagrado
- Ao clicar, concatenar titulo + explicacao + reflexao e enviar ao `elevenlabs-tts`
- Usar velocidade 1.15x (padrao acelerado conforme solicitado)
- Reutilizar o mesmo padrao de audio do ChatArea (fetch direto com blob)
- Adicionar icone de Volume2/VolumeX para controlar play/stop
- Adicionar traducoes para `practice.listen` e `practice.stop`

## 4. Corrigir renderizacao das labels i18n

**Arquivo:** `src/lib/i18n.ts`

Verificar e garantir que a funcao `t()` retorna fallback correto. Possivelmente as chaves do `en` e `es` para practice items nao estao sendo encontradas. Vou verificar a funcao `t()`.

---

## Detalhes Tecnicos

### Prompt refinado para Judaismo (exemplo pt-BR)

```text
Judaismo. Voce e um Sumo Sacerdote e rabino erudito.
Retorne a Parasha da semana CORRETA para a data [date] conforme o calendario judaico.
Inclua: nome hebraico da parasha, referencia na Tora (livro, capitulo e versiculos),
interpretacao do Talmud Bavli (cite o tratado especifico),
referencia relevante da Mishna e Guemara.
NAO INVENTE citacoes. Se nao tiver certeza do tratado especifico, mencione apenas o tema geral.
[Se feminino: considere perspectiva feminina na halacha]
```

### Arquivos modificados

1. `supabase/functions/daily-practice/index.ts` - Prompts refinados por religiao e idioma, formato JSON expandido
2. `src/pages/Practice.tsx` - Botao de narracao ElevenLabs, correcao de renderizacao
3. `src/lib/i18n.ts` - Verificar/corrigir funcao t() e adicionar traducoes de "Ouvir"/"Parar"

### Fluxo da narracao

```text
Usuario clica "Ouvir" no conteudo sagrado
-> Concatena: titulo + ". " + explicacao + ". " + reflexao
-> Envia ao elevenlabs-tts com speed: 1.15
-> Reproduz audio via Audio API
-> Botao muda para "Parar" durante reproducao
```
