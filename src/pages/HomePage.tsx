import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import PoemCard from '../components/ui/PoemCard';
import YouTubeEmbed from '../components/ui/YouTubeEmbed';
import SunoEmbed from '../components/ui/SunoEmbed';
import HeroEffects from '../components/ui/HeroEffects';
import { useFeaturedPoems } from '../hooks/usePoems';
import { useFeaturedSong, useLatestSongs } from '../hooks/useSongs';
import { SITE } from '../lib/constants';
import styles from './HomePage.module.css';

const HERO_IMAGES = [
  '/images/hero-lighthouse-1.png',
  '/images/hero-sunset-a.png',
  '/images/hero-forest.png',
  '/images/hero-lighthouse-3.png',
  '/images/hero-lighthouse-2.png',
];

const SLIDES = [
  { quote: '파도가 밀려오듯\n시가 가슴에 닿고\n바다가 노래합니다', author: '— 호해 이성헌' },
  { quote: '석양이 물드는 하늘 아래\n하루의 끝에서\n시가 피어납니다', author: '— 호해 이성헌' },
  { quote: '숲이 들려주는 이야기\n나뭇잎 사이로\n바람이 시를 읊는다', author: '— 호해 이성헌' },
  { quote: '황혼이 내려앉은 바다 위\n등대 하나 서서\n어둠 속 길을 밝힌다', author: '— 호해 이성헌' },
  { quote: '빗줄기 사이로\n도시의 불빛이 흐르고\n밤은 시가 된다', author: '— 호해 이성헌' },
  { quote: '달빛이 바다 위에\n은빛 길을 놓으면\n밤은 고요히 노래한다', author: '— 호해 이성헌' },
  { quote: '수평선 너머로\n붉은 하늘이 물들면\n바다는 시가 된다', author: '— 호해 이성헌' },
];

const SLIDE_INTERVAL = 6000;

