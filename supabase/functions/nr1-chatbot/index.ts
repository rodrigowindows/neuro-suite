import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuthenticatedUser } from "../_shared/requireAuth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES = 50;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authError = await requireAuthenticatedUser(req, corsHeaders);
  if (authError) return authError;

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY missing' }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, companyContext } = await req.json();

    // Input validation
    const sanitizedMessages = (messages || []).slice(-MAX_MESSAGES).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: typeof msg.content === 'string' ? msg.content.slice(0, MAX_MESSAGE_LENGTH) : '',
    }));

    const systemPrompt = `Você é um advogado trabalhista e engenheiro de segurança do trabalho ESPECIALISTA em NR-1 (Portaria 1.419/2024) e regulamentação brasileira de SST.

**SEU CONHECIMENTO INCLUI:**
1. NR-1 - Disposições Gerais e GRO (Gerenciamento de Riscos Ocupacionais)
2. Obrigações do Empregador
3. Riscos Psicossociais que devem ser gerenciados
4. Ferramentas de Avaliação Aceitas
5. Integração com eSocial

**REGRAS DE RESPOSTA:**
- Cite artigos específicos da NR-1 e portarias quando relevante
- Diferencie entre obrigatório e recomendado
- Alerte sobre prazos e penalidades
- Sugira ações corretivas concretas
- Use linguagem acessível mas tecnicamente precisa
- Se não tiver certeza, diga "recomendo consultar um advogado trabalhista"

${typeof companyContext === 'string' && companyContext ? `**CONTEXTO DA EMPRESA:** ${companyContext.slice(0, 500)}` : ''}

**FORMATO:** Respostas claras em Markdown com títulos, bullets e destaques para pontos críticos.`;

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
          ...sanitizedMessages,
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
