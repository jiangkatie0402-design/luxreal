'use client';
import { useTranslations } from 'next-intl';
import { Fragment, useEffect, useRef, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { PanelGlow } from './PanelGlow';

/** Split "Lead：rest" points (full-width colon or ": "). */
function splitPoint(text: string): [string | null, string] {
  const m = text.match(/^(.+?)(?:：|: )(.+)$/);
  return m ? [m[1], m[2]] : [null, text];
}

const IDS = ['print', 'game', 'film'] as const;
type T = ReturnType<typeof useTranslations>;

/** Empty media slot (image / video per point, not decided yet). */
function Slot({ bg, className, n }: { bg: string; className?: string; n?: number }) {
  return (
    <div
      aria-hidden
      className={cn('relative rounded-[20px] border border-[var(--line)]', className)}
      style={{ background: bg }}
    >
      {n !== undefined && (
        <span className="absolute left-4 top-4 font-mono text-xs text-[var(--muted)]">
          0{n + 1}
        </span>
      )}
    </div>
  );
}

function Label({ index, label }: { index: number; label: string }) {
  return (
    <p className="flex items-center gap-3 font-mono text-sm text-[var(--muted)]">
      <span>[ 0{index + 1} ]</span>
      <span className="font-sans">{label}</span>
    </p>
  );
}

function FieldName({
  id,
  children,
  className,
}: {
  id: string;
  children: string;
  className?: string;
}) {
  return (
    <h3
      id={`scene-${id}`}
      className={cn(
        'font-display text-[2.5rem] font-semibold leading-[1.1] tracking-[0.02em] md:text-7xl',
        className,
      )}
    >
      {children}
    </h3>
  );
}

/** Copy + three media columns for one panel. */
function PanelBody({
  index,
  id,
  label,
  t,
  slot,
}: {
  index: number;
  id: string;
  label: string;
  t: T;
  slot: string;
}) {
  const points = (t.raw(`${id}.points`) as string[]).map(splitPoint);
  const subtitle = (
    <p className="text-balance font-display text-2xl font-semibold leading-[1.35] tracking-[0.02em]">
      {t(`${id}.title`)}
    </p>
  );

  const WIDE =
    'relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center px-4 pb-16 pt-10 md:px-12 md:pb-28 md:pt-10 xl:px-20';
  const caption = (lead: string | null, rest: string, k: number) => (
    <>
      <p className="t-title flex items-baseline gap-2">
        <span className="font-mono text-xs text-[var(--muted)]">0{k + 1}</span>
        {lead}
      </p>
      <p className="t-body mt-3 leading-[1.9] max-w-[30rem] text-[var(--muted)]">{rest}</p>
    </>
  );

  // aligned header: name + subtitle left, intro right on the subtitle's baseline
  return (
    <div className={WIDE}>
      <Label index={index} label={label} />
      <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-end lg:gap-16">
        <div>
          <FieldName id={id}>{t(`${id}.tab`)}</FieldName>
          <div className="mt-5">{subtitle}</div>
        </div>
        <p className="t-lead leading-[1.9] max-w-[36rem] text-[var(--muted)] lg:justify-self-end">
          {t(`${id}.intro`)}
        </p>
      </div>
      <ul className="mt-8 grid gap-6 md:mt-10 md:grid-cols-3 md:gap-8">
        {points.map(([lead, rest], k) => (
          <li key={k} className="flex flex-col">
            <Slot bg={slot} className="aspect-[4/3] w-full" />
            <div className="mt-5">{caption(lead, rest, k)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Panel = {
  bg: string;
  ink: string;
  muted: string;
  line: string;
  slot: string;
  edge: string;
  tint: [string, string];
  /** glow strength (default 0.55) */
  glow?: number;
  /** colour of a soft light beam from the top centre */
  beam?: string;
};

/** Light panel: dark ink. */
const light = (bg: string, tint: [string, string]): Panel => ({
  bg,
  ink: '#16121f',
  muted: 'rgba(22,18,31,0.68)',
  line: 'rgba(22,18,31,0.16)',
  slot: 'rgba(22,18,31,0.07)',
  edge: 'transparent',
  tint,
});
/** Dark panel: white ink; optional coloured top edge. */
const dark = (bg: string, tint: [string, string], edge = 'transparent'): Panel => ({
  bg,
  ink: '#ffffff',
  muted: 'rgba(255,255,255,0.72)',
  line: 'rgba(255,255,255,0.16)',
  slot: 'rgba(255,255,255,0.06)',
  edge,
  tint,
});

/** Preview-only: colour schemes for the three field panels (3D 打印, 游戏, 影视). */
const LIT = 'rgba(255,255,255,0.95)';
const BEAM_W = 'rgba(255,255,255,0.55)';
const BEAM_V = 'rgba(196,181,253,0.3)';

/** M1: mist violet (lit edge, white beam) / black (violet beam) / mid violet. */
const m1 = (bgs: [string, string, string], extra: Partial<Panel> = {}): [Panel, Panel, Panel] => [
  { ...light(bgs[0], ['#f3eeff', '#b3a2ef']), edge: LIT, beam: BEAM_W, ...extra },
  { ...dark(bgs[1], ['#3a2f66', '#14111f'], 'rgba(220,208,255,0.9)'), beam: BEAM_V, ...extra },
  { ...light(bgs[2], ['#ece5ff', '#9c88e6']), edge: LIT, beam: BEAM_W, ...extra },
];
/** light → dark → light, each with a top-to-bottom gradient base. */
const PANELS = m1([
  'linear-gradient(180deg,#ece5ff 0%,#cdbdff 100%)',
  'linear-gradient(180deg,#221c3e 0%,#0a0910 70%)',
  'linear-gradient(180deg,#d9ccff 0%,#b29ef5 100%)',
]);

/**
 * 应用场景: full-height colour panels that stack on scroll — each panel is
 * sticky, so the next field slides up over the previous one. Media slots empty.
 * A panel taller than the screen gets a negative sticky top, so it first scrolls
 * through to its bottom and only then holds while the next one slides over.
 */
export function UseCaseStack() {
  const t = useTranslations('site.scenes');
  const panels = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const fit = () => {
      const header =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
      // the last panel isn't sticky (top would just shift it)
      panels.current.slice(0, -1).forEach((el) => {
        if (el) el.style.top = `${Math.min(header, window.innerHeight - el.offsetHeight)}px`;
      });
    };
    fit();
    const ro = new ResizeObserver(fit);
    panels.current.forEach((el) => el && ro.observe(el));
    window.addEventListener('resize', fit);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, []);

  return (
    <section aria-labelledby="scenes-title" id="scenes" className="scroll-mt-20">
      {/* section name lives in each panel's label; h2 kept for the outline */}
      <h2 id="scenes-title" className="sr-only">
        {t('title')}
      </h2>

      {IDS.map((id, i) => {
        const p = PANELS[i];
        return (
          <Fragment key={id}>
            <article
              ref={(el) => {
                panels.current[i] = el;
              }}
              aria-labelledby={`scene-${id}`}
              className={cn(
                'relative isolate flex min-h-[calc(100svh-var(--header-h))] flex-col overflow-hidden rounded-t-[32px] text-[var(--ink)]',
                // the last panel scrolls away normally so what follows never covers it
                i < IDS.length - 1 && 'sticky top-[var(--header-h)]',
              )}
              style={
                {
                  background: p.bg,
                  boxShadow: `inset 0 1px 0 ${p.edge}, 0 -24px 60px rgba(0,0,0,0.35)`,
                  '--ink': p.ink,
                  '--muted': p.muted,
                  '--line': p.line,
                } as CSSProperties
              }
            >
              <PanelGlow tint={p.tint} strength={p.glow} />
              {p.beam && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
                  style={{
                    background: `radial-gradient(40% 75% at 50% 0%, ${p.beam}, transparent 72%)`,
                  }}
                />
              )}
              <PanelBody index={i} id={id} label={t('title')} t={t} slot={p.slot} />
            </article>
            {/* hold: the panel stays fully in view for a stretch before the next one slides over */}
            {i < IDS.length - 1 && <div aria-hidden className="h-[45svh]" />}
          </Fragment>
        );
      })}

      <div className="relative bg-background">
        <p className="t-small container-x py-8 text-center text-muted-foreground md:py-12">
          {t('more')}
        </p>
      </div>
    </section>
  );
}
