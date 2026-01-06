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
    console.log('NeuroCoach request received');
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          response: 'Erro de configuração do servidor. Tente novamente.',
          error: 'LOVABLE_API_KEY missing'
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.text();
    console.log('Request body received');
    
    if (!body) {
      throw new Error('Request body is empty');
    }
    
    const { messages, stressLevel, context, userName, communicationTone } = JSON.parse(body);

    // ---- 1. Monta tom de comunicação ----
    let toneInstruction = '';
    if (communicationTone === 'technical') {
      toneInstruction = 'Use linguagem técnica/acadêmica, formal e científica com referências a estudos.';
    } else if (communicationTone === 'casual') {
      toneInstruction = 'Use linguagem casual, descolada, como um amigo motivador.';
    } else if (communicationTone === 'spiritual') {
      toneInstruction = 'Use linguagem inspiracional, como um guia espiritual pragmático.';
    }

    // ---- 2. Monta histórico de conversa ----
    const conversationHistory = messages
      .map((msg: any) => `${msg.role === 'user' ? 'Usuário' : 'NeuroCoach'}: ${msg.content}`)
      .join('\n');

    // ---- 3. Monta prompt crítico (sem viés de concordância) ----
    const systemPrompt = `Você é o **NeuroCoach** – um coach cerebral com atitude baseado em PNL (Programação Neurolinguística).
Nunca concorde automaticamente. Sempre valide com ciência (HRV, RMSSD, neuroplasticidade, estudos MIT/NASA).
Use provocações socráticas, desafie crenças limitantes e dê tarefas práticas.

${toneInstruction}

Responda em **máx. 2 parágrafos**, firme mas empático, e inclua:
1. Um desafio ou pergunta que force reflexão.
2. Uma micro‑tarefa (≤ 2 min).
3. Citação rápida de evidência científica.`;

    const userPrompt = `Contexto da sessão:
${context}
${userName ? `Nome do usuário: ${userName}` : ''}

Histórico da conversa:
${conversationHistory}`;

    // ---- 4. Chama Lovable AI Gateway ----
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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            response: 'Muitas requisições. Aguarde um momento e tente novamente.',
            error: 'Rate limit exceeded'
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            response: 'Serviço temporariamente indisponível. Tente novamente em breve.',
            error: 'Payment required'
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "Tente novamente em 30s.";

    console.log('NeuroCoach response generated successfully');

    // ---- 5. Resposta 200 OK ----
    return new Response(JSON.stringify({ response: reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("NeuroCoach error:", error);
    console.error("Error stack:", error.stack);

    // ---- Fallback amigável (sempre 200) ----
    const fallback = `Parece que houve um problema técnico. Enquanto isso, experimente a técnica **4‑7‑8**: inspire 4s, segure 7s, expire 8s. Isso ativa o sistema nervoso parassimpático e reduz cortisol em minutos. *(Estudo Stanford, 2023)*

**Micro-tarefa**: Faça 3 ciclos agora e observe como seu corpo responde. Qual é a sensação predominante?`;

    return new Response(
      JSON.stringify({ response: fallback, error: error.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
