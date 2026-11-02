'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { usePerfStore } from '@/lib/perf';
import { Artboard } from './Artboard';

const DURATION = 7000;
// Figurine box on the build plate, in % of the stage (printer photo is 3:2).
const BOX = { left: 34, top: 39.7, width: 32, height: 31.4 };
const HEAD_Y = 31;
const LAYERS = 312;

/**
 * Click to print: the figurine grows layer by layer from the build plate, with a
 * glowing extrusion point sweeping each layer and a slicer-style ghost above it.
 */
export function PrintScene() {
  const t = useTranslations('home.scenes.print');
  const reduced = usePerfStore((s) => s.reducedMotion);
  const [state, setState] = useState<'idle' | 'printing' | 'done'>('idle');
  const [p, setP] = useState(0);
  const start = useRef(0);

  useEffect(() => {
    if (state !== 'printing') return;
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced motion: jump to the finished print
      setP(1);
      setState('done');
      return;
    }
    let raf = 0;
    start.current = performance.now();
    const tick = (now: number) => {
      const k = Math.min((now - start.current) / DURATION, 1);
      setP(k);
      if (k < 1) raf = requestAnimationFrame(tick);
      else setState('done');
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state, reduced]);

  const go = () => {
    if (state === 'printing') return;
    setP(0);
    setState('printing');
  };

  const sweep = 0.5 + 0.5 * Math.sin(((p * DURATION) / 1000) * 9);
  const pointX = BOX.left + BOX.width * (0.2 + 0.6 * sweep);
  const pointY = BOX.top + BOX.height * (1 - p);
  const layer = Math.round(p * LAYERS);
  const remain = Math.ceil((1 - p) * 47);

  return (
    <div
      className="cursor-grid absolute inset-0 select-none"
      onClick={go}
      role="button"
      tabIndex={0}
      aria-label={state === 'done' ? t('again') : t('start')}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), go())}
    >
      <Artboard>
        <Image
          src="/scenes/printer.webp"
          alt=""
          fill
          sizes="(min-width:1024px) 1200px, 100vw"
          className="object-cover"
          priority={false}
        />

        {/* contact shadow on the build plate, grows with the print */}
        <span
          className="absolute -translate-x-1/2 rounded-[50%] bg-black/70 blur-[6px]"
          style={{
            left: `${BOX.left + BOX.width / 2}%`,
            top: `${BOX.top + BOX.height - 1.5}%`,
            width: `${BOX.width * 0.62}%`,
            height: '3%',
            opacity: 0.25 + 0.75 * p,
          }}
        />
        {/* slicer ghost of the whole part */}
        <div
          className="absolute"
          style={{
            left: `${BOX.left}%`,
            top: `${BOX.top}%`,
            width: `${BOX.width}%`,
            height: `${BOX.height}%`,
          }}
        >
          <Image
            src="/scenes/figurine.webp"
            alt=""
            fill
            sizes="400px"
            className="object-contain object-bottom opacity-[0.16] [filter:brightness(0.8)_sepia(1)_hue-rotate(180deg)_saturate(4)]"
          />
          {/* printed part, revealed bottom-up */}
          <div className="absolute inset-0" style={{ clipPath: `inset(${(1 - p) * 100}% 0 0 0)` }}>
            <Image
              src="/scenes/figurine.webp"
              alt=""
              fill
              sizes="400px"
              className="object-contain object-bottom"
            />
          </div>
          {state === 'printing' && (
            <span
              className="absolute inset-x-[8%] h-[3px] rounded-full bg-[#ffb36b] opacity-80 shadow-[0_0_14px_3px_rgba(255,160,80,0.7)]"
              style={{ top: `${(1 - p) * 100}%` }}
            />
          )}
        </div>

        {/* extrusion point + filament up to the head */}
        {state === 'printing' && (
          <>
            <span
              className="absolute w-[2px] -translate-x-1/2 bg-gradient-to-b from-white/10 to-[#ffcf9a]"
              style={{ left: `${pointX}%`, top: `${HEAD_Y}%`, height: `${pointY - HEAD_Y}%` }}
            />
            <span
              className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff1df] shadow-[0_0_16px_6px_rgba(255,170,90,0.9)]"
              style={{ left: `${pointX}%`, top: `${pointY}%` }}
            />
          </>
        )}
      </Artboard>

      {/* HUD */}
      <div className="absolute right-3 top-3 rounded-xl border border-white/10 bg-black/55 p-3 text-xs text-white/75 backdrop-blur-md sm:right-6 sm:top-6 sm:w-56 sm:p-3.5">
        <div className="flex items-center justify-between">
          <span className="font-medium text-white">
            {state === 'done' ? t('done') : state === 'printing' ? t('printing') : t('ready')}
          </span>
          <span className="font-mono">{Math.round(p * 100)}%</span>
        </div>
        <span className="mt-2 block h-1 overflow-hidden rounded-full bg-white/10">
          <span
            className="block h-full rounded-full bg-[#ffa65a]"
            style={{ width: `${p * 100}%` }}
          />
        </span>
        <dl className="mt-3 hidden grid-cols-2 sm:grid gap-y-1 font-mono text-[11px]">
          <dt className="text-white/45">{t('layer')}</dt>
          <dd className="text-right">
            {layer} / {LAYERS}
          </dd>
          <dt className="text-white/45">{t('nozzle')}</dt>
          <dd className="text-right">{state === 'printing' ? '210°C' : '—'}</dd>
          <dt className="text-white/45">{t('remaining')}</dt>
          <dd className="text-right">
            {state === 'printing' ? `${remain} min` : state === 'done' ? '0 min' : '47 min'}
          </dd>
        </dl>
        <p className="mt-3 hidden border-t border-white/10 pt-2.5 sm:block text-[11px] text-[#7fe0b0]">
          {t('check')}
        </p>
      </div>

      {state !== 'printing' && (
        <span className="absolute bottom-[14%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#07112a] shadow-lg transition-transform hover:scale-105">
          {state === 'done' ? t('again') : t('start')}
        </span>
      )}
    </div>
  );
}
