import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Review, ReviewInsert, ReviewUpdate } from '../types/review';

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
    const { error } = await supabase.from('hohai_reviews').insert({
      ...review,
      is_published: true,
    });
    if (!error) await fetchReviews();
    return { error };
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from('hohai_reviews').delete().eq('id', id);
    if (!error) await fetchReviews();
    return { error };
  };

  return { reviews, loading, createReview, deleteReview, refetch: fetchReviews };
}

/** Admin hook: 전체 후기 조회 + 공개/비공개 토글 + 삭제 */
export function useAllReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from('hohai_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    setReviews((data as Review[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const updateReview = async (id: string, updates: ReviewUpdate) => {
    const { error } = await supabase.from('hohai_reviews').update(updates).eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from('hohai_reviews').delete().eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  return { reviews, loading, updateReview, deleteReview, refetch: fetchAll };
}
