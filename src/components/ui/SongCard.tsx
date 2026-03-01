import { useState, useEffect, useRef, useId } from 'react';
import { motion } from 'framer-motion';
import type { Song } from '../../types/song';
import { usePlayback } from '../../contexts/PlaybackContext';
import { useYouTubePlayer } from '../../hooks/useYouTubePlayer';
import AddToPlaylist from './AddToPlaylist';
import ShareButton from './ShareButton';
import LikeButton from './LikeButton';
import { useLikes, useFavoritesCount } from '../../hooks/useLikes';
import { useIncrementView } from '../../hooks/useViewCount';
import { useAuth } from '../../contexts/AuthContext';
import { getSunoEmbedUrl } from '../../lib/suno';
import { cleanLyrics } from '../../lib/cleanLyrics';
import styles from './SongCard.module.css';

interface Props {
  song: Song;
  index?: number;
  /** 이 카드가 속한 재생목록 — 곡 재생 시 자동으로 PlaybackContext에 세팅 */
  contextPlaylist?: Song[];
}

export default function SongCard({ song, index = 0, contextPlaylist }: Props) {
  const {
    currentId, play, onSongEnd,
    playlist, currentIndex, hasNext, hasPrev, next, prev,
    setPlaylist, autoPlayIntent, openLyricsPlayer,
  } = usePlayback();

  const [ytPlaying, setYtPlaying] = useState(false);
  const [sunoPlaying, setSunoPlaying] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const hasYoutube = !!song.youtube_id;
  const hasSuno = !!song.suno_url;
  const { user } = useAuth();
  const { count: likeCount } = useLikes('song', song.id, user?.id);
  const favCount = useFavoritesCount(song.id);
  const incrementView = useIncrementView('hohai_songs');
  const hasLyrics = !!song.lyrics;
  const hasTags = song.tags && song.tags.length > 0;
  const isInPlaylist = playlist !== null;
  const isCurrentInPlaylist = isInPlaylist && currentId === song.id && currentIndex >= 0;

  // 유니크 컨테이너 ID
  const uniqueId = useId();
  const ytContainerId = `yt-${uniqueId.replace(/:/g, '')}`;

  // 다른 곡이 재생되면 이 카드의 플레이어를 정지
  useEffect(() => {
    if (currentId && currentId !== song.id) {
      setYtPlaying(false);
      setSunoPlaying(false);
    }
  }, [currentId, song.id]);

  // autoPlayIntent: 자동 전환 시 해당 카드로 스크롤 + 재생
  useEffect(() => {
    if (currentId === song.id && autoPlayIntent) {
      if (hasYoutube) {
        setYtPlaying(true);
      } else if (hasSuno) {
        setSunoPlaying(true);
      }
      // 카드가 보이도록 스크롤
      requestAnimationFrame(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }, [currentId, song.id, autoPlayIntent, hasYoutube, hasSuno]);

  // YouTube Player 훅
  useYouTubePlayer({
    containerId: ytContainerId,
    videoId: song.youtube_id || null,
    autoplay: true,
    enabled: ytPlaying && hasYoutube,
    onEnd: () => {
      onSongEnd();
    },
  });

  /** contextPlaylist가 있으면 PlaybackContext에 재생목록 세팅 후 재생 */
  const playWithContext = (songId: string) => {
    if (contextPlaylist && contextPlaylist.length > 0) {
      setPlaylist(contextPlaylist);
    }
    play(songId);
  };

  const handleYtPlay = () => {
    incrementView(song.id);
    playWithContext(song.id);
    setYtPlaying(true);
  };

  const handleSunoPlay = () => {
    incrementView(song.id);
    playWithContext(song.id);
    setSunoPlaying(true);
  };

  const handleLyricsPlayerOpen = () => {
    playWithContext(song.id);
    openLyricsPlayer();
  };

  return (
    <motion.article
      ref={cardRef}
      className={styles.card}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* 메인 미디어: YouTube 우선, 없으면 음원 */}
      <div className={styles.thumbnail}>
        {hasYoutube ? (
          ytPlaying ? (
            <div id={ytContainerId} className={styles.ytContainer} />
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
                onClick={handleYtPlay}
                aria-label={`${song.title} 재생`}
                title="클릭하면 노래가 재생됩니다"
              />
              {hasSuno && <span className={styles.sourceBadge}>YouTube</span>}
            </>
          )
        ) : hasSuno ? (
          sunoPlaying ? (
            <iframe
              className={styles.sunoIframe}
              src={getSunoEmbedUrl(song.suno_url!)}
              title={song.title}
              allow="autoplay"
              frameBorder="0"
            />
          ) : (
            <div className={styles.sunoPlaceholder} onClick={handleSunoPlay} title="클릭하면 노래가 재생됩니다">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              <span className={styles.sunoLabel}>음원 재생</span>
              <div className={styles.sunoPlayIcon} />
            </div>
          )
        ) : null}
      </div>

      {/* YouTube + 음원 둘 다 있을 때: 음원 임베드 영역 */}
      {hasYoutube && hasSuno && (
        <div className={styles.sunoSection}>
          {sunoPlaying ? (
            <iframe
              className={styles.sunoIframe}
              src={getSunoEmbedUrl(song.suno_url!)}
              title={song.title}
              allow="autoplay"
              frameBorder="0"
            />
          ) : (
            <button className={styles.sunoBtn} onClick={handleSunoPlay} title="음원 버전을 재생합니다">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              음원 듣기
            </button>
          )}
        </div>
      )}

      {/* 플레이리스트 내비게이션 */}
      {isCurrentInPlaylist && playlist && (
        <div className={styles.playlistNav}>
          <button
            className={styles.navBtn}
            onClick={prev}
            disabled={!hasPrev}
            aria-label="이전 곡"
            title="이전 곡으로 이동합니다"
          >
            ⏮
          </button>
          <span className={styles.navPosition}>
            {currentIndex + 1} / {playlist.length}
          </span>
          <button
            className={styles.navBtn}
            onClick={next}
            disabled={!hasNext}
            aria-label="다음 곡"
            title="다음 곡으로 이동합니다"
          >
            ⏭
          </button>
        </div>
      )}

      <div className={styles.info}>
        <h3 className={styles.title}>{song.title}</h3>

        {/* 좋아요·즐겨찾기 카운트 + 액션 버튼 */}
        <div className={styles.statsRow}>
            <div className={styles.counts}>
              <span className={styles.countItem}>▶ {song.view_count ?? 0}</span>
              {likeCount > 0 && <span className={styles.countItem}>♥ {likeCount}</span>}
              {favCount > 0 && <span className={styles.countItem}>★ {favCount}</span>}
            </div>
          <div className={styles.actions}>
            <AddToPlaylist songId={song.id} />
            <LikeButton targetType="song" targetId={song.id} />
            <ShareButton title={song.title} text={song.description || song.title} />
          </div>
        </div>

        {/* 시인 소개글 */}
        {song.description && (
          <p className={styles.description}>{song.description}</p>
        )}

        {hasTags && (
          <div className={styles.tags}>
            {song.tags.map((tag) => (
              <span key={tag} className={styles.tag}>#{tag}</span>
            ))}
          </div>
        )}

        {hasLyrics && (
          <>
            <div className={styles.lyricsActions}>
              <button
                className={styles.lyricsToggle}
                onClick={() => setLyricsOpen((v) => !v)}
                title="가사를 펼치거나 접습니다"
              >
                {lyricsOpen ? '가사 접기 ▲' : '가사 보기 ▼'}
              </button>
              <button
                className={styles.lyricsPlayerBtn}
                onClick={handleLyricsPlayerOpen}
                title="전체 화면으로 가사를 보면서 들을 수 있습니다"
              >
                가사 플레이어
              </button>
            </div>
            {lyricsOpen && (
              <div className={styles.lyrics}>{cleanLyrics(song.lyrics!)}</div>
            )}
          </>
        )}
      </div>
    </motion.article>
  );
}
