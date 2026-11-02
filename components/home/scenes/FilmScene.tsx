'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { usePerfStore } from '@/lib/perf';
import { Artboard } from './Artboard';

const ASSETS = [
  { id: 'robot', src: '/core/robot-model-cut.webp', height: 48.7, width: 40 },
  { id: 'corgi', src: '/core/corgi-model-cut.webp', height: 39, width: 44 },
] as const;
const FULL = 1600;
const QUICK = 650;
const SAMPLES = 256;

/**
 * A fixed asset dropped into a film set. "Render" runs a fast progressive render
 * (clay + wireframe preview → noisy samples → final frame); dragging moves the
 * camera with parallax and re-renders on release, like a real-time path tracer.
 */
export function FilmScene() {
  const t = useTranslations('home.scenes.film');
  const reduced = usePerfStore((s) => s.reducedMotion);
  const [asset, setAsset] = useState(0);
  const [p, setP] = useState(0); // render progress 0..1
  const [phase, setPhase] = useState<'preview' | 'rendering' | 'final'>('preview');
  const [cam, setCam] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const run = useRef<{ dur: number; start: number } | null>(null);
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);

  const render = (dur: number) => {
    if (reduced) {
      setP(1);
      setPhase('final');
      return;
    }
    run.current = { dur, start: performance.now() };
    setP(0);
    setPhase('rendering');
  };

  useEffect(() => {
    if (phase !== 'rendering' || !run.current) return;
    let raf = 0;
    const tick = (now: number) => {
      const r = run.current!;
      const k = Math.min((now - r.start) / r.dur, 1);
      setP(1 - Math.pow(1 - k, 2));
      if (k < 1) raf = requestAnimationFrame(tick);
      else setPhase('final');
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const a = ASSETS[asset];
  // While dragging after a render, show the noisy real-time preview.
  const q = dragging && phase === 'final' ? 0.45 : phase === 'preview' ? 0 : p;
  const samples = Math.max(1, Math.round(q * SAMPLES));

  const vars = { '--q': q } as CSSProperties;
  const bgStyle: CSSProperties = {
    transform: `translate(${-cam.x * 2.2}%, ${-cam.y * 1.4}%) scale(1.1)`,
    filter: `grayscale(calc(1 - var(--q))) brightness(calc(0.45 + 0.55 * var(--q))) blur(calc((1 - var(--q)) * 5px))`,
  };
  const subjectStyle: CSSProperties = {
    left: '50%',
    bottom: '18.5%',
    width: `${a.width}%`,
    height: `${a.height}%`,
    transform: `translateX(calc(-50% + ${cam.x * 5}%)) translateY(${cam.y * 3}%) perspective(900px) rotateY(${cam.x * 9}deg)`,
  };

  return (
    <div
      className={`cursor-grid absolute inset-0 select-none overflow-hidden bg-black ${dragging ? '!cursor-grabbing' : ''}`}
      style={vars}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y };
        setDragging(true);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const r = e.currentTarget.getBoundingClientRect();
        setCam({
          x: Math.max(-1, Math.min(1, d.cx + ((e.clientX - d.x) / r.width) * 2.4)),
          y: Math.max(-0.6, Math.min(0.6, d.cy + ((e.clientY - d.y) / r.height) * 1.6)),
        });
      }}
      onPointerUp={() => {
        if (!drag.current) return;
        drag.current = null;
        setDragging(false);
        if (phase === 'final') render(QUICK);
      }}
      role="application"
      aria-label={t('hint')}
    >
      <Artboard>
        <div className="absolute inset-[-6%] transition-transform duration-75" style={bgStyle}>
          <Image
            src="/scenes/film-street.webp"
            alt=""
            fill
            sizes="(min-width:1024px) 1300px, 100vw"
            className="object-cover"
          />
        </div>

        {/* reflection on the wet street */}
        <div
          className="absolute opacity-[calc(0.28*var(--q))] [mask-image:linear-gradient(transparent_35%,#000)] blur-[2px]"
          style={{
            ...subjectStyle,
            bottom: `calc(18.5% - ${a.height}%)`,
            transform: `${subjectStyle.transform} scaleY(-1)`,
          }}
        >
          <Image src={a.src} alt="" fill sizes="500px" className="object-contain object-bottom" />
        </div>

        {/* the asset: clay + wire preview fades into the lit render */}
        <div className="absolute" style={subjectStyle}>
          <Image
            src={a.src}
            alt=""
            fill
            sizes="500px"
            className="object-contain object-bottom"
            style={{
              filter:
                'grayscale(calc(1 - var(--q))) brightness(calc(1.25 - 0.3 * var(--q))) contrast(calc(0.85 + 0.25 * var(--q))) drop-shadow(0 0 calc(var(--q) * 22px) rgba(255,80,220,0.35))',
            }}
          />
          <div
            className="absolute inset-0 opacity-[calc(1-var(--q))] mix-blend-screen [background:repeating-linear-gradient(0deg,rgba(140,190,255,0.8)_0_1px,transparent_1px_10px),repeating-linear-gradient(90deg,rgba(140,190,255,0.8)_0_1px,transparent_1px_10px)] [mask-image:var(--film-mask)] [mask-position:bottom] [mask-repeat:no-repeat] [mask-size:contain]"
            style={{ '--film-mask': `url(${a.src})` } as CSSProperties}
          />
        </div>
      </Artboard>

      {/* path-tracer noise, fading as samples accumulate */}
      <div
        className="film-noise pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{ opacity: phase === 'preview' ? 0 : (1 - q) * 0.9 }}
      />
      <div className="film-rain pointer-events-none absolute inset-0 opacity-[calc(0.5*var(--q))]" />
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(80%_70%_at_50%_45%,transparent_55%,rgba(0,0,0,0.6))]" />

      {/* render HUD */}
      <div className="absolute inset-x-3 top-3 flex flex-row-reverse items-start justify-between gap-2">
        <span className="rounded-full bg-black/55 px-3 py-1.5 font-mono text-[11px] text-white/80 backdrop-blur-md">
          {phase === 'preview' ? t('preview') : `${t('samples')} ${samples}/${SAMPLES}`} · 1920×1080
        </span>
        <div
          className="flex gap-1.5 rounded-full bg-black/55 p-1 backdrop-blur-md"
          role="group"
          aria-label={t('assets')}
        >
          {ASSETS.map((x, i) => (
            <button
              key={x.id}
              type="button"
              aria-pressed={asset === i}
              onClick={() => {
                setAsset(i);
                if (phase !== 'preview') render(QUICK);
              }}
              className={`rounded-full px-3 py-1 text-xs ${asset === i ? 'bg-white text-[#07112a]' : 'text-white/70 hover:text-white'}`}
            >
              {t(`asset.${x.id}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="absolute left-3 top-3 hidden font-mono text-[11px] text-white/60 @[560px]:block">
        <span className="mr-2 inline-block size-2 rounded-full bg-[#ff4d6a] align-middle" />
        CAM_A · 35mm · f/1.8
      </div>

      {phase === 'preview' ? (
        <button
          type="button"
          onClick={() => render(FULL)}
          className="absolute bottom-[14%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#07112a] shadow-lg transition-transform hover:scale-105"
        >
          {t('render')}
        </button>
      ) : (
        phase === 'final' &&
        !dragging && (
          <span className="pointer-events-none absolute bottom-[14%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/55 px-4 py-2 text-xs text-white/85 backdrop-blur-md">
            {t('drag')}
          </span>
        )
      )}
    </div>
  );
}
