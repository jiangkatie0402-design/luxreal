'use client';
import { useTranslations } from 'next-intl';

/** Pins in % of the 3:2 print photo; side = which way the label extends. */
const PINS = [
  { id: 'layer', x: 60, y: 12, side: 'r', len: 56, at: 0.15 },
  { id: 'mesh', x: 63, y: 47, side: 'r', len: 110, at: 0.3 },
  { id: 'base', x: 60, y: 79, side: 'l', len: 150, at: 0.45 },
] as const;
const LAYERS = 650;

/** Overlay for the 3D-print scene: annotation pins and a printer status bar. */
export function PrintHUD({ progress, reduced }: { progress: number; reduced: boolean }) {
  const t = useTranslations('home.viewport.printHud');
  const k = reduced ? 1 : progress;
  const p = Math.min(k / 0.7, 1);
  const done = p >= 1;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
      {PINS.map((c) => (
        <span
          key={c.id}
          className={`absolute hidden transition-all duration-700 lg:block ${k >= c.at ? 'opacity-100' : 'translate-y-1 opacity-0'}`}
          style={{ left: `${c.x}%`, top: `${c.y}%` }}
        >
          <span className="absolute -left-[5px] -top-[5px] size-[10px] rounded-full border border-[#cfe3ff] bg-[#2F6BFF]/60 shadow-[0_0_12px_rgba(111,168,255,0.9)]" />
          <span
            className={`absolute top-0 h-px ${c.side === 'r' ? 'left-[6px] bg-gradient-to-r from-[#9cc8ff] to-[#9cc8ff]/40' : 'right-[6px] bg-gradient-to-l from-[#9cc8ff] to-[#9cc8ff]/40'}`}
            style={{ width: c.len }}
          />
          <span
            className={`absolute -top-[22px] whitespace-nowrap rounded-md border border-white/10 bg-[rgba(5,8,15,0.72)] px-2.5 py-1.5 backdrop-blur ${c.side === 'r' ? '' : 'text-right'}`}
            style={c.side === 'r' ? { left: c.len + 10 } : { right: c.len + 10 }}
          >
            <span className="block text-[13px] font-medium text-white">{t(`pins.${c.id}.t`)}</span>
            <span className="block font-mono text-[10px] tracking-wide text-[#9cc8ff]/80">
              {t(`pins.${c.id}.d`)}
            </span>
          </span>
        </span>
      ))}

      {/* printer status */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2.5 rounded-full border border-white/10 bg-[rgba(5,8,15,0.6)] py-1.5 pl-2.5 pr-3.5 font-mono text-[10px] text-white/75 backdrop-blur-md md:bottom-4 md:left-4 md:text-[11px]">
        <span
          className={`size-1.5 rounded-full ${done ? 'bg-[#4ade80]' : 'animate-pulse bg-[#6FA8FF]'}`}
        />
        <span className="text-white/90">qilin.stl</span>
        <span className="relative h-[3px] w-12 overflow-hidden rounded-full bg-white/15 md:w-16">
          <span
            className={`absolute inset-y-0 left-0 rounded-full ${done ? 'bg-[#4ade80]' : 'bg-[#6FA8FF]'}`}
            style={{ width: `${p * 100}%` }}
          />
        </span>
        <span className="tabular-nums">
          {done ? t('done') : `${t('printing')} ${Math.round(p * 100)}%`}
        </span>
        <span className="hidden tabular-nums text-white/45 sm:inline">
          {t('layer')} {Math.round(p * LAYERS)}/{LAYERS}
        </span>
      </div>
    </div>
  );
}
