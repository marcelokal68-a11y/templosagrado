

## Objetivo

Transformar a área `/learn` em uma experiência de **podcast educacional** — cada resposta do mentor (Mestre/Professor) ganha um player de áudio com narração TTS, mais um modo "Podcast" contínuo que reproduz automaticamente cada nova mensagem e oferece controles dedicados de áudio.

## Comportamento

### 1. Botão "Ouvir" em cada bolha do assistente
- No rodapé de cada bolha do mentor (`role: 'assistant'`), adicionar pequeno botão com ícone de play/pause + duração estimada.
- Clicar → toca a narração com cache (já existe via `playTTS` + IndexedDB).
- Indicador visual de "tocando agora" (ícone animado tipo waveform pulsante).

### 2. Modo Podcast (toggle no header da conversa)
- Botão "Modo Podcast" 🎙 no header (próximo ao "Trocar tópico").
- Quando ativo:
  - Cada nova mensagem do mentor é narrada **automaticamente** assim que termina o stream.
  - Reproduz em fila — uma resposta termina, espera o usuário fazer próxima pergunta (ou seguir uma sugestão).
  - Mostra um mini-player fixo no rodapé (acima do textarea) com: título do tópico, status (tocando/pausado), botões play/pause/stop, controle de velocidade (0.9x / 1.0x / 1.15x / 1.3x).
- Ao desativar: para o áudio atual e desativa autoplay.
- Estado persiste em `localStorage` por usuário (`learn_podcast_mode`).

### 3. Player único (sem sobreposição)
- Apenas uma narração toca por vez. Iniciar nova → para a anterior automaticamente.
- Estado global no componente `Learn` (não no contexto): `currentPlayingIndex`, `playerRef`.

### 4. Tratamento do conteúdo narrado
- Antes de enviar pro TTS:
  - Remover marcadores de citação tipo `[1]`, `[2]`.
  - Remover seções "📚 Fontes:" se aparecerem.
  - Manter só o texto natural para áudio fluido.

### 5. Erro de cota mensal (`TTSCapReachedError`)
- Captura específica → toast amigável "Você atingiu o limite mensal de narrações. Volta no próximo mês ou faça upgrade."
- Desativa modo podcast automaticamente para evitar loop de erro.

## Mudanças

### A. `src/pages/Learn.tsx`

- Importar `playTTS` e `TTSCapReachedError` de `@/lib/ttsPlayer`.
- Novo estado: `podcastMode: boolean`, `playingIndex: number | null`, `playerRef: useRef<PlayTTSResult | null>`.
- `useEffect` que observa mudanças em `messages`: quando última msg é assistant + podcastMode ON + não está loading → dispara `playTTS` automaticamente.
- Função `handleToggleListen(index, text)`: para qualquer player ativo e toca o índice solicitado (ou pausa se já tocando).
- Função `cleanForTTS(text)`: regex para remover `[\d]`, blocos `📚 Fontes:.*$`, e marcações markdown leves.
- Cleanup no `useEffect` desmount: parar player ativo.

### B. Novo componente `src/components/learn/PodcastControls.tsx` (mini-player fixo)

- Props: `playing`, `paused`, `topicLabel`, `speed`, `onPlayPause`, `onStop`, `onSpeedChange`.
- Renderizado dentro do Learn, acima do textarea, somente quando `podcastMode === true`.
- Visual: card horizontal com ícone 🎙, label "Podcast: [Tradição]", controles, badge animado quando tocando.

### C. Novo componente `src/components/learn/ListenButton.tsx`

- Botão pequeno por bolha (`size="sm" variant="ghost"`).
- Mostra `Play`/`Pause` + texto "Ouvir" (ou só ícone em mobile).
- Recebe `isPlaying`, `disabled`, `onClick`.

### D. `src/lib/ttsPlayer.ts`

- Sem mudanças estruturais — `playTTS` já suporta cache, stream e `onEnded`.
- Talvez adicionar parâmetro `voiceId?` opcional no futuro (fora de escopo).

## Detalhes de UX

- **Velocidade default**: 1.15x (já é o default do edge function — ritmo natural para escuta longa).
- **Persistência de speed**: `localStorage` (`learn_podcast_speed`).
- **Acessibilidade**: `aria-label` em todos os botões ("Ouvir resposta", "Pausar narração", etc.).
- **Mobile**: mini-player full-width, controles tocáveis (44px mínimo).
- **Cache**: já existe — narrações repetidas (ex: revisitar tópico) tocam instantâneo via IndexedDB.

## Fora de escopo (fase 2)

- Download do podcast como MP3 (juntar várias respostas).
- Episódios pré-gerados ("Curso de Budismo em 5 episódios").
- Fila de tópicos sequenciais ("escutar tudo sobre Estoicismo").
- Velocidade de leitura sincronizada (highlight de palavra).
- Outras vozes / escolha de narrador.

