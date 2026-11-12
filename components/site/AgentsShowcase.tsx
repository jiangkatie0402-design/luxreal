'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import {
  Boxes,
  ClipboardCheck,
  CloudUpload,
  GraduationCap,
  ListTree,
  type LucideIcon,
} from 'lucide-react';

const ICONS: LucideIcon[] = [Boxes, ClipboardCheck, ListTree, CloudUpload, GraduationCap];
const ROT = [0, 3, -2.5, 2, -1.5];
const clamp = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};

/**
 * "Built for agents" — sticky split. Title and lead stay put top-left; below them the copy of
 * whichever capability is on top swaps in; on the right numbered cards slide up over each other
 * as you scroll. Static stack on narrow screens or with reduced motion.
 */
export function AgentsShowcase() {
  const t = useTranslations('site.agents');
  const items = t.raw('items') as { t: string; d: string }[];
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const scene = el.querySelector<HTMLElement>('.agx-scene')!;
    const cards = [...el.querySelectorAll<HTMLElement>('.agx-card')];
    const wide = window.matchMedia('(min-width:1024px)');
    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)');
    const N = cards.length;
    const render = () => {
      if (!wide.matches || reduce.matches) {
        cards.forEach((c) => {
          c.style.removeProperty('--ty');
          c.style.removeProperty('--rot');
        });
        return;
      }
      const top = parseFloat(getComputedStyle(scene).top) || 0;
      const p = clamp(
        (top - el.getBoundingClientRect().top) / Math.max(1, el.offsetHeight - scene.offsetHeight),
      );
      let on = 0;
      cards.forEach((c, i) => {
        const k = i === 0 ? 1 : smooth(p * (N - 1) * 1.15 - (i - 1));
        const cover = i < N - 1 ? smooth(p * (N - 1) * 1.15 - i) : 0;
        c.style.setProperty('--ty', `calc(${(1 - k) * 170}% + ${cover * 3}%)`);
        c.style.setProperty('--rot', `${ROT[i] * (1 - k * 0.6)}deg`);
        if (k > 0.5) on = i;
      });
      setActive(on);
    };
    let f = 0;
    const schedule = () => {
      if (!f)
        f = requestAnimationFrame(() => {
          f = 0;
          render();
        });
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    wide.addEventListener('change', schedule);
    schedule();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      wide.removeEventListener('change', schedule);
      cancelAnimationFrame(f);
    };
  }, []);

  const n = items.length;
  return (
    <div ref={root} className="agx">
      <div className="agx-scene">
        <div className="agx-left">
          <h2 id="agents-title" className="t-h2">
            {t('titleA')}
            <em>{t('titleB')}</em>
          </h2>
          <p className="agx-lead">{t('lead')}</p>
          <div className="agx-now">
            <p className="agx-count">
              <b>0{active + 1}</b>
              <span className="agx-bar">
                <i style={{ width: `${((active + 1) / n) * 100}%` }} />
              </span>
              <span>0{n}</span>
            </p>
            {items.map((it, i) => (
              <div
                key={it.t}
                className={`agx-item${i === active ? ' on' : ''}`}
                aria-hidden={i !== active}
              >
                <h3>{it.t}</h3>
                <p>{it.d}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="agx-deck">
          {items.map((it, i) => {
            const Icon = ICONS[i];
            return (
              <div key={it.t} className="agx-card" data-d={it.d}>
                <span className="agx-ic" aria-hidden>
                  <Icon strokeWidth={1.8} />
                </span>
                <span className="agx-num" aria-hidden>
                  0{i + 1} / 0{n}
                </span>
                <p className="agx-tag">{it.t}</p>
                <p className="agx-desc">{it.d}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
