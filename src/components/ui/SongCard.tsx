import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Song } from '../../types/song';
import styles from './SongCard.module.css';

interface Props {
  song: Song;
  index?: number;
}

export default function SongCard({ song, index = 0 }: Props) {
  const [playing, setPlaying] = useState(false);
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
      <div className={styles.thumbnail}>
        {hasYoutube ? (
          playing ? (
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
                onClick={() => setPlaying(true)}
                aria-label={`${song.title} 재생`}
              />
            </>
          )
        ) : (
          <div className={styles.sunoPlaceholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <span>Suno AI</span>
          </div>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{song.title}</h3>
        {song.description && (
          <p className={styles.description}>{song.description}</p>
        )}
        {hasSuno && (
          <a
            href={song.suno_url!}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sunoLink}
          >
            Suno AI에서 듣기 →
          </a>
        )}
      </div>
    </motion.article>
  );
}
