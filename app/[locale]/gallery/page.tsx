import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CommunityGrid } from '@/components/home/CommunityGrid';
import { buildMetadata } from '@/components/seo/meta';
import { PageHero } from '@/components/templates/PageHero';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'gallery' });
  return buildMetadata({ locale, path: 'gallery', title: t('title'), description: t('desc') });
}

export default async function GalleryPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'gallery' });
  return (
    <>
      <PageHero title={t('title')} desc={t('desc')} />
      <section className="section-y">
        <div className="container-x">
          <CommunityGrid />
        </div>
      </section>
    </>
  );
}
