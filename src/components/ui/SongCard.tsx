import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Song } from '../../types/song';
import styles from './SongCard.module.css';

/** suno_url에서 song ID를 추출하여 embed URL 반환 */
function getSunoEmbedUrl(sunoUrl: string): string {
  const match = sunoUrl.match(/suno\.com\/(?:song|s)\/([a-zA-Z0-9-]+)/);
  if (match) return `https://suno.com/embed/${match[1]}`;
  return sunoUrl;
}

interface Props {
  song: Song;
  index?: number;
}

export default function SongCard({ song, index = 0 }: Props) {
  const [ytPlaying, setYtPlaying] = useState(false);
  const [sunoPlaying, setSunoPlaying] = useState(false);
  const hasYoutube = !!song.youtube_id;
  const hasSuno = !!song.suno_url;

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* 메인 미디어: YouTube 우선, 없으면 Suno */}
      <div className={styles.thumbnail}>
        {hasYoutube ? (
          ytPlaying ? (
            <iframe
              className={styles.iframe}
              src={`https://www.youtube.com/embed/${song.youtube_id}?autoplay=1&rel=0`}
              title={song.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <img
                className={styles.thumbnailImg}
                src={`https://img.youtube.com/vi/${song.youtube_id}/hqdefault.jpg`}
                alt={song.title}
                loading="lazy"
              />
              <button
                className={styles.playBtn}
                onClick={() => setYtPlaying(true)}
                aria-label={`${song.title} 재생`}
              />
              {hasSuno && <span className={styles.sourceBadge}>YouTube</span>}
            </>
          )
        ) : hasSuno ? (
          sunoPlaying ? (
            <iframe
              className={styles.sunoIframe}
              src={getSunoEmbedUrl(song.suno_url!)}
              title={`${song.title} - Suno AI`}
              allow="autoplay"
              frameBorder="0"
            />
          ) : (
            <div className={styles.sunoPlaceholder} onClick={() => setSunoPlaying(true)}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              <span className={styles.sunoLabel}>Suno AI</span>
              <div className={styles.sunoPlayIcon} />
            </div>
          )
        ) : null}
      </div>

      {/* YouTube + Suno 둘 다 있을 때: Suno 임베드 영역 */}
      {hasYoutube && hasSuno && (
        <div className={styles.sunoSection}>
          {sunoPlaying ? (
            <iframe
              className={styles.sunoIframe}
              src={getSunoEmbedUrl(song.suno_url!)}
              title={`${song.title} - Suno AI`}
              allow="autoplay"
              frameBorder="0"
            />
          ) : (
            <button className={styles.sunoBtn} onClick={() => setSunoPlaying(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              Suno AI로 듣기
            </button>
          )}
        </div>
      )}

      <div className={styles.info}>
        <h3 className={styles.title}>{song.title}</h3>
        {song.description && (
          <p className={styles.description}>{song.description}</p>
        )}
      </div>
    </motion.article>
  );
}
