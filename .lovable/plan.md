# Plano: Navegacao Lateral + Versiculo Personalizado por Religiao

## Problemas Identificados

1. **Email sobrepondo as abas no header** - O email do usuario logado empurra/sobrepoe os botoes de navegacao no desktop
2. **Navegacao horizontal dificulta a navegabilidade** - Muitas abas no header causam overflow
3. **Versiculo do Dia generico** - O edge function `verse-of-day` usa um prompt simples que nao diferencia por religiao (ex: para judeus deveria ser a Parasha com Talmud/Mishna/Guemara, como ja feito no `daily-practice`)
4. **Duplicidade de codigo** - O `verse-of-day` reimplementa logica que ja existe no `daily-practice` (que ja tem prompts detalhados por religiao)

## Solucao

### 1. Sidebar Lateral para Navegacao (Desktop)

Mover a navegacao do header para uma sidebar lateral no desktop, eliminando o problema de overflow e do email sobrepondo as abas.

- **Header simplificado**: Apenas logo + seletor de idioma + email/logout (sem abas)
- **Sidebar lateral esquerda**: Com icones e labels das abas (Chat, Precos, Post, Oracoes, Versiculo, Praticando, Mural)
- Sidebar colapsavel (icones apenas quando fechada, icones + labels quando aberta)
- **Mobile**: Mantem o BottomNav atual (sem mudanca)

### 2. Versiculo do Dia: Reutilizar Prompts do `daily-practice`

Em vez de manter dois edge functions com prompts duplicados, o `verse-of-day` sera reescrito para usar os mesmos prompts detalhados que ja existem no `daily-practice`:

- **Judeus**: Parasha da semana com explicacoes do Talmud Bavli, Mishna e Guemara. Falar de kaballah a cada output, com grande destaque e rferencias. 
- **Catolicos**: Leitura liturgica do dia com Patristica
- **Protestantes**: Devocional biblico com exegese
- **Islamicos**: Sura com Tafsir de Ibn Kathir
- **Budistas**: Sutra com comentarios de mestres
- **Hindus**: Verso do Bhagavad Gita com comentario de Shankaracharya
- **Espiritas**: Evangelho Segundo o Espiritismo
- **Umbanda/Candomble**: Ensinamento dos Orixas
- **Mormons**: Livro de Mormon
- **Agnosticos**: Reflexao filosofica

O formato do versiculo sera o mesmo JSON rico: `{title, reference, explanation, reflection, sources, scholarly_note}`

### 3. Pagina Verse Atualizada

A pagina de Versiculo do Dia exibira o conteudo rico (titulo, referencia, explicacao, reflexao, fontes) em vez de apenas texto simples. Reutilizara o mesmo layout de cards do `Practice`.

## Detalhes Tecnicos

### Arquivos a criar:

- `src/components/AppSidebar.tsx` - Sidebar lateral com navegacao

### Arquivos a modificar:

- `src/App.tsx` - Envolver com SidebarProvider, adicionar AppSidebar
- `src/components/Header.tsx` - Remover nav items do header desktop, simplificar
- `supabase/functions/verse-of-day/index.ts` - Reescrever para usar prompts detalhados por religiao (extraidos do `daily-practice`), retornando JSON rico
- `src/pages/Verse.tsx` - Exibir conteudo rico (titulo, referencia, explicacao, reflexao, fontes, nota academica) com cards, em vez de blockquote simples

### Arquivos SEM mudanca:

- `src/components/BottomNav.tsx` - Mantem igual (mobile)
- `supabase/functions/daily-practice/index.ts` - Mantem igual (referencia para os prompts)

### Fluxo da Sidebar:

```text
+----------+-----------------------------+
| Sidebar  |  Conteudo da pagina         |
| (lateral)|                             |
|          |                             |
| Chat     |                             |
| Precos   |                             |
| Post     |                             |
| Oracoes  |                             |
| Versiculo|                             |
| Praticando                             |
| Mural    |                             |
|          |                             |
+----------+-----------------------------+
```

### Estrutura do JSON retornado pelo `verse-of-day` atualizado:

```text
{
  "title": "Nome da parasha / leitura / sura",
  "reference": "Referencia sagrada exata",
  "explanation": "Explicacao detalhada 5-8 linhas",
  "reflection": "Reflexao pratica 2-3 linhas",
  "sources": "Fontes consultadas",
  "scholarly_note": "Nota academica"
}
```