

## Secao "Usando na Pratica" no Versiculo do Dia

Adicionar uma nova secao abaixo do versiculo com um paragrafo gerado pela IA sobre como aplicar o ensinamento no dia a dia, alem de botoes de feedback e copiar.

---

### 1. Edge Function (verse-of-day/index.ts)

Adicionar um novo campo `practical_use` ao JSON retornado pela IA. O prompt sera expandido para instruir a LLM a gerar um paragrafo inspirador sobre como usar o versiculo na pratica, revezando entre temas como saude, alma, trabalho, amigos, familia e comunidade.

**Mudanca no prompt (todas as religioes e idiomas):**
- Adicionar ao system prompt de cada religiao uma instrucao extra:
  ```
  Inclua tambem um campo "practical_use" com um paragrafo inspirador (4-6 linhas) sobre como aplicar este ensinamento na vida pratica do usuario hoje. 
  Reveze entre temas como: cuidar da saude fisica e mental, fortalecer a alma, excelencia no trabalho, cultivar amizades, nutrir a familia, servir a comunidade. 
  Escreva de forma inedita, poetica e motivadora, como um grande sacerdote falando diretamente ao coracao do leitor. 
  O leitor deve terminar de ler e sentir vontade de agir imediatamente.
  ```
- Adicionar `"practical_use": "paragrafo pratico"` ao formato JSON esperado

### 2. Frontend (src/pages/Verse.tsx)

**Novo campo na interface:**
- Adicionar `practical_use?: string` ao tipo `VerseContent`

**Nova secao visual** (abaixo da reflexao, antes das fontes):
- Card com icone de foguete/alvo (Target ou Flame do Lucide)
- Titulo "Usando na Pratica" com estilo dourado
- Paragrafo do `practical_use` com estilo destacado
- Dois botoes no rodape da secao:
  - **Copiar** (icone Copy): copia o texto do `practical_use` para a area de transferencia com toast de confirmacao
  - **Feedback** (icone ThumbsUp/ThumbsDown): dois icones lado a lado que ao clicar mudam de cor (dourado) indicando que o usuario gostou ou nao. Feedback visual apenas (sem persistencia por enquanto)

### 3. Traducoes (src/lib/i18n.ts)

Novas chaves em pt-BR, en e es:
- `verse.practical_title`: "Usando na Pratica" / "Putting into Practice" / "Poniendo en Practica"
- `verse.copied`: "Copiado!" / "Copied!" / "Copiado!"
- `verse.feedback_thanks`: "Obrigado pelo feedback!" / "Thanks for your feedback!" / "Gracias por tu feedback!"

### Detalhes Tecnicos

**Arquivos modificados:**

| Arquivo | Mudancas |
|---------|----------|
| `supabase/functions/verse-of-day/index.ts` | Adicionar instrucao de `practical_use` em todos os prompts (pt-BR, en, es) e no formato JSON esperado |
| `src/pages/Verse.tsx` | Novo campo no tipo, nova secao visual com card glass, botao copiar (navigator.clipboard) e icones de feedback com estado local |
| `src/lib/i18n.ts` | 3 novas chaves de traducao nos 3 idiomas |

**Nenhuma dependencia nova** -- usa Lucide icons ja instalados (Copy, ThumbsUp, ThumbsDown, Target) e navigator.clipboard API nativa.

**Nenhuma mudanca no banco de dados.**

