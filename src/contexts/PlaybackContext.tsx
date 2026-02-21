import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Song } from '../types/song';

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
  autoPlayIntent: false,
  lyricsPlayerOpen: false,
  openLyricsPlayer: () => {},
  closeLyricsPlayer: () => {},
});

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [playlist, setPlaylistState] = useState<Song[] | null>(null);
  const [autoPlayIntent, setAutoPlayIntent] = useState(false);
  const [lyricsPlayerOpen, setLyricsPlayerOpen] = useState(false);

  const currentIndex = useMemo(() => {
    if (!playlist || !currentId) return -1;
    return playlist.findIndex((s) => s.id === currentId);
  }, [playlist, currentId]);

  const hasNext = playlist !== null && currentIndex >= 0 && currentIndex < playlist.length - 1;
  const hasPrev = playlist !== null && currentIndex > 0;

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
    if (!playlist || currentIndex < 0 || currentIndex >= playlist.length - 1) return;
    const nextSong = playlist[currentIndex + 1];
    setAutoPlayIntent(true);
    setCurrentId(nextSong.id);
  }, [playlist, currentIndex]);

  const prev = useCallback(() => {
    if (!playlist || currentIndex <= 0) return;
    const prevSong = playlist[currentIndex - 1];
    setAutoPlayIntent(true);
    setCurrentId(prevSong.id);
  }, [playlist, currentIndex]);

  const onSongEnd = useCallback(() => {
    // YouTube 곡 끝나면 자동 다음 곡
    if (playlist && currentIndex >= 0 && currentIndex < playlist.length - 1) {
      const nextSong = playlist[currentIndex + 1];
      setAutoPlayIntent(true);
      setCurrentId(nextSong.id);
    } else {
      // 마지막 곡이면 정지
      setAutoPlayIntent(false);
    }
  }, [playlist, currentIndex]);

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
    autoPlayIntent,
    lyricsPlayerOpen,
    openLyricsPlayer,
    closeLyricsPlayer,
  }), [
    currentId, play, stop,
    playlist, currentIndex, hasNext, hasPrev,
    setPlaylist, clearPlaylist, next, prev, onSongEnd,
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
