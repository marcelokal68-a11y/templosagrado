
# Melhorar Navegacao Mobile

## Problemas Identificados

1. **Botao de logout invisivel no mobile** - O botao de logout esta com `hidden md:flex`, so aparece no desktop
2. **Sem seta de voltar** - Paginas internas (Prayers, Verse, Learn, Posts, Practice, Mural, Admin, Invite) nao tem como voltar no mobile
3. **Paginas inacessiveis** - Posts, Practice e Mural so estao na sidebar (desktop)

## Solucao

### 1. Adicionar seta de voltar e botao de logout no Header (mobile)

No Header, para telas mobile:
- Se o usuario esta em uma subpagina (nao e `/`), mostrar uma **seta de voltar** no lado esquerdo que navega para a pagina anterior ou para `/`
- Se o usuario esta na pagina principal (`/`), mostrar um **botao de logout** no lugar da seta
- Manter o logo visivel, mas compacto

### 2. Logica de navegacao

- Paginas como `/prayers`, `/verse`, `/learn`, `/posts`, `/practice`, `/mural` - seta volta para `/`
- `/learn/:topic` - seta volta para `/learn`
- `/admin`, `/invite-friends` - seta volta para `/`
- Se nao logado, mostrar botao de login
- Se logado e na home, mostrar botao de logout (redireciona para `/landing`)

## Detalhes Tecnicos

### Arquivo: `src/components/Header.tsx`

Alteracoes:
- Importar `ArrowLeft` do lucide-react
- Adicionar logica para determinar se e subpagina (`pathname !== '/'`)
- No mobile (`md:hidden`):
  - Subpagina + logado: mostrar seta de voltar
  - Home + logado: mostrar botao de logout (icone `LogOut`)
  - Nao logado: manter botao de login atual
- Remover `hidden md:flex` do bloco de logout para que o icone de logout apareca no mobile tambem (apenas na home)

A seta de voltar tera o mesmo estilo dourado dos outros elementos de navegacao para manter consistencia visual.
