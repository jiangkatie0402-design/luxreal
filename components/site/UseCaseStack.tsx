'use client';
import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';
import { PanelGlow } from './PanelGlow';

/** Split "Lead：rest" points (full-width colon or ": "). */
function splitPoint(text: string): [string | null, string] {
  const m = text.match(/^(.+?)(?:：|: )(.+)$/);
  return m ? [m[1], m[2]] : [null, text];
}

const IDS = ['print', 'game', 'film'] as const;

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
            <div className="container-x relative flex-1 py-12 md:py-16">
              {/* label + field name as the panel headline */}
              <p className="flex items-center gap-3 font-mono text-sm text-[var(--muted)]">
                <span>[ 0{i + 1} ]</span>
                <span className="font-sans">{t('title')}</span>
              </p>
              <h3
                id={`scene-${id}`}
                className="mt-4 font-display text-[2.5rem] font-semibold leading-[1.1] tracking-[0.02em] md:text-7xl"
              >
                {t(`${id}.tab`)}
              </h3>

              <div className="mt-6 grid gap-4 md:mt-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
                <p className="text-balance font-display text-2xl font-semibold leading-[1.3] tracking-[0.02em] md:text-3xl">
                  {t(`${id}.title`)}
                </p>
                <p className="t-lead text-[var(--muted)]">{t(`${id}.intro`)}</p>
              </div>

              {/* one media slot per point (assets not decided yet) */}
              <ul className="mt-10 grid gap-6 md:mt-12 md:grid-cols-3">
                {(t.raw(`${id}.points`) as string[]).map((pt, k) => {
                  const [lead, rest] = splitPoint(pt);
                  return (
                    <li key={pt}>
                      <div
                        aria-hidden
                        className="aspect-[4/3] w-full rounded-[20px] border border-[var(--line)]"
                        style={{ background: p.slot }}
                      />
                      <p className="mt-4 flex items-baseline gap-2 text-base font-semibold">
                        <span className="font-mono text-xs text-[var(--muted)]">0{k + 1}</span>
                        {lead}
                      </p>
                      <p className="t-desc mt-1 text-[var(--muted)]">{rest}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
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
