'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const WHY = ['cost', 'easy', 'quality'] as const;
const N = WHY.length;
/** degrees between the three stations on the ring */
const STEP = 360 / N;

/**
 * 五、为什么选择 Aholo 3D? — one pinned screen built around a ring (the "3D magic
 * house"). Scrolling turns the ring; each of the three stations comes to the top
 * in turn, its media fills the inner circle and its copy shows either side.
 * Media slots stay empty until assets are decided.
 */
export function WhyUs() {
  const t = useTranslations('site.why');
  const track = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.min(Math.max(-r.top / span, 0), 1) : 0;
      // turn the ring so station i sits at the top at p = i / (N - 1)
      ring.current?.style.setProperty('--turn', `${-p * (N - 1) * STEP}deg`);
      ring.current?.style.setProperty('--progress', String(p));
      setActive(Math.round(p * (N - 1)));
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

  const k = WHY[active];
  const C = 2 * Math.PI * 49; // progress arc circumference (r = 49 in a 100 box)

  return (
    <section aria-labelledby="why-title" id="why" className="scroll-mt-20">
      <div ref={track} className="relative h-[calc(100svh+2*70svh)]">
        <div className="sticky top-[var(--header-h)] flex h-[calc(100svh-var(--header-h))] flex-col items-center justify-center overflow-hidden px-4 md:px-8">
          {/* ambient violet light */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(40%_50%_at_50%_50%,rgba(110,98,163,0.28),transparent_70%),radial-gradient(30%_30%_at_15%_80%,rgba(139,92,246,0.12),transparent_70%)]"
          />

          {/* ---------- ring ---------- */}
          <div
            ref={ring}
            className="relative aspect-square w-[min(84vw,44svh)] shrink-0 lg:w-[min(64svh,620px)]"
            style={{ '--turn': '0deg', '--progress': '0' } as React.CSSProperties}
          >
            {/* outline, progress arc and ticks */}
            <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full">
              <circle
                cx="50"
                cy="50"
                r="49"
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="0.25"
              />
              <circle
                cx="50"
                cy="50"
                r="49"
                fill="none"
                stroke="url(#why-arc)"
                strokeWidth="0.6"
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                strokeDasharray={C}
                style={{ strokeDashoffset: `calc(${C} * (1 - var(--progress)))` }}
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(196,181,253,0.18)"
                strokeWidth="0.2"
                strokeDasharray="0.6 1.4"
              />
              <defs>
                <linearGradient id="why-arc" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#e2daff" />
                  <stop offset="1" stopColor="#8b7bd8" />
                </linearGradient>
              </defs>
            </svg>

            {/* turning layer: ticks + the three stations */}
            <div
              className="absolute inset-0 transition-transform duration-300 ease-out"
              style={{ transform: 'rotate(var(--turn))' }}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom"
                  style={{ transform: `translateX(-50%) rotate(${i * 15}deg)` }}
                >
                  <span
                    className={cn(
                      'absolute left-0 top-[3%] w-px',
                      i % 8 === 0 ? 'h-3 bg-white/60' : 'h-1.5 bg-white/20',
                    )}
                  />
                </span>
              ))}
              {/* a spark orbiting slowly on the dashed track */}
              <span aria-hidden className="agent-spin absolute inset-[10%]">
                <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e2daff] shadow-[0_0_12px_4px_rgba(196,181,253,0.6)]" />
              </span>
              {WHY.map((key, i) => (
                <span
                  key={key}
                  className="absolute left-1/2 top-0 h-1/2 w-0 origin-bottom"
                  style={{ transform: `rotate(${i * STEP}deg)` }}
                >
                  <span
                    className="absolute left-0 top-[34%]"
                    style={{
                      transform: `translate(-50%, -50%) rotate(calc(${-i * STEP}deg - var(--turn)))`,
                    }}
                  >
                    <span
                      className={cn(
                        'flex items-center gap-2 whitespace-nowrap text-sm transition-colors duration-500',
                        active === i ? 'text-white' : 'text-white/40',
                      )}
                    >
                      <span
                        className={cn(
                          'size-1.5 rounded-full transition-colors duration-500',
                          active === i ? 'bg-[#c4b5fd]' : 'bg-white/30',
                        )}
                      />
                      <span className="font-mono">0{i + 1}</span>
                      {t(`items.${key}.label`)}
                    </span>
                  </span>
                </span>
              ))}
            </div>

            {/* inner circle: media for the active station (empty until assets are decided) */}
            <div className="absolute inset-[24%] overflow-hidden rounded-full border border-white/15 bg-[radial-gradient(circle_at_50%_35%,#2a2350,#0f0d1a_75%)] shadow-[0_0_80px_rgba(110,98,163,0.35)]">
              <div key={k} className="why-in absolute inset-0" />
            </div>

            {/* counters either side, as in the reference */}
            <span className="absolute left-[10%] top-1/2 hidden -translate-y-1/2 font-mono text-sm text-white/70 md:block">
              0{active + 1}
            </span>
            <span className="absolute right-[10%] top-1/2 hidden -translate-y-1/2 font-mono text-sm text-white/70 md:block">
              / 0{N}
            </span>
          </div>

          {/* ---------- copy ---------- */}
          {/* section title: top of the screen on large, above the ring's copy on small */}
          <h2 id="why-title" className="t-h2 absolute inset-x-0 top-6 text-center md:top-8">
            {t('title')}
          </h2>

          <div
            key={`copy-${k}`}
            className="why-in mt-8 max-w-md text-center lg:absolute lg:left-[max(2rem,6vw)] lg:top-1/2 lg:mt-0 lg:max-w-[min(26rem,24vw)] lg:-translate-y-1/2 lg:text-left"
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
