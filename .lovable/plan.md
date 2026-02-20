

# Tutorial na Landing Page + Quick Tutorial no App

## Resumo

Adicionar uma secao de tutorial visual passo-a-passo na Landing Page (hero section) e um Quick Tutorial acessivel dentro do app (botao de ajuda flutuante ou dialog).

---

## 1. Secao de Tutorial na Landing Page

**Arquivo:** `src/pages/Landing.tsx`

Adicionar uma nova secao entre o Hero e os Features com um tutorial visual de 4 passos numerados, usando cards com icones e descricoes curtas:

| Passo | Icone | Titulo (pt-BR) | Descricao |
|-------|-------|-----------------|-----------|
| 1 | SlidersHorizontal | Escolha seu caminho | Selecione sua religiao ou filosofia de vida no painel lateral |
| 2 | MessageCircle | Converse com o Sacerdote | Faca perguntas e receba orientacao personalizada por texto ou voz |
| 3 | Heart | Gere oracoes e pensamentos | Crie oracoes ou pensamentos do dia com referencias das fontes sagradas |
| 4 | CheckSquare | Pratique diariamente | Use o checklist espiritual para nutrir sua jornada interior |

Design: cards horizontais numerados com um circulo colorido "1, 2, 3, 4", titulo em negrito e descricao abaixo. Layout em grid 1x4 (desktop) ou 1x1 (mobile).

### Traducoes necessarias em `src/lib/i18n.ts`

Novas chaves para os 3 idiomas:
- `landing.tutorial_title`: "Como usar o Templo Sagrado" / "How to use Sacred Temple" / "Como usar el Templo Sagrado"
- `landing.step1_title`, `landing.step1_desc`
- `landing.step2_title`, `landing.step2_desc`
- `landing.step3_title`, `landing.step3_desc`
- `landing.step4_title`, `landing.step4_desc`

---

## 2. Quick Tutorial dentro do App

**Novo componente:** `src/components/QuickTutorial.tsx`

- Um botao flutuante com icone `HelpCircle` (lucide) no canto inferior direito (acima do BottomNav no mobile)
- Ao clicar, abre um Dialog/Drawer com os mesmos 4 passos do tutorial da Landing, mas em formato compacto
- Cada passo com icone, titulo e descricao curta
- Botao "Entendi!" para fechar
- Salva no localStorage (`tutorial_dismissed`) para nao aparecer automaticamente toda vez, mas o botao de ajuda permanece sempre visivel

**Arquivo:** `src/App.tsx`

- Importar e renderizar o `QuickTutorial` dentro do layout principal

### Traducoes adicionais em `src/lib/i18n.ts`

- `tutorial.quick_title`: "Quick Tutorial" / "Tutorial Rapido" / "Tutorial Rapido"
- `tutorial.got_it`: "Entendi!" / "Got it!" / "Entendido!"

---

## Resumo de Arquivos

| Arquivo | Mudanca |
|---------|---------|
| `src/lib/i18n.ts` | Novas chaves de traducao para tutorial (3 idiomas) |
| `src/pages/Landing.tsx` | Nova secao de tutorial com 4 passos visuais |
| `src/components/QuickTutorial.tsx` | Novo componente com botao flutuante + dialog de tutorial |
| `src/App.tsx` | Renderizar QuickTutorial no layout |

