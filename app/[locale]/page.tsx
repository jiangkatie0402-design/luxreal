import { setRequestLocale } from 'next-intl/server';
import { Advantages } from '@/components/home/Advantages';
import { Community } from '@/components/home/Community';
import { FAQ } from '@/components/home/FAQ';
import { FeatureTabs } from '@/components/home/FeatureTabs';
import { FinalCTA } from '@/components/home/FinalCTA';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Scenarios } from '@/components/home/Scenarios';
import { Trust } from '@/components/home/Trust';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeatureTabs />
      <Scenarios />
      <Advantages />
      <Community />
      <Trust />
      <FinalCTA />
      <FAQ />
    </>
  );
}
