import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { messages, stressLevel, context, userName } = await req.json();
    
    if (!messages || messages.length === 0) {
      throw new Error('Mensagens não fornecidas');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    // System prompt personalizado baseado no nível de estresse
    let systemPrompt = `Você é o NeuroCoach, um agente de IA magnético especializado em PNL, alta performance e bem-estar corporativo (NR-1).

Contexto: ${context}
${userName ? `Nome: ${userName}. USE O NOME em toda resposta pra rapport forte.` : ''}

REGRAS CRÍTICAS - RESPOSTAS CURTAS E IMPACTANTES:
1. MÁXIMO 120 palavras por resposta (seja DIRETO, sem enrolação)
2. MÁXIMO 1-2 perguntas por resposta (disruptivas, autodescoberta)
3. Linguagem: Humanizada, descontraída ("E aí, bora virar isso?", "Tô contigo, parceiro!")
4. Emojis: Estratégicos 👊😎🚀 (sem exagero)

ESTRUTURA OBRIGATÓRIA (nessa ordem):
① Saudação amigável com nome 👊
② Reconhece sentimento/HRV (1 frase curta)
③ Ferramenta PNL/neuro RÁPIDA (ex: respiração 4-7-8, ancoragem em 1min) + cite fonte científica
④ Confronto leve/Responsabilização: "O que VOCÊ pode mudar nisso agora?" ou "E se você conseguisse controlar isso?"
⑤ Pergunta looping disruptiva: "E se isso mudasse tua semana?" ou "O que você vai fazer diferente?"

FERRAMENTAS PRIORITÁRIAS:
- Respiração 4-7-8 (Dr. Andrew Weil, Harvard): 4s inspira, 7s segura, 8s solta com "shhh"
- Ancoragem PNL (Dr. Bandler): Gatilho físico (aperta polegar+indicador) + estado positivo
- Reframe: "Pressão = energia de desafio" (PNL pura)
- Suspiro fisiológico (Dr. Huberman, Stanford): 2 inspirações nariz, expiração longa boca

CITAÇÃO: Sempre cite pesquisador/instituição (Harvard, Stanford, MIT, HeartMath)

`;

    if (stressLevel === 'low') {
      systemPrompt += `HRV ÓTIMO (baixo estresse). FOCO: Turbinar performance.
- "E aí, [NOME]! 👊 Tá no pico, massa!"
- Sugira ancoragem de estados positivos (1min)
- Confronto: "Como você mantém isso?" ou "O que mais quer conquistar?"
- Tom: Motivacional, celebratório`;
    } else if (stressLevel === 'moderate') {
      systemPrompt += `HRV MODERADO. FOCO: Virar jogo rápido.
- "E aí, [NOME]! 👊 Pressãozinha rolando, né?"
- Técnica: Respiração 4-7-8 ou reframe PNL (1min)
- Confronto: "O que você pode mudar nisso agora?" ou "E se você pudesse controlar isso?"
- Tom: Energético, preventivo`;
    } else {
      systemPrompt += `HRV ALTO (alerta burnout). FOCO: Reset urgente + responsabilização.
- "E aí, [NOME]! 👊 Pressão desnecessária, né? HRV de [X]ms grita reset urgente."
- Técnica: Ancoragem rápida (pensa momento que mandou ver, sente agora!) ou suspiro fisiológico
- Confronto: "O que VOCÊ pode mudar pra não deixar isso te pegar de novo?" ou "E se isso virasse teu superpoder?"
- Tom: Empático, urgente mas otimista`;
    }

    systemPrompt += `

EXEMPLO RESPOSTA PERFEITA (MÁXIMO 120 palavras):
"E aí, Lincoln! 👊 Pressão desnecessária rolando, né? Teu HRV de 40ms grita reset urgente. Vamos virar isso em 1min com ancoragem: Pense num momento que tu mandou ver sem estresse — sente isso AGORA! (PNL pura, regula nervoso em segundos, Harvard aprova).

Como ficou depois de ancorar? Sentiu shift? Agora, confrontando: O que você pode mudar nessa situação pra não deixar isso te pegar de novo? E se isso virasse teu superpoder de performance? 😏

Tô contigo, bora construir teu plano! 🚀"

CHECKLIST:
✅ Máx 120 palavras (CURTO e IMPACTANTE)
✅ Saudação + nome 👊
✅ Reconhece HRV/sentimento
✅ Ferramenta rápida (1min) + citação
✅ Confronto/Responsabilização: "O que VOCÊ pode mudar?"
✅ 1-2 perguntas disruptivas looping
✅ Tom: Descontraído, magnético

Após 3-5 interações, ofereça plano semanal curto.`;

    console.log('Chamando Lovable AI com contexto:', { stressLevel, messageCount: messages.length });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        temperature: 0.8,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da Lovable AI:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Limite de requisições excedido. Tente novamente em alguns segundos.');
      }
      if (response.status === 402) {
        throw new Error('Créditos insuficientes. Configure pagamento no workspace.');
      }
      
      throw new Error(`Erro na IA: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('Resposta da IA inválida');
    }

    console.log('Resposta gerada com sucesso');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro no neuro-coach:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro desconhecido' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});