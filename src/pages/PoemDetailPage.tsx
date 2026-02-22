import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/layout/PageTransition';
import PoemEffects from '../components/ui/PoemEffects';
import PoemReaderMode from '../components/ui/PoemReaderMode';
import { usePoemDetail, usePoems } from '../hooks/usePoems';
import { CATEGORY_COLORS, CATEGORY_NAMES } from '../lib/constants';
import type { MoodKey } from '../lib/mood';
import { MOOD_LIGHT_GRADIENTS, MOOD_ACCENT_COLORS } from '../lib/mood';
import styles from './PoemDetailPage.module.css';

export default function PoemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { poem, loading, adjacentPoems } = usePoemDetail(id);
  const [readerOpen, setReaderOpen] = useState(false);

  // 시집에 속한 시일 때 같은 시리즈의 시 목록 로드
  const { poems: seriesPoems } = usePoems(undefined, poem?.series_id || undefined);
  const readerIndex = seriesPoems.findIndex((p) => p.id === id);

  if (loading) {
    return <div className={styles.loading}>불러오는 중...</div>;
  }

  if (!poem) {
    return (
      <div className={styles.loading}>
        시를 찾을 수 없습니다.
        <br />
        <Link to="/poems" style={{ color: 'var(--accent-gold)', marginTop: 16, display: 'inline-block' }}>
          시 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // 연(stanza) 단위로 분리
  const stanzas = poem.content.split(/\n\s*\n/).filter(Boolean);

  // 카테고리 → MoodKey
  const mood: MoodKey = (MOOD_LIGHT_GRADIENTS[poem.category as MoodKey])
    ? poem.category as MoodKey
    : 'default';
  const bg = MOOD_LIGHT_GRADIENTS[mood];
  const accent = MOOD_ACCENT_COLORS[mood];

  return (
    <PageTransition>
      <Helmet>
        <title>{poem.title} — 호해</title>
        <meta name="description" content={poem.excerpt || poem.content.slice(0, 120)} />
      </Helmet>

      <div
        className={styles.page}
        style={{
          '--poem-bg1': bg.c1,
          '--poem-bg2': bg.c2,
          '--poem-bg3': bg.c3,
          '--poem-bg4': bg.c4,
          '--mood-accent': accent,
        } as React.CSSProperties}
      >
        <PoemEffects mood={mood} />
        <div className={styles.inner}>
          <Link to="/poems" className={styles.backLink}>
            ← 시 목록으로
          </Link>

          <div className={styles.category} style={{ color: CATEGORY_COLORS[poem.category] }}>{poem.category}</div>
          <h1 className={styles.title}>{poem.title}</h1>
          {poem.written_date && (
            <p className={styles.meta}>{poem.written_date}</p>
          )}

          <div className={styles.content}>
            {stanzas.map((stanza, i) => (
              <div key={i} className={styles.stanza}>
                {stanza}
              </div>
            ))}
          </div>

          {poem.tags && poem.tags.length > 0 && (
            <div className={styles.tags}>
              {poem.tags.map((tag) =>
                CATEGORY_NAMES.includes(tag) ? (
                  <Link key={tag} to={`/poems?tag=${encodeURIComponent(tag)}`} className={styles.tag}>#{tag}</Link>
                ) : (
                  <span key={tag} className={styles.tagPlain}>#{tag}</span>
                )
              )}
            </div>
          )}

          {poem.series_id && seriesPoems.length > 1 && (
            <button
              className={styles.readerBtn}
              onClick={() => setReaderOpen(true)}
            >
              읽기 모드
            </button>
          )}

          <nav className={styles.nav}>
            {adjacentPoems.prev ? (
              <Link to={`/poems/${adjacentPoems.prev.id}`} className={styles.navItem}>
                <span className={styles.navLabel}>← 이전 시</span>
                <span className={styles.navTitle}>{adjacentPoems.prev.title}</span>
              </Link>
            ) : <div />}
            {adjacentPoems.next ? (
              <Link to={`/poems/${adjacentPoems.next.id}`} className={`${styles.navItem} ${styles.navRight}`}>
                <span className={styles.navLabel}>다음 시 →</span>
                <span className={styles.navTitle}>{adjacentPoems.next.title}</span>
              </Link>
            ) : <div />}
          </nav>
        </div>
      </div>

      {poem.series_id && seriesPoems.length > 1 && (
        <PoemReaderMode
          poems={seriesPoems}
          initialIndex={readerIndex >= 0 ? readerIndex : 0}
          isOpen={readerOpen}
          onClose={() => setReaderOpen(false)}
        />
      )}
    </PageTransition>
  );
}
