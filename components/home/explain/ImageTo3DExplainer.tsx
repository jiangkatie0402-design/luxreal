'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

const PHOTO = '/core/corgi-photo.webp';
const MODEL = '/core/corgi-model-cut.webp';
const STEPS = ['input', 'views', 'geometry', 'material', 'export'] as const;
const CHANNELS = [
  { id: 'albedo', filter: 'brightness(1.15) contrast(0.8)' },
  { id: 'normal', filter: 'grayscale(1) sepia(1) hue-rotate(195deg) saturate(3.5) contrast(1.2)' },
  { id: 'roughness', filter: 'grayscale(1) invert(0.85) contrast(1.25)' },
  { id: 'metalness', filter: 'grayscale(1) contrast(3) brightness(0.6)' },
] as const;
const FACES = 12400;

const maskStyle = { '--m': `url(${MODEL})` } as CSSProperties;
const gridOverModel =
  'absolute inset-0 [mask-image:var(--m)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [background:radial-gradient(circle,rgba(220,240,255,1)_1.2px,transparent_1.8px)_0_0/14px_14px,repeating-linear-gradient(0deg,rgba(120,180,255,0.75)_0_1px,transparent_1px_14px),repeating-linear-gradient(90deg,rgba(120,180,255,0.75)_0_1px,transparent_1px_14px)]';

/**
 * Scroll-driven explainer: a pinned stage on the left shows one object being
 * generated; the right column walks through the five steps of image-to-3D.
 * Scroll position drives the active step and a 0..1 progress within it (--p).
 */
