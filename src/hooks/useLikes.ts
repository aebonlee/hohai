import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { TargetType } from '../types/interaction';

export function useLikes(targetType: TargetType, targetId: string, userId?: string) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!targetId) return;

    const { count: total } = await supabase
      .from('hohai_likes')
      .select('*', { count: 'exact', head: true })
      .eq('target_type', targetType)
      .eq('target_id', targetId);

    setCount(total || 0);

    if (userId) {
      const { data } = await supabase
        .from('hohai_likes')
        .select('id')
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('user_id', userId)
        .maybeSingle();

      setLiked(!!data);
    }

    setLoading(false);
  }, [targetType, targetId, userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const toggle = useCallback(async () => {
    if (!userId || !targetId) return;

    if (liked) {
      await supabase
        .from('hohai_likes')
        .delete()
        .eq('user_id', userId)
        .eq('target_type', targetType)
        .eq('target_id', targetId);

      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      await supabase
        .from('hohai_likes')
        .insert({ user_id: userId, target_type: targetType, target_id: targetId });

      setLiked(true);
      setCount((c) => c + 1);
    }
  }, [liked, userId, targetType, targetId]);

  return { count, liked, loading, toggle };
}
