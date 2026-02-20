import { useEffect, useRef, useCallback } from 'react';

/* ============================================================
   HeroEffects — Canvas‑based ambient effects per hero slide
   ============================================================ */

interface Props {
  activeSlide: number;
  isActive: boolean;
}

// ---- helpers ----
const rand = (a: number, b: number) => Math.random() * (b - a) + a;

// ---- 1. Lighthouse — water shimmer + floating light motes ----
function drawLighthouse(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  particles: Float64Array,
  PARTICLE_COUNT: number,
) {
  ctx.clearRect(0, 0, w, h);

  // Water surface shimmer lines (bottom 40%)
  const waterY = h * 0.6;
  for (let i = 0; i < 18; i++) {
    const y = waterY + (h - waterY) * (i / 18);
    const amplitude = 2 + i * 0.4;
    const freq = 0.003 + i * 0.0003;
    const speed = t * (0.0004 + i * 0.00005);
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 6) {
      const yOff = Math.sin(x * freq + speed) * amplitude + Math.sin(x * freq * 1.7 + speed * 0.7) * amplitude * 0.5;
      ctx.lineTo(x, y + yOff);
    }
    const alpha = 0.03 + (i / 18) * 0.04;
    ctx.strokeStyle = `rgba(200,220,255,${alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Floating warm light motes
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const idx = i * 4;
    let px = particles[idx];
    let py = particles[idx + 1];
    const sz = particles[idx + 2];
    const spd = particles[idx + 3];

    py -= spd * 0.6;
    px += Math.sin(t * 0.001 + i) * 0.15;
    if (py < -10) { py = h + 10; px = rand(0, w); }
    particles[idx] = px;
    particles[idx + 1] = py;

    const flicker = 0.5 + 0.5 * Math.sin(t * 0.003 + i * 2.1);
    const alpha = (0.15 + flicker * 0.2) * (sz / 3);
    ctx.beginPath();
    ctx.arc(px, py, sz, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,240,180,${alpha})`;
    ctx.fill();
  }
}

// ---- 2. Sunset — god‑rays + water sparkles + bird silhouettes ----
function drawSunset(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  particles: Float64Array,
  PARTICLE_COUNT: number,
) {
  ctx.clearRect(0, 0, w, h);

  // God‑rays from sun center
  const cx = w / 2, cy = h * 0.38;
  const rayCount = 12;
  for (let i = 0; i < rayCount; i++) {
    const angle = (Math.PI * 2 * i) / rayCount + t * 0.00008;
    const len = h * 0.7 + Math.sin(t * 0.001 + i) * 60;
    const spread = 0.04 + Math.sin(t * 0.0015 + i * 0.8) * 0.015;
    const alpha = 0.03 + 0.02 * Math.sin(t * 0.002 + i * 1.3);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle - spread) * len, cy + Math.sin(angle - spread) * len);
    ctx.lineTo(cx + Math.cos(angle + spread) * len, cy + Math.sin(angle + spread) * len);
    ctx.closePath();
    ctx.fillStyle = `rgba(255,200,100,${alpha})`;
    ctx.fill();
  }

  // Water sparkles (bottom 30%)
  const sparkleY = h * 0.7;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const idx = i * 4;
    let px = particles[idx];
    const baseY = particles[idx + 1];
    const sz = particles[idx + 2];
    const phase = particles[idx + 3];

    const sparkle = Math.pow(Math.max(0, Math.sin(t * 0.004 + phase)), 8);
    if (sparkle < 0.01) continue;

    const py = baseY + Math.sin(t * 0.001 + phase) * 3;
    px += Math.sin(t * 0.0005 + phase * 2) * 0.5;

    ctx.beginPath();
    ctx.arc(px, sparkleY + (py % (h - sparkleY)), sz * sparkle * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,230,160,${sparkle * 0.7})`;
    ctx.fill();

    // Cross highlight
    if (sparkle > 0.5) {
      ctx.strokeStyle = `rgba(255,240,200,${sparkle * 0.3})`;
      ctx.lineWidth = 0.5;
      const r = sz * sparkle * 5;
      ctx.beginPath();
      ctx.moveTo(px - r, sparkleY + (py % (h - sparkleY)));
      ctx.lineTo(px + r, sparkleY + (py % (h - sparkleY)));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px, sparkleY + (py % (h - sparkleY)) - r);
      ctx.lineTo(px, sparkleY + (py % (h - sparkleY)) + r);
      ctx.stroke();
    }
  }

  // Bird silhouettes (simple V shapes)
  const birdCount = 5;
  for (let i = 0; i < birdCount; i++) {
    const bx = ((t * 0.02 + i * w / birdCount * 1.3) % (w + 200)) - 100;
    const by = h * 0.12 + i * 25 + Math.sin(t * 0.002 + i * 3) * 15;
    const wingSpan = 8 + i * 2;
    const wingY = Math.sin(t * 0.008 + i * 4) * 3;

    ctx.beginPath();
    ctx.moveTo(bx - wingSpan, by + wingY);
    ctx.quadraticCurveTo(bx - wingSpan * 0.3, by - 3, bx, by);
    ctx.quadraticCurveTo(bx + wingSpan * 0.3, by - 3, bx + wingSpan, by + wingY);
    ctx.strokeStyle = `rgba(60,20,10,${0.2 + i * 0.04})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
}

