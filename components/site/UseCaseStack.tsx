'use client';
import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';

/** Split "Lead：rest" points (full-width colon or ": "). */
function splitPoint(text: string): [string | null, string] {
  const m = text.match(/^(.+?)(?:：|: )(.+)$/);
  return m ? [m[1], m[2]] : [null, text];
}

/** One colour per field; all from the violet family so the stack stays calm. */
const PANELS = [
  {
    id: 'print',
    bg: '#cdbcff',
    ink: '#160f2e',
    muted: 'rgba(22,15,46,0.66)',
    line: 'rgba(22,15,46,0.16)',
    slot: 'rgba(22,15,46,0.08)',
  },
  {
    id: 'game',
    bg: '#6e62a3',
    ink: '#ffffff',
    muted: 'rgba(255,255,255,0.74)',
    line: 'rgba(255,255,255,0.2)',
    slot: 'rgba(255,255,255,0.1)',
  },
  {
    id: 'film',
    bg: '#1c1640',
    ink: '#e4dcff',
    muted: 'rgba(228,220,255,0.68)',
    line: 'rgba(228,220,255,0.16)',
    slot: 'rgba(228,220,255,0.06)',
  },
] as const;

/**
 * 应用场景: full-height colour panels that stack on scroll — each panel is
 * sticky, so the next field slides up over the previous one. Media slots empty.
 */
export function UseCaseStack() {
  const t = useTranslations('site.scenes');
  return (
    <section aria-labelledby="scenes-title" id="scenes" className="scroll-mt-20 pt-16 md:pt-24">
      <div className="container-x pb-12 md:pb-16">
        <h2 id="scenes-title" className="t-h2 text-center">
          {t('title')}
        </h2>
      </div>

      {PANELS.map((p, i) => (
        <article
          key={p.id}
          aria-labelledby={`scene-${p.id}`}
          className="sticky top-[var(--header-h)] flex min-h-[calc(100svh-var(--header-h))] flex-col rounded-t-[32px] text-[var(--ink)] shadow-[0_-24px_60px_rgba(0,0,0,0.35)]"
          style={
            {
              background: p.bg,
              '--ink': p.ink,
              '--muted': p.muted,
              '--line': p.line,
            } as CSSProperties
          }
        >
          <div className="container-x grid flex-1 content-start gap-8 py-12 md:py-16 lg:grid-cols-[6rem_minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
            <p className="font-mono text-sm text-[var(--muted)]">[ 0{i + 1} ]</p>

            <div>
              <p className="text-sm font-medium text-[var(--muted)]">{t(`${p.id}.tab`)}</p>
              <h3
                id={`scene-${p.id}`}
                className="mt-3 text-balance font-display text-3xl font-semibold leading-[1.2] tracking-[0.02em] md:text-[2.5rem]"
              >
                {t(`${p.id}.title`)}
              </h3>
              <p className="t-lead mt-4 max-w-[36rem] text-[var(--muted)]">{t(`${p.id}.intro`)}</p>
            </div>

            <ul className="grid content-start gap-6">
              {(t.raw(`${p.id}.points`) as string[]).map((pt) => {
                const [lead, rest] = splitPoint(pt);
                return (
                  <li key={pt} className="grid grid-cols-[0.75rem_1fr] gap-3">
                    <span aria-hidden className="mt-1.5 size-3 rounded-[3px] bg-[var(--ink)]" />
                    <div>
                      {lead && <p className="text-base font-semibold">{lead}</p>}
                      <p className="t-desc mt-1 text-[var(--muted)]">{rest}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* media slot: asset not decided yet */}
          <div className="container-x pb-8 md:pb-12">
            <div
              aria-hidden
              className="aspect-[16/9] w-full rounded-[20px] border border-[var(--line)] md:aspect-[21/8]"
              style={{ background: p.slot }}
            />
          </div>
        </article>
      ))}

      <div className="relative bg-background">
        <p className="t-small container-x py-8 text-center text-muted-foreground md:py-12">
          {t('more')}
        </p>
      </div>
    </section>
  );
}
