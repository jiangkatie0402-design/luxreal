'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { titleEn, titleZh } from '@/components/site/fonts';
import { usePerfStore } from '@/lib/perf';
import { CoverUpload } from '../cover/CoverUpload';

/**
 * Homepage hero: title + upload card over three colour pages (blue → violet →
 * green). Page imagery is intentionally empty until the new assets are decided.
 * Page change: tint bands, then the next page, slide in right → left from mid-screen.
 */
const THEMES = [
  {
    bg: 'radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1.5px) 0 0 / 18px 18px, radial-gradient(60% 55% at 50% 55%, rgba(255,255,255,0.2), transparent 70%), linear-gradient(160deg, #2a56f5 0%, #4f86ff 50%, #9cc8ff 100%)',
    scrim: '45 95 240',
    tint: '#3b6dff',
    accent: 'linear-gradient(100deg, #ffe14d, #fff6b8)',
    bands: ['#1f46e0', '#3b6dff', '#6f9bff', '#a9c8ff'],
  },
  {
    bg: 'radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1.5px) 0 0 / 18px 18px, linear-gradient(160deg, #6a3cf0 0%, #8a63ff 48%, #c3a8ff 100%)',
    scrim: '110 70 235',
    tint: '#7a50f2',
    accent: 'linear-gradient(100deg, #ffe14d, #fff6b8)',
    bands: ['#5a2fe6', '#7a50f2', '#9b7bff', '#c3a8ff'],
  },
  {
    bg: 'radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1.5px) 0 0 / 18px 18px, linear-gradient(160deg, #0fa47a 0%, #20c997 50%, #8ff0c8 100%)',
    scrim: '16 160 118',
    tint: '#14b886',
    accent: 'linear-gradient(100deg, #ffe14d, #fff6b8)',
    bands: ['#0b8f69', '#14b886', '#4fd6a6', '#9ff0cf'],
  },
] as const;

const PAGE_MS = 5000;
const SLIDE_MS = 450;
const SLIDE_GAP = 40;
const TRANS_MS = SLIDE_MS + SLIDE_GAP * 4 + 60;

function Grad({ children, className = 'block' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`block [background-image:var(--title-accent)] bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
}

export function ViewportHero({ locale }: { locale: string }) {
  const t = useTranslations('home.viewport');
  const reduced = usePerfStore((s) => s.reducedMotion);
  const brush = locale === 'zh' ? titleZh : titleEn;

  const [page, setPage] = useState(0);
  // while a page slides in, the previous one stays mounted underneath
  const [trans, setTrans] = useState<{ from: number; k: number } | null>(null);
  const transTimer = useRef(0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setTimeout(() => {
      setTrans({ from: page, k: performance.now() });
      setPage((page + 1) % THEMES.length);
      clearTimeout(transTimer.current);
      transTimer.current = window.setTimeout(() => setTrans(null), TRANS_MS);
    }, PAGE_MS);
    return () => clearTimeout(id);
  }, [page, reduced]);
  useEffect(() => () => clearTimeout(transTimer.current), []);

  const shown = (n: number) => n === page || n === trans?.from;
  const layerStyle = (n: number): CSSProperties =>
    n === page
      ? ({ zIndex: 10, animationDelay: `${SLIDE_GAP * 4}ms`, '--from': '60%' } as CSSProperties)
      : { zIndex: 0 };

  return (
    <section
      aria-labelledby="hero-title"
      className="relative h-[100svh] min-h-[700px] overflow-hidden text-[var(--hero-ink)]"
      style={
        { background: THEMES[page].bg, '--title-accent': THEMES[page].accent } as CSSProperties
      }
    >
      <div aria-hidden className="absolute inset-0 isolate">
        {THEMES.map(
          (th, n) =>
            shown(n) && (
              <div
                key={`p${n}`}
                className={`absolute inset-0 ${n === page && trans ? 'hero-slide' : ''}`}
                style={{ ...layerStyle(n), background: th.bg }}
              />
            ),
        )}
        {trans &&
          THEMES[page].bands.map((c, i) => (
            <span
              key={`${trans.k}-${c}`}
              className="hero-slide pointer-events-none absolute inset-0"
              style={
                {
                  background: c,
                  zIndex: 1 + i,
                  animationDelay: `${i * SLIDE_GAP}ms`,
                  // stripes start mid-screen, stepped just left of the incoming page
                  '--from': `${40 + i * 5}%`,
                } as CSSProperties
              }
            />
          ))}
      </div>

      {/* ---------- title ---------- */}
      <div className="pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)+18px)] z-[2] px-5 text-center md:top-[calc(var(--header-h)+28px)]">
        <h1
          id="hero-title"
          className={`${brush.className} text-[clamp(2.2rem,4.4vw,4.2rem)] leading-[1.1] [text-shadow:var(--title-shadow)] ${locale === 'zh' ? 'tracking-[0.04em]' : 'font-black uppercase'}`}
        >
          {t('titleA')}
          <Grad className="md:inline">{t('titleB')}</Grad>
        </h1>
        <p className="mx-auto mt-3 hidden max-w-[680px] text-[15px] leading-relaxed text-[var(--hero-ink-muted)] sm:block">
          {t('subtitle')}
        </p>
      </div>

      {/* ---------- upload ---------- */}
      <div className="absolute inset-x-0 bottom-24 z-10 flex justify-center px-4 md:bottom-8">
        <div className="relative w-full max-w-[860px]">
          <CoverUpload />
        </div>
      </div>
    </section>
  );
}
