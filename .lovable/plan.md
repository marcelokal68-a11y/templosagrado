

# Nova Aba: Praticando a Religiao

## Resumo

Criar uma nova pagina/aba chamada **"Praticando"** que funciona como um checklist diario personalizado por religiao. Ao selecionar a afiliacao religiosa, o usuario ve uma lista de praticas diarias recomendadas com checkboxes, alem de conteudo educativo como a parasha do dia (Judaismo), leitura do Evangelho (Catolicismo), etc. Todas as praticas sao positivas e voltadas ao bem.

---

## 1. Nova rota e navegacao

- Criar pagina `src/pages/Practice.tsx`
- Adicionar rota `/practice` no `App.tsx`
- Adicionar aba "Praticando" no `BottomNav.tsx` (icone: `CheckSquare`) e no `Header.tsx`
- Adicionar traducoes no `i18n.ts`

## 2. Estrutura da pagina Practice.tsx

A pagina tera:
1. **Seletor de religiao** (chips, como no ContextPanel) - usa `chatContext.religion` como padrao
2. **Pergunta de genero** (opcional, so aparece para religioes onde faz diferenca, ex: Judaismo com tefilin)
3. **Checklist diario** - lista de praticas com checkbox, gerada conforme religiao e genero
4. **Conteudo do dia** - texto educativo gerado por IA (ex: parasha da semana, evangelho do dia, sura do dia)

## 3. Checklists por religiao

Todas as praticas serao sempre positivas, voltadas ao bem, nunca incentivando atos que prejudiquem pessoas ou animais.

**Judaismo (masculino):**
- Colocou o Tefilin
- Fez a reza da manha (Shacharit)
- Leu a parasha do dia
- Fez uma boa acao (Mitzvah)
- Recitou o Shema
- Estudou Tora

**Judaismo (feminino):**
- Acendeu velas do Shabat (quando aplicavel)
- Fez a reza da manha
- Leu a parasha do dia
- Fez uma boa acao (Mitzvah)
- Recitou o Shema
- Estudou Tora

**Catolicismo:**
- Fez a oracao da manha
- Leu o Evangelho do dia
- Rezou o Terco/Rosario
- Praticou um ato de caridade
- Exame de consciencia
- Agradeceu a Deus

**Protestantismo:**
- Devocional matinal
- Leitura biblica do dia
- Oracao pessoal
- Praticou bondade com alguem
- Reflexao sobre a Palavra
- Agradeceu a Deus

**Isla:**
- Fez a oracao do Fajr (amanhecer)
- Fez a oracao do Dhuhr (meio-dia)
- Fez a oracao do Asr (tarde)
- Fez a oracao do Maghrib (por do sol)
- Fez a oracao do Isha (noite)
- Leu uma passagem do Alcorao
- Praticou um ato de caridade (Sadaqah)

**Budismo:**
- Meditacao matinal
- Praticou atenção plena (mindfulness)
- Leu um ensinamento do Dharma
- Praticou compaixao com um ser vivo
- Reflexao sobre as Quatro Nobres Verdades
- Evitou causar sofrimento

**Hinduismo:**
- Puja (oracao matinal)
- Leu um verso do Bhagavad Gita
- Praticou Yoga ou meditacao
- Praticou um ato de Seva (servico)
- Recitou um mantra
- Reflexao sobre o Dharma

**Espiritismo:**
- Prece matinal
- Leitura do Evangelho Segundo o Espiritismo
- Praticou caridade
- Passou vibracao positiva a alguem
- Estudou uma obra de Kardec
- Reflexao sobre a reforma intima

**Umbanda:**
- Prece ao Pai Oxala
- Banho de ervas ou defumacao (se aplicavel)
- Praticou caridade
- Meditacao ou concentracao espiritual
- Agradeceu aos guias espirituais
- Ajudou alguem necessitado

**Candomble:**
- Saudacao aos Orixas
- Oferenda ou agradecimento
- Praticou respeito a natureza
- Meditacao ou concentracao
- Ajudou a comunidade
- Estudou a tradicao oral

**Mormon:**
- Oracao matinal
- Leitura do Livro de Mormon
- Servico ao proximo
- Estudo das escrituras
- Reflexao sobre revelacao pessoal
- Agradeceu a Deus

**Agnostico:**
- Reflexao matinal
- Leitura de filosofia ou sabedoria universal
- Praticou um ato de bondade
- Meditacao ou momento de silencio
- Gratidao consciente
- Contribuiu para o bem comum

## 4. Conteudo do dia (gerado por IA)

Criar uma **edge function** `daily-practice` que, recebendo a religiao e a data, retorna:
- O conteudo sagrado do dia (ex: parasha, evangelho, sura) com titulo correto
- Uma breve explicacao/interpretacao (3-5 linhas)
- Uma reflexao pratica

A funcao usara o gateway Lovable AI (`openai/gpt-5-mini`) com um prompt especifico para retornar o conteudo correto de cada dia.

## 5. Persistencia do checklist

- Salvar progresso do checklist no `localStorage` (chave por dia + religiao)
- Nao precisa de tabela no banco por enquanto (feature leve e pessoal)
- Ao mudar de dia, o checklist reseta automaticamente

## 6. Traducoes (i18n.ts)

Adicionar em pt-BR, en, es:
- `nav.practice`: "Praticando" / "Practicing" / "Practicando"
- `practice.title`: "Praticando a Religiao" / "Practicing Religion" / "Practicando la Religion"
- `practice.subtitle`: "Checklist diario da sua jornada espiritual"
- `practice.gender`: "Genero" (para religioes que precisam)
- `practice.male` / `practice.female`
- `practice.daily_content`: "Conteudo Sagrado do Dia"
- `practice.loading`: "Carregando conteudo do dia..."
- Nomes de cada item do checklist por religiao

## Detalhes Tecnicos

### Arquivos criados
1. `src/pages/Practice.tsx` - Pagina principal com seletor de religiao, checklist e conteudo do dia
2. `supabase/functions/daily-practice/index.ts` - Edge function que gera o conteudo sagrado do dia

### Arquivos modificados
1. `src/App.tsx` - Adicionar rota `/practice`
2. `src/components/BottomNav.tsx` - Adicionar aba "Praticando"
3. `src/components/Header.tsx` - Adicionar link na nav desktop
4. `src/lib/i18n.ts` - Adicionar todas as traducoes

### Fluxo do usuario

```text
Aba "Praticando" -> Seleciona religiao -> (Se Judaismo: seleciona genero)
-> Ve checklist diario personalizado -> Marca itens conforme pratica
-> Abaixo do checklist: "Conteudo Sagrado do Dia"
-> Ex: "Parasha da Semana: Bereshit (Genesis 1:1-6:8)"
-> Explicacao e interpretacao em 3-5 linhas
-> Progresso salvo localmente por dia
```

### Edge function daily-practice

Recebe: `{ religion, date, language, gender? }`

Prompt para a IA:
- "Voce e um especialista em [religiao]. Retorne o conteudo sagrado correto para o dia [data]. Para Judaismo: a parasha da semana com nome hebraico, referencia e interpretacao. Para Catolicismo: o evangelho do dia. Para Isla: uma sura recomendada. Etc. Formato JSON com title, reference, explanation, reflection. Maximo 5 linhas por campo."

### Regras de seguranca
- Todos os itens do checklist serao apenas praticas positivas
- Nenhuma pratica que incentive violencia, discriminacao ou dano a pessoas ou animais
- Conteudo focado em amor, compaixao, estudo, oracao e servico ao proximo

