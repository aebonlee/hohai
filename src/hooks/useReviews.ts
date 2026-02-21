import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Review, ReviewInsert } from '../types/review';

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from('hohai_reviews')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    setReviews((data as Review[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const createReview = async (review: ReviewInsert) => {
    const { error } = await supabase.from('hohai_reviews').insert(review);
    if (!error) await fetchReviews();
    return { error };
  };

  return { reviews, loading, createReview, refetch: fetchReviews };
}
