'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

const BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? '/';
const KEYS = ['cost', 'easy', 'quality'] as const;
const IMG = ['works/why-game-1.webp', 'works/why-game-2.webp', 'works/why-game-3.webp'];

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};
const phase = (p: number, s: number, e: number) => smooth((p - s) / (e - s));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * 为什么选择 Aholo 3D — scroll-driven showcase.
 * .10–.27 first card moves left · .27–.44 second arrives at the centre and stays there ·
 * .56–.76 third comes straight to its right-hand place · .86–.96 only the shades and the copy
 * change to the final three-column state. Static stack under 560px or with reduced motion.
 */
export function WhyUs() {
  const t = useTranslations('site.why');
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mobile = window.matchMedia('(max-width:559px)');
    const reduced = window.matchMedia('(prefers-reduced-motion:reduce)');
    const q = <E extends Element>(s: string) => el.querySelector<E>(s)!;
    const qa = <E extends Element>(s: string) => [...el.querySelectorAll<E>(s)];
    const track = q<HTMLElement>('.scroll-track');
    const scene = q<HTMLElement>('.scene');
    const stage = q<HTMLElement>('.stage');
    const tiles = qa<HTMLElement>('.tile');
    const singles = qa<HTMLElement>('.single-copy');
    const final = q<HTMLElement>('.final-copy');
    const dots = qa<HTMLElement>('.progress i');
    const op = (n: HTMLElement, v: number) => {
      n.style.opacity = String(v);
      n.setAttribute('aria-hidden', String(v < 0.05));
    };
    const render = () => {
      const top = parseFloat(getComputedStyle(scene).top) || 0;
      const dist = Math.max(1, track.offsetHeight - scene.offsetHeight);
      const p =
        mobile.matches || reduced.matches
          ? 1
          : clamp((top - track.getBoundingClientRect().top) / dist);
      const firstLeft = phase(p, 0.1, 0.27);
      const secondEnter = phase(p, 0.27, 0.44);
      const thirdEnter = phase(p, 0.56, 0.76);
      const revealAll = phase(p, 0.86, 0.96);
      const gap = stage.clientWidth * 0.31;
      const off = stage.clientWidth * 0.95;
      const poses: [number, number, number, number][] = [
        [lerp(0, -gap, firstLeft), -5 * firstLeft, lerp(1, 0.9, firstLeft), 1],
        [lerp(off, 0, secondEnter), 0, 1, phase(p, 0.27, 0.31)],
        [lerp(off, gap, thirdEnter), 5, 0.9, phase(p, 0.56, 0.6)],
      ];
      const shades = [
        0.57 * firstLeft * (1 - revealAll),
        0.57 * phase(p, 0.56, 0.65) * (1 - revealAll),
        0,
      ];
      poses.forEach(([x, r, s, a], i) => {
        const tile = tiles[i];
        if (mobile.matches) {
          tile.style.transform = '';
          tile.style.opacity = '';
          return;
        }
        tile.style.transform = `translateX(calc(-50% + ${x}px)) rotate(${r}deg) scale(${s})`;
        tile.style.opacity = String(a);
        tile.style.zIndex = i === 1 ? '3' : '2';
        tile.querySelector<HTMLElement>('.shade')!.style.opacity = String(shades[i]);
        tile.setAttribute('aria-hidden', String(a < 0.05));
      });
      const w = [
        1 - phase(p, 0.27, 0.34),
        phase(p, 0.27, 0.34) * (1 - phase(p, 0.56, 0.63)),
        phase(p, 0.56, 0.63) * (1 - revealAll),
      ];
      singles.forEach((n, i) => op(n, mobile.matches ? 0 : w[i]));
      op(final, mobile.matches ? 0 : revealAll);
      const cur = p < 0.27 ? 0 : p < 0.56 ? 1 : p < 0.86 ? 2 : 3;
      dots.forEach((d, i) => d.classList.toggle('active', i === cur));
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
    mobile.addEventListener('change', schedule);
    reduced.addEventListener('change', schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    render();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      mobile.removeEventListener('change', schedule);
      reduced.removeEventListener('change', schedule);
      ro.disconnect();
      cancelAnimationFrame(f);
    };
  }, []);

  // the description is never wider than its title (copy-fit sizes to the title)
  const copy = (k: (typeof KEYS)[number]) => (
    <div className="copy-fit">
      <h3>{t(`items.${k}.t`)}</h3>
      <p className="description">{t(`items.${k}.d`)}</p>
    </div>
  );

  return (
    <section aria-labelledby="why-title" id="why" className="scroll-mt-20">
      <div ref={root} className="aholo-why">
        <div className="scroll-track">
          <div className="scene">
            <h2 id="why-title" className="t-h2">
              {t('title')}
            </h2>
            <p className="intro">{t('intro')}</p>
            <div className="stage">
              {KEYS.map((k, i) => (
                <article key={k} className="tile">
                  <div className="image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${BASE}${IMG[i]}`} alt="" loading="lazy" />
                    <span className="tile-tag">{t(`items.${k}.label`)}</span>
                    <div className="shade" />
                  </div>
                  <div className="overlay-copy">{copy(k)}</div>
                </article>
              ))}
              {KEYS.map((k) => (
                <div key={k} className="single-copy">
                  {copy(k)}
                </div>
              ))}
              <div className="final-copy">
                {KEYS.map((k) => (
                  <div key={k}>{copy(k)}</div>
                ))}
              </div>
            </div>
            <div className="progress" aria-hidden>
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
