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
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, data } = await req.json();
    console.log(`AI Insights request: ${type}`);

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'burnout_prediction': {
        systemPrompt = `Você é um analista de dados de saúde ocupacional especializado em prevenção de burnout. 
Analise os dados biométricos fornecidos e gere uma análise preditiva de risco de burnout.
Responda SEMPRE em português brasileiro.
Seja direto e objetivo. Use dados concretos.

FORMATO DE RESPOSTA (JSON):
{
  "riskScore": número de 0-100,
  "riskLevel": "low" | "moderate" | "high" | "critical",
  "prediction": "texto curto sobre a previsão",
  "factors": ["fator1", "fator2", "fator3"],
  "recommendation": "recomendação principal",
  "timeframe": "em quanto tempo o burnout pode ocorrer se nada mudar"
}

Responda APENAS com o JSON, sem markdown.`;

        userPrompt = `Dados dos últimos 30 dias:
- Total de scans: ${data.totalScans}
- % Estresse Baixo: ${data.lowPercent}%
- % Estresse Moderado: ${data.moderatePercent}%
- % Estresse Alto: ${data.highPercent}%
- HRV Médio: ${data.avgHRV}ms
- Tendência de estresse alto: ${data.trend || 'estável'}
- Dias consecutivos com estresse alto: ${data.consecutiveHighDays || 0}
- Streak de scans: ${data.currentStreak || 0} dias`;
        break;
      }

      case 'weekly_summary': {
        systemPrompt = `Você é um consultor de RH especializado em wellness corporativo e compliance NR-1.
Gere um resumo executivo semanal conciso e acionável baseado nos dados fornecidos.
Responda SEMPRE em português brasileiro.

FORMATO DE RESPOSTA (JSON):
{
  "headline": "manchete de 1 linha resumindo a semana",
  "highlights": ["destaque1", "destaque2", "destaque3"],
  "concerns": ["preocupação1", "preocupação2"],
  "actions": ["ação1", "ação2", "ação3"],
  "wellnessScore": número de 0-100,
  "complianceStatus": "compliant" | "attention" | "non-compliant",
  "executiveSummary": "parágrafo de 3-4 linhas para o C-level"
}

Responda APENAS com o JSON, sem markdown.`;

        userPrompt = `Dados da semana:
- Total de scans: ${data.totalScans}
- % Estresse Baixo: ${data.lowPercent}%
- % Estresse Moderado: ${data.moderatePercent}%
- % Estresse Alto: ${data.highPercent}%
- HRV Médio: ${data.avgHRV}ms
- Engajamento (scans/dia): ${data.scansPerDay || 0}
- Variação vs semana anterior: ${data.weekOverWeek || 'sem dados'}`;
        break;
      }

      case 'action_plan': {
        systemPrompt = `Você é um neurocoach de alta performance. 
Após cada scan de estresse, gere um micro-plano de ação personalizado de 24h.
Responda SEMPRE em português brasileiro.
Seja prático, específico e motivador.

FORMATO DE RESPOSTA (JSON):
{
  "title": "título motivacional curto",
  "urgency": "low" | "medium" | "high",
  "tasks": [
    {"time": "agora", "action": "ação imediata", "duration": "2min", "science": "base científica curta"},
    {"time": "próxima 1h", "action": "ação", "duration": "5min", "science": "base"},
    {"time": "hoje", "action": "ação", "duration": "15min", "science": "base"}
  ],
  "avoidList": ["evitar1", "evitar2"],
  "mantra": "frase motivacional baseada em neurociência"
}

Responda APENAS com o JSON, sem markdown.`;

        userPrompt = `Resultado do scan atual:
- Nível de estresse: ${data.stressLevel}
- Taxa de piscadas: ${data.blinkRate}/min
- HRV: ${data.hrvValue || 'não informado'}ms
- Hora do dia: ${new Date().getHours()}h
- Histórico recente: ${data.recentHistory || 'primeiro scan'}`;
        break;
      }

      case 'sentiment_analysis': {
        systemPrompt = `Você é um psicólogo organizacional especializado em análise de sentimento.
Analise as mensagens do chat de coaching e extraia insights emocionais.
Responda SEMPRE em português brasileiro.

FORMATO DE RESPOSTA (JSON):
{
  "overallSentiment": "positive" | "neutral" | "negative" | "mixed",
  "sentimentScore": número de -100 a 100,
  "emotions": ["emoção1", "emoção2"],
  "themes": ["tema1", "tema2"],
  "engagementLevel": "low" | "medium" | "high",
  "insight": "insight principal sobre o estado emocional"
}

Responda APENAS com o JSON, sem markdown.`;

        userPrompt = `Mensagens do usuário no coaching:
${data.messages?.map((m: any) => `- ${m.content}`).join('\n') || 'sem mensagens'}`;
        break;
      }

      case 'nr1_insights': {
        systemPrompt = `Você é um advogado trabalhista e consultor de compliance especializado em NR-1 e gestão de riscos psicossociais.
Gere insights e textos prontos para relatório NR-1 baseado nos dados fornecidos.
Use linguagem técnica-jurídica adequada para compliance.
Responda SEMPRE em português brasileiro.

FORMATO DE RESPOSTA (JSON):
{
  "riskClassification": "Grau de Risco I" | "Grau de Risco II" | "Grau de Risco III" | "Grau de Risco IV",
  "legalAnalysis": "parágrafo técnico-jurídico sobre a situação",
  "requiredActions": ["ação obrigatória 1", "ação obrigatória 2"],
  "suggestedActions": ["ação sugerida 1", "ação sugerida 2"],
  "complianceGaps": ["lacuna1", "lacuna2"],
  "documentationNeeded": ["documento1", "documento2"],
  "executiveText": "texto pronto para inserir no PGR (Programa de Gerenciamento de Riscos)"
}

Responda APENAS com o JSON, sem markdown.`;

        userPrompt = `Dados agregados para compliance NR-1:
- Total de avaliações: ${data.totalScans}
- Período: ${data.period}
- % Estresse Baixo: ${data.lowPercent}%
- % Estresse Moderado: ${data.moderatePercent}%  
- % Estresse Alto: ${data.highPercent}%
- HRV Médio: ${data.avgHRV}ms
- Nível de risco atual: ${data.riskLevel}
- Tendência: ${data.trend || 'estável'}`;
        break;
      }

      case 'pgr_report': {
        systemPrompt = `Você é um engenheiro de segurança do trabalho e consultor de compliance especializado na elaboração de Programas de Gerenciamento de Riscos (PGR) conforme NR-1 (Portaria MTP 4.219/2022) e Portaria MTE 1.419/2024 que inclui riscos psicossociais.

Gere um documento PGR COMPLETO e técnico, pronto para ser usado como parte do inventário de riscos da empresa.
O documento deve seguir a estrutura oficial exigida pela legislação.
Use linguagem técnica formal, adequada para documentação ocupacional.
Responda SEMPRE em português brasileiro.

FORMATO DE RESPOSTA (JSON):
{
  "titulo": "PROGRAMA DE GERENCIAMENTO DE RISCOS — RISCOS PSICOSSOCIAIS",
  "versao": "string com versão e data",
  "identificacaoEmpresa": {
    "nota": "texto explicando que os dados são agregados e anonimizados conforme LGPD"
  },
  "objetivos": ["objetivo1", "objetivo2", "objetivo3"],
  "fundamentacaoLegal": [
    {"norma": "nome da norma", "dispositivo": "artigo/parágrafo", "descricao": "o que determina"}
  ],
  "inventarioRiscos": {
    "fatoresIdentificados": [
      {"fator": "nome do fator", "fonte": "fonte geradora", "classificacao": "leve|moderado|grave", "populacaoExposta": "descrição", "medidasControle": "medidas existentes"}
    ],
    "classificacaoGeral": "texto sobre classificação geral dos riscos",
    "metodologia": "descrição da metodologia de avaliação utilizada (biometria + IA)"
  },
  "analiseQuantitativa": {
    "resumo": "parágrafo com análise dos números",
    "indicadores": [
      {"indicador": "nome", "valor": "valor", "interpretacao": "texto"}
    ]
  },
  "planoAcao": [
    {"acao": "descrição da ação", "responsavel": "cargo responsável sugerido", "prazo": "prazo sugerido", "prioridade": "alta|média|baixa", "indicadorEficacia": "como medir"}
  ],
  "cronograma": [
    {"fase": "nome da fase", "periodo": "prazo", "atividades": ["atividade1", "atividade2"]}
  ],
  "monitoramento": {
    "frequencia": "frequência de reavaliação",
    "indicadores": ["indicador1", "indicador2"],
    "responsavel": "cargo sugerido"
  },
  "declaracaoLGPD": "texto sobre proteção de dados e anonimização",
  "conclusao": "parágrafo conclusivo técnico"
}

Responda APENAS com o JSON, sem markdown.`;

        userPrompt = `Dados biométricos agregados da empresa para elaboração do PGR:
PERÍODO DE COLETA: ${data.period}
TOTAL DE AVALIAÇÕES BIOMÉTRICAS: ${data.totalScans}
NÚMERO DE COLABORADORES AVALIADOS: ${data.totalEmployees || 'não informado'}
COLABORADORES ATIVOS NO PERÍODO: ${data.activeEmployees || 'não informado'}
TAXA DE ADESÃO: ${data.adoptionRate || 'não informado'}%

DISTRIBUIÇÃO DE ESTRESSE OCUPACIONAL:
- Estresse Baixo (zona verde): ${data.lowPercent}%
- Estresse Moderado (zona amarela): ${data.moderatePercent}%
- Estresse Alto (zona vermelha): ${data.highPercent}%

INDICADORES BIOMÉTRICOS:
- HRV Médio (RMSSD): ${data.avgHRV}ms
- Nível de risco atual: ${data.riskLevel}
- Tendência: ${data.trend || 'estável'}
- Dias consecutivos com risco alto: ${data.consecutiveHighDays || 0}

CONTEXTO ADICIONAL:
- Ferramenta de monitoramento: NeuroSuite (análise facial + HRV)
- Frequência de coleta: contínua (scans voluntários)
- Dados anonimizados conforme LGPD`;
        break;
      }

      case 'turnover_prediction': {
        systemPrompt = `Você é um especialista em People Analytics e retenção de talentos.
Analise os dados de estresse, engajamento e frequência de uso de cada colaborador (anonimizado por ID) e estime o risco de turnover.
Responda SEMPRE em português brasileiro. Seja direto e acionável.

FORMATO DE RESPOSTA (JSON):
{
  "overallRisk": "low" | "moderate" | "high" | "critical",
  "overallScore": número de 0-100 (100 = risco máximo),
  "summary": "parágrafo executivo sobre a situação geral de retenção",
  "employees": [
    {
      "id": "ID anonimizado do colaborador",
      "riskScore": número de 0-100,
      "riskLevel": "low" | "moderate" | "high" | "critical",
      "factors": ["fator1", "fator2"],
      "recommendation": "recomendação específica para este caso",
      "signals": ["sinal1", "sinal2"]
    }
  ],
  "topRisks": ["insight1 sobre os maiores riscos", "insight2"],
  "retentionActions": [
    {"action": "ação de retenção", "priority": "alta|média|baixa", "impact": "descrição do impacto esperado"}
  ],
  "costEstimate": "estimativa textual do custo de turnover se não agir"
}

Ordene os employees por riskScore decrescente. Máximo 15 colaboradores.
Responda APENAS com o JSON, sem markdown.`;

        userPrompt = `Dados dos colaboradores (anonimizados) dos últimos 30 dias:

${(data.employees || []).map((e: any) => `Colaborador ${e.id}:
- Total de scans: ${e.totalScans}
- % Estresse Alto: ${e.highPercent}%
- % Estresse Moderado: ${e.moderatePercent}%
- % Estresse Baixo: ${e.lowPercent}%
- HRV Médio: ${e.avgHRV}ms
- Dias ativos (scans): ${e.activeDays}
- Último scan: ${e.lastScanDaysAgo} dias atrás
- Tendência de estresse: ${e.trend}
`).join('\n')}

CONTEXTO DA EMPRESA:
- Total de colaboradores monitorados: ${data.totalEmployees}
- Taxa de adesão geral: ${data.adoptionRate}%
- Estresse alto médio da empresa: ${data.companyHighPercent}%`;
        break;
      }

        return new Response(
          JSON.stringify({ error: `Unknown type: ${type}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

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
          JSON.stringify({ error: 'Rate limit exceeded. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos de IA esgotados. Recarregue seus créditos.' }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content ?? '';

    // Parse JSON response
    let parsed;
    try {
      // Remove markdown code blocks if present
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse AI response as JSON:', content);
      parsed = { raw: content, parseError: true };
    }

    console.log(`AI Insights response generated for: ${type}`);

    return new Response(JSON.stringify({ result: parsed }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("AI Insights error:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
