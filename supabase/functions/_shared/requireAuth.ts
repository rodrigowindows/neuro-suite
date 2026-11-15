import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isAuthenticatedClaims } from "./claims.ts";

export async function requireAuthenticatedUser(
  req: Request,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  const unauthorized = () =>
    new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return unauthorized();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !isAuthenticatedClaims(data?.claims)) return unauthorized();

  return null;
}
