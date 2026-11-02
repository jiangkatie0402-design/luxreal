'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { href } from '@/config/pages';
import { appUrl } from '@/config/site';
import { Link } from '@/i18n/navigation';

type Mode = 'image' | 'text';
const MODES: Mode[] = ['image', 'text'];
const MODEL: Record<Mode, string> = {
  image: '/core/corgi-model-cut.webp',
  text: '/core/robot-model-cut.webp',
};
const FACES: Record<Mode, number> = { image: 12400, text: 9800 };
const PHOTO = '/core/corgi-photo.webp';
const STEPS = ['input', 'views', 'geometry', 'material', 'export'] as const;
const CHANNELS = [
  { id: 'albedo', filter: 'brightness(1.15) contrast(0.8)' },
  { id: 'normal', filter: 'grayscale(1) sepia(1) hue-rotate(195deg) saturate(3.5) contrast(1.2)' },
  { id: 'roughness', filter: 'grayscale(1) invert(0.85) contrast(1.25)' },
  { id: 'metalness', filter: 'grayscale(1) contrast(3) brightness(0.6)' },
] as const;

const gridOverModel =
  'absolute inset-0 [mask-image:var(--m)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [background:radial-gradient(circle,rgba(220,240,255,1)_1.2px,transparent_1.8px)_0_0/14px_14px,repeating-linear-gradient(0deg,rgba(120,180,255,0.75)_0_1px,transparent_1px_14px),repeating-linear-gradient(90deg,rgba(120,180,255,0.75)_0_1px,transparent_1px_14px)]';

