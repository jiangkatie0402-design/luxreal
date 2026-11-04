'use client';
import { useEffect, useRef } from 'react';
import { usePerfStore } from '@/lib/perf';

/**
 * Background texture: a live wireframe of a 3D Gaussian surface. Two peaks breathe
 * and wander, a ripple spreads from the main peak and the whole sheet slowly turns.
 * Drawn on canvas each frame; pauses when off-screen or the tab is hidden, and
 * renders a single still frame under reduced motion.
 */
const N = 44;
const VB_W = 1600;
const VB_H = 900;

function surface(x: number, y: number, t: number) {
  const ax = -0.25 + 0.2 * Math.sin(t * 0.35);
  const ay = 0.1 + 0.16 * Math.cos(t * 0.3);
  const bx = 0.55 + 0.16 * Math.cos(t * 0.42);
  const by = -0.25 + 0.2 * Math.sin(t * 0.47 + 1);
  const ra = (x - ax) ** 2 + (y - ay) ** 2;
  const rb = (x - bx) ** 2 + (y - by) ** 2;
  const r = Math.sqrt(ra);
  return (
    0.8 * (0.85 + 0.15 * Math.sin(t * 0.6)) * Math.exp(-ra / 0.14) +
    0.5 * (0.75 + 0.25 * Math.sin(t * 0.8 + 1.3)) * Math.exp(-rb / 0.08) +
    0.06 * Math.sin(6 * r - t * 1.8) * Math.exp(-ra / 1.1) -
    0.15 * Math.exp(-((x - 0.15) ** 2 + (y + 0.75) ** 2) / 0.18)
  );
}

function project(x: number, y: number, z: number, t: number): [number, number] {
  const rz = -0.5 + 0.12 * Math.sin(t * 0.15);
  const tilt = 0.62;
  const xr = x * Math.cos(rz) - y * Math.sin(rz);
  const yr = x * Math.sin(rz) + y * Math.cos(rz);
  const depth = yr * Math.cos(tilt) - z * Math.sin(tilt);
  const up = yr * Math.sin(tilt) + z * Math.cos(tilt);
  const d = 3.4;
  const f = d / (d + depth);
  return [VB_W / 2 + xr * f * 640, VB_H * 0.88 - up * f * 520];
}

export function GaussMesh({ from, to }: { from: string; to: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePerfStore((s) => s.reducedMotion);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const px = new Float32Array((N + 1) * (N + 1) * 2);
    let raf = 0;
    let visible = true;
    const t0 = performance.now();

    const draw = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      // same framing as an SVG viewBox with "xMidYMid slice"
      const s = Math.max(w / VB_W, h / VB_H);
      const ox = (w - VB_W * s) / 2;
      const oy = (h - VB_H * s) / 2;
      const t = reduced ? 0 : (now - t0) / 1000;

      for (let i = 0; i <= N; i++)
        for (let j = 0; j <= N; j++) {
          const x = -1.25 + (2.5 * j) / N;
          const y = -1.25 + (2.5 * i) / N;
          const [a, b] = project(x, y, surface(x, y, t), t);
          const k = (i * (N + 1) + j) * 2;
          px[k] = ox + a * s;
          px[k + 1] = oy + b * s;
        }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, w, h * 0.4);
      g.addColorStop(0, from);
      g.addColorStop(1, to);
      ctx.strokeStyle = g;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= N; i++)
        for (let j = 0; j <= N; j++) {
          const k = (i * (N + 1) + j) * 2;
          if (j) ctx.lineTo(px[k], px[k + 1]);
          else ctx.moveTo(px[k], px[k + 1]);
        }
      for (let j = 0; j <= N; j++)
        for (let i = 0; i <= N; i++) {
          const k = (i * (N + 1) + j) * 2;
          if (i) ctx.lineTo(px[k], px[k + 1]);
          else ctx.moveTo(px[k], px[k + 1]);
        }
      ctx.stroke();

      if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(draw);
    };

    const resume = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) resume();
    });
    io.observe(cv);
    const onVis = () => {
      if (!document.hidden) resume();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('resize', resume);
    resume();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', resume);
    };
  }, [from, to, reduced]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full [mask-image:radial-gradient(65%_70%_at_50%_60%,#000_45%,transparent_85%)]"
    />
  );
}
