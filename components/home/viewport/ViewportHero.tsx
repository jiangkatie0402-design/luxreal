'use client';
import { useTranslations } from 'next-intl';
import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { titleEn, titleZh } from '@/components/site/fonts';
import { HERO_SETS, useHeroSet } from '@/lib/heroPalettes';
import { usePerfStore } from '@/lib/perf';
import { CoverUpload } from '../cover/CoverUpload';

/**
 * Homepage cover: a full-bleed looping showreel (white model → finished character)
 * behind the title and upload card. Muted, inline, poster first; under reduced
 * motion only the poster shows.
 */

/** Public asset base: "/" in the app, overridable for static previews. */
const BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? '/';

function Grad({ children, className = 'block' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`block [background-image:var(--title-accent)] bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
}

export function ViewportHero({ locale }: { locale: string }) {
  const t = useTranslations('home.viewport');
  const brush = locale === 'zh' ? titleZh : titleEn;
  const hs = HERO_SETS[useHeroSet((st) => st.i)];
  const reduced = usePerfStore((s) => s.reducedMotion);
  // the header sits outside the hero; its ink/CTA follow the cover via root variables
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--hero-ink', '#ffffff');
    r.setProperty('--hero-ink-muted', 'rgba(255,255,255,0.8)');
    r.setProperty('--hero-cta-bg', '#ffffff');
    r.setProperty('--hero-cta-ink', '#170b33');
    r.setProperty('--chip-border', 'rgba(255,255,255,0.32)');
    r.setProperty('--chip-bg', 'rgba(255,255,255,0.12)');
  }, []);

  return (
    <section
      aria-labelledby="hero-title"
      className="relative h-[100svh] min-h-[700px] overflow-hidden text-[var(--hero-ink)]"
      style={
        {
          background: '#0b0820',
          '--title-accent': `linear-gradient(100deg, ${hs.accent[0]}, ${hs.accent[1]})`,
          '--title-shadow': '0 4px 28px rgba(20,0,60,0.25)',
          '--primary': '#ffffff',
          '--primary-foreground': '#170b33',
          '--upload-bg': 'rgba(12,8,28,0.5)',
        } as CSSProperties
      }
    >
      {reduced ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${BASE}videos/hero-poster.jpg`}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <video
          aria-hidden
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={`${BASE}videos/hero-poster.jpg`}
          className="absolute inset-0 size-full object-cover"
        >
          <source src={`${BASE}videos/hero-720.mp4`} type="video/mp4" media="(max-width: 768px)" />
          <source src={`${BASE}videos/hero.mp4`} type="video/mp4" />
        </video>
      )}
      {/* keep the title and upload card readable over any frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[55%] bg-[linear-gradient(to_bottom,rgba(8,6,20,0.72),rgba(8,6,20,0.35)_55%,transparent)]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background"
      />

      {/* ---------- title ---------- */}
      <div className="pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)+24px)] z-[2] px-4 text-center md:top-[calc(var(--header-h)+32px)]">
        <h1
          id="hero-title"
          className={`${brush.className} t-display [text-shadow:var(--title-shadow)] ${locale === 'zh' ? 'tracking-[0.04em]' : 'font-black uppercase'}`}
        >
          {t('titleA')} <Grad className="md:inline">{t('titleB')}</Grad>
        </h1>
        <p className="t-lead mx-auto mt-4 hidden max-w-[680px] text-[var(--hero-ink-muted)] sm:block">
          {t('subtitle')}
        </p>
      </div>

      {/* ---------- upload ----------
          From md up, its top sits on the white railing in the clip's last shot
          (81% down the frame); the frame is object-cover, so its height is
          max(section height, 56.25vw) and it is centred vertically. */}
      <div className="absolute inset-x-0 bottom-24 z-10 flex justify-center px-4 md:bottom-auto md:top-[calc(50%+0.31*max(100%,56.25vw))]">
        <div className="relative w-full max-w-[920px]">
          <CoverUpload />
        </div>
      </div>
    </section>
  );
}
