import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useConnectionMode,
  setConnectionMode,
  isAutonomousMode,
  getConnectionMode,
  STORAGE_KEY,
  SYNC_EVENT,
} from './useConnectionMode';

describe('useConnectionMode Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('1. inicializa por padrão como online quando localStorage está vazio', () => {
    const { result } = renderHook(() => useConnectionMode());
    expect(result.current.isAutonomous).toBe(false);
    expect(result.current.mode).toBe('online');
    expect(isAutonomousMode()).toBe(false);
    expect(getConnectionMode()).toBe('online');
  });

  it('2. inicializa como autônomo quando localStorage possui "autonomous"', () => {
    localStorage.setItem(STORAGE_KEY, 'autonomous');
    const { result } = renderHook(() => useConnectionMode());
    expect(result.current.isAutonomous).toBe(true);
    expect(result.current.mode).toBe('autonomous');
    expect(isAutonomousMode()).toBe(true);
    expect(getConnectionMode()).toBe('autonomous');
  });

  it('3. toggleConnection alterna o estado, atualiza localStorage e dispara evento', () => {
    const { result } = renderHook(() => useConnectionMode());
    const eventSpy = vi.fn();
    window.addEventListener(SYNC_EVENT, eventSpy);

    act(() => {
      const next = result.current.toggleConnection();
      expect(next).toBe(true);
    });

    expect(result.current.isAutonomous).toBe(true);
    expect(result.current.mode).toBe('autonomous');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('autonomous');
    expect(eventSpy).toHaveBeenCalledTimes(1);

    act(() => {
      const next = result.current.toggleConnection();
      expect(next).toBe(false);
    });

    expect(result.current.isAutonomous).toBe(false);
    expect(result.current.mode).toBe('online');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('online');

    window.removeEventListener(SYNC_EVENT, eventSpy);
  });

  it('4. reage a SYNC_EVENT disparado externamente', () => {
    const { result } = renderHook(() => useConnectionMode());
    expect(result.current.isAutonomous).toBe(false);

    act(() => {
      setConnectionMode('autonomous');
    });

    expect(result.current.isAutonomous).toBe(true);
    expect(result.current.mode).toBe('autonomous');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('autonomous');
  });
});
