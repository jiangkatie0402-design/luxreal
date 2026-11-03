'use client';
import { useTranslations } from 'next-intl';

const HITS = [
  { at: 0.12, n: '1,284', crit: false, x: 52, y: 44 },
  { at: 0.34, n: '3,460', crit: true, x: 60, y: 36 },
  { at: 0.56, n: '1,197', crit: false, x: 56, y: 52 },
  { at: 0.78, n: '4,021', crit: true, x: 63, y: 41 },
];

/** Game overlay for the boss-fight scene: boss bar, player bars, skills, slashes and damage numbers. */
export function GameHUD({ progress, reduced }: { progress: number; reduced: boolean }) {
  const t = useTranslations('home.viewport.hud');
  const k = reduced ? 0.5 : progress;
  const landed = HITS.filter((h) => k >= h.at).length;
  const hp = 100 - landed * 11 - 4;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
      {/* boss bar */}
      <div className="absolute left-1/2 bottom-[calc(6rem+250px)] md:bottom-auto md:top-[calc(var(--header-h)+18px)] w-[min(560px,80vw)] -translate-x-1/2 text-center">
        <p className="font-serif text-sm tracking-[0.3em] text-[#f3e2b8] [text-shadow:0_2px_8px_#000] md:text-base">
          {t('boss')}
        </p>
        <div className="relative mt-2 h-2.5 overflow-hidden rounded-sm border border-[#c9a96a]/70 bg-black/70 md:h-3">
          <span
            className="absolute inset-y-0 left-0 bg-[#f7d6a0] transition-[width] duration-700"
            style={{ width: `${hp + 6}%` }}
          />
          <span
            className="absolute inset-y-0 left-0 bg-[linear-gradient(#e0473f,#9b1c1c)] transition-[width] duration-150"
            style={{ width: `${hp}%` }}
          />
        </div>
        <p className="mt-1 text-right font-mono text-[10px] text-white/70">{t('phase')}</p>
      </div>

      {/* slashes + hit flash */}
      {!reduced &&
        HITS.map((h, i) =>
          k >= h.at && k < h.at + 0.16 ? (
            <div key={i}>
              <svg
                className="hud-slash absolute left-[34%] top-[18%] h-[60%] w-[44%]"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <path
                  d={i % 2 ? 'M95 8 Q 55 40 6 92' : 'M8 10 Q 50 45 94 90'}
                  fill="none"
                  stroke="url(#slashGrad)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="slashGrad" x1="0" x2="1">
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#7fd0ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="hud-flash absolute inset-0 bg-white" />
              <span
                className={`hud-dmg absolute font-black italic [text-shadow:0_3px_0_#000,0_0_18px_rgba(0,0,0,0.8)] ${h.crit ? 'text-4xl text-[#ffd34d] md:text-6xl' : 'text-2xl text-white md:text-4xl'}`}
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
              >
                {h.crit && (
                  <span className="mr-2 align-middle text-base not-italic text-[#ff7a45] md:text-xl">
                    {t('crit')}
                  </span>
                )}
                {h.n}
              </span>
            </div>
          ) : null,
        )}

      {/* player HUD */}
      <div className="absolute bottom-[calc(2rem+170px)] left-5 hidden w-[260px] md:left-8 xl:block">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full border-2 border-[#c9a96a]/80 bg-black/70 font-serif text-lg text-[#f3e2b8]">
            {t('avatar')}
          </span>
          <div className="flex-1">
            <p className="text-xs text-white/85 [text-shadow:0_1px_4px_#000]">{t('player')}</p>
            <span className="mt-1 block h-2 overflow-hidden rounded-sm bg-black/70">
              <span className="block h-full w-[78%] bg-[linear-gradient(#5ee08a,#1f9d55)]" />
            </span>
            <span className="mt-1 block h-1.5 overflow-hidden rounded-sm bg-black/70">
              <span
                className="block h-full bg-[linear-gradient(#7fb6ff,#2f6bff)] transition-[width] duration-300"
                style={{ width: `${90 - (landed % 2) * 25}%` }}
              />
            </span>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          {['Q', 'E', 'R', 'F'].map((key, i) => (
            <span
              key={key}
              className={`relative grid size-10 place-items-center rounded-md border bg-black/65 font-mono text-xs ${i === landed % 4 ? 'border-[#7fd0ff] text-white shadow-[0_0_12px_rgba(127,208,255,0.6)]' : 'border-white/20 text-white/60'}`}
            >
              {key}
              {i === 2 && (
                <span
                  className="absolute inset-0 rounded-md bg-black/60"
                  style={{ clipPath: `inset(${k * 100}% 0 0 0)` }}
                />
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
