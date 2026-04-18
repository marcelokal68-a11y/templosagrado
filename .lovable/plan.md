

## Diagnóstico

Você notou uma inconsistência real entre os dois menus de navegação do app. Vou explicar o que está acontecendo e propor a correção.

### Situação atual

Existem **dois menus de navegação** no app, com **conteúdos diferentes**:

**1. Sidebar lateral (sempre visível em desktop ≥768px)** — `src/components/AppSidebar.tsx`
Mostra apenas 4 itens (+ Admin se aplicável):
- Chat
- Aprender
- Versículo
- Mural
- (Admin)

**2. Drawer hambúrguer (aba expansível, mobile e desktop)** — `src/components/Header.tsx`
Mostra 7-8 itens:
- Chat
- Meu Perfil
- Aprender
- Versículo
- Mural
- **Jornada** ← falta na sidebar
- **Convidar Amigos** ← falta na sidebar
- **Plano Pro** (se não assinante) ← falta na sidebar
- Sair (rodapé)

### Por que isso é um problema

- Usuário desktop que usa só a sidebar **nunca vê** Jornada, Convidar Amigos, Pro ou Perfil.
- Quebra o princípio de "uma fonte de verdade" para navegação.
- Confunde o público sênior (alvo do app) — eles veem botões diferentes em momentos diferentes.

### Causa

A sidebar foi criada para ser um menu "rápido" das 4 abas principais do MVP (Chat/Aprender/Versículo/Mural), enquanto o drawer hambúrguer evoluiu para incluir features novas (Jornada, Convites, Pro) sem que a sidebar fosse atualizada.

---

## Proposta de correção

**Opção escolhida: unificar os dois menus para mostrar exatamente os mesmos itens de navegação principal**, mantendo a sidebar enxuta como "atalho rápido" e o drawer como "menu completo com perfil/conta".

### O que vou fazer

**Em `src/components/AppSidebar.tsx`** — adicionar os itens de navegação que faltam:

Lista final da sidebar (em ordem):
1. Chat (`/`)
2. Aprender (`/learn`)
3. Versículo (`/verse`)
4. Mural (`/mural`)
5. **Jornada (`/journey`)** ← novo, ícone `Brain`
6. (Admin se aplicável)

**O que NÃO entra na sidebar** (fica só no drawer, pois são "conta/ações", não navegação de conteúdo):
- Meu Perfil → acessível pelo botão de avatar no canto superior direito
- Convidar Amigos → ação secundária
- Plano Pro → CTA de monetização
- Sair → ação de conta

### Justificativa da divisão

| Tipo | Onde fica | Por quê |
|------|-----------|---------|
| Navegação de conteúdo (Chat, Aprender, Versículo, Mural, Jornada) | Sidebar **e** Drawer | São as 5 áreas principais do app — devem ser igualmente acessíveis |
| Conta e ações (Perfil, Convites, Pro, Sair) | Apenas Drawer | São ações secundárias / configurações |

Isso resolve a inconsistência sem poluir a sidebar lateral, e mantém o drawer como o "menu completo" para mobile e para acessar conta.

### Arquivo a editar

- `src/components/AppSidebar.tsx` — adicionar item "Jornada" ao array `navItems` com ícone `Brain` (mesmo ícone usado no drawer para consistência visual).

### Fora de escopo

- Não vou mexer no drawer (`Header.tsx`) — ele já está completo e correto.
- Não vou adicionar Perfil/Convites/Pro na sidebar — seriam ruído visual no atalho rápido.
- Não vou criar tradução nova: `t('nav.journey', language)` já existe (usado no drawer).

