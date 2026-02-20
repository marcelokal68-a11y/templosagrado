

# Landing Page Emotiva + Logout Limpa o Chat + Redirecionamento

## Resumo

Tres problemas a resolver:
1. **Logout nao limpa o chat** - ao sair, as mensagens permanecem visiveis na tela
2. **Nao existe landing page** - visitantes sem login veem direto o chat, sem explicacao do app
3. **Apos logout, deve redirecionar para landing page** com opcoes claras de entrar/assinar

---

## 1. Nova pagina: Landing Page (`src/pages/Landing.tsx`)

Uma pagina emotiva e respeitosa que apresenta o Templo Sagrado. Estrutura:

### Hero Section
- Emoji grande (icone sagrado) + titulo "Templo Sagrado" em font-display dourado
- Subtitulo emotivo: "Seu santuario digital de sabedoria, oracao e paz interior"
- Descricao: texto breve explicando que o app conecta o usuario com orientacao espiritual de todas as tradicoes religiosas e filosoficas
- 3 botoes CTA: **"Experimente Gratis"** (vai para `/` como visitante), **"Entrar"** (vai para `/auth` como login), **"Assinar"** (vai para `/pricing`)

### Secao de Features (3-4 cards)
- **Chat com o Sacerdote**: Converse com IA guiada por textos sagrados de 12+ tradicoes
- **Oracoes Personalizadas**: Gere oracoes tocantes baseadas na sua intencao e fe
- **Versiculo do Dia**: Receba diariamente inspiracao de textos sagrados
- **Pratica Diaria**: Checklist espiritual personalizado para sua jornada

### Secao de Tradicoes Suportadas
- Grid com chips mostrando as religioes e filosofias suportadas (Cristao, Hindu, Budista, Judaico, Estoicismo, etc.)
- Visual leve e inclusivo

### Footer simples
- "Todas as tradicoes. Uma sabedoria." ou similar

### Cores e estilo
- Manter a paleta amber/dourada existente
- Fundo com gradiente suave
- Cards com bordas e sombras sutis
- Font-display (Cinzel) para titulos
- Totalmente responsiva

## 2. Logout limpa o chat e redireciona

### `src/components/Header.tsx`
- No `handleLogout`, apos `supabase.auth.signOut()`, redirecionar para `/landing` (nao `/`)

### `src/components/ChatArea.tsx`
- Quando `user` muda para `null`, limpar `messages` (setState para [])
- Limpar tambem o cache de audio

### `src/contexts/AppContext.tsx`
- Quando user vira null (logout), resetar `chatContext` para valores vazios e `questionsRemaining` para 10

## 3. Roteamento

### `src/App.tsx`
- Adicionar rota `/landing` para a Landing page
- A rota `/` continua sendo o chat (para visitantes anonimos que clicaram "Experimente Gratis")
- Apos logout, redireciona para `/landing`

## 4. Traducoes (`src/lib/i18n.ts`)

Novas chaves para os 3 idiomas:
- `landing.hero_title`: "Seu santuario de sabedoria e paz"
- `landing.hero_desc`: Descricao emotiva do app
- `landing.try_free`: "Experimente Gratis"
- `landing.sign_in`: "Entrar"
- `landing.subscribe`: "Assinar"
- `landing.feature_chat`: titulo e descricao do chat
- `landing.feature_prayer`: titulo e descricao das oracoes
- `landing.feature_verse`: titulo e descricao do versiculo
- `landing.feature_practice`: titulo e descricao da pratica
- `landing.traditions`: "Todas as tradicoes, uma sabedoria"
- `landing.footer`: texto do footer

---

## Detalhes Tecnicos

### Logout flow
```text
Usuario clica "Sair"
  -> supabase.auth.signOut()
  -> onAuthStateChange dispara, user = null
  -> AppContext reseta chatContext
  -> ChatArea detecta user=null, limpa messages
  -> navigate('/landing')
```

### Arquivos criados
1. `src/pages/Landing.tsx` - Landing page emotiva

### Arquivos modificados
1. `src/App.tsx` - Nova rota /landing
2. `src/components/Header.tsx` - Logout redireciona para /landing
3. `src/components/ChatArea.tsx` - Limpa mensagens no logout
4. `src/contexts/AppContext.tsx` - Reset do contexto no logout
5. `src/lib/i18n.ts` - Traducoes da landing page

