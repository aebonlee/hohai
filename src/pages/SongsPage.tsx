import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/layout/PageTransition';
import SongCard from '../components/ui/SongCard';
import { useSongs } from '../hooks/useSongs';
import styles from './SongsPage.module.css';

export default function SongsPage() {
  const { songs, loading } = useSongs();

  return (
    <PageTransition>
      <Helmet>
        <title>노래 — 호해</title>
        <meta name="description" content="호해 이성헌 시인의 노래 모음" />
      </Helmet>

      <div className={styles.page}>
        <div className="container">
          <div className={styles.header}>
            <h1 className="section-title" style={{ display: 'inline-block' }}>노래</h1>
            <p className={styles.subtitle}>시에 멜로디를 입혀 노래로 전합니다</p>
          </div>

          {loading ? (
            <p className={styles.empty}>불러오는 중...</p>
          ) : songs.length > 0 ? (
            <div className={styles.grid}>
              {songs.map((song, i) => (
                <SongCard key={song.id} song={song} index={i} />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>
              아직 등록된 노래가 없습니다. 곧 아름다운 노래를 들려드리겠습니다.
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