export function ImageTo3DExplainer() {
  const t = useTranslations('home.explain');
  const [active, setActive] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const steps = useRef<(HTMLElement | null)[]>([]);
  const faces = useRef<HTMLSpanElement>(null);
  const [channel, setChannel] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      let idx = 0;
      let p = 0;
      steps.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.6) {
          idx = i;
          p = Math.min(Math.max((vh * 0.6 - r.top) / (r.height * 0.85), 0), 1);
        }
      });
      setActive(idx);
      stage.current?.style.setProperty('--p', p.toFixed(3));
      if (faces.current)
        faces.current.textContent = Math.round(
          (idx > 2 ? 1 : idx === 2 ? p : 0) * FACES,
        ).toLocaleString();
      if (idx === 3) setChannel(Math.min(CHANNELS.length - 1, Math.floor(p * CHANNELS.length)));
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

  const show = (i: number) =>
    `transition-opacity duration-500 ${active === i ? 'opacity-100' : 'pointer-events-none opacity-0'}`;

  return (
    <section aria-labelledby="explain-title" className="relative bg-[#03060d] text-white">
      <div className="mx-auto grid w-full max-w-[1480px] gap-0 px-4 md:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
        {/* ---------- pinned stage ---------- */}
        <div className="sticky top-[var(--header-h)] z-10 h-[46svh] bg-[#03060d] py-3 lg:h-[calc(100svh-var(--header-h))] lg:py-10">
          <div
            ref={stage}
            style={{ ...maskStyle, '--p': 0 } as CSSProperties}
            className="relative mx-auto h-full max-w-[680px] overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(60%_55%_at_50%_50%,#0d1a33,#04070e)]"
          >
            {/* dotted grid backdrop */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-60 [background:radial-gradient(circle,rgba(170,210,255,0.6)_1px,transparent_1.6px)_0_0/32px_32px,repeating-linear-gradient(0deg,rgba(110,160,255,0.12)_0_1px,transparent_1px_32px),repeating-linear-gradient(90deg,rgba(110,160,255,0.12)_0_1px,transparent_1px_32px)] [mask-image:radial-gradient(70%_70%_at_50%_50%,#000,transparent)]"
            />

            {/* 1 · input + subject detection */}
            <div className={`absolute inset-0 grid place-items-center ${show(0)}`}>
              <div className="relative aspect-[4/5] h-[72%] overflow-hidden rounded-2xl border border-white/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
                <Image src={PHOTO} alt="" fill sizes="400px" className="object-cover" />
                <span
                  className="absolute inset-x-0 h-[2px] bg-[#7fb6ff] shadow-[0_0_14px_3px_rgba(94,168,255,0.8)]"
                  style={{ top: 'calc(var(--p) * 100%)' }}
                />
                <div
                  className="absolute left-[10%] right-[10%] top-[10%] bottom-[4%] rounded-lg border-2 border-[#5fe0ff] transition-opacity"
                  style={{ opacity: 'clamp(0, calc((var(--p) - 0.45) * 4), 1)' } as CSSProperties}
                >
                  <span className="absolute -top-7 left-0 rounded-md bg-[#5fe0ff] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#03111f]">
                    {t('stage.subject')} · 98%
                  </span>
                </div>
              </div>
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
                  className="absolute left-1/2 top-1/2 aspect-square w-[min(38%,42vh)] overflow-hidden rounded-xl border border-[#5ea8ff]/50 bg-[#0b1630]/80"
                  style={
                    {
                      transform: v.tf,
                      opacity: `clamp(0, calc((var(--p) * 5) - ${i}), 1)`,
                    } as CSSProperties
                  }
                >
                  <Image
                    src={MODEL}
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

            {/* 3 · geometry: clay below the scan, point grid above */}
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
                  src={MODEL}
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

            {/* 4 · material: sweep from clay to PBR, channel maps */}
            <div className={`absolute inset-[10%] ${show(3)}`}>
              <Image
                src={MODEL}
                alt=""
                fill
                sizes="600px"
                className="object-contain [filter:grayscale(1)_brightness(1.55)_contrast(0.75)]"
              />
              <div
                className="absolute inset-0"
                style={{ clipPath: 'inset(0 calc(100% - var(--p) * 100%) 0 0)' }}
              >
                <Image src={MODEL} alt="" fill sizes="600px" className="object-contain" />
              </div>
              <span
                className="absolute inset-y-[-6%] w-[2px] bg-white/90 shadow-[0_0_14px_2px_rgba(255,255,255,0.6)]"
                style={{ left: 'calc(var(--p) * 100%)' }}
              />
            </div>
            <div
              className={`absolute inset-x-4 bottom-4 flex flex-wrap justify-center gap-2 ${show(3)}`}
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
                      src={MODEL}
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
              <Image src={MODEL} alt="" fill sizes="600px" className="core-float object-contain" />
              {['GLB', 'FBX', 'USDZ', 'STL', 'OBJ'].map((f, i) => (
                <span
                  key={f}
                  className="absolute rounded-full border border-white/15 bg-[#0b1630]/85 px-3 py-1.5 font-mono text-xs text-white backdrop-blur-md transition-all duration-500"
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

            {/* live status */}
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white/85 backdrop-blur-md">
              <span
                className={`size-1.5 rounded-full ${active === 4 ? 'bg-[#5be3a0]' : 'animate-pulse bg-[#5ea8ff]'}`}
              />
              <span className="font-mono text-white/55">0{active + 1}/05</span>
              {t(`steps.${STEPS[active]}.short`)}
            </div>
            <div className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1.5 font-mono text-xs text-white/70 backdrop-blur-md">
              <span ref={faces}>0</span> {t('stage.faces')}
            </div>
          </div>
        </div>

        {/* ---------- steps ---------- */}
        <div className="relative pb-[20svh]">
          <header className="pb-6 pt-16 lg:pt-[18svh]">
            <p className="text-sm font-medium tracking-wide text-accent">{t('eyebrow')}</p>
            <h2
              id="explain-title"
              className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight md:text-[2.75rem] md:leading-[1.15]"
            >
              {t('title')}
            </h2>
            <p className="mt-4 max-w-lg text-pretty text-white/60 md:text-lg">{t('subtitle')}</p>
          </header>
          <ol>
            {STEPS.map((s, i) => (
              <li
                key={s}
                ref={(el) => void (steps.current[i] = el)}
                className={`flex min-h-[75svh] flex-col justify-center border-l py-10 pl-6 transition-colors duration-500 md:pl-8 ${
                  active === i ? 'border-[#5ea8ff]' : 'border-white/10'
                }`}
              >
                <p
                  className={`font-mono text-sm ${active === i ? 'text-[#5ea8ff]' : 'text-white/35'}`}
                >
                  0{i + 1}
                </p>
                <h3
                  className={`mt-2 text-2xl font-semibold tracking-tight transition-colors md:text-3xl ${active === i ? 'text-white' : 'text-white/45'}`}
                >
                  {t(`steps.${s}.title`)}
                </h3>
                <p
                  className={`mt-4 max-w-md text-pretty leading-relaxed transition-colors md:text-[17px] ${active === i ? 'text-white/75' : 'text-white/35'}`}
                >
                  {t(`steps.${s}.desc`)}
                </p>
                <dl
                  className={`mt-6 grid max-w-md gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 text-sm transition-opacity ${active === i ? 'opacity-100' : 'opacity-40'}`}
                >
                  {(t.raw(`steps.${s}.facts`) as [string, string][]).map(([k, v]) => (
                    <div
                      key={k}
                      className="grid grid-cols-[7.5rem_1fr] gap-3 bg-[#060c19] px-4 py-2.5"
                    >
                      <dt className="text-white/45">{k}</dt>
                      <dd className="text-white/85">{v}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ol>
          <p className="pl-6 text-xs text-white/35 md:pl-8">{t('note')}</p>
        </div>
      </div>
    </section>
  );
}
