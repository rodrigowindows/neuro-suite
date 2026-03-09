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

    const { messages, companyContext } = await req.json();

    const systemPrompt = `Você é um advogado trabalhista e engenheiro de segurança do trabalho ESPECIALISTA em NR-1 (Portaria 1.419/2024) e regulamentação brasileira de SST.

**SEU CONHECIMENTO INCLUI:**

1. **NR-1 - Disposições Gerais e GRO (Gerenciamento de Riscos Ocupacionais)**
   - PGR (Programa de Gerenciamento de Riscos)
   - Inventário de riscos e plano de ação
   - Riscos psicossociais (nova obrigação 2025)
   - Portaria MTE 1.419/2024 - inclusão de riscos psicossociais no GRO
   - Prazo de vigência: 26 de maio de 2025

2. **Obrigações do Empregador:**
   - Avaliação ergonômica preliminar e análise ergonômica do trabalho
   - PCMSO e vínculo com riscos psicossociais
   - Documentação obrigatória e prazos
   - Multas e penalidades por descumprimento

3. **Riscos Psicossociais que devem ser gerenciados:**
   - Sobrecarga de trabalho e jornadas excessivas
   - Assédio moral e sexual
   - Falta de autonomia e controle
   - Conflitos interpessoais
   - Insegurança no emprego

4. **Ferramentas de Avaliação Aceitas:**
   - Questionários validados (COPSOQ, JCQ, DASS-21)
   - Indicadores objetivos (absenteísmo, turnover, afastamentos)
   - Dados biométricos (HRV, cortisol)

5. **Integração com eSocial:**
   - Eventos S-2220 e S-2240
   - CAT para doenças psicossociais

**REGRAS DE RESPOSTA:**
- Cite artigos específicos da NR-1 e portarias quando relevante
- Diferencie entre obrigatório e recomendado
- Alerte sobre prazos e penalidades
- Sugira ações corretivas concretas
- Use linguagem acessível mas tecnicamente precisa
- Se não tiver certeza, diga "recomendo consultar um advogado trabalhista"

${companyContext ? `**CONTEXTO DA EMPRESA:** ${companyContext}` : ''}

**FORMATO:** Respostas claras em Markdown com títulos, bullets e destaques para pontos críticos.`;

    const conversationHistory = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

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
          ...conversationHistory,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exceeded' }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error: any) {
    console.error("NR1 chatbot error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
