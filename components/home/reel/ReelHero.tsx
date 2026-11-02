'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { appUrl } from '@/config/site';
import { usePerfStore } from '@/lib/perf';
import { titleEn, titleZh } from '../world/fonts';

/**
 * Homepage hero, film-reel style: three ~3s clips play full-bleed, each a pair of
 * keyframes (before → after) joined by the blue generation scan, with a slow
 * camera push. The centre pill shows each clip's input image and prompt.
 * Swap `a`/`b` for real video later; timings live in CLIP_MS.
 */
const CLIPS = [
  { id: 'print', a: '/reel/print-a.webp', b: '/reel/print-b.webp' },
  { id: 'film', a: '/reel/film-a.webp', b: '/reel/film-b.webp' },
  { id: 'game', a: '/reel/game-a.webp', b: '/reel/game-b.webp' },
] as const;
const CLIP_MS = 3400;
const SCAN = { start: 0.22, end: 0.72 };

export function ReelHero({ locale }: { locale: string }) {
  const t = useTranslations('home.reel');
  const reduced = usePerfStore((s) => s.reducedMotion);
  const [i, setI] = useState(0);
  const [k, setK] = useState(0); // 0..1 within the clip
  const [paused, setPaused] = useState(false);
  const start = useRef(0);
  const brush = locale === 'zh' ? titleZh : titleEn;

  useEffect(() => {
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- static finished frame
      setK(1);
      return;
    }
    let raf = 0;
    start.current = performance.now() - k * CLIP_MS;
    const tick = (now: number) => {
      if (paused) {
        start.current = now - k * CLIP_MS;
      } else {
        const v = (now - start.current) / CLIP_MS;
        if (v >= 1) {
          setI((n) => (n + 1) % CLIPS.length);
          setK(0);
          return;
        }
        setK(v);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart per clip / pause toggle
  }, [i, paused, reduced]);

  const c = CLIPS[i];
  const scan = Math.min(Math.max((k - SCAN.start) / (SCAN.end - SCAN.start), 0), 1);
  const ease = 1 - Math.pow(1 - scan, 2.2);
  const prompt = t(`clips.${c.id}.prompt`);
  const typed = prompt.slice(0, Math.round(prompt.length * Math.min(k / 0.3, 1)));
  const zoom = 1.08 - k * 0.08;

  return (
    <section
      aria-labelledby="hero-title"
      className="relative h-[100svh] min-h-[640px] overflow-hidden bg-black text-white"
    >
      {/* ---------- the reel ---------- */}
      <div
        key={c.id}
        className="reel-in absolute inset-0"
        style={{ transform: `scale(${zoom})` }}
        aria-hidden
      >
        <Image src={c.a} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ clipPath: `inset(${(1 - ease) * 100}% 0 0 0)` }}>
          <Image src={c.b} alt="" fill sizes="100vw" className="object-cover" />
        </div>
        {scan > 0 && scan < 1 && (
          <>
            <span
              className="absolute inset-x-0 h-[2px] bg-[#9cc8ff] shadow-[0_0_24px_6px_rgba(94,168,255,0.85)]"
              style={{ top: `${(1 - ease) * 100}%` }}
            />
            <span
              className="absolute inset-x-0 h-40 bg-gradient-to-b from-[rgba(94,168,255,0.22)] to-transparent"
              style={{ top: `${(1 - ease) * 100}%` }}
            />
          </>
        )}
      </div>
      {/* preload the next clip */}
      <div className="hidden">
        <Image src={CLIPS[(i + 1) % 3].a} alt="" width={8} height={8} />
        <Image src={CLIPS[(i + 1) % 3].b} alt="" width={8} height={8} />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,rgba(0,0,0,0.15),rgba(0,0,0,0.65))]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent"
      />

      {/* ---------- centre: title + input pill ---------- */}
      <div className="relative flex h-full flex-col items-center justify-center px-4 pt-[var(--header-h)] text-center">
        <h1
          id="hero-title"
          className={`${brush.className} text-balance text-[clamp(2.6rem,6vw,5.6rem)] leading-[1.05] [text-shadow:0_4px_40px_rgba(0,0,0,0.6)] ${locale === 'zh' ? 'tracking-[0.04em]' : 'font-black uppercase'}`}
        >
          {t('title')}
        </h1>
        <p className="mt-4 text-lg text-white/85 [text-shadow:0_2px_20px_rgba(0,0,0,0.7)] md:text-2xl">
          {t('subtitle')}
        </p>

        <div className="mt-10 flex w-full max-w-[880px] items-center gap-3 rounded-full border border-white/25 bg-[rgba(20,24,34,0.45)] p-2 pl-2.5 backdrop-blur-xl md:gap-4 md:p-2.5 md:pl-3">
          <span className="relative h-11 w-16 shrink-0 overflow-hidden rounded-full border border-white/20 md:h-14 md:w-20">
            <Image
              key={c.id}
              src={c.a.replace('.webp', '-thumb.webp')}
              alt={t(`clips.${c.id}.inputAlt`)}
              fill
              sizes="80px"
              className="object-cover"
            />
          </span>
          <span aria-hidden className="h-6 w-px shrink-0 bg-white/30" />
          <p
            className="min-w-0 flex-1 truncate text-left text-sm text-white/90 md:text-[17px]"
            aria-live="polite"
          >
            {reduced ? prompt : typed}
            {!reduced && k < 0.32 && (
              <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-white" />
            )}
          </p>
          <a
            href={appUrl({ source: 'www' })}
            className="shrink-0 rounded-full bg-black/55 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black/75 md:px-7 md:py-3.5 md:text-lg"
          >
            {t('cta')}
          </a>
        </div>
      </div>

      {/* ---------- clip index ---------- */}
      <div className="absolute inset-x-0 bottom-6 flex justify-center px-4 md:bottom-10">
        <div
          className="flex w-full max-w-[880px] gap-3"
          role="tablist"
          aria-label={t('clipsLabel')}
        >
          {CLIPS.map((x, n) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={n === i}
              onClick={() => {
                setI(n);
                setK(0);
              }}
              className="group flex-1 text-left"
            >
              <span className="block h-[3px] overflow-hidden rounded-full bg-white/20">
                <span
                  className="block h-full bg-white"
                  style={{ width: `${n < i ? 100 : n === i ? k * 100 : 0}%` }}
                />
              </span>
              <span
                className={`mt-2 block truncate text-xs md:text-sm ${n === i ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}
              >
                {t(`clips.${x.id}.label`)}
              </span>
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? t('play') : t('pause')}
        className="absolute bottom-6 right-5 grid size-9 place-items-center rounded-full border border-white/25 bg-black/30 text-white/85 backdrop-blur md:bottom-10 md:right-8"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
          {paused ? <path d="M3 1.5v11l9-5.5z" /> : <path d="M3 1.5h3v11H3zM8 1.5h3v11H8z" />}
        </svg>
      </button>
    </section>
  );
}
