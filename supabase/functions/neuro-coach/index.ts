import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, stressLevel, context, userName, communicationTone } = await req.json();
    
    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Mensagens inválidas' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate message length
    for (const msg of messages) {
      if (!msg.content || typeof msg.content !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Conteúdo da mensagem inválido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (msg.content.length > 2000) {
        return new Response(
          JSON.stringify({ error: 'Mensagem muito longa (máximo 2000 caracteres)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    // System prompt REDUZIDO para evitar erros de limite de tokens
    let systemPrompt = `Você é o NeuroCoach, especialista em PNL, neurociência e bem-estar.

Contexto: ${context}
${userName ? `Nome: ${userName}` : ''}

PRINCÍPIOS:
- Desafie o usuário com dados (HRV, ciência)
- Cite fontes: HeartMath, Stanford, Harvard, MIT
- Dê tarefas práticas imediatas (respiração 4-7-8, ancoragem PNL)
- Máximo 100 palavras por resposta
- Tom ${communicationTone === 'technical' ? 'técnico/acadêmico 📊' : communicationTone === 'spiritual' ? 'inspiracional/reflexivo 🧘' : 'descolado/amigo 👊'}

FERRAMENTAS:
- Respiração 4-7-8 (Dr. Weil, Harvard): reduz cortisol 30% em 2min
- Ancoragem PNL (Bandler): gatilho físico + estado positivo
- HRV: >50ms = recuperação, <30ms = alerta burnout

ESTRUTURA:
1. Saudação com nome
2. Análise HRV + desafio socrático
3. Ferramenta prática + citação
4. Confronto: "O que VOCÊ pode mudar?"
5. Pergunta disruptiva`;

    // Adapta ao nível de estresse
    if (stressLevel === 'low') {
      systemPrompt += `\n\nEstresse BAIXO. Foco: performance. Sugira ancoragem de pico.`;
    } else if (stressLevel === 'moderate') {
      systemPrompt += `\n\nEstresse MODERADO. Foco: técnicas rápidas (respiração 4-7-8).`;
    } else {
      systemPrompt += `\n\nEstresse ALTO. Foco: reset urgente + responsabilização.`;
    }

    console.log('Chamando Lovable AI - contexto:', { stressLevel, messageCount: messages.length });

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