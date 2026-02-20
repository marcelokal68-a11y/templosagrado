
# CRM Completo de Usuarios no Painel Admin

## Resumo

Transformar o painel admin atual (que so gerencia convites) em um CRM completo inspirado nos melhores do mercado (HubSpot, Intercom). Toda a logica de listagem de usuarios roda no backend (edge function) usando service_role, garantindo que apenas admins tenham acesso.

---

## O que sera adicionado

### Dashboard com KPIs (topo)
Cards com metricas rapidas:
- Total de usuarios
- Assinantes ativos
- Usuarios online (ultimo acesso < 5min) -- baseado em `last_sign_in_at` do auth
- Perguntas usadas (total)

### Tabela CRM de Usuarios
Colunas da tabela:

| Coluna | Fonte | Descricao |
|--------|-------|-----------|
| Nome | profiles.display_name | Nome do usuario |
| Email | auth.users.email | Email de cadastro |
| Status | auth.users.last_sign_in_at | "Online" se < 5min, "Offline" com data |
| Assinante | profiles.is_subscriber | Badge verde/cinza |
| Perguntas | profiles.questions_used / questions_limit | Barra de progresso |
| Cadastro | auth.users.created_at | Data de criacao |
| Ultimo acesso | auth.users.last_sign_in_at | Data formatada |
| Acoes | - | Botao para promover admin |

### Funcionalidades da tabela
- Busca por nome ou email (filtro client-side)
- Ordenacao por coluna (nome, cadastro, ultimo acesso)
- Badge colorido para status (Online = verde, Offline = cinza)
- Badge para tipo (Assinante = verde, Gratuito = amarelo, Admin = roxo)
- Contador de resultados

---

## Mudancas Tecnicas

### 1. Edge Function: `supabase/functions/admin/index.ts`

Nova action `list-users`:
- Usa `supabase.auth.admin.listUsers()` para obter todos os usuarios com email, created_at, last_sign_in_at
- Cruza com tabela `profiles` para obter display_name, is_subscriber, questions_used, questions_limit
- Cruza com tabela `user_roles` para identificar admins
- Retorna array consolidado com todos os campos necessarios
- Protegido pela verificacao de admin existente

Nova action `get-stats`:
- Conta total de usuarios, assinantes, ativos recentes
- Soma total de perguntas usadas
- Retorna objeto com as metricas

### 2. Frontend: `src/pages/Admin.tsx`

Reestruturar com abas (Tabs):
- **Aba "Usuarios"**: Dashboard KPIs + Tabela CRM
- **Aba "Convites"**: Funcionalidade existente de criar/gerenciar convites
- **Aba "Admin"**: Promover admin (funcionalidade existente)

Componentes usados:
- `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` (ja disponivel no projeto)
- `Table` / `TableHeader` / `TableRow` / `TableCell` (ja disponivel)
- `Badge` (ja disponivel)
- `Input` para busca
- `Progress` para barra de uso de perguntas

### 3. Sem mudancas no banco de dados
Todos os dados necessarios ja existem nas tabelas `profiles`, `user_roles` e `auth.users`. Nenhuma migracao necessaria.

---

## Resumo de Arquivos

| Arquivo | Mudanca |
|---------|---------|
| `supabase/functions/admin/index.ts` | Novas actions: `list-users` e `get-stats` |
| `src/pages/Admin.tsx` | Reescrever com tabs, KPIs, tabela CRM, busca e filtros |
