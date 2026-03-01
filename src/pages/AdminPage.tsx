import { useState, Fragment, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import { useAllPoems } from '../hooks/usePoems';
import { useAllSongs } from '../hooks/useSongs';
import { useAllSeries } from '../hooks/useSeries';
import { useAllCategories, type CategoryInsert } from '../hooks/useCategories';
import { useAllReviews } from '../hooks/useReviews';
import { useAllGallery } from '../hooks/useGallery';
import { useAllNews } from '../hooks/useNews';
import { supabase } from '../lib/supabase';
import { CATEGORY_NAMES, CATEGORY_COLORS } from '../lib/constants';
import { POEM_CLASSIFICATIONS, CATEGORY_LIST } from '../data/poem-categories';
import type { PoemInsert } from '../types/poem';
import type { SongInsert } from '../types/song';
import type { SeriesInsert } from '../types/series';
import { formatDate } from '../lib/formatDate';
import styles from './AdminPage.module.css';

/** 한국 표준시(KST, UTC+9) 기준 오늘 날짜 (YYYY-MM-DD) */
function getTodayKST(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
}

type Tab = 'dashboard' | 'poems' | 'poem-boards' | 'songs' | 'song-boards' | 'suno-import' | 'poem-categories' | 'reviews' | 'gallery' | 'news' | 'batch-seed' | 'data-manage';

const MENU_ITEMS: { group: string; items: { tab: Tab; label: string; icon: string }[] }[] = [
  {
    group: '',
    items: [{ tab: 'dashboard', label: '대시보드', icon: '{}' }],
  },
  {
    group: '시',
    items: [
      { tab: 'poems', label: '시 관리', icon: '{}' },
      { tab: 'poem-boards', label: '시집 관리', icon: '{}' },
      { tab: 'poem-categories', label: '시 카테고리', icon: '{}' },
    ],
  },
  {
    group: '노래',
    items: [
      { tab: 'songs', label: '노래 관리', icon: '{}' },
      { tab: 'song-boards', label: '앨범 관리', icon: '{}' },
      { tab: 'suno-import', label: 'Suno 가져오기', icon: '{}' },
    ],
  },
  {
    group: '커뮤니티',
    items: [
      { tab: 'reviews', label: '후기 관리', icon: '{}' },
      { tab: 'gallery', label: '갤러리 관리', icon: '{}' },
      { tab: 'news', label: '소식통 관리', icon: '{}' },
    ],
  },
  {
    group: '도구',
    items: [
      { tab: 'batch-seed', label: '총괄 관리', icon: '{}' },
      { tab: 'data-manage', label: '데이터 관리', icon: '{}' },
    ],
  },
];

const TAB_LABELS: Record<Tab, string> = {
  dashboard: '대시보드',
  poems: '시 관리',
  'poem-boards': '시집 관리',
  'poem-categories': '시 카테고리',
  songs: '노래 관리',
  'song-boards': '앨범 관리',
  'suno-import': 'Suno 가져오기',
  reviews: '후기 관리',
  gallery: '갤러리 관리',
  news: '소식통 관리',
  'batch-seed': '총괄 관리',
  'data-manage': '데이터 관리',
};

export default function AdminPage() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>관리자 — 好海</title>
      </Helmet>

      <div className={styles.page}>
        <div className={styles.topBar}>
          <div className={styles.topLeft}>
            <Link to="/" className={styles.homeLink}>← 홈</Link>
            <span className={styles.logo}>好海 관리</span>
            <span className={styles.badge}>Admin</span>
          </div>
          <button className={styles.logoutBtn} onClick={signOut}>로그아웃</button>
        </div>

        <div className={styles.content}>
          {/* 모바일 메뉴 */}
          <div className={styles.mobileMenuBar}>
            <button
              className={`${styles.mobileMenuToggle} ${mobileMenuOpen ? styles.open : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span>{TAB_LABELS[activeTab]}</span>
              <span>&#9662;</span>
            </button>
            {mobileMenuOpen && (
              <div className={styles.mobileDropdown}>
                {MENU_ITEMS.map((group) => (
                  <div key={group.group || '_dashboard'}>
                    {group.group && (
                      <div className={styles.mobileGroupLabel}>{group.group}</div>
                    )}
                    {group.items.map((item) => (
                      <button
                        key={item.tab}
                        className={`${styles.mobileMenuItem} ${activeTab === item.tab ? styles.active : ''}`}
                        onClick={() => handleTabChange(item.tab)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 사이드바 */}
          <nav className={styles.sidebar}>
            {MENU_ITEMS.map((group) => (
              <div key={group.group || '_dashboard'}>
                {group.group && (
                  <div className={styles.sidebarGroup}>{group.group}</div>
                )}
                {group.items.map((item) => (
                  <button
                    key={item.tab}
                    className={`${styles.sidebarItem} ${activeTab === item.tab ? styles.active : ''}`}
                    onClick={() => setActiveTab(item.tab)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          {/* 메인 컨텐츠 */}
          <div className={styles.main}>
            {activeTab === 'dashboard' && <DashboardAdmin onNavigate={setActiveTab} />}
            {activeTab === 'poems' && <PoemsAdmin />}
            {activeTab === 'poem-boards' && <BoardSeriesAdmin seriesType="poem" typeLabel="시집" itemLabel="시" />}
            {activeTab === 'songs' && <SongsAdmin />}
            {activeTab === 'song-boards' && <BoardSeriesAdmin seriesType="song" typeLabel="앨범" itemLabel="노래" />}
            {activeTab === 'suno-import' && <SunoImportAdmin />}
            {activeTab === 'poem-categories' && <CategoriesAdmin />}
            {activeTab === 'reviews' && <ReviewsAdmin />}
            {activeTab === 'gallery' && <GalleryAdmin />}
            {activeTab === 'news' && <NewsAdmin />}
            {activeTab === 'batch-seed' && <BatchSeedAdmin />}
            {activeTab === 'data-manage' && <DataManageAdmin />}
          </div>
        </div>
      </div>
    </>
  );
}

/* ========================================
   대시보드 컴포넌트
   ======================================== */
const DASHBOARD_CARDS: {
  tab: Tab; label: string; icon: string; hint: string;
  bg: string; border: string; color: string;
  dataKey: 'poems' | 'songs' | 'series' | 'reviews' | 'gallery' | 'news';
}[] = [
  { tab: 'poems', label: '시', icon: '📝', hint: '시 관리로 이동', bg: '#f0f0ff', border: '#c7d2fe', color: '#4338ca', dataKey: 'poems' },
  { tab: 'songs', label: '노래', icon: '🎵', hint: '노래 관리로 이동', bg: '#fdf2f8', border: '#fbcfe8', color: '#be185d', dataKey: 'songs' },
  { tab: 'poem-boards', label: '시집/앨범', icon: '📚', hint: '시리즈 관리로 이동', bg: '#ecfeff', border: '#a5f3fc', color: '#0e7490', dataKey: 'series' },
  { tab: 'reviews', label: '감상 후기', icon: '💬', hint: '후기 관리로 이동', bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', dataKey: 'reviews' },
  { tab: 'gallery', label: '갤러리', icon: '🖼️', hint: '갤러리 관리로 이동', bg: '#fffbeb', border: '#fde68a', color: '#b45309', dataKey: 'gallery' },
  { tab: 'news', label: '소식통', icon: '📰', hint: '소식 관리로 이동', bg: '#f8fafc', border: '#cbd5e1', color: '#475569', dataKey: 'news' },
];

function DashboardAdmin({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { poems, loading: poemsLoading } = useAllPoems();
  const { songs, loading: songsLoading } = useAllSongs();
  const { series, loading: seriesLoading } = useAllSeries();
  const { reviews, loading: reviewsLoading } = useAllReviews();
  const { items: galleryItems, loading: galleryLoading } = useAllGallery();
  const { items: newsItems, loading: newsLoading } = useAllNews();

  const loading = poemsLoading || songsLoading || seriesLoading || reviewsLoading || galleryLoading || newsLoading;
  const counts: Record<string, number> = {
    poems: poems.length,
    songs: songs.length,
    series: series.length,
    reviews: reviews.length,
    gallery: galleryItems.length,
    news: newsItems.length,
  };

  return (
    <>
      <div className={styles.header}>
        <h2 style={{ fontSize: '1.4rem' }}>대시보드</h2>
        <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          {getTodayKST()} (한국 시간)
        </span>
      </div>

      <div className={styles.dashboardGrid}>
        {DASHBOARD_CARDS.map(card => (
          <div
            key={card.tab}
            className={styles.statCard}
            onClick={() => onNavigate(card.tab)}
            style={{
              background: card.bg,
              borderColor: card.border,
              borderWidth: 2,
            }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: 6, lineHeight: 1 }}>{card.icon}</div>
            <div className={styles.statLabel} style={{ color: card.color, fontSize: '1rem' }}>
              {card.label}
            </div>
            <div className={styles.statValue} style={{ color: card.color }}>
              {loading ? '...' : counts[card.dataKey]}
            </div>
            <div className={styles.statHint}>{card.hint} &rarr;</div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ========================================
   시 관리 컴포넌트
   ======================================== */
function PoemsAdmin() {
  const { poems, loading, createPoem, updatePoem, deletePoem } = useAllPoems();
  const { series } = useAllSeries();
  const poemSeries = series.filter(s => s.type === 'poem');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const todayStr = getTodayKST();
  const [form, setForm] = useState<PoemInsert>({
    title: '',
    content: '',
    excerpt: '',
    category: '사랑',
    series_id: null,
    tags: [],
    bg_theme: 0,
    display_order: 0,
    is_featured: false,
    is_published: true,
    written_date: todayStr,
  });

  const resetForm = () => {
    setForm({
      title: '', content: '', excerpt: '', category: '사랑',
      series_id: null, tags: [], bg_theme: 0, display_order: 0,
      is_featured: false, is_published: true, written_date: todayStr,
    });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (id: string) => {
    const poem = poems.find((p) => p.id === id);
    if (!poem) return;
    setForm({
      title: poem.title,
      content: poem.content,
      excerpt: poem.excerpt || '',
      category: poem.category,
      series_id: poem.series_id,
      tags: poem.tags,
      bg_theme: poem.bg_theme,
      display_order: poem.display_order,
      is_featured: poem.is_featured,
      is_published: poem.is_published,
      written_date: poem.written_date,
    });
    setEditingId(id);
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updatePoem(editingId, form);
    } else {
      await createPoem(form);
    }
    setShowModal(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deletePoem(id);
    }
  };

  // 카테고리별 통계
  const catStats: Record<string, number> = {};
  for (const p of poems) {
    catStats[p.category] = (catStats[p.category] || 0) + 1;
  }

  // 필터링
  const filteredPoems = poems.filter(p => {
    if (filterCategory && p.category !== filterCategory) return false;
    if (searchText && !p.title.includes(searchText) && !(p.tags || []).some(t => t.includes(searchText))) return false;
    return true;
  });

  return (
    <>
      <div className={styles.header}>
        <h2>시 목록 ({poems.length}편)</h2>
        <button className={styles.addBtn} onClick={openCreate}>+ 새 시 작성</button>
      </div>

      {/* 카테고리별 통계 바 */}
      {!loading && poems.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {Object.entries(catStats).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
            <span
              key={cat}
              style={{
                fontSize: '0.78rem',
                padding: '3px 10px',
                borderRadius: 999,
                background: CATEGORY_COLORS[cat] ? `${CATEGORY_COLORS[cat]}22` : 'var(--bg-secondary)',
                color: CATEGORY_COLORS[cat] || 'var(--text-muted)',
                border: `1px solid ${CATEGORY_COLORS[cat] || 'transparent'}44`,
                cursor: 'pointer',
              }}
              onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)}
            >
              {cat} {count}
            </span>
          ))}
        </div>
      )}

      {/* 필터 컨트롤 */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <select
          className={styles.formInput}
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          style={{ width: 'auto', minWidth: 100 }}
        >
          <option value="">전체 카테고리</option>
          {CATEGORY_NAMES.map(name => (
            <option key={name} value={name}>{name} ({catStats[name] || 0})</option>
          ))}
        </select>
        <input
          className={styles.formInput}
          placeholder="제목 또는 태그 검색..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 'auto', minWidth: 180 }}
        />
        {(filterCategory || searchText) && (
          <button
            className={styles.cancelBtn}
            onClick={() => { setFilterCategory(''); setSearchText(''); }}
            style={{ padding: '6px 14px' }}
          >
            초기화
          </button>
        )}
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {filteredPoems.length}편 표시
        </span>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>불러오는 중...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>제목</th>
              <th>시집</th>
              <th>카테고리</th>
              <th>태그</th>
              <th>추천</th>
              <th>상태</th>
              <th>순서</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredPoems.map((poem) => (
              <tr key={poem.id}>
                <td className={styles.titleCell}>{poem.title}</td>
                <td>{poemSeries.find(s => s.id === poem.series_id)?.name || '-'}</td>
                <td>
                  <span style={{
                    fontSize: '0.78rem',
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: CATEGORY_COLORS[poem.category] ? `${CATEGORY_COLORS[poem.category]}22` : 'var(--bg-secondary)',
                    color: CATEGORY_COLORS[poem.category] || 'var(--text-muted)',
                  }}>
                    {poem.category}
                  </span>
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 180 }}>
                  {(poem.tags || []).length > 0
                    ? poem.tags.map(t => `#${t}`).join(' ')
                    : '-'}
                </td>
                <td style={{ textAlign: 'center', fontSize: '1.1rem' }}>
                  {poem.is_featured ? '⭐' : ''}
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${poem.is_published ? styles.published : styles.draft}`}>
                    {poem.is_published ? '공개' : '비공개'}
                  </span>
                </td>
                <td>{poem.display_order}</td>
                <td className={styles.actions}>
                  <button className={styles.editBtn} onClick={() => openEdit(poem.id)}>수정</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(poem.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editingId ? '시 수정' : '새 시 작성'}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>제목 *</label>
                <input
                  className={styles.formInput}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>시 본문 *</label>
                <textarea
                  className={styles.formTextarea}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                  placeholder="시를 입력하세요. 연(stanza) 구분은 빈 줄로 합니다."
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>발췌 (미리보기)</label>
                <textarea
                  className={styles.formInput}
                  style={{ minHeight: 60 }}
                  value={form.excerpt || ''}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="비워두면 본문 앞 4행이 자동 사용됩니다"
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>시집 (시리즈)</label>
                  <select
                    className={styles.formInput}
                    value={form.series_id || ''}
                    onChange={(e) => setForm({ ...form, series_id: e.target.value || null })}
                  >
                    <option value="">미분류</option>
                    {poemSeries.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>카테고리</label>
                  <select
                    className={styles.formInput}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORY_NAMES.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>작성일</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={form.written_date || ''}
                    onChange={(e) => setForm({ ...form, written_date: e.target.value || null })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>카드 테마 (0-7)</label>
                  <input
                    type="number"
                    min={0}
                    max={7}
                    className={styles.formInput}
                    value={form.bg_theme}
                    onChange={(e) => setForm({ ...form, bg_theme: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>표시 순서</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>태그 (쉼표 구분)</label>
                <input
                  className={styles.formInput}
                  value={(form.tags || []).join(', ')}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="사랑, 봄, 그리움"
                />
              </div>
              <div className={styles.checkRow}>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  />
                  공개
                </label>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  />
                  추천
                </label>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>취소</button>
                <button type="submit" className={styles.saveBtn}>{editingId ? '수정' : '저장'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ========================================
   노래 관리 컴포넌트
   ======================================== */
function SongsAdmin() {
  const { songs, loading, createSong, updateSong, deleteSong } = useAllSongs();
  const { series } = useAllSeries();
  const songSeries = series.filter(s => s.type === 'song');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SongInsert>({
    title: '',
    youtube_id: '',
    suno_url: '',
    description: '',
    lyrics: '',
    category: '기타',
    series_id: null,
    display_order: 0,
    is_featured: false,
    is_published: true,
    recorded_date: null,
  });

  const resetForm = () => {
    setForm({
      title: '', youtube_id: '', suno_url: '', description: '', lyrics: '',
      category: '기타', series_id: null, display_order: 0, is_featured: false, is_published: true, recorded_date: null,
    });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (id: string) => {
    const song = songs.find((s) => s.id === id);
    if (!song) return;
    setForm({
      title: song.title,
      youtube_id: song.youtube_id,
      suno_url: song.suno_url || '',
      description: song.description || '',
      lyrics: song.lyrics || '',
      category: song.category || '기타',
      series_id: song.series_id,
      display_order: song.display_order,
      is_featured: song.is_featured,
      is_published: song.is_published,
      recorded_date: song.recorded_date,
    });
    setEditingId(id);
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateSong(editingId, form);
    } else {
      await createSong(form);
    }
    setShowModal(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteSong(id);
    }
  };

  return (
    <>
      <div className={styles.header}>
        <h2>노래 목록 ({songs.length}곡)</h2>
        <button className={styles.addBtn} onClick={openCreate}>+ 새 노래 추가</button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>불러오는 중...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>제목</th>
              <th>카테고리</th>
              <th>앨범</th>
              <th>소스</th>
              <th>추천</th>
              <th>상태</th>
              <th>순서</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <tr key={song.id}>
                <td className={styles.titleCell}>{song.title}</td>
                <td>{song.category || '기타'}</td>
                <td>{songSeries.find(s => s.id === song.series_id)?.name || '-'}</td>
                <td style={{ fontSize: '0.75rem' }}>
                  {song.youtube_id && <span style={{ display: 'block', color: '#c00' }}>YouTube</span>}
                  {song.suno_url && <span style={{ display: 'block', color: '#6366f1' }}>Suno</span>}
                </td>
                <td style={{ textAlign: 'center', fontSize: '1.1rem' }}>
                  {song.is_featured ? '⭐' : ''}
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${song.is_published ? styles.published : styles.draft}`}>
                    {song.is_published ? '공개' : '비공개'}
                  </span>
                </td>
                <td>{song.display_order}</td>
                <td className={styles.actions}>
                  <button className={styles.editBtn} onClick={() => openEdit(song.id)}>수정</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(song.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editingId ? '노래 수정' : '새 노래 추가'}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>제목 *</label>
                <input
                  className={styles.formInput}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>YouTube 영상 ID</label>
                  <input
                    className={styles.formInput}
                    value={form.youtube_id || ''}
                    onChange={(e) => setForm({ ...form, youtube_id: e.target.value })}
                    placeholder="예: dQw4w9WgXcQ"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Suno AI URL</label>
                  <input
                    className={styles.formInput}
                    value={form.suno_url || ''}
                    onChange={(e) => setForm({ ...form, suno_url: e.target.value })}
                    placeholder="예: https://suno.com/song/..."
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>앨범 (시리즈)</label>
                <select
                  className={styles.formInput}
                  value={form.series_id || ''}
                  onChange={(e) => setForm({ ...form, series_id: e.target.value || null })}
                >
                  <option value="">미분류</option>
                  {songSeries.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>카테고리 (장르)</label>
                <select
                  className={styles.formInput}
                  value={form.category || '기타'}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {['사랑', '그리움', '작별', '추억', '인생', '가족', '자연', '세상', '의지', '기타'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>설명</label>
                <textarea
                  className={styles.formInput}
                  style={{ minHeight: 60 }}
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>가사</label>
                <textarea
                  className={styles.formTextarea}
                  value={form.lyrics || ''}
                  onChange={(e) => setForm({ ...form, lyrics: e.target.value })}
                  placeholder="가사를 입력하세요 (선택)"
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>녹음/업로드일</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={form.recorded_date || ''}
                    onChange={(e) => setForm({ ...form, recorded_date: e.target.value || null })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>표시 순서</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className={styles.checkRow}>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  />
                  공개
                </label>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  />
                  대표곡
                </label>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>취소</button>
                <button type="submit" className={styles.saveBtn}>{editingId ? '수정' : '저장'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ========================================
   게시판 카테고리(시집/앨범) 관리 컴포넌트
   ======================================== */
function BoardSeriesAdmin({ seriesType, typeLabel, itemLabel }: {
  seriesType: 'poem' | 'song';
  typeLabel: string;
  itemLabel: string;
}) {
  const { series, loading, createSeries, updateSeries, deleteSeries } = useAllSeries();
  const filtered = series.filter(s => s.type === seriesType);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SeriesInsert>({
    name: '',
    slug: '',
    type: seriesType,
    description: '',
    display_order: 0,
    is_published: true,
  });

  const resetForm = () => {
    setForm({
      name: '', slug: '', type: seriesType, description: '', display_order: 0, is_published: true,
    });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (id: string) => {
    const item = filtered.find((s) => s.id === id);
    if (!item) return;
    setForm({
      name: item.name,
      slug: item.slug,
      type: seriesType,
      description: item.description || '',
      display_order: item.display_order,
      is_published: item.is_published,
    });
    setEditingId(id);
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateSeries(editingId, form);
    } else {
      await createSeries(form);
    }
    setShowModal(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`정말 삭제하시겠습니까? 연결된 ${itemLabel}의 ${typeLabel}가 해제됩니다.`)) {
      await deleteSeries(id);
    }
  };

  return (
    <>
      <div className={styles.header}>
        <h2>{typeLabel} 목록 ({filtered.length}개)</h2>
        <button className={styles.addBtn} onClick={openCreate}>+ 새 {typeLabel} 추가</button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>불러오는 중...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>이름</th>
              <th>설명</th>
              <th>슬러그</th>
              <th>상태</th>
              <th>순서</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td className={styles.titleCell}>{item.name}</td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {item.description ? (item.description.length > 30 ? item.description.slice(0, 30) + '...' : item.description) : '-'}
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{item.slug}</td>
                <td>
                  <span className={`${styles.statusBadge} ${item.is_published ? styles.published : styles.draft}`}>
                    {item.is_published ? '공개' : '비공개'}
                  </span>
                </td>
                <td>{item.display_order}</td>
                <td className={styles.actions}>
                  <button className={styles.editBtn} onClick={() => openEdit(item.id)}>수정</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editingId ? `${typeLabel} 수정` : `새 ${typeLabel} 추가`}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{typeLabel} 이름 *</label>
                <input
                  className={styles.formInput}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder={seriesType === 'poem' ? '예: 파도의 시, 바다의 노래' : '예: 바다 노래 1집'}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>슬러그 (URL) *</label>
                <input
                  className={styles.formInput}
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  placeholder="예: wave-poems (영문, 하이픈)"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>설명</label>
                <textarea
                  className={styles.formInput}
                  style={{ minHeight: 60 }}
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={`이 ${typeLabel}에 대한 간단한 설명`}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>표시 순서</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>&nbsp;</label>
                  <label className={styles.checkLabel} style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    />
                    공개
                  </label>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>취소</button>
                <button type="submit" className={styles.saveBtn}>{editingId ? '수정' : '저장'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ========================================
   카테고리 관리 컴포넌트
   ======================================== */
function CategoriesAdmin() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useAllCategories();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryInsert>({
    name: '',
    slug: '',
    description: '',
    display_order: 0,
  });

  const resetForm = () => {
    setForm({ name: '', slug: '', description: '', display_order: 0 });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      display_order: cat.display_order,
    });
    setEditingId(id);
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateCategory(editingId, form);
    } else {
      await createCategory(form);
    }
    setShowModal(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteCategory(id);
    }
  };

  return (
    <>
      <div className={styles.header}>
        <h2>카테고리 목록 ({categories.length}개)</h2>
        <button className={styles.addBtn} onClick={openCreate}>+ 새 카테고리 추가</button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>불러오는 중...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>이름</th>
              <th>슬러그</th>
              <th>설명</th>
              <th>순서</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className={styles.titleCell}>{cat.name}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{cat.slug}</td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {cat.description || '-'}
                </td>
                <td>{cat.display_order}</td>
                <td className={styles.actions}>
                  <button className={styles.editBtn} onClick={() => openEdit(cat.id)}>수정</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(cat.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editingId ? '카테고리 수정' : '새 카테고리 추가'}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>카테고리 이름 *</label>
                <input
                  className={styles.formInput}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="예: 사랑, 자연, 계절"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>슬러그 *</label>
                <input
                  className={styles.formInput}
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  placeholder="예: 사랑 (카테고리 필터용)"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>설명</label>
                <textarea
                  className={styles.formInput}
                  style={{ minHeight: 60 }}
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="카테고리 설명 (선택)"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>표시 순서</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>취소</button>
                <button type="submit" className={styles.saveBtn}>{editingId ? '수정' : '저장'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ========================================
   후기 관리 컴포넌트
   ======================================== */
function ReviewsAdmin() {
  const { reviews, loading, updateReview, deleteReview } = useAllReviews();

  const handleTogglePublish = async (id: string, current: boolean) => {
    await updateReview(id, { is_published: !current });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteReview(id);
    }
  };

  return (
    <>
      <div className={styles.header}>
        <h2>감상 후기 ({reviews.length}건)</h2>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>불러오는 중...</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>등록된 후기가 없습니다.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>작성자</th>
              <th>내용</th>
              <th>날짜</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id}>
                <td className={styles.titleCell}>{review.author_name}</td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 300 }}>
                  {review.content.length > 60 ? review.content.slice(0, 60) + '...' : review.content}
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {formatDate(review.created_at)}
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${review.is_published ? styles.published : styles.draft}`}>
                    {review.is_published ? '공개' : '비공개'}
                  </span>
                </td>
                <td className={styles.actions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleTogglePublish(review.id, review.is_published)}
                  >
                    {review.is_published ? '비공개' : '공개'}
                  </button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(review.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

/* ========================================
   갤러리 관리 컴포넌트
   ======================================== */
function GalleryAdmin() {
  const { items, loading, updateItem, deleteItem } = useAllGallery();

  const handleTogglePublish = async (id: string, current: boolean) => {
    await updateItem(id, { is_published: !current });
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (window.confirm('정말 삭제하시겠습니까? (이미지도 함께 삭제됩니다)')) {
      await deleteItem(id, imageUrl);
    }
  };

  return (
    <>
      <div className={styles.header}>
        <h2>갤러리 ({items.length}건)</h2>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>불러오는 중...</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>등록된 갤러리 항목이 없습니다.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>이미지</th>
              <th>제목</th>
              <th>작성자</th>
              <th>날짜</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <img
                    src={item.image_url}
                    alt={item.title}
                    style={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 4 }}
                  />
                </td>
                <td className={styles.titleCell}>{item.title}</td>
                <td style={{ fontSize: '0.85rem' }}>{item.author_name}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {formatDate(item.created_at)}
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${item.is_published ? styles.published : styles.draft}`}>
                    {item.is_published ? '공개' : '비공개'}
                  </span>
                </td>
                <td className={styles.actions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleTogglePublish(item.id, item.is_published)}
                  >
                    {item.is_published ? '비공개' : '공개'}
                  </button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(item.id, item.image_url)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

/* ========================================
   소식통 관리 컴포넌트
   ======================================== */
function NewsAdmin() {
  const { items, loading, updateItem, deleteItem } = useAllNews();

  const handleTogglePublish = async (id: string, current: boolean) => {
    await updateItem(id, { is_published: !current });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteItem(id);
    }
  };

  return (
    <>
      <div className={styles.header}>
        <h2>소식통 ({items.length}건)</h2>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>불러오는 중...</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>등록된 소식이 없습니다.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>제목</th>
              <th>작성자</th>
              <th>내용</th>
              <th>날짜</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className={styles.titleCell}>{item.title}</td>
                <td style={{ fontSize: '0.85rem' }}>{item.author_name}</td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 300 }}>
                  {item.content.length > 60 ? item.content.slice(0, 60) + '...' : item.content}
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {formatDate(item.created_at)}
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${item.is_published ? styles.published : styles.draft}`}>
                    {item.is_published ? '공개' : '비공개'}
                  </span>
                </td>
                <td className={styles.actions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleTogglePublish(item.id, item.is_published)}
                  >
                    {item.is_published ? '비공개' : '공개'}
                  </button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

/* ========================================
   일괄 등록 컴포넌트
   ======================================== */
function BatchSeedAdmin() {
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const addLog = (msg: string) => setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleUpdateCategories = async () => {
    if (!window.confirm('기존 시의 카테고리/태그를 일괄 업데이트하시겠습니까?\n(기존 카테고리 삭제 후 9개 새 카테고리 등록 + 시 분류 업데이트)')) return;
    setRunning(true);
    setLog([]);
    addLog('카테고리/태그 일괄 업데이트 시작...');

    // 1. 기존 카테고리 삭제 → 9개 새 카테고리 등록
    addLog('기존 카테고리 삭제 중...');
    const { error: delErr } = await supabase.from('hohai_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    addLog(delErr ? `카테고리 삭제 실패: ${delErr.message}` : '기존 카테고리 삭제 완료');

    addLog('새 카테고리 9개 등록 중...');
    const catRows = CATEGORY_LIST.map(c => ({
      name: c.name, slug: c.slug, description: c.description, display_order: c.order,
    }));
    const { error: catErr } = await supabase.from('hohai_categories').insert(catRows);
    addLog(catErr ? `카테고리 등록 실패: ${catErr.message}` : '카테고리 9개 등록 완료');

    // 2. 모든 시 조회
    addLog('시 목록 조회 중...');
    const { data: poems, error: fetchErr } = await supabase
      .from('hohai_poems')
      .select('id, title, display_order')
      .order('display_order');
    if (fetchErr || !poems) {
      addLog(`시 조회 실패: ${fetchErr?.message}`);
      setRunning(false);
      return;
    }
    addLog(`시 ${poems.length}편 조회 완료`);

    // 3. 제목 기반 매칭 → category/tags UPDATE
    let updated = 0;
    let skipped = 0;
    const stats: Record<string, number> = {};

    for (const poem of poems) {
      const cls = POEM_CLASSIFICATIONS[poem.display_order];
      if (!cls) {
        skipped++;
        continue;
      }

      stats[cls.category] = (stats[cls.category] || 0) + 1;

      const { error: upErr } = await supabase
        .from('hohai_poems')
        .update({ category: cls.category, tags: cls.tags })
        .eq('id', poem.id);

      if (upErr) {
        addLog(`"${poem.title}" 업데이트 실패: ${upErr.message}`);
      } else {
        updated++;
      }

      if (updated % 20 === 0) {
        addLog(`진행: ${updated} / ${poems.length}`);
      }
    }

    addLog('--- 카테고리별 분류 결과 ---');
    for (const [cat, count] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
      addLog(`  ${cat}: ${count}편`);
    }
    addLog(`업데이트 완료! 성공: ${updated}편, 스킵: ${skipped}편`);
    setRunning(false);
  };

  /** 시집 100편 단위 분리 */
  const handleSplitSeries = async () => {
    if (!window.confirm(
      '시집을 100편 단위로 분리합니다.\n\n' +
      '제1권: 1~100번 시 (99편)\n' +
      '제2권: 101~178번 시 (78편)\n\n' +
      '진행하시겠습니까?'
    )) return;
    setRunning(true);
    setLog([]);
    addLog('시집 분리 시작...');

    // 1. 기존 시집 조회
    const { data: existingSeries } = await supabase
      .from('hohai_series')
      .select('id, name')
      .eq('type', 'poem')
      .order('display_order');

    let series1Id: string | null = null;
    let series2Id: string | null = null;

    // 기존 "무지개 빛으로 채색된 삶" 시집 → 제1권으로 변경
    const rainbow = existingSeries?.find(s => s.name.includes('무지개'));
    if (rainbow) {
      addLog(`기존 시집 "${rainbow.name}" → 제1권으로 변경`);
      const { error } = await supabase
        .from('hohai_series')
        .update({
          name: '무지개 빛으로 채색된 삶 제1권',
          slug: 'rainbow-life-vol1',
          description: '사랑, 인생, 그리움, 추억... 삶의 전반부를 무지개빛으로 물들인 99편의 시',
          display_order: 1,
        })
        .eq('id', rainbow.id);
      if (error) { addLog(`제1권 변경 실패: ${error.message}`); }
      else { series1Id = rainbow.id; addLog('제1권 변경 완료'); }
    } else {
      addLog('제1권 시집 새로 생성...');
      const { data, error } = await supabase
        .from('hohai_series')
        .insert({
          name: '무지개 빛으로 채색된 삶 제1권',
          slug: 'rainbow-life-vol1',
          type: 'poem',
          description: '사랑, 인생, 그리움, 추억... 삶의 전반부를 무지개빛으로 물들인 99편의 시',
          display_order: 1,
          is_published: true,
        })
        .select('id')
        .single();
      if (error) { addLog(`제1권 생성 실패: ${error.message}`); }
      else { series1Id = data?.id || null; addLog('제1권 생성 완료'); }
    }

    // 제2권 생성 (이미 있으면 스킵)
    const vol2 = existingSeries?.find(s => s.name.includes('제2권'));
    if (vol2) {
      series2Id = vol2.id;
      addLog('제2권 시집이 이미 존재합니다.');
    } else {
      addLog('제2권 시집 생성...');
      const { data, error } = await supabase
        .from('hohai_series')
        .insert({
          name: '무지개 빛으로 채색된 삶 제2권',
          slug: 'rainbow-life-vol2',
          type: 'poem',
          description: '세상, 의지, 자연, 가족... 삶의 후반부를 깊이 있게 담아낸 78편의 시',
          display_order: 2,
          is_published: true,
        })
        .select('id')
        .single();
      if (error) { addLog(`제2권 생성 실패: ${error.message}`); }
      else { series2Id = data?.id || null; addLog('제2권 생성 완료'); }
    }

    if (!series1Id || !series2Id) {
      addLog('시집 ID 확보 실패 — 중단');
      setRunning(false);
      return;
    }

    // 2. 시 배정: display_order ≤ 100 → 제1권, > 100 → 제2권
    addLog('\n시 배정 중...');
    const { data: vol1 } = await supabase
      .from('hohai_poems')
      .update({ series_id: series1Id })
      .lte('display_order', 100)
      .gte('display_order', 1)
      .select('id');
    addLog(`제1권: ${vol1?.length ?? 0}편 배정`);

    const { data: vol2Data } = await supabase
      .from('hohai_poems')
      .update({ series_id: series2Id })
      .gt('display_order', 100)
      .select('id');
    addLog(`제2권: ${vol2Data?.length ?? 0}편 배정`);

    // 3. 카테고리별 분포 표시
    addLog('\n--- 제1권 카테고리 분포 ---');
    const { data: vol1Poems } = await supabase
      .from('hohai_poems')
      .select('category')
      .eq('series_id', series1Id);
    const vol1Stats: Record<string, number> = {};
    for (const p of vol1Poems || []) vol1Stats[p.category] = (vol1Stats[p.category] || 0) + 1;
    for (const [cat, count] of Object.entries(vol1Stats).sort((a, b) => b[1] - a[1])) {
      addLog(`  ${cat}: ${count}편`);
    }

    addLog('\n--- 제2권 카테고리 분포 ---');
    const { data: vol2Poems } = await supabase
      .from('hohai_poems')
      .select('category')
      .eq('series_id', series2Id);
    const vol2Stats: Record<string, number> = {};
    for (const p of vol2Poems || []) vol2Stats[p.category] = (vol2Stats[p.category] || 0) + 1;
    for (const [cat, count] of Object.entries(vol2Stats).sort((a, b) => b[1] - a[1])) {
      addLog(`  ${cat}: ${count}편`);
    }

    addLog(`\n시집 분리 완료!`);
    addLog(`"무지개 빛으로 채색된 삶 제1권" — ${vol1?.length ?? 0}편`);
    addLog(`"무지개 빛으로 채색된 삶 제2권" — ${vol2Data?.length ?? 0}편`);
    setRunning(false);
  };

  const handleShowStats = async () => {
    setLog([]);
    addLog('카테고리별 현황 조회 중...');

    const { data: poems, error } = await supabase
      .from('hohai_poems')
      .select('category, tags');

    if (error || !poems) {
      addLog(`조회 실패: ${error?.message}`);
      return;
    }

    const catStats: Record<string, number> = {};
    const tagStats: Record<string, number> = {};
    let noTag = 0;

    for (const p of poems) {
      catStats[p.category] = (catStats[p.category] || 0) + 1;
      if (!p.tags || p.tags.length === 0) {
        noTag++;
      } else {
        for (const t of p.tags) {
          tagStats[t] = (tagStats[t] || 0) + 1;
        }
      }
    }

    addLog(`\n총 시: ${poems.length}편`);
    addLog('--- 카테고리별 현황 ---');
    for (const [cat, count] of Object.entries(catStats).sort((a, b) => b[1] - a[1])) {
      const bar = '\u2588'.repeat(Math.round(count / 2));
      addLog(`  ${cat.padEnd(4)} ${String(count).padStart(3)}편 ${bar}`);
    }

    addLog(`\n태그 없는 시: ${noTag}편`);
    addLog('--- 인기 태그 TOP 20 ---');
    const topTags = Object.entries(tagStats).sort((a, b) => b[1] - a[1]).slice(0, 20);
    for (const [tag, count] of topTags) {
      addLog(`  #${tag} (${count})`);
    }
  };

  return (
    <>
      <div className={styles.header}>
        <h2>총괄 관리</h2>
      </div>

      {/* 시집 관리 */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: 12, color: 'var(--text-primary)' }}>시집 분리</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
          시를 100편 단위로 시집에 배정합니다. 제1권(1~100번), 제2권(101~178번)으로 분리됩니다.
        </p>
        <button
          className={styles.addBtn}
          onClick={handleSplitSeries}
          disabled={running}
          style={{ padding: '14px 24px', fontSize: '1rem', background: '#4338ca' }}
        >
          시집 100편 단위 분리 실행
        </button>
      </div>

      {/* 카테고리 관리 */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: 12, color: 'var(--text-primary)' }}>카테고리 관리</h3>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <button
            className={styles.saveBtn}
            onClick={handleUpdateCategories}
            disabled={running}
            style={{ padding: '14px 24px', fontSize: '1rem' }}
          >
            카테고리/태그 일괄 업데이트
          </button>
          <button
            className={styles.editBtn}
            onClick={handleShowStats}
            disabled={running}
            style={{ padding: '14px 24px', fontSize: '1rem' }}
          >
            카테고리 현황 보기
          </button>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 10,
        padding: 20,
        fontFamily: 'monospace',
        fontSize: '0.95rem',
        maxHeight: 400,
        overflowY: 'auto',
        lineHeight: 1.7,
        whiteSpace: 'pre-wrap',
      }}>
        {log.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.8 }}>
            버튼을 클릭하면 실행 결과가 여기에 표시됩니다.
            <br /><br />
            &bull; <strong>시집 100편 단위 분리</strong> — 기존 시집을 제1권/제2권으로 분리하고 시를 자동 배정합니다
            <br />
            &bull; <strong>카테고리/태그 일괄 업데이트</strong> — 시의 카테고리와 태그를 일괄 변경합니다
            <br />
            &bull; <strong>카테고리 현황 보기</strong> — 카테고리별 시 수와 인기 태그를 확인합니다
          </p>
        ) : (
          log.map((line, i) => <div key={i}>{line}</div>)
        )}
      </div>
    </>
  );
}

