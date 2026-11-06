'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { create } from 'zustand';
import { cn } from '@/lib/utils';

const WHY = ['cost', 'easy', 'quality'] as const;
const N = WHY.length;
/** degrees between the three stations on the ring */
const STEP = 360 / N;
type T = ReturnType<typeof useTranslations>;
type RingProps = { t: T; p: number; active: number; k: string };

/** Preview-only: ring styles for review. */
export const WHY_VARIANTS = ['A 极简细环', 'B 发光传送门', 'C 星轨'] as const;
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

/** Places children on the ring for station i (kept upright while the ring turns). */
function Station({
  i,
  turn,
  radius,
  children,
}: {
  i: number;
  turn: number;
  /** distance from centre as % of the ring's half-size */
  radius: number;
  children: ReactNode;
}) {
  const a = ((i * STEP + turn - 90) * Math.PI) / 180;
  return (
    <span
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${50 + (Math.cos(a) * radius) / 2}%`,
        top: `${50 + (Math.sin(a) * radius) / 2}%`,
      }}
    >
      {children}
    </span>
  );
}

/** A — one hairline ring, dots on the line, labels outside, a large inner media disc. */
function RingA({ t, p, active, k }: RingProps) {
  const turn = -p * (N - 1) * STEP;
  const C = 2 * Math.PI * 49.5;
  return (
    <>
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full overflow-visible"
      >
        <circle
          cx="50"
          cy="50"
          r="49.5"
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="0.2"
        />
        <circle
          cx="50"
          cy="50"
          r="49.5"
          fill="none"
          stroke="#c4b5fd"
          strokeWidth="0.35"
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - p)}
          style={{ filter: 'drop-shadow(0 0 1.2px rgba(196,181,253,0.9))' }}
        />
      </svg>
      <Media k={k} className="inset-[9%] shadow-[0_0_120px_rgba(110,98,163,0.35)]" />
      {WHY.map((key, i) => (
        <Station key={key} i={i} turn={turn} radius={99}>
          <span
            className={cn(
              'block size-2.5 rounded-full border transition-all duration-500',
              active === i
                ? 'border-[#e2daff] bg-[#c4b5fd] shadow-[0_0_14px_4px_rgba(196,181,253,0.55)]'
                : 'border-white/40 bg-[#0b0b0d]',
            )}
          />
        </Station>
      ))}
      {WHY.map((key, i) => (
        <Station key={`l-${key}`} i={i} turn={turn} radius={118}>
          <span
            className={cn(
              'block whitespace-nowrap text-sm transition-colors duration-500',
              active === i ? 'text-white' : 'text-white/35',
            )}
          >
            <span className="font-mono">0{i + 1}</span> {t(`items.${key}.label`)}
          </span>
        </Station>
      ))}
    </>
  );
}

/** B — a glowing portal ring whose light turns with the scroll; pill labels outside. */
function RingB({ t, p, active, k }: RingProps) {
  const turn = -p * (N - 1) * STEP;
  const mask =
    'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2.5px))';
  const ring: CSSProperties = {
    background: `conic-gradient(from ${-turn}deg, #f1ecff, #8b7bd8 25%, rgba(110,98,163,0.15) 50%, #8b7bd8 75%, #f1ecff)`,
    mask,
    WebkitMask: mask,
  };
  return (
    <>
      <span aria-hidden className="absolute inset-0 rounded-full opacity-70 blur-xl" style={ring} />
      <span aria-hidden className="absolute inset-0 rounded-full" style={ring} />
      <Media k={k} className="inset-[5%] shadow-[inset_0_0_60px_rgba(139,92,246,0.35)]" />
      <span aria-hidden className="agent-spin absolute inset-[5%]">
        <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_5px_rgba(196,181,253,0.7)]" />
      </span>
      {WHY.map((key, i) => (
        <Station key={key} i={i} turn={turn} radius={120}>
          <span
            className={cn(
              'flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] transition-all duration-500',
              active === i
                ? 'border-[#c4b5fd]/60 bg-[#6e62a3]/40 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                : 'border-white/10 bg-white/[0.03] text-white/40',
            )}
          >
            <span className="font-mono">0{i + 1}</span>
            {t(`items.${key}.label`)}
          </span>
        </Station>
      ))}
    </>
  );
}

/**
 * C — an orrery: the media disc in the middle, a tilted orbit around it, and three
 * small worlds riding the orbit. The active one swings to the front, larger and lit;
 * the others pass behind the disc.
 */
function RingC({ t, p, active, k }: RingProps) {
  return (
    <>
      <Media
        k={k}
        className="inset-[18%] z-10 border border-white/10 shadow-[0_0_100px_rgba(110,98,163,0.4)]"
      />
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[34%] w-[128%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#c4b5fd]/30"
      />
      {WHY.map((key, i) => {
        // the front of the orbit is the bottom of the ellipse
        const a = ((90 + (i - p * (N - 1)) * STEP) * Math.PI) / 180;
        const depth = Math.sin(a); // 1 front, -1 back
        const f = (depth + 1) / 2;
        return (
          <span
            key={key}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${50 + Math.cos(a) * 64}%`,
              top: `${50 + depth * 17}%`,
              zIndex: depth > 0 ? 20 : 0,
              opacity: 0.35 + 0.65 * f,
            }}
          >
            <span
              className="flex flex-col items-center gap-2"
              style={{ transform: `scale(${0.65 + 0.35 * f})` }}
            >
              <span
                className={cn(
                  'grid size-14 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#f1ecff,#8b7bd8_45%,#2a2160_100%)] font-mono text-sm text-white',
                  active === i && 'shadow-[0_0_30px_6px_rgba(139,92,246,0.55)]',
                )}
              >
                0{i + 1}
              </span>
              <span className="whitespace-nowrap text-sm text-white">
                {t(`items.${key}.label`)}
              </span>
            </span>
          </span>
        );
      })}
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
  const props = { t, p, active, k };

  return (
    <section aria-labelledby="why-title" id="why" className="scroll-mt-20">
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
              v === 1 ? 'w-[min(52vw,36svh)]' : 'w-[min(62vw,36svh)]',
            )}
          >
            {v === 0 && <RingA {...props} />}
            {v === 1 && <RingB {...props} />}
            {v === 2 && <RingC {...props} />}
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
