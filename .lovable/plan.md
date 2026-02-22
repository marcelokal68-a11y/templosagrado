

## Trocar modelo do Sacred Chat para reduzir custos

### Mudanca

Uma unica alteracao no arquivo `supabase/functions/sacred-chat/index.ts`, linha 241:

**De:** `model: "openai/gpt-5-mini"`
**Para:** `model: "google/gemini-2.5-flash"`

### Justificativa

- O Gemini 2.5 Flash oferece boa qualidade em raciocinio e multimodal, com custo e latencia significativamente menores que o GPT-5 Mini
- O sacred-chat e a funcao mais chamada do app (cada mensagem do usuario gera uma chamada), entao a economia se multiplica
- A qualidade das respostas espirituais/empaticas sera mantida, pois o prompt do sistema e bastante detalhado e direciona bem o comportamento do modelo
- Streaming continua funcionando normalmente com o Gemini Flash

### Impacto estimado

Para um usuario que faz 3 mensagens/dia (90/mes), a troca pode reduzir o custo do chat em ate 60-70%, pois o Flash e otimizado para alto volume com boa qualidade.

