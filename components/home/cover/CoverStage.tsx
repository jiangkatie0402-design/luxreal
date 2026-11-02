'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { COVER_INTERVAL, coverSlides } from '@/config/cover';
import { usePerfStore } from '@/lib/perf';

/**
 * The cover "screen": title on the left, a slideshow of the four story images on
 * the right, and the neighbouring slides peeking in at the sides on wide screens.
 */
export function CoverStage({ title }: { title: ReactNode }) {
  const t = useTranslations('home.cover');
  const reduced = usePerfStore((s) => s.reducedMotion);
  const init = usePerfStore((s) => s.init);
  useEffect(() => init(), [init]);
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [paused, setPaused] = useState(false);
  const n = coverSlides.length;
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (hover || paused || reduced) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % n), COVER_INTERVAL);
    return () => clearTimeout(id);
  }, [index, hover, paused, reduced, n]);

  const prev = coverSlides[(index + n - 1) % n];
  const next = coverSlides[(index + 1) % n];
  const slide = coverSlides[index];

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) setIndex((i) => (i + (dx < 0 ? 1 : n - 1)) % n);
        touchX.current = null;
      }}
    >
      {/* neighbours peeking in, like a curved screen */}
      {[
        { s: prev, side: 'left', dir: -1 },
        { s: next, side: 'right', dir: 1 },
      ].map(({ s, side, dir }) => (
        <button
          key={side}
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => setIndex((i) => (i + dir + n) % n)}
          className={`absolute top-[12%] hidden h-[64%] w-[16vw] max-w-[300px] overflow-hidden rounded-2xl opacity-40 transition-opacity hover:opacity-70 2xl:block ${
            side === 'left'
              ? 'right-full mr-5 [transform:perspective(900px)_rotateY(28deg)]'
              : 'left-full ml-5 [transform:perspective(900px)_rotateY(-28deg)]'
          }`}
        >
          <Image
            src={s.src}
            alt=""
            fill
            sizes="300px"
            className="object-cover"
            style={{ objectPosition: s.position }}
          />
        </button>
      ))}

      <div
        role="region"
        aria-roledescription={t('carousel')}
        aria-label={t('carouselLabel')}
        className="relative overflow-hidden rounded-[28px] border border-line-strong bg-[#03060d] shadow-[0_30px_120px_-30px_rgba(56,116,255,0.45)] lg:h-[min(70svh,720px)] lg:min-h-[540px]"
      >
        {/* slides: full-bleed under the title on desktop, on top on mobile */}
        <div className="relative aspect-[3/2] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[66%] lg:[mask-image:linear-gradient(90deg,transparent_0%,#000_38%)]">
          {coverSlides.map((s, i) => (
            <div
              key={s.id}
              aria-hidden={i !== index}
              className={`absolute inset-0 transition-opacity duration-[900ms] ease-[var(--ease-out)] ${i === index ? 'opacity-100' : 'opacity-0'}`}
            >
              <Image
                src={s.src}
                alt={t(`slides.${s.id}.alt`)}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 66vw, 100vw"
                className={`object-cover ${i === index && !reduced ? 'cover-kenburns' : ''}`}
                style={{ objectPosition: s.position }}
              />
            </div>
          ))}
          {/* feather the image into the dark stage */}
          <div
            aria-hidden
            className="absolute inset-0 hidden bg-[linear-gradient(90deg,#03060d_0%,rgba(3,6,13,0.75)_14%,rgba(3,6,13,0)_42%)] lg:block"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(0deg,#03060d_0%,rgba(3,6,13,0)_30%)] lg:bg-[linear-gradient(0deg,rgba(3,6,13,0.85)_0%,rgba(3,6,13,0)_28%)]"
          />

          <p
            key={slide.id}
            className="cover-caption absolute bottom-5 right-5 flex items-center gap-2 rounded-full bg-[rgba(3,6,13,0.6)] px-3.5 py-1.5 text-sm text-white backdrop-blur-md lg:bottom-28 lg:right-8"
            aria-live="polite"
          >
            <span className="font-mono text-xs opacity-70">
              0{index + 1} / 0{n}
            </span>
            {t(`slides.${slide.id}.label`)}
          </p>
        </div>

        <div className="relative px-6 pb-8 pt-2 lg:absolute lg:inset-y-0 lg:left-0 lg:flex lg:w-[48%] lg:flex-col lg:justify-center lg:px-[5%] lg:pb-24 lg:pt-0">
          {title}
        </div>

        {/* dots + pause */}
        <div className="absolute inset-x-0 bottom-0 hidden items-center justify-center gap-3 pb-24 lg:flex">
          <div role="group" aria-label={t('carouselLabel')} className="flex items-center gap-2">
            {coverSlides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={t(`slides.${s.id}.label`)}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? t('play') : t('pause')}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-[rgba(3,6,13,0.55)] text-white/80 backdrop-blur-md hover:text-white"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden fill="currentColor">
            {paused ? <path d="M3 1.5v11l9-5.5z" /> : <path d="M3 1.5h3v11H3zM8 1.5h3v11H8z" />}
          </svg>
        </button>
      </div>
    </div>
  );
}
