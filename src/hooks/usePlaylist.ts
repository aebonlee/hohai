import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Playlist, PlaylistInsert } from '../types/playlist';

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlaylists = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from('hohai_playlists')
      .select('*')
      .order('created_at', { ascending: false });

    setPlaylists((data as Playlist[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const createPlaylist = async (insert: PlaylistInsert) => {
    const { data, error } = await supabase
      .from('hohai_playlists')
      .insert(insert)
      .select()
      .single();
    if (!error) await fetchPlaylists();
    return { data: data as Playlist | null, error };
  };

  const updatePlaylist = async (id: string, updates: { name?: string; song_ids?: string[] }) => {
    const { error } = await supabase
      .from('hohai_playlists')
      .update(updates)
      .eq('id', id);
    if (!error) await fetchPlaylists();
    return { error };
  };

  const deletePlaylist = async (id: string) => {
    const { error } = await supabase
      .from('hohai_playlists')
      .delete()
      .eq('id', id);
    if (!error) await fetchPlaylists();
    return { error };
  };

  const addSongToPlaylist = async (playlistId: string, songId: string) => {
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl || pl.song_ids.includes(songId)) return { error: null };
    return updatePlaylist(playlistId, { song_ids: [...pl.song_ids, songId] });
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return { error: null };
    return updatePlaylist(playlistId, { song_ids: pl.song_ids.filter((id) => id !== songId) });
  };

  const reorderSongs = async (playlistId: string, newIds: string[]) => {
    return updatePlaylist(playlistId, { song_ids: newIds });
  };

  return {
    playlists,
    loading,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    reorderSongs,
    refetch: fetchPlaylists,
  };
}
