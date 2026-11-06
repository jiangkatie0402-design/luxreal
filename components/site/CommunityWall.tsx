'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/** Placeholder work (assets not decided). `render` / `clay` take image URLs once available. */
type Work = { render?: string; clay?: string };
/** Public asset base: "/" in the app, overridable for static previews. */
const BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? '/';
const SHIELD: Work = {
  render: `${BASE}works/shield-render.webp`,
  clay: `${BASE}works/shield-clay.webp`,
};
const SPEAR: Work = {
  render: `${BASE}works/spear-render.webp`,
  clay: `${BASE}works/spear-clay.webp`,
};
const EMPTY: Work = {};
const ROWS: Work[][] = [
  [EMPTY, SHIELD, EMPTY, SPEAR, ...Array(6).fill(EMPTY)],
  Array(10).fill(EMPTY),
  Array(10).fill(EMPTY),
];

/**
 * One work card. Hovering (or press-and-hold on touch, or keyboard focus) shows
 * the white model (clay); leaving returns to
 * the rendered result. Empty cards are placeholders until works are chosen.
 */
function WorkCard({ work, label }: { work: Work; label: string }) {
  const [clay, setClay] = useState(false);
  const show = () => setClay(true);
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
              ? { background: `center/auto 74% no-repeat url(${work.render})` }
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
            work.clay ? { background: `center/auto 74% no-repeat url(${work.clay})` } : undefined
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
