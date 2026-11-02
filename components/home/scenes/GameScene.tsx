'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { usePerfStore } from '@/lib/perf';
import { Artboard } from './Artboard';

// Walkable meadow in the garden image, in % of the stage.
const AREA = { x0: 26, x1: 72, y0: 36, y1: 78 };
const SPEED = 0.42; // stage widths per second
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
const depth = (y: number) => 0.72 + ((y - AREA.y0) / (AREA.y1 - AREA.y0)) * 0.42;
const randomSpot = () => ({
  x: AREA.x0 + 4 + Math.random() * (AREA.x1 - AREA.x0 - 8),
  y: AREA.y0 + 6 + Math.random() * (AREA.y1 - AREA.y0 - 10),
});

/**
 * Click-to-move: the corgi runs to wherever you click on the meadow and picks up
 * the star. Wanders on its own when left alone.
 */
export function GameScene() {
  const t = useTranslations('home.scenes.game');
  const reduced = usePerfStore((s) => s.reducedMotion);
  const board = useRef<HTMLDivElement>(null);
  const dog = useRef<HTMLDivElement>(null);
  const sprite = useRef<HTMLDivElement>(null);
  const state = useRef({ x: 46, y: 64, tx: 46, ty: 64, face: 1, lastInput: 0, moving: false });
  const [star, setStar] = useState({ x: 62, y: 46 });
  const starRef = useRef(star);
  const [score, setScore] = useState(0);
  const [markers, setMarkers] = useState<{ id: number; x: number; y: number }[]>([]);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    starRef.current = star;
  }, [star]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    state.current.lastInput = last;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const s = state.current;
      const el = board.current;
      if (el) {
        const { width, height } = el.getBoundingClientRect();
        const dxPx = ((s.tx - s.x) / 100) * width;
        const dyPx = ((s.ty - s.y) / 100) * height;
        const dist = Math.hypot(dxPx, dyPx);
        const step = SPEED * width * dt * (reduced ? 4 : 1);
        if (dist > 1) {
          const k = Math.min(step / dist, 1);
          s.x += (s.tx - s.x) * k;
          s.y += (s.ty - s.y) * k;
          if (Math.abs(dxPx) > 2) s.face = dxPx < 0 ? -1 : 1;
          s.moving = true;
        } else s.moving = false;

        // pick up the star
        const st = starRef.current;
        if (
          Math.hypot(((st.x - s.x) / 100) * width, ((st.y - s.y) / 100) * height) <
          width * 0.05
        ) {
          setScore((n) => n + 1);
          setStar(randomSpot());
          starRef.current = { x: -100, y: -100 };
        }
        // wander when idle
        if (!s.moving && now - s.lastInput > 3500) {
          const r = randomSpot();
          s.tx = r.x;
          s.ty = r.y;
          s.lastInput = now - 1500;
        }
      }
      if (dog.current) {
        dog.current.style.left = `${s.x}%`;
        dog.current.style.top = `${s.y}%`;
        dog.current.style.zIndex = String(Math.round(s.y));
      }
      if (sprite.current) {
        const sc = depth(s.y);
        const bob = s.moving && !reduced ? Math.abs(Math.sin(now / 70)) * 7 : 0;
        const tilt = s.moving && !reduced ? Math.sin(now / 70) * 4 : 0;
        sprite.current.style.transform = `translate(-50%, calc(-92% - ${bob}px)) scale(${sc * s.face}, ${sc}) rotate(${tilt * s.face}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const moveTo = (clientX: number, clientY: number) => {
    const el = board.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = clamp(((clientX - r.left) / r.width) * 100, AREA.x0, AREA.x1);
    const y = clamp(((clientY - r.top) / r.height) * 100, AREA.y0, AREA.y1);
    Object.assign(state.current, { tx: x, ty: y, lastInput: performance.now() });
    const id = Date.now();
    setMarkers((m) => [...m.slice(-3), { id, x, y }]);
    setTimeout(() => setMarkers((m) => m.filter((k) => k.id !== id)), 700);
    setTouched(true);
  };

  return (
    <div
      className="cursor-grid absolute inset-0 select-none overflow-hidden"
      onPointerDown={(e) => moveTo(e.clientX, e.clientY)}
      role="application"
      aria-label={t('hint')}
    >
      <Artboard ref={board}>
        <Image
          src="/scenes/game-garden.webp"
          alt=""
          fill
          sizes="(min-width:1024px) 1200px, 100vw"
          className="object-cover"
        />

        {markers.map((m) => (
          <span
            key={m.id}
            className="game-marker pointer-events-none absolute size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#ffe27a]"
            style={{ left: `${m.x}%`, top: `${m.y}%`, zIndex: 1 }}
          />
        ))}

        <span
          className="game-star pointer-events-none absolute -translate-x-1/2 -translate-y-full text-3xl drop-shadow-[0_0_10px_rgba(255,220,90,0.9)]"
          style={{ left: `${star.x}%`, top: `${star.y}%`, zIndex: Math.round(star.y) }}
          aria-hidden
        >
          ⭐
        </span>

        <div
          ref={dog}
          className="pointer-events-none absolute w-[15%]"
          style={{ left: '46%', top: '64%' }}
        >
          <span className="absolute left-0 h-[18px] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-black/30 blur-[3px]" />
          <div
            ref={sprite}
            className="absolute left-0 w-full origin-bottom"
            style={{ transform: 'translate(-50%,-92%)' }}
          >
            <Image
              src="/scenes/corgi-run.webp"
              alt=""
              width={550}
              height={442}
              sizes="200px"
              className="h-auto w-full"
            />
          </div>
        </div>
      </Artboard>

      {/* HUD */}
      <div className="pointer-events-none absolute left-3 top-3 rounded-xl bg-black/45 px-3.5 py-2.5 text-xs text-white backdrop-blur-md sm:left-6 sm:top-6">
        <p className="font-semibold">
          {t('name')} <span className="font-normal opacity-70">Lv.3</span>
        </p>
        <p className="mt-1 tracking-[0.15em] text-[#ff6b7a]">♥♥♥</p>
      </div>
      <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/45 px-3.5 py-2 text-sm text-white backdrop-blur-md sm:right-6 sm:top-6">
        ⭐ {score}
      </div>
      {!touched && (
        <span className="pointer-events-none absolute bottom-[14%] left-1/2 -translate-x-1/2 animate-pulse whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#07112a] shadow-lg">
          {t('hint')}
        </span>
      )}
    </div>
  );
}
