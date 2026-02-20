
# Adicionar 5 Novas Filosofias de Vida

## Resumo

Adicionar as seguintes filosofias baseadas na imagem de referencia:
1. **Xamanismo** (shamanism) - Conexao com a Terra e Ancestrais
2. **Taoismo** (taoism) - O fluxo do Tao e a Nao-Acao (Wu Wei)
3. **Antroposofia** (anthroposophy) - Educacao e saude integrada ao espirito
4. **Cosmismo** (cosmism) - Superacao das limitacoes biologicas (complementa o transhumanismo existente)
5. **Ubuntu** (ubuntu) - "Eu sou porque nos somos" (Etica Comunitaria)

---

## Arquivos a modificar

### 1. `src/components/ContextPanel.tsx`
- Adicionar as 5 novas filosofias ao array `philosophies`

### 2. `src/pages/Landing.tsx`
- Adicionar as novas filosofias ao array `philosophies` da landing page

### 3. `src/pages/Practice.tsx`
- Adicionar as 5 novas filosofias ao array `philosophies`
- Adicionar checklists em `PHILOSOPHY_CHECKLISTS` para cada nova filosofia (6 itens cada)

### 4. `src/lib/i18n.ts` (3 idiomas: pt-BR, en, es)
Para cada nova filosofia, adicionar:
- `philosophy.{key}` - Nome traduzido
- `practice.item.*` - Itens do checklist diario (6 por filosofia = 30 novos itens)

**Novas traducoes de nome:**
| Key | pt-BR | en | es |
|-----|-------|-----|-----|
| shamanism | Xamanismo | Shamanism | Chamanismo |
| taoism | Taoismo | Taoism | Taoismo |
| anthroposophy | Antroposofia | Anthroposophy | Antroposofia |
| cosmism | Cosmismo | Cosmism | Cosmismo |
| ubuntu | Ubuntu | Ubuntu | Ubuntu |

**Novos itens de pratica (exemplos):**
- Xamanismo: conexao com a terra, ritual de passagem, meditacao ancestral, oferenda a natureza, caminhada contemplativa, gratidao aos ancestrais
- Taoismo: meditacao Wu Wei, leitura do Tao Te Ching, pratica de nao-acao, contemplacao da natureza, tai chi/chi kung, equiibrio yin-yang
- Antroposofia: exercicio euritimico, leitura de Steiner, meditacao antroposofica, contato com a natureza, atividade artistica, reflexao corpo-alma-espirito
- Cosmismo: reflexao cosmica, leitura de Fedorov, contemplacao do universo, acao de superacao, reflexao sobre imortalidade, conexao ciencia-espirito
- Ubuntu: ato de comunidade, leitura Ubuntu, ajudou alguem, reflexao "eu sou porque nos somos", dialogo comunitario, gratidao coletiva

### 5. `supabase/functions/sacred-chat/index.ts`
- Adicionar as 5 novas filosofias ao `PHILOSOPHY_TEXTS` com seus livros de referencia:
  - shamanism: "Caminhado com os Curadores Mundiais, Historias Orais, tradicoes xamanicas"
  - taoism: "Tao Te Ching (Laozi), Zhuangzi"
  - anthroposophy: "A Ciencia Oculta (Steiner), obras sobre Pedagogia Waldorf"
  - cosmism: "Filosofia da Causa Comum (Fedorov), O Homem Imortal"
  - ubuntu: "Pilares Ubuntu, Escritos de Desmond Tutu, Nelson Mandela"

### 6. `supabase/functions/daily-practice/index.ts`
- Adicionar as 5 novas filosofias ao `PHILOSOPHY_SOURCES` (3 idiomas)

---

## Detalhes Tecnicos

### Checklist keys para cada filosofia:

**shamanism:**
`['earth_connection', 'ancestor_meditation', 'nature_offering', 'shamanic_reading', 'passage_ritual', 'ancestral_gratitude']`

**taoism:**
`['wu_wei_meditation', 'tao_te_ching_reading', 'non_action_practice', 'nature_contemplation', 'tai_chi', 'yin_yang_balance']`

**anthroposophy:**
`['eurythmy_exercise', 'steiner_reading', 'anthroposophic_meditation', 'artistic_activity', 'body_soul_spirit', 'nature_connection']`

**cosmism:**
`['cosmic_reflection', 'fedorov_reading', 'universe_contemplation', 'self_transcendence', 'immortality_reflection', 'science_spirit_connection']`

**ubuntu:**
`['community_act', 'ubuntu_reading', 'help_others', 'i_am_because_we_are', 'community_dialogue', 'collective_gratitude']`

### Nenhuma mudanca no banco de dados
Todas as mudancas sao em codigo frontend e edge functions.
