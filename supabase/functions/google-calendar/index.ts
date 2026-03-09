import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    const redirectUri = `${SUPABASE_URL}/functions/v1/google-calendar?action=callback`;

    if (action === 'auth') {
      const state = crypto.randomUUID();
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID || '');
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly');
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('state', state);

      return new Response(
        JSON.stringify({ authUrl: authUrl.toString(), state }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'callback') {
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        return new Response(
          `<html><body><script>window.opener.postMessage({error: ${JSON.stringify(escapeHtml(error))}}, window.location.origin); window.close();</script></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      if (!code) {
        return new Response(
          `<html><body><script>window.opener.postMessage({error: 'No code received'}, window.location.origin); window.close();</script></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID || '',
          client_secret: GOOGLE_CLIENT_SECRET || '',
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokens = await tokenResponse.json();

      if (tokens.error) {
        const safeError = escapeHtml(tokens.error_description || tokens.error);
        return new Response(
          `<html><body><script>window.opener.postMessage({error: ${JSON.stringify(safeError)}}, window.location.origin); window.close();</script></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      // Send tokens via postMessage with restricted origin
      return new Response(
        `<html><body><script>window.opener.postMessage({success: true, access_token: ${JSON.stringify(tokens.access_token)}, refresh_token: ${JSON.stringify(tokens.refresh_token || '')}}, window.location.origin); window.close();</script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (action === 'events') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'No access token provided' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const accessToken = authHeader.replace('Bearer ', '');

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const calendarUrl = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
      calendarUrl.searchParams.set('timeMin', thirtyDaysAgo.toISOString());
      calendarUrl.searchParams.set('timeMax', now.toISOString());
      calendarUrl.searchParams.set('singleEvents', 'true');
      calendarUrl.searchParams.set('orderBy', 'startTime');
      calendarUrl.searchParams.set('maxResults', '100');

      const eventsResponse = await fetch(calendarUrl.toString(), {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      const eventsData = await eventsResponse.json();

      if (eventsData.error) {
        return new Response(
          JSON.stringify({ error: eventsData.error.message }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const events = eventsData.items || [];

      const meetEvents = events.filter((event: any) =>
        event.conferenceData?.conferenceSolution?.name === 'Google Meet' ||
        event.hangoutLink
      );

      let totalMeetingMinutes = 0;
      meetEvents.forEach((event: any) => {
        if (event.start?.dateTime && event.end?.dateTime) {
          const start = new Date(event.start.dateTime);
          const end = new Date(event.end.dateTime);
          totalMeetingMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
        }
      });

      const upcomingMeetings = meetEvents
        .filter((event: any) => new Date(event.start?.dateTime || event.start?.date) > now)
        .slice(0, 5)
        .map((event: any) => ({
          id: event.id,
          title: event.summary || 'Sem título',
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          meetLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri,
          attendees: event.attendees?.length || 0,
        }));

      return new Response(
        JSON.stringify({
          totalMeetings: meetEvents.length,
          totalMinutes: Math.round(totalMeetingMinutes),
          upcomingMeetings,
          lastSync: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
