'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/** A work card: rendered result, plus the white model when there is one. */
type Work = { render?: string; clay?: string };
/** Public asset base: "/" in the app, overridable for static previews. */
const BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? '/';

/**
 * The 30 works in their fixed order (three rows of ten), as laid out in the
 * design board. Images live at works/<name>-render.webp (and -clay.webp).
 */
const ORDER = [
  ['shield', 'chest', 'spear', 'mace', 'axe', 'mask', 'badger', 'helmet', 'frog', 'pot'],
  [
    'lamp',
    'capstan',
    'jellyfish',
    'plane',
    'rabbit',
    'knight',
    'fountain',
    'lion',
    'snail',
    'crystal',
  ],
  ['crab', 'crest', 'tower', 'horn', 'house', 'deer', 'treant', 'plate', 'harp', 'vase'],
] as const;
/** Every work on the board has its render. */
const HAVE_RENDER = new Set<string>(ORDER.flat());
const HAVE_CLAY = new Set(['shield', 'spear']);
const work = (name: string): Work => ({
  render: HAVE_RENDER.has(name) ? `${BASE}works/${name}-render.webp` : undefined,
  clay: HAVE_CLAY.has(name) ? `${BASE}works/${name}-clay.webp` : undefined,
});
const ROWS: Work[][] = ORDER.map((row) => row.map(work));

/**
 * One work card. Hovering (or press-and-hold on touch, or keyboard focus) shows
 * the white model (clay); leaving returns to
 * the rendered result. Empty cards are placeholders until works are chosen.
 */
function WorkCard({ work, label }: { work: Work; label: string }) {
  const [clay, setClay] = useState(false);
  const show = () => work.clay && setClay(true);
  const hide = () => setClay(false);
  return (
    <figure className="w-[150px] shrink-0 overflow-hidden rounded-2xl bg-[#18181b] md:w-[176px]">
      <button
        type="button"
        aria-label={label}
        aria-pressed={clay}
        // mouse: hover shows the white model; touch: press and hold
        onPointerEnter={(e) => e.pointerType === 'mouse' && show()}
        onPointerLeave={hide}
        onPointerDown={(e) => e.pointerType !== 'mouse' && show()}
        onPointerUp={(e) => e.pointerType !== 'mouse' && hide()}
        onPointerCancel={hide}
        onFocus={show}
        onBlur={hide}
        className="relative block aspect-[5/6] w-full cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        {/* rendered result */}
        <span
          className={cn(
            'absolute inset-0 transition-opacity duration-300',
            clay ? 'opacity-0' : 'opacity-100',
            !work.render &&
              'bg-[radial-gradient(60%_55%_at_50%_45%,rgba(139,92,246,0.28),transparent_70%),radial-gradient(100%_80%_at_50%_0%,#26262c,#18181b)]',
          )}
          style={
            work.render
              ? {
                  background: `url(${work.render}) center/contain no-repeat content-box`,
                  padding: '13%',
                }
              : undefined
          }
        />
        {/* white model */}
        <span
          className={cn(
            'absolute inset-0 transition-opacity duration-300',
            clay ? 'opacity-100' : 'opacity-0',
            !work.clay &&
              'bg-[radial-gradient(45%_40%_at_50%_45%,rgba(230,230,235,0.55),transparent_70%),radial-gradient(100%_80%_at_50%_0%,#3a3a40,#202024)]',
          )}
          style={
            work.clay
              ? {
                  background: `url(${work.clay}) center/contain no-repeat content-box`,
                  padding: '13%',
                }
              : undefined
          }
        />
      </button>
    </figure>
  );
}

/**
 * 七、社区作品 — three rows of compact work cards drifting sideways (alternate
 * directions), fading at the edges; hovering a row pauses it.
 */
export function Community() {
  const t = useTranslations('site.community');
  return (
    <section aria-labelledby="community-title" id="community" className="section-y scroll-mt-20">
      <div className="container-x text-center">
        <h2 id="community-title" className="t-h2">
          {t('title')}
        </h2>
        <p className="t-lead mx-auto mt-4 max-w-[60rem] text-balance text-muted-foreground">
          {t('lead')}
        </p>
      </div>
      <div className="mt-10 grid gap-3 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] md:mt-14">
        {ROWS.map((row, r) => (
          <div
            key={r}
            className="community-row flex w-max gap-3"
            style={{
              animationDirection: r % 2 ? 'reverse' : undefined,
              animationDuration: `${70 + r * 12}s`,
            }}
          >
            {[...row, ...row].map((w, i) => (
              <WorkCard key={i} work={w} label={t('hint')} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
