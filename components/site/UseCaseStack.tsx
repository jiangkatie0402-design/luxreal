'use client';
import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';
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
    'relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center px-4 py-10 md:px-12 md:py-12 xl:px-20';
  const caption = (lead: string | null, rest: string, k: number) => (
    <>
      <p className="t-title flex items-baseline gap-2">
        <span className="font-mono text-xs text-[var(--muted)]">0{k + 1}</span>
        {lead}
      </p>
      <p className="t-body mt-2 max-w-[30rem] text-[var(--muted)]">{rest}</p>
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
        <p className="t-lead max-w-[36rem] text-[var(--muted)] lg:justify-self-end">
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
            <PanelBody index={i} id={id} label={t('title')} t={t} slot={p.slot} />
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
