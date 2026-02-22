import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePlaylistContext } from '../../contexts/PlaylistContext';
import styles from './AddToPlaylist.module.css';

const FAVORITES_NAME = '즐겨찾기';

interface Props {
  songId: string;
}

export default function AddToPlaylist({ songId }: Props) {
  const { isLoggedIn, user } = useAuth();
  const { playlists, createPlaylist, addSongToPlaylist, removeSongFromPlaylist } = usePlaylistContext();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const favorites = playlists.find((p) => p.name === FAVORITES_NAME);
  const isInFavorites = favorites ? favorites.song_ids.includes(songId) : false;

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // 즐겨찾기 토글 (한 번 클릭)
  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (busy) return;
    setBusy(true);

    try {
      if (favorites) {
        if (isInFavorites) {
          await removeSongFromPlaylist(favorites.id, songId);
        } else {
          await addSongToPlaylist(favorites.id, songId);
        }
      } else {
        // 즐겨찾기 재생목록 자동 생성 (곡 포함)
        await createPlaylist({ user_id: user!.id, name: FAVORITES_NAME, song_ids: [songId] });
      }
    } finally {
      setBusy(false);
    }
  };

  // 드롭다운 토글
  const handleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setOpen(!open);
    setCreating(false);
  };

  const handleAdd = async (playlistId: string) => {
    await addSongToPlaylist(playlistId, songId);
  };

  const handleRemove = async (playlistId: string) => {
    await removeSongFromPlaylist(playlistId, songId);
  };

  const handleCreate = async () => {
    if (!newName.trim() || !user) return;
    await createPlaylist({ user_id: user.id, name: newName.trim(), song_ids: [songId] });
    setNewName('');
    setCreating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate();
    if (e.key === 'Escape') setCreating(false);
  };

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <button
        className={`${styles.favBtn} ${isInFavorites ? styles.favActive : ''}`}
        onClick={handleFavoriteToggle}
        disabled={busy}
        aria-label={isInFavorites ? '즐겨찾기에서 제거' : '즐겨찾기에 추가'}
        title={isInFavorites ? '즐겨찾기에서 이 곡을 제거합니다' : '이 곡을 즐겨찾기에 추가합니다'}
      >
        {isInFavorites ? '★' : '☆'}
      </button>
      <button
        className={styles.moreBtn}
        onClick={handleDropdown}
        aria-label="다른 재생목록에 추가"
        title="다른 재생목록을 선택하여 곡을 추가합니다"
      >
        ▾
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>재생목록에 추가</div>

          {playlists.length === 0 && !creating && (
            <div className={styles.empty}>재생목록이 없습니다</div>
          )}

          {playlists.map((pl) => {
            const included = pl.song_ids.includes(songId);
            return (
              <button
                key={pl.id}
                className={`${styles.dropdownItem} ${included ? styles.included : ''}`}
                onClick={() => included ? handleRemove(pl.id) : handleAdd(pl.id)}
              >
                <span className={styles.itemCheck}>{included ? '✓' : ''}</span>
                <span className={styles.itemName}>{pl.name}</span>
                <span className={styles.itemCount}>{pl.song_ids.length}곡</span>
              </button>
            );
          })}

          {creating ? (
            <div className={styles.createForm}>
              <input
                className={styles.createInput}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="재생목록 이름"
                autoFocus
                maxLength={50}
              />
              <button className={styles.createConfirm} onClick={handleCreate} disabled={!newName.trim()}>
                확인
              </button>
            </div>
          ) : (
            <button className={styles.createBtn} onClick={() => setCreating(true)}>
              + 새 재생목록 만들기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
