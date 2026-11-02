'use client';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';
import { appUrl, site } from '@/config/site';
import { QUEUE, type WorldStatus } from './WorldScene';

const WorldScene = dynamic(() => import('./WorldScene'), { ssr: false });

/**
 * Homepage hero: a full-bleed 3D world. In the centre a model is generated on a
 * hologram pedestal, then flies into the island — the world fills piece by piece.
 */
export function WorldHero() {
  const t = useTranslations('home.world');
  const bar = useRef<HTMLSpanElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [s, setS] = useState<WorldStatus | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const onStatus = useCallback((x: WorldStatus) => setS(x), []);

  const current = s && s.index < QUEUE.length ? QUEUE[s.index].id : null;
  const label = !s
    ? t('status.loading')
    : s.phase === 'reset'
      ? t('status.reset')
      : s.phase === 'done'
        ? t('status.done')
        : s.phase === 'fly'
          ? t('status.placing', { name: t(`pieces.${current}`) })
          : t('status.generating', { name: t(`pieces.${current}`) });

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!(site.upload.accept as readonly string[]).includes(f.type))
      return setErr(t('upload.errorType'));
    if (f.size > site.upload.maxBytes) return setErr(t('upload.errorSize'));
    window.location.href = appUrl({ mode: 'image', source: 'www' });
  };

  return (
    <section
      aria-labelledby="hero-title"
      className="relative h-[100svh] min-h-[680px] overflow-hidden bg-[#050a16] text-white"
    >
      <WorldScene onStatus={onStatus} progressEl={bar} />

      {/* legibility scrims */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:linear-gradient(90deg,rgba(5,10,22,0.85)_0%,rgba(5,10,22,0.25)_32%,transparent_50%,rgba(5,10,22,0.25)_68%,rgba(5,10,22,0.8)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#03060d] to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[rgba(5,10,22,0.7)] to-transparent"
      />

      <div className="pointer-events-none relative mx-auto flex h-full max-w-[1600px] flex-col justify-between px-5 pb-8 pt-[calc(var(--header-h)+1.5rem)] md:px-10 lg:flex-row lg:items-center lg:pb-0 lg:pt-0">
        {/* top-left: the title alone, in the empty sky above the world */}
        <h1
          id="hero-title"
          className="absolute left-5 top-[calc(var(--header-h)+6vh)] text-[clamp(1.75rem,2.4vw,2.5rem)] font-medium leading-[1.28] tracking-[-0.01em] md:left-10 [text-shadow:0_2px_20px_rgba(0,0,0,0.65)]"
        >
          {t('titleA')}
          <span className="block text-[#8fb8ff]">{t('titleB')}</span>
        </h1>
        <span aria-hidden className="lg:flex-1" />

        {/* right: live status */}
        <div className="hidden w-full max-w-[320px] sm:block lg:text-right">
          <p className="hidden text-[15px] leading-relaxed text-white/75 lg:block [text-shadow:0_2px_20px_rgba(0,0,0,0.7)]">
            {t('side')}
          </p>
          <div
            className="mt-6 rounded-2xl border border-white/12 bg-[rgba(8,14,30,0.6)] p-4 text-left backdrop-blur-md"
            aria-live="polite"
          >
            <div className="flex items-center justify-between text-xs text-white/55">
              <span className="flex items-center gap-2">
                <span className="size-1.5 animate-pulse rounded-full bg-[#5ea8ff]" />
                {t('live')}
              </span>
              {s && (
                <span className="font-mono">
                  {t('count', { placed: s.placed, total: s.total })}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm font-medium">{label}</p>
            <span className="mt-3 block h-1 overflow-hidden rounded-full bg-white/10">
              <span ref={bar} className="block h-full w-0 rounded-full bg-[#5ea8ff]" />
            </span>
          </div>
        </div>
      </div>

      {/* bottom: upload */}
      <div className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-2 px-4 md:bottom-10">
        <input
          ref={file}
          type="file"
          accept={site.upload.accept.join(',')}
          className="sr-only"
          onChange={(e) => pick(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => file.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pick(e.dataTransfer.files[0]);
          }}
          className="group flex w-full max-w-[560px] items-center gap-3 rounded-full border border-white/15 bg-[rgba(10,18,36,0.75)] p-2 pl-5 text-left backdrop-blur-xl transition-colors hover:border-white/30"
        >
          <span aria-hidden className="text-xl text-white/70">
            +
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-white/75 md:text-base">
            {t('upload.placeholder')}
          </span>
          <span className="shrink-0 rounded-full bg-[#4d8dff] px-5 py-2.5 text-sm font-medium text-white group-hover:brightness-110">
            {t('upload.cta')} →
          </span>
        </button>
        <p role="alert" className="min-h-4 text-xs text-[#ff9b9b]">
          {err}
        </p>
      </div>
    </section>
  );
}
