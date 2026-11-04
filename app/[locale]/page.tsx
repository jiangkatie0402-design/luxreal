import { setRequestLocale } from 'next-intl/server';
import { ViewportHero } from '@/components/home/viewport/ViewportHero';

/** Only the cover is signed off; everything below it is intentionally left empty. */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ViewportHero locale={locale} />;
}
