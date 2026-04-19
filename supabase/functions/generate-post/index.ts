import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // TS-002c: auth obrigatória (endpoint era público).
  const { requireUser } = await import("../_shared/auth.ts");
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  try {
    const { text, networks } = await req.json();
    if (!text || !networks?.length) {
      return new Response(JSON.stringify({ error: "text and networks required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const networkInstructions = networks.map((net: string) => {
      switch (net) {
        case 'x': return 'X (Twitter): max 280 characters, 2-3 relevant hashtags, concise and impactful.';
        case 'instagram': return 'Instagram: longer text with emojis, 5-10 hashtags at the end, inspirational tone.';
        case 'tiktok': return 'TikTok: short punchy text, viral hashtags, engaging hook.';
        case 'facebook': return 'Facebook: medium length, conversational tone, 2-3 hashtags.';
        default: return '';
      }
    }).filter(Boolean).join('\n');

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
            content: `You are a social media content creator for a spiritual/religious context. Given a text from a spiritual conversation, create posts formatted for specific social networks. Keep the spiritual tone respectful and inspirational. Respond ONLY with a JSON object in this exact format: {"posts": [{"network": "network_id", "content": "post text"}]}. Do not include markdown formatting or code blocks.`
          },
          {
            role: "user",
            content: `Create posts for these networks based on the following spiritual text:\n\nText: "${text}"\n\nNetworks and format requirements:\n${networkInstructions}\n\nReturn JSON with posts array.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "format_posts",
              description: "Return formatted social media posts",
              parameters: {
                type: "object",
                properties: {
                  posts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        network: { type: "string", enum: ["x", "instagram", "tiktok", "facebook"] },
                        content: { type: "string" }
                      },
                      required: ["network", "content"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["posts"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "format_posts" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try parsing content directly
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return new Response(jsonMatch[0], {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Could not parse AI response");
  } catch (e) {
    console.error("generate-post error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
