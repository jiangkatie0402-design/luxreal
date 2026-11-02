import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { SectionHeading } from '@/components/ui/Section';
import { benchmark, partners } from '@/config/trust';

const fmt = (v: number, f: string) => (f === 'percent' ? `${Math.round(v * 100)}%` : v.toFixed(2));

/** Benchmark comparison + partner logo wall. Replaces testimonials until real ones exist. */
export function Trust() {
  const t = useTranslations('home.trust');
  const series = [
    { key: 'lux', label: t('series.lux'), color: 'var(--color-accent)' },
    { key: 'base', label: t('series.base'), color: 'var(--color-text-tertiary)' },
  ] as const;
  return (
    <section aria-labelledby="tr-title" className="section-y">
      <div className="container-x">
        <SectionHeading
          id="tr-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <figure className="rounded-lg border border-line bg-surface p-6 md:p-8">
            <figcaption className="flex flex-wrap items-baseline justify-between gap-3">
              <span className="font-medium">{t('chartTitle')}</span>
              <span className="flex gap-4 text-xs text-muted" aria-hidden>
                {series.map((s) => (
                  <span key={s.key} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                    {s.label}
                  </span>
                ))}
              </span>
            </figcaption>
            <div className="mt-6 flex flex-col gap-6" aria-hidden>
              {benchmark.metrics.map((m) => (
                <div key={m.id}>
                  <p className="mb-2 text-sm text-muted">{t(`metrics.${m.id}`)}</p>
                  <div className="flex flex-col gap-0.5">
                    {series.map((s) => {
                      const v = m[s.key];
                      return (
                        <div
                          key={s.key}
                          className="group flex items-center gap-3"
                          title={`${s.label} · ${t(`metrics.${m.id}`)}: ${fmt(v, m.format)}`}
                        >
                          <div className="h-2.5 flex-1">
                            <div
                              className="h-full rounded-r-[4px] transition-[filter] group-hover:brightness-125"
                              style={{ width: `${v * 100}%`, background: s.color }}
                            />
                          </div>
                          <span
                            className={`w-12 text-right font-mono text-sm tabular-nums ${s.key === 'lux' ? 'text-text' : 'text-muted'}`}
                          >
                            {fmt(v, m.format)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <table className="sr-only">
              <caption>{t('chartTitle')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('metricCol')}</th>
                  {series.map((s) => (
                    <th key={s.key} scope="col">
                      {s.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {benchmark.metrics.map((m) => (
                  <tr key={m.id}>
                    <th scope="row">{t(`metrics.${m.id}`)}</th>
                    <td>{fmt(m.lux, m.format)}</td>
                    <td>{fmt(m.base, m.format)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-6 text-xs text-subtle">{t('chartNote')}</p>
          </figure>
          <div className="flex flex-col rounded-lg border border-line bg-surface p-6 md:p-8">
            <p className="font-medium">{t('partnersTitle')}</p>
            <ul className="mt-6 grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              {partners.map((p, i) => (
                <li
                  key={p.id}
                  className="relative grid min-h-16 place-items-center rounded-md border border-dashed border-line-strong text-xs text-subtle"
                >
                  {p.logo ? (
                    <Image
                      src={p.logo}
                      alt=""
                      fill
                      className="object-contain p-4 opacity-70 grayscale"
                    />
                  ) : (
                    t('partnerSlot', { n: i + 1 })
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-subtle">{t('partnersNote')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
