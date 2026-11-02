import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { SectionHeading } from '@/components/ui/Section';
import { HowViewer } from './HowViewer';

const STEPS = ['upload', 'generate', 'refine'] as const;

export function HowItWorks() {
  const t = useTranslations('home.how');
  return (
    <section id="how" aria-labelledby="how-title" className="section-y scroll-mt-[var(--header-h)]">
      <div className="container-x">
        <SectionHeading
          id="how-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-12">
          <ol className="flex flex-col gap-4">
            {STEPS.map((s, i) => (
              <li key={s} className="flex gap-5 rounded-lg border border-line bg-surface p-6">
                <span className="font-display text-2xl font-semibold text-accent tabular-nums">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{t(`steps.${s}.title`)}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{t(`steps.${s}.desc`)}</p>
                </div>
              </li>
            ))}
            <li className="list-none pt-2">
              <Link
                href="/create"
                className="text-sm font-medium text-muted underline-offset-4 hover:text-text hover:underline"
              >
                {t('exit')} →
              </Link>
            </li>
          </ol>
          <HowViewer
            groupLabel={t('viewerLabel')}
            stageLabel={t('stageLabel')}
            labels={{ clay: t('modes.clay'), wireframe: t('modes.wireframe'), pbr: t('modes.pbr') }}
          />
        </div>
      </div>
    </section>
  );
}
