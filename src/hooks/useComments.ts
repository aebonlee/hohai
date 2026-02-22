import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Comment, CommentInsert, TargetType } from '../types/interaction';

export function useComments(targetType: TargetType, targetId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!targetId) return;
    setLoading(true);

    const { data } = await supabase
      .from('hohai_comments')
      .select('*')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .order('created_at', { ascending: false });

    setComments((data as Comment[]) || []);
    setLoading(false);
  }, [targetType, targetId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (comment: CommentInsert) => {
    const { error } = await supabase.from('hohai_comments').insert(comment);
    if (!error) await fetchComments();
    return { error };
  };

  const updateComment = async (commentId: string, content: string) => {
    const { error } = await supabase
      .from('hohai_comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId);
    if (!error) await fetchComments();
    return { error };
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase.from('hohai_comments').delete().eq('id', commentId);
    if (!error) await fetchComments();
    return { error };
  };

  return { comments, loading, addComment, updateComment, deleteComment, refetch: fetchComments };
}
