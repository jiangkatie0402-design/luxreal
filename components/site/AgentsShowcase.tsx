'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

const BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? '/';
/** note positions on the stage (left %, top %, rotation) */
const POS: [number, number, number][] = [
  [36, 26, -3],
  [61, 30, 4],
  [48, 64, -1.5],
  [22, 60, 5],
  [76, 64, -4],
];
const clamp = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};

/** "Lead. rest" → the lead highlighted like a marker */
function Title({ text }: { text: string }) {
  const m = text.match(/^(.+?[.，,])\s*(.*)$/);
  return m ? (
    <>
      <mark>{m[1]}</mark> {m[2]}
    </>
  ) : (
    text
  );
}

/**
 * "Built for agents" — big centred title with the mascot stickers on a dot grid; on scroll five
 * purple notes pop in one by one, scattered over it. Static list on narrow screens / reduced motion.
 */
export function AgentsShowcase() {
  const t = useTranslations('site.agents');
  const items = t.raw('items') as { t: string; d: string }[];
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const scene = el.querySelector<HTMLElement>('.agy-scene')!;
    const notes = [...el.querySelectorAll<HTMLElement>('.agy-note')];
    const wide = window.matchMedia('(min-width:1024px)');
    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)');
    const render = () => {
      if (!wide.matches || reduce.matches) {
        notes.forEach((n) => ['--o', '--s'].forEach((k) => n.style.removeProperty(k)));
        return;
      }
      const top = parseFloat(getComputedStyle(scene).top) || 0;
      const p = clamp(
        (top - el.getBoundingClientRect().top) / Math.max(1, el.offsetHeight - scene.offsetHeight),
      );
      notes.forEach((n, i) => {
        const k = smooth((p - (0.06 + i * 0.16)) / 0.1);
        n.style.setProperty('--o', k.toFixed(3));
        n.style.setProperty('--s', (0.7 + 0.3 * k + 0.07 * Math.sin(Math.PI * k)).toFixed(3));
      });
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
    render();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(f);
    };
  }, []);

  return (
    <div ref={root} className="agy" data-v="a">
      <div className="agy-scene">
        <div className="agy-hero">
          <h2 id="agents-title" className="t-h2 agy-title">
            <span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="agy-st s2" src={`${BASE}works/agent-sticker-2.webp`} alt="" />
              {t('titleA').trim()}
            </span>
            <span>
              <em>{t('titleB')}</em>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="agy-st" src={`${BASE}works/agent-sticker-1.webp`} alt="" />
            </span>
          </h2>
          <p className="agy-lead">{t('lead')}</p>
        </div>
        <div className="agy-notes">
          {items.map((it, i) => (
            <div
              key={it.t}
              className="agy-note"
              style={
                {
                  left: `${POS[i][0]}%`,
                  top: `${POS[i][1]}%`,
                  '--r': `${POS[i][2]}deg`,
                } as React.CSSProperties
              }
            >
              <span className="agy-num">0{i + 1}</span>
              <h3>
                <Title text={it.t} />
              </h3>
              <p>{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
