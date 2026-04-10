

## Problema

O popup LGPD usa um **Checkbox** para aceitar os termos. Checkboxes podem exigir cliques mais precisos e, dependendo da interação com o `onCheckedChange`, o usuário precisa clicar duas vezes para que o estado mude e o dialog feche.

## Solução

Substituir o Checkbox por um **Button "Aceitar e continuar"** simples. Um clique no botão chama `handleLgpdAccept()` e fecha o dialog imediatamente.

## Alterações

**`src/components/ChatArea.tsx`** (linhas ~637-648):
- Remover o `Checkbox` + label clicável
- Adicionar um texto informativo sobre a política de privacidade (com link)
- Adicionar um `Button` com texto "Aceitar e continuar" que chama `handleLgpdAccept()` diretamente

O resultado: um único clique no botão fecha o popup.

