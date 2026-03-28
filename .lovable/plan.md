

# Ajustes de Sessão, Limites e LGPD

## Mudanças Solicitadas

### 1. Limite de sessão (6 perguntas) → pedir login ao anônimo
Atualmente, ao atingir 6 mensagens, a sessão fecha para todos. O comportamento correto:
- **Anônimo**: ao atingir 6 mensagens no chat, bloquear input e mostrar convite para login/cadastro, mas manter o chat visível na tela para o usuário ler e poder solicitar o resumo
- **Logado gratuito**: mesma lógica de 6 perguntas por sessão, mas pode limpar e iniciar nova conversa (limite diário de 12 perguntas)

### 2. Limite diário: 10 → 12 para usuário gratuito
- Alterar `questions_limit` default de 10 para 12 na tabela `profiles`
- Atualizar a lógica de contagem no `ChatArea` e `check-subscription`

### 3. Resumo renomeado para "Palavra do Sumo Sacerdote"
- Botão de resumo passa a se chamar "Palavra do Sumo Sacerdote"
- Só inclui mensagens da sessão atual (já funciona assim — mensagens em memória)

### 4. LGPD — Checkbox de consentimento
- Verificar `localStorage` para flag `lgpd_accepted`
- Se não aceito: mostrar modal/banner antes de permitir uso do chat (primeira vez, cookies apagados)
- Na tela de cadastro (Auth.tsx): checkbox obrigatório de aceite LGPD antes de criar conta
- Texto curto com link para política de privacidade

## Arquivos a editar

| Arquivo | Mudança |
|---------|---------|
| `src/components/ChatArea.tsx` | Lógica de sessão: anônimo → pedir login ao invés de fechar; manter chat visível; renomear resumo para "Palavra do Sumo Sacerdote"; LGPD gate no chat |
| `src/pages/Auth.tsx` | Checkbox LGPD obrigatório no cadastro |
| `src/lib/i18n.ts` | Textos LGPD + "Palavra do Sumo Sacerdote" em 3 idiomas |
| `supabase/functions/check-subscription/index.ts` | Default de 10 → 12 no fallback |

### Migration
- Alterar default de `questions_limit` de 10 para 12 na tabela `profiles`
- Atualizar perfis existentes gratuitos (que têm 10) para 12

## Detalhes Técnicos

### Lógica de sessão no ChatArea:
```text
Ao atingir 6 mensagens do usuário na sessão:
  - Se anônimo: sessionClosed=true + mostrar "Faça login para continuar" + botão resumo
  - Se logado: sessionClosed=true + mostrar "Nova conversa" + botão resumo
  - Em ambos: chat fica visível (scroll mantido), apenas input desabilitado
```

### LGPD gate:
```text
1. Verificar localStorage.getItem('lgpd_accepted')
2. Se não existe → mostrar Dialog modal com texto LGPD + checkbox
3. Ao aceitar → localStorage.setItem('lgpd_accepted', 'true')
4. No Auth.tsx signup: checkbox obrigatório, botão disabled sem aceite
```

Total: **1 migration** + **4 arquivos** editados.

