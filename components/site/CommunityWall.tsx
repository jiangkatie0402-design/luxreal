'use client';
import { Heart, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/** Placeholder work (assets not decided). `render` / `clay` take image URLs once available. */
type Work = { render?: string; clay?: string };
const ROWS: Work[][] = [Array(10).fill({}), Array(10).fill({}), Array(10).fill({})];

/**
 * One work card. Press and hold shows the white model (clay); release returns to
 * the rendered result. Author and counts are skeletons until real works exist.
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
        onPointerDown={show}
        onPointerUp={hide}
        onPointerLeave={hide}
        onPointerCancel={hide}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && show()}
        onKeyUp={hide}
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
            work.render ? { background: `center/contain no-repeat url(${work.render})` } : undefined
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
            work.clay ? { background: `center/contain no-repeat url(${work.clay})` } : undefined
          }
        />
      </button>
      <figcaption aria-hidden className="flex items-center gap-2 px-3 py-2.5 text-xs text-white/60">
        <span className="size-5 shrink-0 rounded-full bg-white/10" />
        <span className="h-2 w-16 rounded-full bg-white/10" />
        <span className="ml-auto flex items-center gap-2.5">
          <Heart className="size-3.5" />
          <Star className="size-3.5" />
        </span>
      </figcaption>
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
