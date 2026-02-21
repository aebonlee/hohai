import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Series, SeriesInsert, SeriesUpdate } from '../types/series';

export function usePoemSeries() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('hohai_series')
        .select('*')
        .eq('type', 'poem')
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      setSeries((data as Series[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return { series, loading };
}

export function useSongSeries() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('hohai_series')
        .select('*')
        .eq('type', 'song')
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      setSeries((data as Series[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return { series, loading };
}

export function useSeriesDetail(slug: string | undefined) {
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('hohai_series')
        .select('*')
        .eq('slug', slug)
        .single();

      setSeries((data as Series) || null);
      setLoading(false);
    };
    fetch();
  }, [slug]);

  return { series, loading };
}

// Admin hooks
export function useAllSeries() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('hohai_series')
      .select('*')
      .order('type', { ascending: true })
      .order('display_order', { ascending: true });

    setSeries((data as Series[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createSeries = async (item: SeriesInsert) => {
    const { error } = await supabase.from('hohai_series').insert(item);
    if (!error) await fetchAll();
    return { error };
  };

  const updateSeries = async (id: string, updates: SeriesUpdate) => {
    const { error } = await supabase.from('hohai_series').update(updates).eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  const deleteSeries = async (id: string) => {
    const { error } = await supabase.from('hohai_series').delete().eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  return { series, loading, createSeries, updateSeries, deleteSeries, refetch: fetchAll };
}
