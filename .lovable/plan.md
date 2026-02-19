# Templo Sagrado — Templo Virtual Multi-Religioso

## Visão Geral

App de chatbot espiritual multi-religioso com IA, inspirado no estilo "ChatWithGod". O sacerdote virtual responde com base nos livros sagrados de todas as religiões. Interface em múltiplos idiomas, com monetização via Stripe + PIX.

---

## Páginas e Funcionalidades

### 1. Página Principal — Chat com o Sacerdote

- **Layout dividido**: Chat à esquerda, painel de contexto à direita (como na referência)
- **Painel direito com:**
  - **Perguntas recomendadas** — sugestões clicáveis baseadas na religião selecionada
  - **Afiliação religiosa** (escolha uma): Cristão, Hindu, Budista, Islã, Mórmon, Protestante, Católico, Judeu, Agnóstico, Espírita, Umbanda, Candomblé
  - **O que preciso hoje**: Inspiração, Geral, Versículo, Confissão, Comunhão, Conforto, Oração
  - **Mood do fiel**: Feliz, Otimista, Indiferente, Triste, Ansioso, Pessimista, Com raiva, Confuso, Espiritual
  - **Tópicos de discussão**: Jesus, Inferno, Céu, Futuro, Falecidos, Animais, Carreira, Saúde, Finanças, Relacionamento, Família, Política, Sacrifícios, Outros (campo aberto)
- As seleções do painel direito influenciam o contexto enviado à IA
- Contador de perguntas gratuitas restantes na parte inferior
- Design dourado/âmbar como na referência

### 2. Chatbot com IA (Lovable AI)

- Edge function conectada ao Lovable AI Gateway
- System prompt como "Grande Sacerdote" com conhecimento profundo dos livros sagrados de cada religião
- Respostas contextualizadas pela religião, mood, necessidade e tópico selecionados
- Streaming de respostas token a token
- Citações de textos sagrados relevantes (Bíblia, Alcorão, Torah, Vedas, Tripitaka, Livro de Mórmon, etc.). Nunca misture religiões. Procure na web esses livros sagrados, em pdf para download e faça upload para a base de conhecimento do app. 

### 3. Navegação Superior

- Chat, Preços, Enviar Orações, Versículo do Dia, Login

### 4. Página de Preços

- **Plano Gratuito**: 10 perguntas grátis
- **Plano Mensal**: R$10/mês por 30 perguntas
- Integração com Stripe para pagamento com cartão
- Nota sobre PIX (será adicionado posteriormente via integração manual ou gateway brasileiro)

### 5. Autenticação

- Login/cadastro com email e senha
- Controle de perguntas por usuário (10 grátis, depois precisa assinar)

### 6. Multi-idioma

- Suporte inicial: Português (BR), Inglês, Espanhol
- Seletor de idioma no header
- Textos da interface traduzidos; respostas da IA no idioma selecionado

### 7. Versículo do Dia

- Página com versículo/passagem diária gerada pela IA baseada na religião do usuário

### 8. Enviar Orações

- Formulário simples para o usuário enviar uma intenção de oração

---

## Backend (Lovable Cloud)

- **Database**: tabelas para usuários, contagem de perguntas, orações enviadas
- **Auth**: autenticação com email/senha
- **Edge Functions**: chatbot IA, versículo do dia
- **Stripe**: assinatura mensal R$10

## Design

- Paleta dourada/âmbar com fundo branco, inspirada na referência
- Cards com bordas suaves, botões com estilo chip/tag para seleções
- Ícones espirituais sutis
- Responsivo mobile e desktop