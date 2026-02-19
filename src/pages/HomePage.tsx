import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import PoemCard from '../components/ui/PoemCard';
import YouTubeEmbed from '../components/ui/YouTubeEmbed';
import { useFeaturedPoems } from '../hooks/usePoems';
import { useFeaturedSong } from '../hooks/useSongs';
import { SITE } from '../lib/constants';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { poems, loading: poemsLoading } = useFeaturedPoems();
  const { song, loading: songLoading } = useFeaturedSong();

  return (
    <PageTransition>
      <Helmet>
        <title>{SITE.title}</title>
        <meta name="description" content={SITE.description} />
      </Helmet>

      {/* 히어로 섹션 */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className={styles.heroLogo}>호해</h1>
          <p className={styles.heroSubLogo} style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: 24, letterSpacing: '0.15em' }}>好海 — 바다를 사랑하다</p>
          <p className={styles.heroQuote}>
            {`파도가 밀려오듯\n시가 가슴에 닿고\n바다가 노래합니다`}
          </p>
          <p className={styles.heroAuthor}>— 호해 이성헌</p>
        </motion.div>
        <div className={styles.scrollHint}>
          <span>아래로</span>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* 최신 시 */}
      <section className={styles.poemsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className="section-title">최신 시</h2>
            <Link to="/poems" className={styles.viewAll}>모든 시 보기 →</Link>
          </div>
          {poemsLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>불러오는 중...</p>
          ) : poems.length > 0 ? (
            <div className={styles.poemsGrid}>
              {poems.map((poem, i) => (
                <PoemCard key={poem.id} poem={poem} index={i} />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-serif)' }}>
              아직 등록된 시가 없습니다. 곧 아름다운 시를 만나보실 수 있습니다.
            </p>
          )}
        </div>
      </section>

      {/* 노래 하이라이트 */}
      {!songLoading && song && (
        <section className={styles.songSection}>
          <div className={styles.songInner}>
            <div className={styles.sectionHeader}>
              <h2 className="section-title">노래</h2>
              <Link to="/songs" className={styles.viewAll}>모든 노래 보기 →</Link>
            </div>
            <div className={styles.songContent}>
              <YouTubeEmbed videoId={song.youtube_id} title={song.title} />
              <p className={styles.songTitle}>{song.title}</p>
            </div>
          </div>
        </section>
      )}

      {/* 시인 소개 요약 */}
      <section className={styles.aboutSection}>
        <div className="container">
          <motion.div
            className={styles.aboutInner}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.aboutPhotoPlaceholder}>
              호
            </div>
            <div className={styles.aboutText}>
              <h3>호해 이성헌</h3>
              <p>
                바다를 사랑하는 시인. 파도 소리에 귀 기울이며
                시와 노래로 삶의 아름다움을 전합니다.
              </p>
              <Link to="/about" className={styles.aboutLink}>
                자세히 보기 →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
}
