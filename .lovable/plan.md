
# Botao Dinamico: Oracao ou Pensamento do Dia + Referencia da Fonte

## Resumo

O botao e os textos mudam dinamicamente conforme a selecao do usuario:
- **Religiao selecionada**: "Gerar Oracao", titulo "Oracao Gerada"
- **Filosofia selecionada**: "Gerar Pensamento do Dia", titulo "Pensamento do Dia"

Ao final do texto gerado, a IA inclui automaticamente uma breve referencia da fonte (ex: "Inspirado na Biblia, Salmo 23" ou "Baseado em Meditacoes de Marco Aurelio").

---

## Mudancas

### 1. `src/lib/i18n.ts` - Novas chaves de traducao

Adicionar chaves alternativas para o modo "pensamento":

| Chave | pt-BR | en | es |
|-------|-------|----|----|
| `prayers.title_thought` | Gerar Pensamento do Dia | Generate Thought of the Day | Generar Pensamiento del Dia |
| `prayers.subtitle_thought` | A IA gera um pensamento filosofico baseado na sua intencao | AI generates a philosophical thought based on your intention | La IA genera un pensamiento filosofico basado en tu intencion |
| `prayers.intention_thought` | Sua intencao para o pensamento | Your thought intention | Tu intencion para el pensamiento |
| `prayers.generate_thought` | Gerar Pensamento | Generate Thought | Generar Pensamiento |
| `prayers.generated_thought` | Pensamento do Dia | Thought of the Day | Pensamiento del Dia |
| `prayers.generating_thought` | Gerando pensamento... | Generating thought... | Generando pensamiento... |
| `prayers.regenerate_thought` | Gerar Novamente | Generate Again | Generar de Nuevo |
| `prayers.success_thought` | Seu pensamento foi gerado com sabedoria | Your thought was generated with wisdom | Tu pensamiento fue generado con sabiduria |

### 2. `src/pages/Prayers.tsx` - Labels dinamicos

Criar uma variavel `isPhilosophy = !!philosophy && !religion` e usar para alternar entre as chaves de traducao:

- Titulo do card: `prayers.title` ou `prayers.title_thought`
- Subtitulo: `prayers.subtitle` ou `prayers.subtitle_thought`
- Placeholder da intencao: `prayers.intention` ou `prayers.intention_thought`
- Botao gerar: `prayers.generate` ou `prayers.generate_thought`
- Texto "gerando": `prayers.generating` ou `prayers.generating_thought`
- Titulo do resultado: `prayers.generated` ou `prayers.generated_thought`
- Botao regenerar: `prayers.regenerate` ou `prayers.regenerate_thought`
- Toast de sucesso: `prayers.success` ou `prayers.success_thought`
- Icone do resultado: `Heart` para religiao, `Lightbulb` (de lucide-react) para filosofia

### 3. `supabase/functions/generate-prayer/index.ts` - Prompt atualizado

Modificar o system prompt para:

- Quando for **filosofia**: pedir "pensamento do dia" em vez de "oracao"
- Adicionar instrucao para incluir ao final uma breve referencia da fonte, no formato:
  - Religiao: "-- Inspirado em [livro/passagem], [tradicao]"
  - Filosofia: "-- Baseado em [obra], de [autor]"

O prompt tera uma linha adicional:
```
At the very end, add a brief source reference on a new line starting with "—" (em dash), 
citing the specific sacred text, book, chapter, or philosophical work that inspired this [prayer/thought].
Example: "— Inspired by Philippians 4:6-7" or "— Based on Meditations, Book V, Marcus Aurelius"
```

---

## Resultado Esperado

- Ao selecionar "Estoicismo" e clicar no botao, ele dira "Gerar Pensamento" e o output sera um "Pensamento do Dia" com referencia ao final
- Ao selecionar "Cristao", o botao dira "Gerar Oracao" e o output sera uma "Oracao Gerada" com referencia biblica ao final
- A referencia aparece naturalmente ao final do texto, separada por um traco longo (—)
