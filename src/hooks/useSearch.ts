import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Poem } from '../types/poem';
import type { Song } from '../types/song';

export interface SearchResults {
  poems: Poem[];
  songs: Song[];
}

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResults>({ poems: [], songs: [] });
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(0);

  const search = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults({ poems: [], songs: [] });
      setLoading(false);
      return;
    }

    const id = ++abortRef.current;
    setLoading(true);

    const pattern = `%${trimmed}%`;

    const [poemRes, songRes] = await Promise.all([
      supabase
        .from('hohai_poems')
        .select('*')
        .eq('is_published', true)
        .or(`title.ilike.${pattern},content.ilike.${pattern}`)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('hohai_songs')
        .select('*')
        .eq('is_published', true)
        .or(`title.ilike.${pattern},lyrics.ilike.${pattern}`)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    // 오래된 요청 무시
    if (id !== abortRef.current) return;

    setResults({
      poems: (poemRes.data as Poem[]) || [],
      songs: (songRes.data as Song[]) || [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  return { results, loading };
}
