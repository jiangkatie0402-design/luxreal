'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { create } from 'zustand';
import { usePerfStore } from '@/lib/perf';
import { cn } from '@/lib/utils';
import { StarRing } from './StarRing';

const WHY = ['cost', 'easy', 'quality'] as const;
const N = WHY.length;
/** degrees between the three stations on the ring */
const STEP = 360 / N;
type T = ReturnType<typeof useTranslations>;
type RingProps = { t: T; p: number; active: number; k: string };

/** Preview-only: ring styles for review. */
export const WHY_VARIANTS = [
  'D1 光点星轨',
  'D2a 光带流动',
  'D2b 细星尘环',
  'D2c 呼吸光环',
  'D3 线框星球',
  'D4 光晕涟漪',
  'D5 星尘星环',
] as const;
export const useWhyVariant = create<{ v: number; set: (v: number) => void }>((setState) => ({
  v: 0,
  set: (v) => setState({ v }),
}));

/** Empty media for the active reason (assets not decided yet). */
function Media({ k, className }: { k: string; className?: string }) {
  return (
    <div
      className={cn(
        'absolute overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_32%,#2c2456,#100d1d_72%)]',
        className,
      )}
    >
      <div key={k} className="why-in absolute inset-0" />
    </div>
  );
}

/* Orbit geometry, in % of the square stage: a wide, flat ellipse round the disc. */
const RX = 64;
const RY = 15;
const BACK = `M ${50 - RX} 50 A ${RX} ${RY} 0 0 1 ${50 + RX} 50`;
const FRONT = `M ${50 - RX} 50 A ${RX} ${RY} 0 0 0 ${50 + RX} 50`;

/** One orbit drawn in two halves so the front half passes over the disc. */
function Orbit({
  half,
  stroke,
  width = 1,
  tilt = 0,
}: {
  half: 'back' | 'front';
  stroke: string;
  width?: number;
  tilt?: number;
}) {
  return (
    <path
      d={half === 'back' ? BACK : FRONT}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      vectorEffect="non-scaling-stroke"
      transform={tilt ? `rotate(${tilt} 50 50)` : undefined}
    />
  );
}

type Style = 'glass' | 'thumb' | 'spark';
/** Purely decorative centrepieces: no text in the middle. */
type Visual = 'spark' | 'flow' | 'fine' | 'breathe' | 'wire' | 'halo' | 'dust';

