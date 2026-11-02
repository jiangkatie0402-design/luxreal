import { setRequestLocale } from 'next-intl/server';
import { CoreCapabilities } from '@/components/home/core/CoreCapabilities';
import { CoverHero } from '@/components/home/cover/CoverHero';
import { Scenes } from '@/components/home/scenes/Scenes';
import { CommunityWall } from '@/components/home/social/CommunityWall';
import { MidCTA } from '@/components/home/social/MidCTA';
import { Voices } from '@/components/home/social/Voices';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <CoverHero locale={locale} />
      <CoreCapabilities />
      <Scenes />
      <Voices />
      <MidCTA />
      <CommunityWall />
    </>
  );
}
