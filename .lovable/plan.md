

# Adicionar Filosofias de Vida ao Sistema

## Resumo

Adicionar uma nova secao **"Filosofias que me inspiram"** abaixo dos topicos de discussao no painel de contexto. Quando selecionada, a filosofia influenciara o chat (o Sacerdote responde como Grao Mestre da filosofia), oracoes, versiculos e praticas diarias. As filosofias funcionam como alternativa/complemento a religiao -- o usuario pode selecionar uma religiao E uma filosofia, ou apenas uma filosofia.

## Filosofias disponíveis

Estoicismo, Logosofia, Humanismo, Epicurismo, Transumanismo, Panteismo, Existencialismo, Objetivismo, Transcendentalismo, Altruismo, Racionalismo, Niilismo Otimista, Absurdismo, Utilitarismo, Pragmatismo

---

## 1. Adicionar `philosophy` ao ChatContext

**Arquivo:** `src/contexts/AppContext.tsx`

- Adicionar campo `philosophy: string` na interface `ChatContext`
- Inicializar com `''`

## 2. Nova secao no ContextPanel

**Arquivo:** `src/components/ContextPanel.tsx`

- Adicionar array `philosophies` com as opcoes listadas
- Adicionar um novo `CollapsibleChipGroup` abaixo dos topicos, com label "Filosofias de Vida" e prefix `philosophy`
- Ao selecionar uma filosofia, salvar em `chatContext.philosophy`
- Incluir `chatContext.philosophy` no calculo de `hasContext`

## 3. Atualizar o chat (sacred-chat) para reconhecer filosofias

**Arquivo:** `supabase/functions/sacred-chat/index.ts`

- Adicionar mapa `PHILOSOPHY_TEXTS` com as fontes de cada filosofia (ex: Estoicismo = "Meditacoes de Marco Aurelio, Cartas de Seneca, Discursos de Epicteto")
- Quando `context.philosophy` estiver presente:
  - Se tambem ha religiao: mesclar a persona ("Sacerdote que incorpora a sabedoria de [filosofia]")
  - Se so filosofia: persona muda para "Grao Mestre da Filosofia de Vida" baseado exclusivamente na filosofia
- Adicionar instrucao de filosofia ao system prompt

## 4. Atualizar praticas diarias (daily-practice)

**Arquivo:** `supabase/functions/daily-practice/index.ts`

- Receber `philosophy` no body
- Quando filosofia presente (sem religiao), gerar conteudo do dia baseado na filosofia (ex: para Estoicismo, uma meditacao de Marco Aurelio)
- Quando ambos presentes, mesclar conteudo

## 5. Atualizar pagina Practice.tsx

**Arquivo:** `src/pages/Practice.tsx`

- Adicionar checklists por filosofia (ex: Estoicismo = "Meditacao matinal", "Journaling estoico", "Praticou a dicotomia do controle", "Leu Marco Aurelio/Seneca/Epicteto", "Praticou virtude", "Reflexao noturna")
- Mostrar seletor de filosofias alem de religioes
- Permitir selecionar religiao OU filosofia (ou ambos)

## 6. Atualizar oracoes (Prayers.tsx)

**Arquivo:** `src/pages/Prayers.tsx`

- Adicionar seletor de filosofias alem de religioes
- Permitir enviar oracao/intencao vinculada a uma filosofia

## 7. Atualizar Index.tsx (handleGenerate)

**Arquivo:** `src/pages/Index.tsx`

- Incluir `chatContext.philosophy` na mensagem auto-gerada

## 8. Traducoes (i18n.ts)

**Arquivo:** `src/lib/i18n.ts`

