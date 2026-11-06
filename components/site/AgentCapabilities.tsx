'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { usePerfStore } from '@/lib/perf';
import { cn } from '@/lib/utils';
import { Mascot } from './Mascot';

export const AGENT_ITEMS = ['gen', 'material', 'format', 'batch', 'track', 'scene'] as const;
type T = ReturnType<typeof useTranslations>;

/** The centre: the Aholo mascot turning slowly on a soft violet glow. */
function Form() {
  return (
    <div className="relative size-full">
      <span className="absolute inset-[-18%] rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.32),transparent)] blur-2xl" />
      <Mascot className="absolute inset-0" />
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
          <span className="t-desc mt-2 block text-balance text-muted-foreground">
            {t(`items.${k}.d`)}
          </span>
        </span>
      </span>
    </button>
  );
}

const N = AGENT_ITEMS.length;
const STEP_MS = 2000;

/** Ring positions (% of the stage) of each label; open content hangs below it. */
const RING = [
  { x: 50, y: 4, align: 'center' },
  { x: 74, y: 27, align: 'left' },
  { x: 74, y: 66, align: 'left' },
  { x: 50, y: 82, align: 'center' },
  { x: 26, y: 66, align: 'right' },
  { x: 26, y: 27, align: 'right' },
] as const;

/**
 * Desktop: the form ringed by six capabilities. The ring rocks gently back and
 * forth in place (a few degrees) while each capability opens in turn on its own.
 * Hovering a label pauses the turn; click opens an item. Pauses off-screen.
 */
function Ring({ t }: { t: T }) {
  const stage = useRef<HTMLDivElement>(null);
  const slots = useRef<(HTMLDivElement | null)[]>([]);
  const hover = useRef(false);
  const [active, setActive] = useState(0);
  const reduced = usePerfStore((s) => s.reducedMotion);

  // rock the ring: each label moves along a small arc around the centre, staying upright
  useEffect(() => {
    const el = stage.current;
    if (!el || reduced) return;
    let raf = 0;
    let visible = false;
    const t0 = performance.now();
    const frame = (now: number) => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const phi = 0.07 * Math.sin(((now - t0) / 1000) * ((2 * Math.PI) / 9)); // ±4°, 9s
      const c = Math.cos(phi) - 1;
      const sn = Math.sin(phi);
      RING.forEach((r, i) => {
        const s = slots.current[i];
        if (!s) return;
        const x = ((r.x - 50) / 100) * w;
        const y = ((r.y - 47) / 100) * h;
        s.style.translate = `${x * c - y * sn}px ${x * sn + y * c}px`;
      });
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const resume = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) resume();
    });
    io.observe(el);
    const onVis = () => !document.hidden && visible && resume();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reduced]);

  // open the next capability every few seconds
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      if (!hover.current && !document.hidden) setActive((a) => (a + 1) % N);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [reduced, active]);

  return (
    <div ref={stage} className="relative mx-auto hidden h-[600px] w-full max-w-[1200px] lg:block">
      <div className="absolute left-1/2 top-[45%] aspect-square h-[52%] -translate-x-1/2 -translate-y-1/2">
        <Form />
      </div>
      {RING.map((r, i) => (
        <div
          key={i}
          ref={(d) => {
            slots.current[i] = d;
          }}
          onMouseEnter={() => (hover.current = true)}
          onMouseLeave={() => (hover.current = false)}
          className="absolute will-change-[translate]"
          style={{ left: `${r.x}%`, top: `${r.y}%` }}
        >
          <div
            className={cn(
              'w-[min(340px,24vw)] -translate-y-5',
              r.align === 'center' && '-translate-x-1/2',
              r.align === 'right' && '-translate-x-full',
            )}
          >
            <Item
              t={t}
              k={AGENT_ITEMS[i]}
              i={i}
              on={active === i}
              open={active === i}
              align={r.align}
              onPick={setActive}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Mobile: the form, then all six capabilities open in a list. */
function MobileList({ t }: { t: T }) {
  return (
    <div className="lg:hidden">
      <div className="mx-auto aspect-square w-[60vw] max-w-[280px]">
        <Form />
      </div>
      <ul className="mt-8 grid gap-4">
        {AGENT_ITEMS.map((k, i) => (
          <li key={k}>
            <Item t={t} k={k} i={i} on open align="left" onPick={() => {}} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AgentCapabilities({ heading }: { heading: React.ReactNode }) {
  const t = useTranslations('site.agents');
  return (
    <div>
      {heading}
      <div className="mt-10 lg:mt-8">
        <Ring t={t} />
        <MobileList t={t} />
      </div>
    </div>
  );
}
