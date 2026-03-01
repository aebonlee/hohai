import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/layout/PageTransition';
import PoemCard from '../components/ui/PoemCard';
import PoemReaderMode from '../components/ui/PoemReaderMode';
import CategoryFilter from '../components/ui/CategoryFilter';
import ViewModeSelector, { useViewMode } from '../components/ui/ViewModeSelector';
import { usePoems } from '../hooks/usePoems';
import { useCategories } from '../hooks/useCategories';
import { useSeriesDetail } from '../hooks/useSeries';
import { CATEGORY_COLORS } from '../lib/constants';
import styles from './PoemSeriesPage.module.css';

export default function PoemSeriesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { series, loading: seriesLoading } = useSeriesDetail(slug);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [readerOpen, setReaderOpen] = useState(false);
  const [readerInitialIndex, setReaderInitialIndex] = useState(0);
  const [viewMode, setViewMode] = useViewMode('poemSeriesDetail');
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { poems, loading } = usePoems(
    selectedCategory || undefined,
    series?.id,
    false,
    undefined,
    !!series?.id,
  );

  if (seriesLoading) {
    return (
      <PageTransition>
        <div className={styles.page}>
          <div className="container">
            <p className={styles.empty}>불러오는 중...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Helmet>
        <title>{series?.name || '시집'} — 好海</title>
        <meta name="description" content={series?.description || '好海 이성헌 시인의 시'} />
      </Helmet>

      <div className={styles.page}>
        <div className="container">
          <Link to="/poem-series" className={styles.backLink}>← 시집 목록</Link>

          <div className={styles.header}>
            <h1 className="section-title" style={{ display: 'inline-block' }}>
              {series?.name || '시집'}
            </h1>
            {series?.description && (
              <p className={styles.subtitle}>{series.description}</p>
            )}
          </div>

          <div className={styles.toolbar}>
            {poems.length > 0 && !loading && (
              <button
                className={styles.readerBtn}
                onClick={() => { setReaderInitialIndex(0); setReaderOpen(true); }}
              >
                읽기 모드
              </button>
            )}
            <ViewModeSelector mode={viewMode} onChange={setViewMode} />
          </div>

          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

          {loading ? (
            <p className={styles.empty}>불러오는 중...</p>
          ) : poems.length > 0 ? (
            viewMode === 'board' ? (
              <div className={styles.boardList}>
                <div className={styles.boardHeader}>
                  <span className={styles.boardColNum}>#</span>
                  <span className={styles.boardColTitle}>제목</span>
                  <span className={styles.boardColCat}>카테고리</span>
                  <span className={styles.boardColView}>조회</span>
                  <span className={styles.boardColDate}>날짜</span>
                </div>
                {poems.map((poem, i) => (
                  <div
                    key={poem.id}
                    className={styles.boardRow}
                    onClick={() => navigate(`/poems/${poem.id}`)}
                  >
                    <span className={styles.boardColNum}>{i + 1}</span>
                    <span className={styles.boardColTitle}>
                      {poem.title}
                      {poem.tags && poem.tags.length > 0 && (
                        <span className={styles.boardTags}>
                          {poem.tags.slice(0, 2).map(t => <span key={t}>#{t}</span>)}
                        </span>
                      )}
                    </span>
                    <span className={styles.boardColCat} style={{ color: CATEGORY_COLORS[poem.category] }}>{poem.category}</span>
                    <span className={styles.boardColView}>{poem.view_count || 0}</span>
                    <span className={styles.boardColDate}>{poem.written_date || ''}</span>
                  </div>
                ))}
              </div>
            ) : viewMode === 'blog' ? (
              <div className={styles.blogList}>
                {poems.map((poem) => (
                  <article
                    key={poem.id}
                    className={styles.blogItem}
                    onClick={() => navigate(`/poems/${poem.id}`)}
                  >
                    <span className={styles.blogCategory} style={{ color: CATEGORY_COLORS[poem.category] }}>{poem.category}</span>
                    <h3 className={styles.blogTitle}>{poem.title}</h3>
                    <p className={styles.blogExcerpt}>
                      {poem.excerpt || poem.content.split('\n').slice(0, 4).join('\n')}
                    </p>
                    <div className={styles.blogMeta}>
                      {poem.tags && poem.tags.length > 0 && (
                        <span className={styles.blogTags}>
                          {poem.tags.slice(0, 4).map(t => <span key={t}>#{t}</span>)}
                        </span>
                      )}
                      <span>조회 {poem.view_count ?? 0}</span>
                      {poem.written_date && <span>{poem.written_date}</span>}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.grid}>
                {poems.map((poem, i) => (
                  <PoemCard key={poem.id} poem={poem} index={i} />
                ))}
              </div>
            )
          ) : (
            <p className={styles.empty}>
              {selectedCategory
                ? '이 카테고리에 등록된 시가 없습니다.'
                : '아직 이 시집에 등록된 시가 없습니다.'}
            </p>
          )}
        </div>
      </div>

      <PoemReaderMode
        poems={poems}
        initialIndex={readerInitialIndex}
        seriesName={series?.name}
        isOpen={readerOpen}
        onClose={() => setReaderOpen(false)}
      />
    </PageTransition>
  );
}
