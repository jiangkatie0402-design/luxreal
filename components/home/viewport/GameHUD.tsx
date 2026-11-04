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

/** Stacks a label one glyph per line (CJK) — sturdier than writing-mode across fonts. */
function Stack({ text, className }: { text: string; className: string }) {
  const parts = /[\u4e00-\u9fff]/.test(text) ? [...text.replace(/\s+/g, '')] : text.split(/\s+/);
  return (
    <span className={`flex flex-col items-center leading-none ${className}`}>
      {parts.map((c, i) =>
        c === '·' ? (
          <span key={i} className="my-0.5 size-[3px] rounded-full bg-current opacity-60" />
        ) : (
          <span key={i}>{c}</span>
        ),
      )}
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
      {/* boss bar: vertical, on the right edge so it never covers the fight */}
      <div className="absolute right-3 top-[calc(var(--header-h)+120px)] flex items-start gap-3 md:right-10 md:top-1/2 md:-translate-y-1/2 md:items-center">
        <p className="flex flex-col items-center gap-4 [text-shadow:0_1px_10px_rgba(0,0,0,0.9)]">
          <Stack
            text={t('boss')}
            className="gap-1 font-serif text-sm text-[#f1e6cf] md:gap-1.5 md:text-lg"
          />
          <Stack
            text={t('phase')}
            className="hidden gap-0.5 rounded-sm border border-[#e0473f]/50 px-1 py-1.5 font-serif text-[11px] text-[#ff7a6e] md:flex"
          />
        </p>
        <div className="flex flex-col items-center">
          <span className="font-mono text-[11px] tabular-nums text-white/70">{hp}%</span>
          <span className="mt-2 h-5 w-px bg-gradient-to-t from-[#d9c39a]/70 to-transparent" />
          <span className="my-1 size-1.5 rotate-45 border border-[#d9c39a]/80" />
          <div className="relative h-[28svh] w-[7px] overflow-hidden rounded-full bg-[rgba(10,6,8,0.72)] shadow-[inset_0_0_0_1px_rgba(217,195,154,0.28),0_0_24px_rgba(0,0,0,0.6)] md:h-[min(46svh,420px)]">
            <span
              className="absolute inset-x-0 bottom-0 rounded-full bg-[rgba(255,236,200,0.55)] transition-[height] delay-300 duration-700 ease-out"
              style={{ height: `${hp}%` }}
            />
            <span
              className="absolute inset-x-0 bottom-0 rounded-full bg-[linear-gradient(0deg,#5e0f14,#b3232a_60%,#ff5a4a)] shadow-[0_0_12px_rgba(255,70,60,0.55)] transition-[height] duration-150"
              style={{ height: `${Math.max(hp - 6, 0)}%` }}
            >
              <span className="absolute inset-y-0 left-0 w-px bg-white/35" />
            </span>
            <span className="absolute inset-x-0 top-1/2 h-px bg-black/70" />
          </div>
          <span className="my-1 size-1.5 rotate-45 border border-[#d9c39a]/80" />
          <span className="h-5 w-px bg-gradient-to-b from-[#d9c39a]/70 to-transparent" />
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
                className={`hud-dmg absolute font-semibold tabular-nums tracking-tight [text-shadow:0_2px_12px_rgba(0,0,0,0.85)] ${h.crit ? 'text-2xl text-[#ffd98a] md:text-4xl' : 'text-lg text-white/95 md:text-2xl'}`}
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
      <div className="absolute bottom-8 left-8 hidden w-[220px] min-[1440px]:block">
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
        <div className="mt-3 flex gap-1.5">
          {SKILLS.map((d, i) => {
            const active = i === landed % 4;
            return (
              <span
                key={i}
                className={`relative grid size-9 place-items-center overflow-hidden rounded-[10px] border bg-[rgba(8,12,22,0.62)] backdrop-blur-sm transition-colors ${active ? 'border-[#9cc8ff]/80 shadow-[0_0_16px_rgba(127,190,255,0.45),inset_0_0_12px_rgba(127,190,255,0.25)]' : 'border-white/12'}`}
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
