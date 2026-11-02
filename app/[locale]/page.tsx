import { setRequestLocale } from 'next-intl/server';
import { ImageTo3DExplainer } from '@/components/home/explain/ImageTo3DExplainer';
import { WorldHero } from '@/components/home/world/WorldHero';
import { Scenes } from '@/components/home/scenes/Scenes';
import { CommunityWall } from '@/components/home/social/CommunityWall';
import { MidCTA } from '@/components/home/social/MidCTA';
import { Voices } from '@/components/home/social/Voices';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <WorldHero />
      <ImageTo3DExplainer />
      <Scenes />
      <Voices />
      <MidCTA />
      <CommunityWall />
    </>
  );
}
