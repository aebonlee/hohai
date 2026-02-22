import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/layout/PageTransition';
import SongCard from '../components/ui/SongCard';
import LyricsPlayer from '../components/ui/LyricsPlayer';
import { useLatestSongs } from '../hooks/useSongs';
import { usePlayback } from '../contexts/PlaybackContext';
import styles from './LatestSongsPage.module.css';

export default function LatestSongsPage() {
  const { songs, loading } = useLatestSongs();
  const {
    setPlaylist, clearPlaylist,
    playlist, currentIndex,
    lyricsPlayerOpen, closeLyricsPlayer,
  } = usePlayback();

  useEffect(() => {
    if (songs.length > 0) setPlaylist(songs);
    return () => clearPlaylist();
  }, [songs, setPlaylist, clearPlaylist]);

  const currentSong = playlist && currentIndex >= 0 ? playlist[currentIndex] : null;

  return (
    <PageTransition>
      <Helmet>
        <title>최신 노래 — 好海</title>
        <meta name="description" content="好海 이성헌 시인의 최신 노래 — 시에 멜로디를 입힌 창작 음악" />
      </Helmet>

      <div className={styles.page}>
        <div className="container">
          <div className={styles.header}>
            <h1 className="section-title" style={{ display: 'inline-block' }}>최신 노래</h1>
            <p className={styles.subtitle}>새롭게 태어난 노래를 가장 먼저 만나보세요</p>
            {!loading && songs.length > 0 && (
              <span className={styles.count}>전체 {songs.length}곡</span>
            )}
          </div>

          {loading ? (
            <p className={styles.empty}>불러오는 중...</p>
          ) : songs.length > 0 ? (
            <div className={styles.grid}>
              {songs.map((song, i) => (
                <SongCard key={song.id} song={song} index={i} contextPlaylist={songs} />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>아직 등록된 노래가 없습니다.</p>
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