const ICONS: Record<string, ReactNode> = {
  image: <path d="M4 7h3l2-2h6l2 2h3v12H4zM12 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />,
  text: <path d="M5 6h14M5 11h14M5 16h8M17 14l3 3-3 3" />,
  a: <path d="M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z" />,
  b: <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9zM4 7.5 12 12l8-4.5M12 12v9" />,
  c: <path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" />,
};
const Icon = ({ name, className = '' }: { name: string; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    {ICONS[name]}
  </svg>
);

/**
 * Core capabilities, scroll-driven. The section is tall; a pinned two-column view
 * shows a stage on the left (one object generated in five steps, driven by
 * scroll) and the capability copy on the right, switchable between image-to-3D
 * and text-to-3D.
 */
export function ImageTo3DExplainer() {
  const t = useTranslations('home.explain');
  const [mode, setMode] = useState<Mode>('image');
  const [active, setActive] = useState(0);
  const [channel, setChannel] = useState(0);
  const [typed, setTyped] = useState(0);
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const faces = useRef<HTMLSpanElement>(null);
  const modeRef = useRef(mode);
  const id = useId();

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = Math.max(r.height - window.innerHeight, 1);
      const f = Math.min(Math.max(-r.top / total, 0), 0.9999) * STEPS.length;
      const idx = Math.floor(f);
      const p = f - idx;
      setActive(idx);
      stage.current?.style.setProperty('--p', p.toFixed(3));
      if (faces.current)
        faces.current.textContent = Math.round(
          (idx > 2 ? 1 : idx === 2 ? p : 0) * FACES[modeRef.current],
        ).toLocaleString();
      if (idx === 3) setChannel(Math.min(CHANNELS.length - 1, Math.floor(p * CHANNELS.length)));
      if (idx === 0) setTyped(Math.min(p / 0.8, 1));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const model = MODEL[mode];
  const prompt = t('stage.prompt');
  const show = (i: number) =>
    `transition-opacity duration-500 ${active === i ? 'opacity-100' : 'pointer-events-none opacity-0'}`;
  const pickMode = (m: Mode) => {
    setMode(m);
    if (faces.current && active < 2) faces.current.textContent = '0';
  };

  return (
    <section
      ref={section}
      aria-labelledby="explain-title"
      className="relative h-[460svh] bg-[#03060d] text-white"
    >
      <div className="sticky top-[var(--header-h)] h-[calc(100svh-var(--header-h))] overflow-hidden">
        <div className="mx-auto grid h-full w-full max-w-[1400px] grid-rows-[minmax(0,1fr)_auto] gap-4 px-4 py-4 md:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:grid-rows-1 lg:items-center lg:gap-16 lg:py-10">
          {/* ---------- stage ---------- */}
          <div
            ref={stage}
            id={`${id}-panel`}
            role="tabpanel"
            aria-labelledby={`${id}-${mode}`}
            style={{ '--m': `url(${model})`, '--p': 0 } as CSSProperties}
            className="relative h-full min-h-0 overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(60%_55%_at_50%_50%,#0d1a33,#04070e)] lg:h-[min(100%,760px)]"
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-60 [background:radial-gradient(circle,rgba(170,210,255,0.6)_1px,transparent_1.6px)_0_0/32px_32px,repeating-linear-gradient(0deg,rgba(110,160,255,0.12)_0_1px,transparent_1px_32px),repeating-linear-gradient(90deg,rgba(110,160,255,0.12)_0_1px,transparent_1px_32px)] [mask-image:radial-gradient(70%_70%_at_50%_50%,#000,transparent)]"
            />

            {/* 1 · input: photo scan (image) or prompt typing (text) */}
            <div className={`absolute inset-0 grid place-items-center ${show(0)}`}>
              {mode === 'image' ? (
                <div className="relative aspect-[4/5] h-[72%] overflow-hidden rounded-2xl border border-white/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
                  <Image src={PHOTO} alt="" fill sizes="400px" className="object-cover" />
                  <span
                    className="absolute inset-x-0 h-[2px] bg-[#7fb6ff] shadow-[0_0_14px_3px_rgba(94,168,255,0.8)]"
                    style={{ top: 'calc(var(--p) * 100%)' }}
                  />
                  <div
                    className="absolute bottom-[4%] left-[10%] right-[10%] top-[10%] rounded-lg border-2 border-[#5fe0ff]"
                    style={{ opacity: 'clamp(0, calc((var(--p) - 0.45) * 4), 1)' } as CSSProperties}
                  >
                    <span className="absolute -top-7 left-0 rounded-md bg-[#5fe0ff] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#03111f]">
                      {t('stage.subject')} · 98%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-[78%] max-w-[460px]">
                  <div className="rounded-2xl border border-white/15 bg-[#0b1322]/90 p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
                    <p className="text-xs text-white/45">{t('stage.promptLabel')}</p>
                    <p className="mt-2 min-h-[5.5em] text-lg leading-relaxed text-white">
                      {prompt.slice(0, Math.round(prompt.length * typed))}
                      <span className="ml-0.5 inline-block h-5 w-0.5 translate-y-1 animate-pulse bg-white" />
                    </p>
                  </div>
                  <div
                    className="mt-3 flex flex-wrap gap-2"
                    style={{ opacity: 'clamp(0, calc((var(--p) - 0.6) * 4), 1)' } as CSSProperties}
                  >
                    {(t.raw('stage.parsed') as string[]).map((c) => (
                      <span
                        key={c}
                        className="rounded-full border border-[#5fe0ff]/60 bg-[#5fe0ff]/10 px-3 py-1 text-xs text-[#9fefff]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2 · multi-view inference */}
            <div
              className={`absolute inset-0 grid place-items-center [perspective:900px] ${show(1)}`}
            >
              {[
                { k: 'front', tf: 'translate(-106%, -106%) rotateY(14deg)', img: '' },
                { k: 'side', tf: 'translate(6%, -106%) rotateY(-14deg)', img: 'scale-x-[-1]' },
                {
                  k: 'back',
                  tf: 'translate(-106%, 6%) rotateY(14deg)',
                  img: 'scale-x-[-1] brightness-75',
                },
                { k: 'top', tf: 'translate(6%, 6%) rotateX(24deg)', img: '' },
              ].map((v, i) => (
                <div
                  key={v.k}
                  className="absolute left-1/2 top-1/2 aspect-square w-[min(38%,40vh)] overflow-hidden rounded-xl border border-[#5ea8ff]/50 bg-[#0b1630]/80"
                  style={
                    {
                      transform: v.tf,
                      opacity: `clamp(0, calc((var(--p) * 5) - ${i}), 1)`,
                    } as CSSProperties
                  }
                >
                  <Image
                    src={model}
                    alt=""
                    fill
                    sizes="260px"
                    className={`object-contain p-3 [filter:grayscale(1)_sepia(1)_hue-rotate(185deg)_saturate(2.6)_brightness(1.1)] ${v.img}`}
                  />
                  <span className="absolute bottom-1.5 left-2 rounded bg-black/50 px-1.5 py-0.5 font-mono text-[10px] text-[#9cc8ff]">
                    {t(`stage.view.${v.k}`)}
                  </span>
                </div>
              ))}
            </div>

            {/* 3 · geometry */}
            <div className={`absolute inset-[10%] ${show(2)}`}>
              <div
                className="absolute inset-0"
                style={{ clipPath: 'inset(0 0 calc(var(--p) * 100%) 0)' }}
              >
                <div className={gridOverModel} />
              </div>
              <div
                className="absolute inset-0"
                style={{ clipPath: 'inset(calc(100% - var(--p) * 100%) 0 0 0)' }}
              >
                <Image
                  src={model}
                  alt=""
                  fill
                  sizes="600px"
                  className="object-contain [filter:grayscale(1)_brightness(1.55)_contrast(0.75)]"
                />
                <div className={`${gridOverModel} opacity-25`} />
              </div>
              <span
                className="absolute inset-x-[-8%] h-[2px] bg-[#7fb6ff] shadow-[0_0_16px_4px_rgba(94,168,255,0.8)]"
                style={{ bottom: 'calc(var(--p) * 100%)' }}
              />
            </div>

            {/* 4 · material */}
            <div className={`absolute inset-[10%] ${show(3)}`}>
              <Image
                src={model}
                alt=""
                fill
                sizes="600px"
                className="object-contain [filter:grayscale(1)_brightness(1.55)_contrast(0.75)]"
              />
              <div
                className="absolute inset-0"
                style={{ clipPath: 'inset(0 calc(100% - var(--p) * 100%) 0 0)' }}
              >
                <Image src={model} alt="" fill sizes="600px" className="object-contain" />
              </div>
              <span
                className="absolute inset-y-[-6%] w-[2px] bg-white/90 shadow-[0_0_14px_2px_rgba(255,255,255,0.6)]"
                style={{ left: 'calc(var(--p) * 100%)' }}
              />
            </div>
            <div
              className={`absolute inset-x-4 bottom-[5.5rem] flex flex-wrap justify-center gap-2 ${show(3)}`}
            >
              {CHANNELS.map((c, i) => (
                <span
                  key={c.id}
                  className={`flex items-center gap-2 rounded-xl border p-1.5 pr-3 text-xs backdrop-blur-md transition-colors ${
                    i <= channel
                      ? 'border-[#5ea8ff] bg-[#0b1630]/80 text-white'
                      : 'border-white/10 bg-black/40 text-white/45'
                  }`}
                >
                  <span className="relative size-8 overflow-hidden rounded-md bg-black/40">
                    <Image
                      src={model}
                      alt=""
                      fill
                      sizes="32px"
                      className="object-contain"
                      style={{ filter: c.filter }}
                    />
                  </span>
                  {t(`stage.channel.${c.id}`)}
                </span>
              ))}
            </div>

            {/* 5 · export */}
            <div className={`absolute inset-[8%] ${show(4)}`}>
              <Image src={model} alt="" fill sizes="600px" className="core-float object-contain" />
              {['GLB', 'FBX', 'USDZ', 'STL', 'OBJ'].map((f, i) => (
                <span
                  key={f}
                  className="absolute rounded-full border border-white/15 bg-[#0b1630]/85 px-3 py-1.5 font-mono text-xs text-white backdrop-blur-md"
                  style={
                    {
                      left: ['2%', '76%', '0%', '80%', '40%'][i],
                      top: ['10%', '14%', '62%', '58%', '-4%'][i],
                      opacity: `clamp(0, calc(var(--p) * 6 - ${i}), 1)`,
                    } as CSSProperties
                  }
                >
                  .{f.toLowerCase()}
                </span>
              ))}
            </div>

            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white/85 backdrop-blur-md">
              <span
                className={`size-1.5 rounded-full ${active === 4 ? 'bg-[#5be3a0]' : 'animate-pulse bg-[#5ea8ff]'}`}
              />
              <span className="font-mono text-white/55">0{active + 1}/05</span>
              {t(`steps.${mode}.${active}`)}
            </div>
            <div className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1.5 font-mono text-xs text-white/70 backdrop-blur-md">
              <span ref={faces}>0</span> {t('stage.faces')}
            </div>
            {/* generation progress, follows scroll */}
            <div className="absolute inset-x-5 bottom-5 z-10 rounded-2xl bg-[rgba(4,8,18,0.7)] px-4 py-3 backdrop-blur-md md:inset-x-6 md:bottom-6">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>{t('progress')}</span>
                <span className="font-mono text-white/80">{t(`steps.${mode}.${active}`)}</span>
              </div>
              <div className="mt-2 grid grid-cols-5 gap-1.5">
                {STEPS.map((s, i) => (
                  <span
                    key={s}
                    className={`h-1 rounded-full transition-colors duration-500 ${i <= active ? 'bg-[#5ea8ff]' : 'bg-white/10'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ---------- copy ---------- */}
          <div className="min-w-0 lg:max-w-[520px]">
            <p className="hidden text-sm font-medium tracking-wide text-[#5ea8ff] lg:block">
              {t('eyebrow')}
            </p>
            <div
              role="tablist"
              aria-label={t('eyebrow')}
              className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1 lg:mt-5"
              onKeyDown={(e) => {
                if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                const n = mode === 'image' ? 'text' : 'image';
                pickMode(n);
                document.getElementById(`${id}-${n}`)?.focus();
              }}
            >
              {MODES.map((m) => (
                <button
                  key={m}
                  id={`${id}-${m}`}
                  role="tab"
                  type="button"
                  aria-selected={mode === m}
                  aria-controls={`${id}-panel`}
                  tabIndex={mode === m ? 0 : -1}
                  onClick={() => pickMode(m)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors md:px-5 ${
                    mode === m
                      ? 'bg-white font-medium text-[#07112a] shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Icon name={m} className={mode === m ? 'text-[#2f6bff]' : ''} />
                  {t(`tabs.${m}`)}
                </button>
              ))}
            </div>

            <h2
              id="explain-title"
              key={`h-${mode}`}
              className="story-in mt-5 text-balance font-display text-[1.7rem] font-bold leading-[1.15] tracking-tight md:text-[2.6rem] lg:mt-7 lg:text-[3rem]"
            >
              {t(`${mode}.title`)}
            </h2>
            <p
              key={`d-${mode}`}
              className="story-in mt-3 hidden text-pretty text-base leading-relaxed text-white/60 sm:block md:text-lg lg:mt-4"
            >
              {t(`${mode}.desc`)}
            </p>

            <ul className="mt-6 hidden gap-2.5 lg:grid">
              {(['a', 'b', 'c'] as const).map((k) => (
                <li
                  key={`${mode}-${k}`}
                  className="story-in flex items-center gap-3.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#4d8dff]/15 text-[#7fb6ff]">
                    <Icon name={k} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-medium text-white/90">
                      {t(`${mode}.points.${k}.title`)}
                    </span>
                    <span className="block text-[13px] text-white/50">
                      {t(`${mode}.points.${k}.desc`)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 lg:mt-8">
              <a
                href={appUrl({ mode, source: 'www' })}
                className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-[linear-gradient(135deg,#5b9bff,#3a6ff0)] pl-6 pr-2 text-[15px] font-medium text-white shadow-[0_10px_30px_-10px_rgba(77,141,255,0.9)] transition-transform hover:scale-[1.02] md:h-14 md:text-base"
              >
                {t(`${mode}.cta`)}
                <span className="grid size-8 place-items-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5 md:size-10">
                  →
                </span>
              </a>
              <Link
                href={href('developers')}
                className="text-sm text-white/65 underline-offset-4 hover:text-white hover:underline"
              >
                {t('secondary')} →
              </Link>
            </div>
            <p className="mt-3 hidden text-xs text-white/35 sm:block">{t('note')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
