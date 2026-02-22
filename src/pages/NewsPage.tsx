import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import { useNews } from '../hooks/useNews';
import { useAuth } from '../hooks/useAuth';
import styles from './NewsPage.module.css';

export default function NewsPage() {
  const { items, loading, createItem, deleteItem } = useNews();
  const { isLoggedIn, profile, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !isLoggedIn) return;
    setSubmitting(true);
    setFeedback(null);

    const { error } = await createItem({
      title: title.trim(),
      content: content.trim(),
      author_name: profile?.display_name || user?.email || '익명',
      user_id: user?.id || null,
    });

    if (error) {
      setFeedback({ type: 'error', message: '등록에 실패했습니다. 다시 시도해주세요.' });
    } else {
      setFeedback({ type: 'success', message: '소식이 등록되었습니다.' });
      setTitle('');
      setContent('');
      setShowForm(false);
    }
    setSubmitting(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const { error } = await deleteItem(id);
    if (error) {
      setFeedback({ type: 'error', message: '삭제에 실패했습니다.' });
    } else {
      setFeedback({ type: 'success', message: '삭제되었습니다.' });
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
        <title>소식통 — 好海</title>
        <meta name="description" content="好海 소식통 — 소식과 이야기를 전해주세요" />
      </Helmet>

      <div className={styles.page}>
        <div className="container">
          <Link to="/community" className={styles.backLink}>&larr; 커뮤니티</Link>

          <div className={styles.header}>
            <h1 className="section-title" style={{ display: 'inline-block' }}>소식통</h1>
            <p className={styles.subtitle}>소식과 이야기를 전해주세요</p>
          </div>

          {feedback && (
            <div className={`${styles.feedback} ${styles[feedback.type]}`}>
              {feedback.message}
            </div>
          )}

          <div className={styles.writeArea}>
            {!isLoggedIn ? (
              <div className={styles.loginPrompt}>
                <p>로그인 후 소식을 전해주세요</p>
                <Link to="/login" className={styles.loginLink}>로그인하기</Link>
              </div>
            ) : !showForm ? (
              <button className={styles.writeBtn} onClick={() => setShowForm(true)}>
                소식 작성하기
              </button>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <input
                  className={styles.formInput}
                  type="text"
                  placeholder="제목"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <textarea
                  className={styles.formTextarea}
                  placeholder="내용을 작성해주세요..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={5}
                />
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => { setShowForm(false); setTitle(''); setContent(''); }}
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
          ) : items.length > 0 ? (
            <div className={styles.newsList}>
              {items.map((item, i) => (
                <motion.article
                  key={item.id}
                  className={styles.newsCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <div className={styles.newsHeader}>
                    <h3 className={styles.newsTitle}>{item.title}</h3>
                    <div className={styles.newsHeaderRight}>
                      <span className={styles.newsDate}>{formatDate(item.created_at)}</span>
                      {isLoggedIn && user?.id === item.user_id && (
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(item.id)}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                  <p className={styles.newsContent}>{item.content}</p>
                  <span className={styles.newsAuthor}>{item.author_name}</span>
                </motion.article>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>
              아직 소식이 없습니다. 첫 번째 소식을 전해주세요!
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
