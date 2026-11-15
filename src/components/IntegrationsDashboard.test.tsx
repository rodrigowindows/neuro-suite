import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IntegrationsDashboard from './IntegrationsDashboard';

const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {},
}));

vi.mock('./integrations/PlatformCards', async () => {
  const React = await import('react');
  return {
    default: ({ onConnect }: { onConnect: (platform: string) => void }) =>
      React.createElement('button', { onClick: () => onConnect('meet') }, 'connect-meet'),
  };
});

vi.mock('./integrations/IntegrationMetrics', () => ({ default: () => null }));
vi.mock('./integrations/MeetingCheckIn', () => ({ default: () => null }));
vi.mock('./integrations/ProductivityInsights', () => ({ default: () => null }));

const SUPABASE_URL = 'https://project.supabase.co';
const VALID_ORIGIN = SUPABASE_URL;
const EVIL_ORIGIN = 'https://evil.example.com';
const OAUTH_STATE = 'state-abc-123';

function jsonResponse(body: unknown) {
  return { json: async () => body } as Response;
}

async function connectAndWaitForAuthState() {
  render(<IntegrationsDashboard />);
  fireEvent.click(screen.getByText('connect-meet'));
  await waitFor(() => expect(window.open).toHaveBeenCalled());
}

function postAuthMessage(data: unknown, origin: string) {
  window.dispatchEvent(new MessageEvent('message', { data, origin }));
}

describe('IntegrationsDashboard - OAuth postMessage', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv('VITE_SUPABASE_URL', SUPABASE_URL);
    toastMock.mockClear();
    window.open = vi.fn().mockReturnValue(null);
    fetchMock = vi.fn(async (url: string) => {
      if (url.includes('action=auth')) {
        return jsonResponse({ authUrl: 'https://accounts.google.com', state: OAUTH_STATE });
      }
      return jsonResponse({ totalMinutes: 30, totalMeetings: 2, upcomingMeetings: [] });
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  const calendarCalls = () => fetchMock.mock.calls.filter(([url]) => String(url).includes('action=events'));
  const authCalls = () => fetchMock.mock.calls.filter(([url]) => String(url).includes('action=auth'));

  it('envia origin codificado em action=auth', async () => {
    await connectAndWaitForAuthState();

    const [authUrl] = authCalls()[0];
    expect(String(authUrl)).toContain(`origin=${encodeURIComponent(window.location.origin)}`);
  });

  it('com erro em action=auth nao abre popup e limpa o state pendente', async () => {
    await connectAndWaitForAuthState();
    fetchMock.mockImplementationOnce(async () => jsonResponse({ error: 'Origem nao permitida' }));

    fireEvent.click(screen.getByText('connect-meet'));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'Erro ao iniciar OAuth', description: 'Origem nao permitida' }))
    );
    expect(window.open).toHaveBeenCalledTimes(1);
    postAuthMessage({ success: true, access_token: 'tok-google', state: OAUTH_STATE }, VALID_ORIGIN);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(calendarCalls()).toHaveLength(0);
  });

  it('fluxo feliz abre popup com authUrl e conecta com state correto', async () => {
    await connectAndWaitForAuthState();

    expect(window.open).toHaveBeenCalledWith('https://accounts.google.com', 'Google OAuth', expect.any(String));
    postAuthMessage({ success: true, access_token: 'tok-google', state: OAUTH_STATE }, VALID_ORIGIN);
    await waitFor(() => expect(calendarCalls()).toHaveLength(1));
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'Google Meet conectado!' }));
  });

  it('ignora mensagem de origem diferente da do Supabase', async () => {
    await connectAndWaitForAuthState();

    postAuthMessage({ success: true, access_token: 'tok', state: OAUTH_STATE }, EVIL_ORIGIN);

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(calendarCalls()).toHaveLength(0);
    expect(toastMock).not.toHaveBeenCalled();
  });

  it('ignora mensagem com state diferente do devolvido por action=auth', async () => {
    await connectAndWaitForAuthState();

    postAuthMessage({ success: true, access_token: 'tok', state: 'state-forjado' }, VALID_ORIGIN);

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(calendarCalls()).toHaveLength(0);
    expect(toastMock).not.toHaveBeenCalled();
  });

  it('conecta com mensagem de origem e state corretos', async () => {
    await connectAndWaitForAuthState();

    postAuthMessage({ success: true, access_token: 'tok-google', state: OAUTH_STATE }, VALID_ORIGIN);

    await waitFor(() => expect(calendarCalls()).toHaveLength(1));
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'Google Meet conectado!' }));
  });

  it('nao aceita a mesma mensagem duas vezes (state e limpo apos uso)', async () => {
    await connectAndWaitForAuthState();
    const successMessage = { success: true, access_token: 'tok-google', state: OAUTH_STATE };

    postAuthMessage(successMessage, VALID_ORIGIN);
    await waitFor(() => expect(calendarCalls()).toHaveLength(1));
    postAuthMessage(successMessage, VALID_ORIGIN);

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(calendarCalls()).toHaveLength(1);
  });

  it('aceita o state correto no ramo de erro', async () => {
    await connectAndWaitForAuthState();

    postAuthMessage({ error: 'access_denied', state: OAUTH_STATE }, VALID_ORIGIN);

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'Erro na autenticação' }))
    );
  });

  it('ignora erro com state diferente', async () => {
    await connectAndWaitForAuthState();

    postAuthMessage({ error: 'access_denied', state: 'state-forjado' }, VALID_ORIGIN);

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(toastMock).not.toHaveBeenCalled();
  });
});
