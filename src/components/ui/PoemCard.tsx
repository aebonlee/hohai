import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Poem } from '../../types/poem';
import { CARD_GRADIENTS, CATEGORY_COLORS } from '../../lib/constants';
import type { MoodKey } from '../../lib/mood';
import { MOOD_CARD_GRADIENTS } from '../../lib/mood';
import styles from './PoemCard.module.css';

interface Props {
  poem: Poem;
  index?: number;
}

export default function PoemCard({ poem, index = 0 }: Props) {
  const navigate = useNavigate();
  const gradient = MOOD_CARD_GRADIENTS[poem.category as MoodKey]?.gradient
    ?? CARD_GRADIENTS[poem.bg_theme % CARD_GRADIENTS.length];

  const excerpt = poem.excerpt || poem.content.split('\n').slice(0, 4).join('\n');

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    navigate(`/poems?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <motion.article
      className={styles.card}
      style={{ background: gradient }}
      onClick={() => navigate(`/poems/${poem.id}`)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <span className={styles.category} style={{ color: CATEGORY_COLORS[poem.category] }}>{poem.category}</span>
      <h3 className={styles.title}>{poem.title}</h3>
      <p className={styles.excerpt}>{excerpt}</p>
      <div className={styles.footer}>
        {poem.tags && poem.tags.length > 0 && (
          <span className={styles.tags}>
            {poem.tags.slice(0, 3).map(t => (
              <span key={t} className={styles.tagLink} onClick={(e) => handleTagClick(e, t)}>#{t}</span>
            ))}
          </span>
        )}
        {poem.written_date && (
          <span className={styles.date}>{poem.written_date}</span>
        )}
      </div>
    </motion.article>
  );
}
