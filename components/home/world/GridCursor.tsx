'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { usePerfStore } from '@/lib/perf';

const SIZE = 72; // css px of the drawing
const CYCLE = 3.0; // s: scan up + hold
const INTERACTIVE = 'a, button, input, textarea, select, label, [role="button"]';

/**
 * Draw one frame of the grid cursor: a faint dotted grid panel and a rotating
 * lat/long grid sphere with glowing nodes, filled bottom-up by a scan line.
 * Exported so other surfaces (previews) can reuse the exact look.
 */
export function drawGridCursor(ctx: CanvasRenderingContext2D, t: number, still = false) {
  const s = SIZE;
  ctx.clearRect(0, 0, s, s);
  const cx = 34,
    cy = 34,
    R = 17;

  // grid panel behind (offset like a HUD tile), dots on intersections
  ctx.lineWidth = 0.6;
  ctx.strokeStyle = 'rgba(120,180,255,0.28)';
  const g0 = 10,
    g1 = 58,
    step = 8;
  ctx.beginPath();
  for (let v = g0; v <= g1; v += step) {
    ctx.moveTo(v, g0);
    ctx.lineTo(v, g1);
    ctx.moveTo(g0, v);
    ctx.lineTo(g1, v);
  }
  ctx.stroke();
  ctx.fillStyle = 'rgba(170,210,255,0.55)';
  for (let x = g0; x <= g1; x += step)
    for (let y = g0; y <= g1; y += step) ctx.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);

  // generation progress → scan height (screen y)
  const k = still ? 1 : Math.min((t % CYCLE) / CYCLE / 0.8, 1);
  const p = still ? 1 : 1 - Math.pow(1 - k, 2);
  const scanY = cy + R - p * 2 * R;
  const rot = still ? 0.6 : t * 0.9;
  const tilt = 0.35;

  // solid (generated) part below the scan line
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, scanY, s, s);
  ctx.clip();
  const grad = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, R);
  grad.addColorStop(0, 'rgba(210,232,255,0.7)');
  grad.addColorStop(0.55, 'rgba(94,168,255,0.5)');
  grad.addColorStop(1, 'rgba(40,90,210,0.6)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // projected grid sphere
  const proj = (lat: number, lon: number) => {
    const x = Math.cos(lat) * Math.sin(lon + rot);
    const y0 = Math.sin(lat);
    const z0 = Math.cos(lat) * Math.cos(lon + rot);
    const y = y0 * Math.cos(tilt) - z0 * Math.sin(tilt);
    const z = y0 * Math.sin(tilt) + z0 * Math.cos(tilt);
    return { x: cx + x * R, y: cy - y * R, z };
  };
  const seg = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => {
    const front = (a.z + b.z) / 2 > 0;
    const above = Math.min(a.y, b.y) < scanY;
    ctx.strokeStyle = above
      ? front
        ? 'rgba(170,215,255,0.95)'
        : 'rgba(120,170,255,0.28)'
      : front
        ? 'rgba(235,245,255,0.75)'
        : 'rgba(150,200,255,0.15)';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  };
  ctx.lineWidth = 0.8;
  const LAT = 6,
    LON = 10,
    N = 28;
  for (let i = 1; i < LAT; i++) {
    const lat = -Math.PI / 2 + (i * Math.PI) / LAT;
    for (let j = 0; j < N; j++)
      seg(proj(lat, (j / N) * Math.PI * 2), proj(lat, ((j + 1) / N) * Math.PI * 2));
  }
  for (let j = 0; j < LON; j++) {
    const lon = (j / LON) * Math.PI * 2;
    for (let i = 0; i < N; i++)
      seg(
        proj(-Math.PI / 2 + (i / N) * Math.PI, lon),
        proj(-Math.PI / 2 + ((i + 1) / N) * Math.PI, lon),
      );
  }
  // glowing nodes on intersections (front, not yet generated)
  for (let i = 1; i < LAT; i++)
    for (let j = 0; j < LON; j++) {
      const q = proj(-Math.PI / 2 + (i * Math.PI) / LAT, (j / LON) * Math.PI * 2);
      if (q.z <= 0 || q.y > scanY) continue;
      ctx.fillStyle = 'rgba(220,240,255,1)';
      ctx.shadowColor = '#5ea8ff';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(q.x, q.y, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  ctx.shadowBlur = 0;

  // scan line
  if (!still && k < 1) {
    const half = Math.sqrt(Math.max(R * R - (scanY - cy) ** 2, 0)) + 5;
    ctx.strokeStyle = 'rgba(160,210,255,1)';
    ctx.shadowColor = '#5ea8ff';
    ctx.shadowBlur = 6;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - half, scanY);
    ctx.lineTo(cx + half, scanY);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // hotspot: the actual click point
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#5ea8ff';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(4, 4, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

/**
 * Custom cursor for an area: hides the system cursor there (fine pointers only)
 * and draws the grid sphere next to the pointer. Interactive elements keep the
 * normal cursor.
 */
export function GridCursor({ area }: { area: RefObject<HTMLElement | null> }) {
  const reduced = usePerfStore((s) => s.reducedMotion);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const el = area.current;
    const c = canvas.current;
    if (!enabled || !el || !c) return;
    el.classList.add('grid-cursor-area');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = SIZE * dpr;
    c.height = SIZE * dpr;
    const ctx = c.getContext('2d')!;
    ctx.scale(dpr, dpr);

    let x = -100,
      y = -100,
      cx = -100,
      cy = -100,
      visible = false,
      raf = 0;
    const t0 = performance.now();
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const r = el.getBoundingClientRect();
      const inside = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      const overUi = !!(e.target as Element | null)?.closest?.(INTERACTIVE);
      visible = inside && !overUi;
      if (cx < -50) {
        cx = x;
        cy = y;
      }
    };
    const leave = () => (visible = false);
    const tick = (now: number) => {
      cx += (x - cx) * 0.45;
      cy += (y - cy) * 0.45;
      c.style.transform = `translate(${cx - 4}px, ${cy - 4}px)`;
      c.style.opacity = visible ? '1' : '0';
      if (visible) drawGridCursor(ctx, (now - t0) / 1000, reduced);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      el.classList.remove('grid-cursor-area');
    };
  }, [enabled, area, reduced]);

  if (!enabled) return null;
  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] transition-opacity duration-150"
      style={{ width: SIZE, height: SIZE, opacity: 0 }}
    />
  );
}
