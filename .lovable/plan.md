# Seletor de Modo Religiao/Filosofia + Correcao do Botao Gerar

&nbsp;

Rever e concertar funcionamento do botão gerar resposta abaixo do seletor de opções!

## Resumo

Implementar um seletor visual em marrom com efeitos abaixo do titulo "Converse com o Grande Sacerdote" para o usuario escolher entre **Afiliacao Religiosa** ou **Filosofia de Vida** (apenas uma por vez). Quando tentar trocar tendo ja selecionado algo, um pop-up de confirmacao aparece com mensagem personalizada. Tambem corrigir o botao "Gerar Resposta" garantindo que o Drawer feche no mobile para o usuario ver a resposta.

---

## Mudancas Visuais

### Seletor de Modo (marrom com efeitos)

Dois botoes lado a lado no topo do ContextPanel, abaixo do titulo:

- **Afiliacao Religiosa** (icone Church)
- **Filosofia de Vida** (icone BookOpen)

Estilo ativo: fundo marrom escuro (`bg-amber-800`) com sombra e gradiente, texto claro.
Estilo inativo: fundo marrom claro (`bg-amber-100`) com texto marrom escuro.

Apenas a secao selecionada aparece. A outra fica completamente oculta.

### Pop-up de Confirmacao

Quando o usuario ja tem uma selecao (ex: "Judeu") e tenta clicar no outro modo, aparece um AlertDialog:

> "Para essa conversa com nosso sabio sacerdote, voce ja escolheu **Judeu**. Deseja mudar para **Filosofia de Vida**? Se desejar, faca Judeu agora e Filosofia depois! Decida em paz."

Botoes: **Manter** | **Mudar**

---

## Arquivos a Modificar

### 1. `src/components/ContextPanel.tsx`

- Adicionar estado `activeMode: 'religion' | 'philosophy'` (default: 'religion')
- Adicionar estados para o AlertDialog de confirmacao (`showConfirm`, `pendingMode`)
- Renderizar dois botoes de modo em marrom no topo
- Mostrar apenas a secao de religiao OU filosofia conforme o modo
- Ao clicar no modo inativo com selecao ativa, abrir o AlertDialog
- Remover o texto "Escolha uma afiliacao religiosa OU uma filosofia de vida"
- Importar AlertDialog e icones (Church, BookOpen)
- Aceitar prop `onClose` para fechar o Drawer ao gerar

### 2. `src/lib/i18n.ts`

Adicionar traducoes nos 3 idiomas:

- `panel.mode_religion`: "Afiliacao Religiosa"
- `panel.mode_philosophy`: "Filosofia de Vida"
- `panel.switch_title`: "Mudar caminho?"
- `panel.switch_message`: template da mensagem de confirmacao
- `panel.keep`: "Manter"
- `panel.switch`: "Mudar"

### 3. `src/pages/Index.tsx`

- Controlar estado `open` do Drawer com `useState`
- Fechar o Drawer quando `onGenerate` for chamado (resolver o botao que "nao funciona" no mobile -- o Drawer cobre a resposta)
- Passar `onClose` ao ContextPanel

---

## Detalhes Tecnicos

### Logica do Seletor de Modo

```text
Estado: activeMode = 'religion' | 'philosophy'

Ao clicar no modo diferente:
  Se chatContext.religion ou chatContext.philosophy tem valor:
    -> Abrir AlertDialog de confirmacao
    -> "Manter": fecha dialog, nao muda nada
    -> "Mudar": limpa selecao atual (religion='', philosophy='', topic=''), troca activeMode
  Se nao tem selecao:
    -> Troca activeMode diretamente
```

### Correcao do Botao Gerar Resposta (Mobile)

O botao funciona tecnicamente (chama `chatRef.current?.sendAutoMessage`), mas no mobile o Drawer permanece aberto cobrindo o chat. A correcao:

```text
Index.tsx:
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  handleGenerate:
    ... monta mensagem ...
    chatRef.current?.sendAutoMessage(msg);
    setDrawerOpen(false);  // fecha o drawer

  <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
```

### Estilo dos Botoes de Modo

```text
Container: flex gap-2 p-3, com border-b border-amber-200
Ativo:   bg-gradient-to-b from-amber-700 to-amber-900 text-amber-50 shadow-lg shadow-amber-900/30 border-amber-600
Inativo: bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100
Ambos:   rounded-xl px-4 py-2.5 flex-1 font-semibold text-sm flex items-center justify-center gap-2 border transition-all
```