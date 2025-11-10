// functions/neuro-coach/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY")!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Request received');
    
    // Check if GEMINI_API_KEY is set
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          response: 'Configuração pendente: GEMINI_API_KEY não encontrada. Configure a chave nas secrets do backend.',
          error: 'GEMINI_API_KEY missing'
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.text();
    console.log('Request body:', body);
    
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
    const prompt = `
Você é o **NeuroCoach** – um coach cerebral com atitude baseado em PNL (Programação Neurolinguística).
Nunca concorde automaticamente. Sempre valide com ciência (HRV, RMSSD, neuroplasticidade, estudos MIT/NASA).
Use provocações socráticas, desafie crenças limitantes e dê tarefas práticas.

${toneInstruction}

Contexto da sessão:
${context}
${userName ? `Nome do usuário: ${userName}` : ''}

Histórico da conversa:
${conversationHistory}

Responda em **máx. 2 parágrafos**, firme mas empático, e inclua:
1. Um desafio ou pergunta que force reflexão.
2. Uma micro‑tarefa (≤ 2 min).
3. Citação rápida de evidência científica.
`;

    // ---- 3. Chama Gemini (timeout 12s) ----
    const result = await model.generateContent(prompt, {
      timeout: 12_000,
    });
    const reply = result?.response?.text() ?? "Tente novamente em 30s.";

    // ---- 4. Resposta 200 OK ----
    return new Response(JSON.stringify({ response: reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("NeuroCoach error:", error);
    console.error("Error stack:", error.stack);

    // ---- Fallback amigável (sempre 200) ----
    const fallback = `
Estresse moderado? Respire **4‑7‑8** agora: inspire 4s, segure 7s, expire 8s.  
Volte em 2 min e me diga o que mudou.  
*(HRV sobe ≈12 ms em média – estudo Stanford, 2023)*`;

    return new Response(
      JSON.stringify({ response: fallback, error: error.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
