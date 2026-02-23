import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/layout/PageTransition';
import SongCard from '../components/ui/SongCard';
import LyricsPlayer from '../components/ui/LyricsPlayer';
import ViewModeSelector, { useViewMode } from '../components/ui/ViewModeSelector';
import { useSongs } from '../hooks/useSongs';
import { usePlayback } from '../contexts/PlaybackContext';
import styles from './FeaturedSongsPage.module.css';

export default function FeaturedSongsPage() {
  const { songs, loading } = useSongs(undefined, true);
  const [viewMode, setViewMode] = useViewMode('featuredSongs');
  const {
    setPlaylist, clearPlaylist,
    playlist, currentIndex,
    lyricsPlayerOpen, closeLyricsPlayer,
  } = usePlayback();

  // 플레이리스트 등록
  useEffect(() => {
    if (songs.length > 0) setPlaylist(songs);
    return () => clearPlaylist();
  }, [songs, setPlaylist, clearPlaylist]);

  const currentSong = playlist && currentIndex >= 0 ? playlist[currentIndex] : null;

  return (
    <PageTransition>
      <Helmet>
        <title>추천 노래 — 好海</title>
        <meta name="description" content="好海 이성헌 시인의 추천 노래 모음" />
      </Helmet>

      <div className={styles.page}>
        <div className="container">
          <div className={styles.header}>
            <h1 className="section-title" style={{ display: 'inline-block' }}>추천 노래</h1>
            <p className={styles.subtitle}>시에 멜로디를 입혀 노래로 전합니다</p>
          </div>

          <div className={styles.toolbar}>
            <ViewModeSelector mode={viewMode} onChange={setViewMode} />
          </div>

          {loading ? (
            <p className={styles.empty}>불러오는 중...</p>
          ) : songs.length > 0 ? (
            viewMode === 'board' ? (
              <div className={styles.boardList}>
                <div className={styles.boardHeader}>
                  <span className={styles.boardColNum}>#</span>
                  <span className={styles.boardColTitle}>제목</span>
                  <span className={styles.boardColDesc}>설명</span>
                </div>
                {songs.map((song, i) => (
                  <div key={song.id} className={styles.boardRow}>
                    <span className={styles.boardColNum}>{i + 1}</span>
                    <span className={styles.boardColTitle}>{song.title}</span>
                    <span className={styles.boardColDesc}>{song.description || ''}</span>
                  </div>
                ))}
              </div>
            ) : viewMode === 'blog' ? (
              <div className={styles.blogList}>
                {songs.map((song) => (
                  <div key={song.id} className={styles.blogItem}>
                    <SongCard song={song} />
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.grid}>
                {songs.map((song, i) => (
                  <SongCard key={song.id} song={song} index={i} />
                ))}
              </div>
            )
          ) : (
            <p className={styles.empty}>아직 추천 노래가 없습니다.</p>
          )}
        </div>
      </div>

      {currentSong && (
        <LyricsPlayer
          song={currentSong}
          isOpen={lyricsPlayerOpen}
          onClose={closeLyricsPlayer}
        />
      )}
    </PageTransition>
  );
}