// ---- 3. Forest — dark mystical: bright fireflies + falling leaves + mist + light shafts ----
function drawForest(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  particles: Float64Array,
  PARTICLE_COUNT: number,
) {
  ctx.clearRect(0, 0, w, h);

  // Volumetric light shafts from top-center (bright in dark scene)
  const shaftCount = 5;
  for (let i = 0; i < shaftCount; i++) {
    const sx = w * (0.3 + (i / shaftCount) * 0.4);
    const sway = Math.sin(t * 0.0003 + i * 1.8) * 25;
    const topW = 15 + i * 5;
    const botW = 80 + i * 20;
    const alpha = 0.04 + 0.03 * Math.sin(t * 0.0008 + i * 2.5);

    ctx.beginPath();
    ctx.moveTo(sx - topW / 2 + sway, 0);
    ctx.lineTo(sx + topW / 2 + sway, 0);
    ctx.lineTo(sx + botW / 2 + sway * 0.2, h * 0.9);
    ctx.lineTo(sx - botW / 2 + sway * 0.2, h * 0.9);
    ctx.closePath();

    const grad = ctx.createLinearGradient(sx, 0, sx, h * 0.9);
    grad.addColorStop(0, `rgba(180,220,240,${alpha * 1.8})`);
    grad.addColorStop(0.3, `rgba(180,210,230,${alpha})`);
    grad.addColorStop(0.7, `rgba(160,200,220,${alpha * 0.5})`);
    grad.addColorStop(1, 'rgba(160,200,220,0)');
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Floating dust in light beams
  for (let i = 0; i < 25; i++) {
    const dx = w * 0.3 + rand(0, w * 0.4);
    const dy = (t * 0.015 + i * h / 25) % h;
    const driftX = Math.sin(t * 0.001 + i * 2.7) * 20;
    const dustAlpha = 0.15 + 0.1 * Math.sin(t * 0.003 + i * 1.5);
    const dustSize = 1 + rand(0, 1.5);
    ctx.beginPath();
    ctx.arc(dx + driftX, dy, dustSize, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,220,240,${dustAlpha})`;
    ctx.fill();
  }

  // Layered mist (darker, more atmospheric)
  for (let layer = 0; layer < 4; layer++) {
    const baseY = h * (0.4 + layer * 0.12);
    const speed = 0.00015 * (layer + 1);
    const amplitude = 15 + layer * 8;
    const alpha = 0.07 - layer * 0.012;

    ctx.beginPath();
    ctx.moveTo(-50, baseY + 90);
    for (let x = -50; x <= w + 50; x += 6) {
      const y = baseY + Math.sin(x * 0.003 + t * speed) * amplitude +
                Math.sin(x * 0.008 + t * speed * 1.5) * amplitude * 0.4;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w + 50, baseY + 90);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, baseY - 30, 0, baseY + 90);
    grad.addColorStop(0, 'rgba(100,140,120,0)');
    grad.addColorStop(0.3, `rgba(100,140,120,${alpha})`);
    grad.addColorStop(0.7, `rgba(80,120,100,${alpha})`);
    grad.addColorStop(1, 'rgba(80,120,100,0)');
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Fireflies — first 45 particles (bright yellow-green with large glow halos)
  const fireflyCount = Math.min(45, PARTICLE_COUNT);
  for (let i = 0; i < fireflyCount; i++) {
    const idx = i * 4;
    let px = particles[idx];
    let py = particles[idx + 1];
    const sz = particles[idx + 2];
    const phase = particles[idx + 3];

    // Gentle organic drift
    px += Math.sin(t * 0.0008 + phase) * 0.4;
    py += Math.cos(t * 0.0006 + phase * 1.3) * 0.3;
    px += Math.sin(t * 0.0003 + phase * 2.5) * 0.15;
    if (px > w + 30) px = -30;
    if (px < -30) px = w + 30;
    if (py > h + 30) py = -30;
    if (py < -30) py = h + 30;
    particles[idx] = px;
    particles[idx + 1] = py;

    // Bioluminescent glow pattern — slow pulse with random phase
    const glow = 0.2 + 0.8 * Math.pow(Math.max(0, Math.sin(t * 0.002 + phase * 3.7)), 2.5);
    const r = sz * (0.7 + glow * 0.8);

    // Large outer halo
    const haloR = r * 10;
    const haloGrad = ctx.createRadialGradient(px, py, 0, px, py, haloR);
    haloGrad.addColorStop(0, `rgba(220,255,80,${glow * 0.2})`);
    haloGrad.addColorStop(0.3, `rgba(180,240,60,${glow * 0.08})`);
    haloGrad.addColorStop(0.6, `rgba(150,220,50,${glow * 0.02})`);
    haloGrad.addColorStop(1, 'rgba(150,220,50,0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(px, py, haloR, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow
    const innerGrad = ctx.createRadialGradient(px, py, 0, px, py, r * 4);
    innerGrad.addColorStop(0, `rgba(255,255,180,${glow * 0.6})`);
    innerGrad.addColorStop(0.4, `rgba(220,250,100,${glow * 0.3})`);
    innerGrad.addColorStop(1, 'rgba(200,240,80,0)');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(px, py, r * 4, 0, Math.PI * 2);
    ctx.fill();

    // Bright core
    ctx.beginPath();
    ctx.arc(px, py, r * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,220,${glow * 0.9})`;
    ctx.fill();
  }

  // Falling leaves — remaining particles
  for (let i = fireflyCount; i < PARTICLE_COUNT; i++) {
    const idx = i * 4;
    let px = particles[idx];
    let py = particles[idx + 1];
    const sz = particles[idx + 2]; // used as leaf size
    const phase = particles[idx + 3];

    // Fall + drift
    py += 0.3 + Math.sin(t * 0.001 + phase) * 0.15;
    px += Math.sin(t * 0.0005 + phase * 2) * 0.5 + 0.1;
    if (py > h + 20) { py = -20; px = rand(0, w); }
    particles[idx] = px;
    particles[idx + 1] = py;

    const rotation = t * 0.002 + phase * 5;
    const leafAlpha = 0.25 + 0.15 * Math.sin(t * 0.001 + phase);

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rotation);
    // Simple leaf shape
    ctx.beginPath();
    ctx.ellipse(0, 0, sz * 2, sz * 0.8, 0, 0, Math.PI * 2);
    const leafColor = i % 3 === 0 ? `rgba(80,120,60,${leafAlpha})` :
                      i % 3 === 1 ? `rgba(100,140,50,${leafAlpha})` :
                                    `rgba(60,100,70,${leafAlpha})`;
    ctx.fillStyle = leafColor;
    ctx.fill();
    ctx.restore();
  }
}

