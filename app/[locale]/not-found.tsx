import { useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/ui/Button';

export default function NotFound() {
  const t = useTranslations();
  return (
    <section className="container-x grid min-h-[70svh] place-items-center pt-[var(--header-h)] text-center">
      <div>
        <h1 className="font-display text-3xl font-semibold">{t('notFound.title')}</h1>
        <p className="mt-3 text-muted">{t('notFound.desc')}</p>
        <ButtonLink href="/" variant="secondary" className="mt-8">
          {t('common.backHome')}
        </ButtonLink>
      </div>
    </section>
  );
}
