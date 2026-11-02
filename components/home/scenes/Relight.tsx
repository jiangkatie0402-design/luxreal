'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';
import { useCycle } from './useCycle';

const SRC = '/core/robot-model-cut.webp';
const PRESETS = [
  {
    id: 'neon',
    bg: 'radial-gradient(60% 70% at 20% 30%, rgba(255,60,200,0.55), transparent 60%), radial-gradient(60% 70% at 85% 40%, rgba(40,200,255,0.5), transparent 60%), #07040f',
    light:
      'linear-gradient(90deg, rgba(255,70,210,0.85), transparent 45%, transparent 55%, rgba(50,210,255,0.85))',
    filter: 'brightness(0.75) contrast(1.15) saturate(1.1)',
    blend: 'color-dodge',
  },
  {
    id: 'day',
    bg: 'radial-gradient(70% 70% at 70% 20%, rgba(255,226,170,0.9), transparent 65%), linear-gradient(#bcd6ef, #e9dcc8)',
    light: 'linear-gradient(200deg, rgba(255,236,190,0.7), transparent 60%)',
    filter: 'brightness(1.08) saturate(1.05)',
    blend: 'soft-light',
  },
  {
    id: 'back',
    bg: 'radial-gradient(40% 55% at 50% 45%, rgba(255,190,120,0.95), rgba(120,60,20,0.4) 55%, #050302 80%)',
    light: 'linear-gradient(transparent, transparent)',
    filter:
      'brightness(0.35) contrast(1.3) drop-shadow(0 0 2px rgba(255,200,140,0.95)) drop-shadow(0 0 14px rgba(255,170,90,0.6))',
    blend: 'normal',
  },
] as const;

/** Relight a fixed asset: the PBR materials respond to each lighting setup. */
export function Relight() {
  const t = useTranslations('home.scenes.film.relight');
  const [i, pick] = useCycle(PRESETS.length, 2200);
  const p = PRESETS[i];
  return (
    <div
      className="absolute inset-0 transition-[background] duration-700"
      style={{ background: p.bg }}
    >
      <div className="absolute inset-x-[18%] bottom-[16%] top-[8%]">
        <Image
          src={SRC}
          alt=""
          fill
          sizes="400px"
          className="object-contain transition-[filter] duration-700"
          style={{ filter: p.filter }}
        />
        <div
          className="absolute inset-0 transition-opacity duration-700 [mask-image:var(--m)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
          style={
            { '--m': `url(${SRC})`, background: p.light, mixBlendMode: p.blend } as CSSProperties
          }
        />
      </div>
      <div
        role="group"
        aria-label={t('label')}
        className="absolute right-3 top-3 flex rounded-full border border-white/10 bg-black/55 p-1 text-xs backdrop-blur-md"
      >
        {PRESETS.map((x, k) => (
          <button
            key={x.id}
            type="button"
            aria-pressed={i === k}
            onClick={() => pick(k)}
            className={`rounded-full px-3 py-1 ${i === k ? 'bg-white text-[#07112a]' : 'text-white/70 hover:text-white'}`}
          >
            {t(x.id)}
          </button>
        ))}
      </div>
      <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1.5 font-mono text-[11px] text-white/80 backdrop-blur-md">
        {t('note')}
      </span>
    </div>
  );
}
