import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SAMPLE_CATEGORIES } from '../lib/sampleData';
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

      if (data && data.length > 0) {
        setCategories(data as Category[]);
      } else {
        setCategories(SAMPLE_CATEGORIES as Category[]);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return { categories, loading };
}
