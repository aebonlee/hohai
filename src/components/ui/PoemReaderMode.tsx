import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Poem } from '../../types/poem';
import type { MoodKey } from '../../lib/mood';
import { MOOD_GRADIENTS, MOOD_ACCENT_COLORS, MOOD_LIGHT_GRADIENTS } from '../../lib/mood';
import LyricsEffects from './LyricsEffects';
import styles from './PoemReaderMode.module.css';

interface Props {
  poems: Poem[];
  initialIndex: number;
  seriesName?: string;
  isOpen: boolean;
  onClose: () => void;
}

function getMood(category: string): MoodKey {
  return MOOD_LIGHT_GRADIENTS[category as MoodKey] ? (category as MoodKey) : 'default';
}

export default function PoemReaderMode({ poems, initialIndex, seriesName, isOpen, onClose }: Props) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [showHint, setShowHint] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const mood = poems[activeIndex] ? getMood(poems[activeIndex].category) : 'default';
  const gradient = MOOD_GRADIENTS[mood];
  const accent = MOOD_ACCENT_COLORS[mood];

  // ESC / 포커스 트랩
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && overlayRef.current) {
        const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    },
    [onClose],
  );

  // 스크롤 잠금 + 포커스 관리
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    requestAnimationFrame(() => closeBtnRef.current?.focus());
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, handleKeyDown]);

  // 브라우저 뒤로가기 감지
  useEffect(() => {
    if (!isOpen) return;
    const handlePopState = () => onClose();
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, onClose]);

  // initialIndex로 스크롤
  useEffect(() => {
    if (!isOpen || !scrollRef.current) return;
    setActiveIndex(initialIndex);
    const target = slideRefs.current[initialIndex];
    if (target) {
      target.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    }
  }, [isOpen, initialIndex]);

  // IntersectionObserver로 activeIndex 추적
  useEffect(() => {
    if (!isOpen || !scrollRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const idx = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { root: scrollRef.current, threshold: 0.5 },
    );

    slideRefs.current.forEach((el) => {
      if (el) observerRef.current!.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [isOpen, poems.length]);

  // 힌트 자동 사라짐
  useEffect(() => {
    if (!isOpen) return;
    setShowHint(true);
    const timer = setTimeout(() => setShowHint(false), 2600);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleDotClick = (idx: number) => {
    const target = slideRefs.current[idx];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // 긴 시 판별 (내용 줄 수 기준)
  const isLongPoem = (poem: Poem) => poem.content.split('\n').length > 20;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label={`${seriesName || '시집'} — 읽기 모드`}
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
            '--mood-accent': accent,
          } as React.CSSProperties}
        >
          <LyricsEffects key={mood} mood={mood} isActive={isOpen} />

          {/* 헤더 */}
          <div className={styles.header}>
            <button
              ref={closeBtnRef}
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="닫기"
            >
              ✕
            </button>
            {seriesName && <span className={styles.seriesName}>{seriesName}</span>}
            <span className={styles.position}>{activeIndex + 1}/{poems.length}</span>
          </div>

          {/* 도트 인디케이터 */}
          {poems.length <= 30 && (
            <div className={styles.dots}>
              {poems.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
                  onClick={() => handleDotClick(i)}
                  aria-label={`${i + 1}번째 시로 이동`}
                />
              ))}
            </div>
          )}

          {/* 스크롤 스냅 컨테이너 */}
          <div ref={scrollRef} className={styles.scrollContainer}>
            {poems.map((poem, i) => {
              const stanzas = poem.content.split(/\n\s*\n/).filter(Boolean);
              const long = isLongPoem(poem);

              return (
                <div
                  key={poem.id}
                  ref={(el) => { slideRefs.current[i] = el; }}
                  data-index={i}
                  className={`${styles.slide} ${long ? styles.slideLong : ''}`}
                >
                  <div className={styles.slideInner}>
                    <div className={styles.poemCategory}>{poem.category}</div>
                    <h2 className={styles.poemTitle}>{poem.title}</h2>
                    {poem.written_date && (
                      <p className={styles.poemDate}>{poem.written_date}</p>
                    )}
                    <div className={styles.poemContent}>
                      {stanzas.map((stanza, si) => (
                        <div key={si} className={styles.stanza}>{stanza}</div>
                      ))}
                    </div>
                    {poem.tags && poem.tags.length > 0 && (
                      <div className={styles.poemTags}>
                        {poem.tags.map((tag) => (
                          <span key={tag} className={styles.poemTag}>#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 스와이프 힌트 */}
          {showHint && (
            <div className={styles.hint}>
              <span className={styles.hintArrow}>↕</span>
              위아래로 스와이프하여 넘기기
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
