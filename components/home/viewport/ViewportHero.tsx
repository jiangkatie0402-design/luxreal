'use client';
import { useTranslations } from 'next-intl';
import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { titleEn, titleZh } from '@/components/site/fonts';
import { HERO_SETS, useHeroSet } from '@/lib/heroPalettes';
import { CoverUpload } from '../cover/CoverUpload';
import { GaussMesh } from './GaussMesh';

/**
 * Homepage cover: one still page — gradient backdrop, live Gaussian wireframe,
 * title and upload card. Imagery is intentionally empty until assets are decided.
 */

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
          background: hs.bg,
          '--title-accent': `linear-gradient(100deg, ${hs.accent[0]}, ${hs.accent[1]})`,
          '--title-shadow': '0 4px 28px rgba(20,0,60,0.25)',
          '--primary': '#ffffff',
          '--primary-foreground': '#170b33',
          '--upload-bg': 'rgba(12,8,28,0.5)',
        } as CSSProperties
      }
    >
      <GaussMesh from={hs.mesh[0]} to={hs.mesh[1]} />

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

      {/* ---------- upload ---------- */}
      <div className="absolute inset-x-0 bottom-24 z-10 flex justify-center px-4 md:bottom-8">
        <div className="relative w-full max-w-[860px]">
          <CoverUpload />
        </div>
      </div>
    </section>
  );
}
