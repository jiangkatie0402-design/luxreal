'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Artboard } from './Artboard';
import { useCycle } from './useCycle';

// Camera framings on the same set + asset (zoom origin is the robot's head/body).
const SHOTS = [
  { id: 'wide', scale: 1, origin: '50% 60%' },
  { id: 'medium', scale: 1.75, origin: '50% 58%' },
  { id: 'close', scale: 3.1, origin: '50% 46%' },
] as const;

/** AI video consistency: one fixed asset, cut across wide / medium / close-up. */
export function ShotBoard() {
  const t = useTranslations('home.scenes.film.shots');
  const [i, pick] = useCycle(SHOTS.length, 2000);
  const s = SHOTS[i];
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <Artboard>
        <div
          className="absolute inset-0 transition-transform duration-[900ms] ease-[var(--ease-out)]"
          style={{ transform: `scale(${s.scale})`, transformOrigin: s.origin }}
        >
          <Image
            src="/scenes/film-street.webp"
            alt=""
            fill
            sizes="500px"
            className="object-cover"
          />
          <div className="absolute bottom-[18.5%] left-1/2 h-[48.7%] w-[40%] -translate-x-1/2">
            <Image
              src="/core/robot-model-cut.webp"
              alt=""
              fill
              sizes="400px"
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </Artboard>
      {/* 2.39:1 letterbox */}
      <span className="absolute inset-x-0 top-0 h-[11%] bg-black" />
      <span className="absolute inset-x-0 bottom-0 h-[11%] bg-black" />
      <span className="absolute left-3 top-[13%] font-mono text-[11px] text-white/70">
        SHOT {String(i + 1).padStart(2, '0')} · {t(s.id)}
      </span>
      <div
        role="group"
        aria-label={t('label')}
        className="absolute bottom-[13%] left-1/2 flex -translate-x-1/2 gap-1.5"
      >
        {SHOTS.map((x, k) => (
          <button
            key={x.id}
            type="button"
            aria-pressed={i === k}
            onClick={() => pick(k)}
            className={`rounded-full border px-3 py-1 text-[11px] backdrop-blur-md ${
              i === k
                ? 'border-white bg-white text-[#07112a]'
                : 'border-white/20 bg-black/50 text-white/75 hover:text-white'
            }`}
          >
            {t(x.id)}
          </button>
        ))}
      </div>
    </div>
  );
}
