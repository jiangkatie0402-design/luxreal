'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCycle } from './useCycle';

const SRC = '/core/corgi-model-cut.webp';
// Parts of the model, as clip regions of the render, and how far each moves apart.
const PARTS = [
  { id: 'head', clip: 'inset(0 0 55% 48%)', move: 'translate(7%, -7%)' },
  {
    id: 'body',
    clip: 'polygon(0 0, 48% 0, 48% 45%, 100% 45%, 100% 70%, 0 70%)',
    move: 'translate(-3%, 0)',
  },
  { id: 'legs', clip: 'inset(70% 0 0 0)', move: 'translate(0, 9%)' },
] as const;

/** Auto Split: the model separates into watertight parts arranged for printing. */
export function PrintSplit() {
  const t = useTranslations('home.scenes.print.split');
  const [mode, pick] = useCycle(2, 2600);
  const split = mode === 1;
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-[10%] bottom-[16%] top-[10%]">
        {PARTS.map((part) => (
          <div
            key={part.id}
            className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-out)]"
            style={{ clipPath: part.clip, transform: split ? part.move : 'none' }}
          >
            <Image
              src={SRC}
              alt=""
              fill
              sizes="420px"
              className={`object-contain transition-[filter] duration-700 ${split ? '[filter:grayscale(1)_brightness(1.25)]' : ''}`}
            />
          </div>
        ))}
      </div>
      {split && (
        <div className="pointer-events-none absolute inset-x-[10%] bottom-[16%] top-[10%]">
          <span className="absolute right-[6%] top-[4%] rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white/80">
            #1
          </span>
          <span className="absolute left-[18%] top-[42%] rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white/80">
            #2
          </span>
          <span className="absolute bottom-[-4%] left-[40%] rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white/80">
            #3
          </span>
        </div>
      )}

      <div
        className="absolute right-3 top-3 flex rounded-full border border-white/10 bg-black/55 p-1 text-xs backdrop-blur-md"
        role="group"
        aria-label={t('label')}
      >
        {(['merged', 'split'] as const).map((m, i) => (
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
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[11px] text-white/80 backdrop-blur-md">
        {split ? t('parts') : t('whole')}
      </div>
    </div>
  );
}
