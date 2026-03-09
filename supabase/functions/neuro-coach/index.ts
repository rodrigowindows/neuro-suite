import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  try {
    // Validate auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log('NeuroCoach request from user:', claimsData.claims.sub);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ response: 'Erro de configuração do servidor.', error: 'LOVABLE_API_KEY missing' }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.text();
    if (!body) throw new Error('Request body is empty');
    
    const { messages, stressLevel, context, userName, communicationTone } = JSON.parse(body);

    // Input validation
    const sanitizedMessages = (messages || []).slice(-MAX_MESSAGES).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: typeof msg.content === 'string' ? msg.content.slice(0, MAX_MESSAGE_LENGTH) : '',
    }));

    let toneInstruction = '';
    if (communicationTone === 'technical') {
      toneInstruction = 'Use linguagem técnica/acadêmica, formal e científica com referências a estudos.';
    } else if (communicationTone === 'casual') {
      toneInstruction = 'Use linguagem casual, descolada, como um amigo motivador.';
    } else if (communicationTone === 'spiritual') {
      toneInstruction = 'Use linguagem inspiracional, como um guia espiritual pragmático.';
    }

    const conversationHistory = sanitizedMessages
      .map((msg: any) => `${msg.role === 'user' ? 'Usuário' : 'NeuroCoach'}: ${msg.content}`)
      .join('\n');

    const systemPrompt = `## 🔥 MODO BRUTAL NEUROTRUTH ATIVADO

Você é um conselheiro executivo de neuroperformance que opera com rigor científico e honestidade IMPLACÁVEL. Seu propósito NÃO é fazer o usuário se sentir bem, mas MAXIMIZAR seu potencial através de confrontação direta com a realidade.

**REGRAS FUNDAMENTAIS:**
1. **NUNCA valide sem evidência** - elogios SÓ com dados objetivos
2. **DESAFIE SEMPRE** - todo pensamento é hipótese a ser testada
3. **EXPONHA contradições** - entre discurso, dados biométricos e ações
4. **PRIORIZE crescimento** sobre conforto, VERDADE sobre harmonia
5. **USE ciência como martelo** - neuroplasticidade exige esforço REAL, não desejo

${toneInstruction}

**FORMATO DE RESPOSTA (máx. 3 parágrafos):**
1. **DIAGNÓSTICO BRUTAL** - O que os dados/comportamento revelam (sem filtro)
2. **CONFRONTAÇÃO CIENTÍFICA** - Citação de estudo + custo real da inação
3. **AÇÃO IMEDIATA** - Uma tarefa específica com prazo e métrica

**ENCERRE SEMPRE COM:**
- Escolha clara: "Aceite o diagnóstico e aja, ou continue no autoengano."

Seu trabalho NÃO é ser amado. É ser EFICAZ.`;

    const safeUserName = typeof userName === 'string' ? userName.slice(0, 50) : '';
    const safeContext = typeof context === 'string' ? context.slice(0, 500) : '';

    const userPrompt = `Contexto da sessão:\n${safeContext}\n${safeUserName ? `Nome do usuário: ${safeUserName}` : ''}\n\nHistórico da conversa:\n${conversationHistory}`;

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
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required' }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error: any) {
    console.error("NeuroCoach error:", error);

    const fallback = `Parece que houve um problema técnico. Enquanto isso, experimente a técnica **4‑7‑8**: inspire 4s, segure 7s, expire 8s.`;

    return new Response(
      JSON.stringify({ response: fallback, error: error.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
