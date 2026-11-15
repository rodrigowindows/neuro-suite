import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MeetingCheckIn from './MeetingCheckIn';

const { toastMock, getSessionMock } = vi.hoisted(() => ({
  toastMock: vi.fn(),
  getSessionMock: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getSession: getSessionMock } },
}));

const PUBLISHABLE_KEY = 'sb_publishable_test_key';
const USER_JWT = 'eyJhbGciOi.user.jwt';

function renderAndSubmit() {
  render(<MeetingCheckIn overloadLevel="moderado" connectedCount={1} totalMeetingTime={90} />);
  fireEvent.change(screen.getByPlaceholderText('Ex: Alinhamento de projeto, feedback trimestral...'), {
    target: { value: 'Alinhamento de sprint' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Preparar Mindset/ }));
}

describe('MeetingCheckIn - autenticação do neuro-coach', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://project.supabase.co');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', PUBLISHABLE_KEY);
    toastMock.mockClear();
    getSessionMock.mockReset();
    fetchMock = vi.fn(async () => ({ ok: false, status: 500, body: null }) as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('sem sessão mostra toast de sessão expirada e não chama a função', async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });

    renderAndSubmit();

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Sessão expirada. Faça novamente o login.' })
      )
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('com sessão envia o access_token do usuário em Authorization e a chave publicável só em apikey', async () => {
    getSessionMock.mockResolvedValue({ data: { session: { access_token: USER_JWT } } });

    renderAndSubmit();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(url).toContain('/functions/v1/neuro-coach');
    expect(headers.Authorization).toBe(`Bearer ${USER_JWT}`);
    expect(headers.apikey).toBe(PUBLISHABLE_KEY);
    expect(headers.Authorization).not.toContain(PUBLISHABLE_KEY);
  });
});
