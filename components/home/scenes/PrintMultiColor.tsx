'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCycle } from './useCycle';

const FILAMENTS = [
  { c: '#d98a3d', pct: 41 },
  { c: '#f3ead8', pct: 34 },
  { c: '#a8552a', pct: 15 },
  { c: '#1d1d1f', pct: 10 },
];

/** Multi-color printing: the same model as a single-color print vs. mapped to 4 filaments. */
export function PrintMultiColor() {
  const t = useTranslations('home.scenes.print.multi');
  const [mode, pick] = useCycle(2, 2600);
  const multi = mode === 1;
  return (
    <div className="absolute inset-0">
      {/* posterize: flat color regions, like discrete filaments */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="lux-filament" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="1.2" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0.11 0.66 0.85 0.95" />
            <feFuncG type="discrete" tableValues="0.11 0.33 0.54 0.92" />
            <feFuncB type="discrete" tableValues="0.12 0.16 0.24 0.85" />
          </feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </svg>
      <div className="absolute inset-x-[12%] bottom-[20%] top-[10%]">
        <Image
          src="/scenes/figurine.webp"
          alt=""
          fill
          sizes="420px"
          className={`object-contain transition-opacity duration-700 ${multi ? 'opacity-0' : 'opacity-100'}`}
        />
        <Image
          src="/core/corgi-model-cut.webp"
          alt=""
          fill
          sizes="420px"
          className={`object-contain transition-opacity duration-700 [filter:url(#lux-filament)] ${multi ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      <div
        className="absolute right-3 top-3 flex rounded-full border border-white/10 bg-black/55 p-1 text-xs backdrop-blur-md"
        role="group"
        aria-label={t('label')}
      >
        {(['single', 'multi'] as const).map((m, i) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === i}
            onClick={() => pick(i)}
            className={`rounded-full px-3 py-1 ${mode === i ? 'bg-white text-[#07112a]' : 'text-white/70 hover:text-white'}`}
          >
            {t(m)}
          </button>
        ))}
      </div>
      {/* filament slots */}
      <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-xl bg-black/55 p-2 text-[11px] text-white/75 backdrop-blur-md">
        <span className="px-1">{multi ? t('slotsMulti') : t('slotsSingle')}</span>
        <span className="ml-auto flex gap-1.5">
          {FILAMENTS.map((f, i) => {
            const on = multi || i === 1;
            return (
              <span
                key={f.c}
                className={`flex items-center gap-1 rounded-md border px-1.5 py-1 font-mono transition-opacity ${on ? 'border-white/25 opacity-100' : 'border-white/10 opacity-35'}`}
              >
                <span
                  className="size-3 rounded-full border border-white/30"
                  style={{ background: f.c }}
                />
                {multi ? `${f.pct}%` : i === 1 ? '100%' : '—'}
              </span>
            );
          })}
        </span>
      </div>
    </div>
  );
}
