

## Melhorias na Aba Oracoes

### Problemas Identificados

1. **Botao "Gerar Oracao" quase invisivel**: O botao fica cortado na parte inferior da tela no mobile, abaixo do textarea, dificil de encontrar
2. **Selecao de filosofia sem destaque visual**: Quando o usuario seleciona uma filosofia, o estilo `bg-accent` e quase identico ao fundo, nao dando feedback visual claro
3. **Sem opcao de modo (enviar vs praticar)**: Nao ha separacao entre "enviar oracao para alguem" e "praticar uma oracao para si"
4. **Output de filosofia diz "pensamento" em vez de "oracao"**: A logica `tk()` troca os textos quando filosofia esta selecionada, o que confunde

---

### Solucao

#### A) Seletor de Modo no Topo (Enviar vs Praticar)

Ao entrar na pagina, exibir 2 cards grandes clicaveis:

- **Enviar Oracao** (icone Mail + Heart): "Gere e envie uma oracao para alguem especial"
- **Praticar Oracao** (icone Sparkles + User): "Gere uma oracao ou reflexao para voce mesmo"

O modo selecionado afeta o formulario:
- **Enviar**: mostra campo de nome do destinatario + campo de email integrado no fluxo
- **Praticar**: mostra apenas intencao e gera para o proprio usuario

#### B) Melhorar Visibilidade do Botao de Gerar

- Mover o botao "Gerar Oracao" para uma posicao fixa (sticky) no bottom da tela mobile, acima do BottomNav
- Botao com `sacred-gradient` (dourado) para destaque maximo
- Tamanho maior (`h-12 text-base`) para facilitar o toque

#### C) Destacar Filosofia Selecionada

- Trocar o estilo da filosofia selecionada de `bg-accent` (que e muito sutil) para usar o mesmo `sacred-gradient` dourado com `sacred-glow`, identico ao estilo de religiao selecionada
- Isso garante contraste nitido independente do tema

#### D) Corrigir Output para Filosofias

- Remover a logica `tk()` que troca "oracao" por "pensamento". Manter sempre como "oracao/reflexao" para ambos os casos
- No generate-prayer edge function, o prompt ja trata filosofia como "thought/reflection", entao o backend esta correto
- O titulo do output pode ser "Sua Reflexao" para filosofia e "Sua Oracao" para religiao, mas sem trocar todo o fluxo

---

### Detalhes Tecnicos

**Arquivo modificado: `src/pages/Prayers.tsx`**

- Adicionar estado `mode`: `'send' | 'practice' | null` (inicia como `null` mostrando os cards de selecao)
- Quando `mode === null`: renderizar 2 cards de selecao de modo
- Quando `mode` esta definido: mostrar formulario atual com ajustes
- No modo "send": incluir campo de email inline no formulario (antes do botao gerar), nao como acao pos-geracao
- Botao "Gerar" com estilo `sacred-gradient` fixo no bottom em mobile (`sticky bottom-16`)
- Filosofia selecionada: usar `sacred-gradient text-primary-foreground border-primary/50 shadow-sm sacred-glow` (mesmo estilo da religiao)
- Botao de voltar ao seletor de modo no topo do formulario

**Arquivo modificado: `src/lib/i18n.ts`**

- Adicionar chaves: `prayers.mode_send`, `prayers.mode_send_desc`, `prayers.mode_practice`, `prayers.mode_practice_desc`, `prayers.back_to_modes`
- Em 3 idiomas (pt-BR, en, es)

**Nenhuma mudanca no backend** -- a edge function `generate-prayer` ja suporta ambos os fluxos.

