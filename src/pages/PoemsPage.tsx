import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import { usePoemSeries } from '../hooks/useSeries';
import { CARD_GRADIENTS } from '../lib/constants';
import styles from './PoemsPage.module.css';

export default function PoemsPage() {
  const { series, loading } = usePoemSeries();

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
          ) : (
            <p className={styles.empty}>아직 등록된 시집이 없습니다.</p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
