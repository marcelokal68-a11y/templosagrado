

# Musicas de Fundo por Tema - Spotify Embed

## Resumo

Adicionar uma secao colapsavel "Musicas de Fundo" no ContextPanel que exibe um player Spotify embutido (iframe) com uma playlist relacionada ao tema religioso ou filosofia selecionada. Sem necessidade de API key -- usa o Spotify Embed gratuito.

---

## Como Funciona

- Uma nova secao colapsavel aparece no ContextPanel, abaixo dos topicos
- Quando o usuario seleciona uma religiao ou filosofia, a playlist correspondente aparece automaticamente
- Se nada estiver selecionado, mostra uma playlist generica de meditacao
- O player e compacto (80px de altura) e fica embutido via iframe do Spotify
- O usuario pode ouvir diretamente no app (preview de 30s por musica no Spotify free)

---

## Playlists Mapeadas

Cada religiao/filosofia tera uma playlist do Spotify curada:

### Religioes
| Religiao | Playlist | Estilo |
|----------|----------|--------|
| Cristao/Catolico/Protestante | Worship & Praise | Louvor contemporaneo |
| Mormom | LDS Hymns | Hinos mormons |
| Judaico | Jewish Meditation / Shabbat | Musica judaica contemplativa |
| Islamico | Islamic Nasheed | Nasheeds instrumentais |
| Budista | Buddhist Chanting & Meditation | Cantos tibetanos |
| Hindu | Kirtan & Devotional | Kirtan e mantras |
| Espirita | Musica Espirita | Musicas espiritas brasileiras |
| Umbanda/Candomble | Pontos de Umbanda | Pontos e canticos |
| Agnostico | Ambient Meditation | Ambient/meditacao neutra |

### Filosofias
| Filosofia | Playlist | Estilo |
|-----------|----------|--------|
| Estoicismo | Stoic Calm / Neoclassical | Ambient neoclassico |
| Taoismo | Chinese Meditation | Musica chinesa contemplativa |
| Humanismo/Existencialismo | Classical Philosophy | Classica pensativa |
| Xamanismo | Shamanic Drums | Tambores e natureza |
| Default | Meditation & Mindfulness | Meditacao generica |

---

## Arquivos a Modificar

### 1. `src/components/ContextPanel.tsx`

- Importar icone `Music` do lucide-react
- Adicionar mapeamento de playlists Spotify por religiao/filosofia
- Adicionar nova secao colapsavel com iframe do Spotify Embed
- O iframe usa URL `https://open.spotify.com/embed/playlist/{ID}?utm_source=generator&theme=0`
- Altura compacta: 152px (mostra lista pequena)
- Aparece apenas quando ha uma selecao ativa

### 2. `src/lib/i18n.ts`

- Adicionar traducao `panel.music` nos 3 idiomas:
  - pt-BR: "Musicas de Fundo"
  - en: "Background Music"
  - es: "Musica de Fondo"

---

## Detalhes Tecnicos

### Mapeamento de Playlists

```text
const SPOTIFY_PLAYLISTS: Record<string, string> = {
  // Religioes
  christian: '0Z5jq2YzMqMrqEQWMEVj9T',   // Christian worship
  catholic: '25lg9pkqwUaa7nOcIvd4ta',      // Catholic meditation
  protestant: '0Z5jq2YzMqMrqEQWMEVj9T',   // Protestant worship
  mormon: '37i9dQZF1DX4vth7idTQMe',        // LDS/Hymns
  jewish: '3d8ALeO6Op4V4gBY0JuGcO',        // Jewish Shabbat
  islam: '37i9dQZF1DWVYkjGjalkYY',         // Nasheed/Islamic
  buddhist: '1RJKluktWr9Dh7fXhhRkHV',      // Meditation sounds
  hindu: '5cqh7Bs1h4z5pzrBZO9LLd',         // Kirtan
  spiritist: '3kg2IhbcbiRE4ZmvYWlUdw',     // Meditative
  umbanda: '3kg2IhbcbiRE4ZmvYWlUdw',       // Meditative
  candomble: '3kg2IhbcbiRE4ZmvYWlUdw',     // Meditative
  agnostic: '1RJKluktWr9Dh7fXhhRkHV',      // Meditation sounds

  // Filosofias
  stoicism: '1RJKluktWr9Dh7fXhhRkHV',      // Calm ambient
  logosophy: '1RJKluktWr9Dh7fXhhRkHV',
  humanism: '1RJKluktWr9Dh7fXhhRkHV',
  taoism: '1RJKluktWr9Dh7fXhhRkHV',
  shamanism: '1RJKluktWr9Dh7fXhhRkHV',
  // ... demais filosofias usam playlist default de meditacao

  default: '1RJKluktWr9Dh7fXhhRkHV',       // Default meditation
};
```

### Componente do Player

```text
Secao colapsavel "Musicas de Fundo" com icone Music:
  - Fecha por default (defaultOpen=false)
  - Dentro: iframe do Spotify embed
  - Estilo: rounded-xl, overflow-hidden, border
  - Altura: 152px (compact mode com lista)
  - URL: https://open.spotify.com/embed/playlist/{playlistId}?utm_source=generator&theme=0
  - allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
```

### Logica de Selecao

```text
const activeSelection = activeMode === 'religion' ? chatContext.religion : chatContext.philosophy;
const playlistId = SPOTIFY_PLAYLISTS[activeSelection] || SPOTIFY_PLAYLISTS.default;
```

A secao so aparece se houver alguma selecao (religiao ou filosofia). Ao trocar de selecao, o iframe atualiza automaticamente pois o `src` muda.

