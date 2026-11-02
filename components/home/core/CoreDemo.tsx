'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePerfStore } from '@/lib/perf';

export type CoreMode = 'image' | 'text';

/* Timeline (ms). One loop shows input → upload/typing → generate → result. */
export const LOOP = 10500;
const T = {
  inputStart: 300,
  inputEnd: 1700,
  uploadEnd: 2700,
  toButton: 3300,
  press: 3500,
  genEnd: 7600,
};
const clamp = (x: number) => Math.min(Math.max(x, 0), 1);
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const RESULT: Record<CoreMode, string> = {
  image: '/core/corgi-model-cut.webp',
  text: '/core/robot-model-cut.webp',
};

type Pt = { x: number; y: number };

/**
 * Live-looking workspace: on the left the input arrives (a photo dragged in and
 * uploaded, or a prompt typed), the cursor presses Generate, and on the right the
 * model is built behind a rising scan line — hologram wireframe above, finished
 * PBR render below.
 */
export function CoreDemo({ mode, t }: { mode: CoreMode; t: number }) {
  const i18n = useTranslations('home.core.demo');
  const body = useRef<HTMLDivElement>(null);
  const drop = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLSpanElement>(null);
  const [geo, setGeo] = useState<{ start: Pt; drop: Pt; dropW: number; btn: Pt } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      if (!body.current || !drop.current || !button.current) return;
      const b = body.current.getBoundingClientRect();
      const d = drop.current.getBoundingClientRect();
      const k = button.current.getBoundingClientRect();
      setGeo({
        start: { x: b.width * 0.72, y: b.height * 0.72 },
        drop: { x: d.left - b.left + d.width / 2, y: d.top - b.top + d.height / 2 },
        dropW: d.width,
        btn: { x: k.left - b.left + k.width * 0.6, y: k.top - b.top + k.height * 0.6 },
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (body.current) ro.observe(body.current);
    return () => ro.disconnect();
  }, [mode]);

  const prompt = i18n('prompt');
  const inputP = ease(clamp((t - T.inputStart) / (T.inputEnd - T.inputStart)));
  const uploadP = clamp((t - T.inputEnd) / (T.uploadEnd - T.inputEnd));
  const toBtn = ease(clamp((t - T.uploadEnd) / (T.toButton - T.uploadEnd)));
  const pressed = t >= T.toButton && t < T.press + 120;
  const genP = ease(clamp((t - T.press) / (T.genEnd - T.press)));
  const generating = t >= T.press && t < T.genEnd;
  const done = t >= T.genEnd;
  const typed =
    mode === 'text'
      ? prompt.slice(
          0,
          Math.round(prompt.length * clamp((t - T.inputStart) / (T.uploadEnd - T.inputStart))),
        )
      : '';

  // Cursor rides with the photo (image) or waits by the prompt (text), then goes to Generate.
  let cursor: Pt | null = null;
  let photo: { x: number; y: number; s: number; r: number } | null = null;
  if (geo) {
    const from =
      mode === 'image'
        ? { x: lerp(geo.start.x, geo.drop.x, inputP), y: lerp(geo.start.y, geo.drop.y, inputP) }
        : { x: geo.drop.x + geo.dropW * 0.3, y: geo.drop.y + 30 };
    cursor =
      t < T.uploadEnd
        ? from
        : {
            x: lerp(geo.drop.x + 20, geo.btn.x, toBtn),
            y: lerp(geo.drop.y + 30, geo.btn.y, toBtn),
          };
    if (mode === 'image')
      photo = {
        x: lerp(geo.start.x, geo.drop.x, inputP),
        y: lerp(geo.start.y, geo.drop.y, inputP),
        s: lerp(0.62, 1, inputP),
        r: lerp(-9, 0, inputP),
      };
  }

  const status = done
    ? i18n('done')
    : generating
      ? i18n('generating', { p: Math.round(genP * 100) })
      : mode === 'image' && uploadP > 0 && uploadP < 1
        ? i18n('uploading')
        : i18n('idle');
  const reveal = genP * 100;

  return (
    <div
      className="overflow-hidden rounded-xl border border-line-strong bg-[#050913] shadow-[0_30px_100px_-40px_rgba(56,116,255,0.5)]"
      aria-hidden
    >
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#0b1220] px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
        </span>
        <span className="rounded bg-white/5 px-3 py-1 font-mono text-[11px] text-white/45">
          app.lux3d / workspace
        </span>
      </div>

      <div
        ref={body}
        className="relative grid min-h-[440px] grid-cols-[minmax(0,1fr)] sm:grid-cols-[230px_minmax(0,1fr)] md:min-h-[520px]"
      >
        {/* ---------- input panel ---------- */}
        <div className="flex flex-col gap-4 border-b border-white/10 bg-[#0b1220] p-4 text-xs text-white/60 sm:border-b-0 sm:border-r">
          <p className="font-medium text-white/80">
            {mode === 'image' ? i18n('imageLabel') : i18n('promptLabel')}
          </p>
          <div
            ref={drop}
            className={`relative rounded-lg border border-dashed p-3 ${mode === 'image' ? 'aspect-[4/5]' : 'min-h-36'} ${
              inputP > 0.85 && mode === 'image' ? 'border-[#4d8dff]' : 'border-white/20'
            } bg-white/[0.03]`}
          >
            {mode === 'image' ? (
              inputP < 0.1 && (
                <span className="absolute inset-0 grid place-items-center px-4 text-center text-white/35">
                  {i18n('dropHint')}
                </span>
              )
            ) : (
              <p className="leading-relaxed text-white/90">
                {typed}
                {t < T.toButton && (
                  <span className="ml-px inline-block h-3.5 w-px translate-y-0.5 animate-pulse bg-white" />
                )}
                {!typed && <span className="text-white/35">{i18n('promptHint')}</span>}
              </p>
            )}
          </div>
          {mode === 'image' && (
            <div className={`transition-opacity ${uploadP > 0 ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex justify-between">
                <span>{uploadP < 1 ? i18n('uploading') : i18n('uploaded')}</span>
                <span className="font-mono">{Math.round(uploadP * 100)}%</span>
              </div>
              <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full rounded-full bg-[#4d8dff]"
                  style={{ width: `${uploadP * 100}%` }}
                />
              </span>
            </div>
          )}
          <div className="mt-auto flex flex-col gap-3">
            <Setting label={i18n('model')} options={[i18n('standard'), i18n('turbo')]} />
            <Setting label={i18n('output')} options={['Mesh', 'PBR', '3DGS']} active={1} />
            <span
              ref={button}
              className={`rounded-full py-2 text-center text-sm font-medium text-white transition-transform ${
                pressed ? 'scale-95 bg-[#3a73e0]' : 'bg-[#4d8dff]'
              } ${generating ? 'opacity-60' : ''}`}
            >
              {generating ? i18n('generatingShort') : i18n('generate')}
            </span>
          </div>
        </div>

        {/* ---------- viewport ---------- */}
        <div className="relative min-h-[340px] overflow-hidden bg-[radial-gradient(60%_55%_at_50%_55%,#0d1a33,#03060d)]">
          <div className="absolute inset-x-0 bottom-0 h-1/3 [background:repeating-linear-gradient(90deg,rgba(120,170,255,0.08)_0_1px,transparent_1px_48px)] [mask-image:linear-gradient(transparent,#000)]" />
          <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
            <span
              className={`size-1.5 rounded-full ${done ? 'bg-[#5be3a0]' : generating ? 'animate-pulse bg-[#4d8dff]' : 'bg-white/30'}`}
            />
            {status}
          </span>

          <div className="absolute left-1/2 top-[7%] aspect-square h-[86%] max-w-[94%] -translate-x-1/2">
            {/* hologram (not yet generated): above the scan line */}
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={
                {
                  opacity: t >= T.press ? 1 : 0,
                  clipPath: `inset(0 0 ${reveal}% 0)`,
                  '--core-mask': `url(${RESULT[mode]})`,
                } as React.CSSProperties
              }
            >
              <Image
                src={RESULT[mode]}
                alt=""
                fill
                sizes="600px"
                className="object-contain opacity-70 [filter:grayscale(1)_brightness(1.25)_contrast(1.35)_sepia(1)_hue-rotate(180deg)_saturate(3.2)]"
              />
              <div className="absolute inset-0 mix-blend-color-dodge [mask-image:var(--core-mask)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [background:repeating-linear-gradient(0deg,rgba(150,200,255,0.9)_0_1px,transparent_1px_12px),repeating-linear-gradient(90deg,rgba(150,200,255,0.9)_0_1px,transparent_1px_12px)]" />
            </div>
            {/* finished model: below the scan line */}
            <div
              className="absolute inset-0 mix-blend-lighten"
              style={{ clipPath: `inset(${100 - reveal}% 0 0 0)` }}
            >
              <Image
                src={RESULT[mode]}
                alt=""
                fill
                sizes="600px"
                className={`object-contain ${done ? 'core-float' : ''}`}
              />
            </div>
            {/* scan line + particles */}
            {generating && (
              <>
                <span
                  className="absolute inset-x-[-6%] h-[2px] bg-[#7fb0ff] shadow-[0_0_18px_4px_rgba(77,141,255,0.8)]"
                  style={{ bottom: `${reveal}%` }}
                />
                <span
                  className="absolute inset-x-[-6%] h-16 bg-gradient-to-t from-[rgba(77,141,255,0.25)] to-transparent"
                  style={{ bottom: `${reveal}%` }}
                />
                {Array.from({ length: 14 }, (_, k) => (
                  <span
                    key={k}
                    className="core-particle absolute size-1.5 rounded-full bg-[#9cc2ff] blur-[1px]"
                    style={{
                      left: `${(k * 37) % 100}%`,
                      bottom: `calc(${reveal}% + ${8 + ((k * 13) % 40)}px)`,
                      animationDelay: `${(k % 7) * 0.15}s`,
                    }}
                  />
                ))}
              </>
            )}
          </div>

          {!generating && !done && (
            <span className="absolute inset-0 grid place-items-center text-sm text-white/30">
              {i18n('empty')}
            </span>
          )}

          <div
            className={`absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center gap-2 transition-all duration-500 ${
              done ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            <span className="rounded-full bg-black/55 px-3 py-1.5 font-mono text-[11px] text-white/80 backdrop-blur">
              {mode === 'image' ? '12.4k' : '9.8k'} {i18n('faces')}
            </span>
            <span className="rounded-full bg-black/55 px-3 py-1.5 font-mono text-[11px] text-white/80 backdrop-blur">
              PBR · 4K
            </span>
            <span className="ml-auto rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-[#07112a]">
              {i18n('download')}
            </span>
          </div>
        </div>

        {/* floating photo + cursor (above everything) */}
        {photo && geo && t >= T.inputStart && (
          <div
            className="pointer-events-none absolute z-20 overflow-hidden rounded-md shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
            style={{
              width: geo.dropW - 24,
              aspectRatio: '4 / 5',
              left: photo.x,
              top: photo.y,
              transform: `translate(-50%,-50%) scale(${photo.s}) rotate(${photo.r}deg)`,
            }}
          >
            <Image
              src="/core/corgi-photo.webp"
              alt=""
              fill
              sizes="220px"
              className="object-cover"
            />
          </div>
        )}
        {cursor && t < T.genEnd && (
          <svg
            className="pointer-events-none absolute z-30 drop-shadow"
            style={{ left: cursor.x, top: cursor.y }}
            width="22"
            height="22"
            viewBox="0 0 24 24"
          >
            <path
              d="M4 2l15 9-6.5 1.5L16 20l-3 1.5-3.5-7.5L4 18z"
              fill="#fff"
              stroke="#000"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
}

function Setting({
  label,
  options,
  active = 0,
}: {
  label: string;
  options: string[];
  active?: number;
}) {
  return (
    <div>
      <p className="mb-1.5 text-white/40">{label}</p>
      <div className="flex rounded-full bg-white/5 p-0.5">
        {options.map((o, i) => (
          <span
            key={o}
            className={`flex-1 rounded-full py-1 text-center ${i === active ? 'bg-white/10 text-white' : 'text-white/40'}`}
          >
            {o}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Drives the demo clock: plays only while visible; calls onLoop at the end of each loop. */
export function useDemoClock(onLoop: () => void) {
  const reduced = usePerfStore((s) => s.reducedMotion);
  const [t, setT] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useRef(true);
  const acc = useRef(0);
  const loop = useRef(onLoop);
  useEffect(() => {
    loop.current = onLoop;
  }, [onLoop]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- static finished frame for reduced motion
      setT(T.genEnd + 1);
      return;
    }
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      if (visible.current) {
        acc.current += dt;
        if (acc.current >= LOOP) {
          acc.current = 0;
          loop.current();
        }
        setT(acc.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);
  const restart = useCallback(() => {
    acc.current = 0;
    if (!reduced) setT(0);
  }, [reduced]);
  return { t, ref, restart };
}
