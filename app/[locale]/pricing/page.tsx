import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FAQ } from '@/components/home/FAQ';
import { buildMetadata } from '@/components/seo/meta';
import { PageHero } from '@/components/templates/PageHero';
import { ButtonLink } from '@/components/ui/Button';
import { PricingTabs } from '@/components/ui/PricingTabs';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pricing' });
  return buildMetadata({ locale, path: 'pricing', title: t('title'), description: t('desc') });
}

export default async function PricingPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  return (
    <>
      <PageHero title={t('pricing.title')} desc={t('pricing.desc')} />
      <section className="section-y">
        <div className="container-x">
          <PricingTabs />
          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <p className="text-muted">{t('pricing.enterprise')}</p>
            <ButtonLink href="/contact" variant="secondary">
              {t('common.contactSales')}
            </ButtonLink>
          </div>
        </div>
      </section>
      <FAQ />
    </>
  );
}
