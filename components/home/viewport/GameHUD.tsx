'use client';
import { useTranslations } from 'next-intl';

const HITS = [
  { at: 0.12, n: '1,284', crit: false, x: 52, y: 44 },
  { at: 0.34, n: '3,460', crit: true, x: 60, y: 36 },
  { at: 0.56, n: '1,197', crit: false, x: 56, y: 52 },
  { at: 0.78, n: '4,021', crit: true, x: 63, y: 41 },
];

const KEYS = ['Q', 'E', 'R', 'F'];
const SKILLS = [
  'M5 19 19 5M14 5h5v5M5 15l4 4', // sword
  'M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z', // shield
  'M13 2 4 14h7l-1 8 9-12h-7z', // bolt
  'M4 12h10M10 6l6 6-6 6M18 6v12', // dash
];

function Bar({ pct, fill, h, w = 'w-full' }: { pct: number; fill: string; h: string; w?: string }) {
  return (
    <span
      className={`relative block ${h} ${w} overflow-hidden rounded-full bg-[rgba(8,10,16,0.7)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]`}
    >
      <span
        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300"
        style={{ width: `${pct}%`, background: fill }}
      />
    </span>
  );
}

/** Game overlay for the boss-fight scene: boss bar, player bars, skills, slashes and damage numbers. */
export function GameHUD({ progress, reduced }: { progress: number; reduced: boolean }) {
  const t = useTranslations('home.viewport.hud');
  const k = reduced ? 0.5 : progress;
  const landed = HITS.filter((h) => k >= h.at).length;
  const hp = 100 - landed * 11 - 4;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
      {/* boss bar */}
      <div className="absolute left-1/2 bottom-[calc(6rem+250px)] w-[min(720px,86vw)] -translate-x-1/2 md:bottom-auto md:top-[calc(var(--header-h)+22px)]">
        <div className="flex items-end justify-between px-1">
          <p className="flex items-baseline gap-3 [text-shadow:0_1px_10px_rgba(0,0,0,0.9)]">
            <span className="font-serif text-[15px] tracking-[0.35em] text-[#f1e6cf] md:text-lg">
              {t('boss')}
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-[#e0473f]/90 sm:inline">
              {t('phase')}
            </span>
          </p>
          <span className="font-mono text-[11px] tabular-nums text-white/60">{hp}%</span>
        </div>
        <div className="relative mt-2 flex items-center">
          <span className="h-px w-6 bg-gradient-to-l from-[#d9c39a]/70 to-transparent md:w-10" />
          <span className="mx-1 size-1.5 rotate-45 border border-[#d9c39a]/80" />
          <div className="relative h-[7px] flex-1 overflow-hidden rounded-full bg-[rgba(10,6,8,0.72)] shadow-[inset_0_0_0_1px_rgba(217,195,154,0.28),0_0_24px_rgba(0,0,0,0.6)]">
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-[rgba(255,236,200,0.55)] transition-[width] delay-300 duration-700 ease-out"
              style={{ width: `${hp}%` }}
            />
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#5e0f14,#b3232a_60%,#ff5a4a)] shadow-[0_0_12px_rgba(255,70,60,0.55)] transition-[width] duration-150"
              style={{ width: `${Math.max(hp - 6, 0)}%` }}
            >
              <span className="absolute inset-x-0 top-0 h-px bg-white/35" />
            </span>
            <span className="absolute inset-y-0 left-1/2 w-px bg-black/70" />
          </div>
          <span className="mx-1 size-1.5 rotate-45 border border-[#d9c39a]/80" />
          <span className="h-px w-6 bg-gradient-to-r from-[#d9c39a]/70 to-transparent md:w-10" />
        </div>
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
                className={`hud-dmg absolute font-semibold tabular-nums tracking-tight [text-shadow:0_2px_12px_rgba(0,0,0,0.85)] ${h.crit ? 'text-3xl text-[#ffd98a] md:text-5xl' : 'text-xl text-white/95 md:text-3xl'}`}
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
              >
                {h.crit && (
                  <span className="mr-2 align-middle font-mono text-[11px] uppercase tracking-[0.2em] text-[#ff8a5c] md:text-xs">
                    {t('crit')}
                  </span>
                )}
                {h.n}
              </span>
            </div>
          ) : null,
        )}

      {/* player HUD */}
      <div className="absolute bottom-[calc(2rem+186px)] left-5 hidden w-[280px] md:left-8 xl:block">
        <p className="flex items-baseline gap-2 [text-shadow:0_1px_6px_#000]">
          <span className="text-[13px] font-medium tracking-wide text-white/90">{t('player')}</span>
        </p>
        <div className="mt-2 space-y-1.5">
          <Bar pct={78} fill="linear-gradient(90deg,#8a1c22,#e04a3f)" h="h-[6px]" />
          <Bar
            pct={90 - (landed % 2) * 28}
            fill="linear-gradient(90deg,#2a8f5e,#7be0a0)"
            h="h-[3px]"
            w="w-[78%]"
          />
        </div>
        <div className="mt-4 flex gap-2">
          {SKILLS.map((d, i) => {
            const active = i === landed % 4;
            return (
              <span
                key={i}
                className={`relative grid size-11 place-items-center overflow-hidden rounded-[10px] border bg-[rgba(8,12,22,0.62)] backdrop-blur-sm transition-colors ${active ? 'border-[#9cc8ff]/80 shadow-[0_0_16px_rgba(127,190,255,0.45),inset_0_0_12px_rgba(127,190,255,0.25)]' : 'border-white/12'}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`size-5 ${active ? 'text-white' : 'text-white/55'}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={d} />
                </svg>
                {i === 2 && (
                  <span
                    className="absolute inset-0 bg-black/55"
                    style={{ clipPath: `inset(${k * 100}% 0 0 0)` }}
                  />
                )}
                <span className="absolute bottom-0.5 right-1 font-mono text-[9px] text-white/50">
                  {KEYS[i]}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
