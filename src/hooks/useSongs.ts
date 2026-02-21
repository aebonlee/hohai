import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Song, SongInsert, SongUpdate } from '../types/song';

export function useSongs(seriesId?: string) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSongs = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('hohai_songs')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (seriesId) {
      query = query.eq('series_id', seriesId);
    }

    const { data } = await query;
    setSongs((data as Song[]) || []);
    setLoading(false);
  }, [seriesId]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  return { songs, loading, refetch: fetchSongs };
}

export function useFeaturedSong() {
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('hohai_songs')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .limit(1)
        .single();

      setSong((data as Song) || null);
      setLoading(false);
    };
    fetch();
  }, []);

  return { song, loading };
}

// Admin hooks
export function useAllSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('hohai_songs')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    setSongs((data as Song[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createSong = async (song: SongInsert) => {
    const { error } = await supabase.from('hohai_songs').insert(song);
    if (!error) await fetchAll();
    return { error };
  };

  const updateSong = async (id: string, updates: SongUpdate) => {
    const { error } = await supabase.from('hohai_songs').update(updates).eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  const deleteSong = async (id: string) => {
    const { error } = await supabase.from('hohai_songs').delete().eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  return { songs, loading, createSong, updateSong, deleteSong, refetch: fetchAll };
}
