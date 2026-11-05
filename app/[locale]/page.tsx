import { setRequestLocale } from 'next-intl/server';
import { ViewportHero } from '@/components/home/viewport/ViewportHero';
import { CoreCapabilities, UseCases } from '@/components/site/CoreCapabilities';
import {
  Community,
  FinalCta,
  AgentCases,
  ForAgents,
  Testimonials,
  WhyUs,
} from '@/components/site/Sections';

/** Sections are added one at a time as each is specified. */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <ViewportHero locale={locale} />
      <CoreCapabilities />
      <UseCases />
      <ForAgents />
      <AgentCases />
      <WhyUs />
      <Testimonials />
      <Community />
      <FinalCta />
    </>
  );
}
