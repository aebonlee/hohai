import type { Category } from '../../types/category';
import { CATEGORY_COLORS } from '../../lib/constants';
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
        title="모든 카테고리의 시를 봅니다"
      >
        전체
      </button>
      {categories.map((cat) => {
        const color = CATEGORY_COLORS[cat.name];
        const isActive = selected === cat.slug;
        return (
          <button
            key={cat.id}
            className={`${styles.pill} ${isActive ? styles.active : ''}`}
            onClick={() => onSelect(cat.slug)}
            title="이 카테고리의 시만 봅니다"
            style={isActive && color ? { background: color, borderColor: color } : undefined}
          >
            {color && !isActive && <span className={styles.dot} style={{ background: color }} />}
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
