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

/** Orbit: a slowly turning form in the middle, six capabilities around it. */
function Orbit({ t }: { t: T }) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useCycle(AGENT_ITEMS.length, 2800, hover);
  const k = AGENT_ITEMS[active];
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[720px] md:aspect-[16/10] md:max-w-none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* turning form */}
      <div className="absolute left-1/2 top-[40%] size-[38%] -translate-x-1/2 -translate-y-1/2 [perspective:900px] md:size-[30%]">
        <svg viewBox="-100 -100 200 200" className="agent-orbit size-full" fill="none">
          <defs>
            <linearGradient id="orbit-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#c4b5fd" />
              <stop offset="1" stopColor="#6e62a3" />
            </linearGradient>
          </defs>
          <path
            d="M0 -96 C 10 -20, 20 -10, 96 0 C 20 10, 10 20, 0 96 C -10 20, -20 10, -96 0 C -20 -10, -10 -20, 0 -96 Z"
            fill="url(#orbit-g)"
            opacity="0.9"
          />
          {Array.from({ length: 7 }, (_, i) => (
            <ellipse
              key={i}
              cx="0"
              cy="0"
              rx={96 - i * 12}
              ry={(96 - i * 12) * 0.32}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="0.6"
            />
          ))}
        </svg>
        <span className="absolute inset-[-20%] -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.35),transparent)] blur-2xl" />
      </div>
      {/* six labels on a ring */}
      {AGENT_ITEMS.map((key, i) => {
        const a = (i / AGENT_ITEMS.length) * Math.PI * 2 - Math.PI / 2;
        const on = active === i;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={on}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            className={cn(
              'absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-btn px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-primary md:text-base',
              on ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
            style={{ left: `${50 + Math.cos(a) * 42}%`, top: `${48 + Math.sin(a) * 42}%` }}
          >
            <span
              className={cn(
                'size-2 rounded-[2px] transition-colors',
                on ? 'bg-primary' : 'bg-white/40',
              )}
            />
            {t(`items.${key}.label`)}
          </button>
        );
      })}
      {/* active description, under the form inside the ring */}
      <div
        aria-live="polite"
        className="absolute inset-x-0 top-[66%] mx-auto max-w-md px-4 text-center"
      >
        <p key={k} className="core-panel t-title">
          {t(`items.${k}.t`)}
        </p>
        <p key={`${k}-d`} className="core-panel t-body mt-2 text-muted-foreground">
          {t(`items.${k}.d`)}
        </p>
      </div>
    </div>
  );
}

export function AgentCapabilities() {
  const t = useTranslations('site.agents');
  return <Orbit t={t} />;
}
