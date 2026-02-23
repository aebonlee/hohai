import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/layout/PageTransition';
import PoemCard from '../components/ui/PoemCard';
import CategoryFilter from '../components/ui/CategoryFilter';
import ViewModeSelector, { useViewMode } from '../components/ui/ViewModeSelector';
import { usePoems } from '../hooks/usePoems';
import { useCategories } from '../hooks/useCategories';
import { CATEGORY_COLORS } from '../lib/constants';
import type { Poem } from '../types/poem';
import styles from './FeaturedPoemsPage.module.css';

export default function FeaturedPoemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tagParam = searchParams.get('tag') || '';
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useViewMode('poems');
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { poems, loading } = usePoems(
    tagParam ? undefined : selectedCategory || undefined,
    undefined,
    !tagParam,
    tagParam || undefined,
  );

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    if (tagParam) setSearchParams({});
  };

  const clearTag = () => {
    setSearchParams({});
  };

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

          <div className={styles.toolbar}>
            <ViewModeSelector mode={viewMode} onChange={setViewMode} />
          </div>

          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={handleCategorySelect}
          />

          {tagParam && (
            <div className={styles.tagFilter}>
              <span className={styles.tagFilterLabel}>#{tagParam}</span> 태그 시 {poems.length}편
              <button className={styles.tagFilterClear} onClick={clearTag}>✕</button>
            </div>
          )}

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
            viewMode === 'board' ? (
              /* 게시판 보기 */
              <div className={styles.boardList}>
                <div className={styles.boardHeader}>
                  <span className={styles.boardColNum}>#</span>
                  <span className={styles.boardColTitle}>제목</span>
                  <span className={styles.boardColCat}>카테고리</span>
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
                    <span className={styles.boardColDate}>{poem.written_date || ''}</span>
                  </div>
                ))}
              </div>
            ) : viewMode === 'blog' ? (
              /* 블로그 보기 */
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
                      {poem.written_date && <span>{poem.written_date}</span>}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              /* 갤러리 보기 (기본) */
              selectedCategory ? (
                <div className={styles.grid}>
                  {poems.map((poem, i) => (
                    <PoemCard key={poem.id} poem={poem} index={i} />
                  ))}
                </div>
              ) : (
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
            )
          ) : (
            <p className={styles.empty}>
              {tagParam
                ? `"#${tagParam}" 태그의 시가 없습니다.`
                : selectedCategory
                  ? '이 카테고리에 추천 시가 없습니다.'
                  : '아직 추천 시가 없습니다.'}
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
