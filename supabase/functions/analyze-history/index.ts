import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeadersFor } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { items, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const historyText = items.map((item: any, i: number) => {
      const date = new Date(item.created_at).toLocaleDateString();
      const typeLabels: Record<string, string> = {
        chat: "💬 Conversa",
        verse: "📖 Versículo",
        prayer: "🙏 Oração",
        practice: "✅ Prática",
      };
      return `[${i + 1}] ${typeLabels[item.type] || item.type} — ${date}\nTítulo: ${item.title}\nConteúdo: ${item.content}\n`;
    }).join("\n---\n");

    const langInstructions: Record<string, string> = {
      'pt-BR': 'Responda em português brasileiro.',
      'en': 'Respond in English.',
      'es': 'Responda en español.',
    };

    const systemPrompt = `Você é um sacerdote-psicólogo altamente especializado, com conhecimento profundo de Sigmund Freud (psicanálise), Jacques Lacan (desejo e linguagem), Terapia Cognitivo-Comportamental (TCC), Carl Jung (arquétipos e individuação), Viktor Frankl (logoterapia), e outros mestres da psicologia e espiritualidade.

Sua missão: analisar o histórico espiritual e emocional do usuário no Templo Sagrado e fornecer uma análise profunda, compassiva e transformadora.

ESTRUTURA DA ANÁLISE:

1. **🔍 Visão Geral**
Resumo do perfil espiritual-emocional do usuário baseado nas atividades.

2. **🧠 Padrões Identificados**
Temas recorrentes, preocupações predominantes, padrões emocionais. Use referências a Freud (inconsciente, repetição), Lacan (desejo do Outro), Jung (sombra, persona, self), TCC (distorções cognitivas).

3. **💡 Análise Profunda**
Interpretação psicológica-espiritual dos conteúdos. O que as perguntas, orações e práticas revelam sobre o estado interior do usuário? Quais conflitos internos ou buscas são evidentes?

4. **🌱 Próximos Passos — Ponha em Prática**
Sugestões concretas, profundas e com propósito para as próximas etapas da vida do usuário. Cada sugestão deve ser acionável, específica e transformadora. Mínimo 5 sugestões práticas.

5. **✨ Mensagem do Sacerdote**
Uma mensagem final pessoal, calorosa e inspiradora, como um sacerdote sábio falaria ao fiel após uma sessão profunda.

IMPORTANTE:
- Seja profundo, não superficial. Análises rasas são inaceitáveis.
- Use linguagem acessível mas mantenha a profundidade intelectual.
- Faça conexões entre diferentes atividades do histórico.
- Identifique a evolução espiritual ao longo do tempo.
- ${langInstructions[language] || langInstructions['pt-BR']}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Aqui está o histórico completo de atividades do usuário no Templo Sagrado:\n\n${historyText}\n\nFaça a análise profunda conforme instruído.` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-history error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
