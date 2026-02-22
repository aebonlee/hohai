import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { NewsItem, NewsItemInsert, NewsItemUpdate } from '../types/news';

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

/** Admin hook: 전체 소식 조회 + 공개/비공개 토글 + 삭제 */
export function useAllNews() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from('hohai_news')
      .select('*')
      .order('created_at', { ascending: false });

    setItems((data as NewsItem[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const updateItem = async (id: string, updates: NewsItemUpdate) => {
    const { error } = await supabase.from('hohai_news').update(updates).eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('hohai_news').delete().eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  return { items, loading, updateItem, deleteItem, refetch: fetchAll };
}
