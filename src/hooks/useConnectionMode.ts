import { useState, useEffect, useCallback } from 'react';

export const STORAGE_KEY = 'mars_mission_connection_mode';
export const SYNC_EVENT = 'mars-connection-sync';

export type ConnectionMode = 'autonomous' | 'online';

export function getConnectionMode(): ConnectionMode {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY) === 'autonomous' ? 'autonomous' : 'online';
  }
  return 'online';
}

export function isAutonomousMode(): boolean {
  return getConnectionMode() === 'autonomous';
}

export function setConnectionMode(mode: ConnectionMode | boolean): void {
  const isAuto = typeof mode === 'boolean' ? mode : mode === 'autonomous';
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, isAuto ? 'autonomous' : 'online');
    window.dispatchEvent(
      new CustomEvent(SYNC_EVENT, { detail: { isAutonomous: isAuto } })
    );
  }
}

export function useConnectionMode() {
  const [isAutonomous, setIsAutonomous] = useState<boolean>(() => {
    return isAutonomousMode();
  });

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ isAutonomous: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.isAutonomous === 'boolean') {
        setIsAutonomous(customEvent.detail.isAutonomous);
      }
    };

    window.addEventListener(SYNC_EVENT, handleSync);
    return () => {
      window.removeEventListener(SYNC_EVENT, handleSync);
    };
  }, []);

  const toggleConnection = useCallback(() => {
    const nextState = !isAutonomous;
    setConnectionMode(nextState);
    return nextState;
  }, [isAutonomous]);

  return {
    isAutonomous,
    mode: (isAutonomous ? 'autonomous' : 'online') as ConnectionMode,
    toggleConnection,
    setMode: setConnectionMode,
    setIsAutonomous,
  };
}
