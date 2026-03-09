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

    const { stressLevel, hrvValue, lastBreakMinutesAgo, meetingMinutesToday, mood, energyLevel, timeOfDay } = await req.json();

    const systemPrompt = `Você é um especialista em cronobiologia, neurociência e recuperação cognitiva.

Baseado nos dados biométricos e contextuais do usuário, sugira micro-pausas PERSONALIZADAS e CIENTIFICAMENTE EMBASADAS.

**DADOS DO USUÁRIO:**
- Estresse: ${stressLevel || 'não informado'}
- HRV (RMSSD): ${hrvValue || 'N/A'}ms
- Última pausa há: ${lastBreakMinutesAgo || 'N/A'} minutos
- Reuniões hoje: ${meetingMinutesToday || 0} minutos
- Humor: ${mood || 'N/A'}
- Energia (1-5): ${energyLevel || 'N/A'}
- Período do dia: ${timeOfDay || 'N/A'}

**REGRAS CIENTÍFICAS:**
1. HRV < 30ms → pausa de recuperação URGENTE (respiração vagal)
2. > 90min sem pausa → técnica Pomodoro estendida
3. Após reuniões longas → exercício de grounding
4. Estresse alto → técnica 4-7-8 ou box breathing
5. Energia baixa manhã → microexercício + luz natural
6. Energia baixa tarde → power nap ou cold exposure

**RESPONDA EM JSON VÁLIDO:**
{
  "urgency": "low" | "medium" | "high" | "critical",
  "suggestedBreaks": [
    {
      "name": "nome da técnica",
      "duration": "X minutos",
      "type": "breathing" | "movement" | "sensory" | "meditation" | "social",
      "instructions": ["passo 1", "passo 2", ...],
      "science": "base científica breve",
      "expectedBenefit": "benefício esperado"
    }
  ],
  "nextBreakIn": "X minutos",
  "dailyBreakPlan": "plano resumido para o resto do dia",
  "warning": "alerta se necessário ou null"
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
          { role: "user", content: "Gere recomendações de pausas personalizadas para agora." },
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
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : { urgency: 'low', suggestedBreaks: [] };

    return new Response(JSON.stringify(suggestions), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Smart breaks error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
