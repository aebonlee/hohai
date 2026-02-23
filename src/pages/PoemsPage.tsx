import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import ViewModeSelector, { useViewMode } from '../components/ui/ViewModeSelector';
import { usePoemSeries } from '../hooks/useSeries';
import { CARD_GRADIENTS } from '../lib/constants';
import styles from './PoemsPage.module.css';

export default function PoemsPage() {
  const { series, loading } = usePoemSeries();
  const [viewMode] = useViewMode('poemSeries');

  return (
    <PageTransition>
      <Helmet>
        <title>시(詩) — 好海</title>
        <meta name="description" content="好海 이성헌 시인의 시집 모음" />
      </Helmet>

      <div className={styles.page}>
        <div className="container">
          <div className={styles.header}>
            <h1 className="section-title" style={{ display: 'inline-block' }}>시(詩)</h1>
            <p className={styles.subtitle}>시집별로 마음을 담아 쓴 시를 만나보세요</p>
          </div>

          <div className={styles.toolbar}>
            <ViewModeSelector storageKey="poemSeries" />
          </div>

          {loading ? (
            <p className={styles.empty}>불러오는 중...</p>
          ) : series.length > 0 ? (
            viewMode === 'board' ? (
              <div className={styles.boardList}>
                <div className={styles.boardHeader}>
                  <span className={styles.boardColNum}>#</span>
                  <span className={styles.boardColTitle}>시집</span>
                  <span className={styles.boardColDesc}>설명</span>
                </div>
                {series.map((s, i) => (
                  <Link key={s.id} to={`/poem-series/${s.slug}`} className={styles.boardRow}>
                    <span className={styles.boardColNum}>{`제${i + 1}시집`}</span>
                    <span className={styles.boardColTitle}>{s.name}</span>
                    <span className={styles.boardColDesc}>{s.description || ''}</span>
                  </Link>
                ))}
              </div>
            ) : viewMode === 'blog' ? (
              <div className={styles.blogList}>
                {series.map((s, i) => (
                  <Link key={s.id} to={`/poem-series/${s.slug}`} className={styles.blogItem}>
                    <span className={styles.blogOrder}>{`제${i + 1}시집`}</span>
                    <h3 className={styles.blogTitle}>{s.name}</h3>
                    {s.description && <p className={styles.blogDesc}>{s.description}</p>}
                    <span className={styles.blogArrow}>시 보기 →</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.seriesGrid}>
                {series.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <Link to={`/poem-series/${s.slug}`} className={styles.seriesCard}>
                      <div
                        className={styles.seriesCardBg}
                        style={{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}
                      />
                      <div className={styles.seriesCardContent}>
                        <span className={styles.seriesOrder}>{`제${i + 1}시집`}</span>
                        <h3 className={styles.seriesName}>{s.name}</h3>
                        {s.description && <p className={styles.seriesDesc}>{s.description}</p>}
                        <span className={styles.seriesArrow}>시 보기 →</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            <p className={styles.empty}>아직 등록된 시집이 없습니다.</p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