// ---- 4. City Rain — realistic rain streaks + splashes + lightning + neon glow ----
function drawCity(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  particles: Float64Array,
  PARTICLE_COUNT: number,
  extra: { lightning: { active: boolean; alpha: number; nextAt: number } },
) {
  ctx.clearRect(0, 0, w, h);

  // Neon glow reflections on ground
  const neonColors = [
    'rgba(200,128,255,', // purple
    'rgba(255,96,160,',  // pink
    'rgba(128,192,255,', // blue
    'rgba(100,255,200,', // cyan
  ];
  for (let i = 0; i < 8; i++) {
    const nx = w * (0.1 + (i / 8) * 0.8);
    const ny = h * (0.85 + Math.sin(i * 2) * 0.05);
    const pulse = 0.4 + 0.3 * Math.sin(t * 0.002 + i * 1.7);
    const color = neonColors[i % neonColors.length];

    const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, 60 + pulse * 30);
    grad.addColorStop(0, `${color}${(0.06 * pulse).toFixed(3)})`);
    grad.addColorStop(1, `${color}0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(nx, ny, 80 + pulse * 30, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rain drops
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const idx = i * 4;
    let px = particles[idx];
    let py = particles[idx + 1];
    const len = particles[idx + 2];
    const spd = particles[idx + 3];

    py += spd;
    px -= spd * 0.1; // slight wind
    if (py > h + 10) {
      py = rand(-100, -10);
      px = rand(-20, w + 20);
    }
    particles[idx] = px;
    particles[idx + 1] = py;

    const alpha = 0.15 + (spd / 18) * 0.15;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + spd * 0.1, py - len);
    ctx.strokeStyle = `rgba(180,190,255,${alpha})`;
    ctx.lineWidth = 0.6 + (spd / 18) * 0.4;
    ctx.stroke();

    // Splash at bottom
    if (py > h * 0.88 && py < h * 0.88 + spd) {
      const splashR = 1 + rand(0, 2);
      ctx.beginPath();
      ctx.arc(px, h * 0.88, splashR, Math.PI, 0);
      ctx.strokeStyle = `rgba(180,190,255,${alpha * 0.5})`;
      ctx.lineWidth = 0.4;
      ctx.stroke();
    }
  }

  // Lightning
  if (t > extra.lightning.nextAt && !extra.lightning.active) {
    extra.lightning.active = true;
    extra.lightning.alpha = 0.25 + rand(0, 0.15);
    extra.lightning.nextAt = t + rand(6000, 15000);
  }
  if (extra.lightning.active) {
    extra.lightning.alpha *= 0.88;
    if (extra.lightning.alpha < 0.01) {
      extra.lightning.active = false;
    } else {
      ctx.fillStyle = `rgba(200,200,255,${extra.lightning.alpha})`;
      ctx.fillRect(0, 0, w, h);

      // Lightning bolt
      if (extra.lightning.alpha > 0.1) {
        ctx.strokeStyle = `rgba(220,220,255,${extra.lightning.alpha * 2})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        let lx = w * rand(0.3, 0.7);
        let ly = 0;
        ctx.moveTo(lx, ly);
        const segments = 8 + Math.floor(rand(0, 5));
        for (let s = 0; s < segments; s++) {
          lx += rand(-30, 30);
          ly += h / segments * rand(0.7, 1.3);
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();
      }
    }
  }
}

