import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { LangProvider } from '@/i18n';

const { getSessionMock } = vi.hoisted(() => ({ getSessionMock: vi.fn() }));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getSession: getSessionMock } },
}));

import { useStreamingChat } from './useStreamingChat';

const ENDPOINT = 'https://example.supabase.co/functions/v1/nr1-chatbot';
const PUBLISHABLE_KEY = 'test-publishable-key';

describe('useStreamingChat (chamador do nr1-chatbot)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', PUBLISHABLE_KEY);
    fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500, body: null });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('com sessão envia o access_token da sessão e a publishable key apenas em apikey', async () => {
    // Arrange
    getSessionMock.mockResolvedValue({ data: { session: { access_token: 'session-jwt' } } });
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useStreamingChat({ endpoint: ENDPOINT, buildBody: (_m, u) => ({ messages: [u] }), onError }),
    );

    // Act
    await act(async () => {
      await result.current.sendMessage('Olá');
    });

    // Assert
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(ENDPOINT);
    expect(init.headers.Authorization).toBe('Bearer session-jwt');
    expect(init.headers.apikey).toBe(PUBLISHABLE_KEY);
    expect(init.headers.Authorization).not.toContain(PUBLISHABLE_KEY);
  });

  it('sem sessão não chama a função e informa que a sessão expirou', async () => {
    // Arrange
    getSessionMock.mockResolvedValue({ data: { session: null } });
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useStreamingChat({ endpoint: ENDPOINT, buildBody: (_m, u) => ({ messages: [u] }), onError }),
    );

    // Act
    await act(async () => {
      await result.current.sendMessage('Olá');
    });

    // Assert
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe('Sessão expirada. Faça novamente o login.');
  });

  it('sem sessão com LangProvider initialLang=en informa que a sessão expirou em inglês', async () => {
    // Arrange
    getSessionMock.mockResolvedValue({ data: { session: null } });
    const onError = vi.fn();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(LangProvider, { initialLang: 'en' }, children);
    const { result } = renderHook(
      () => useStreamingChat({ endpoint: ENDPOINT, buildBody: (_m, u) => ({ messages: [u] }), onError }),
      { wrapper }
    );

    // Act
    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    // Assert
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe('Session expired. Please sign in again.');
  });
});
