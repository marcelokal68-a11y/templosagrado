

# Gerar Oracao com IA, Copiar e Enviar por Email

## Resumo

A pagina "Enviar Oracao" atualmente apenas salva a intencao no banco. O usuario quer que a IA **gere uma oracao completa** baseada na intencao, religiao/filosofia selecionada. Depois de gerada, o usuario pode copiar e enviar por email para si mesmo ou para destinatarios.

---

## 1. Nova Edge Function: `generate-prayer`

**Arquivo:** `supabase/functions/generate-prayer/index.ts`

Uma funcao dedicada que recebe a intencao, religiao/filosofia e idioma, e retorna uma oracao completa gerada pela IA.

- Usa o mesmo mapa `SACRED_TEXTS` e `PHILOSOPHY_TEXTS` do sacred-chat
- System prompt especifico: "Voce e um mestre de oracoes. Gere uma oracao profunda, poetica e emocionante baseada na intencao do fiel, dentro da tradicao [religiao/filosofia]"
- Modelo: `openai/gpt-5-mini` via Lovable AI gateway
- Resposta nao-streaming (JSON com o texto da oracao)
- Maximo ~20 linhas de oracao

## 2. Nova Edge Function: `send-prayer-email`

**Arquivo:** `supabase/functions/send-prayer-email/index.ts`

Envia a oracao gerada por email usando a API de email integrada do backend (Supabase Auth `admin.sendRawEmail` ou via Resend/SMTP). Como nao temos um servico de email configurado, usaremos a IA para gerar o conteudo e enviaremos via a API do Resend (precisaremos configurar uma API key) OU usaremos uma abordagem mais simples: abrir o cliente de email do usuario via `mailto:` com o conteudo pre-preenchido.

**Abordagem escolhida:** `mailto:` link — nao requer API key adicional, funciona em qualquer dispositivo, e o usuario controla o envio.

## 3. Atualizar `src/pages/Prayers.tsx`

Novo fluxo:

```text
1. Usuario escolhe religiao/filosofia
2. Escreve o nome (opcional) e a intencao
3. Clica "Gerar Oracao" -> IA gera a oracao
4. Oracao aparece num card bonito abaixo do formulario
5. Botoes: [Copiar] [Enviar por Email] [Gerar Novamente]
6. "Enviar por Email" abre campo para digitar emails ou usa o email do usuario logado
7. Clica enviar -> abre mailto: com a oracao formatada
```

### Mudancas no componente:

- Novo estado `generatedPrayer: string` para guardar a oracao gerada
- Novo estado `recipientEmails: string` para emails destinatarios
- Botao "Gerar Oracao" chama a edge function `generate-prayer`
- Apos gerar, exibe a oracao num card com fundo suave
- Botao "Copiar" copia a oracao gerada (nao a intencao)
- Botao "Enviar por Email" com opcoes:
  - Para mim (email do usuario logado)
  - Para outros (campo de input para emails separados por virgula)
  - Abre `mailto:` com subject e body formatados
- Botao "Gerar Novamente" para pedir outra versao
- A oracao tambem e salva na tabela `prayers` com o campo `generated_text`

## 4. Migracao SQL: adicionar coluna `generated_text`

```sql
ALTER TABLE public.prayers ADD COLUMN IF NOT EXISTS generated_text text;
```

Para armazenar a oracao gerada junto com a intencao original.

## 5. Traducoes novas em `src/lib/i18n.ts`

- `prayers.generate`: "Gerar Oracao" / "Generate Prayer" / "Generar Oracion"
- `prayers.generated`: "Oracao Gerada" / "Generated Prayer" / "Oracion Generada"
- `prayers.regenerate`: "Gerar Novamente" / "Generate Again" / "Generar de Nuevo"
- `prayers.send_email`: "Enviar por Email" / "Send by Email" / "Enviar por Email"
- `prayers.email_to_me`: "Para meu email" / "To my email" / "A mi email"
- `prayers.email_others`: "Outros destinatarios" / "Other recipients" / "Otros destinatarios"
- `prayers.email_placeholder`: "Emails separados por virgula" / "Emails separated by comma" / "Emails separados por coma"
- `prayers.generating`: "Gerando oracao..." / "Generating prayer..." / "Generando oracion..."

---

## Detalhes Tecnicos

### Edge Function `generate-prayer`

```typescript
// Recebe: { intention, religion, philosophy, language, name }
// Retorna: { prayer: "texto da oracao gerada" }

const systemPrompt = `You are a master of prayers and sacred words.
Generate a beautiful, profound, and moving prayer based on the faithful's intention.
The prayer must be within the ${tradition} tradition, citing ${sources}.
Write in ${language}. Maximum 20 lines. Be poetic and touching.`;

const userMessage = `Intention: ${intention}${name ? `\nName: ${name}` : ''}`;
```

### Email via mailto:

```typescript
const handleSendEmail = (emails: string[]) => {
  const subject = encodeURIComponent(t('prayers.generated', language));
  const body = encodeURIComponent(generatedPrayer);
  window.open(`mailto:${emails.join(',')}?subject=${subject}&body=${body}`);
};
```

### Arquivos modificados
1. `supabase/functions/generate-prayer/index.ts` — Nova edge function
2. `src/pages/Prayers.tsx` — Fluxo completo de gerar, copiar, enviar
3. `src/lib/i18n.ts` — Traducoes novas
4. Migracao SQL — Coluna `generated_text` na tabela `prayers`

### Arquivos criados
1. `supabase/functions/generate-prayer/index.ts`