// ---- 5. Night Sea — shooting stars + aurora + glowing plankton ----
function drawNightSea(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  particles: Float64Array,
  PARTICLE_COUNT: number,
  extra: { shootingStars: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[]; nextStar: number },
) {
  ctx.clearRect(0, 0, w, h);

  // Aurora borealis (top 45%)
  const auroraLayers = 4;
  for (let layer = 0; layer < auroraLayers; layer++) {
    const baseY = h * (0.05 + layer * 0.08);
    const colors = [
      [100, 255, 180], // green
      [80, 200, 255],  // blue-cyan
      [150, 100, 255], // purple
      [100, 255, 200], // teal
    ];
    const c = colors[layer];
    const speed = 0.00015 * (layer + 1);
    const alpha = 0.04 + 0.02 * Math.sin(t * 0.0005 + layer);

    ctx.beginPath();
    ctx.moveTo(0, baseY + 60);
    for (let x = 0; x <= w; x += 4) {
      const y =
        baseY +
        Math.sin(x * 0.002 + t * speed) * (30 + layer * 10) +
        Math.sin(x * 0.005 + t * speed * 2.3) * 15 +
        Math.sin(x * 0.001 + t * speed * 0.5 + layer) * 20;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, baseY + 60);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, baseY - 30, 0, baseY + 60);
    grad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0)`);
    grad.addColorStop(0.4, `rgba(${c[0]},${c[1]},${c[2]},${alpha})`);
    grad.addColorStop(0.6, `rgba(${c[0]},${c[1]},${c[2]},${alpha * 0.7})`);
    grad.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Shooting stars
  if (t > extra.nextStar && extra.shootingStars.length < 3) {
    extra.shootingStars.push({
      x: rand(w * 0.1, w * 0.9),
      y: rand(0, h * 0.3),
      vx: rand(3, 7) * (Math.random() > 0.5 ? 1 : -1),
      vy: rand(2, 5),
      life: 0,
      maxLife: rand(30, 60),
    });
    extra.nextStar = t + rand(3000, 8000);
  }
  for (let i = extra.shootingStars.length - 1; i >= 0; i--) {
    const s = extra.shootingStars[i];
    s.x += s.vx;
    s.y += s.vy;
    s.life++;
    const progress = s.life / s.maxLife;
    if (progress >= 1) { extra.shootingStars.splice(i, 1); continue; }

    const tailLen = 30 + (1 - progress) * 40;
    const alpha = Math.sin(progress * Math.PI) * 0.8;

    const grad = ctx.createLinearGradient(
      s.x, s.y,
      s.x - s.vx / Math.abs(s.vx) * tailLen, s.y - s.vy / Math.abs(s.vy) * tailLen,
    );
    grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx / Math.abs(s.vx) * tailLen, s.y - s.vy / Math.abs(s.vy) * tailLen);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Head glow
    ctx.beginPath();
    ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }

  // Glowing plankton (bottom 35%)
  const planktonY = h * 0.65;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const idx = i * 4;
    let px = particles[idx];
    let py = particles[idx + 1];
    const sz = particles[idx + 2];
    const phase = particles[idx + 3];

    px += Math.sin(t * 0.0005 + phase) * 0.3;
    py += Math.cos(t * 0.0004 + phase * 1.2) * 0.2;
    if (px > w + 10) px -= w + 20;
    if (px < -10) px += w + 20;
    particles[idx] = px;
    particles[idx + 1] = py;

    const actualY = planktonY + ((py - planktonY + (h - planktonY)) % (h - planktonY));
    const glow = 0.3 + 0.7 * Math.pow(Math.max(0, Math.sin(t * 0.002 + phase * 4)), 3);

    const grad = ctx.createRadialGradient(px, actualY, 0, px, actualY, sz * 4);
    grad.addColorStop(0, `rgba(100,200,255,${glow * 0.4})`);
    grad.addColorStop(0.5, `rgba(80,180,255,${glow * 0.1})`);
    grad.addColorStop(1, 'rgba(80,180,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, actualY, sz * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(px, actualY, sz * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(150,230,255,${glow * 0.7})`;
    ctx.fill();
  }
}

