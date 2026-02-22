import { useEffect, useRef, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Song } from '../../types/song';
import { usePlayback } from '../../contexts/PlaybackContext';
import { useYouTubePlayer } from '../../hooks/useYouTubePlayer';
import { detectMood, MOOD_GRADIENTS } from '../../lib/mood';
import LyricsEffects from './LyricsEffects';
import { getSunoEmbedUrl } from '../../lib/suno';
import styles from './LyricsPlayer.module.css';

interface Props {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
}

export default function LyricsPlayer({ song, isOpen, onClose }: Props) {
  const {
    onSongEnd, playlist, currentIndex,
    hasNext, hasPrev, next, prev,
  } = usePlayback();

  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const hasYoutube = !!song.youtube_id;
  const hasSuno = !!song.suno_url;
  const hasLyrics = !!song.lyrics;
  const hasTags = song.tags && song.tags.length > 0;
  const isInPlaylist = playlist !== null && currentIndex >= 0;

  const mood = detectMood(song.tags);
  const gradient = MOOD_GRADIENTS[mood];

  // 유니크 컨테이너 ID
  const uniqueId = useId();
  const ytContainerId = `lp-yt-${uniqueId.replace(/:/g, '')}`;

  // YouTube Player 훅 (종료 감지)
  useYouTubePlayer({
    containerId: ytContainerId,
    videoId: song.youtube_id || null,
    autoplay: false,
    enabled: isOpen && hasYoutube,
    onEnd: () => {
      onSongEnd();
    },
  });

  // ESC 키 핸들러
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // 포커스 트랩: Tab 키 순환
      if (e.key === 'Tab' && overlayRef.current) {
        const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), iframe'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose],
  );

  // 스크롤 잠금 + 포커스 관리
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;

    // 스크롤바 너비 보정
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    // 닫기 버튼에 포커스
    requestAnimationFrame(() => closeBtnRef.current?.focus());

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.removeEventListener('keydown', handleKeyDown);
      // 원래 요소로 포커스 복귀
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, handleKeyDown]);

  // 배경 클릭 닫기
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label={`${song.title} — 가사 플레이어`}
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            '--mood-c1': gradient.c1,
            '--mood-c2': gradient.c2,
            '--mood-c3': gradient.c3,
            '--mood-c4': gradient.c4,
          } as React.CSSProperties}
        >
          <LyricsEffects mood={mood} isActive={isOpen} />

          {/* 닫기 버튼 */}
          <motion.button
            ref={closeBtnRef}
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="닫기"
            title="가사 플레이어를 닫습니다 (ESC키로도 닫을 수 있습니다)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            ✕
          </motion.button>

          <div className={styles.content}>
            {/* 왼쪽: 플레이어 + 정보 */}
            <motion.div
              className={styles.playerPanel}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {/* 메인 플레이어 */}
              <div className={styles.playerWrapper}>
                {hasYoutube ? (
                  <div id={ytContainerId} style={{ width: '100%', height: '100%' }} />
                ) : hasSuno ? (
                  <iframe
                    src={getSunoEmbedUrl(song.suno_url!)}
                    title={`${song.title} - Suno AI`}
                    allow="autoplay"
                  />
                ) : null}
              </div>

              {/* YouTube + Suno 둘 다 있을 때 Suno 미니 플레이어 */}
              {hasYoutube && hasSuno && (
                <div className={styles.secondaryPlayer}>
                  <iframe
                    src={getSunoEmbedUrl(song.suno_url!)}
                    title={`${song.title} - Suno AI`}
                    allow="autoplay"
                  />
                </div>
              )}

              {/* 플레이리스트 내비게이션 */}
              {isInPlaylist && playlist && (
                <div className={styles.playlistNav}>
                  <button
                    className={styles.navBtn}
                    onClick={prev}
                    disabled={!hasPrev}
                    aria-label="이전 곡"
                    title="이전 곡"
                  >
                    ⏮ 이전
                  </button>
                  <span className={styles.navPosition}>
                    {currentIndex + 1} / {playlist.length}
                  </span>
                  <button
                    className={styles.navBtn}
                    onClick={next}
                    disabled={!hasNext}
                    aria-label="다음 곡"
                    title="다음 곡"
                  >
                    다음 ⏭
                  </button>
                </div>
              )}

              {/* 노래 메타 */}
              <div className={styles.songMeta}>
                <h2 className={styles.songTitle}>{song.title}</h2>
                {song.description && (
                  <p className={styles.songDescription}>{song.description}</p>
                )}
                {hasTags && (
                  <div className={styles.songTags}>
                    {song.tags.map((tag) => (
                      <span key={tag} className={styles.songTag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* 오른쪽: 가사 패널 */}
            <motion.div
              className={styles.lyricsPanel}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div className={styles.lyricsHeader}>가사</div>
              {hasLyrics ? (
                <div className={styles.lyricsBody}>{song.lyrics}</div>
              ) : (
                <div className={styles.noLyrics}>가사가 없습니다</div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
