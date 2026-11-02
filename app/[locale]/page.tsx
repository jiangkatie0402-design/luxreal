import { setRequestLocale } from 'next-intl/server';
import { CoverHero } from '@/components/home/cover/CoverHero';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CoverHero locale={locale} />;
}
