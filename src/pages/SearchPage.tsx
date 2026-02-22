import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/layout/PageTransition';
import PoemCard from '../components/ui/PoemCard';
import SongCard from '../components/ui/SongCard';
import { useSearch } from '../hooks/useSearch';
import styles from './SearchPage.module.css';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const { results, loading } = useSearch(query);

  // URL → state 동기화
  useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q !== query) setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim()) {
      setSearchParams({ q: value }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const totalCount = results.poems.length + results.songs.length;
  const hasQuery = query.trim().length > 0;

  return (
    <PageTransition>
      <Helmet>
        <title>{hasQuery ? `"${query}" 검색 결과 — 好海` : '검색 — 好海'}</title>
      </Helmet>

      <div className={styles.page}>
        <div className="container">
          <div className={styles.searchHeader}>
            <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '24px' }}>검색</h1>
            <div className={styles.searchInputWrapper}>
              <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className={styles.searchInput}
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="시 제목, 내용, 노래 가사로 검색..."
                autoFocus
              />
            </div>
          </div>

          {loading && hasQuery && (
            <p className={styles.resultInfo}>검색 중...</p>
          )}

          {!loading && hasQuery && (
            <p className={styles.resultInfo}>
              "{query}" 검색 결과 {totalCount}건
            </p>
          )}

          {!loading && hasQuery && results.poems.length > 0 && (
            <>
              <h2 className={styles.sectionTitle}>시 ({results.poems.length})</h2>
              <div className={styles.poemGrid}>
                {results.poems.map((poem, i) => (
                  <PoemCard key={poem.id} poem={poem} index={i} />
                ))}
              </div>
            </>
          )}

          {!loading && hasQuery && results.songs.length > 0 && (
            <>
              <h2 className={styles.sectionTitle}>노래 ({results.songs.length})</h2>
              <div className={styles.songList}>
                {results.songs.map((song, i) => (
                  <SongCard key={song.id} song={song} index={i} />
                ))}
              </div>
            </>
          )}

          {!loading && hasQuery && totalCount === 0 && (
            <p className={styles.empty}>
              검색 결과가 없습니다. 다른 키워드로 검색해보세요.
            </p>
          )}

          {!hasQuery && (
            <p className={styles.empty}>
              시 제목, 내용, 노래 가사를 검색할 수 있습니다.
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
