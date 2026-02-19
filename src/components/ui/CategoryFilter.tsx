import type { Category } from '../../types/category';
import styles from './CategoryFilter.module.css';

interface Props {
  categories: Category[];
  selected: string;
  onSelect: (slug: string) => void;
}

export default function CategoryFilter({ categories, selected, onSelect }: Props) {
  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.pill} ${selected === '' ? styles.active : ''}`}
        onClick={() => onSelect('')}
      >
        전체
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`${styles.pill} ${selected === cat.slug ? styles.active : ''}`}
          onClick={() => onSelect(cat.slug)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
