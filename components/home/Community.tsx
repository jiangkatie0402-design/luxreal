import { useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/Section';
import { CommunityGrid } from './CommunityGrid';

export function Community() {
  const t = useTranslations('home.community');
  return (
    <section aria-labelledby="cm-title" className="section-y bg-surface">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="cm-title"
            eyebrow={t('eyebrow')}
            title={t('title')}
            subtitle={t('subtitle')}
          />
          <ButtonLink href="/gallery" variant="secondary">
            {t('viewAll')} →
          </ButtonLink>
        </div>
        <div className="mt-10">
          <CommunityGrid limit={8} />
        </div>
      </div>
    </section>
  );
}
