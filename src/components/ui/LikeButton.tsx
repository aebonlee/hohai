import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLikes } from '../../hooks/useLikes';
import type { TargetType } from '../../types/interaction';
import styles from './LikeButton.module.css';

interface Props {
  targetType: TargetType;
  targetId: string;
}

export default function LikeButton({ targetType, targetId }: Props) {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const { count, liked, toggle } = useLikes(targetType, targetId, user?.id);

  const handleClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    toggle();
  };

  return (
    <button
      className={`${styles.btn} ${liked ? styles.liked : ''}`}
      onClick={handleClick}
      title={liked ? '좋아요 취소' : '좋아요'}
    >
      <span className={styles.heart}>{liked ? '♥' : '♡'}</span>
      {count > 0 && <span className={styles.count}>{count}</span>}
    </button>
  );
}
