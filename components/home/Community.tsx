import { useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/ui/button';
import { CommunityMarquee } from './CommunityMarquee';

export function Community() {
  const t = useTranslations('home.community');
  return (
    <section aria-labelledby="cm-title" className="section-y overflow-hidden">
      <div className="container-x text-center">
        <p className="mb-3 text-sm font-medium tracking-wide text-primary">{t('eyebrow')}</p>
        <h2
          id="cm-title"
          className="mx-auto max-w-3xl text-balance font-display text-3xl font-semibold tracking-tight md:text-[3.25rem] md:leading-[1.1]"
        >
          {t('title')}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">{t('subtitle')}</p>
        <ButtonLink href="/gallery" size="lg" className="mt-8">
          {t('viewAll')} →
        </ButtonLink>
      </div>
      <div className="mt-12">
        <CommunityMarquee />
      </div>
    </section>
  );
}
