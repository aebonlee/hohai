import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import ViewModeSelector, { useViewMode } from '../components/ui/ViewModeSelector';
import { useSongSeries } from '../hooks/useSeries';
import { CARD_GRADIENTS } from '../lib/constants';
import styles from './SongsPage.module.css';

export default function SongsPage() {
  const { series, loading } = useSongSeries();
  const [viewMode] = useViewMode('songSeries');

  return (
    <PageTransition>
      <Helmet>
        <title>노래 — 好海</title>
        <meta name="description" content="好海 이성헌 시인의 노래 모음" />
      </Helmet>

      <div className={styles.page}>
        <div className="container">
          <div className={styles.header}>
            <h1 className="section-title" style={{ display: 'inline-block' }}>노래</h1>
            <p className={styles.subtitle}>시에 멜로디를 입혀 노래로 전합니다</p>
          </div>

          <div className={styles.toolbar}>
            <ViewModeSelector storageKey="songSeries" />
          </div>

          {loading ? (
            <p className={styles.empty}>불러오는 중...</p>
          ) : series.length > 0 ? (
            viewMode === 'board' ? (
              <div className={styles.boardList}>
                <div className={styles.boardHeader}>
                  <span className={styles.boardColNum}>#</span>
                  <span className={styles.boardColTitle}>앨범</span>
                  <span className={styles.boardColDesc}>설명</span>
                </div>
                {series.map((s, i) => (
                  <Link key={s.id} to={`/albums/${s.slug}`} className={styles.boardRow}>
                    <span className={styles.boardColNum}>{`${i + 1}집`}</span>
                    <span className={styles.boardColTitle}>{s.name}</span>
                    <span className={styles.boardColDesc}>{s.description || ''}</span>
                  </Link>
                ))}
              </div>
            ) : viewMode === 'blog' ? (
              <div className={styles.blogList}>
                {series.map((s, i) => (
                  <Link key={s.id} to={`/albums/${s.slug}`} className={styles.blogItem}>
                    <span className={styles.blogOrder}>{`${i + 1}집`}</span>
                    <h3 className={styles.blogTitle}>{s.name}</h3>
                    {s.description && <p className={styles.blogDesc}>{s.description}</p>}
                    <span className={styles.blogArrow}>노래 듣기 →</span>
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
                    <Link to={`/albums/${s.slug}`} className={styles.seriesCard}>
                      <div
                        className={styles.seriesCardBg}
                        style={{ background: CARD_GRADIENTS[(i + 3) % CARD_GRADIENTS.length] }}
                      />
                      <div className={styles.seriesCardContent}>
                        <span className={styles.seriesOrder}>{`${i + 1}집`}</span>
                        <h3 className={styles.seriesName}>{s.name}</h3>
                        {s.description && <p className={styles.seriesDesc}>{s.description}</p>}
                        <span className={styles.seriesArrow}>노래 듣기 →</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            <p className={styles.empty}>아직 등록된 앨범이 없습니다.</p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
