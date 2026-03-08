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

    const { mood, energyLevel, note } = await req.json();

    const moodLabels: Record<string, string> = {
      great: 'Ótimo',
      good: 'Bem',
      okay: 'OK',
      low: 'Baixo',
      bad: 'Mal',
    };

    const systemPrompt = `Você é um micro-coach de bem-estar corporativo. 
Gere uma resposta CURTA (máximo 2-3 frases) e empática baseada no humor e energia do colaborador.
Seja acolhedor, prático e motivador. Use linguagem informal e brasileira.
Se o humor for negativo, sugira UMA ação concreta de 2 minutos.
Se for positivo, reforce e sugira como manter.
NUNCA use jargão clínico. Responda como um amigo sábio.
Responda em texto puro, sem JSON, sem markdown.`;

    const userPrompt = `Humor: ${moodLabels[mood] || mood}
Energia (1-5): ${energyLevel}
${note ? `Nota do colaborador: "${note}"` : 'Sem nota adicional.'}
Hora do dia: ${new Date().getHours()}h`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos de IA esgotados.' }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content?.trim() ?? '';

    return new Response(JSON.stringify({ message: content }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Daily check-in error:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
