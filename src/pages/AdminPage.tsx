import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import { useAllPoems } from '../hooks/usePoems';
import { useAllSongs } from '../hooks/useSongs';
import { useAllSeries } from '../hooks/useSeries';
import { useAllCategories, type CategoryInsert } from '../hooks/useCategories';
import { useAllReviews } from '../hooks/useReviews';
import { supabase } from '../lib/supabase';
import { CATEGORY_NAMES, CATEGORY_COLORS } from '../lib/constants';
import { POEM_CLASSIFICATIONS, CATEGORY_LIST } from '../data/poem-categories';
import type { PoemInsert } from '../types/poem';
import type { SongInsert } from '../types/song';
import type { SeriesInsert } from '../types/series';
import { SUNO_ALBUM_DEFS, SUNO_SONGS } from '../data/suno-songs';
import styles from './AdminPage.module.css';

type Tab = 'dashboard' | 'poems' | 'poem-boards' | 'songs' | 'song-boards' | 'poem-categories' | 'reviews' | 'batch-seed' | 'data-manage';

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
    ],
  },
  {
    group: '커뮤니티',
    items: [{ tab: 'reviews', label: '후기 관리', icon: '{}' }],
  },
  {
    group: '도구',
    items: [
      { tab: 'batch-seed', label: '일괄 등록', icon: '{}' },
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
  reviews: '후기 관리',
  'batch-seed': '일괄 등록',
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
            {activeTab === 'poem-categories' && <CategoriesAdmin />}
            {activeTab === 'reviews' && <ReviewsAdmin />}
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
function DashboardAdmin({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { poems, loading: poemsLoading } = useAllPoems();
  const { songs, loading: songsLoading } = useAllSongs();
  const { series, loading: seriesLoading } = useAllSeries();
  const { reviews, loading: reviewsLoading } = useAllReviews();

  const loading = poemsLoading || songsLoading || seriesLoading || reviewsLoading;
  const poemSeriesCount = series.filter(s => s.type === 'poem').length;
  const songSeriesCount = series.filter(s => s.type === 'song').length;

  return (
    <>
      <div className={styles.header}>
        <h2>대시보드</h2>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.statCard} onClick={() => onNavigate('poems')}>
          <div className={styles.statLabel}>시</div>
          <div className={styles.statValue}>{loading ? '...' : poems.length}</div>
          <div className={styles.statHint}>시집 {poemSeriesCount}개 &rarr;</div>
        </div>
        <div className={styles.statCard} onClick={() => onNavigate('songs')}>
          <div className={styles.statLabel}>노래</div>
          <div className={styles.statValue}>{loading ? '...' : songs.length}</div>
          <div className={styles.statHint}>앨범 {songSeriesCount}개 &rarr;</div>
        </div>
        <div className={styles.statCard} onClick={() => onNavigate('poem-boards')}>
          <div className={styles.statLabel}>시리즈</div>
          <div className={styles.statValue}>{loading ? '...' : series.length}</div>
          <div className={styles.statHint}>시집 + 앨범 &rarr;</div>
        </div>
        <div className={styles.statCard} onClick={() => onNavigate('reviews')}>
          <div className={styles.statLabel}>후기</div>
          <div className={styles.statValue}>{loading ? '...' : reviews.length}</div>
          <div className={styles.statHint}>감상 후기 &rarr;</div>
        </div>
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
  const todayStr = new Date().toISOString().split('T')[0];
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
    series_id: null,
    display_order: 0,
    is_featured: false,
    is_published: true,
    recorded_date: null,
  });

  const resetForm = () => {
    setForm({
      title: '', youtube_id: '', suno_url: '', description: '', lyrics: '',
      series_id: null, display_order: 0, is_featured: false, is_published: true, recorded_date: null,
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
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
   일괄 등록 컴포넌트
   ======================================== */
function BatchSeedAdmin() {
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const addLog = (msg: string) => setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleSeedPoems = async () => {
    if (!window.confirm('177편의 시를 일괄 등록하시겠습니까?\n(시집 "3차 퇴고 완성작" 생성 후 시 등록)')) return;
    setRunning(true);
    setLog([]);
    addLog('시 일괄 등록 시작...');

    // 1. 카테고리 등록 (9개)
    addLog('카테고리 9개 등록 중...');
    const catRows = CATEGORY_LIST.map(c => ({
      name: c.name, slug: c.slug, description: c.description, display_order: c.order,
    }));
    const { error: catErr } = await supabase.from('hohai_categories').upsert(catRows, { onConflict: 'slug' });
    addLog(catErr ? `카테고리 등록 실패: ${catErr.message}` : `카테고리 ${catRows.length}개 등록 완료`);

    // 2. 시집(시리즈) 등록
    addLog('시집 등록 중...');
    const { data: seriesData, error: serErr } = await supabase.from('hohai_series').insert({
      name: '3차 퇴고 완성작',
      slug: 'final-collection-2008',
      description: '好海 이성헌 — 3차 퇴고 완성작 (2008년 8월 15일, 가나다 순)',
      type: 'poem',
      display_order: 1,
      is_published: true,
    }).select('id').single();
    if (serErr) {
      addLog(`시집 등록 실패: ${serErr.message}`);
      setRunning(false);
      return;
    }
    const seriesId = seriesData.id;
    addLog(`시집 등록 완료 (ID: ${seriesId})`);

    // 3. 시 데이터 로드 & 등록
    addLog('177편의 시 등록 중...');
    const { POEM_DATA } = await import('../data/poems');

    const BATCH_SIZE = 20;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < POEM_DATA.length; i += BATCH_SIZE) {
      const batch = POEM_DATA.slice(i, i + BATCH_SIZE).map((p, idx) => {
        const cls = POEM_CLASSIFICATIONS[p.page];
        return {
          title: p.title,
          content: p.content,
          excerpt: p.content.split('\n').slice(0, 4).join('\n'),
          category: cls?.category ?? '인생',
          series_id: seriesId,
          tags: cls?.tags ?? [],
          bg_theme: (i + idx) % 8,
          display_order: p.page,
          is_featured: false,
          is_published: true,
          written_date: new Date().toISOString().split('T')[0],
        };
      });

      const { error: batchErr } = await supabase.from('hohai_poems').insert(batch);
      if (batchErr) {
        addLog(`배치 ${Math.floor(i / BATCH_SIZE) + 1} 실패: ${batchErr.message}`);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
      }
      addLog(`진행: ${Math.min(i + BATCH_SIZE, POEM_DATA.length)} / ${POEM_DATA.length}`);
    }

    addLog(`시 등록 완료! 성공: ${successCount}편, 실패: ${errorCount}편`);
    setRunning(false);
  };

  const handleUpdateWrittenDates = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (!window.confirm(`모든 시의 작성일을 ${today}(오늘)로 변경하시겠습니까?`)) return;
    setRunning(true);
    setLog([]);
    addLog(`작성일 일괄 변경 시작 → ${today}`);

    const { data, error: countErr } = await supabase
      .from('hohai_poems')
      .update({ written_date: today })
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .select('id');

    if (countErr) {
      addLog(`업데이트 실패: ${countErr.message}`);
    } else {
      addLog(`${data?.length ?? 0}편의 작성일을 ${today}로 변경 완료!`);
    }
    setRunning(false);
  };

  const handleUpdateCategories = async () => {
    if (!window.confirm('기존 시 177편의 카테고리/태그를 일괄 업데이트하시겠습니까?\n(기존 카테고리 삭제 후 9개 새 카테고리 등록 + 시 분류 업데이트)')) return;
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

  const handleSeedSongs = async () => {
    if (!window.confirm(`Suno 노래 ${SUNO_SONGS.length}곡을 7개 앨범으로 일괄 등록하시겠습니까?`)) return;
    setRunning(true);
    setLog([]);
    addLog(`Suno 노래 일괄 등록 시작 (${SUNO_SONGS.length}곡, 7개 앨범)...`);

    // 1. 7개 앨범(시리즈) 생성
    addLog('앨범 7개 생성 중...');
    const albumIdMap: Record<string, string> = {};
    for (const album of SUNO_ALBUM_DEFS) {
      const { data, error } = await supabase.from('hohai_series').upsert({
        name: album.name,
        slug: album.slug,
        description: album.description,
        type: 'song',
        display_order: album.order,
        is_published: true,
      }, { onConflict: 'slug' }).select('id, slug').single();

      if (error) {
        addLog(`앨범 "${album.name}" 생성 실패: ${error.message}`);
      } else if (data) {
        albumIdMap[album.slug] = data.id;
        addLog(`  \u2713 ${album.name} (${album.slug})`);
      }
    }
    addLog(`앨범 ${Object.keys(albumIdMap).length}개 등록 완료`);

    if (Object.keys(albumIdMap).length === 0) {
      addLog('앨범 생성 실패 — 중단');
      setRunning(false);
      return;
    }

    // 2. 노래 일괄 등록 (20개씩 배치)
    addLog(`노래 ${SUNO_SONGS.length}곡 등록 시작...`);
    const BATCH_SIZE = 20;
    let successCount = 0;
    let errorCount = 0;

    // 앨범별 통계
    const albumStats: Record<string, number> = {};

    for (let i = 0; i < SUNO_SONGS.length; i += BATCH_SIZE) {
      const batch = SUNO_SONGS.slice(i, i + BATCH_SIZE).map((s, idx) => {
        const seriesId = albumIdMap[s.albumSlug] || null;
        albumStats[s.albumSlug] = (albumStats[s.albumSlug] || 0) + 1;
        return {
          title: s.title,
          suno_url: s.suno_url,
          youtube_id: '',
          series_id: seriesId,
          display_order: i + idx,
          is_featured: false,
          is_published: true,
        } satisfies SongInsert;
      });

      const { error: batchErr } = await supabase.from('hohai_songs').insert(batch);
      if (batchErr) {
        addLog(`배치 ${Math.floor(i / BATCH_SIZE) + 1} 실패: ${batchErr.message}`);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
      }
      addLog(`진행: ${Math.min(i + BATCH_SIZE, SUNO_SONGS.length)} / ${SUNO_SONGS.length}`);
    }

    // 3. 결과 출력
    addLog('--- 앨범별 등록 현황 ---');
    for (const album of SUNO_ALBUM_DEFS) {
      addLog(`  ${album.name}: ${albumStats[album.slug] || 0}곡`);
    }
    addLog(`\n등록 완료! 성공: ${successCount}곡, 실패: ${errorCount}곡`);
    setRunning(false);
  };

  return (
    <>
      <div className={styles.header}>
        <h2>일괄 등록</h2>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <button
          className={styles.addBtn}
          onClick={handleSeedPoems}
          disabled={running}
          style={{ padding: '10px 20px', fontSize: '0.95rem' }}
        >
          시 177편 일괄 등록
        </button>
        <button
          className={styles.addBtn}
          onClick={handleSeedSongs}
          disabled={running}
          style={{ padding: '10px 20px', fontSize: '0.95rem', background: '#6366f1' }}
        >
          노래 {SUNO_SONGS.length}곡 일괄 등록
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          className={styles.saveBtn}
          onClick={handleUpdateCategories}
          disabled={running}
          style={{ padding: '10px 20px', fontSize: '0.95rem' }}
        >
          카테고리/태그 일괄 업데이트
        </button>
        <button
          className={styles.saveBtn}
          onClick={handleUpdateWrittenDates}
          disabled={running}
          style={{ padding: '10px 20px', fontSize: '0.95rem' }}
        >
          작성일 → 오늘 날짜로 일괄 변경
        </button>
        <button
          className={styles.editBtn}
          onClick={handleShowStats}
          disabled={running}
          style={{ padding: '10px 20px', fontSize: '0.95rem' }}
        >
          카테고리 현황 보기
        </button>
      </div>

      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 8,
        padding: 16,
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        maxHeight: 400,
        overflowY: 'auto',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
      }}>
        {log.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>
            버튼을 클릭하면 로그가 표시됩니다.
            <br /><br />
            <strong>시 177편 일괄 등록</strong>: 카테고리 9개 + 시집 + 177편 시 (분류 포함) 자동 등록
            <br />
            <strong>노래 일괄 등록</strong>: Suno AI 곡 7개 앨범으로 분류 + 중복 제거 후 일괄 등록
            <br />
            <strong>카테고리/태그 일괄 업데이트</strong>: 기존 등록된 시의 카테고리/태그만 일괄 변경
            <br />
            <strong>카테고리 현황 보기</strong>: 카테고리별 시 수 + 인기 태그 통계
          </p>
        ) : (
          log.map((line, i) => <div key={i}>{line}</div>)
        )}
      </div>
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
