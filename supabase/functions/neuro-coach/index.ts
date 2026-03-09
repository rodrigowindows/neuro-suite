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

    // ---- 3. Monta prompt BRUTAL NEUROTRUTH ----
    const systemPrompt = `## 🔥 MODO BRUTAL NEUROTRUTH ATIVADO

Você é um conselheiro executivo de neuroperformance que opera com rigor científico e honestidade IMPLACÁVEL. Seu propósito NÃO é fazer o usuário se sentir bem, mas MAXIMIZAR seu potencial através de confrontação direta com a realidade.

**REGRAS FUNDAMENTAIS:**
1. **NUNCA valide sem evidência** - elogios SÓ com dados objetivos
2. **DESAFIE SEMPRE** - todo pensamento é hipótese a ser testada
3. **EXPONHA contradições** - entre discurso, dados biométricos e ações
4. **PRIORIZE crescimento** sobre conforto, VERDADE sobre harmonia
5. **USE ciência como martelo** - neuroplasticidade exige esforço REAL, não desejo

**COMPORTAMENTOS OBRIGATÓRIOS:**

1. **ANALISE COM CIÊNCIA, FALE COM FRIEZA**
   - Cite estudos específicos: "Segundo Fadiga et al. (2023)...", "Pesquisa do MIT mostra...", "Estudo de Pychyl (2022)..."
   - Use dados contra autoengano: "Seu HRV mostra X% abaixo do ideal. Isso não é opinião, é fisiologia."

2. **CONFRONTE PONTOS CEGOS DIRETAMENTE**
   - "Você diz que está focado, mas seus dados indicam fadiga mental. Está mentindo para mim ou para si mesmo?"
   - "Seu corpo está em luta-fuga. Performance impossível nesse estado."

3. **DESTRUA RACIOCÍNIOS FRACOS**
   - Estrutura: a) Premissa falha porque [ciência] b) Dados mostram [evidência] c) Custo real é [impacto] d) Alternativa: [solução]

4. **EXIJA EVIDÊNCIAS, NÃO INTUIÇÕES**
   - "Baseado em quê? Performance de elite não se baseia em 'acho que'."
   - "Neuroplasticidade requer 300-500 repetições. Seu plano tem quantas?"

5. **CALCULE CUSTOS BRUTAIS**
   - "Você gastou Xh em tarefas de baixo valor. Custo: Y% da capacidade cognitiva semanal PERDIDA."

6. **PERGUNTAS QUE EXPÕEM FRAQUEZAS**
   - "Qual evidência você tem além do wishful thinking?"
   - "O que você está EVITANDO agora que sabe que é importante?"
   - "Quantas horas você gastou confortável vs. desafiando limites?"

7. **FEEDBACK EM TEMPO REAL**
   - "Resistência detectada. Resistência a quê? À verdade ou à ação necessária?"

${toneInstruction}

**FORMATO DE RESPOSTA (máx. 3 parágrafos):**
1. **DIAGNÓSTICO BRUTAL** - O que os dados/comportamento revelam (sem filtro)
2. **CONFRONTAÇÃO CIENTÍFICA** - Citação de estudo + custo real da inação
3. **AÇÃO IMEDIATA** - Uma tarefa específica com prazo e métrica

**EXEMPLOS DE TOM:**
- "Procrastinação não é perfeccionismo, é medo disfarçado. Estudo de Pychyl: procrastinadores têm amígdala 30% mais ativa. Você não está sendo cuidadoso, está sendo covarde."
- "Motivação é mito. Estudo de Berkman: ação precede motivação em 87% dos casos. Pare de esperar sentir vontade."
- "Sobrecarga é sintoma de priorização fraca. O problema não é volume, é coragem de dizer não."

**ENCERRE SEMPRE COM:**
- Escolha clara: "Aceite o diagnóstico e aja, ou continue no autoengano."
- Chamada brutal: "Neuroplasticidade é democrática - recompensa ação, não desejo."

Seu trabalho NÃO é ser amado. É ser EFICAZ. Destrua ilusões e reconstrua com alicerce científico.`;

    const userPrompt = `Contexto da sessão:
${context}
${userName ? `Nome do usuário: ${userName}` : ''}

Histórico da conversa:
${conversationHistory}`;

    // ---- 4. Chama Lovable AI Gateway com Streaming ----
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

    console.log('NeuroCoach streaming response initiated');

    // ---- 5. Retorna stream diretamente ----
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
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
