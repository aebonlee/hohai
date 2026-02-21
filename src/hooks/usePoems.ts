import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Poem, PoemInsert, PoemUpdate } from '../types/poem';

export function usePoems(categorySlug?: string, seriesId?: string) {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoems = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('hohai_poems')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (categorySlug) {
      query = query.eq('category', categorySlug);
    }
    if (seriesId) {
      query = query.eq('series_id', seriesId);
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
      setPoems([]);
    } else {
      setPoems((data as Poem[]) || []);
    }
    setLoading(false);
  }, [categorySlug, seriesId]);

  useEffect(() => {
    fetchPoems();
  }, [fetchPoems]);

  return { poems, loading, error, refetch: fetchPoems };
}

export function usePoemDetail(id: string | undefined) {
  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);
  const [adjacentPoems, setAdjacentPoems] = useState<{
    prev: { id: string; title: string } | null;
    next: { id: string; title: string } | null;
  }>({ prev: null, next: null });

  useEffect(() => {
    if (!id) return;

    const fetchPoem = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('hohai_poems')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setPoem(data as Poem);

        const seriesId = (data as Poem).series_id;
        let adjacentQuery = supabase
          .from('hohai_poems')
          .select('id, title, display_order')
          .eq('is_published', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (seriesId) {
          adjacentQuery = adjacentQuery.eq('series_id', seriesId);
        }

        const { data: allPoems } = await adjacentQuery;

        if (allPoems && allPoems.length > 0) {
          const idx = allPoems.findIndex((p) => p.id === id);
          setAdjacentPoems({
            prev: idx > 0 ? { id: allPoems[idx - 1].id, title: allPoems[idx - 1].title } : null,
            next: idx < allPoems.length - 1 ? { id: allPoems[idx + 1].id, title: allPoems[idx + 1].title } : null,
          });
        }
      }
      setLoading(false);
    };

    fetchPoem();
  }, [id]);

  return { poem, loading, adjacentPoems };
}

export function useFeaturedPoems() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('hohai_poems')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      setPoems((data as Poem[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return { poems, loading };
}

// Admin hooks
export function useAllPoems() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('hohai_poems')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    setPoems((data as Poem[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createPoem = async (poem: PoemInsert) => {
    const { error } = await supabase.from('hohai_poems').insert(poem);
    if (!error) await fetchAll();
    return { error };
  };

  const updatePoem = async (id: string, updates: PoemUpdate) => {
    const { error } = await supabase.from('hohai_poems').update(updates).eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  const deletePoem = async (id: string) => {
    const { error } = await supabase.from('hohai_poems').delete().eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  return { poems, loading, createPoem, updatePoem, deletePoem, refetch: fetchAll };
}