// ---- 6. Lighthouse 2 — water reflection columns + sweep beam ----
function drawLighthouse2(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  particles: Float64Array,
  PARTICLE_COUNT: number,
) {
  ctx.clearRect(0, 0, w, h);

  // Water reflection ripples (bottom 40%)
  const waterY = h * 0.6;
  for (let i = 0; i < 22; i++) {
    const y = waterY + (h - waterY) * (i / 22);
    const amplitude = 1.5 + i * 0.35;
    const freq = 0.004 + i * 0.0002;
    const speed = t * (0.0005 + i * 0.00004);
    ctx.beginPath();
    for (let x = 0; x <= w; x += 5) {
      const yOff =
        Math.sin(x * freq + speed) * amplitude +
        Math.sin(x * freq * 2.1 + speed * 1.4) * amplitude * 0.3;
      if (x === 0) ctx.moveTo(x, y + yOff);
      else ctx.lineTo(x, y + yOff);
    }
    const alpha = 0.02 + (i / 22) * 0.035;
    ctx.strokeStyle = `rgba(180,210,255,${alpha})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  // Light column reflection (shimmer on water below lighthouse)
  const colX = w * 0.48;
  const colWidth = 40 + Math.sin(t * 0.002) * 15;
  for (let y = waterY; y < h; y += 3) {
    const offset = Math.sin(y * 0.05 + t * 0.003) * 8;
    const fade = 1 - (y - waterY) / (h - waterY);
    const alpha = fade * (0.04 + 0.03 * Math.sin(t * 0.003 + y * 0.02));
    ctx.beginPath();
    ctx.moveTo(colX + offset - colWidth / 2 * fade, y);
    ctx.lineTo(colX + offset + colWidth / 2 * fade, y);
    ctx.strokeStyle = `rgba(255,240,180,${alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Floating mist particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const idx = i * 4;
    let px = particles[idx];
    let py = particles[idx + 1];
    const sz = particles[idx + 2];
    const spd = particles[idx + 3];

    px += Math.sin(t * 0.0006 + spd) * 0.25;
    py -= 0.15;
    if (py < -20) { py = h + 20; px = rand(0, w); }
    particles[idx] = px;
    particles[idx + 1] = py;

    const alpha = (0.08 + 0.12 * Math.sin(t * 0.002 + spd * 2)) * (sz / 3);
    ctx.beginPath();
    ctx.arc(px, py, sz * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,220,255,${alpha})`;
    ctx.fill();
  }
}

// ==== Particle init helpers ====
function initLighthouseParticles(w: number, h: number, count: number): Float64Array {
  const p = new Float64Array(count * 4);
  for (let i = 0; i < count; i++) {
    p[i * 4] = rand(0, w);
    p[i * 4 + 1] = rand(0, h);
    p[i * 4 + 2] = rand(1, 3); // size
    p[i * 4 + 3] = rand(0.2, 0.8); // speed
  }
  return p;
}

function initSunsetParticles(w: number, h: number, count: number): Float64Array {
  const p = new Float64Array(count * 4);
  for (let i = 0; i < count; i++) {
    p[i * 4] = rand(0, w);
    p[i * 4 + 1] = rand(0, h * 0.3);
    p[i * 4 + 2] = rand(1, 2.5); // size
    p[i * 4 + 3] = rand(0, Math.PI * 2); // phase
  }
  return p;
}

function initForestParticles(w: number, h: number, count: number): Float64Array {
  const p = new Float64Array(count * 4);
  // First 45: fireflies spread across scene
  const fireflyCount = Math.min(45, count);
  for (let i = 0; i < fireflyCount; i++) {
    p[i * 4] = rand(0, w);
    p[i * 4 + 1] = rand(h * 0.1, h * 0.9);
    p[i * 4 + 2] = rand(1.5, 3.5); // size
    p[i * 4 + 3] = rand(0, Math.PI * 2); // phase
  }
  // Rest: falling leaves from above
  for (let i = fireflyCount; i < count; i++) {
    p[i * 4] = rand(0, w);
    p[i * 4 + 1] = rand(-h, h);
    p[i * 4 + 2] = rand(2, 4); // leaf size
    p[i * 4 + 3] = rand(0, Math.PI * 2); // phase/rotation
  }
  return p;
}

function initCityParticles(w: number, h: number, count: number): Float64Array {
  const p = new Float64Array(count * 4);
  for (let i = 0; i < count; i++) {
    p[i * 4] = rand(-20, w + 20);
    p[i * 4 + 1] = rand(-100, h);
    p[i * 4 + 2] = rand(12, 25); // length
    p[i * 4 + 3] = rand(6, 18); // speed
  }
  return p;
}

function initNightSeaParticles(w: number, h: number, count: number): Float64Array {
  const p = new Float64Array(count * 4);
  for (let i = 0; i < count; i++) {
    p[i * 4] = rand(0, w);
    p[i * 4 + 1] = rand(0, h * 0.35);
    p[i * 4 + 2] = rand(1, 2.5); // size
    p[i * 4 + 3] = rand(0, Math.PI * 2); // phase
  }
  return p;
}

// ============================================================
export default function HeroEffects({ activeSlide, isActive }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Float64Array | null>(null);
  const extraRef = useRef<Record<string, unknown>>({});
  const prevSlideRef = useRef<number>(-1);

  const PARTICLE_COUNTS: Record<number, number> = {
    0: 40, // lighthouse motes
    1: 60, // sunset sparkles
    2: 60, // forest fireflies + falling leaves
    3: 200, // city rain
    4: 50, // night sea plankton
    5: 35, // lighthouse2 mist
  };

  const initParticles = useCallback((slide: number, w: number, h: number) => {
    const count = PARTICLE_COUNTS[slide] ?? 40;
    switch (slide) {
      case 0: return initLighthouseParticles(w, h, count);
      case 1: return initSunsetParticles(w, h, count);
      case 2: return initForestParticles(w, h, count);
      case 3: return initCityParticles(w, h, count);
      case 4: return initNightSeaParticles(w, h, count);
      case 5: return initLighthouseParticles(w, h, count);
      default: return initLighthouseParticles(w, h, count);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);

      // Re-init particles on resize
      particlesRef.current = initParticles(activeSlide, rect.width, rect.height);
      prevSlideRef.current = activeSlide;
    };

    resize();
    window.addEventListener('resize', resize);

    // Re‑init particles when slide changes
    if (prevSlideRef.current !== activeSlide) {
      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        particlesRef.current = initParticles(activeSlide, rect.width, rect.height);
        // Reset extra data
        if (activeSlide === 3) {
          extraRef.current = { lightning: { active: false, alpha: 0, nextAt: performance.now() + rand(4000, 8000) } };
        } else if (activeSlide === 4) {
          extraRef.current = { shootingStars: [], nextStar: performance.now() + rand(1000, 3000) };
        } else {
          extraRef.current = {};
        }
      }
      prevSlideRef.current = activeSlide;
    }

    const loop = () => {
      if (!isActive) { rafRef.current = requestAnimationFrame(loop); return; }

      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const t = performance.now();
      const particles = particlesRef.current;
      if (!particles) { rafRef.current = requestAnimationFrame(loop); return; }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = PARTICLE_COUNTS[activeSlide] ?? 40;

      switch (activeSlide) {
        case 0: drawLighthouse(ctx, w, h, t, particles, count); break;
        case 1: drawSunset(ctx, w, h, t, particles, count); break;
        case 2: drawForest(ctx, w, h, t, particles, count); break;
        case 3: drawCity(ctx, w, h, t, particles, count, extraRef.current as never); break;
        case 4: drawNightSea(ctx, w, h, t, particles, count, extraRef.current as never); break;
        case 5: drawLighthouse2(ctx, w, h, t, particles, count); break;
        default: break;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [activeSlide, isActive, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 5,
        pointerEvents: 'none',
      }}
    />
  );
}
