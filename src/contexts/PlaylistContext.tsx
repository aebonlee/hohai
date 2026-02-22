import { createContext, useContext, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { usePlaylists } from '../hooks/usePlaylist';
import type { Playlist, PlaylistInsert } from '../types/playlist';

interface PlaylistContextValue {
  playlists: Playlist[];
  loading: boolean;
  createPlaylist: (insert: PlaylistInsert) => Promise<{ data: Playlist | null; error: unknown }>;
  updatePlaylist: (id: string, updates: { name?: string; song_ids?: string[] }) => Promise<{ error: unknown }>;
  deletePlaylist: (id: string) => Promise<{ error: unknown }>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<{ error: unknown }>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<{ error: unknown }>;
  reorderSongs: (playlistId: string, newIds: string[]) => Promise<{ error: unknown }>;
  refetch: () => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextValue>({
  playlists: [],
  loading: false,
  createPlaylist: async () => ({ data: null, error: null }),
  updatePlaylist: async () => ({ error: null }),
  deletePlaylist: async () => ({ error: null }),
  addSongToPlaylist: async () => ({ error: null }),
  removeSongFromPlaylist: async () => ({ error: null }),
  reorderSongs: async () => ({ error: null }),
  refetch: async () => {},
});

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const hook = usePlaylists();

  // 로그인 상태 변경 시 재생목록 다시 불러오기
  useEffect(() => {
    if (isLoggedIn) {
      hook.refetch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // 비로그인 시 빈 값 반환
  const value = useMemo<PlaylistContextValue>(() => {
    if (!isLoggedIn) {
      return {
        playlists: [],
        loading: false,
        createPlaylist: async () => ({ data: null, error: null }),
        updatePlaylist: async () => ({ error: null }),
        deletePlaylist: async () => ({ error: null }),
        addSongToPlaylist: async () => ({ error: null }),
        removeSongFromPlaylist: async () => ({ error: null }),
        reorderSongs: async () => ({ error: null }),
        refetch: async () => {},
      };
    }
    return hook;
  }, [isLoggedIn, hook]);

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylistContext() {
  return useContext(PlaylistContext);
}
