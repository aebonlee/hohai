import { useEffect, useRef, useCallback } from 'react';
import type { MoodKey } from '../../lib/mood';
import { MOOD_PARTICLE_COLORS } from '../../lib/mood';

/* ============================================================
   LyricsEffects — Canvas‑based ambient effects per mood
   10 moods: 사랑/그리움/작별/추억/인생/가족/자연/세상/의지/default
   ============================================================ */

interface Props {
  mood: MoodKey;
  isActive: boolean;
}

const rand = (a: number, b: number) => Math.random() * (b - a) + a;
const PARTICLE_COUNT = 40;

// ---- Particle initializers ----
function initParticles(w: number, h: number): Float64Array {
  const p = new Float64Array(PARTICLE_COUNT * 4);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    p[i * 4] = rand(0, w);
    p[i * 4 + 1] = rand(0, h);
    p[i * 4 + 2] = rand(1, 3.5);   // size / phase A
    p[i * 4 + 3] = rand(0, Math.PI * 2); // speed / phase B
  }
  return p;
}

// ==== Draw functions per mood ====

// 사랑: 떠다니는 하트 + 꽃잎
function drawLove(
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number,
  particles: Float64Array, colors: { primary: [number, number, number]; secondary: [number, number, number] },
) {
  ctx.clearRect(0, 0, w, h);
  const [pr, pg, pb] = colors.primary;
  const [sr, sg, sb] = colors.secondary;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const idx = i * 4;
    let px = particles[idx];
    let py = particles[idx + 1];
    const sz = particles[idx + 2];
    const phase = particles[idx + 3];

    py -= 0.2 + sz * 0.08;
    px += Math.sin(t * 0.0006 + phase) * 0.3;
    if (py < -20) { py = h + 20; px = rand(0, w); }
    particles[idx] = px;
    particles[idx + 1] = py;

    const alpha = 0.15 + 0.1 * Math.sin(t * 0.002 + phase);

    if (i % 3 === 0) {
      // Heart shape via bezier curves
      const s = sz * 1.8;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(Math.sin(t * 0.001 + phase) * 0.2);
      ctx.beginPath();
      ctx.moveTo(0, s * 0.4);
      ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.5, -s * 1.2, 0, -s * 0.5);
      ctx.bezierCurveTo(s * 0.5, -s * 1.2, s, -s * 0.3, 0, s * 0.4);
      ctx.fillStyle = `rgba(${pr},${pg},${pb},${alpha})`;
      ctx.fill();
      ctx.restore();
    } else {
      // Petal (rotated ellipse)
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(t * 0.001 + phase * 2);
      ctx.beginPath();
      ctx.ellipse(0, 0, sz * 1.5, sz * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${sr},${sg},${sb},${alpha * 0.7})`;
      ctx.fill();
      ctx.restore();
    }
  }
}

// 그리움: 느린 비 + 수면 물결
function drawLonging(
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number,
  particles: Float64Array, colors: { primary: [number, number, number]; secondary: [number, number, number] },
) {
  ctx.clearRect(0, 0, w, h);
  const [pr, pg, pb] = colors.primary;
  const [sr, sg, sb] = colors.secondary;

  // Rain drops (slow, gentle)
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const idx = i * 4;
    let px = particles[idx];
    let py = particles[idx + 1];
    const sz = particles[idx + 2];
    const spd = 0.8 + sz * 0.4;

    py += spd;
    px -= spd * 0.05;
    if (py > h + 10) { py = rand(-60, -10); px = rand(0, w); }
    particles[idx] = px;
    particles[idx + 1] = py;

    const alpha = 0.1 + (sz / 3.5) * 0.12;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + 0.5, py - sz * 5);
    ctx.strokeStyle = `rgba(${pr},${pg},${pb},${alpha})`;
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  // Water surface ripples (bottom 20%)
  const waveY = h * 0.82;
  for (let i = 0; i < 6; i++) {
    const y = waveY + i * 12;
    const amp = 2 + i * 0.5;
    const freq = 0.005 + i * 0.001;
    const speed = t * (0.0004 + i * 0.00005);
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 8) {
      ctx.lineTo(x, y + Math.sin(x * freq + speed) * amp);
    }
    const a = 0.04 + (1 - i / 6) * 0.04;
    ctx.strokeStyle = `rgba(${sr},${sg},${sb},${a})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
}

