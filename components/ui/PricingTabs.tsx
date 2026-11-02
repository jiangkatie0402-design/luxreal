'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { apiUnitPrice, creatorPlans } from '@/config/pricing';
import { site } from '@/config/site';
import { ButtonLink } from './Button';

type Version = keyof typeof apiUnitPrice;
type Rep = keyof (typeof apiUnitPrice)['standard'];

export function PricingTabs() {
  const t = useTranslations('pricing');
  const [tab, setTab] = useState<'creators' | 'api'>('creators');
  return (
    <div>
      <div role="tablist" className="mx-auto mb-10 flex w-fit rounded-full border border-line p-1">
        {(['creators', 'api'] as const).map((v) => (
          <button
            key={v}
            role="tab"
            type="button"
            aria-selected={tab === v}
            onClick={() => setTab(v)}
            className={`rounded-full px-5 py-2 text-sm ${tab === v ? 'bg-text text-bg' : 'text-muted hover:text-text'}`}
          >
            {v === 'creators' ? t('tabCreators') : t('tabApi')}
          </button>
        ))}
      </div>
      {tab === 'creators' ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {creatorPlans.map((p) => (
            <li
              key={p.id}
              className={`flex flex-col rounded-lg border bg-surface p-6 ${p.highlight ? 'border-accent' : 'border-line'}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">{t(`plans.${p.id}.name`)}</p>
                {p.highlight && (
                  <span className="text-xs font-medium text-accent">{t('popular')}</span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted">{t(`plans.${p.id}.desc`)}</p>
              <p className="mt-6 font-display text-3xl font-semibold">
                {site.currencySymbol}
                {p.monthly}
                <span className="ml-1 text-sm font-normal text-muted">{t('perMonth')}</span>
              </p>
              <p className="mt-2 text-sm text-muted">
                {t('credits', { count: p.credits.toLocaleString() })}
              </p>
              <ButtonLink
                href={site.links.app}
                variant={p.highlight ? 'primary' : 'secondary'}
                className="mt-8"
              >
                {t('choose')}
              </ButtonLink>
            </li>
          ))}
        </ul>
      ) : (
        <PriceCalculator />
      )}
    </div>
  );
}

function PriceCalculator() {
  const t = useTranslations('pricing.calc');
  const [version, setVersion] = useState<Version>('standard');
  const [rep, setRep] = useState<Rep>('pbr');
  const [qty, setQty] = useState(100);
  const total = apiUnitPrice[version][rep] * qty;
  const field = 'mt-2 w-full rounded-md border border-line-strong bg-surface px-3 py-2.5 text-sm';
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-line bg-surface p-6 md:p-8">
      <h2 className="text-lg font-semibold">{t('title')}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="text-sm text-muted">
          {t('version')}
          <select
            value={version}
            onChange={(e) => setVersion(e.target.value as Version)}
            className={field}
          >
            <option value="standard">{t('standard')}</option>
            <option value="turbo">{t('turbo')}</option>
          </select>
        </label>
        <label className="text-sm text-muted">
          {t('representation')}
          <select value={rep} onChange={(e) => setRep(e.target.value as Rep)} className={field}>
            <option value="mesh">{t('mesh')}</option>
            <option value="pbr">{t('pbr')}</option>
            <option value="gaussian">{t('gaussian')}</option>
          </select>
        </label>
        <label className="text-sm text-muted">
          {t('quantity')}
          <input
            type="number"
            min={1}
            max={100000}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(100000, Number(e.target.value) || 1)))}
            className={field}
          />
        </label>
      </div>
      <div className="mt-8 flex items-baseline justify-between border-t border-line pt-6">
        <span className="text-muted">{t('estimate')}</span>
        <span className="font-display text-3xl font-semibold" aria-live="polite">
          {site.currencySymbol}
          {total.toFixed(2)}
        </span>
      </div>
      <p className="mt-2 text-xs text-subtle">{t('note')}</p>
    </div>
  );
}
