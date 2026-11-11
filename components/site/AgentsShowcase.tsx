'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { Mascot } from './Mascot';

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};

/**
 * "Built for agents", scroll-driven: the mascot stage fills the screen with the title
 * bottom-left; on scroll the mascot moves left and shrinks while five capability bands
 * slide in from the right. Static stack on narrow screens or with reduced motion.
 */
export function AgentsShowcase() {
  const t = useTranslations('site.agents');
  const items = t.raw('items') as { t: string; d: string }[];
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const scene = el.querySelector<HTMLElement>('.agx-scene')!;
    const bands = [...el.querySelectorAll<HTMLElement>('.agx-band')];
    const wide = window.matchMedia('(min-width:1024px)');
    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)');
    const render = () => {
      if (!wide.matches || reduce.matches) {
        ['--mx', '--ms', '--bx'].forEach((k) => el.style.removeProperty(k));
        bands.forEach((b) => b.style.removeProperty('--rx'));
        return;
      }
      const top = parseFloat(getComputedStyle(scene).top) || 0;
      const p = clamp(
        (top - el.getBoundingClientRect().top) / Math.max(1, el.offsetHeight - scene.offsetHeight),
      );
      const m = smooth((p - 0.12) / 0.5);
      el.style.setProperty('--mx', `${60 - 42 * m}%`);
      el.style.setProperty('--ms', (1 - 0.3 * m).toFixed(3));
      el.style.setProperty('--bx', `${(1 - smooth((p - 0.15) / 0.45)) * 100}%`);
      bands.forEach((b, i) =>
        b.style.setProperty('--rx', `${(1 - smooth((p - 0.15 - i * 0.06) / 0.4)) * 40}%`),
      );
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
    render();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      wide.removeEventListener('change', schedule);
      cancelAnimationFrame(f);
    };
  }, []);

  return (
    <div ref={root} className="agx">
      <div className="agx-scene">
        <div className="agx-stage" aria-hidden>
          <div className="agx-mascot">
            <Mascot className="absolute inset-0" />
          </div>
        </div>
        <div className="agx-copy">
          <h2 id="agents-title" className="t-h2">
            {t('titleA')}
            {t('titleB')}
          </h2>
          <p className="agx-lead">{t('lead')}</p>
        </div>
        <div className="agx-bands">
          {items.map((it, i) => (
            <div key={it.t} className="agx-band">
              <span className="agx-big">0{i + 1}</span>
              <div>
                <h3>{it.t}</h3>
                <p>{it.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
