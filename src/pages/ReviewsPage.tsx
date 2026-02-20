import { useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import { useReviews } from '../hooks/useReviews';
import { useAuth } from '../hooks/useAuth';
import styles from './ReviewsPage.module.css';

export default function ReviewsPage() {
  const { reviews, loading, createReview } = useReviews();
  const { isLoggedIn, profile, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);

    await createReview({
      author_name: isLoggedIn
        ? (profile?.display_name || user?.email || '익명')
        : (authorName.trim() || '익명'),
      content: content.trim(),
      user_id: user?.id || null,
    });

    setContent('');
    setAuthorName('');
    setShowForm(false);
    setSubmitting(false);
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

          <div className={styles.writeArea}>
            {!showForm ? (
              <button className={styles.writeBtn} onClick={() => setShowForm(true)}>
                후기 작성하기
              </button>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                {!isLoggedIn && (
                  <input
                    className={styles.formInput}
                    placeholder="닉네임 (선택)"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    maxLength={30}
                  />
                )}
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
                    onClick={() => { setShowForm(false); setContent(''); setAuthorName(''); }}
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
                    <span className={styles.reviewDate}>{formatDate(review.created_at)}</span>
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
