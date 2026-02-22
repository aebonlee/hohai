import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import { usePoemSeries } from '../hooks/useSeries';
import styles from './PublishedBooksPage.module.css';

export default function PublishedBooksPage() {
  const { series: poemSeries } = usePoemSeries();

  return (
    <PageTransition>
      <Helmet>
        <title>출간시집 — 好海</title>
        <meta name="description" content="好海 이성헌 시인의 출간 시집 안내" />
      </Helmet>

      <div className={styles.page}>
        <div className="container">
          <div className={styles.header}>
            <h1 className="section-title" style={{ display: 'inline-block' }}>출간시집</h1>
            <p className={styles.subtitle}>시인 이성헌의 시(詩)가 한 권의 책으로 만나는 곳</p>
          </div>

          <div className={styles.bookList}>
            <motion.div
              className={styles.bookCard}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className={styles.bookCover}>
                <div className={styles.bookCoverInner}>
                  <span className={styles.bookCoverIcon}>📖</span>
                  <span className={styles.bookCoverTitle}>무지개 빛으로{'\n'}채색된 삶</span>
                  <span className={styles.bookCoverAuthor}>好海 이성헌</span>
                </div>
              </div>
              <div className={styles.bookInfo}>
                <h2 className={styles.bookTitle}>무지개 빛으로 채색된 삶</h2>
                <p className={styles.bookAuthor}>好海 이성헌 지음</p>
                <div className={styles.bookMeta}>
                  <span>177편의 시 수록</span>
                  <span>사랑 · 인생 · 그리움 · 자연 · 가족 외</span>
                </div>
                <p className={styles.bookDesc}>
                  바다를 사랑하는 시인이 삶의 여정에서 만난 감동과 성찰을
                  한 편 한 편 정성껏 담아낸 시집입니다.
                  사랑, 인생, 그리움, 자연, 가족 등 다양한 주제로
                  삶의 무지개빛 순간들을 시(詩)로 채색합니다.
                </p>
                {poemSeries.length > 0 && (
                  <div className={styles.bookLinks}>
                    <span className={styles.bookLinksLabel}>온라인으로 읽기:</span>
                    {poemSeries.map((s, i) => (
                      <Link key={s.id} to={`/poem-series/${s.slug}`} className={styles.bookLink}>
                        제{i + 1}권 — {s.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className={styles.notice}>
            <h3 className={styles.noticeTitle}>시집 안내</h3>
            <p className={styles.noticeText}>
              출간시집에 대한 자세한 정보는 <Link to="/about" className={styles.noticeLink}>시인 소개</Link> 페이지를 참고하시거나,
              <Link to="/community" className={styles.noticeLink}> 커뮤니티</Link>에서 문의해 주세요.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
