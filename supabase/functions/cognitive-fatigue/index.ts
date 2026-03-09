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
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY missing' }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { text, recentTexts, stressLevel, avgWordCount, avgResponseTime } = await req.json();

    const systemPrompt = `Você é um neurocientista especializado em fadiga cognitiva e análise linguística computacional.

Analise o texto do usuário buscando SINAIS DE FADIGA COGNITIVA:

**INDICADORES LINGUÍSTICOS:**
1. **Complexidade sintática** - frases mais curtas e simples indicam fadiga
2. **Repetição lexical** - repetir palavras/ideias = memória de trabalho sobrecarregada
3. **Coerência textual** - texto desconexo = atenção fragmentada
4. **Erros gramaticais/digitação** - aumento = controle motor fino prejudicado
5. **Tom emocional** - negatividade, irritabilidade, apatia
6. **Vocabulário** - redução = recursos cognitivos limitados

**DADOS CONTEXTUAIS:**
- Nível de estresse atual: ${stressLevel || 'não informado'}
- Média de palavras recentes: ${avgWordCount || 'N/A'}
- Tempo médio de resposta: ${avgResponseTime || 'N/A'}
${recentTexts ? `- Textos anteriores para comparação: ${recentTexts}` : ''}

**RESPONDA EM JSON VÁLIDO com esta estrutura:**
{
  "fatigueLevel": "low" | "moderate" | "high" | "critical",
  "fatigueScore": 0-100,
  "indicators": ["indicador1", "indicador2", ...],
  "cognitiveAreas": {
    "attention": 0-100,
    "memory": 0-100,
    "processing": 0-100,
    "emotional": 0-100
  },
  "recommendation": "recomendação específica",
  "alert": true/false,
  "alertMessage": "mensagem se alert=true"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analise este texto para fadiga cognitiva:\n\n"${text}"` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '{}';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { fatigueLevel: 'unknown', fatigueScore: 0 };

    return new Response(JSON.stringify(analysis), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Cognitive fatigue error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
