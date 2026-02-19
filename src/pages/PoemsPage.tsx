import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/layout/PageTransition';
import PoemCard from '../components/ui/PoemCard';
import CategoryFilter from '../components/ui/CategoryFilter';
import { usePoems } from '../hooks/usePoems';
import { useCategories } from '../hooks/useCategories';
import styles from './PoemsPage.module.css';

export default function PoemsPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const { categories } = useCategories();
  const { poems, loading } = usePoems(selectedCategory || undefined);

  return (
    <PageTransition>
      <Helmet>
        <title>시(詩) — 호해</title>
        <meta name="description" content="호해 이성헌 시인의 시 모음" />
      </Helmet>

      <div className={styles.page}>
        <div className="container">
          <div className={styles.header}>
            <h1 className="section-title" style={{ display: 'inline-block' }}>시(詩)</h1>
            <p className={styles.subtitle}>마음을 담아 쓴 시를 만나보세요</p>
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
                : '아직 등록된 시가 없습니다.'}
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
