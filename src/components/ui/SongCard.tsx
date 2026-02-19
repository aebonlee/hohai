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

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className={styles.thumbnail}>
        {playing ? (
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
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{song.title}</h3>
        {song.description && (
          <p className={styles.description}>{song.description}</p>
        )}
      </div>
    </motion.article>
  );
}
