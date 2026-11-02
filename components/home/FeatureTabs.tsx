'use client';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { featureTabs } from '@/config/features';
import { href } from '@/config/pages';
import { site } from '@/config/site';
import { Link } from '@/i18n/navigation';
import { ButtonLink } from '@/components/ui/Button';
import { WorkspaceMock } from './WorkspaceMock';

export function FeatureTabs() {
  const t = useTranslations('home.features');
  const [active, setActive] = useState(0);
  const id = useId();
  const tab = featureTabs[active];
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next =
      (active + (e.key === 'ArrowRight' ? 1 : featureTabs.length - 1)) % featureTabs.length;
    setActive(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };
  return (
    <section aria-labelledby="ft-title" className="section-y">
      <div className="container-x">
        <div className="text-center">
          <p className="mb-3 text-sm font-medium tracking-wide text-accent">{t('eyebrow')}</p>
          <h2
            id="ft-title"
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
          {featureTabs.map((f, i) => (
            <button
              key={f.id}
              id={`${id}-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-controls={`${id}-panel`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors md:px-5 ${
                i === active ? 'bg-surface-2 font-medium text-text' : 'text-muted hover:text-text'
              }`}
            >
              {t(`tabs.${f.id}.tab`)}
            </button>
          ))}
        </div>
        <div
          id={`${id}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${active}`}
          className="mt-8 grid overflow-hidden rounded-lg border border-line bg-surface lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]"
        >
          <div className="flex flex-col gap-5 p-7 md:p-10 [background:radial-gradient(120%_70%_at_0%_100%,color-mix(in_srgb,var(--color-accent)_14%,transparent),transparent)]">
            <h3 className="text-balance font-display text-2xl font-semibold tracking-tight md:text-[2.25rem] md:leading-tight">
              {t(`tabs.${tab.id}.title`)}
            </h3>
            <p className="text-lg leading-relaxed text-muted">{t(`tabs.${tab.id}.desc`)}</p>
            <ul className="space-y-2 text-sm text-muted">
              {(t.raw(`tabs.${tab.id}.points`) as string[]).map((p) => (
                <li key={p} className="flex gap-2">
                  <span aria-hidden className="text-accent">
                    ✓
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <Link
              href={href(tab.id)}
              className="w-fit text-sm text-muted underline-offset-4 hover:text-text hover:underline"
            >
              {t('learnMore')} →
            </Link>
            <ButtonLink
              href={site.links.app}
              size="lg"
              className="mt-auto w-full sm:w-fit lg:w-full"
            >
              {t('cta')} →
            </ButtonLink>
          </div>
          <div className="min-w-0 p-3 md:p-6 lg:pl-0">
            <WorkspaceMock key={tab.id} tab={tab} />
          </div>
        </div>
      </div>
    </section>
  );
}