export default function HomePage() {
  const { poems, loading: poemsLoading } = useFeaturedPoems();
  const { song, loading: songLoading } = useFeaturedSong();
  const { songs: latestSongs, loading: latestSongsLoading } = useLatestSongs();
  const [active, setActive] = useState(0);
  const [heroReady, setHeroReady] = useState(false);
  const preloadedRef = useRef(false);

  const goTo = useCallback((i: number) => {
    setActive(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  // Preload hero images — first image triggers heroReady for instant display
  useEffect(() => {
    if (preloadedRef.current) return;
    preloadedRef.current = true;

    const first = new Image();
    first.src = HERO_IMAGES[0];
    first.onload = () => setHeroReady(true);
    // Fallback: show hero after 2s even if image fails
    const fallback = setTimeout(() => setHeroReady(true), 2000);

    // Preload remaining images in background
    HERO_IMAGES.slice(1).forEach(src => {
      const img = new Image();
      img.src = src;
    });

    return () => clearTimeout(fallback);
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
        {HERO_IMAGES.slice(1).map(src => (
          <link key={src} rel="preload" as="image" href={src} />
        ))}
      </Helmet>

      {/* 히어로 캐러셀 */}
      <section className={`${styles.hero} ${heroReady ? styles.heroReady : ''}`}>
        {/* 슬라이드 1: 빨간 등대 (밤바다 사진) */}
        <div className={`${styles.slide} ${styles.slideLighthouse1} ${active === 0 ? styles.slideActive : ''}`}>
          <div className={styles.lighthouseImg1} />
        </div>

        {/* 슬라이드 2: 석양 / 노을 바다 (사진 배경) */}
        <div className={`${styles.slide} ${styles.slideSunset} ${active === 1 ? styles.slideActive : ''}`}>
          <div className={styles.sunsetImg} />
          <div className={styles.sunsetWarmGlow} />
          <div className={styles.sunsetReflection} />
          <div className={styles.sunsetOverlay} />
        </div>

        {/* 슬라이드 3: 숲 (전나무 실루엣 + 안개 + 반딧불) */}
        <div className={`${styles.slide} ${styles.slideForest} ${active === 2 ? styles.slideActive : ''}`}>
          <div className={styles.forestBg} />
          <div className={styles.forestLightRays} />
          <div className={styles.forestTrees} />
          <div className={styles.forestMistLayer} />
          <div className={styles.forestOverlay} />
        </div>

        {/* 슬라이드 4: 황혼 등대 (밤바다 사진) */}
        <div className={`${styles.slide} ${styles.slideLighthouse3} ${active === 3 ? styles.slideActive : ''}`}>
          <div className={styles.lighthouseImg3} />
        </div>

        {/* 슬라이드 5: 비 오는 도시 (사이버틱 + 번개) */}
        <div className={`${styles.slide} ${styles.slideCity} ${active === 4 ? styles.slideActive : ''}`}>
          <div className={styles.cityBg} />
          <div className={styles.cityNeonHaze} />
          <div className={styles.citySkyline} />
          <div className={styles.cityReflection} />
          <div className={styles.cityRainCSS} />
          <div className={styles.cityOverlay} />
        </div>

        {/* 슬라이드 6: 밤바다 (별 + 오로라 + 발광 플랑크톤) */}
        <div className={`${styles.slide} ${styles.slideNightSea} ${active === 5 ? styles.slideActive : ''}`}>
          <div className={styles.nightSeaBg} />
          <div className={styles.nightSeaStars} />
          <div className={styles.nightSeaMoon} />
          <div className={styles.nightSeaWaves} />
          <div className={styles.nightSeaOverlay} />
        </div>

        {/* 슬라이드 7: 빨간 등대 2 (블루아워 사진) */}
        <div className={`${styles.slide} ${styles.slideLighthouse2} ${active === 6 ? styles.slideActive : ''}`}>
          <div className={styles.lighthouseImg2} />
        </div>

        {/* Canvas 기반 JavaScript 인터랙티브 효과 레이어 */}
        <HeroEffects activeSlide={active} isActive={true} />

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

      {/* 바로가기 위젯 */}
      <section className={styles.widgetSection}>
        <div className="container">
          <div className={styles.widgetGrid}>
            <Link to="/poems" className={styles.widget}>
              <span className={styles.widgetIcon}>詩</span>
              <div className={styles.widgetText}>
                <strong>추천 시</strong>
                <span>엄선된 시를 만나보세요</span>
              </div>
            </Link>
            <Link to="/poem-series" className={styles.widget}>
              <span className={styles.widgetIcon}>冊</span>
              <div className={styles.widgetText}>
                <strong>시 모음집</strong>
                <span>주제별로 묶은 시 모음</span>
              </div>
            </Link>
            <Link to="/songs" className={styles.widget}>
              <span className={styles.widgetIcon}>歌</span>
              <div className={styles.widgetText}>
                <strong>추천 노래</strong>
                <span>시에 담긴 노래를 들어보세요</span>
              </div>
            </Link>
            <Link to="/community" className={styles.widget}>
              <span className={styles.widgetIcon}>友</span>
              <div className={styles.widgetText}>
                <strong>커뮤니티</strong>
                <span>함께 나누는 감상과 이야기</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 최신 시 */}
      <section className={styles.poemsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className="section-title">최신 시</h2>
            <Link to="/poems" className={styles.viewAll}>추천 시 보기 →</Link>
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
              <Link to="/songs" className={styles.viewAll}>추천 노래 보기 →</Link>
            </div>
            <div className={styles.songContent}>
              {song.youtube_id ? (
                <YouTubeEmbed videoId={song.youtube_id} title={song.title} />
              ) : song.suno_url ? (
                <SunoEmbed sunoUrl={song.suno_url} title={song.title} />
              ) : null}
              <p className={styles.songTitle}>{song.title}</p>
            </div>
          </div>
        </section>
      )}

      {/* 최신 노래 목록 */}
      {!latestSongsLoading && latestSongs.length > 0 && (
        <section className={styles.latestSongsSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className="section-title">최신 노래</h2>
              <Link to="/latest-songs" className={styles.viewAll}>전체 보기 →</Link>
            </div>
            <ul className={styles.songList}>
              {latestSongs.slice(0, 5).map((s, i) => (
                <motion.li
                  key={s.id}
                  className={styles.songListItem}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Link to={s.youtube_id ? `/songs` : `/latest-songs`} className={styles.songListLink}>
                    {s.youtube_id && (
                      <img
                        className={styles.songListThumb}
                        src={`https://img.youtube.com/vi/${s.youtube_id}/default.jpg`}
                        alt=""
                        loading="lazy"
                      />
                    )}
                    <div className={styles.songListInfo}>
                      <strong>{s.title}</strong>
                      {s.description && <span>{s.description}</span>}
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ul>
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
