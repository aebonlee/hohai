import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/layout/PageTransition';
import PoemCard from '../components/ui/PoemCard';
import CategoryFilter from '../components/ui/CategoryFilter';
import { usePoems } from '../hooks/usePoems';
import { useCategories } from '../hooks/useCategories';
import { useSeriesDetail } from '../hooks/useSeries';
import styles from './PoemSeriesPage.module.css';

export default function PoemSeriesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { series, loading: seriesLoading } = useSeriesDetail(slug);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { categories } = useCategories();
  const { poems, loading } = usePoems(
    selectedCategory || undefined,
    series?.id
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
          <Link to="/poems" className={styles.backLink}>← 시집 목록</Link>

          <div className={styles.header}>
            <h1 className="section-title" style={{ display: 'inline-block' }}>
              {series?.name || '시집'}
            </h1>
            {series?.description && (
              <p className={styles.subtitle}>{series.description}</p>
            )}
          </div>

          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

          {loading ? (
            <p className={styles.empty}>불러오는 중...</p>
          ) : poems.length > 0 ? (
            <div className={styles.grid}>
              {poems.map((poem, i) => (
                <PoemCard key={poem.id} poem={poem} index={i} />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>
              {selectedCategory
                ? '이 카테고리에 등록된 시가 없습니다.'
                : '아직 이 시집에 등록된 시가 없습니다.'}
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
