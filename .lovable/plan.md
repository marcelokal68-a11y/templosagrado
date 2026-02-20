

# Persistir Chat Durante Navegacao

## Problema

Quando voce navega para outra aba (Historico, Posts, etc.) e volta ao chat, todas as mensagens somem. Isso acontece porque as mensagens ficam armazenadas apenas dentro do componente ChatArea, que e destruido ao sair da pagina e recriado ao voltar.

## Solucao

Mover o estado das mensagens do chat para o contexto global do app (AppContext), que vive acima de todas as paginas e nunca e destruido durante a navegacao.

---

## Mudancas

### 1. AppContext - armazenar mensagens globalmente

**Arquivo:** `src/contexts/AppContext.tsx`

- Adicionar `messages` e `setMessages` ao contexto global
- Adicionar `chatInput` e `setChatInput` para preservar o texto digitado
- No logout, limpar as mensagens (ja existente para outros campos)

### 2. ChatArea - usar estado do contexto

**Arquivo:** `src/components/ChatArea.tsx`

- Remover `const [messages, setMessages] = useState<Msg[]>([])` local
- Remover `const [input, setInput] = useState('')` local
- Importar `messages`, `setMessages`, `chatInput`, `setChatInput` do `useApp()`
- Substituir todas as referencias de `input` por `chatInput` e `setInput` por `setChatInput`
- Manter toda a logica de streaming, TTS e salvamento no banco inalterada

### 3. Resultado esperado

- Navegar para qualquer aba e voltar: mensagens continuam la
- O texto sendo digitado tambem e preservado
- Logout continua limpando tudo
- Login continua carregando mensagens do banco

---

## Detalhes Tecnicos

### AppContext - novos campos

```text
type Msg = { role: 'user' | 'assistant'; content: string };

// Novos estados:
const [messages, setMessages] = useState<Msg[]>([]);
const [chatInput, setChatInput] = useState('');

// No logout (dentro do onAuthStateChange):
setMessages([]);
setChatInput('');

// Expor no Provider value:
messages, setMessages, chatInput, setChatInput
```

### ChatArea - remocao de estado local

```text
// REMOVER estas linhas:
const [messages, setMessages] = useState<Msg[]>([]);
const [input, setInput] = useState('');

// SUBSTITUIR por:
const { ..., messages, setMessages, chatInput, setChatInput } = useApp();

// Trocar todas as ocorrencias de "input" por "chatInput"
// Trocar todas as ocorrencias de "setInput" por "setChatInput"
```

A carga inicial de mensagens do banco (useEffect com user) permanece no ChatArea, mas agora grava no estado global em vez do local.

