import { useState, useEffect, useCallback } from 'react';
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

const SLIDES = [
  { quote: '파도가 밀려오듯\n시가 가슴에 닿고\n바다가 노래합니다', author: '— 호해 이성헌' },
  { quote: '석양이 물드는 하늘 아래\n하루의 끝에서\n시가 피어납니다', author: '— 호해 이성헌' },
  { quote: '숲이 들려주는 이야기\n나뭇잎 사이로\n바람이 시를 읊는다', author: '— 호해 이성헌' },
  { quote: '빗줄기 사이로\n도시의 불빛이 흐르고\n밤은 시가 된다', author: '— 호해 이성헌' },
  { quote: '달빛이 바다 위에\n은빛 길을 놓으면\n밤은 고요히 노래한다', author: '— 호해 이성헌' },
];

const SLIDE_INTERVAL = 6000;

export default function HomePage() {
  const { poems, loading: poemsLoading } = useFeaturedPoems();
  const { song, loading: songLoading } = useFeaturedSong();
  const [active, setActive] = useState(0);

  const goTo = useCallback((i: number) => {
    setActive(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActive(p => (p + 1) % SLIDES.length), SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <PageTransition>
      <Helmet>
        <title>{SITE.title}</title>
        <meta name="description" content={SITE.description} />
      </Helmet>

      {/* 히어로 캐러셀 */}
      <section className={styles.hero}>
        {/* 슬라이드 배경들 */}
        <div className={`${styles.slide} ${styles.slideOcean} ${active === 0 ? styles.slideActive : ''}`}>
          <div className={styles.oceanBg} />
          <div className={styles.oceanClouds} />
          <div className={styles.oceanScenery} />
          <div className={styles.oceanWaveMid} />
          <div className={styles.oceanBottom} />
        </div>

        <div className={`${styles.slide} ${styles.slideSunset} ${active === 1 ? styles.slideActive : ''}`}>
          <div className={styles.sunsetBg} />
          <div className={styles.sunsetSun} />
          <div className={styles.sunsetMountains} />
        </div>

        <div className={`${styles.slide} ${styles.slideForest} ${active === 2 ? styles.slideActive : ''}`}>
          <div className={styles.forestBg} />
          <div className={styles.forestTrees} />
          <div className={styles.forestMist} />
          <div className={styles.forestParticles} />
        </div>

        <div className={`${styles.slide} ${styles.slideCity} ${active === 3 ? styles.slideActive : ''}`}>
          <div className={styles.cityBg} />
          <div className={styles.citySkyline} />
          <div className={styles.cityRain} />
        </div>

        <div className={`${styles.slide} ${styles.slideNightSea} ${active === 4 ? styles.slideActive : ''}`}>
          <div className={styles.nightSeaBg} />
          <div className={styles.nightSeaMoon} />
          <div className={styles.nightSeaWaves} />
        </div>

        {/* 콘텐츠 */}
        <motion.div
          className={styles.heroContent}
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className={styles.heroLogo}>好海</h1>
          <p className={styles.heroSubLogo}>호해 — 바다를 사랑하다</p>
          <p className={styles.heroQuote}>{SLIDES[active].quote}</p>
          <p className={styles.heroAuthor}>{SLIDES[active].author}</p>
        </motion.div>

        {/* 캐러셀 컨트롤 */}
        <div className={styles.carouselControls}>
          <button className={styles.carouselArrow} onClick={() => goTo(active - 1)} aria-label="이전">
            ‹
          </button>
          <div className={styles.carouselDots}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${active === i ? styles.dotActive : ''}`}
                onClick={() => goTo(i)}
                aria-label={`슬라이드 ${i + 1}`}
              />
            ))}
          </div>
          <button className={styles.carouselArrow} onClick={() => goTo(active + 1)} aria-label="다음">
            ›
          </button>
        </div>

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
              海
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
