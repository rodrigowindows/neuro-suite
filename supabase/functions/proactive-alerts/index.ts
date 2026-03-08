import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Verify calling user is manager/admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    }).auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check manager role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['manager', 'admin']);

    if (!roleData || roleData.length === 0) {
      return new Response(JSON.stringify({ error: 'Acesso restrito a gestores' }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { action } = await req.json();

    if (action === 'analyze') {
      // Analyze all team stress data and generate AI-powered alert summary
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: scans } = await supabase
        .from('stress_scans')
        .select('user_id, stress_level, hrv_value, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

      if (!scans || scans.length === 0) {
        return new Response(JSON.stringify({ alerts: [], summary: 'Sem dados de scans nos últimos 7 dias.' }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Group by user
      const userScans = new Map<string, typeof scans>();
      scans.forEach(s => {
        if (!userScans.has(s.user_id)) userScans.set(s.user_id, []);
        userScans.get(s.user_id)!.push(s);
      });

      const alerts: any[] = [];
      const atRiskUsers: string[] = [];

      for (const [userId, userScanList] of userScans) {
        const total = userScanList.length;
        const highCount = userScanList.filter(s => s.stress_level === 'high').length;
        const highPercent = (highCount / total) * 100;
        const hrvValues = userScanList.filter(s => s.hrv_value).map(s => Number(s.hrv_value));
        const avgHRV = hrvValues.length > 0 ? hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length : null;

        // Check consecutive high days
        const scansByDay = new Map<string, string[]>();
        userScanList.forEach(s => {
          const day = new Date(s.created_at!).toISOString().split('T')[0];
          if (!scansByDay.has(day)) scansByDay.set(day, []);
          scansByDay.get(day)!.push(s.stress_level);
        });
        let consecutiveHigh = 0;
        for (const day of Array.from(scansByDay.keys()).sort().reverse()) {
          if (scansByDay.get(day)!.filter(s => s === 'high').length / scansByDay.get(day)!.length > 0.5) {
            consecutiveHigh++;
          } else break;
        }

        if (highPercent > 50 || consecutiveHigh >= 3 || (avgHRV !== null && avgHRV < 25)) {
          atRiskUsers.push(userId);
          alerts.push({
            userId,
            highPercent: Math.round(highPercent),
            avgHRV: avgHRV ? Math.round(avgHRV) : null,
            consecutiveHigh,
            totalScans: total,
            severity: highPercent > 70 || consecutiveHigh >= 5 ? 'critical' : 'warning',
          });
        }
      }

      // Generate AI summary if we have at-risk users
      let aiSummary = '';
      if (LOVABLE_API_KEY && alerts.length > 0) {
        try {
          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "system",
                  content: `Você é um consultor de saúde ocupacional. Gere um resumo executivo em português brasileiro sobre alertas de burnout da equipe. Seja conciso e acionável. Máximo 4 parágrafos.`,
                },
                {
                  role: "user",
                  content: `Dados da equipe (últimos 7 dias):
- Total de colaboradores monitorados: ${userScans.size}
- Colaboradores em risco: ${atRiskUsers.length}
- Detalhes dos alertas: ${JSON.stringify(alerts)}
- Total de scans da equipe: ${scans.length}`,
                },
              ],
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            aiSummary = aiData.choices?.[0]?.message?.content ?? '';
          }
        } catch (e) {
          console.error('AI summary error:', e);
        }
      }

      // Get user names for alerts
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, preferred_name, email')
        .in('id', atRiskUsers);

      const enrichedAlerts = alerts.map(a => {
        const profile = profiles?.find(p => p.id === a.userId);
        return {
          ...a,
          userName: profile?.preferred_name || profile?.full_name || 'Colaborador',
          userEmail: profile?.email || '',
        };
      });

      // Log the analysis
      await supabase.from('email_logs').insert({
        user_id: user.id,
        email_type: 'burnout_analysis',
        recipient_email: user.email || '',
        status: 'analyzed',
      });

      return new Response(JSON.stringify({
        alerts: enrichedAlerts,
        summary: aiSummary,
        totalMonitored: userScans.size,
        atRiskCount: atRiskUsers.length,
        totalScans: scans.length,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Proactive alerts error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
