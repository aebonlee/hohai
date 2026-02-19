import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Category } from '../types/category';

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
