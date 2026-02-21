import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Category } from '../types/category';

export interface CategoryInsert {
  name: string;
  slug: string;
  description?: string | null;
  display_order: number;
}

export type CategoryUpdate = Partial<CategoryInsert>;

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('hohai_categories')
        .select('*')
        .order('display_order', { ascending: true });

      setCategories((data as Category[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return { categories, loading };
}

// Admin hooks
export function useAllCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('hohai_categories')
      .select('*')
      .order('display_order', { ascending: true });

    setCategories((data as Category[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createCategory = async (item: CategoryInsert) => {
    const { error } = await supabase.from('hohai_categories').insert(item);
    if (!error) await fetchAll();
    return { error };
  };

  const updateCategory = async (id: string, updates: CategoryUpdate) => {
    const { error } = await supabase.from('hohai_categories').update(updates).eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('hohai_categories').delete().eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  return { categories, loading, createCategory, updateCategory, deleteCategory, refetch: fetchAll };
}
