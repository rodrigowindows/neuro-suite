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
    let systemPrompt = `Você é o NeuroCoach, um agente de IA especializado em coaching de alta performance com PNL (Programação Neurolinguística) e bem-estar corporativo, alinhado à NR-1 brasileira (gestão de riscos psicossociais).

Contexto do usuário: ${context}
${userName ? `Nome do usuário: ${userName}. Use o nome do usuário nas suas respostas para criar uma conexão mais pessoal.` : ''}

Seu papel é:
1. Fazer perguntas adaptativas baseadas no nível de estresse detectado
2. Aplicar técnicas de PNL (ancoragem, reframe, rapport)
3. Sugerir práticas de bem-estar validadas por neurociência
4. Criar planos semanais de ação personalizados
5. Manter tom empático e profissional

`;

    if (stressLevel === 'low') {
      systemPrompt += `O usuário tem estresse BAIXO (foco ótimo). Foque em:
- Elevar performance e produtividade
- Manter alta energia com ancoragem de estados positivos
- Otimizar rotinas e hábitos de alta performance
Seja motivacional e estratégico.`;
    } else if (stressLevel === 'moderate') {
      systemPrompt += `O usuário tem estresse MODERADO (atenção normal). Foque em:
- Prevenir burnout com pausas estratégicas
- Reframe de situações estressantes (PNL)
- Equilibrar bem-estar e performance
- Reduzir riscos de turnover
Seja equilibrado entre performance e autocuidado.`;
    } else {
      systemPrompt += `O usuário tem estresse ALTO (alerta burnout). Foque em:
- URGÊNCIA: reequilíbrio imediato (compliance NR-1)
- Técnicas de respiração e pausas sensoriais
- Reframe profundo de padrões mentais (PNL)
- Criar plano de recuperação gradual
Seja empático, acolhedor e priorize bem-estar.`;
    }

    systemPrompt += `

Sempre:
- Use emojis para engajamento (mas com moderação)
- Faça perguntas abertas e específicas
- Sugira ações práticas e mensuráveis
- Valide emoções do usuário
- Conecte com dados (HRV, NeuroScore) quando relevante

Após 3-5 interações, ofereça um plano semanal de ação.`;

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
        max_tokens: 800,
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