import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/layout/PageTransition';
import PoemCard from '../components/ui/PoemCard';
import CategoryFilter from '../components/ui/CategoryFilter';
import { usePoems } from '../hooks/usePoems';
import { useCategories } from '../hooks/useCategories';
import { CATEGORY_COLORS } from '../lib/constants';
import type { Poem } from '../types/poem';
import styles from './FeaturedPoemsPage.module.css';

export default function FeaturedPoemsPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const { categories } = useCategories();
  const { poems, loading } = usePoems(selectedCategory || undefined);

  // 카테고리별 그룹핑 (전체 보기일 때만)
  const groupedByCategory: { name: string; poems: Poem[] }[] = [];
  if (!selectedCategory && poems.length > 0) {
    const catMap = new Map<string, Poem[]>();
    for (const p of poems) {
      const list = catMap.get(p.category) || [];
      list.push(p);
      catMap.set(p.category, list);
    }
    // 카테고리 순서대로 정렬
    const catOrder = categories.map(c => c.name);
    for (const name of catOrder) {
      const list = catMap.get(name);
      if (list && list.length > 0) {
        groupedByCategory.push({ name, poems: list });
      }
    }
    // 카테고리에 없는 것도 포함
    for (const [name, list] of catMap) {
      if (!catOrder.includes(name)) {
        groupedByCategory.push({ name, poems: list });
      }
    }
  }

  return (
    <PageTransition>
      <Helmet>
        <title>추천 시(詩) — 好海</title>
        <meta name="description" content="好海 이성헌 시인의 추천 시 모음" />
      </Helmet>

      <div className={styles.page}>
        <div className="container">
          <div className={styles.header}>
            <h1 className="section-title" style={{ display: 'inline-block' }}>추천 시(詩)</h1>
            <p className={styles.subtitle}>마음을 담아 쓴 시를 만나보세요</p>
          </div>

          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

          {/* 카테고리별 통계 요약 */}
          {!loading && !selectedCategory && groupedByCategory.length > 1 && (
            <div className={styles.statBar}>
              {groupedByCategory.map(g => (
                <button
                  key={g.name}
                  className={styles.statChip}
                  style={{
                    background: `${CATEGORY_COLORS[g.name] || '#888'}18`,
                    color: CATEGORY_COLORS[g.name] || 'var(--text-muted)',
                    borderColor: `${CATEGORY_COLORS[g.name] || '#888'}40`,
                  }}
                  onClick={() => setSelectedCategory(g.name)}
                >
                  {g.name} {g.poems.length}
                </button>
              ))}
              <span className={styles.totalCount}>전체 {poems.length}편</span>
            </div>
          )}

          {loading ? (
            <p className={styles.empty}>불러오는 중...</p>
          ) : poems.length > 0 ? (
            // 카테고리 선택 시: 평탄한 그리드
            selectedCategory ? (
              <div className={styles.grid}>
                {poems.map((poem, i) => (
                  <PoemCard key={poem.id} poem={poem} index={i} />
                ))}
              </div>
            ) : (
              // 전체 보기: 카테고리별 섹션으로 그룹
              groupedByCategory.length > 1 ? (
                <div className={styles.sections}>
                  {groupedByCategory.map(group => (
                    <section key={group.name} className={styles.categorySection}>
                      <div className={styles.sectionHeader}>
                        <span
                          className={styles.sectionDot}
                          style={{ background: CATEGORY_COLORS[group.name] }}
                        />
                        <h2 className={styles.sectionTitle}>{group.name}</h2>
                        <span className={styles.sectionCount}>{group.poems.length}편</span>
                        <button
                          className={styles.sectionMore}
                          onClick={() => setSelectedCategory(group.name)}
                        >
                          전체 보기 →
                        </button>
                      </div>
                      <div className={styles.grid}>
                        {group.poems.slice(0, 6).map((poem, i) => (
                          <PoemCard key={poem.id} poem={poem} index={i} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className={styles.grid}>
                  {poems.map((poem, i) => (
                    <PoemCard key={poem.id} poem={poem} index={i} />
                  ))}
                </div>
              )
            )
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