/* ========================================
   Suno 가져오기 — 헬퍼 함수
   ======================================== */

/** URL/ID 문자열에서 Suno 곡 ID와 정규화된 URL 추출 */
function extractSunoInfo(input: string): { id: string; url: string } | null {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/suno\.com\/(?:song|s)\/([a-zA-Z0-9_-]+)/);
  if (urlMatch) {
    const id = urlMatch[1];
    const isUuid = /^[a-f0-9]{8}-[a-f0-9]{4}-/.test(id);
    return { id, url: isUuid ? `https://suno.com/song/${id}` : `https://suno.com/s/${id}` };
  }
  if (/^[a-zA-Z0-9_-]{8,}$/.test(trimmed)) {
    const isUuid = /^[a-f0-9]{8}-[a-f0-9]{4}-/.test(trimmed);
    return { id: trimmed, url: isUuid ? `https://suno.com/song/${trimmed}` : `https://suno.com/s/${trimmed}` };
  }
  return null;
}

interface SunoFormSong {
  key: number;
  suno_url: string;
  title: string;
  lyrics: string;
  style: string;
  tags: string[];
  already: boolean;
}

/* ========================================
   Suno 가져오기 컴포넌트
   ======================================== */

function SunoImportAdmin() {
  const { songs, createSong } = useAllSongs();
  const { series } = useAllSeries();
  const songSeries = series.filter(s => s.type === 'song');

  // URL 입력 상태
  const [urlInput, setUrlInput] = useState('');
  const [fetching, setFetching] = useState(false);

  // 곡 목록 + 등록 상태
  const [songList, setSongList] = useState<SunoFormSong[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [targetSeriesId, setTargetSeriesId] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [keyCounter, setKeyCounter] = useState(0);

  const addLog = (msg: string) => setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  // 기존 중복 체크
  const existingIds = new Set(
    songs.filter(s => s.suno_url).map(s => {
      const m = s.suno_url!.match(/suno\.com\/(?:song|s)\/([a-zA-Z0-9_-]+)/);
      return m ? m[1] : '';
    }).filter(Boolean)
  );
  const existingUrls = new Set(songs.filter(s => s.suno_url).map(s => s.suno_url!));
  const isAlreadyImported = (url: string) => {
    if (existingUrls.has(url)) return true;
    const info = extractSunoInfo(url);
    return info ? existingIds.has(info.id) : false;
  };

  /** URL에서 곡 정보 자동 가져오기 (서버 사이드 스크래핑) */
  const handleFetchUrls = async () => {
    const inputLines = urlInput.trim().split(/\n/).map(l => l.trim()).filter(Boolean);
    const urls: string[] = [];
    for (const line of inputLines) {
      const info = extractSunoInfo(line);
      if (info) {
        urls.push(info.url);
      } else {
        addLog(`[건너뜀] 유효하지 않은 URL: ${line}`);
      }
    }
    if (urls.length === 0) {
      addLog('[실패] 유효한 Suno URL이 없습니다');
      return;
    }

    setFetching(true);
    addLog(`${urls.length}개 URL에서 곡 정보 가져오는 중...`);

    try {
      const { data, error } = await supabase.functions.invoke('suno-scrape', {
        body: { urls },
      });

      if (error) throw error;
      if (!data?.results || !Array.isArray(data.results)) {
        throw new Error('응답 형식이 올바르지 않습니다');
      }

      let nextKey = keyCounter;
      const newSongs: SunoFormSong[] = [];
      const newSelectedKeys = new Set(selectedKeys);

      for (const result of data.results) {
        const { url, title, lyrics, style } = result;
        const info = extractSunoInfo(url);
        const sunoUrl = info?.url || url;
        const already = isAlreadyImported(sunoUrl);
        const tags = style ? style.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
        nextKey++;

        newSongs.push({
          key: nextKey,
          suno_url: sunoUrl,
          title: title || '',
          lyrics: lyrics || '',
          style: style || '',
          tags,
          already,
        });

        if (!already) newSelectedKeys.add(nextKey);
        addLog(`[추가] "${title || '(제목 없음)'}" — 가사 ${lyrics ? lyrics.split('\n').length + '줄 ✓' : '✗'}, 스타일 ${style ? '✓' : '✗'}${already ? ' (이미 등록됨)' : ''}`);
      }

      setSongList(prev => [...prev, ...newSongs]);
      setSelectedKeys(newSelectedKeys);
      setKeyCounter(nextKey);
      setUrlInput('');
      addLog(`총 ${newSongs.length}곡 가져오기 완료`);
    } catch (err) {
      addLog(`[오류] 곡 정보를 가져올 수 없습니다: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setFetching(false);
    }
  };

  /** 곡 삭제 */
  const removeSong = (key: number) => {
    setSongList(prev => prev.filter(s => s.key !== key));
    setSelectedKeys(prev => { const next = new Set(prev); next.delete(key); return next; });
  };

  /** 인라인 필드 수정 */
  const updateField = (key: number, field: keyof SunoFormSong, value: string) => {
    setSongList(prev => prev.map(s => {
      if (s.key !== key) return s;
      if (field === 'tags') return { ...s, tags: value.split(',').map(t => t.trim()).filter(Boolean) };
      return { ...s, [field]: value };
    }));
  };

  /** 선택 토글 */
  const toggleSelect = (key: number) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  /** 일괄 등록 */
  const handleImport = async () => {
    const toImport = songList.filter(s => selectedKeys.has(s.key) && !s.already);
    if (toImport.length === 0) return;

    setImporting(true);
    addLog(`\n${toImport.length}곡 등록 시작...`);

    let success = 0;
    for (const song of toImport) {
      if (!song.title.trim()) {
        addLog('[건너뜀] 제목이 비어있습니다');
        continue;
      }

      const insert: SongInsert = {
        title: song.title,
        suno_url: song.suno_url,
        lyrics: song.lyrics || null,
        description: null,
        tags: song.tags,
        series_id: targetSeriesId || null,
        display_order: 0,
        is_featured: false,
        is_published: true,
      };

      const { error } = await createSong(insert);
      if (error) {
        addLog(`[실패] "${song.title}": ${error.message}`);
      } else {
        success++;
        addLog(`[등록] "${song.title}" 완료`);
      }
    }

    addLog(`등록 완료: ${success}/${toImport.length}곡 성공`);
    setImporting(false);
    setSelectedKeys(new Set());
    setSongList(prev => prev.map(s => ({
      ...s,
      already: s.already || selectedKeys.has(s.key),
    })));
  };

  return (
    <>
      <div className={styles.header}>
        <h2>Suno 노래 가져오기</h2>
      </div>

      {/* URL 입력으로 자동 가져오기 */}
      <div style={{
        marginBottom: 24,
        padding: 24,
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        borderRadius: 12,
        border: '1px solid #34d399',
      }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#065f46', marginBottom: 12 }}>
          Suno 곡 자동 가져오기
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#064e3b', marginBottom: 16, lineHeight: 1.6 }}>
          Suno 곡 공유 링크를 아래에 붙여넣으세요. 제목, 가사, 스타일이 자동으로 추출됩니다.
          <br />여러 곡을 한 번에 가져오려면 한 줄에 하나씩 입력하세요.
        </p>

        <textarea
          className={styles.formTextarea}
          style={{ minHeight: 100, fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: 12 }}
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          placeholder={'https://suno.com/song/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\nhttps://suno.com/song/...  (한 줄에 하나씩)'}
          disabled={fetching}
        />

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            className={styles.addBtn}
            style={{ padding: '10px 24px', fontSize: '0.95rem', fontWeight: 700 }}
            onClick={handleFetchUrls}
            disabled={fetching || !urlInput.trim()}
          >
            {fetching ? '가져오는 중...' : '곡 정보 가져오기'}
          </button>
          <span style={{ fontSize: '0.8rem', color: '#065f46', opacity: 0.7 }}>
            제목·가사·스타일이 자동으로 추출됩니다
          </span>
        </div>
      </div>

      {/* 앨범 선택 + 등록 버튼 */}
      {songList.length > 0 && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            등록할 앨범:
          </label>
          <select
            className={styles.formInput}
            style={{ width: 'auto', minWidth: 160 }}
            value={targetSeriesId}
            onChange={e => setTargetSeriesId(e.target.value)}
          >
            <option value="">미분류</option>
            {songSeries.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button
            className={styles.addBtn}
            onClick={handleImport}
            disabled={importing || selectedKeys.size === 0}
            style={{ marginLeft: 'auto' }}
          >
            {importing ? '등록 중...' : `선택한 ${selectedKeys.size}곡 등록`}
          </button>
        </div>
      )}

      {/* 곡 목록 */}
      {songList.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={songList.filter(s => !s.already).length > 0 && songList.filter(s => !s.already).every(s => selectedKeys.has(s.key))}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedKeys(new Set(songList.filter(s => !s.already).map(s => s.key)));
                      } else {
                        setSelectedKeys(new Set());
                      }
                    }}
                  />
                </th>
                <th>제목</th>
                <th>가사</th>
                <th>상태</th>
                <th style={{ width: 90 }}></th>
              </tr>
            </thead>
            <tbody>
              {songList.map(song => (
                <Fragment key={song.key}>
                  <tr style={{ opacity: song.already ? 0.5 : 1 }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedKeys.has(song.key)}
                        disabled={song.already}
                        onChange={() => toggleSelect(song.key)}
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>{song.title || '(제목 없음)'}</td>
                    <td style={{ fontSize: '0.75rem', color: song.lyrics ? 'var(--text-secondary)' : '#dc2626', maxWidth: 200, fontWeight: song.lyrics ? 400 : 600 }}>
                      {song.lyrics ? (song.lyrics.length > 60 ? song.lyrics.slice(0, 60) + '...' : song.lyrics) : '⚠ 가사 없음'}
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${song.already ? styles.draft : (song.title && song.lyrics) ? styles.published : ''}`}
                        style={!song.already && (!song.title || !song.lyrics) ? { background: '#fef3c7', color: '#92400e' } : undefined}
                      >
                        {song.already ? '이미 등록' : (song.title && song.lyrics) ? '준비 완료' : '정보 부족'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: 4 }}>
                      {!song.already && (
                        <>
                          <button
                            className={styles.editBtn}
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                            onClick={() => setEditingKey(editingKey === song.key ? null : song.key)}
                          >
                            {editingKey === song.key ? '접기' : '편집'}
                          </button>
                          <button
                            className={styles.deleteBtn}
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                            onClick={() => removeSong(song.key)}
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </td>
                  </tr>

                  {/* 편집 패널 */}
                  {editingKey === song.key && !song.already && (
                    <tr>
                      <td colSpan={5} style={{ padding: '16px', background: 'var(--bg-secondary)', borderTop: 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>제목</label>
                              <input className={styles.formInput} value={song.title} onChange={e => updateField(song.key, 'title', e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>Suno URL</label>
                              <input className={styles.formInput} value={song.suno_url} onChange={e => updateField(song.key, 'suno_url', e.target.value)} />
                            </div>
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>스타일</label>
                            <input className={styles.formInput} value={song.style} onChange={e => updateField(song.key, 'style', e.target.value)} placeholder="쉼표로 구분" />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>가사</label>
                            <textarea
                              className={styles.formTextarea}
                              style={{ minHeight: 160 }}
                              value={song.lyrics}
                              onChange={e => updateField(song.key, 'lyrics', e.target.value)}
                              placeholder="자동으로 추출됩니다"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 로그 */}
      {log.length > 0 && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 8,
          padding: 16,
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          maxHeight: 300,
          overflowY: 'auto',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          marginTop: 20,
        }}>
          {log.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}
    </>
  );
}

/* ========================================
   데이터 관리 컴포넌트
   ======================================== */
function DataManageAdmin() {
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const addLog = (msg: string) => setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleClearAll = async () => {
    if (!window.confirm('정말 모든 데이터를 삭제하시겠습니까?\n(시, 노래, 시리즈, 카테고리 전부 삭제됩니다)')) return;
    setRunning(true);
    setLog([]);
    addLog('데이터 삭제 시작...');

    const { error: e1 } = await supabase.from('hohai_poems').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    addLog(e1 ? `시 삭제 실패: ${e1.message}` : '시 삭제 완료');

    const { error: e2 } = await supabase.from('hohai_songs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    addLog(e2 ? `노래 삭제 실패: ${e2.message}` : '노래 삭제 완료');

    const { error: e3 } = await supabase.from('hohai_series').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    addLog(e3 ? `시리즈 삭제 실패: ${e3.message}` : '시리즈 삭제 완료');

    const { error: e4 } = await supabase.from('hohai_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    addLog(e4 ? `카테고리 삭제 실패: ${e4.message}` : '카테고리 삭제 완료');

    addLog('전체 삭제 완료!');
    setRunning(false);
  };

  return (
    <>
      <div className={styles.header}>
        <h2>데이터 관리</h2>
      </div>

      <div className={styles.dangerZone}>
        <div className={styles.dangerTitle}>위험 영역</div>
        <div className={styles.dangerDesc}>
          아래 작업은 되돌릴 수 없습니다. 실행 전 반드시 확인하세요.
        </div>
        <button
          className={styles.deleteBtn}
          onClick={handleClearAll}
          disabled={running}
          style={{ padding: '10px 20px', fontSize: '0.95rem' }}
        >
          전체 데이터 삭제
        </button>
      </div>

      {log.length > 0 && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 8,
          padding: 16,
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          maxHeight: 300,
          overflowY: 'auto',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          marginTop: 20,
        }}>
          {log.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}
    </>
  );
}