// 작별: 흩날리는 꽃잎 (오른쪽으로 날아감, fade out)
function drawFarewell(
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number,
  particles: Float64Array, colors: { primary: [number, number, number]; secondary: [number, number, number] },
) {
  ctx.clearRect(0, 0, w, h);
  const [pr, pg, pb] = colors.primary;
  const [sr, sg, sb] = colors.secondary;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const idx = i * 4;
    let px = particles[idx];
    let py = particles[idx + 1];
    const sz = particles[idx + 2];
    const phase = particles[idx + 3];

    px += 0.4 + sz * 0.15;
    py += Math.sin(t * 0.001 + phase) * 0.3 + 0.1;
    if (px > w + 30) { px = -30; py = rand(0, h); }
    particles[idx] = px;
    particles[idx + 1] = py;

    // Fade out as petal moves right
    const progress = px / w;
    const alpha = (0.2 + 0.1 * Math.sin(t * 0.002 + phase)) * (1 - progress * 0.6);
    const c = i % 2 === 0 ? [pr, pg, pb] : [sr, sg, sb];

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(t * 0.0015 + phase * 3);
    ctx.beginPath();
    ctx.ellipse(0, 0, sz * 2, sz * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
    ctx.fill();
    ctx.restore();
  }
}

// 추억: 따뜻한 보케 빛 (radialGradient 글로우)
function drawMemory(
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number,
  particles: Float64Array, colors: { primary: [number, number, number]; secondary: [number, number, number] },
) {
  ctx.clearRect(0, 0, w, h);
  const [pr, pg, pb] = colors.primary;
  const [sr, sg, sb] = colors.secondary;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const idx = i * 4;
    let px = particles[idx];
    let py = particles[idx + 1];
    const sz = particles[idx + 2];
    const phase = particles[idx + 3];

    px += Math.sin(t * 0.0003 + phase) * 0.2;
    py += Math.cos(t * 0.00025 + phase * 1.3) * 0.15;
    if (px > w + 30) px -= w + 60;
    if (px < -30) px += w + 60;
    if (py > h + 30) py -= h + 60;
    if (py < -30) py += h + 60;
    particles[idx] = px;
    particles[idx + 1] = py;

    const glow = 0.4 + 0.6 * Math.sin(t * 0.0015 + phase * 2.5);
    const r = sz * 6;
    const c = i % 2 === 0 ? [pr, pg, pb] : [sr, sg, sb];

    const grad = ctx.createRadialGradient(px, py, 0, px, py, r);
    grad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${glow * 0.2})`);
    grad.addColorStop(0.5, `rgba(${c[0]},${c[1]},${c[2]},${glow * 0.06})`);
    grad.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 인생: 동심원 물결 파장 (2~3개 중심에서 퍼짐)
function drawLife(
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number,
  _particles: Float64Array, colors: { primary: [number, number, number]; secondary: [number, number, number] },
) {
  ctx.clearRect(0, 0, w, h);
  const [pr, pg, pb] = colors.primary;
  const [sr, sg, sb] = colors.secondary;

  const centers = [
    { x: w * 0.3, y: h * 0.4 },
    { x: w * 0.7, y: h * 0.6 },
    { x: w * 0.5, y: h * 0.25 },
  ];

  for (let ci = 0; ci < centers.length; ci++) {
    const cx = centers[ci].x + Math.sin(t * 0.0002 + ci * 2) * 20;
    const cy = centers[ci].y + Math.cos(t * 0.00015 + ci * 3) * 15;
    const c = ci % 2 === 0 ? [pr, pg, pb] : [sr, sg, sb];
    const maxR = Math.max(w, h) * 0.4;

    for (let r = 0; r < 8; r++) {
      const radius = ((t * 0.02 + r * maxR / 8 + ci * 80) % maxR);
      const alpha = 0.08 * (1 - radius / maxR);
      if (alpha <= 0) continue;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

// 가족: 따뜻한 반딧불 (radialGradient 글로우 헤일로)
function drawFamily(
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number,
  particles: Float64Array, colors: { primary: [number, number, number]; secondary: [number, number, number] },
) {
  ctx.clearRect(0, 0, w, h);
  const [pr, pg, pb] = colors.primary;
  const [sr, sg, sb] = colors.secondary;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const idx = i * 4;
    let px = particles[idx];
    let py = particles[idx + 1];
    const sz = particles[idx + 2];
    const phase = particles[idx + 3];

    px += Math.sin(t * 0.0007 + phase) * 0.35;
    py += Math.cos(t * 0.0005 + phase * 1.4) * 0.25;
    if (px > w + 20) px -= w + 40;
    if (px < -20) px += w + 40;
    if (py > h + 20) py -= h + 40;
    if (py < -20) py += h + 40;
    particles[idx] = px;
    particles[idx + 1] = py;

    const glow = 0.3 + 0.7 * Math.pow(Math.max(0, Math.sin(t * 0.002 + phase * 3)), 2);
    const c = i % 3 === 0 ? [sr, sg, sb] : [pr, pg, pb];

    // Outer halo
    const haloR = sz * 8;
    const haloGrad = ctx.createRadialGradient(px, py, 0, px, py, haloR);
    haloGrad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${glow * 0.15})`);
    haloGrad.addColorStop(0.5, `rgba(${c[0]},${c[1]},${c[2]},${glow * 0.04})`);
    haloGrad.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(px, py, haloR, 0, Math.PI * 2);
    ctx.fill();

    // Bright core
    ctx.beginPath();
    ctx.arc(px, py, sz * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${glow * 0.6})`;
    ctx.fill();
  }
}

// 자연: 낙엽 + 반짝이 점
function drawNature(
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number,
  particles: Float64Array, colors: { primary: [number, number, number]; secondary: [number, number, number] },
) {
  ctx.clearRect(0, 0, w, h);
  const [pr, pg, pb] = colors.primary;
  const [sr, sg, sb] = colors.secondary;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const idx = i * 4;
    let px = particles[idx];
    let py = particles[idx + 1];
    const sz = particles[idx + 2];
    const phase = particles[idx + 3];

    if (i < 25) {
      // Falling leaves
      py += 0.25 + Math.sin(t * 0.001 + phase) * 0.12;
      px += Math.sin(t * 0.0005 + phase * 2) * 0.4;
      if (py > h + 20) { py = -20; px = rand(0, w); }
      particles[idx] = px;
      particles[idx + 1] = py;

      const rotation = t * 0.002 + phase * 5;
      const alpha = 0.2 + 0.1 * Math.sin(t * 0.001 + phase);
      const c = i % 2 === 0 ? [pr, pg, pb] : [sr, sg, sb];

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.ellipse(0, 0, sz * 2, sz * 0.7, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
      ctx.fill();
      ctx.restore();
    } else {
      // Twinkling sparkle points
      px += Math.sin(t * 0.0004 + phase) * 0.1;
      py += Math.cos(t * 0.0003 + phase * 1.5) * 0.1;
      particles[idx] = px;
      particles[idx + 1] = py;

      const twinkle = Math.pow(Math.max(0, Math.sin(t * 0.004 + phase * 5)), 4);
      ctx.beginPath();
      ctx.arc(px, py, sz * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${sr},${sg},${sb},${twinkle * 0.6})`;
      ctx.fill();
    }
  }
}

