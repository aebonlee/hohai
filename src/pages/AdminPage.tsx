import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import { useAllPoems } from '../hooks/usePoems';
import { useAllSongs } from '../hooks/useSongs';
import { useAllSeries } from '../hooks/useSeries';
import { useAllCategories, type CategoryInsert } from '../hooks/useCategories';
import type { PoemInsert } from '../types/poem';
import type { SongInsert } from '../types/song';
import type { SeriesInsert } from '../types/series';
import styles from './AdminPage.module.css';

type Tab = 'poems' | 'poem-boards' | 'songs' | 'song-boards' | 'categories';

export default function AdminPage() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('poems');

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
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'poems' ? styles.active : ''}`}
              onClick={() => setActiveTab('poems')}
            >
              시 관리
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'poem-boards' ? styles.active : ''}`}
              onClick={() => setActiveTab('poem-boards')}
            >
              시집 관리
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'songs' ? styles.active : ''}`}
              onClick={() => setActiveTab('songs')}
            >
              노래 관리
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'song-boards' ? styles.active : ''}`}
              onClick={() => setActiveTab('song-boards')}
            >
              앨범 관리
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'categories' ? styles.active : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              카테고리 관리
            </button>
          </div>

          {activeTab === 'poems' && <PoemsAdmin />}
          {activeTab === 'poem-boards' && <BoardSeriesAdmin seriesType="poem" typeLabel="시집" itemLabel="시" />}
          {activeTab === 'songs' && <SongsAdmin />}
          {activeTab === 'song-boards' && <BoardSeriesAdmin seriesType="song" typeLabel="앨범" itemLabel="노래" />}
          {activeTab === 'categories' && <CategoriesAdmin />}
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
  const [form, setForm] = useState<PoemInsert>({
    title: '',
    content: '',
    excerpt: '',
    category: '기타',
    series_id: null,
    tags: [],
    bg_theme: 0,
    display_order: 0,
    is_featured: false,
    is_published: true,
    written_date: null,
  });

  const resetForm = () => {
    setForm({
      title: '', content: '', excerpt: '', category: '기타',
      series_id: null, tags: [], bg_theme: 0, display_order: 0,
      is_featured: false, is_published: true, written_date: null,
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

  return (
    <>
      <div className={styles.header}>
        <h2>시 목록 ({poems.length}편)</h2>
        <button className={styles.addBtn} onClick={openCreate}>+ 새 시 작성</button>
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
              <th>상태</th>
              <th>순서</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {poems.map((poem) => (
              <tr key={poem.id}>
                <td className={styles.titleCell}>{poem.title}</td>
                <td>{poemSeries.find(s => s.id === poem.series_id)?.name || '-'}</td>
                <td>{poem.category}</td>
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
                  <input
                    className={styles.formInput}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
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
                  대표 시
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
