

# Redirecionar usuarios nao autenticados para a Landing Page

## Problema Atual

Quando o usuario nao esta logado (ou apos logout), ele pode acessar qualquer pagina do app diretamente, incluindo o chat (`/`), oracoes, versiculo, pratica, etc. O correto e que usuarios sem sessao sejam sempre redirecionados para `/landing`.

## Solucao

Criar um componente `ProtectedRoute` que verifica autenticacao e redireciona para `/landing` se o usuario nao estiver logado.

### Mudancas

**1. Novo componente: `src/components/ProtectedRoute.tsx`**

- Componente wrapper que usa `useApp()` para verificar `user` e `loading`
- Se `loading` esta true, mostra um spinner/skeleton
- Se `user` e null, redireciona para `/landing` via `<Navigate to="/landing" replace />`
- Se `user` existe, renderiza o conteudo filho

**2. Atualizar `src/App.tsx`**

- Envolver as rotas protegidas com `ProtectedRoute`:
  - `/` (Index/Chat)
  - `/prayers`
  - `/verse`
  - `/practice`
  - `/posts`
  - `/admin`
- Rotas publicas que NAO precisam de protecao:
  - `/landing`
  - `/auth`
  - `/pricing`
  - `/invite/:code`

**3. Atualizar `src/components/BottomNav.tsx`**

- Esconder o BottomNav quando o usuario nao esta logado (nao faz sentido mostrar navegacao para paginas protegidas)

**4. Atualizar `src/components/QuickTutorial.tsx`**

- Esconder o botao de tutorial quando o usuario nao esta logado (ele ja ve o tutorial na landing)

---

## Detalhes Tecnicos

### ProtectedRoute

```text
- Importa useApp() para acessar user e loading
- Importa Navigate de react-router-dom
- Se loading: renderiza div centralizada com spinner
- Se !user: retorna <Navigate to="/landing" replace />
- Se user: retorna children
```

### Rotas no App.tsx

```text
Protegidas (envolvidas com ProtectedRoute):
  / -> Index
  /prayers -> Prayers
  /verse -> Verse
  /practice -> Practice
  /posts -> Posts
  /admin -> Admin

Publicas (sem ProtectedRoute):
  /landing -> Landing
  /auth -> Auth
  /pricing -> Pricing
  /invite/:code -> InviteRedeem
  * -> NotFound
```

### BottomNav e QuickTutorial

```text
Ambos verificam useApp().user
Se user == null, retornam null (nao renderizam nada)
```

