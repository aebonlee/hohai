import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Song } from '../types/song';

export type RepeatMode = 'none' | 'all' | 'one';

interface PlaybackContextValue {
  /** 현재 재생 중인 song ID (null이면 아무것도 재생 안 함) */
  currentId: string | null;
  /** 새 곡 재생 시작 — 기존 재생은 자동 정지 */
  play: (songId: string) => void;
  /** 현재 재생 정지 */
  stop: () => void;

  /** 플레이리스트 */
  playlist: Song[] | null;
  currentIndex: number;
  hasNext: boolean;
  hasPrev: boolean;
  setPlaylist: (songs: Song[]) => void;
  clearPlaylist: () => void;
  next: () => void;
  prev: () => void;
  onSongEnd: () => void;

  /** 반복 모드 */
  repeatMode: RepeatMode;
  setRepeatMode: (mode: RepeatMode) => void;

  /** 셔플 재생: 곡 배열을 랜덤 순서로 섞어서 재생 */
  playShuffled: (songs: Song[]) => void;

  /** auto-play 시그널 (next/prev에 의한 자동 전환) */
  autoPlayIntent: boolean;

  /** LyricsPlayer 중앙 관리 */
  lyricsPlayerOpen: boolean;
  openLyricsPlayer: () => void;
  closeLyricsPlayer: () => void;
}

const PlaybackContext = createContext<PlaybackContextValue>({
  currentId: null,
  play: () => {},
  stop: () => {},
  playlist: null,
  currentIndex: -1,
  hasNext: false,
  hasPrev: false,
  setPlaylist: () => {},
  clearPlaylist: () => {},
  next: () => {},
  prev: () => {},
  onSongEnd: () => {},
  repeatMode: 'none',
  setRepeatMode: () => {},
  playShuffled: () => {},
  autoPlayIntent: false,
  lyricsPlayerOpen: false,
  openLyricsPlayer: () => {},
  closeLyricsPlayer: () => {},
});

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [playlist, setPlaylistState] = useState<Song[] | null>(null);
  const [autoPlayIntent, setAutoPlayIntent] = useState(false);
  const [lyricsPlayerOpen, setLyricsPlayerOpen] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');

  const currentIndex = useMemo(() => {
    if (!playlist || !currentId) return -1;
    return playlist.findIndex((s) => s.id === currentId);
  }, [playlist, currentId]);

  const hasNext = playlist !== null && currentIndex >= 0 && (
    currentIndex < playlist.length - 1 || repeatMode === 'all'
  );
  const hasPrev = playlist !== null && currentIndex >= 0 && (
    currentIndex > 0 || repeatMode === 'all'
  );

  const play = useCallback((songId: string) => {
    setAutoPlayIntent(false);
    setCurrentId(songId);
  }, []);

  const stop = useCallback(() => {
    setCurrentId(null);
    setAutoPlayIntent(false);
  }, []);

  const setPlaylist = useCallback((songs: Song[]) => {
    setPlaylistState(songs);
  }, []);

  const clearPlaylist = useCallback(() => {
    setPlaylistState(null);
    setAutoPlayIntent(false);
  }, []);

  const next = useCallback(() => {
    if (!playlist || currentIndex < 0) return;
    let nextIdx = currentIndex + 1;
    if (nextIdx >= playlist.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        return;
      }
    }
    setAutoPlayIntent(true);
    setCurrentId(playlist[nextIdx].id);
  }, [playlist, currentIndex, repeatMode]);

  const prev = useCallback(() => {
    if (!playlist || currentIndex < 0) return;
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      if (repeatMode === 'all') {
        prevIdx = playlist.length - 1;
      } else {
        return;
      }
    }
    setAutoPlayIntent(true);
    setCurrentId(playlist[prevIdx].id);
  }, [playlist, currentIndex, repeatMode]);

  const onSongEnd = useCallback(() => {
    if (!playlist || currentIndex < 0) {
      setAutoPlayIntent(false);
      return;
    }

    if (repeatMode === 'one') {
      // 같은 곡 재시작 — ID를 잠시 null로 돌렸다 복원하면 effect가 재트리거
      const id = currentId;
      setCurrentId(null);
      requestAnimationFrame(() => {
        setAutoPlayIntent(true);
        setCurrentId(id);
      });
      return;
    }

    if (currentIndex < playlist.length - 1) {
      // 다음 곡
      setAutoPlayIntent(true);
      setCurrentId(playlist[currentIndex + 1].id);
    } else if (repeatMode === 'all') {
      // 마지막 곡 → 처음으로
      setAutoPlayIntent(true);
      setCurrentId(playlist[0].id);
    } else {
      // 정지
      setAutoPlayIntent(false);
    }
  }, [playlist, currentIndex, currentId, repeatMode]);

  const playShuffled = useCallback((songs: Song[]) => {
    const shuffled = shuffleArray(songs);
    setPlaylistState(shuffled);
    if (shuffled.length > 0) {
      setAutoPlayIntent(true);
      setCurrentId(shuffled[0].id);
    }
  }, []);

  const openLyricsPlayer = useCallback(() => {
    setLyricsPlayerOpen(true);
  }, []);

  const closeLyricsPlayer = useCallback(() => {
    setLyricsPlayerOpen(false);
  }, []);

  const value = useMemo<PlaybackContextValue>(() => ({
    currentId,
    play,
    stop,
    playlist,
    currentIndex,
    hasNext,
    hasPrev,
    setPlaylist,
    clearPlaylist,
    next,
    prev,
    onSongEnd,
    repeatMode,
    setRepeatMode,
    playShuffled,
    autoPlayIntent,
    lyricsPlayerOpen,
    openLyricsPlayer,
    closeLyricsPlayer,
  }), [
    currentId, play, stop,
    playlist, currentIndex, hasNext, hasPrev,
    setPlaylist, clearPlaylist, next, prev, onSongEnd,
    repeatMode, playShuffled,
    autoPlayIntent, lyricsPlayerOpen, openLyricsPlayer, closeLyricsPlayer,
  ]);

  return (
    <PlaybackContext.Provider value={value}>
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  return useContext(PlaybackContext);
}
