'use client';
import { useTranslations } from 'next-intl';
import { useId, useState, type CSSProperties } from 'react';
import { href } from '@/config/pages';
import { scenarios } from '@/config/scenarios';
import { site } from '@/config/site';
import { Link } from '@/i18n/navigation';
import { ButtonLink } from '@/components/ui/Button';
import { EvidenceVisual } from './EvidenceVisual';

const OTHER = ['embodied', 'heritage'];

export function Scenarios() {
  const t = useTranslations('home.scenarios');
  const tp = useTranslations('pages');
  const [active, setActive] = useState(0);
  const id = useId();
  const sc = scenarios[active];
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = (active + (e.key === 'ArrowRight' ? 1 : scenarios.length - 1)) % scenarios.length;
    setActive(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };

  return (
    <section
      aria-labelledby="sc-title"
      style={{ '--scene': sc.color } as CSSProperties}
      className="section-y border-y border-line transition-[background] duration-[var(--dur-slow)] [background:radial-gradient(90%_55%_at_50%_0%,color-mix(in_srgb,var(--scene)_14%,transparent),transparent_75%),var(--color-bg)]"
    >
      <div className="container-x">
        <div className="text-center">
          <p className="mb-3 text-sm font-medium tracking-wide text-[var(--scene)]">
            {t('eyebrow')}
          </p>
          <h2
            id="sc-title"
            className="text-balance font-display text-2xl font-semibold tracking-tight md:text-3xl"
          >
            {t('title')}
          </h2>
        </div>
        <div
          role="tablist"
          aria-label={t('title')}
          onKeyDown={onKey}
          className="mx-auto mt-8 flex w-fit max-w-full overflow-x-auto rounded-full border border-line bg-surface p-1"
        >
          {scenarios.map((s, i) => (
            <button
              key={s.id}
              id={`${id}-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-controls={`${id}-panel`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              style={{ '--scene': s.color } as CSSProperties}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors md:px-5 ${
                i === active
                  ? 'bg-[var(--scene)] font-medium text-bg'
                  : 'text-muted hover:text-text'
              }`}
            >
              {t(`${s.id}.tab`)}
            </button>
          ))}
        </div>

        <div
          id={`${id}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${active}`}
          className="mt-8"
        >
          <div className="flex flex-col items-center gap-5 text-center">
            <p className="max-w-2xl text-balance text-lg text-muted">{t(`${sc.id}.tagline`)}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink href={site.links.app}>{t('cta')} →</ButtonLink>
              <ButtonLink href={href(sc.page)} variant="secondary">
                {t('learnMore')}
              </ButtonLink>
            </div>
          </div>

          <ul
            className={`mt-10 grid gap-4 md:grid-cols-2 ${sc.cards.length === 3 ? 'lg:grid-cols-3' : ''}`}
          >
            {sc.cards.map((card) => (
              <li
                key={`${sc.id}-${card.id}`}
                className="overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--scene)_28%,var(--color-border))] bg-surface"
              >
                <div className="relative aspect-[16/10] [background:radial-gradient(80%_70%_at_50%_45%,color-mix(in_srgb,var(--scene)_18%,var(--color-surface-2)),var(--color-surface))]">
                  <EvidenceVisual visual={card.visual} />
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="text-lg font-semibold">{t(`${sc.id}.cards.${card.id}.title`)}</h3>
                  <p className="mt-2 leading-relaxed text-muted">
                    {t(`${sc.id}.cards.${card.id}.desc`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 grid gap-6 rounded-lg border border-line bg-surface p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
            <div className="min-w-0">
              <p className="mb-3 text-sm text-muted">{t('tools')}</p>
              <ul className="flex flex-wrap gap-2">
                {sc.tools.map((tool) => (
                  <li
                    key={tool}
                    className="flex items-center gap-2 rounded-md border border-line bg-surface-2 py-1.5 pl-1.5 pr-3 text-sm"
                  >
                    <span
                      aria-hidden
                      className="grid size-6 place-items-center rounded bg-[color-mix(in_srgb,var(--scene)_22%,transparent)] text-[11px] font-semibold text-[var(--scene)]"
                    >
                      {tool.replace(/[^A-Za-z]/g, '').slice(0, 2)}
                    </span>
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm text-muted">{t('formats')}</p>
              <ul className="flex flex-wrap gap-2">
                {sc.formats.map((f) => (
                  <li
                    key={f}
                    className="rounded-md border border-line px-2.5 py-1.5 font-mono text-xs"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted">{t('other')}</span>
          {OTHER.map((p) => (
            <Link
              key={p}
              href={href(p)}
              className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:text-text"
            >
              {tp(`${p}.title`)}
            </Link>
          ))}
          <Link
            href="/use-cases"
            className="text-sm text-muted underline-offset-4 hover:text-text hover:underline"
          >
            {t('allCases')} →
          </Link>
        </div>
      </div>
    </section>
  );
}
