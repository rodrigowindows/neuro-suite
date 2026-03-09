import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { note, mood, energyLevel } = await req.json();

    // Skip analysis if note is too short
    if (!note || note.trim().length < 10) {
      return new Response(
        JSON.stringify({ 
          sentiment: null,
          needsAttention: false,
          message: null
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Você é um analisador de sentimento especializado em saúde mental corporativa.
Analise o texto fornecido e retorne APENAS um JSON válido com esta estrutura exata:
{
  "sentiment": número de 0 a 100 (0=muito negativo, 100=muito positivo),
  "wellbeingLevel": "high" | "medium" | "low" | "critical",
  "concerns": array de tags ["burnout", "anxiety", "fatigue", "stress", "isolation", "overwhelm"],
  "briefFeedback": string curta (máx 60 caracteres) com feedback empático
}

Critérios:
- critical: indica risco iminente (palavras como "não aguento", "desistir", "exausto")
- low: sinais claros de sofrimento
- medium: ambivalente ou levemente negativo
- high: positivo e energizado

Retorne APENAS o JSON, sem markdown, sem explicações.`;

    const userPrompt = `Humor: ${mood}
Energia: ${energyLevel}/5
Nota: "${note}"`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exceeded' }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content?.trim() ?? '';

    // Parse JSON response
    let analysis;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      // Fallback
      analysis = {
        sentiment: 50,
        wellbeingLevel: "medium",
        concerns: [],
        briefFeedback: "Continue se cuidando! 💚"
      };
    }

    return new Response(
      JSON.stringify({
        sentiment: analysis.sentiment,
        wellbeingLevel: analysis.wellbeingLevel,
        concerns: analysis.concerns || [],
        message: analysis.briefFeedback,
        needsAttention: analysis.wellbeingLevel === 'critical' || analysis.wellbeingLevel === 'low'
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Sentiment analysis error:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
