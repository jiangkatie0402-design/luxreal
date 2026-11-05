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

export function AgentCapabilities() {
  const t = useTranslations('site.agents');
  return <Strip t={t} />;
}
