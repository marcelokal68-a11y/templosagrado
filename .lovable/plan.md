

# Confidencialidade Total: Remover Perguntas do CRM e Destacar na Landing

## Resumo

Duas mudancas principais:
1. Remover todas as referencias a "perguntas usadas" do painel admin (CRM), garantindo que nenhum administrador veja o conteudo ou contagem de perguntas dos usuarios
2. Adicionar uma secao de confidencialidade na landing page, transmitindo confianca ao usuario de que pode abrir seu coracao sem medo

---

## Mudancas

### 1. Painel Admin (`src/pages/Admin.tsx`)

**Remover do CRM:**
- Remover a coluna "Perguntas" da tabela de usuarios (a coluna com Progress bar mostrando questions_used/questions_limit)
- Remover o card de KPI "Perguntas feitas" (totalQuestions) do dashboard
- Remover o icone HelpCircle dos imports (se nao for mais usado)

**O que permanece:**
- Nome, Email, Status (Online/Offline), Tipo (Assinante/Gratuito/Admin), Cadastro, Ultimo acesso, Acoes
- KPIs: Total usuarios, Assinantes, Online agora (3 cards em vez de 4)

### 2. Edge Function (`supabase/functions/admin/index.ts`)

**Remover do `get-stats`:**
- Remover o campo `totalQuestions` do retorno
- Remover a soma de `questions_used` dos profiles

**Remover do `list-users`:**
- Remover os campos `questions_used` e `questions_limit` do retorno de cada usuario

### 3. Landing Page (`src/pages/Landing.tsx`)

**Adicionar secao de Confidencialidade** entre as Features e as Traditions:
- Icone de cadeado/escudo
- Titulo: "Confidencialidade Total" (traduzido)
- Texto principal: "Abra seu coracao com total seguranca. Suas perguntas, conversas e oracoes sao completamente privadas. Ninguem -- nem mesmo os administradores -- tera acesso ao que voce compartilha com o Sacerdote."
- Subtexto: "Seu espaco sagrado. Suas palavras. Seu sigilo."

### 4. Traducoes (`src/lib/i18n.ts`)

Novas chaves em pt-BR, en e es:

**pt-BR:**
- `landing.privacy_title`: "Confidencialidade Total"
- `landing.privacy_desc`: "Abra seu coracao com total seguranca. Suas perguntas, conversas e oracoes sao completamente privadas. Ninguem -- nem mesmo os administradores -- tera acesso ao que voce compartilha com o Sacerdote."
- `landing.privacy_note`: "Seu espaco sagrado. Suas palavras. Seu sigilo."

**en:**
- `landing.privacy_title`: "Total Confidentiality"
- `landing.privacy_desc`: "Open your heart with complete security. Your questions, conversations and prayers are completely private. No one -- not even administrators -- will have access to what you share with the Priest."
- `landing.privacy_note`: "Your sacred space. Your words. Your privacy."

**es:**
- `landing.privacy_title`: "Confidencialidad Total"
- `landing.privacy_desc`: "Abre tu corazon con total seguridad. Tus preguntas, conversaciones y oraciones son completamente privadas. Nadie -- ni siquiera los administradores -- tendra acceso a lo que compartas con el Sacerdote."
- `landing.privacy_note`: "Tu espacio sagrado. Tus palabras. Tu privacidad."

---

## Resumo de Arquivos

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Admin.tsx` | Remover coluna "Perguntas" e KPI "Perguntas feitas" |
| `supabase/functions/admin/index.ts` | Remover questions_used/questions_limit do list-users e totalQuestions do get-stats |
| `src/pages/Landing.tsx` | Nova secao de confidencialidade com icone de escudo |
| `src/lib/i18n.ts` | 3 novas chaves de traducao em 3 idiomas |

