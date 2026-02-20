import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/layout/PageTransition';
import SongCard from '../components/ui/SongCard';
import { useSongs } from '../hooks/useSongs';
import { useSeriesDetail } from '../hooks/useSeries';
import styles from './SongSeriesPage.module.css';

export default function SongSeriesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { series, loading: seriesLoading } = useSeriesDetail(slug);
  const { songs, loading } = useSongs(series?.id);

  if (seriesLoading) {
    return (
      <PageTransition>
        <div className={styles.page}>
          <div className="container">
            <p className={styles.empty}>불러오는 중...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Helmet>
        <title>{series?.name || '노래'} — 好海</title>
        <meta name="description" content={series?.description || '好海 이성헌 시인의 노래'} />
      </Helmet>

      <div className={styles.page}>
        <div className="container">
          <Link to="/albums" className={styles.backLink}>← 앨범 목록</Link>

          <div className={styles.header}>
            <h1 className="section-title" style={{ display: 'inline-block' }}>
              {series?.name || '노래'}
            </h1>
            {series?.description && (
              <p className={styles.subtitle}>{series.description}</p>
            )}
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
              아직 이 앨범에 등록된 노래가 없습니다.
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
