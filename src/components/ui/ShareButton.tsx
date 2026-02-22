import { useState, useCallback } from 'react';
import styles from './ShareButton.module.css';

interface Props {
  title: string;
  text?: string;
  url?: string;
}

export default function ShareButton({ title, text, url }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;

  const handleShare = useCallback(async () => {
    // Web Share API (주로 모바일)
    if (navigator.share) {
      try {
        await navigator.share({ title, text: text || title, url: shareUrl });
        return;
      } catch {
        // 사용자가 공유를 취소한 경우 무시
        return;
      }
    }

    // Fallback: 클립보드 복사
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API 미지원 시 fallback
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [title, text, shareUrl]);

  return (
    <button
      className={`${styles.btn} ${copied ? styles.copied : ''}`}
      onClick={handleShare}
      title="공유하기"
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          복사됨
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          공유
        </>
      )}
    </button>
  );
}
