import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import { useReviews } from '../hooks/useReviews';
import { useAuth } from '../hooks/useAuth';
import styles from './ReviewsPage.module.css';

export default function ReviewsPage() {
  const { reviews, loading, createReview, deleteReview } = useReviews();
  const { isLoggedIn, profile, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !isLoggedIn) return;
    setSubmitting(true);
    setFeedback(null);

    const { error } = await createReview({
      author_name: profile?.display_name || user?.email || '익명',
      content: content.trim(),
      user_id: user?.id || null,
    });

    if (error) {
      setFeedback({ type: 'error', message: '등록에 실패했습니다. 다시 시도해주세요.' });
    } else {
      setFeedback({ type: 'success', message: '감상 후기가 등록되었습니다.' });
      setContent('');
      setShowForm(false);
    }
    setSubmitting(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const { error } = await deleteReview(id);
    if (error) {
      setFeedback({ type: 'error', message: '삭제에 실패했습니다.' });
    } else {
      setFeedback({ type: 'success', message: '후기가 삭제되었습니다.' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <PageTransition>
      <Helmet>
        <title>감상 후기 — 好海</title>
        <meta name="description" content="好海 이성헌 시인의 시와 노래에 대한 감상 후기" />
      </Helmet>

      <div className={styles.page}>
        <div className="container">
          <div className={styles.header}>
            <h1 className="section-title" style={{ display: 'inline-block' }}>감상 후기</h1>
            <p className={styles.subtitle}>시와 노래를 감상하신 소감을 나눠주세요</p>
          </div>

          {feedback && (
            <div className={`${styles.feedback} ${styles[feedback.type]}`}>
              {feedback.message}
            </div>
          )}

          <div className={styles.writeArea}>
            {!isLoggedIn ? (
              <div className={styles.loginPrompt}>
                <p>로그인 후 감상 후기를 남겨주세요</p>
                <Link to="/login" className={styles.loginLink}>로그인하기</Link>
              </div>
            ) : !showForm ? (
              <button className={styles.writeBtn} onClick={() => setShowForm(true)}>
                후기 작성하기
              </button>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <textarea
                  className={styles.formTextarea}
                  placeholder="감상 후기를 작성해주세요..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={4}
                />
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => { setShowForm(false); setContent(''); }}
                  >
                    취소
                  </button>
                  <button type="submit" className={styles.submitBtn} disabled={submitting}>
                    {submitting ? '등록 중...' : '등록'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {loading ? (
            <p className={styles.empty}>불러오는 중...</p>
          ) : reviews.length > 0 ? (
            <div className={styles.reviewList}>
              {reviews.map((review, i) => (
                <motion.article
                  key={review.id}
                  className={styles.reviewCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <div className={styles.reviewHeader}>
                    <span className={styles.reviewAuthor}>{review.author_name}</span>
                    <div className={styles.reviewHeaderRight}>
                      <span className={styles.reviewDate}>{formatDate(review.created_at)}</span>
                      {isLoggedIn && user?.id === review.user_id && (
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(review.id)}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                  <p className={styles.reviewContent}>{review.content}</p>
                </motion.article>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>
              아직 감상 후기가 없습니다. 첫 번째 후기를 남겨주세요!
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
