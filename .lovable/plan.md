

## Redesign Visual: Estetica Premium Sagrada

Inspirado nas imagens de referencia, o app ganhara uma estetica dark premium com brilhos dourados, efeitos de luz cosmica e cards com glassmorphism profundo -- evocando uma experiencia imersiva de templo digital.

---

### Visao Geral das Mudancas

A reformulacao abrange **cores, tipografia, efeitos visuais e layout de componentes** em todo o app, mantendo a estrutura funcional existente.

---

### 1. Nova Paleta de Cores (index.css)

**Tema escuro como padrao** -- inspirado nas imagens com fundo azul-marinho profundo e destaques dourados:

- **Background**: Azul-marinho escuro (#0a0e1a) em vez do creme claro atual
- **Cards**: Vidro escuro semi-transparente com borda dourada sutil
- **Primary**: Dourado brilhante (mantendo o tom atual mas mais luminoso)
- **Accent**: Azul cosmico profundo (#1a2444)
- **Texto**: Branco/creme (#f0e6d3) com hierarquia clara
- **Glass**: Efeito mais forte com backdrop-blur maior e bordas luminosas

O tema claro sera mantido como alternativa, mas o dark sera o padrao visual.

### 2. Efeitos Visuais Novos (index.css)

- **Glow dourado**: Classe `.sacred-glow` com box-shadow dourado pulsante
- **Borda luminosa**: `.sacred-border` com gradiente dourado nas bordas dos cards
- **Shimmer animado**: Animacao de brilho passando sobre titulos e cards
- **Particulas de luz**: Pseudo-elementos com pontos de luz (efeito estrelas)
- **Gradiente cosmico**: Fundo com gradiente radial simulando nebulosa

### 3. Landing Page (Landing.tsx)

- Hero com fundo gradiente cosmico (azul escuro para preto) e brilho dourado central
- Cards de features com glassmorphism escuro e bordas douradas
- Secao do Mural Sagrado com efeito de luz irradiando do centro
- Stats com numeros em dourado brilhante com glow
- Testimonials com cards de vidro escuro e aspas douradas
- Footer com gradiente sutil

### 4. Header e Navegacao (Header.tsx, BottomNav.tsx)

- Header com fundo glass escuro e borda inferior dourada sutil
- Bottom nav com icones que ganham glow dourado quando ativos
- Indicador ativo com barra dourada luminosa no topo

### 5. Cards e Componentes (Verse, Practice, Prayers, Posts)

- Todos os cards com fundo glass escuro (rgba dark + blur)
- Bordas com gradiente dourado sutil
- Titulos em fonte Cinzel com cor dourada
- Botoes primarios com gradiente dourado e efeito glow no hover
- Selectors de religiao com estilo pill dourado quando ativo
- Barras de progresso com gradiente dourado

### 6. Chat (ChatArea.tsx)

- Bolhas do assistente com glass escuro e borda dourada sutil
- Avatar do assistente com anel de glow dourado
- Input com borda glass e glow no focus
- Typing dots com cor dourada

### 7. Mural Sagrado (TempleGallery, SacredPlace, PrayerNote)

- Gallery com overlay de gradiente mais dramatico (preto para transparente)
- Nomes dos templos com texto dourado e sombra de luz
- Prayer notes com estilo pergaminho escuro (em vez de amber claro)
- Bordas dos notes com efeito manuscrito luminoso

### 8. Sidebar (AppSidebar.tsx)

- Mantendo o fundo escuro atual, adicionando brilho dourado nos itens ativos
- Separadores com linha dourada sutil

---

### Detalhes Tecnicos

**Arquivos modificados:**

| Arquivo | Mudancas |
|---------|----------|
| `src/index.css` | Nova paleta dark, variaveis CSS, classes de efeito (glow, shimmer, sacred-border), animacoes keyframe, gradientes cosmicos |
| `tailwind.config.ts` | Novas animacoes (shimmer, glow-pulse), cores customizadas adicionais |
| `src/pages/Landing.tsx` | Classes de estilo atualizadas para estetica cosmica premium |
| `src/components/Header.tsx` | Glass escuro com borda dourada |
| `src/components/BottomNav.tsx` | Icones com glow dourado ativo |
| `src/components/ChatArea.tsx` | Bolhas com glass escuro, avatar com glow |
| `src/pages/Verse.tsx` | Cards com glass escuro e bordas douradas |
| `src/pages/Practice.tsx` | Mesmo tratamento de cards e selectors |
| `src/pages/Prayers.tsx` | Cards e botoes com estetica dourada |
| `src/pages/Posts.tsx` | Cards com glass escuro |
| `src/components/mural/TempleGallery.tsx` | Overlay cosmico, texto dourado |
| `src/components/mural/SacredPlace.tsx` | Hero com glow, notes escuros |
| `src/components/mural/PrayerNote.tsx` | Estilo pergaminho escuro com borda luminosa |
| `src/pages/Mural.tsx` | Tabs com estilo dourado |
| `src/pages/Invite.tsx` | Card com glass e glow |

**Nenhuma dependencia nova** -- tudo sera feito com CSS puro (variaveis, gradientes, box-shadow, backdrop-filter, animacoes keyframe).

**Nenhuma mudanca no banco de dados** -- redesign puramente visual.