// 세상: 기하학적 도형 (삼각형/사각형/육각형)
function drawWorld(
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number,
  particles: Float64Array, colors: { primary: [number, number, number]; secondary: [number, number, number] },
) {
  ctx.clearRect(0, 0, w, h);
  const [pr, pg, pb] = colors.primary;
  const [sr, sg, sb] = colors.secondary;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const idx = i * 4;
    let px = particles[idx];
    let py = particles[idx + 1];
    const sz = particles[idx + 2];
    const phase = particles[idx + 3];

    px += Math.sin(t * 0.0003 + phase) * 0.15;
    py += Math.cos(t * 0.00025 + phase * 1.2) * 0.12;
    if (px > w + 30) px -= w + 60;
    if (px < -30) px += w + 60;
    if (py > h + 30) py -= h + 60;
    if (py < -30) py += h + 60;
    particles[idx] = px;
    particles[idx + 1] = py;

    const alpha = 0.08 + 0.06 * Math.sin(t * 0.0015 + phase * 2);
    const rotation = t * 0.0005 + phase;
    const c = i % 2 === 0 ? [pr, pg, pb] : [sr, sg, sb];
    const sides = i % 3 === 0 ? 3 : i % 3 === 1 ? 4 : 6;
    const r = sz * 3;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rotation);
    ctx.beginPath();
    for (let s = 0; s <= sides; s++) {
      const angle = (s / sides) * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();
  }
}

