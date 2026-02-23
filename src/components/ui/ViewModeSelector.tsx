import { useState, useEffect } from 'react';
import styles from './ViewModeSelector.module.css';

export type ViewMode = 'gallery' | 'board' | 'blog';

interface Props {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
}

const LABELS: Record<ViewMode, string> = {
  gallery: '갤러리',
  board: '게시판',
  blog: '블로그',
};

const ICONS: Record<ViewMode, string> = {
  gallery: '▦',
  board: '☰',
  blog: '▤',
};

export function useViewMode(storageKey: string): [ViewMode, (m: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>(() => {
    try {
      return (localStorage.getItem(`viewMode_${storageKey}`) as ViewMode) || 'gallery';
    } catch {
      return 'gallery';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`viewMode_${storageKey}`, mode);
    } catch { /* ignore */ }
  }, [storageKey, mode]);

  return [mode, setMode];
}

export default function ViewModeSelector({ mode, onChange }: Props) {
  return (
    <div className={styles.selector}>
      {(['gallery', 'board', 'blog'] as ViewMode[]).map((m) => (
        <button
          key={m}
          className={`${styles.btn} ${mode === m ? styles.active : ''}`}
          onClick={() => onChange(m)}
          title={`${LABELS[m]} 보기`}
        >
          <span className={styles.icon}>{ICONS[m]}</span>
          <span className={styles.label}>{LABELS[m]}</span>
        </button>
      ))}
    </div>
  );
}
