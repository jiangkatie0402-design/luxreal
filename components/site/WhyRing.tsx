'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { usePerfStore } from '@/lib/perf';
import { cn } from '@/lib/utils';

const WHY = ['cost', 'easy', 'quality'] as const;
/** Public asset base: "/" in the app, overridable for static previews. */
const BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? '/';
/** Backdrop photo per reason (only the first has one so far). */
const BG: Partial<Record<(typeof WHY)[number], string>> = {
  cost: 'works/why-cost-v2.webp',
};
const N = WHY.length;

const RX = 64;
const RY = 15;

/** A planet wearing a soft ring band; a wide sweep of light flows along the ring. */
function Saturn({ p }: { p: number }) {
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
        {[2, 6].map((d) => (
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
      ></span>
      {/* thin atmosphere rim */}
      <span className="absolute inset-[16.4%] z-10 rounded-full border border-[#c4b5fd]/20 [mask-image:linear-gradient(135deg,#000,transparent_60%)]" />
      {band('front')}
    </>
  );
}

/**
 * 五、为什么选择 Aholo 3D? — one pinned screen built around a ring (the "3D magic
 * house"). Scrolling turns the ring; each reason comes forward in turn, its media
 * fills the centre and its copy shows either side. Media stays empty for now.
 */
export function WhyUs() {
  const t = useTranslations('site.why');
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
        <div className="sticky top-[var(--header-h)] isolate flex h-[calc(100svh-var(--header-h))] flex-col items-center justify-center overflow-hidden px-4 md:px-8">
          {/* one backdrop per reason, cross-fading; kept dark so the copy stays readable */}
          {WHY.map((key) =>
            BG[key] ? (
              <span
                key={key}
                aria-hidden
                className={cn(
                  'pointer-events-none absolute inset-0 -z-20 bg-cover bg-center transition-opacity duration-700',
                  k === key ? 'opacity-100' : 'opacity-0',
                )}
                style={{ backgroundImage: `url(${BASE}${BG[key]})` }}
              />
            ) : null,
          )}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(to_bottom,#0b0b0d_0%,rgba(8,7,12,0.55)_18%,rgba(8,7,12,0.55)_82%,#0b0b0d_100%),radial-gradient(ellipse_at_center,rgba(8,7,12,0.2),rgba(8,7,12,0.75))]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(38%_48%_at_50%_54%,rgba(110,98,163,0.22),transparent_70%)]"
          />

          <h2 id="why-title" className="t-h2 absolute inset-x-0 top-6 text-center md:top-8">
            {t('title')}
          </h2>

          <div
            className={cn(
              'relative mt-16 aspect-square w-[min(56vw,34svh)] shrink-0 lg:mt-14 lg:w-[min(50svh,500px)]',
            )}
          >
            <Saturn p={p} />
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
