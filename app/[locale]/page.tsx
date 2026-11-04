import { setRequestLocale } from 'next-intl/server';
import { ViewportHero } from '@/components/home/viewport/ViewportHero';
import { CoreCapabilities } from '@/components/site/CoreCapabilities';

/** Sections are added one at a time as each is specified. */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <ViewportHero locale={locale} />
      <CoreCapabilities />
    </>
  );
}
