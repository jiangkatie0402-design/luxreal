'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { usePerfStore } from '@/lib/perf';
import { cn } from '@/lib/utils';

export const AGENT_ITEMS = ['gen', 'material', 'format', 'batch', 'track', 'scene'] as const;
type T = ReturnType<typeof useTranslations>;

/** Cycles 0..n-1 every `ms` unless paused / reduced motion. */
function useCycle(n: number, ms: number, paused: boolean) {
  const reduced = usePerfStore((s) => s.reducedMotion);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (paused || reduced) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % n), ms);
    return () => clearInterval(id);
  }, [n, ms, paused, reduced]);
  return [i, setI] as const;
}

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
      onMouseEnter={() => onPick(i)}
      onFocus={() => onPick(i)}
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

/** Ring positions (% of the stage) for six items, starting at the top, clockwise. */
const RING = [
  { x: 50, y: 6, align: 'center' },
  { x: 74, y: 26, align: 'left' },
  { x: 74, y: 70, align: 'left' },
  { x: 50, y: 86, align: 'center' },
  { x: 26, y: 70, align: 'right' },
  { x: 26, y: 26, align: 'right' },
] as const;

/**
 * Three arrangements of the same parts (turning form + six capabilities):
 * 0 · all open: every capability shows its title + text around the form
 * 1 · ring: labels on a ring; only the active one opens beneath its label
 * 2 · columns: three per side, aligned toward the form; active one opens
 */
function Orbit({ t, variant }: { t: T; variant: number }) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useCycle(AGENT_ITEMS.length, 3200, hover);
  const hoverProps = { onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false) };

  if (variant === 2) {
    const left = [5, 4, 3];
    const right = [0, 1, 2];
    const col = (ids: number[], align: 'left' | 'right') => (
      <ul className="flex flex-col justify-center gap-6">
        {ids.map((i) => (
          <li key={i}>
            <Item
              t={t}
              k={AGENT_ITEMS[i]}
              i={i}
              on={active === i}
              open={active === i}
              align={align}
              onPick={setActive}
            />
          </li>
        ))}
      </ul>
    );
    return (
      <div
        {...hoverProps}
        className="grid items-center gap-8 lg:min-h-[560px] lg:grid-cols-[1fr_minmax(240px,0.7fr)_1fr]"
      >
        {col(left, 'right')}
        <div className="mx-auto aspect-square w-[min(60vw,280px)]">
          <Form />
        </div>
        {col(right, 'left')}
      </div>
    );
  }

  const allOpen = variant === 0;
  return (
    <div {...hoverProps}>
      {/* desktop ring */}
      <div className="relative mx-auto hidden aspect-[16/10] w-full max-w-[1200px] lg:block">
        <div className="absolute left-1/2 top-1/2 size-[26%] -translate-x-1/2 -translate-y-1/2">
          <Form />
        </div>
        {RING.map((r, i) => (
          <div
            key={i}
            className={cn(
              'absolute w-[min(300px,22vw)] -translate-y-1/2',
              r.align === 'center' && '-translate-x-1/2',
              r.align === 'right' && '-translate-x-full',
            )}
            style={{ left: `${r.x}%`, top: `${r.y}%` }}
          >
            <Item
              t={t}
              k={AGENT_ITEMS[i]}
              i={i}
              on={allOpen || active === i}
              open={allOpen || active === i}
              align={r.align}
              onPick={setActive}
            />
          </div>
        ))}
      </div>
      {/* mobile: form then list */}
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
                on={allOpen || active === i}
                open={allOpen || active === i}
                align="left"
                onPick={setActive}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AgentCapabilities({ variant }: { variant: number }) {
  const t = useTranslations('site.agents');
  return <Orbit t={t} variant={variant} />;
}
