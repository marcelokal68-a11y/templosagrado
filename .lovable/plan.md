

# Melhorar UI/UX da area de auxilio no Chat

## Problema atual
O contador de perguntas restantes e os links de login/upgrade estao logo abaixo do botao de enviar, ocupando espaco visual e criando uma area congestionada. Isso prejudica a experiencia do usuario.

## Solucao

### Mover informacoes de auxilio para uma barra sutil no topo da area de input

Em vez de uma linha extra abaixo do textarea, integrar as informacoes como um indicador discreto **acima** da area de digitacao, dentro do border-top, como fazem apps modernos de chat (WhatsApp, Telegram).

### Layout proposto

```text
+--------------------------------------------------+
| Area de mensagens (scroll)                        |
+--------------------------------------------------+
| [5 perguntas restantes]        [Login / Upgrade]  |  <-- barra sutil acima do input
+--------------------------------------------------+
| [Textarea...............] [Mic] [Enviar]          |  <-- area de input limpa
+--------------------------------------------------+
```

### Mudancas de UI/UX

1. **Mover o contador + links** para uma barra fina acima do textarea (dentro do mesmo container `border-t`)
2. **Estilizar** com fundo levemente diferente (`bg-muted/30`), padding menor, e tipografia mais discreta
3. **Badge colorido** para o contador: verde (>5), amarelo (3-5), vermelho (<=2) -- feedback visual instantaneo
4. **Animacao sutil** quando perguntas ficam baixas (pulse no badge vermelho)
5. **Remover margem inferior** (`mt-2`) que desperdicava espaco

### Detalhes tecnicos

**Arquivo:** `src/components/ChatArea.tsx`

- Reorganizar o JSX do container inferior (linhas 498-539)
- Mover o bloco de `questionsRemaining` e links para **antes** do `div.flex.gap-2` com textarea/botoes
- Aplicar classes de badge colorido baseado no valor de `questionsRemaining`
- Manter toda a logica existente intacta (links condicionais, contagem anonima)

