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

    const { metrics, period, companyName, teamSize } = await req.json();

    const systemPrompt = `Você é um consultor sênior de saúde ocupacional e bem-estar corporativo especializado em relatórios executivos para C-Level e SESMT.

Converta as métricas brutas em um RELATÓRIO NARRATIVO EXECUTIVO profissional em português brasileiro.

**DADOS DA EMPRESA:**
- Empresa: ${companyName || 'Não informado'}
- Tamanho da equipe: ${teamSize || 'N/A'}
- Período: ${period || 'Última semana'}

**MÉTRICAS RECEBIDAS:**
${JSON.stringify(metrics, null, 2)}

**FORMATO DO RELATÓRIO (em Markdown):**

# 📊 Relatório Executivo de Bem-Estar - [Período]

## Resumo Executivo
Um parágrafo com os principais achados e recomendações urgentes.

## Indicadores-Chave
- Use bullet points com números e tendências (↑↓→)
- Compare com benchmarks do setor quando possível

## Análise de Risco
Identifique riscos de burnout, turnover e compliance NR-1 baseado nos dados.

## Destaques Positivos
O que está funcionando bem na equipe.

## Recomendações Estratégicas
3-5 ações concretas priorizadas por impacto e urgência.

## Impacto Financeiro Estimado
ROI estimado das intervenções sugeridas.

## Próximos Passos
Cronograma sugerido de implementação.

---
*Relatório gerado por NeuroSuite AI · Confidencial*

**TOM:** Profissional, baseado em dados, orientado à ação. Use linguagem de board meeting.`;

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
          { role: "user", content: "Gere o relatório executivo narrativo baseado nas métricas fornecidas." },
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
    const report = data.choices?.[0]?.message?.content ?? 'Erro ao gerar relatório.';

    return new Response(JSON.stringify({ report }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Narrative report error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
