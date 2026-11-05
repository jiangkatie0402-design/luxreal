'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export const AGENT_ITEMS = ['gen', 'material', 'format', 'batch', 'track', 'scene'] as const;
type T = ReturnType<typeof useTranslations>;

/** The centre form: turns on Z and gently tilts on Y so it never goes edge-on. */
function Form() {
  return (
    <div className="relative size-full [perspective:900px]">
      <span className="absolute inset-[-25%] rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.32),transparent)] blur-2xl" />
      <div className="agent-tilt size-full">
        <svg viewBox="-100 -100 200 200" className="agent-spin size-full" fill="none">
          <defs>
            <linearGradient id="orbit-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#c4b5fd" />
              <stop offset="1" stopColor="#6e62a3" />
            </linearGradient>
          </defs>
          <path
            d="M0 -96 C 10 -20, 20 -10, 96 0 C 20 10, 10 20, 0 96 C -10 20, -20 10, -96 0 C -20 -10, -10 -20, 0 -96 Z"
            fill="url(#orbit-g)"
            opacity="0.92"
          />
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse
              key={i}
              cx="0"
              cy="0"
              rx={90 - i * 13}
              ry={(90 - i * 13) * 0.32}
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="0.6"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

/** One capability: label, and (when open) its title + description right beneath it. */
function Item({
  t,
  k,
  i,
  on,
  open,
  align,
  onPick,
}: {
  t: T;
  k: (typeof AGENT_ITEMS)[number];
  i: number;
  on: boolean;
  open: boolean;
  align: 'left' | 'center' | 'right';
  onPick: (i: number) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onPick(i)}
      className={cn(
        'block w-full rounded-btn p-2 text-left outline-none transition-opacity duration-[var(--dur-base)] focus-visible:ring-1 focus-visible:ring-primary',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        on ? 'opacity-100' : 'opacity-55 hover:opacity-90',
      )}
    >
      <span
        className={cn(
          'flex items-center gap-2 text-base font-medium',
          align === 'center' && 'justify-center',
          align === 'right' && 'flex-row-reverse',
        )}
      >
        <span className={cn('size-2 shrink-0 rounded-[2px]', on ? 'bg-primary' : 'bg-white/40')} />
        {t(`items.${k}.label`)}
      </span>
      <span
        className={cn(
          'grid transition-[grid-template-rows] duration-[var(--dur-slow)] ease-[var(--ease-out)]',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <span className="overflow-hidden">
          <span className="t-title mt-3 block !text-lg">{t(`items.${k}.t`)}</span>
          <span className="t-desc mt-2 block text-muted-foreground">{t(`items.${k}.d`)}</span>
        </span>
      </span>
    </button>
  );
}

/** Ring positions (% of the stage) of each label; open content hangs below it. */
const RING = [
  { x: 50, y: 3, align: 'center' },
  { x: 74, y: 26, align: 'left' },
  { x: 74, y: 70, align: 'left' },
  { x: 50, y: 72, align: 'center' },
  { x: 26, y: 70, align: 'right' },
  { x: 26, y: 26, align: 'right' },
] as const;

/** Turning form ringed by six capabilities; only the active one opens beneath its label. */
function Orbit({
  t,
  active,
  onPick,
  mobileAllOpen,
}: {
  t: T;
  active: number;
  onPick: (i: number) => void;
  mobileAllOpen: boolean;
}) {
  return (
    <>
      {/* desktop ring, sized to the pinned screen */}
      <div className="relative mx-auto hidden h-full max-h-[720px] w-full max-w-[1200px] lg:block">
        <div className="absolute left-1/2 top-1/2 aspect-square h-[34%] -translate-x-1/2 -translate-y-1/2">
          <Form />
        </div>
        {RING.map((r, i) => (
          <div
            key={i}
            className={cn(
              'absolute w-[min(300px,22vw)] -translate-y-5',
              r.align === 'center' && '-translate-x-1/2',
              r.align === 'right' && '-translate-x-full',
            )}
            style={{ left: `${r.x}%`, top: `${r.y}%` }}
          >
            <Item
              t={t}
              k={AGENT_ITEMS[i]}
              i={i}
              on={active === i}
              open={active === i}
              align={r.align}
              onPick={onPick}
            />
          </div>
        ))}
      </div>
      {/* mobile: form then the full list */}
      <div className="lg:hidden">
        <div className="mx-auto aspect-square w-[60vw] max-w-[280px]">
          <Form />
        </div>
        <ul className="mt-8 grid gap-4">
          {AGENT_ITEMS.map((k, i) => (
            <li key={k}>
              <Item
                t={t}
                k={k}
                i={i}
                on={mobileAllOpen || active === i}
                open={mobileAllOpen || active === i}
                align="left"
                onPick={onPick}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/**
 * Scroll-driven: on large screens the section pins and each stretch of scroll
 * opens the next capability, so all six are seen before the page moves on.
 */
export function AgentCapabilities({ heading }: { heading: React.ReactNode }) {
  const t = useTranslations('site.agents');
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const N = AGENT_ITEMS.length;

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      if (span <= 0) return;
      const p = Math.min(Math.max(-r.top / span, 0), 0.9999);
      setActive(Math.floor(p * N));
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
  }, [N]);

  /** jump to the scroll position that opens item i */
  const pick = (i: number) => {
    const el = track.current;
    if (!el || window.innerWidth < 1024) return setActive(i);
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / N) * span, behavior: 'smooth' });
  };

  return (
    <div ref={track} className="relative lg:h-[calc(100svh+6*70svh)]">
      <div className="lg:sticky lg:top-[var(--header-h)] lg:flex lg:h-[calc(100svh-var(--header-h))] lg:flex-col lg:py-8">
        {heading}
        <div className="mt-10 lg:mt-6 lg:min-h-0 lg:flex-1">
          <Orbit t={t} active={active} onPick={pick} mobileAllOpen />
        </div>
        {/* progress */}
        <div aria-hidden className="mt-4 hidden items-center justify-center gap-3 lg:flex">
          <span className="font-mono text-xs text-muted-foreground">
            0{active + 1} / 0{N}
          </span>
          <span className="flex gap-1.5">
            {AGENT_ITEMS.map((k, i) => (
              <span
                key={k}
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  i === active ? 'w-6 bg-primary' : 'w-2 bg-white/20',
                )}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
