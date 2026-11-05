'use client';
import { useTranslations } from 'next-intl';
import { useState, type CSSProperties } from 'react';
import { usePanelLayout } from '@/lib/heroPalettes';
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

function PointText({ lead, rest, n }: { lead: string | null; rest: string; n?: number }) {
  return (
    <>
      <p className="t-title flex items-baseline gap-2">
        {n !== undefined && <span className="font-mono text-xs text-[var(--muted)]">0{n + 1}</span>}
        {lead}
      </p>
      <p className="t-body mt-2 text-[var(--muted)]">{rest}</p>
    </>
  );
}

/** Copy + media for one panel, in one of three layouts. */
function PanelBody({
  layout,
  index,
  id,
  label,
  t,
  slot,
}: {
  layout: number;
  index: number;
  id: string;
  label: string;
  t: T;
  slot: string;
}) {
  const [active, setActive] = useState(0);
  const points = (t.raw(`${id}.points`) as string[]).map(splitPoint);
  const subtitle = (
    <p className="text-balance font-display text-2xl font-semibold leading-[1.35] tracking-[0.02em]">
      {t(`${id}.title`)}
    </p>
  );
  const intro = <p className="t-lead mt-3 max-w-[34rem] text-[var(--muted)]">{t(`${id}.intro`)}</p>;

  if (layout === 0)
    // left copy + point list, right one large media that follows the chosen point
    return (
      <div className="container-x relative grid flex-1 content-center gap-10 py-12 md:py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <Label index={index} label={label} />
          <FieldName id={id} className="mt-4">
            {t(`${id}.tab`)}
          </FieldName>
          <div className="mt-6">
            {subtitle}
            {intro}
          </div>
          <ul className="mt-8 border-t border-[var(--line)]">
            {points.map(([lead, rest], k) => (
              <li key={k} className="border-b border-[var(--line)]">
                <button
                  type="button"
                  aria-pressed={active === k}
                  onClick={() => setActive(k)}
                  onMouseEnter={() => setActive(k)}
                  onFocus={() => setActive(k)}
                  className="group grid w-full grid-cols-[2rem_1fr] gap-2 py-4 text-left outline-none focus-visible:ring-1 focus-visible:ring-[var(--ink)]"
                >
                  <span
                    className={cn(
                      'pt-1 font-mono text-xs transition-colors',
                      active === k ? 'text-[var(--ink)]' : 'text-[var(--muted)]',
                    )}
                  >
                    0{k + 1}
                  </span>
                  <span>
                    <span
                      className={cn(
                        'block text-lg font-semibold transition-opacity',
                        active === k ? 'opacity-100' : 'opacity-60 group-hover:opacity-90',
                      )}
                    >
                      {lead}
                    </span>
                    <span
                      className={cn(
                        'grid transition-[grid-template-rows] duration-[var(--dur-base)]',
                        active === k ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                      )}
                    >
                      <span className="t-body mt-1 overflow-hidden text-[var(--muted)]">
                        {rest}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <Slot
          bg={slot}
          n={active}
          className="aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-[420px]"
        />
      </div>
    );

  if (layout === 1)
    // centred heading group, then three columns: text first, shorter media below
    return (
      <div className="container-x relative flex-1 py-12 md:py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Label index={index} label={label} />
          <FieldName id={id} className="mt-4">
            {t(`${id}.tab`)}
          </FieldName>
          <div className="mt-6 flex flex-col items-center">
            {subtitle}
            {intro}
          </div>
        </div>
        <ul className="mt-10 grid gap-8 md:mt-12 md:grid-cols-3 md:gap-6">
          {points.map(([lead, rest], k) => (
            <li key={k} className="flex flex-col">
              <PointText lead={lead} rest={rest} n={k} />
              <Slot bg={slot} className="mt-5 aspect-[16/10] w-full" />
            </li>
          ))}
        </ul>
      </div>
    );

  // one large + two small
  return (
    <div className="container-x relative flex-1 py-12 md:py-16">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-end lg:gap-16">
        <div>
          <Label index={index} label={label} />
          <FieldName id={id} className="mt-4">
            {t(`${id}.tab`)}
          </FieldName>
        </div>
        <div>
          {subtitle}
          {intro}
        </div>
      </div>
      <ul className="mt-10 grid gap-6 md:mt-12 md:h-[min(52vh,440px)] md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:grid-rows-2">
        {points.map(([lead, rest], k) => (
          <li key={k} className={cn('flex min-h-0 flex-col', k === 0 && 'md:row-span-2')}>
            <Slot
              bg={slot}
              className={cn('w-full', 'aspect-[16/9] md:aspect-auto md:min-h-0 md:flex-1')}
            />
            <div className="mt-4">
              <PointText lead={lead} rest={rest} n={k} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** violet → black → violet; the two violets differ in value so the rhythm reads. */
const TINT: Record<number, [string, string]> = {
  0: ['#efe8ff', '#a08ce6'],
  1: ['#3a2f66', '#1d1838'],
  2: ['#8a7dd0', '#3b2f7a'],
};

const PANELS = [
  {
    bg: '#cdbcff',
    ink: '#16121f',
    muted: 'rgba(22,18,31,0.68)',
    line: 'rgba(22,18,31,0.16)',
    slot: 'rgba(22,18,31,0.07)',
    edge: 'transparent',
  },
  {
    bg: '#0d0c12',
    ink: '#ffffff',
    muted: 'rgba(255,255,255,0.68)',
    line: 'rgba(255,255,255,0.12)',
    slot: 'rgba(255,255,255,0.04)',
    edge: 'rgba(205,188,255,0.28)',
  },
  {
    bg: '#5b4e9a',
    ink: '#ffffff',
    muted: 'rgba(255,255,255,0.74)',
    line: 'rgba(255,255,255,0.2)',
    slot: 'rgba(255,255,255,0.08)',
    edge: 'transparent',
  },
] as const;

/**
 * 应用场景: full-height colour panels that stack on scroll — each panel is
 * sticky, so the next field slides up over the previous one. Media slots empty.
 */
export function UseCaseStack() {
  const t = useTranslations('site.scenes');
  const layout = usePanelLayout((st) => st.i);
  return (
    <section aria-labelledby="scenes-title" id="scenes" className="scroll-mt-20">
      {/* section name lives in each panel's label; h2 kept for the outline */}
      <h2 id="scenes-title" className="sr-only">
        {t('title')}
      </h2>

      {IDS.map((id, i) => {
        const p = PANELS[i];
        return (
          <article
            key={id}
            aria-labelledby={`scene-${id}`}
            className="relative isolate [@media(min-width:1024px)_and_(min-height:820px)]:sticky [@media(min-width:1024px)_and_(min-height:820px)]:top-[var(--header-h)] flex min-h-[calc(100svh-var(--header-h))] flex-col overflow-hidden rounded-t-[32px] text-[var(--ink)]"
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
            <PanelGlow tint={TINT[i]} />
            <PanelBody layout={layout} index={i} id={id} label={t('title')} t={t} slot={p.slot} />
          </article>
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
