import { useEffect, useRef, useCallback } from 'react';

/** YT API 스크립트 로드 상태 */
let apiLoading = false;
let apiReady = false;
const readyCallbacks: (() => void)[] = [];

function loadYTApi(): Promise<void> {
  if (apiReady && window.YT) return Promise.resolve();

  return new Promise((resolve) => {
    readyCallbacks.push(resolve);

    if (apiLoading) return; // 이미 로딩 중이면 콜백만 등록
    apiLoading = true;

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      apiReady = true;
      apiLoading = false;
      prev?.();
      readyCallbacks.forEach((cb) => cb());
      readyCallbacks.length = 0;
    };

    // 이미 로드된 스크립트가 있는지 확인
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      if (window.YT && window.YT.Player) {
        apiReady = true;
        apiLoading = false;
        readyCallbacks.forEach((cb) => cb());
        readyCallbacks.length = 0;
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    document.head.appendChild(script);
  });
}

interface UseYouTubePlayerOptions {
  containerId: string;
  videoId: string | null;
  autoplay: boolean;
  enabled: boolean;
  onEnd?: () => void;
  onPlay?: () => void;
}

export function useYouTubePlayer({
  containerId,
  videoId,
  autoplay,
  enabled,
  onEnd,
  onPlay,
}: UseYouTubePlayerOptions) {
  const playerRef = useRef<YTPlayer | null>(null);
  const onEndRef = useRef(onEnd);
  const onPlayRef = useRef(onPlay);
  onEndRef.current = onEnd;
  onPlayRef.current = onPlay;

  const destroyPlayer = useCallback(() => {
    try {
      playerRef.current?.destroy();
    } catch {
      // ignore
    }
    playerRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled || !videoId) {
      destroyPlayer();
      return;
    }

    let cancelled = false;

    loadYTApi().then(() => {
      if (cancelled || !window.YT) return;

      // 이전 플레이어 정리
      destroyPlayer();

      // 타겟 요소 확인
      const target = document.getElementById(containerId);
      if (!target) return;

      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
        },
        events: {
          onStateChange: (event: YTPlayerEvent) => {
            if (event.data === 0) {
              // ENDED
              onEndRef.current?.();
            }
            if (event.data === 1) {
              // PLAYING
              onPlayRef.current?.();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      destroyPlayer();
    };
  }, [enabled, videoId, containerId, autoplay, destroyPlayer]);

  return { destroyPlayer };
}
