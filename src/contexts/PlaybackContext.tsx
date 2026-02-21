import { createContext, useContext, useState, useCallback } from 'react';

interface PlaybackContextValue {
  /** 현재 재생 중인 song ID (null이면 아무것도 재생 안 함) */
  currentId: string | null;
  /** 새 곡 재생 시작 — 기존 재생은 자동 정지 */
  play: (songId: string) => void;
  /** 현재 재생 정지 */
  stop: () => void;
}

const PlaybackContext = createContext<PlaybackContextValue>({
  currentId: null,
  play: () => {},
  stop: () => {},
});

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [currentId, setCurrentId] = useState<string | null>(null);

  const play = useCallback((songId: string) => {
    setCurrentId(songId);
  }, []);

  const stop = useCallback(() => {
    setCurrentId(null);
  }, []);

  return (
    <PlaybackContext.Provider value={{ currentId, play, stop }}>
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  return useContext(PlaybackContext);
}
