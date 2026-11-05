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

/** 1 · strip: one long band of six panels; the active one widens and tells its story. */
function Strip({ t }: { t: T }) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useCycle(AGENT_ITEMS.length, 3200, hover);
  return (
    <ul
      className="flex h-[420px] gap-2 md:gap-3"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {AGENT_ITEMS.map((k, i) => {
        const on = active === i;
        return (
          <li
            key={k}
            className={cn(
              'relative min-w-0 overflow-hidden rounded-[20px] border border-white/10 transition-[flex-grow] duration-[700ms] ease-[var(--ease-out)]',
              on ? 'flex-[5]' : 'flex-1',
            )}
            style={{
              background: on
                ? 'radial-gradient(80% 70% at 30% 20%, rgba(139,92,246,0.28), transparent 70%), #121118'
                : '#0f0f13',
            }}
          >
            <button
              type="button"
              aria-pressed={on}
              onClick={() => setActive(i)}
              onFocus={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className="absolute inset-0 flex flex-col justify-end p-5 text-left outline-none focus-visible:ring-1 focus-visible:ring-primary md:p-7"
            >
              <span className="absolute left-5 top-5 font-mono text-xs text-muted-foreground md:left-7 md:top-7">
                0{i + 1}
              </span>
              {/* collapsed: vertical label */}
              <span
                className={cn(
                  'absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm text-muted-foreground transition-opacity [writing-mode:vertical-rl]',
                  on ? 'opacity-0' : 'opacity-100',
                )}
              >
                {t(`items.${k}.label`)}
              </span>
              {/* expanded: full copy */}
              <span
                className={cn(
                  'max-w-md transition-[opacity,transform] duration-500',
                  on
                    ? 'translate-y-0 opacity-100 delay-200'
                    : 'pointer-events-none translate-y-2 opacity-0',
                )}
              >
                <span className="t-label block text-[#a99ce0]">{t(`items.${k}.label`)}</span>
                <span className="t-h3 mt-2 block !text-2xl">{t(`items.${k}.t`)}</span>
                <span className="t-body mt-3 block text-muted-foreground">{t(`items.${k}.d`)}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** 2 · orbit: a slowly turning form in the middle, six capabilities around it. */
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

/** 3 · grid: hairline cells with cross marks at the joints. */
function Grid({ t }: { t: T }) {
  return (
    <div className="relative">
      <ul className="grid border-l border-t border-white/10 sm:grid-cols-2 lg:grid-cols-3">
        {AGENT_ITEMS.map((k, i) => (
          <li
            key={k}
            className="group relative border-b border-r border-white/10 p-8 transition-colors duration-[var(--dur-base)] hover:bg-[radial-gradient(80%_80%_at_0%_0%,rgba(139,92,246,0.16),transparent_70%)] md:min-h-[260px] md:p-10"
          >
            {/* cross at the top-left joint */}
            <span aria-hidden className="absolute -left-[5px] -top-[5px] size-[9px]">
              <span className="absolute inset-x-0 top-1/2 h-px bg-white/45" />
              <span className="absolute inset-y-0 left-1/2 w-px bg-white/45" />
            </span>
            <p className="flex items-baseline justify-between">
              <span className="t-label text-[#a99ce0]">{t(`items.${k}.label`)}</span>
              <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
            </p>
            <h3 className="t-title mt-6 md:mt-10">{t(`items.${k}.t`)}</h3>
            <p className="t-body mt-3 text-muted-foreground">{t(`items.${k}.d`)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AgentCapabilities({ variant }: { variant: number }) {
  const t = useTranslations('site.agents');
  if (variant === 1) return <Orbit t={t} />;
  if (variant === 2) return <Grid t={t} />;
  return <Strip t={t} />;
}
