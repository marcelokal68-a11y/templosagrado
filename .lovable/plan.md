## Mural Sagrado - Bilhetes de Oracao nos Locais Sagrados do Mundo

### Visao Geral

Criar uma experiencia imersiva onde cada religiao tem seu local sagrado virtual representado com imagens tematicas. Os fieis depositam "bilhetes" de oracao nesses locais, podendo escolher se sao privados (so ele ve) ou publicos. Um segundo painel ecumenico reune todos os bilhetes publicos de todas as religioes, com filtros por afiliacao.

### Locais Sagrados por Religiao


| Religiao          | Local Sagrado         | Descricao Visual                                                |
| ----------------- | --------------------- | --------------------------------------------------------------- |
| Judeu             | Muro das Lamentacoes  | Parede de pedras antigas com bilhetes de papel entre as frestas |
| Catolico          | Basilica de Sao Pedro | Interior iluminado por velas com bilhetes nos bancos            |
| Protestante       | Igreja Reformada      | Altar simples de madeira com bilhetes no pulpito                |
| Cristao           | Igreja de Cristo      | Cruz central com bilhetes ao redor                              |
| Mormon            | Templo de Salt Lake   | Fachada branca com bilhetes dourados                            |
| Isla              | Kaaba em Meca         | Cubo negro rodeado de bilhetes                                  |
| Budista           | Templo Dourado        | Arvore Bodhi com bilhetes pendurados                            |
| Hindu             | Templo de Ganges      | Margem do rio com lamparinas e bilhetes                         |
| Espirita          | Centro Espirita       | Sala de passes com bilhetes na mesa                             |
| Umbanda           | Terreiro              | Espaco sagrado com velas e bilhetes                             |
| Candomble         | Terreiro de Candomble | Arvore sagrada (Iroko) com bilhetes                             |
| Agnostico         | Universo              | Ceu estrelado com bilhetes flutuando                            |
| Ecumenico (geral) | Planeta Terra         | Globo terrestre com bilhetes de todas as tradicoes              |


As imagens serao geradas via prompt de IA ou obtidas de bancos de imagens livres (Unsplash), armazenadas como URLs publicas.

### Estrutura de Navegacao

Nova rota `/mural` acessivel pela BottomNav e Header. A pagina tera duas abas:

1. **Meu Local Sagrado** - Mural tematico da religiao/filosofia do usuario (baseado no `chatContext.religion` ou selecao local)
2. **Encontro Ecumenico** - Todos os bilhetes publicos de todas as religioes, com filtros

### Banco de Dados

**Tabela `prayer_wall_posts`:**


| Coluna       | Tipo                      | Descricao                      |
| ------------ | ------------------------- | ------------------------------ |
| id           | uuid PK                   | Identificador                  |
| user_id      | uuid NOT NULL             | Autor do bilhete               |
| content      | text NOT NULL             | Texto do bilhete/oracao        |
| religion     | text                      | Religiao associada             |
| philosophy   | text                      | Filosofia associada            |
| is_anonymous | boolean DEFAULT false     | Se publicado anonimamente      |
| is_public    | boolean DEFAULT false     | Se visivel no painel ecumenico |
| display_name | text                      | Nome exibido (cache do perfil) |
| created_at   | timestamptz DEFAULT now() | Data de criacao                |


**Tabela `prayer_reactions`:**


| Coluna                                  | Tipo                      | Descricao                       |
| --------------------------------------- | ------------------------- | ------------------------------- |
| id                                      | uuid PK                   | Identificador                   |
| post_id                                 | uuid FK                   | Referencia ao post              |
| user_id                                 | uuid NOT NULL             | Quem reagiu                     |
| reaction_type                           | text NOT NULL             | 'pray' ou 'heart'               |
| created_at                              | timestamptz DEFAULT now() | Data                            |
| UNIQUE(post_id, user_id, reaction_type) | &nbsp;                    | Uma reacao por tipo por usuario |


**Politicas RLS:**

