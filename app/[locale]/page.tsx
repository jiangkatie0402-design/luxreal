import { setRequestLocale } from 'next-intl/server';
import { Advantages } from '@/components/home/Advantages';
import { Community } from '@/components/home/Community';
import { FAQ } from '@/components/home/FAQ';
import { FeatureTabs } from '@/components/home/FeatureTabs';
import { FinalCTA } from '@/components/home/FinalCTA';
import { Scenarios } from '@/components/home/Scenarios';
import { StoryHero } from '@/components/home/story/StoryHero';
import { Trust } from '@/components/home/Trust';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <StoryHero />
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