/** The three reasons riding the orbit; the active one swings to the front. */
function Worlds({ p, active, style }: Omit<RingProps, 'k' | 't'> & { style: Style }) {
  return (
    <>
      {WHY.map((key, i) => {
        // front of the orbit is the bottom of the ellipse
        const a = ((90 + (i - p * (N - 1)) * STEP) * Math.PI) / 180;
        const depth = Math.sin(a); // 1 front, -1 back
        const f = (depth + 1) / 2;
        const on = active === i;
        return (
          <span
            key={key}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${50 + Math.cos(a) * RX}%`,
              top: `${50 + depth * RY}%`,
              zIndex: depth > 0 ? 20 : 0,
              opacity: 0.25 + 0.75 * f,
            }}
          >
            <span
              className="relative flex flex-col items-center"
              style={{ transform: `scale(${0.6 + 0.4 * f})` }}
            >
              {style === 'glass' && (
                <span
                  className={cn(
                    'relative size-10 rounded-full bg-[radial-gradient(circle_at_32%_28%,#ffffff_0%,#e6dcff_14%,#9a86e8_42%,#3a2c86_78%,#1a1440_100%)] transition-shadow duration-500',
                    on
                      ? 'shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_0_36px_8px_rgba(150,120,255,0.5)]'
                      : 'shadow-[0_0_0_1px_rgba(255,255,255,0.15)]',
                  )}
                >
                  {/* rim light */}
                  <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_75%_80%,rgba(255,200,240,0.55),transparent_45%)]" />
                </span>
              )}
              {style === 'thumb' && (
                <span
                  className={cn(
                    'relative size-16 overflow-hidden rounded-full border bg-[radial-gradient(circle_at_50%_30%,#2c2456,#120f22)] transition-all duration-500',
                    on
                      ? 'border-[#d6ccff]/70 shadow-[0_0_0_4px_rgba(196,181,253,0.12),0_0_30px_rgba(139,92,246,0.5)]'
                      : 'border-white/15',
                  )}
                >
                  {/* glass sheen; media goes here once assets are decided */}
                  <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_45%)]" />
                </span>
              )}
              {style === 'spark' && (
                <span className="relative grid size-6 place-items-center">
                  <span
                    className={cn(
                      'absolute inset-0 rounded-full blur-md transition-opacity duration-500',
                      on ? 'bg-[#b9a6ff]/80' : 'bg-[#b9a6ff]/30',
                    )}
                  />
                  <span className="relative size-2 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.8)]" />
                </span>
              )}
            </span>
          </span>
        );
      })}
    </>
  );
}

/** Orrery: back orbit, media disc, front orbit, then the worlds. */
function Orrery({ style, p, active }: { style: Style; p: number; active: number }) {
  const lines =
    style === 'spark'
      ? [
          { tilt: 0, stroke: 'rgba(214,204,255,0.55)', width: 1 },
          { tilt: 18, stroke: 'rgba(214,204,255,0.16)', width: 1 },
          { tilt: -18, stroke: 'rgba(214,204,255,0.16)', width: 1 },
        ]
      : style === 'thumb'
        ? [
            { tilt: 0, stroke: 'rgba(214,204,255,0.4)', width: 1 },
            { tilt: 0, stroke: 'rgba(214,204,255,0.08)', width: 7 },
          ]
        : [{ tilt: 0, stroke: 'url(#orbit-front)', width: 1.25 }];
  const svg = (half: 'back' | 'front', z: string) => (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn('pointer-events-none absolute inset-0 size-full overflow-visible', z)}
      style={half === 'back' ? { opacity: 0.45 } : undefined}
    >
      <defs>
        <linearGradient id="orbit-front" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="rgba(214,204,255,0)" />
          <stop offset="0.5" stopColor="rgba(236,230,255,0.95)" />
          <stop offset="1" stopColor="rgba(214,204,255,0)" />
        </linearGradient>
      </defs>
      {lines.map((l, n) => (
        <Orbit key={n} half={half} {...l} />
      ))}
    </svg>
  );
  return (
    <>
      {svg('back', 'z-0')}
      <Media
        k=""
        className="inset-[17%] z-10 border border-white/10 shadow-[0_0_120px_rgba(110,98,163,0.45),inset_0_0_40px_rgba(139,92,246,0.25)]"
      />
      {svg('front', 'z-[15]')}
      <Worlds p={p} active={active} style={style} />
    </>
  );
}

/** D2 — the disc wears a wide, soft ring band, like a small planet. */
function Saturn({ p, mode }: { p: number; mode: 'flow' | 'breathe' }) {
  const reduced = usePerfStore((st) => st.reducedMotion);
  const tilt = -14 + p * 8;
  const arc = (half: 'back' | 'front', d: number) =>
    half === 'back'
      ? `M ${50 - RX + d} 50 A ${RX - d} ${RY - d / 4} 0 0 1 ${50 + RX - d} 50`
      : `M ${50 - RX + d} 50 A ${RX - d} ${RY - d / 4} 0 0 0 ${50 + RX - d} 50`;
  const band = (half: 'back' | 'front') => (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn(
        'pointer-events-none absolute inset-0 size-full overflow-visible',
        half === 'back' ? 'z-0 opacity-45' : 'z-[15]',
        mode === 'breathe' && 'ring-breathe',
      )}
    >
      <defs>
        <linearGradient id={`band-${half}`} x1="0" x2="1">
          <stop offset="0" stopColor="rgba(196,181,253,0)" />
          <stop offset="0.5" stopColor="rgba(226,218,255,0.75)" />
          <stop offset="1" stopColor="rgba(196,181,253,0)" />
        </linearGradient>
        {/* a soft, wide sweep of light that travels along the band */}
        <linearGradient id={`sweep-${half}`} x1="0" x2="1">
          <stop offset="0.3" stopColor="rgba(255,255,255,0)" />
          <stop offset="0.5" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="0.7" stopColor="rgba(255,255,255,0)" />
          {!reduced && (
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              values={half === 'front' ? '-0.7 0; 0.7 0' : '0.7 0; -0.7 0'}
              dur="7s"
              repeatCount="indefinite"
            />
          )}
        </linearGradient>
      </defs>
      <g transform={`rotate(${tilt} 50 50)`}>
        {[0, 4, 8].map((d, n) => (
          <path
            key={n}
            d={arc(half, d)}
            fill="none"
            stroke={`url(#band-${half})`}
            strokeWidth={[6, 1.2, 3][n]}
            strokeOpacity={[0.3, 0.85, 0.45][n]}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {mode === 'flow' &&
          [2, 6].map((d) => (
            <path
              key={d}
              d={arc(half, d)}
              fill="none"
              stroke={`url(#sweep-${half})`}
              strokeWidth={d === 2 ? 2.5 : 1.2}
              vectorEffect="non-scaling-stroke"
            />
          ))}
      </g>
    </svg>
  );
  return (
    <>
      {band('back')}
      <span
        className="absolute inset-[17%] z-10 overflow-hidden rounded-full shadow-[0_0_120px_rgba(110,98,163,0.45),inset_8px_6px_24px_rgba(214,204,255,0.18)]"
        style={{
          background: `radial-gradient(circle at ${30 + p * 14}% ${26 + p * 6}%, #6a5bc0, #2a2160 45%, #0f0c1e 80%)`,
        }}
      >
        {mode === 'breathe' && (
          // the night side slowly creeps across, as if the planet turns
          <span className="planet-turn absolute inset-0 rounded-full" />
        )}
      </span>
      {/* thin atmosphere rim */}
      <span className="absolute inset-[16.4%] z-10 rounded-full border border-[#c4b5fd]/20 [mask-image:linear-gradient(135deg,#000,transparent_60%)]" />
      {band('front')}
    </>
  );
}

/** D3 — a wireframe globe that turns with the scroll, with one spark orbiting it. */
function Wire({ p }: { p: number }) {
  const rot = p * Math.PI * 1.5;
  const R = 34;
  return (
    <>
      <span className="absolute inset-[16%] rounded-full bg-[radial-gradient(circle_at_40%_35%,rgba(110,98,163,0.35),transparent_70%)] shadow-[0_0_120px_rgba(110,98,163,0.35)]" />
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full overflow-visible"
      >
        <g transform="rotate(-18 50 50)">
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="rgba(226,218,255,0.7)"
            strokeWidth="0.35"
          />
          {/* meridians */}
          {Array.from({ length: 6 }, (_, i) => {
            const a = rot + (i * Math.PI) / 6;
            const rx = Math.abs(Math.cos(a)) * R;
            return (
              <ellipse
                key={`m${i}`}
                cx="50"
                cy="50"
                rx={rx}
                ry={R}
                fill="none"
                stroke="rgba(214,204,255,0.45)"
                strokeWidth="0.25"
                strokeOpacity={0.3 + 0.7 * Math.abs(Math.sin(a))}
              />
            );
          })}
          {/* parallels */}
          {[-0.66, -0.33, 0, 0.33, 0.66].map((y) => {
            const r = Math.sqrt(1 - y * y) * R;
            return (
              <ellipse
                key={`p${y}`}
                cx="50"
                cy={50 + y * R}
                rx={r}
                ry={r * 0.22}
                fill="none"
                stroke="rgba(214,204,255,0.35)"
                strokeWidth="0.25"
              />
            );
          })}
          <ellipse
            cx="50"
            cy="50"
            rx="47"
            ry="12"
            fill="none"
            stroke="rgba(214,204,255,0.25)"
            strokeWidth="0.3"
          />
        </g>
      </svg>
      <span className="absolute inset-0 rotate-[-18deg]">
        <span
          className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_12px_4px_rgba(196,181,253,0.8)]"
          style={{
            left: `${50 + Math.cos(rot * 2) * 47}%`,
            top: `${50 + Math.sin(rot * 2) * 12}%`,
          }}
        />
      </span>
    </>
  );
}

/** D4 — concentric rings like ripples of light; arcs on each ring turn at their own pace. */
function Halo({ p }: { p: number }) {
  const rings = [
    { r: 48, w: 0.2, o: 0.18, arc: 0.18, speed: 1 },
    { r: 41, w: 0.25, o: 0.28, arc: 0.3, speed: -1.6 },
    { r: 34, w: 0.3, o: 0.4, arc: 0.22, speed: 2.2 },
  ];
  return (
    <>
      <span className="absolute inset-[24%] rounded-full bg-[radial-gradient(circle_at_50%_40%,#5a4bb0,#231b52_55%,#0e0b1c_85%)] shadow-[0_0_100px_30px_rgba(110,98,163,0.35)]" />
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full overflow-visible"
      >
        {rings.map((g, n) => {
          const C = 2 * Math.PI * g.r;
          return (
            <g key={n}>
              <circle
                cx="50"
                cy="50"
                r={g.r}
                fill="none"
                stroke={`rgba(214,204,255,${g.o})`}
                strokeWidth={g.w}
              />
              <circle
                cx="50"
                cy="50"
                r={g.r}
                fill="none"
                stroke="rgba(236,230,255,0.95)"
                strokeWidth={g.w * 2.4}
                strokeLinecap="round"
                strokeDasharray={`${C * g.arc} ${C}`}
                transform={`rotate(${-90 + p * 240 * g.speed} 50 50)`}
                style={{ filter: 'drop-shadow(0 0 1px rgba(196,181,253,0.9))' }}
              />
            </g>
          );
        })}
      </svg>
    </>
  );
}

/** The decorative centrepiece for each variant. */
function Centre({ visual, p, active }: { visual: Visual; p: number; active: number }) {
  if (visual === 'flow') return <Saturn p={p} mode="flow" />;
  if (visual === 'breathe') return <Saturn p={p} mode="breathe" />;
  if (visual === 'fine') return <StarRing p={p} narrow />;
  if (visual === 'wire') return <Wire p={p} />;
  if (visual === 'halo') return <Halo p={p} />;
  if (visual === 'dust') return <StarRing p={p} />;
  return <Orrery p={p} active={active} style="spark" />;
}

/**
 * 五、为什么选择 Aholo 3D? — one pinned screen built around a ring (the "3D magic
 * house"). Scrolling turns the ring; each reason comes forward in turn, its media
 * fills the centre and its copy shows either side. Media stays empty for now.
 */
export function WhyUs() {
  const t = useTranslations('site.why');
  const v = useWhyVariant((s) => s.v);
  const track = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      setP(span > 0 ? Math.min(Math.max(-r.top / span, 0), 1) : 0);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, []);

  const active = Math.round(p * (N - 1));
  const k = WHY[active];

  return (
    <section aria-labelledby="why-title" id="why" className="scroll-mt-20 pt-16 md:pt-32">
      <div ref={track} className="relative h-[calc(100svh+2*70svh)]">
        <div className="sticky top-[var(--header-h)] flex h-[calc(100svh-var(--header-h))] flex-col items-center justify-center overflow-hidden px-4 md:px-8">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(38%_48%_at_50%_54%,rgba(110,98,163,0.22),transparent_70%)]"
          />

          <h2 id="why-title" className="t-h2 absolute inset-x-0 top-6 text-center md:top-8">
            {t('title')}
          </h2>

          <div
            className={cn(
              'relative mt-16 aspect-square shrink-0 lg:mt-14 lg:w-[min(50svh,500px)]',
              'w-[min(56vw,34svh)]',
            )}
          >
            <Centre
              visual={(['spark', 'flow', 'fine', 'breathe', 'wire', 'halo', 'dust'] as const)[v]}
              p={p}
              active={active}
            />
          </div>
          <p className="mt-12 font-mono text-xs tracking-[0.2em] text-white/50">
            0{active + 1} <span className="text-white/25">/ 0{N}</span>
          </p>

          <div
            key={`copy-${k}`}
            className="why-in mt-5 max-w-md text-center lg:absolute lg:left-[max(2rem,6vw)] lg:top-1/2 lg:mt-0 lg:max-w-[min(26rem,24vw)] lg:-translate-y-1/2 lg:text-left"
          >
            <p className="t-label font-mono text-primary">
              0{active + 1} · {t(`items.${k}.label`)}
            </p>
            <h3 className="mt-3 text-balance font-display text-2xl font-semibold leading-[1.3] md:text-3xl xl:text-4xl">
              {t(`items.${k}.t`)}
            </h3>
            <p className="t-desc mt-4 text-pretty text-muted-foreground lg:hidden">
              {t(`items.${k}.d`)}
            </p>
          </div>

          <p
            key={`desc-${k}`}
            className="why-in t-lead absolute right-[max(2rem,6vw)] top-1/2 hidden max-w-[min(22rem,22vw)] -translate-y-1/2 text-pretty leading-[1.9] text-muted-foreground lg:block"
          >
            {t(`items.${k}.d`)}
          </p>
        </div>
      </div>
    </section>
  );
}