- `prayer_wall_posts` SELECT: usuarios autenticados podem ver seus proprios posts OU posts publicos (`is_public = true`)
- `prayer_wall_posts` INSERT: apenas assinantes autenticados (`profiles.is_subscriber = true`)
- `prayer_wall_posts` DELETE: apenas o proprio autor
- `prayer_reactions` SELECT: todos autenticados
- `prayer_reactions` INSERT/DELETE: todos autenticados (toggle)

**Realtime:** Habilitar para `prayer_wall_posts` para novos bilhetes aparecerem em tempo real.

### Arquivos a Criar/Modificar

**Novos:**

- `src/pages/Mural.tsx` - Pagina principal com as duas abas
- `src/components/mural/SacredPlace.tsx` - Componente do local sagrado com imagem de fundo, bilhetes animados sobrepostos e formulario
- `src/components/mural/EcumenicalWall.tsx` - Painel ecumenico com filtros e lista de todos os bilhetes publicos
- `src/components/mural/PrayerNote.tsx` - Componente do bilhete individual (aspecto de papel/pergaminho) com reacoes
- `src/components/mural/NoteForm.tsx` - Formulario para criar novo bilhete com toggles de anonimato e visibilidade publica

**Modificados:**

- `src/App.tsx` - Adicionar rota `/mural`
- `src/components/BottomNav.tsx` - Adicionar item "Mural" (icone ScrollText ou similar)
- `src/components/Header.tsx` - Adicionar link "Mural" na nav desktop
- `src/lib/i18n.ts` - Traducoes para pt-BR, en, es

### Design Visual dos Bilhetes

Cada bilhete tera aspecto de papel/pergaminho com:

- Sombra suave e leve rotacao aleatoria (como bilhetes reais colados numa parede)
- Texto em fonte manuscrita ou serif
- Icone da religiao no canto
- Botoes de reacao (maozinhas juntas e coracao) com contagem
- Badge "Anonimo" quando aplicavel
- Data discreta

### Layout do Local Sagrado

- Imagem hero do local sagrado (altura ~200-250px) com overlay gradiente escuro
- Titulo do local (ex: "Muro das Lamentacoes") sobre a imagem
- Subtitulo inspirador (ex: "Deposite aqui sua oracao, como fazem os fieis em Jerusalem")
- Abaixo: grid de bilhetes com rotacao aleatoria leve
- Botao flutuante "Depositar bilhete" que abre o formulario
- Nao-assinantes veem um CTA para assinar antes de poder depositar

### Layout do Encontro Ecumenico

- Header com titulo "Encontro Ecumenico" e descricao
- Barra de filtros com chips de religiao/filosofia (multi-selecao)
- Grid/lista de bilhetes publicos de todas as tradicoes, com badge da religiao
- Ordenacao por mais recentes

### Imagens dos Locais Sagrados

Usar imagens de alta qualidade do Unsplash via URL direta. Cada religiao tera uma URL de imagem mapeada num objeto constante. Exemplo:

- Muro das Lamentacoes: foto real do Kotel
- Kaaba: foto da Grande Mesquita
- Templo Budista: foto de templo dourado
- etc.

As URLs serao hardcoded como constantes no componente SacredPlace.

### Fluxo do Usuario

1. Usuario clica em "Mural" na navegacao
2. Aba "Meu Local Sagrado" mostra o local da religiao selecionada (ou pede para selecionar)
3. Usuario clica em "Depositar bilhete"
4. Formulario aparece com: textarea, toggle "Anonimo", toggle "Publicar no Encontro Ecumenico"
5. Ao submeter, bilhete aparece no mural com animacao. A IA deve ler bilhetes agressivos ou racistas e evitar a publicacao. tudo vai para o painel do admin. cada novo post é notificado ao admin. Se a IA notar abuso, agressividade, discriminacao, racismo, sugere ao admin apagar imediatamente. o usuario deve avisar que pode ser banido do templo Sagrado caso poste mensagens assim. 
6. Criar canal de denuncia de abusos com motivos em checkbox (assedio, icentivo ao odio, racismo, etc..., outros (abrir campo de texto). 
7. o acesso ao mural é restrito a usuarios logados
8. Na aba "Encontro Ecumenico", usuario ve bilhetes publicos de todas as religioes
9. Pode filtrar por religiao especifica
10. Pode reagir com maozinhas juntas ou coracao