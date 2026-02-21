import { useEffect, useRef, useCallback } from 'react';
import type { MoodKey } from '../../lib/mood';
import { MOOD_PARTICLE_COLORS } from '../../lib/mood';
import { DRAW_FNS, initParticles, PARTICLE_COUNT, rand } from './LyricsEffects';

/* ============================================================
   PoemEffects — 시 상세 페이지용 은은한 Canvas 효과
   LyricsEffects의 draw 함수를 재활용하되 canvas opacity 0.3으로
   밝은 배경 위에서 가독성을 해치지 않는 수준
   ============================================================ */

// Suppress unused import warnings — re-exported helpers needed at module scope
void PARTICLE_COUNT;
void rand;

interface Props {
  mood: MoodKey;
}

export default function PoemEffects({ mood }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Float64Array | null>(null);
  const prevMoodRef = useRef<MoodKey | null>(null);

  const setup = useCallback((canvas: HTMLCanvasElement) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    particlesRef.current = initParticles(rect.width, rect.height);
    prevMoodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => setup(canvas);
    resize();
    window.addEventListener('resize', resize);

    if (prevMoodRef.current !== mood) {
      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        particlesRef.current = initParticles(rect.width, rect.height);
      }
      prevMoodRef.current = mood;
    }

    const colors = MOOD_PARTICLE_COLORS[mood];
    const drawFn = DRAW_FNS[mood] ?? DRAW_FNS.default;

    const loop = () => {
      const parent = canvas.parentElement;
      if (!parent) { rafRef.current = requestAnimationFrame(loop); return; }
      const rect = parent.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const t = performance.now();
      const particles = particlesRef.current;
      if (!particles) { rafRef.current = requestAnimationFrame(loop); return; }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      drawFn(ctx, w, h, t, particles, colors);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [mood, setup]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
        opacity: 0.3,
      }}
    />
  );
}
