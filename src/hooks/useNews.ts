import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { NewsItem, NewsItemInsert } from '../types/news';

export function useNews() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from('hohai_news')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    setItems((data as NewsItem[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const createItem = async (item: NewsItemInsert) => {
    const { error } = await supabase.from('hohai_news').insert({
      ...item,
      is_published: true,
    });
    if (!error) await fetchItems();
    return { error };
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('hohai_news').delete().eq('id', id);
    if (!error) await fetchItems();
    return { error };
  };

  return { items, loading, createItem, deleteItem, refetch: fetchItems };
}
