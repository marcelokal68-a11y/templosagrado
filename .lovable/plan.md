

# Auditoria UX Completa — Templo Sagrado
## Perspectiva: Usuário brasileiro, 40-65 anos, no ônibus/metrô, celular na mão

---

## 1. JORNADA DO USUÁRIO — DIAGNÓSTICO

A jornada atual tem **furos de conversão** e **telas que confundem**. O caminho ideal seria:

```text
Landing → Login → Chat (free) → Limite → Upgrade → Pro
```

Problemas encontrados nessa jornada:

### A. Landing Page (`/landing`)
- **Emoji 🕉️ gigante no hero** — remete a Hinduísmo, pode afastar o público evangélico/católico brasileiro (80%+ do mercado). Deveria usar o logo oficial do Templo Sagrado
- **3 botões de CTA** competindo (Experimentar, Entrar, Assinar) — sobrecarga. No mobile, 3 botões full-width empilhados confundem o idoso
- **Seção de tradições** lista 12 religiões + 14 filosofias em badges — poluição visual e contradiz o MVP de 5 opções
- **Stats "12+ Tradições"** — contradiz o MVP simplificado
- **Testimonials** incluem tradições fora do MVP (Budismo, Islã)
- **Seção de pricing** duplica a página `/pricing` — redundância

### B. Tela de Auth (`/auth`)
- Está OK no geral, mas o texto "Entrar" abaixo da descrição é redundante (aparece 3x: header, descrição, botão)
- O card poderia ser mais compacto no mobile

### C. Chat Principal (`/`)
- **Mobile**: O logo está cortado no header (sem menu hambúrguer quando não está logado). O botão "Entrar" é pequeno
- **Desktop**: Layout agora funciona bem com scroll independente
- **Welcome state**: "Templo Sagrado" + "Perguntas Recomendadas" — o welcome poderia ser mais acolhedor e orientar melhor o novo usuário
- **Input com `mb-14`** para compensar BottomNav, mas a BottomNav está comentada no App.tsx! O `mb-14` está criando espaço vazio desnecessário no mobile

### D. Drawer/Sidebar (`Header.tsx`)
- **"Perfil"** e **"Histórico"** e **"Configurações"** não fazem nada (`action: () => {}`) — itens mortos na UI. Confuso para o usuário
- Falta link para "Convidar Amigos" no drawer
- Falta link para "Instalar App" no drawer

### E. BottomNav — Fantasma
- O componente `BottomNav.tsx` existe e é importado no `App.tsx`, mas está comentado (`{/* BottomNav removed */}`). Porém, o `ChatArea.tsx` ainda tem `mb-14` para compensá-lo. Isso cria um espaço vazio embaixo do chat no mobile

---

## 2. TELAS CANDIDATAS A REMOÇÃO (MVP)

| Tela | Veredicto | Justificativa |
|------|-----------|---------------|
| `/learn` + `/learn/:topic` | **Remover do MVP** | Lista 12 religiões + 20 filosofias — contradiz o MVP de 5 opções. Funcionalidade pode ser absorvida pelo chat ("me ensine sobre catolicismo") |
| `/posts` (Publicações) | **Remover do MVP** | Gerar posts para redes sociais é feature avançada, não essencial. Confunde o usuário básico |
| `/install` | **Manter mas esconder** | Útil, mas pode ser um banner contextual, não uma página dedicada |
| `/invite-friends` | **Manter** | Importante para growth |
| `TwinklingStars` | **Remover** | Efeito visual que consome performance sem agregar valor à proposta clean/ChatGPT |

---

## 3. PROBLEMAS DE ÍCONES E TAMANHOS

- **Header sem menu hambúrguer para visitantes** — quem não está logado não tem como navegar exceto pelo botão "Entrar". Deveria ter o menu hambúrguer sempre, com opções reduzidas (Entrar, Sobre, Planos)
- **Ícone do perfil (User)** no header direito e no drawer — 2 formas de abrir o mesmo drawer, uma delas invisível para o usuário
- **Botão Entrar no header**: `h-8` com `text-sm` — pequeno demais para público 40+. Deveria ser `h-10` mínimo
- **Drawer items**: Os ícones já foram ampliados para `h-6`, mas o botão de logout no footer do drawer tem `h-5` — inconsistência

