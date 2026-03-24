

# Privacidade First: Controle de Memória e Limpeza Completa

## Problema

O app atualmente:
1. **Sempre salva memórias** (user_memory) automaticamente — o usuário não tem controle
2. O "Limpar Tudo" apaga chat_messages e activity_history, mas **não apaga user_memory** — o mentor continua "lembrando"
3. Não há comunicação clara ao usuário sobre privacidade

## Proposta

### A. Toggle "Memória do Mentor" (opt-in, desligado por padrão)

- Novo campo `memory_enabled` (boolean, default `false`) na tabela `profiles`
- Toggle visível no chat (ícone de cérebro/memória) e na página de Perfil
- Quando **desligado** (padrão): sacred-chat NÃO extrai memórias, NÃO carrega memórias anteriores
- Quando **ligado**: funciona como hoje, com aviso de que o mentor vai lembrar de você
- Tooltip/texto explicativo: "Quando ativado, o mentor espiritual lembra de detalhes que você compartilhou para personalizar a conversa"

### B. "Limpar Tudo" agora apaga TUDO

- Além de chat_messages e activity_history, também apaga **user_memory**
- Reset completo = como se fosse um novo usuário

### C. Banner de Privacidade no Chat

- Pequeno texto discreto no estado vazio do chat: "🔒 Suas conversas são privadas e não são compartilhadas com ninguém"
- Se memória estiver desligada, adicionar: "O mentor não guarda memórias entre conversas"

### D. Botão "Apagar Memórias" separado no Perfil

- Na página de Perfil, seção de privacidade com:
  - Toggle de memória (on/off)
  - Botão "Apagar todas as memórias" (apaga só user_memory, mantém histórico)

## Mudanças Técnicas

### 1. Migration — adicionar `memory_enabled` à tabela profiles
```sql
ALTER TABLE public.profiles ADD COLUMN memory_enabled boolean NOT NULL DEFAULT false;
```

### 2. `supabase/functions/sacred-chat/index.ts`
- Consultar `profiles.memory_enabled` antes de chamar `fetchUserMemories` e `extractAndSaveMemories`
- Se `false`, pular ambas as funções

### 3. `src/components/ChatArea.tsx`
- No "Limpar Tudo", adicionar delete de `user_memory`
- Adicionar texto de privacidade no empty state
- Adicionar toggle de memória no menu (⋮) do chat

### 4. `src/pages/Profile.tsx`
- Seção "Privacidade" com toggle de memória e botão de apagar memórias

### 5. `src/contexts/AppContext.tsx`
- Carregar `memory_enabled` do perfil e expor no contexto

Total: 1 migration + 4 arquivos editados + 1 edge function atualizada.

