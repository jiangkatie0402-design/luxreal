'use client';
import { useEffect, useRef } from 'react';
import { usePerfStore } from '@/lib/perf';

/**
 * A planet inside a ring of star dust (a small galaxy disc). Particles behind the
 * planet are drawn on a canvas under it, those in front on a canvas over it, so the
 * band wraps round the sphere. The disc drifts slowly and turns a little further
 * with the scroll (`p`). Pauses off-screen; still under reduced motion.
 */
const COUNT = 2400;
const TILT = (-14 * Math.PI) / 180;

type Star = { r: number; a: number; w: number; s: number; b: number; hue: number; y: number };

function makeStars(): Star[] {
  const out: Star[] = [];
  for (let i = 0; i < COUNT; i++) {
    // denser towards the inner edge of the band, thinning outwards
    const u = Math.random();
    const r = 0.58 + Math.pow(u, 1.15) * 1.5;
    out.push({
      r,
      a: Math.random() * Math.PI * 2,
      w: 0.9 / Math.pow(r, 1.5), // inner stars orbit faster
      s: Math.random() < 0.03 ? 1.6 + Math.random() * 1.2 : 0.4 + Math.random() * 0.9,
      b: 0.35 + Math.random() * 0.65,
      hue: Math.random(),
      // thickness of the disc: most stars near the plane, some drifting off it
      y: (Math.random() + Math.random() + Math.random() - 1.5) * 0.2 * r,
    });
  }
  return out;
}

export function StarRing({ p }: { p: number }) {
  const back = useRef<HTMLCanvasElement>(null);
  const haze = useRef<HTMLCanvasElement>(null);
  const front = useRef<HTMLCanvasElement>(null);
  const pRef = useRef(p);
  const redraw = useRef<() => void>(() => {});
  const reduced = usePerfStore((s) => s.reducedMotion);

  useEffect(() => {
    pRef.current = p;
  }, [p]);

  useEffect(() => {
    const cb = back.current;
    const ch = haze.current;
    const xh = ch?.getContext('2d');
    const cf = front.current;
    const xb = cb?.getContext('2d');
    const xf = cf?.getContext('2d');
    if (!cb || !cf || !ch || !xb || !xf || !xh) return;
    const stars = makeStars();
    let raf = 0;
    let visible = false;
    let t = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!reduced) t += dt;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cb.clientWidth;
      const h = cb.clientHeight;
      for (const c of [cb, cf, ch]) {
        if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
          c.width = Math.round(w * dpr);
          c.height = Math.round(h * dpr);
        }
      }
      for (const x of [xb, xf, xh]) {
        x.setTransform(dpr, 0, 0, dpr, 0, 0);
        x.clearRect(0, 0, w, h);
        x.globalCompositeOperation = 'lighter';
      }
      const cx = w / 2;
      const cy = h / 2;
      const RX = w * 0.22;
      const RY = RX * 0.3;
      const turn = t * 0.08 + pRef.current * 1.6;
      const cos = Math.cos(TILT);
      const sin = Math.sin(TILT);

      for (const st of stars) {
        const a = st.a + turn * st.w;
        const ex = Math.cos(a) * st.r * RX;
        const ey = Math.sin(a) * st.r * RY + st.y * RX;
        const x = cx + ex * cos - ey * sin;
        const y = cy + ex * sin + ey * cos;
        const depth = Math.sin(a);
        const ctx = depth > 0 ? xf : xb;
        // fade towards the outer edge so the disc melts into the dark
        const alpha = st.b * (depth > 0 ? 1 : 0.55) * Math.min(1, (2.1 - st.r) / 0.9 + 0.12);
        const tint = st.hue < 0.5 ? '226,218,255' : st.hue < 0.85 ? '196,181,253' : '255,215,240';
        // soft bloom of every star on a blurred layer, so the band reads as a glow
        xh.fillStyle = `rgba(${tint},${alpha * 0.22})`;
        xh.beginPath();
        xh.arc(x, y, st.s * 5, 0, Math.PI * 2);
        xh.fill();
        ctx.fillStyle = `rgba(${tint},${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, st.s, 0, Math.PI * 2);
        ctx.fill();
        if (st.s > 1.5) {
          // a few bright stars get a soft halo and a small cross flare
          const g = ctx.createRadialGradient(x, y, 0, x, y, st.s * 6);
          g.addColorStop(0, `rgba(${tint},${alpha * 0.5})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.fillRect(x - st.s * 6, y - st.s * 6, st.s * 12, st.s * 12);
          ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.6})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(x - st.s * 3.5, y);
          ctx.lineTo(x + st.s * 3.5, y);
          ctx.moveTo(x, y - st.s * 3.5);
          ctx.lineTo(x, y + st.s * 3.5);
          ctx.stroke();
        }
      }
      if (visible && !document.hidden && !reduced) raf = requestAnimationFrame(draw);
    };
    redraw.current = () => draw(performance.now());
    const resume = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) resume();
    });
    io.observe(cb);
    const onVis = () => !document.hidden && visible && resume();
    document.addEventListener('visibilitychange', onVis);
    resume();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reduced]);

  // under reduced motion there is no loop: redraw when the scroll position changes
  useEffect(() => {
    if (reduced) redraw.current();
  }, [p, reduced]);

  const canvas =
    'pointer-events-none absolute left-1/2 top-1/2 h-[160%] w-[280%] -translate-x-1/2 -translate-y-1/2';
  return (
    <>
      <canvas ref={haze} aria-hidden className={`${canvas} z-0 opacity-50 blur-[10px]`} />
      <canvas ref={back} aria-hidden className={`${canvas} z-0`} />
      {/* core glow behind the planet, as in a galaxy's bright centre */}
      <span className="absolute inset-[8%] z-[1] rounded-full bg-[radial-gradient(closest-side,rgba(196,181,253,0.35),transparent)] blur-2xl" />
      <span className="absolute inset-[22%] z-10 rounded-full bg-[radial-gradient(circle_at_35%_28%,#6a5bc0,#2a2160_45%,#0f0c1e_80%)] shadow-[0_0_80px_rgba(150,130,255,0.45)]" />
      <canvas ref={front} aria-hidden className={`${canvas} z-20`} />
    </>
  );
}
