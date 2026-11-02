'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCycle } from './useCycle';

const SRC = '/core/robot-model-cut.webp';
// Illustrative look of each texture map, derived from the final render.
const CHANNELS = [
  { id: 'albedo', filter: 'brightness(1.18) contrast(0.78) saturate(1.05)' },
  {
    id: 'normal',
    filter: 'grayscale(1) sepia(1) hue-rotate(195deg) saturate(3.5) brightness(1.05) contrast(1.2)',
  },
  { id: 'roughness', filter: 'grayscale(1) invert(0.85) contrast(1.25)' },
  { id: 'metalness', filter: 'grayscale(1) contrast(3) brightness(0.75)' },
  { id: 'pbr', filter: 'none' },
] as const;

/** Full PBR: step through the texture maps a game engine receives. */
export function PbrChannels() {
  const t = useTranslations('home.scenes.game.pbr');
  const [i, pick] = useCycle(CHANNELS.length, 1500);
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-[14%] bottom-[18%] top-[8%]">
        <Image
          src={SRC}
          alt=""
          fill
          sizes="420px"
          className="object-contain transition-[filter] duration-500"
          style={{ filter: CHANNELS[i].filter }}
        />
      </div>
      <span className="absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1.5 font-mono text-[11px] text-white/80 backdrop-blur-md">
        {t('maps')}
      </span>
      <div
        role="group"
        aria-label={t('label')}
        className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5"
      >
        {CHANNELS.map((c, k) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={i === k}
            onClick={() => pick(k)}
            className={`rounded-full border px-2.5 py-1 text-[11px] backdrop-blur-md ${
              i === k
                ? 'border-white bg-white text-[#07112a]'
                : 'border-white/15 bg-black/50 text-white/70 hover:text-white'
            }`}
          >
            {t(c.id)}
          </button>
        ))}
      </div>
    </div>
  );
}
