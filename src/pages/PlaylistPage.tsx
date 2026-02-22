import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { usePlaylistContext } from '../contexts/PlaylistContext';
import { usePlayback } from '../contexts/PlaybackContext';
import { useSongs } from '../hooks/useSongs';
import type { Song } from '../types/song';
import type { RepeatMode } from '../contexts/PlaybackContext';
import PageTransition from '../components/layout/PageTransition';
import SongCard from '../components/ui/SongCard';
import styles from './PlaylistPage.module.css';

export default function PlaylistPage() {
  const { user } = useAuth();
  const {
    playlists, loading: plLoading,
    createPlaylist, updatePlaylist, deletePlaylist, removeSongFromPlaylist,
  } = usePlaylistContext();
  const { songs, loading: songsLoading } = useSongs();
  const { setPlaylist, play, playShuffled, repeatMode, setRepeatMode } = usePlayback();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState('');

  const selected = playlists.find((p) => p.id === selectedId) || null;

  // 자동 선택: 첫 번째 재생목록
  const effectiveSelected = selected || (playlists.length > 0 ? playlists[0] : null);

  // song_ids → Song 객체 매핑
  const songMap = useMemo(() => {
    const m = new Map<string, Song>();
    songs.forEach((s) => m.set(s.id, s));
    return m;
  }, [songs]);

  const playlistSongs = useMemo(() => {
    if (!effectiveSelected) return [];
    return effectiveSelected.song_ids
      .map((id) => songMap.get(id))
      .filter((s): s is Song => !!s);
  }, [effectiveSelected, songMap]);

  const handleCreate = async () => {
    if (!newName.trim() || !user) return;
    const { data } = await createPlaylist({ user_id: user.id, name: newName.trim() });
    if (data) setSelectedId(data.id);
    setNewName('');
    setCreatingNew(false);
  };

  const handleRename = async () => {
    if (!effectiveSelected || !nameInput.trim()) return;
    await updatePlaylist(effectiveSelected.id, { name: nameInput.trim() });
    setEditingName(false);
  };

  const handleDelete = async () => {
    if (!effectiveSelected) return;
    if (!confirm(`"${effectiveSelected.name}" 재생목록을 삭제할까요?`)) return;
    await deletePlaylist(effectiveSelected.id);
    setSelectedId(null);
  };

  const handleRemoveSong = async (songId: string) => {
    if (!effectiveSelected) return;
    await removeSongFromPlaylist(effectiveSelected.id, songId);
  };

  const handlePlayAll = () => {
    if (playlistSongs.length === 0) return;
    setRepeatMode('all');
    setPlaylist(playlistSongs);
    play(playlistSongs[0].id);
  };

  const handleShuffle = () => {
    if (playlistSongs.length === 0) return;
    setRepeatMode('all');
    playShuffled(playlistSongs);
  };

  const cycleRepeat = () => {
    const modes: RepeatMode[] = ['none', 'all', 'one'];
    const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    setRepeatMode(next);
  };

  const repeatLabel = repeatMode === 'one' ? '한곡 반복' : repeatMode === 'all' ? '전체 반복' : '반복 끔';
  const repeatIcon = repeatMode === 'one' ? '🔂' : '🔁';
  const repeatTitle = repeatMode === 'none' ? '전체 반복으로 전환' : repeatMode === 'all' ? '한곡 반복으로 전환' : '반복을 끕니다';

  const loading = plLoading || songsLoading;

  return (
    <PageTransition>
      <Helmet>
        <title>내 재생목록 | 好海</title>
      </Helmet>

      <motion.div
        className={styles.page}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>내 재생목록</h1>
          <p className={styles.pageDesc}>나만의 음악 재생목록을 만들어 보세요</p>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className="loading-spinner" />
          </div>
        ) : (
          <div className={styles.layout}>
            {/* 사이드바 */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarList}>
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    className={`${styles.sidebarItem} ${effectiveSelected?.id === pl.id ? styles.active : ''}`}
                    onClick={() => setSelectedId(pl.id)}
                    title="클릭하면 이 재생목록의 곡 목록을 봅니다"
                  >
                    <span className={styles.sidebarIcon}>♫</span>
                    <span className={styles.sidebarName}>{pl.name}</span>
                    <span className={styles.sidebarCount}>{pl.song_ids.length}</span>
                  </button>
                ))}
              </div>

              {creatingNew ? (
                <div className={styles.sidebarCreate}>
                  <input
                    className={styles.sidebarInput}
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreate();
                      if (e.key === 'Escape') setCreatingNew(false);
                    }}
                    placeholder="재생목록 이름"
                    autoFocus
                    maxLength={50}
                  />
                  <div className={styles.sidebarCreateBtns}>
                    <button className={styles.confirmBtn} onClick={handleCreate} disabled={!newName.trim()}>확인</button>
                    <button className={styles.cancelBtn} onClick={() => setCreatingNew(false)}>취소</button>
                  </div>
                </div>
              ) : (
                <button className={styles.newPlaylistBtn} onClick={() => setCreatingNew(true)} title="새로운 재생목록을 만듭니다">
                  + 새 재생목록
                </button>
              )}
            </aside>

            {/* 메인 콘텐츠 */}
            <main className={styles.main}>
              {effectiveSelected ? (
                <>
                  <div className={styles.playlistHeader}>
                    <div className={styles.playlistTitleRow}>
                      {editingName ? (
                        <div className={styles.renameForm}>
                          <input
                            className={styles.renameInput}
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename();
                              if (e.key === 'Escape') setEditingName(false);
                            }}
                            autoFocus
                            maxLength={50}
                          />
                          <button className={styles.confirmBtn} onClick={handleRename}>확인</button>
                          <button className={styles.cancelBtn} onClick={() => setEditingName(false)}>취소</button>
                        </div>
                      ) : (
                        <h2 className={styles.playlistName}>{effectiveSelected.name}</h2>
                      )}
                      <span className={styles.songCount}>{playlistSongs.length}곡</span>
                    </div>

                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        onClick={handlePlayAll}
                        disabled={playlistSongs.length === 0}
                        title="재생목록의 모든 곡을 처음부터 이어서 재생합니다"
                      >
                        ▶ 전체재생
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={handleShuffle}
                        disabled={playlistSongs.length === 0}
                        title="곡 순서를 무작위로 섞어서 재생합니다"
                      >
                        🔀 셔플
                      </button>
                      <button
                        className={`${styles.actionBtn} ${repeatMode !== 'none' ? styles.actionActive : ''}`}
                        onClick={cycleRepeat}
                        title={repeatTitle}
                      >
                        {repeatIcon} {repeatLabel}
                      </button>
                      <div className={styles.actionsDivider} />
                      <button
                        className={styles.actionBtnMuted}
                        onClick={() => { setNameInput(effectiveSelected.name); setEditingName(true); }}
                        title="재생목록 이름을 변경합니다"
                      >
                        이름변경
                      </button>
                      <button className={styles.actionBtnDanger} onClick={handleDelete} title="이 재생목록을 삭제합니다">
                        삭제
                      </button>
                    </div>
                  </div>

                  {playlistSongs.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>재생목록이 비어 있습니다</p>
                      <p className={styles.emptyHint}>노래 카드의 <strong>+</strong> 버튼으로 곡을 추가해 보세요</p>
                    </div>
                  ) : (
                    <div className={styles.songGrid}>
                      {playlistSongs.map((song, i) => (
                        <div key={song.id} className={styles.songCardWrapper}>
                          <SongCard song={song} index={i} contextPlaylist={playlistSongs} />
                          <button
                            className={styles.removeBtn}
                            onClick={() => handleRemoveSong(song.id)}
                            aria-label={`${song.title} 제거`}
                            title="재생목록에서 제거"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.emptyState}>
                  <p>재생목록을 만들어 보세요</p>
                  <p className={styles.emptyHint}>왼쪽의 "새 재생목록" 버튼을 눌러 시작하세요</p>
                </div>
              )}
            </main>
          </div>
        )}
      </motion.div>
    </PageTransition>
  );
}
