import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useComments } from '../../hooks/useComments';
import { formatDate } from '../../lib/formatDate';
import type { TargetType } from '../../types/interaction';
import styles from './CommentSection.module.css';

interface Props {
  targetType: TargetType;
  targetId: string;
}

export default function CommentSection({ targetType, targetId }: Props) {
  const { isLoggedIn, user, profile } = useAuth();
  const { comments, loading, addComment, updateComment, deleteComment } = useComments(targetType, targetId);

  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setSubmitting(true);
    const { error } = await addComment({
      user_id: user.id,
      target_type: targetType,
      target_id: targetId,
      content: content.trim(),
      author_name: profile?.display_name || user.email || '익명',
    });

    if (error) {
      showFeedback('댓글 등록에 실패했습니다.', 'error');
    } else {
      setContent('');
      showFeedback('댓글이 등록되었습니다.');
    }
    setSubmitting(false);
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    const { error } = await updateComment(commentId, editContent.trim());
    if (error) {
      showFeedback('수정에 실패했습니다.', 'error');
    } else {
      setEditingId(null);
      setEditContent('');
      showFeedback('댓글이 수정되었습니다.');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    const { error } = await deleteComment(commentId);
    if (error) {
      showFeedback('삭제에 실패했습니다.', 'error');
    } else {
      showFeedback('댓글이 삭제되었습니다.');
    }
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>댓글 {comments.length > 0 && `(${comments.length})`}</h3>

      {feedback && (
        <div className={`${styles.feedback} ${styles[feedback.type]}`}>
          {feedback.message}
        </div>
      )}

      {/* 댓글 작성 */}
      {!isLoggedIn ? (
        <div className={styles.loginPrompt}>
          <p>로그인 후 댓글을 남겨주세요</p>
          <Link to="/login" className={styles.loginLink}>로그인하기</Link>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <textarea
            className={styles.textarea}
            placeholder="댓글을 작성해주세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            rows={3}
          />
          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !content.trim()}
            >
              {submitting ? '등록 중...' : '등록'}
            </button>
          </div>
        </form>
      )}

      {/* 댓글 목록 */}
      {loading ? (
        <p className={styles.empty}>불러오는 중...</p>
      ) : comments.length > 0 ? (
        <div className={styles.list}>
          {comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <span className={styles.commentAuthor}>{comment.author_name}</span>
                <div className={styles.commentMeta}>
                  <span className={styles.commentDate}>{formatDate(comment.created_at)}</span>
                  {isLoggedIn && user?.id === comment.user_id && (
                    <>
                      <button
                        className={styles.actionBtn}
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditContent(comment.content);
                        }}
                      >
                        수정
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.delete}`}
                        onClick={() => handleDelete(comment.id)}
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </div>
              {editingId === comment.id ? (
                <>
                  <textarea
                    className={styles.editTextarea}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    maxLength={1000}
                  />
                  <div className={styles.editActions}>
                    <button className={styles.submitBtn} onClick={() => handleEdit(comment.id)} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                      저장
                    </button>
                    <button className={styles.actionBtn} onClick={() => setEditingId(null)}>
                      취소
                    </button>
                  </div>
                </>
              ) : (
                <p className={styles.commentContent}>{comment.content}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>아직 댓글이 없습니다. 첫 번째 댓글을 남겨주세요!</p>
      )}
    </div>
  );
}
