import { setRequestLocale } from 'next-intl/server';
import { AgentSection } from '@/components/home/agents/AgentSection';
import { AgentVideoShowcase } from '@/components/home/agents/AgentVideoShowcase';
import { ImageTo3DExplainer } from '@/components/home/explain/ImageTo3DExplainer';
import { ReelHero } from '@/components/home/reel/ReelHero';
import { WorldHero } from '@/components/home/world/WorldHero';
import { Scenes } from '@/components/home/scenes/Scenes';
import { CommunityWall } from '@/components/home/social/CommunityWall';
import { MidCTA } from '@/components/home/social/MidCTA';
import { Voices } from '@/components/home/social/Voices';

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ hero?: string }>;
}) {
  const { locale } = await params;
  const { hero } = await searchParams;
  setRequestLocale(locale);
  return (
    <>
      {hero === 'world' ? <WorldHero /> : <ReelHero locale={locale} />}
      <ImageTo3DExplainer />
      <AgentVideoShowcase />
      <Scenes />
      <AgentSection />
      <Voices />
      <MidCTA />
      <CommunityWall />
    </>
  );
}
