import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import { useSongSeries } from '../hooks/useSeries';
import { CARD_GRADIENTS } from '../lib/constants';
import styles from './SongsPage.module.css';

export default function SongsPage() {
  const { series, loading } = useSongSeries();

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

          {loading ? (
            <p className={styles.empty}>불러오는 중...</p>
          ) : series.length > 0 ? (
            <div className={styles.seriesGrid}>
              {series.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link to={`/songs/series/${s.slug}`} className={styles.seriesCard}>
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
          ) : (
            <p className={styles.empty}>아직 등록된 앨범이 없습니다.</p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
