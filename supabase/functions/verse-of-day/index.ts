import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { religion, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langMap: Record<string, string> = { 'pt-BR': 'Brazilian Portuguese', 'en': 'English', 'es': 'Spanish' };
    const responseLang = langMap[language] || 'Brazilian Portuguese';

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a sacred verse selector. Return ONLY a meaningful verse or passage from the sacred texts of the ${religion || 'christian'} tradition. Include the source citation. Respond in ${responseLang}. Format: the verse text followed by a line break and the citation (e.g., "— Bible, John 3:16"). Keep it under 200 words.`,
          },
          { role: "user", content: "Give me an inspiring verse for today." },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ verse: "Unable to fetch verse" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const verse = data.choices?.[0]?.message?.content || "No verse available";

    return new Response(JSON.stringify({ verse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("verse error:", e);
    return new Response(JSON.stringify({ verse: "Error fetching verse" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
