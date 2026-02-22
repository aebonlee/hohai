import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <div className={styles.brand}>好海</div>
          <p className={styles.desc}>
            시와 노래로 전하는 마음.<br />
            好海 이성헌 시인의 작품 세계를 만나보세요.
          </p>
        </div>
        <div className={styles.linkGroups}>
          <div className={styles.linkGroup}>
            <span className={styles.linkGroupLabel}>시(詩)</span>
            <Link to="/poems" className={styles.link}>추천 시</Link>
            <Link to="/poem-series" className={styles.link}>시(詩)모음집</Link>
            <Link to="/published-books" className={styles.link}>출간시집</Link>
          </div>
          <div className={styles.linkGroup}>
            <span className={styles.linkGroupLabel}>노래</span>
            <Link to="/latest-songs" className={styles.link}>최신 노래</Link>
            <Link to="/albums" className={styles.link}>노래모음집</Link>
          </div>
          <div className={styles.linkGroup}>
            <span className={styles.linkGroupLabel}>더보기</span>
            <Link to="/community" className={styles.link}>커뮤니티</Link>
            <Link to="/about" className={styles.link}>시인 소개</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        &copy; {new Date().getFullYear()} 호해 이성헌. All rights reserved.
      </div>
    </footer>
  );
}