---

## 4. PLANO DE AÇÃO PROPOSTO

### Fase 1 — Limpeza e Correção Imediata (alta prioridade)

**1.1. Remover BottomNav e seu espaçamento fantasma**
- Deletar `src/components/BottomNav.tsx`
- Remover import e referência comentada no `App.tsx`
- Remover `mb-14` do `ChatArea.tsx` — o espaço que sobra é desperdiçado

**1.2. Corrigir drawer items mortos**
- "Perfil": navegar para uma tela de perfil (mesmo que simples com nome/email/religião) ou remover
- "Histórico": navegar para o histórico de atividades ou remover
- "Configurações": remover por enquanto (não há configurações para ajustar)
- Adicionar "Convidar Amigos" ao drawer

**1.3. Mostrar menu hambúrguer para visitantes**
- Visitante (não logado) deve ver o hambúrguer com: "Entrar", "Planos", "Sobre"
- Aumentar o botão "Entrar" no header de `h-8` para `h-10`

**1.4. Remover TwinklingStars**
- Efeito visual desnecessário para a proposta clean

### Fase 2 — Simplificar Landing Page

**2.1. Trocar emoji 🕉️ por logo oficial**
**2.2. Reduzir CTAs de 3 para 1** — apenas "Começar Agora" (leva para `/auth`)
**2.3. Remover seção de 12 religiões + 14 filosofias** — substituir por "Todas as tradições" de forma genérica
**2.4. Remover seção de pricing duplicada** — apenas um link "Ver planos"
**2.5. Atualizar testimonials** para tradições do MVP (Católico, Evangélico, Espírita)
**2.6. Atualizar stats** para refletir o MVP ("5 Tradições", "Orações Ilimitadas", etc.)

### Fase 3 — Remover Telas Fora do MVP

**3.1. Remover `/learn` e `/learn/:topic`** — remover rotas, componentes e referências no drawer
**3.2. Remover `/posts` (Publicações)** — remover rota, componente e referência no drawer
**3.3. Remover "Aprender" e "Publicações" do drawer**

### Fase 4 — Polimento da Jornada até Pagamento

**4.1. Welcome state do chat mais acolhedor**
- Em vez de "Templo Sagrado / Perguntas Recomendadas", usar algo como "Olá! Como posso te ajudar hoje?" com tom acolhedor
- Perguntas sugeridas mais emocionais/práticas: "Estou ansioso, me ajude", "Preciso de uma oração", "Quero um versículo para hoje"

**4.2. Nudge para upgrade mais natural**
- Quando o usuário está com 3 mensagens restantes, mostrar um banner gentil dentro do chat (não agressivo)
- Após o limite, o modal de upgrade deve ter depoimento ou benefício emocional, não só lista de features

**4.3. Drawer deve ter CTA de upgrade sempre visível**
- Se não é subscriber, o item "Plano" deve ter destaque visual (badge "Pro" ou cor diferente)

---

## Resumo de Arquivos Afetados

| Arquivo | Mudanças |
|---------|----------|
| `src/components/BottomNav.tsx` | Deletar |
| `src/App.tsx` | Remover import BottomNav, remover TwinklingStars |
| `src/components/ChatArea.tsx` | Remover `mb-14`, melhorar welcome state |
| `src/components/Header.tsx` | Hambúrguer para visitantes, botão Entrar maior, corrigir drawer items mortos, adicionar Convidar Amigos |
| `src/pages/Landing.tsx` | Simplificar hero, CTAs, remover seção de tradições expandidas, ajustar stats e testimonials |
| `src/pages/Learn.tsx` | Deletar |
| `src/pages/LearnTopic.tsx` | Deletar |
| `src/pages/Posts.tsx` | Deletar |
| `src/components/TwinklingStars.tsx` | Deletar |