// 의지: 상승하는 불꽃/불씨 (radialGradient 엠버)
function drawWill(
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number,
  particles: Float64Array, colors: { primary: [number, number, number]; secondary: [number, number, number] },
) {
  ctx.clearRect(0, 0, w, h);
  const [pr, pg, pb] = colors.primary;
  const [sr, sg, sb] = colors.secondary;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const idx = i * 4;
    let px = particles[idx];
    let py = particles[idx + 1];
    const sz = particles[idx + 2];
    const phase = particles[idx + 3];

    py -= 0.6 + sz * 0.3;
    px += Math.sin(t * 0.001 + phase) * 0.4;
    if (py < -20) { py = h + rand(0, 40); px = rand(w * 0.2, w * 0.8); }
    particles[idx] = px;
    particles[idx + 1] = py;

    const progress = 1 - py / h;
    const glow = (0.3 + 0.4 * Math.sin(t * 0.003 + phase * 2)) * (1 - progress * 0.5);
    const c = i % 2 === 0 ? [pr, pg, pb] : [sr, sg, sb];
    const r = sz * 4;

    const grad = ctx.createRadialGradient(px, py, 0, px, py, r);
    grad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${glow * 0.4})`);
    grad.addColorStop(0.4, `rgba(${c[0]},${c[1]},${c[2]},${glow * 0.15})`);
    grad.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();

    // Bright core
    ctx.beginPath();
    ctx.arc(px, py, sz * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,240,200,${glow * 0.5})`;
    ctx.fill();
  }
}

// default: 부유하는 빛 입자 (HeroEffects lighthouse 패턴)
function drawDefault(
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number,
  particles: Float64Array, colors: { primary: [number, number, number]; secondary: [number, number, number] },
) {
  ctx.clearRect(0, 0, w, h);
  const [pr, pg, pb] = colors.primary;
  const [sr, sg, sb] = colors.secondary;

  // Water shimmer (bottom 40%)
  const waterY = h * 0.6;
  for (let i = 0; i < 12; i++) {
    const y = waterY + (h - waterY) * (i / 12);
    const amplitude = 1.5 + i * 0.3;
    const freq = 0.003 + i * 0.0003;
    const speed = t * (0.0004 + i * 0.00004);
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 8) {
      ctx.lineTo(x, y + Math.sin(x * freq + speed) * amplitude);
    }
    const a = 0.02 + (i / 12) * 0.03;
    ctx.strokeStyle = `rgba(${pr},${pg},${pb},${a})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  // Floating warm light motes
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const idx = i * 4;
    let px = particles[idx];
    let py = particles[idx + 1];
    const sz = particles[idx + 2];
    const spd = particles[idx + 3];

    py -= (0.1 + Math.abs(Math.sin(spd)) * 0.3);
    px += Math.sin(t * 0.001 + i) * 0.15;
    if (py < -10) { py = h + 10; px = rand(0, w); }
    particles[idx] = px;
    particles[idx + 1] = py;

    const flicker = 0.5 + 0.5 * Math.sin(t * 0.003 + i * 2.1);
    const alpha = (0.12 + flicker * 0.15) * (sz / 3);
    const c = i % 3 === 0 ? [sr, sg, sb] : [pr, pg, pb];
    ctx.beginPath();
    ctx.arc(px, py, sz, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
    ctx.fill();
  }
}

// ==== Draw dispatcher ====
const DRAW_FNS: Record<MoodKey, (
  ctx: CanvasRenderingContext2D, w: number, h: number, t: number,
  p: Float64Array, c: { primary: [number, number, number]; secondary: [number, number, number] },
) => void> = {
  사랑: drawLove,
  그리움: drawLonging,
  작별: drawFarewell,
  추억: drawMemory,
  인생: drawLife,
  가족: drawFamily,
  자연: drawNature,
  세상: drawWorld,
  의지: drawWill,
  default: drawDefault,
};

// ============================================================
export default function LyricsEffects({ mood, isActive }: Props) {
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

    // Re-init particles when mood changes
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
      if (!isActive) { rafRef.current = requestAnimationFrame(loop); return; }

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
  }, [mood, isActive, setup]);

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
      }}
    />
  );
}
