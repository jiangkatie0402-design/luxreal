import { setRequestLocale } from 'next-intl/server';
import { ViewportHero } from '@/components/home/viewport/ViewportHero';
import { CoreCapabilities } from '@/components/site/CoreCapabilities';
import { UseCaseStack } from '@/components/site/UseCaseStack';
import { Community, FinalCta, ForAgents, Testimonials, WhyUs } from '@/components/site/Sections';

/** Sections are added one at a time as each is specified. */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <ViewportHero locale={locale} />
      <CoreCapabilities />
      <ForAgents />
      <UseCaseStack />
      <WhyUs />
      <Testimonials />
      <Community />
      <FinalCta />
    </>
  );
}
