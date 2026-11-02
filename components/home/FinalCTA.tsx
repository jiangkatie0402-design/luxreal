import { useTranslations } from 'next-intl';
import { href } from '@/config/pages';
import { site } from '@/config/site';
import { ButtonLink } from '@/components/ui/Button';

export function FinalCTA() {
  const t = useTranslations();
  return (
    <section aria-labelledby="cta-title" className="section-y">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-lg bg-text px-6 py-16 text-center text-bg md:px-12 md:py-24">
          <div
            aria-hidden
            className="absolute inset-x-0 top-1/2 h-px bg-[var(--slice-color)] opacity-70"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-1/2 h-24 -translate-y-full bg-gradient-to-t from-[color-mix(in_srgb,var(--slice-color)_25%,transparent)] to-transparent"
          />
          <div className="relative">
            <h2
              id="cta-title"
              className="font-display text-3xl font-semibold tracking-tight md:text-[3.5rem]"
            >
              {t('home.cta.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg opacity-75">{t('home.cta.subtitle')}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href={site.links.app} size="lg">
                {t('common.startCreating')}
              </ButtonLink>
              <ButtonLink
                href={href('developers')}
                variant="secondary"
                size="lg"
                className="!border-bg/30 !text-bg hover:!bg-bg/10"
              >
                {t('common.getApi')}
              </ButtonLink>
            </div>
            <p className="mt-5 text-sm opacity-60">{t('home.cta.note')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
