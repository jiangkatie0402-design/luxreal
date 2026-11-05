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
    // filmstrip: fixed copy left, portrait media cards scroll sideways on the right
    return (
      <div className="container-x relative grid flex-1 content-center gap-10 py-12 md:py-16 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12">
        <div className="lg:pb-20">
          <Label index={index} label={label} />
          <FieldName id={id} className="mt-4">
            {t(`${id}.tab`)}
          </FieldName>
          <div className="mt-6">
            {subtitle}
            {intro}
          </div>
        </div>
        <ul className="-mr-4 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [mask-image:linear-gradient(90deg,#000_80%,transparent)] [scrollbar-width:none] md:-mr-8 lg:-mr-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          {points.map(([lead, rest], k) => (
            <li
              key={k}
              className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[clamp(260px,24vw,340px)]"
            >
              <Slot bg={slot} n={k} className="aspect-[3/4] w-full" />
              <div className="mt-4 pr-4">
                <p className="t-title">{lead}</p>
                <p className="t-body mt-2 text-[var(--muted)]">{rest}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );

  if (layout === 1)
    // editorial: oversized field name, copy left, staggered portrait cards right
    return (
      <div className="container-x relative flex-1 py-10 md:py-14">
        <Label index={index} label={label} />
        <h3
          id={`scene-${id}`}
          className="mt-2 font-display text-[clamp(3rem,9.5vw,8.75rem)] font-semibold leading-none tracking-[0.01em]"
        >
          {t(`${id}.tab`)}
        </h3>
        <div className="mt-8 grid gap-8 md:mt-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] lg:gap-10">
          <div>
            {subtitle}
            {intro}
          </div>
          <ul className="grid gap-6 sm:grid-cols-3">
            {points.map(([lead, rest], k) => (
              <li key={k} className={cn(k === 1 && 'sm:mt-10')}>
                <Slot
                  bg={slot}
                  n={k}
                  className="aspect-[4/3] w-full sm:aspect-[3/4] lg:aspect-[4/5]"
                />
                <p className="t-title mt-4">{lead}</p>
                <p className="t-body mt-2 text-[var(--muted)]">{rest}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );

  // expanding cards: the hovered / focused card widens and reveals its text
  return (
    <div className="container-x relative flex flex-1 flex-col py-10 md:py-14">
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
      <ul className="mt-8 flex flex-col gap-4 md:mt-10 md:h-[min(50vh,440px)] md:flex-row">
        {points.map(([lead, rest], k) => {
          const on = active === k;
          return (
            <li
              key={k}
              className={cn(
                'relative min-h-64 overflow-hidden rounded-[20px] border border-[var(--line)] transition-[flex-grow] duration-[var(--dur-slow)] ease-[var(--ease-out)] md:min-h-0',
                on ? 'md:flex-[2.2]' : 'md:flex-1',
              )}
              style={{ background: slot }}
            >
              <button
                type="button"
                aria-pressed={on}
                onMouseEnter={() => setActive(k)}
                onFocus={() => setActive(k)}
                onClick={() => setActive(k)}
                className="absolute inset-0 flex flex-col justify-end p-6 text-left outline-none focus-visible:ring-1 focus-visible:ring-[var(--ink)]"
              >
                <span className="absolute left-5 top-5 font-mono text-xs text-[var(--muted)]">
                  0{k + 1}
                </span>
                <span className="t-title">{lead}</span>
                <span
                  className={cn(
                    'grid transition-[grid-template-rows,opacity] duration-[var(--dur-base)]',
                    on
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0 md:grid-rows-[0fr]',
                  )}
                >
                  <span className="t-body mt-2 max-w-md overflow-hidden text-[var(--muted)]">
                    {rest}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
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