Adicionar em pt-BR, en, es:
- `panel.philosophy`: "Filosofias de Vida" / "Life Philosophies" / "Filosofias de Vida"
- `philosophy.stoicism`: "Estoicismo" / "Stoicism" / "Estoicismo"
- `philosophy.logosophy`: "Logosofia" / "Logosophy" / "Logosofía"
- `philosophy.humanism`: "Humanismo" / "Humanism" / "Humanismo"
- `philosophy.epicureanism`: "Epicurismo" / "Epicureanism" / "Epicureísmo"
- `philosophy.transhumanism`: "Transumanismo" / "Transhumanism" / "Transhumanismo"
- `philosophy.pantheism`: "Panteismo" / "Pantheism" / "Panteísmo"
- `philosophy.existentialism`: "Existencialismo" / "Existentialism" / "Existencialismo"
- `philosophy.objectivism`: "Objetivismo" / "Objectivism" / "Objetivismo"
- `philosophy.transcendentalism`: "Transcendentalismo" / "Transcendentalism" / "Trascendentalismo"
- `philosophy.altruism`: "Altruismo" / "Altruism" / "Altruismo"
- `philosophy.rationalism`: "Racionalismo" / "Rationalism" / "Racionalismo"
- `philosophy.optimistic_nihilism`: "Niilismo Otimista" / "Optimistic Nihilism" / "Nihilismo Optimista"
- `philosophy.absurdism`: "Absurdismo" / "Absurdism" / "Absurdismo"
- `philosophy.utilitarianism`: "Utilitarismo" / "Utilitarianism" / "Utilitarismo"
- `philosophy.pragmatism`: "Pragmatismo" / "Pragmatism" / "Pragmatismo"
- Itens de checklist por filosofia para practice

---

## Detalhes Tecnicos

### Fontes por filosofia (para o chat e daily-practice)

```text
Estoicismo: Meditacoes de Marco Aurelio, Cartas a Lucilio de Seneca, Discursos de Epicteto, Enquiridion
Logosofia: Obras de Carlos Bernardo Gonzalez Pecotche (Raumsol)
Humanismo: Obras de Erasmo de Roterdao, Pico della Mirandola, Declaracao Universal dos Direitos Humanos
Epicurismo: Carta a Meneceu de Epicuro, De Rerum Natura de Lucrecio
Transumanismo: Obras de Nick Bostrom, Ray Kurzweil, Max More
Panteismo: Etica de Spinoza, obras de Giordano Bruno
Existencialismo: O Ser e o Nada (Sartre), O Mito de Sisifo (Camus), Ser e Tempo (Heidegger), Kierkegaard
Objetivismo: A Revolta de Atlas e A Nascente de Ayn Rand
Transcendentalismo: Walden de Thoreau, Ensaios de Emerson
Altruismo: Altruismo Eficaz de Peter Singer, obras de Auguste Comte
Racionalismo: Meditacoes de Descartes, Etica de Spinoza, Monadologia de Leibniz
```

### Checklists por filosofia (exemplos)

**Estoicismo:**
- Meditacao matinal (premeditatio malorum)
- Praticou a dicotomia do controle
- Journaling estoico
- Leu Marco Aurelio, Seneca ou Epicteto
- Praticou uma virtude (coragem, justica, temperanca, sabedoria)
- Reflexao noturna

**Humanismo:**
- Reflexao sobre dignidade humana
- Ato de empatia ou servico
- Leitura humanista
- Praticou pensamento critico
- Contribuiu para o bem comum
- Gratidao consciente

**Existencialismo:**
- Reflexao sobre autenticidade
- Exercicio de liberdade consciente
- Leitura existencialista
- Confrontou uma ansiedade com coragem
- Praticou presenca no momento
- Reflexao sobre proposito pessoal

(Padrao similar para todas as demais filosofias)

### Arquivos criados
Nenhum

### Arquivos modificados
1. `src/contexts/AppContext.tsx` - Adicionar `philosophy` ao ChatContext
2. `src/components/ContextPanel.tsx` - Nova secao de filosofias
3. `supabase/functions/sacred-chat/index.ts` - Suporte a filosofias no prompt
4. `supabase/functions/daily-practice/index.ts` - Conteudo diario por filosofia
5. `src/pages/Practice.tsx` - Checklists por filosofia
6. `src/pages/Prayers.tsx` - Seletor de filosofia nas oracoes
7. `src/pages/Index.tsx` - Incluir filosofia na mensagem auto-gerada
8. `src/lib/i18n.ts` - Todas as traducoes

### Fluxo

```text
Painel de Contexto:
  Religiao -> Necessidade -> Humor -> Topicos -> [NOVO] Filosofias de Vida
  
Ao selecionar "Estoicismo":
  Chat: "Eu sou o Grao Mestre do Estoicismo. Falo com base em Marco Aurelio, Seneca..."
  Practice: Checklist estoico + conteudo do dia baseado em filosofia estoica
  Prayers: Intencao vinculada ao Estoicismo
  
Ao selecionar "Judaismo" + "Estoicismo":
  Chat: Sacerdote judaico que incorpora sabedoria estoica
  Practice: Checklist judaico + conteudo mesclado
```

